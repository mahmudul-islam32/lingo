import { describe, expect, it } from "vitest";
import {
  CONTRACTS_VERSION,
  GuestMigrationPayloadSchema,
  isReviewResult,
  REVIEW_SESSION_ID,
  type ExerciseOutcome,
  type LessonResult,
} from "@/contracts";
import { openLocalSession, type LocalSession } from "..";
import { DB_SCHEMA_VERSION } from "../db";
import { createDevice, lessonResult } from "./helpers";

/**
 * PLT-029 AC 1–4 (CTO-019, ADR-019 §2): outcomes are embedded in `LessonResult`, so they are
 * stored by `saveLessonResult` in its one transaction with its one sync record, under the
 * same idempotency key. No new table, index or Dexie version.
 */
const COURSE = "spanish-from-english";
const outcomes: ExerciseOutcome[] = [
  {
    lessonId: "greetings-1",
    exerciseId: "ex-1",
    exerciseType: "multiple_choice",
    outcome: "correct",
  },
  {
    lessonId: "greetings-1",
    exerciseId: "ex-2",
    exerciseType: "word_bank_translate",
    outcome: "correct",
  },
  { lessonId: "greetings-1", exerciseId: "ex-3", exerciseType: "match_pairs", outcome: "correct" },
  { lessonId: "greetings-1", exerciseId: "ex-4", exerciseType: "cloze", outcome: "incorrect" },
  { lessonId: "greetings-1", exerciseId: "ex-5", exerciseType: "listen", outcome: "skipped" },
];
const withOutcomes = lessonResult({ kind: "lesson", exerciseOutcomes: outcomes });

const reviewResult: LessonResult = lessonResult({
  id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  kind: "review",
  unitId: REVIEW_SESSION_ID,
  lessonId: REVIEW_SESSION_ID,
  completedAt: "2026-11-07T11:04:30.000Z",
  exerciseCount: 3,
  firstTryCorrectCount: 2,
  mistakeCount: 1,
  skippedCount: 0,
  accuracy: 2 / 3,
  exerciseOutcomes: [
    { lessonId: "greetings-1", exerciseId: "ex-4", exerciseType: "cloze", outcome: "correct" },
    { lessonId: "greetings-2", exerciseId: "ex-9", exerciseType: "choice", outcome: "correct" },
    {
      lessonId: "greetings-1",
      exerciseId: "ex-1",
      exerciseType: "multiple_choice",
      outcome: "incorrect",
    },
  ],
});

async function queued(session: LocalSession) {
  return (await session.syncQueue.list()).filter((r) => r.kind === "lesson_result");
}

describe.each([
  ["Dexie (fake-indexeddb)", () => createDevice().open()],
  ["memory fallback", () => openLocalSession({ forceMemory: true })],
])("exercise outcomes on the device: %s (PLT-029 AC 1, 2, 4)", (_name, open) => {
  it("stores the outcomes with the result in one record and one sync record", async () => {
    const session = await open();
    await session.progress.saveLessonResult(withOutcomes);
    expect(await session.progress.listLessonResults(COURSE)).toEqual([withOutcomes]);
    const records = await queued(session);
    expect(records).toHaveLength(1);
    expect(records[0]!.payload).toEqual(withOutcomes);
  });

  it("saving the same result twice is a no-op (outcomes stored once, one sync record)", async () => {
    const session = await open();
    await session.progress.saveLessonResult(withOutcomes);
    await session.progress.saveLessonResult(withOutcomes);
    const stored = await session.progress.listLessonResults(COURSE);
    expect(stored).toHaveLength(1);
    expect(stored[0]!.exerciseOutcomes).toHaveLength(outcomes.length);
    expect(await queued(session)).toHaveLength(1);
  });

  it("a review result keeps its kind, reserved ids and source-lesson outcomes", async () => {
    const session = await open();
    await session.progress.saveLessonResult(withOutcomes);
    await session.progress.saveLessonResult(reviewResult);
    const stored = await session.progress.listLessonResults(COURSE);
    expect(stored).toEqual([withOutcomes, reviewResult]);
    expect(stored.map(isReviewResult)).toEqual([false, true]);
    const records = await queued(session);
    expect(records.map((r) => r.payload)).toEqual([withOutcomes, reviewResult]);
  });

  it("results from before CTO-019 (no outcomes, no kind) still load next to new ones", async () => {
    const session = await open();
    const legacy = lessonResult({ id: "1b2c3d4e-5f60-4a1b-8c2d-3e4f5a6b7c8d" });
    await session.progress.saveLessonResult(legacy);
    await session.progress.saveLessonResult(withOutcomes);
    const stored = await session.progress.listLessonResults(COURSE);
    expect(stored).toHaveLength(2);
    expect(stored.find((r) => r.id === legacy.id)).not.toHaveProperty("exerciseOutcomes");
  });

  it("the guest migration payload carries the outcomes and the review kind unchanged", async () => {
    const session = await open();
    await session.progress.saveLessonResult(withOutcomes);
    await session.progress.saveLessonResult(reviewResult);
    const { identity, profile } = await session.profile.bootstrap();
    const settings = await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 20 });
    const payload = GuestMigrationPayloadSchema.parse({
      schemaVersion: CONTRACTS_VERSION,
      guestId: identity.kind === "guest" ? identity.guestId : "",
      profile,
      settings,
      hearts: await session.progress.getHearts(),
      lessonResults: await session.progress.listLessonResults(COURSE),
    });
    expect(payload.lessonResults).toEqual([withOutcomes, reviewResult]);
  });

  it("rejects outcomes that don't match the counters, without writing", async () => {
    const session = await open();
    const bad = lessonResult({ exerciseOutcomes: outcomes.slice(1) }); // 2 correct ≠ 3
    await expect(session.progress.saveLessonResult(bad)).rejects.toMatchObject({
      name: "InvalidRecordError",
    });
    expect(await session.progress.listLessonResults(COURSE)).toEqual([]);
    expect(await queued(session)).toEqual([]);
  });
});

describe("outcomes after a reload and with corrupt rows (PLT-029 AC 2, 3)", () => {
  it("outcomes are readable after a reload; a corrupt row is skipped and reported", async () => {
    const device = createDevice();
    const first = await device.open();
    await first.progress.saveLessonResult(withOutcomes);
    const db = device.raw();
    await db.open();
    await db.table("lessonResults").put({
      ...reviewResult,
      exerciseOutcomes: [{ lessonId: REVIEW_SESSION_ID, exerciseId: "x" }],
    });
    // No Dexie version bump (ADR-019 §2): still the same schema version.
    expect(db.verno).toBe(DB_SCHEMA_VERSION);
    expect(DB_SCHEMA_VERSION).toBe(1);
    db.close();

    const reloaded = await device.open();
    expect(await reloaded.progress.listLessonResults(COURSE)).toEqual([withOutcomes]);
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "lessonResults", action: "skipped" }),
    );
  });
});
