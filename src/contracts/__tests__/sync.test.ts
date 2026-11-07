import { describe, expect, it } from "vitest";
import { CONTRACTS_VERSION, GuestMigrationPayloadSchema, SyncQueueRecordSchema } from "../index";
import { heartsRefilling, lessonResult, profile, settings, UUID_A, UUID_B } from "./fixtures";

const base = {
  id: UUID_A,
  schemaVersion: CONTRACTS_VERSION,
  status: "pending",
  createdAt: "2026-11-07T10:05:00.000Z",
  attemptCount: 0,
  nextAttemptAt: "2026-11-07T10:05:00.000Z",
  lastError: null,
};

describe("SyncQueueRecordSchema", () => {
  it.each([
    { kind: "lesson_result", payload: lessonResult },
    { kind: "settings", payload: settings },
    {
      kind: "profile",
      payload: {
        displayName: "Sam",
        avatar: { kind: "initials" },
        onboardedAt: null,
        updatedAt: "2026-11-07T10:00:00.000Z",
      },
    },
    { kind: "hearts", payload: heartsRefilling },
  ])("accepts a $kind record", (record) => {
    expect(SyncQueueRecordSchema.safeParse({ ...base, ...record }).success).toBe(true);
  });

  it("rejects a payload that does not match its kind", () => {
    const bad = { ...base, kind: "settings", payload: lessonResult };
    expect(SyncQueueRecordSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an invalid nested payload", () => {
    const bad = { ...base, kind: "lesson_result", payload: { ...lessonResult, xpEarned: 99 } };
    expect(SyncQueueRecordSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown schema version, kind or status", () => {
    const ok = { ...base, kind: "settings", payload: settings };
    expect(SyncQueueRecordSchema.safeParse({ ...ok, schemaVersion: 2 }).success).toBe(false);
    expect(SyncQueueRecordSchema.safeParse({ ...ok, kind: "xp" }).success).toBe(false);
    expect(SyncQueueRecordSchema.safeParse({ ...ok, status: "done" }).success).toBe(false);
  });
});

describe("GuestMigrationPayloadSchema", () => {
  const payload = {
    schemaVersion: CONTRACTS_VERSION,
    guestId: UUID_B,
    profile,
    settings,
    hearts: heartsRefilling,
    lessonResults: [lessonResult],
  };

  it("accepts a full guest snapshot", () => {
    expect(GuestMigrationPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects a snapshot with an invalid lesson result", () => {
    const bad = { ...payload, lessonResults: [{ ...lessonResult, perfect: true }] };
    expect(GuestMigrationPayloadSchema.safeParse(bad).success).toBe(false);
  });
});
