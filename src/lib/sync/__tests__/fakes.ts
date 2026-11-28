/** Test helpers for the sync engine: a fake transport and an account device. */
import { vi } from "vitest";
import type { LessonResult } from "@/contracts";
import { createDevice, lessonResult, NOW } from "@/lib/offline/__tests__/helpers";
import type { LocalSession } from "@/lib/offline";
import { leaseLock } from "../lock";
import { createSyncEngine, type SyncEngineDeps } from "../engine";
import type { LessonResultRow, OneRowTable } from "../mapping";
import type { SyncTransport, TransportResult } from "../transport";

export const USER = "7f3c2a9e-1b4d-4c6e-8f0a-2d5b7e9c1a3f";

export type Call =
  | { kind: "insert"; ids: string[] }
  | { kind: "upsert"; table: OneRowTable; row: Record<string, unknown> };

export function fakeTransport(
  respond: (call: Call) => TransportResult | Promise<TransportResult> = () => ({ ok: true }),
) {
  const calls: Call[] = [];
  const transport: SyncTransport & { calls: Call[]; user: string | null } = {
    calls,
    user: USER,
    sessionUserId: vi.fn(async () => transport.user),
    refreshSession: vi.fn(async () => false),
    insertLessonResults: vi.fn(async (rows: LessonResultRow[]) => {
      const call: Call = { kind: "insert", ids: rows.map((r) => r.id) };
      calls.push(call);
      return respond(call);
    }),
    upsertRow: vi.fn(async (table: OneRowTable, row: Record<string, unknown>) => {
      const call: Call = { kind: "upsert", table, row };
      calls.push(call);
      return respond(call);
    }),
  };
  return transport;
}

export const id = (n: number) => `3f1c2b8e-4d5a-4c6b-9e7f-${n.toString(16).padStart(12, "0")}`;

export function result(n: number, overrides: Partial<LessonResult> = {}): LessonResult {
  return lessonResult({ id: id(n), courseId: "en-de", ...overrides });
}

/** An onboarded device whose identity is the account `USER`, with an empty queue. */
export async function accountDevice(clock: { now: Date } = { now: NOW }) {
  const device = createDevice();
  const local = await device.open({ now: () => clock.now });
  await local.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
  await local.profile.completeOnboarding();
  const snap = await local.account.snapshot();
  await local.account.switchToAccount(USER, { mode: "keep", migratedQueueIds: snap.queueIds });
  return { device, local };
}

export function engineFor(
  local: LocalSession,
  transport: SyncTransport,
  over: Partial<SyncEngineDeps> & { clock?: { now: Date }; owner?: string } = {},
) {
  const clock = over.clock ?? { now: NOW };
  return createSyncEngine({
    loadLocal: async () => local,
    transport,
    lock: (l) => leaseLock(l.store, over.owner ?? "tab-1", () => clock.now),
    now: () => clock.now,
    random: () => 0.5,
    online: () => true,
    log: vi.fn(),
    ...over,
  });
}
