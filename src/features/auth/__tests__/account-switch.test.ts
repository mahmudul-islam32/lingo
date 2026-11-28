import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "zustand";
import type { GuestMigrationPayload } from "@/contracts";
import { createDevice, lessonResult } from "@/lib/offline/__tests__/helpers";
import type { LocalSession } from "@/lib/offline";
import {
  PENDING_SWITCH_KEY,
  planAccountSwitch,
  readPendingSwitch,
  resetAccountSwitchForTests,
  runAccountSwitch,
  type AccountSwitchDeps,
  type AccountSwitchState,
} from "../account-switch";
import { MigrationError } from "../migrate";

const USER = "7f3c2a9e-1b4d-4c6e-8f0a-2d5b7e9c1a3f";
const OTHER = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";

function deps(
  local: LocalSession,
  migrate = vi.fn<(payload: GuestMigrationPayload) => Promise<void>>(async () => {}),
) {
  const store = createStore<AccountSwitchState>()(() => ({ phase: "idle" }));
  const d: AccountSwitchDeps = {
    loadLocal: async () => local,
    migrate,
    refresh: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    afterSwitch: vi.fn(async () => {}),
    store,
  };
  return { d, migrate, store };
}

async function guest({ onboard = true, results = 1 } = {}) {
  const session = await createDevice().open();
  if (onboard) {
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    await session.profile.completeOnboarding();
  }
  for (let i = 0; i < results; i += 1) {
    await session.progress.saveLessonResult(
      lessonResult({ id: `3f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6${i}`, courseId: "en-de" }),
    );
  }
  return session;
}

beforeEach(() => {
  resetAccountSwitchForTests();
  window.localStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

describe("planAccountSwitch (PLT-013 criterion 4, PD-087)", () => {
  const settings = {
    courseId: "en-de",
    dailyGoalXp: 20 as const,
    soundEffectsEnabled: true,
    speakingExercisesEnabled: true,
    updatedAt: "2026-11-28T00:00:00.000Z",
  };
  it.each([
    ["sign-up", settings, 0, "migrate"],
    ["sign-up", settings, 3, "migrate"],
    ["log-in", settings, 3, "migrate"],
    ["log-in", settings, 0, "adopt"],
    ["sign-up", null, 0, "adopt"],
    ["log-in", null, 2, "adopt"],
  ] as const)("%s, settings %#, %i results → %s", (method, s, count, plan) => {
    expect(planAccountSwitch({ method, settings: s, lessonResultCount: count })).toBe(plan);
  });
});

describe("runAccountSwitch (PLT-013 criteria 3–10)", () => {
  it("migrates: uploads the payload, becomes the account, drops the guest's queue", async () => {
    const local = await guest({ results: 2 });
    const { d, migrate, store } = deps(local);
    const phases: string[] = [];
    store.subscribe((s) => phases.push(s.phase));

    expect(await runAccountSwitch(USER, "log-in", d)).toEqual({ kind: "saved" });
    expect(migrate).toHaveBeenCalledTimes(1);
    expect(migrate.mock.calls[0]![0].lessonResults).toHaveLength(2);
    expect(await local.profile.getIdentity()).toEqual({ kind: "account", userId: USER });
    expect(await local.syncQueue.list()).toEqual([]);
    expect(await local.account.listAllLessonResults()).toHaveLength(2);
    expect(phases).toEqual(["saving", "saved"]);
    expect(d.refresh).toHaveBeenCalled();
    expect(d.afterSwitch).toHaveBeenCalled();
    expect(window.localStorage.getItem(PENDING_SWITCH_KEY)).toBeNull();
  });

  it("criterion 8: on failure nothing changes locally and a retry is recorded", async () => {
    const local = await guest({ results: 1 });
    const before = await local.account.snapshot();
    const { d, store } = deps(
      local,
      vi.fn(async () => {
        throw new MigrationError("network");
      }),
    );
    expect(await runAccountSwitch(USER, "sign-up", d)).toEqual({
      kind: "failed",
      reason: "network",
    });
    expect(await local.account.snapshot()).toEqual(before);
    expect(store.getState().phase).toBe("failed");
    expect(readPendingSwitch()).toEqual({ userId: USER, method: "sign-up" });
  });

  it("criterion 9: a retry after a lost response sends the very same payload", async () => {
    const local = await guest({ results: 2 });
    const sent: GuestMigrationPayload[] = [];
    let first = true;
    const migrate = vi.fn(async (payload: GuestMigrationPayload) => {
      sent.push(payload);
      if (first) {
        first = false;
        throw new MigrationError("timeout");
      }
    });
    const { d } = deps(local, migrate);
    await runAccountSwitch(USER, "log-in", d);
    expect(await runAccountSwitch(USER, "log-in", d)).toEqual({ kind: "saved" });
    expect(sent[1]).toEqual(sent[0]);
  });

  it("criterion 4: a log-in without results adopts the account, no upload", async () => {
    const local = await guest({ results: 0 });
    const { d, migrate } = deps(local);
    expect(await runAccountSwitch(USER, "log-in", d)).toEqual({ kind: "adopted" });
    expect(migrate).not.toHaveBeenCalled();
    expect(await local.profile.getIdentity()).toEqual({ kind: "account", userId: USER });
    expect(await local.profile.findSettings()).toBeNull();
  });

  it("criterion 4: a guest who never onboarded is never migrated", async () => {
    const local = await guest({ onboard: false, results: 0 });
    const { d, migrate } = deps(local);
    expect(await runAccountSwitch(USER, "sign-up", d)).toEqual({ kind: "adopted" });
    expect(migrate).not.toHaveBeenCalled();
  });

  it("criterion 10: an account device never migrates again; another account is signed out", async () => {
    const local = await guest({ results: 1 });
    const { d, migrate } = deps(local);
    await runAccountSwitch(USER, "log-in", d);
    migrate.mockClear();
    expect(await runAccountSwitch(USER, "log-in", d)).toEqual({ kind: "already-account" });
    expect(await runAccountSwitch(OTHER, "log-in", d)).toEqual({ kind: "other-account" });
    expect(migrate).not.toHaveBeenCalled();
    expect(d.signOut).toHaveBeenCalledTimes(1);
    expect(await local.profile.getIdentity()).toEqual({ kind: "account", userId: USER });
  });

  it("runs once at a time: two callers share one upload", async () => {
    const local = await guest({ results: 1 });
    const { d, migrate } = deps(local);
    const [a, b] = await Promise.all([
      runAccountSwitch(USER, "log-in", d),
      runAccountSwitch(USER, "log-in", d),
    ]);
    expect(a).toEqual({ kind: "saved" });
    expect(b).toEqual({ kind: "saved" });
    expect(migrate).toHaveBeenCalledTimes(1);
  });
});
