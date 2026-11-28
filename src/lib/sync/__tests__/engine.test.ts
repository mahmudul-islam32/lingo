import { describe, expect, it, vi } from "vitest";
import { SYNC_CONFIG } from "@/contracts";
import { createDevice, NOW } from "@/lib/offline/__tests__/helpers";
import { backoffDelayMs } from "../config";
import { createSyncEngine } from "../engine";
import { leaseLock } from "../lock";
import { accountDevice, engineFor, fakeTransport, id, result, USER } from "./fakes";

describe("guests never sync (PLT-014 criterion 1)", () => {
  it("a guest device sends nothing, even with queued records", async () => {
    const local = await createDevice().open();
    await local.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport();
    const engine = engineFor(local, transport);
    await engine.syncNow();
    expect(transport.calls).toEqual([]);
    expect(transport.sessionUserId).not.toHaveBeenCalled();
    expect(engine.status()).toBe("idle");
    expect(await local.syncQueue.list()).toHaveLength(2);
  });
});

describe("push (criteria 3 and 4)", () => {
  it("sends the latest one-row records first, then results by createdAt", async () => {
    const clock = { now: NOW };
    const { local } = await accountDevice(clock);
    for (const n of [1, 2, 3]) {
      clock.now = new Date(NOW.getTime() + n * 1000);
      await local.progress.saveLessonResult(result(n));
    }
    clock.now = new Date(NOW.getTime() + 5000);
    await local.profile.updateSettings({ dailyGoalXp: 30 });
    await local.profile.updateSettings({ dailyGoalXp: 50 });
    const transport = fakeTransport();
    const engine = engineFor(local, transport, { clock });
    const pushed = await engine.syncNow();

    expect(transport.calls.map((c) => (c.kind === "upsert" ? c.table : "results"))).toEqual([
      "settings",
      "results",
    ]);
    const settings = transport.calls[0]!;
    expect(settings.kind === "upsert" && settings.row).toMatchObject({
      user_id: USER,
      daily_goal_xp: 50,
      course_id: "en-de",
    });
    expect(settings.kind === "upsert" && "goal_plan" in settings.row).toBe(false);
    expect(transport.calls[1]).toEqual({ kind: "insert", ids: [id(1), id(2), id(3)] });
    expect(await local.syncQueue.list()).toEqual([]);
    expect(pushed.acceptedIds).toHaveLength(4);
    expect(engine.status()).toBe("idle");
    expect(engine.snapshot().lastPushAt).toBe(clock.now.toISOString());
  });

  it("batches results by 100", async () => {
    const { local } = await accountDevice();
    for (let n = 1; n <= 205; n += 1) await local.progress.saveLessonResult(result(n));
    const transport = fakeTransport();
    await engineFor(local, transport).syncNow();
    expect(transport.calls.map((c) => (c.kind === "insert" ? c.ids.length : 0))).toEqual([
      100, 100, 5,
    ]);
  });

  it("network, timeout and 5xx keep the record with a backoff", async () => {
    const clock = { now: NOW };
    const { local } = await accountDevice(clock);
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport(() => ({ ok: false, kind: "server", status: 503, code: null }));
    const engine = engineFor(local, transport, { clock });
    await engine.syncNow();
    const [record] = await local.syncQueue.list();
    expect(record).toMatchObject({ status: "pending", attemptCount: 1, lastError: "server 503" });
    expect(Date.parse(record!.nextAttemptAt) - NOW.getTime()).toBe(backoffDelayMs(1, 0.5));
    expect(engine.status()).toBe("error");

    // Not due yet: no request.
    transport.calls.length = 0;
    await engine.syncNow();
    expect(transport.calls).toEqual([]);

    // Due again: retried, and on success removed.
    clock.now = new Date(record!.nextAttemptAt);
    const ok = fakeTransport();
    await engineFor(local, ok, { clock }).syncNow();
    expect(ok.calls).toEqual([{ kind: "insert", ids: [id(1)] }]);
    expect(await local.syncQueue.list()).toEqual([]);
  });

  it("the backoff doubles up to the ceiling with ±20 % jitter", () => {
    expect(backoffDelayMs(1, 0.5)).toBe(SYNC_CONFIG.retryBaseDelayMs);
    expect(backoffDelayMs(3, 0.5)).toBe(SYNC_CONFIG.retryBaseDelayMs * 4);
    expect(backoffDelayMs(30, 0.5)).toBe(SYNC_CONFIG.retryMaxDelayMs);
    expect(backoffDelayMs(1, 0)).toBe(SYNC_CONFIG.retryBaseDelayMs * 0.8);
    expect(backoffDelayMs(1, 0.999999)).toBeCloseTo(SYNC_CONFIG.retryBaseDelayMs * 1.2, -1);
  });

  it("a 4xx rejects only the bad record (batch retried one by one) and never retries it", async () => {
    const { local } = await accountDevice();
    for (const n of [1, 2, 3]) await local.progress.saveLessonResult(result(n));
    const transport = fakeTransport((call) =>
      call.kind === "insert" && call.ids.includes(id(2))
        ? { ok: false, kind: "rejected", status: 400, code: "23514" }
        : { ok: true },
    );
    const log = vi.fn();
    const engine = engineFor(local, transport, { log });
    const pushed = await engine.syncNow();
    expect(transport.calls).toEqual([
      { kind: "insert", ids: [id(1), id(2), id(3)] },
      { kind: "insert", ids: [id(1)] },
      { kind: "insert", ids: [id(2)] },
      { kind: "insert", ids: [id(3)] },
    ]);
    const left = await local.syncQueue.list();
    expect(left).toHaveLength(1);
    expect(left[0]).toMatchObject({
      id: id(2),
      status: "rejected",
      lastError: "rejected 400 23514",
    });
    expect(pushed.rejected).toEqual([{ id: id(2), reason: "rejected 400 23514" }]);
    // Criterion 10: ids and codes only.
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/greetings|example\.com|token/);
    transport.calls.length = 0;
    await engine.syncNow();
    expect(transport.calls).toEqual([]);
    expect(engine.snapshot().rejected).toBe(1);
  });

  it("lastError is at most 500 characters", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport(() => ({
      ok: false,
      kind: "rejected",
      status: 400,
      code: "x".repeat(900),
    }));
    await engineFor(local, transport).syncNow();
    expect((await local.syncQueue.list())[0]!.lastError).toHaveLength(500);
  });
});

describe("401 and the session (criterion 5)", () => {
  it("refreshes once; still 401 → paused with status error, records stay pending", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport(() => ({
      ok: false,
      kind: "unauthorized",
      status: 401,
      code: "PGRST301",
    }));
    const onSessionExpired = vi.fn();
    const engine = engineFor(local, transport, { onSessionExpired });
    await engine.syncNow();
    expect(transport.refreshSession).toHaveBeenCalledTimes(1);
    expect(engine.status()).toBe("error");
    expect(engine.snapshot().paused).toBe("session-expired");
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect((await local.syncQueue.list())[0]).toMatchObject({ status: "pending", attemptCount: 0 });

    // Paused: no requests until resumed after a new log-in.
    transport.calls.length = 0;
    await engine.syncNow();
    expect(transport.calls).toEqual([]);
    engine.resume();
    const ok = fakeTransport();
    const after = engineFor(local, ok);
    await after.syncNow();
    expect(await local.syncQueue.list()).toEqual([]);
  });

  it("a refresh that works retries the round", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    let first = true;
    const transport = fakeTransport(() => {
      if (first) {
        first = false;
        return { ok: false, kind: "unauthorized", status: 401, code: null };
      }
      return { ok: true };
    });
    vi.mocked(transport.refreshSession).mockResolvedValue(true);
    const engine = engineFor(local, transport);
    await engine.syncNow();
    expect(engine.status()).toBe("idle");
    expect(await local.syncQueue.list()).toEqual([]);
  });

  it("no session → expired; another account's session → never pushes", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport();
    transport.user = null;
    const onSessionExpired = vi.fn();
    await engineFor(local, transport, { onSessionExpired }).syncNow();
    expect(onSessionExpired).toHaveBeenCalled();
    transport.user = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
    const other = engineFor(local, transport);
    await other.syncNow();
    expect(other.snapshot().paused).toBe("other-account");
    expect(transport.calls).toEqual([]);
  });
});

describe("no double XP (criteria 6 and 7)", () => {
  it("two engines on one store send each record once", async () => {
    const { local } = await accountDevice();
    for (const n of [1, 2, 3]) await local.progress.saveLessonResult(result(n));
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const sent: string[] = [];
    const slow = fakeTransport(async (call) => {
      if (call.kind === "insert") sent.push(...call.ids);
      await gate;
      return { ok: true };
    });
    const a = engineFor(local, slow, { owner: "tab-a" });
    const b = engineFor(local, slow, { owner: "tab-b" });
    const first = a.syncNow();
    // Let A take the lease before B tries.
    await vi.waitFor(() => expect(sent.length).toBeGreaterThan(0));
    const second = b.syncNow();
    await second;
    release();
    await first;
    await b.syncNow();
    expect(sent.sort()).toEqual([id(1), id(2), id(3)]);
    expect(await local.syncQueue.list()).toEqual([]);
  });

  it("concurrent syncNow calls on one engine share one round", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    const transport = fakeTransport();
    const engine = engineFor(local, transport);
    await Promise.all([engine.syncNow(), engine.syncNow(), engine.syncNow()]);
    expect(transport.calls).toHaveLength(1);
  });

  it("a replayed id (already on the server) counts as accepted and is removed", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    // ON CONFLICT (id) DO NOTHING answers 201 for a duplicate.
    const transport = fakeTransport(() => ({ ok: true }));
    await engineFor(local, transport).syncNow();
    await local.progress.saveLessonResult(result(1)); // the same id again: a no-op locally
    await engineFor(local, transport).syncNow();
    expect(transport.calls).toEqual([{ kind: "insert", ids: [id(1)] }]);
  });
});

describe("status and subscribe (criterion 9)", () => {
  it("notifies on change, is offline without network, and syncNow never throws", async () => {
    const { local } = await accountDevice();
    await local.progress.saveLessonResult(result(1));
    let online = false;
    const transport = fakeTransport();
    const engine = engineFor(local, transport, { online: () => online });
    const seen: string[] = [];
    engine.subscribe((s) => seen.push(s));
    await engine.syncNow();
    expect(engine.status()).toBe("offline");
    expect(transport.calls).toEqual([]);
    expect(engine.snapshot().pendingResults).toBe(1);
    online = true;
    engine.setOffline(false);
    await engine.syncNow();
    expect(seen).toEqual(["idle", "syncing", "idle"]);

    const broken = createSyncEngine({
      loadLocal: async () => {
        throw new Error("boom");
      },
      transport,
      lock: (l) => leaseLock(l.store, "x", () => NOW),
      online: () => true,
      log: vi.fn(),
    });
    await expect(broken.syncNow()).resolves.toEqual({
      acceptedIds: [],
      duplicateIds: [],
      rejected: [],
    });
    expect(broken.status()).toBe("error");
  });
});
