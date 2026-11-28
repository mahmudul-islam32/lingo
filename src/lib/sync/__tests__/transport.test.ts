import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@/lib/supabase";
import { classify, createSupabaseTransport } from "../transport";
import { toLessonResultRow } from "../mapping";
import { result } from "./fakes";

function fakeClient(answer: () => Promise<{ error: unknown; status: number }>) {
  const abortSignal = vi.fn(() => answer());
  const upsert = vi.fn(() => ({ abortSignal }));
  const from = vi.fn(() => ({ upsert }));
  const auth = {
    getSession: vi.fn(async () => ({ data: { session: { user: { id: "u1" } } } })),
    refreshSession: vi.fn(async () => ({ data: { session: {} }, error: null })),
  };
  return { client: { from, auth } as unknown as SupabaseClient, from, upsert };
}

describe("classify (ADR-020 §5)", () => {
  it.each([
    [201, null, true, undefined],
    [0, null, false, "network"],
    [401, "PGRST301", false, "unauthorized"],
    [403, "PGRST303", false, "unauthorized"],
    [403, "42501", false, "rejected"],
    [400, "23514", false, "rejected"],
    [408, null, false, "server"],
    [429, null, false, "server"],
    [503, null, false, "server"],
  ])("%i %s", (status, code, ok, kind) => {
    const res = classify(status, code);
    expect(res.ok).toBe(ok);
    if (!res.ok) expect(res.kind).toBe(kind);
  });
});

describe("Supabase transport", () => {
  it("inserts results with ignoreDuplicates and upserts one-row tables by user_id", async () => {
    const fake = fakeClient(async () => ({ error: null, status: 201 }));
    const transport = createSupabaseTransport(async () => fake.client);
    const rows = [toLessonResultRow(result(1))];
    expect(await transport.insertLessonResults(rows)).toEqual({ ok: true });
    expect(fake.from).toHaveBeenCalledWith("lesson_results");
    expect(fake.upsert).toHaveBeenCalledWith(rows, { onConflict: "id", ignoreDuplicates: true });
    await transport.upsertRow("settings", { user_id: "u1" });
    expect(fake.upsert).toHaveBeenLastCalledWith({ user_id: "u1" }, { onConflict: "user_id" });
    expect(await transport.sessionUserId()).toBe("u1");
    expect(await transport.refreshSession()).toBe(true);
  });

  it("maps errors, thrown fetches and timeouts", async () => {
    const rejected = fakeClient(async () => ({ error: { code: "23514" }, status: 400 }));
    expect(
      await createSupabaseTransport(async () => rejected.client).upsertRow("settings", {}),
    ).toEqual({
      ok: false,
      kind: "rejected",
      status: 400,
      code: "23514",
    });
    const thrown = fakeClient(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(
      await createSupabaseTransport(async () => thrown.client).insertLessonResults([]),
    ).toMatchObject({ ok: false, kind: "network" });

    vi.useFakeTimers();
    const slow = fakeClient(() => new Promise(() => {}));
    const pending = createSupabaseTransport(async () => slow.client, 1000).insertLessonResults([]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toMatchObject({ ok: false, kind: "timeout" });
    vi.useRealTimers();
  });

  it("without a client (accounts disabled) nothing is sent", async () => {
    const transport = createSupabaseTransport(async () => null);
    expect(await transport.sessionUserId()).toBeNull();
    expect(await transport.insertLessonResults([])).toMatchObject({ kind: "unauthorized" });
  });
});
