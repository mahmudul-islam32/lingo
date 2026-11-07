import { describe, expect, it } from "vitest";
import { LessonResultSchema, type AnswerInput, type ExerciseType } from "@/contracts";
import { checkAnswer } from "../checking";
import { createPlayerState, sessionReducer, type PlayerState } from "./session-reducer";
import { buildLessonResult, lessonAccuracy, summarizeSession } from "./summary";
import { fixtureLesson, SESSION_ID } from "./testing/fixtures";

const RESULT_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";

function play(): PlayerState {
  let s = createPlayerState({
    lesson: fixtureLesson,
    supportedTypes: new Set<ExerciseType>(["multiple_choice", "match_pairs", "listen"]),
    now: new Date("2026-11-07T10:00:00.000Z"),
    sessionId: SESSION_ID,
  });
  let t = Date.parse("2026-11-07T10:00:00.000Z");
  const tick = () => new Date((t += 5000));
  const submit = (answer: AnswerInput) => {
    const result = checkAnswer({ exercise: s.exercises[s.currentId!]!, answer });
    s = sessionReducer(s, { type: "check", answer, result, now: tick() });
    s = sessionReducer(s, { type: "continue", now: tick() });
  };
  submit({ type: "multiple_choice", optionId: "adios" }); // mc-1 wrong
  submit({ type: "multiple_choice", optionId: "buenos-dias" }); // mc-2 ok
  submit({
    type: "match_pairs",
    matches: ["gato", "perro", "pan", "agua", "casa"].map((id) => ({
      learningPairId: id,
      knownPairId: id,
    })),
    mismatchCount: 1,
  }); // mp-1 correct with mismatch
  s = sessionReducer(s, { type: "skip", reason: "audio_unavailable", now: tick() }); // li-1
  submit({ type: "multiple_choice", optionId: "hola" }); // mc-1 retry ok
  return s;
}

describe("summarizeSession / buildLessonResult", () => {
  it("summarises the session and maps to a schema-valid LessonResult", () => {
    const s = play();
    expect(s.session.status).toBe("completed");
    const summary = summarizeSession(s.session, s.completedAt!);
    expect(summary).toMatchObject({
      startedAt: "2026-11-07T10:00:00.000Z",
      completedAt: "2026-11-07T10:00:45.000Z",
      exerciseCount: 4,
      firstTryCorrectCount: 1,
      mistakeCount: 2,
      skippedCount: 1,
      perfect: false,
    });
    expect(summary.session.attempts).toHaveLength(5);

    const result = buildLessonResult(summary, {
      id: RESULT_ID,
      xp: { base: 10, perfectBonus: 0 },
      timeZone: "Europe/Madrid",
      localDate: "2026-11-07",
    });
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({
      id: RESULT_ID,
      courseId: "en-es",
      unitId: "u1",
      lessonId: "u1-l1-test",
      durationMs: 45000,
      exerciseCount: 4,
      accuracy: 1 / 3,
      perfect: false,
      xpEarned: 10,
      heartsLost: 0,
    });
  });

  it("rejects an inconsistent XP breakdown", () => {
    const s = play();
    const summary = summarizeSession(s.session, s.completedAt!);
    expect(() =>
      buildLessonResult(summary, {
        id: RESULT_ID,
        xp: { base: 10, perfectBonus: 5 },
        timeZone: "UTC",
        localDate: "2026-11-07",
      }),
    ).toThrow();
  });

  it("accuracy is 1 when nothing was counted", () => {
    expect(lessonAccuracy({ exerciseCount: 1, skippedCount: 1, firstTryCorrectCount: 0 })).toBe(1);
    expect(lessonAccuracy({ exerciseCount: 4, skippedCount: 0, firstTryCorrectCount: 3 })).toBe(
      0.75,
    );
  });
});
