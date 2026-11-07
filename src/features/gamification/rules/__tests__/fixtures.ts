import { LessonResultSchema, type LessonResult } from "@/contracts";

let counter = 0;

/** Deterministic UUID generator for tests. */
export function sequentialIds(prefix = "00000000-0000-4000-8000-"): () => string {
  let n = 0;
  return () => `${prefix}${String(++n).padStart(12, "0")}`;
}

/** A schema-valid LessonResult; override any field. */
export function makeResult(overrides: Partial<LessonResult> = {}): LessonResult {
  counter += 1;
  const perfect = overrides.perfect ?? (overrides.mistakeCount ?? 0) === 0;
  const xp = overrides.xp ?? { base: 10, perfectBonus: perfect ? 5 : 0 };
  const result: LessonResult = {
    id: `10000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    courseId: "es-en",
    unitId: "unit-1",
    lessonId: "lesson-1",
    startedAt: "2026-11-07T10:00:00.000Z",
    completedAt: "2026-11-07T10:05:00.000Z",
    durationMs: 300_000,
    exerciseCount: 10,
    firstTryCorrectCount: perfect ? 10 : 9,
    mistakeCount: perfect ? 0 : 1,
    skippedCount: 0,
    accuracy: perfect ? 1 : 0.9,
    perfect,
    xp,
    xpEarned: xp.base + xp.perfectBonus,
    heartsLost: perfect ? 0 : 1,
    localDate: "2026-11-07",
    timeZone: "Europe/Berlin",
    ...overrides,
  };
  return LessonResultSchema.parse(result);
}
