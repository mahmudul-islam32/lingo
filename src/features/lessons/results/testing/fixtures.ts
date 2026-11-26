/** Test-only fixtures for the results screen (schema-valid). Not imported by app code. */
import { LessonSessionSchema, type ExerciseAttempt } from "@/contracts";
import type { LessonSessionSummary } from "../../player";

export const RESULT_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";
export const OTHER_RESULT_ID = "2c3d4e5f-6071-4829-9bac-1d2e3f4a5b6c";

/** A multiple-choice attempt of `mc-<n>` (LES-023: outcomes come from the attempts). */
function mcAttempt(n: number, outcome: "correct" | "incorrect", isRetry = false): ExerciseAttempt {
  return {
    exerciseId: `mc-${n}`,
    exerciseType: "multiple_choice",
    answer: { type: "multiple_choice", optionId: outcome === "correct" ? "right" : "wrong" },
    outcome,
    mistake: outcome === "incorrect",
    heartCost: outcome === "incorrect" ? 1 : 0,
    isRetry,
    answeredAt: "2026-11-07T10:00:30.000Z",
  };
}

/** mc-1 … mc-5, all right first time. */
const perfectAttempts = [1, 2, 3, 4, 5].map((n) => mcAttempt(n, "correct"));
/** mc-1 wrong, re-queued and then right; the others right first time. */
const oneMistakeAttempts = [
  mcAttempt(1, "incorrect"),
  ...[2, 3, 4, 5].map((n) => mcAttempt(n, "correct")),
  mcAttempt(1, "correct", true),
];

const session = LessonSessionSchema.parse({
  sessionId: "8a4b2c1d-3e5f-4a6b-9c7d-0e1f2a3b4c5d",
  courseId: "en-es",
  unitId: "u1",
  lessonId: "u1-l1",
  status: "completed",
  startedAt: "2026-11-07T10:00:00.000Z",
  queue: [],
  hiddenExerciseIds: [],
  attempts: perfectAttempts,
  heartsAtStart: 5,
  heartsRemaining: 5,
});

/** 5 exercises, all right first time, 3 min 7 s → 15 XP / "100 %" / "3:07". */
export const perfectSummary: LessonSessionSummary = {
  session,
  startedAt: "2026-11-07T10:00:00.000Z",
  completedAt: "2026-11-07T10:03:07.000Z",
  exerciseCount: 5,
  firstTryCorrectCount: 5,
  mistakeCount: 0,
  skippedCount: 0,
  perfect: true,
};

/** One wrong answer (re-queued and then right): 4 of 5 first try → 10 XP / "80 %". */
export const oneMistakeSummary: LessonSessionSummary = {
  ...perfectSummary,
  session: { ...session, attempts: oneMistakeAttempts, heartsRemaining: 4 },
  completedAt: "2026-11-07T10:01:05.400Z",
  firstTryCorrectCount: 4,
  mistakeCount: 1,
  perfect: false,
};

/** The lesson's own local date in the fixtures above (UTC). */
export const LESSON_DATE = "2026-11-07";
export const YESTERDAY = "2026-11-06";
export const FIXTURE_NOW = new Date("2026-11-07T10:03:07.000Z");

let seq = 0;
/** A distinct, schema-valid v4 uuid for earlier stored results. */
export function nextResultId(): string {
  seq += 1;
  return `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`;
}
