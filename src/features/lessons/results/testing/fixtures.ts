/** Test-only fixtures for the results screen (schema-valid). Not imported by app code. */
import { LessonSessionSchema } from "@/contracts";
import type { LessonSessionSummary } from "../../player";

export const RESULT_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";
export const OTHER_RESULT_ID = "2c3d4e5f-6071-4829-9bac-1d2e3f4a5b6c";

const session = LessonSessionSchema.parse({
  sessionId: "8a4b2c1d-3e5f-4a6b-9c7d-0e1f2a3b4c5d",
  courseId: "en-es",
  unitId: "u1",
  lessonId: "u1-l1",
  status: "completed",
  startedAt: "2026-11-07T10:00:00.000Z",
  queue: [],
  hiddenExerciseIds: [],
  attempts: [],
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
  session: { ...session, heartsRemaining: 4 },
  completedAt: "2026-11-07T10:01:05.400Z",
  firstTryCorrectCount: 4,
  mistakeCount: 1,
  perfect: false,
};
