import {
  LessonResultSchema,
  REVIEW_SESSION_ID,
  type ExerciseType,
  type LessonResult,
} from "@/contracts";

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

type OutcomeKind = "correct" | "incorrect" | "skipped";

/**
 * A schema-valid result carrying `exerciseOutcomes` (CTO-019): counts follow the outcomes
 * (ADR-019 §1). `outcomes` are `[exerciseId, outcome, exerciseType?, lessonId?]`; the
 * lesson defaults to the result's lesson. `kind: "review"` uses the reserved ids.
 */
export function makeOutcomeResult(options: {
  courseId: string;
  lessonId: string;
  date: string;
  /** `HH:MM` of `completedAt` (UTC), default `10:00`. */
  time?: string;
  kind?: "lesson" | "review";
  outcomes: readonly (readonly [string, OutcomeKind, ExerciseType?, string?])[];
}): LessonResult {
  const review = options.kind === "review";
  const resultLessonId = review ? REVIEW_SESSION_ID : options.lessonId;
  const exerciseOutcomes = options.outcomes.map(([exerciseId, outcome, type, lessonId]) => ({
    lessonId: lessonId ?? options.lessonId,
    exerciseId,
    exerciseType: type ?? ("multiple_choice" as ExerciseType),
    outcome,
  }));
  const count = (kind: OutcomeKind) => exerciseOutcomes.filter((o) => o.outcome === kind).length;
  const exerciseCount = Math.max(exerciseOutcomes.length, 1);
  const skippedCount = count("skipped");
  const mistakeCount = count("incorrect");
  const perfect = mistakeCount === 0 && exerciseCount - skippedCount >= 1;
  const counted = exerciseCount - skippedCount;
  const at = `${options.date}T${options.time ?? "10:00"}:00.000Z`;
  return makeResult({
    courseId: options.courseId,
    unitId: review ? REVIEW_SESSION_ID : "unit-1",
    lessonId: resultLessonId,
    ...(options.kind ? { kind: options.kind } : {}),
    startedAt: at,
    completedAt: at,
    durationMs: 0,
    exerciseCount,
    firstTryCorrectCount: count("correct"),
    mistakeCount,
    skippedCount,
    accuracy: counted === 0 ? 1 : count("correct") / counted,
    perfect,
    heartsLost: 0,
    localDate: options.date,
    exerciseOutcomes,
  });
}
