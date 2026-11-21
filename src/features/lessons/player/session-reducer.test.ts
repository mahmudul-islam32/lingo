import { describe, expect, it } from "vitest";
import { LessonSessionSchema, type AnswerInput, type ExerciseType, type Lesson } from "@/contracts";
import { checkAnswer } from "../checking";
import {
  createPlayerState,
  createSession,
  heartsDelta,
  sessionReducer,
  sessionStats,
  type PlayerState,
} from "./session-reducer";
import {
  clozeLesson,
  fixtureLesson,
  makeClock,
  mcOnlyLesson,
  SESSION_ID,
} from "./testing/fixtures";

const ALL_BUT_SPEAK = new Set<ExerciseType>(["multiple_choice", "match_pairs", "listen"]);

function start(
  lesson: Lesson = mcOnlyLesson,
  extra: Partial<Parameters<typeof createPlayerState>[0]> = {},
) {
  return createPlayerState({
    lesson,
    supportedTypes: ALL_BUT_SPEAK,
    now: new Date("2026-11-07T10:00:00.000Z"),
    sessionId: SESSION_ID,
    ...extra,
  });
}

const clock = makeClock(Date.parse("2026-11-07T10:00:01.000Z"));

function correctAnswer(state: PlayerState): AnswerInput {
  const ex = state.exercises[state.currentId!]!;
  switch (ex.type) {
    case "multiple_choice":
      return { type: "multiple_choice", optionId: ex.correctOptionId };
    case "listen":
    case "word_bank_translate":
      return { type: ex.type, tiles: ["Hola", "qué", "tal"] };
    case "match_pairs":
      return {
        type: "match_pairs",
        matches: ex.pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id })),
        mismatchCount: 0,
      };
    case "speak":
      return { type: "speak", skipped: false, transcripts: [ex.phrase] };
    case "cloze":
      return { type: "cloze", optionIds: ex.gaps.map((g) => g.correctOptionId) };
    case "choice":
    case "listening":
      return { type: ex.type, optionId: ex.correctOptionId };
    case "task":
      return { type: "task", text: "" };
    case "explain":
      return { type: "explain" };
  }
}

function wrongAnswer(state: PlayerState): AnswerInput {
  const ex = state.exercises[state.currentId!]!;
  if (ex.type === "multiple_choice") {
    return {
      type: "multiple_choice",
      optionId: ex.options.find((o) => o.id !== ex.correctOptionId)!.id,
    };
  }
  if (ex.type === "listen") return { type: "listen", tiles: ["adiós"] };
  if (ex.type === "cloze") {
    // Last gap wrong, the others right.
    return {
      type: "cloze",
      optionIds: ex.gaps.map((g, i) =>
        i === ex.gaps.length - 1
          ? g.options.find((o) => o.id !== g.correctOptionId)!.id
          : g.correctOptionId,
      ),
    };
  }
  throw new Error(`no wrong answer for ${ex.type}`);
}

/** answer_changed + check + continue. */
function answer(state: PlayerState, given: AnswerInput): PlayerState {
  const ex = state.exercises[state.currentId!]!;
  let s = sessionReducer(state, { type: "answer_changed", answer: given });
  s = sessionReducer(s, {
    type: "check",
    answer: given,
    result: checkAnswer({ exercise: ex, answer: given }),
    now: clock(),
  });
  return sessionReducer(s, { type: "continue", now: clock() });
}

describe("createSession", () => {
  it("queues exercises in content order and hides unsupported and hidden ones", () => {
    const session = createSession({
      lesson: fixtureLesson,
      supportedTypes: ALL_BUT_SPEAK,
      hiddenIds: ["li-1"],
      now: new Date("2026-11-07T10:00:00.000Z"),
      sessionId: SESSION_ID,
    });
    expect(session.queue).toEqual(["mc-1", "mc-2", "mp-1"]);
    expect(session.hiddenExerciseIds).toEqual(["sp-1", "li-1"]);
    expect(session.status).toBe("in_progress");
    expect(session.heartsAtStart).toBe(5);
    expect(session.heartsRemaining).toBe(5);
    expect(LessonSessionSchema.safeParse(session).success).toBe(true);
  });

  it("presents the first exercise with a presentation key", () => {
    const state = start();
    expect(state.phase).toBe("answering");
    expect(state.currentId).toBe("mc-1");
    expect(state.presentationKey).toBe("mc-1:0");
  });
});

describe("sessionReducer", () => {
  it("all correct: completes in order with no mistakes", () => {
    let s = start();
    expect(sessionStats(s.session).progressMax).toBe(2);
    s = answer(s, correctAnswer(s));
    expect(s.currentId).toBe("mc-2");
    expect(sessionStats(s.session).correctCount).toBe(1);
    s = answer(s, correctAnswer(s));
    expect(s.session.status).toBe("completed");
    expect(s.phase).toBe("ended");
    expect(s.completedAt).not.toBeNull();
    const stats = sessionStats(s.session);
    expect(stats).toMatchObject({
      exerciseCount: 2,
      correctCount: 2,
      mistakeCount: 0,
      firstTryCorrectCount: 2,
      skippedCount: 0,
      perfect: true,
    });
    expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
  });

  it("start (LES-013 tip card): moves startedAt to Start, changes nothing else", () => {
    const s = start();
    const started = sessionReducer(s, { type: "start", now: new Date("2026-11-07T10:00:30.000Z") });
    expect(started.session.startedAt).toBe("2026-11-07T10:00:30.000Z");
    expect(started.currentId).toBe(s.currentId);
    expect(started.presentationKey).toBe(s.presentationKey);
    expect(started.session.queue).toEqual(s.session.queue);
    expect(started.session.heartsRemaining).toBe(s.session.heartsRemaining);
  });

  it("start is ignored once an exercise was answered", () => {
    const s = answer(start(), correctAnswer(start()));
    const again = sessionReducer(s, { type: "start", now: new Date("2026-11-07T11:00:00.000Z") });
    expect(again).toBe(s);
  });

  it("one wrong then correct: re-queues at the end and comes back", () => {
    let s = start();
    const wrong = wrongAnswer(s);
    const ex = s.exercises["mc-1"]!;
    s = sessionReducer(s, { type: "answer_changed", answer: wrong });
    s = sessionReducer(s, {
      type: "check",
      answer: wrong,
      result: checkAnswer({ exercise: ex, answer: wrong }),
      now: clock(),
    });
    // Re-queued at once; current stays on screen with feedback.
    expect(s.phase).toBe("feedback");
    expect(s.currentId).toBe("mc-1");
    expect(s.presentationKey).toBe("mc-1:0");
    expect(s.session.queue).toEqual(["mc-2", "mc-1"]);
    expect(sessionStats(s.session).correctCount).toBe(0);
    s = sessionReducer(s, { type: "continue", now: clock() });
    expect(s.currentId).toBe("mc-2");
    s = answer(s, correctAnswer(s));
    expect(s.currentId).toBe("mc-1");
    expect(s.presentationKey).toBe("mc-1:1");
    s = answer(s, correctAnswer(s));
    expect(s.session.status).toBe("completed");
    const attempts = s.session.attempts;
    expect(attempts.map((a) => [a.exerciseId, a.outcome, a.isRetry])).toEqual([
      ["mc-1", "incorrect", false],
      ["mc-2", "correct", false],
      ["mc-1", "correct", true],
    ]);
    expect(sessionStats(s.session)).toMatchObject({
      mistakeCount: 1,
      firstTryCorrectCount: 1,
      perfect: false,
      exerciseCount: 2,
    });
  });

  it("same exercise wrong twice: keeps coming back until correct", () => {
    let s = start();
    s = answer(s, wrongAnswer(s)); // mc-1 wrong → [mc-2, mc-1]
    s = answer(s, correctAnswer(s)); // mc-2 ok → [mc-1]
    s = answer(s, wrongAnswer(s)); // mc-1 wrong again → [mc-1]
    expect(s.session.queue).toEqual(["mc-1"]);
    expect(s.currentId).toBe("mc-1");
    expect(s.presentationKey).toBe("mc-1:2");
    s = answer(s, correctAnswer(s));
    expect(s.session.status).toBe("completed");
    expect(sessionStats(s.session)).toMatchObject({ mistakeCount: 2, firstTryCorrectCount: 1 });
  });

  it("match pairs with mismatches: correct, one mistake, not first-try, never re-queued", () => {
    const lesson = {
      ...fixtureLesson,
      exercises: fixtureLesson.exercises.filter((e) => e.id === "mp-1" || e.id === "mc-1"),
    };
    let s = start(lesson);
    s = answer(s, correctAnswer(s)); // mc-1
    expect(s.currentId).toBe("mp-1");
    const ex = s.exercises["mp-1"]!;
    const given: AnswerInput = {
      ...(correctAnswer(s) as AnswerInput & { type: "match_pairs" }),
      mismatchCount: 3,
    };
    const result = checkAnswer({ exercise: ex, answer: given });
    s = sessionReducer(s, { type: "check", answer: given, result, now: clock() });
    expect(s.session.queue).toEqual(["mp-1"]);
    expect(s.session.attempts.at(-1)).toMatchObject({
      outcome: "correct",
      mistake: true,
      heartCost: 1,
    });
    s = sessionReducer(s, { type: "continue", now: clock() });
    expect(s.session.status).toBe("completed");
    expect(sessionStats(s.session)).toMatchObject({
      mistakeCount: 1,
      firstTryCorrectCount: 1,
      correctCount: 2,
      perfect: false,
    });
  });

  it("match pairs is not re-queued even if a broken board comes back incorrect", () => {
    const lesson = {
      ...fixtureLesson,
      exercises: fixtureLesson.exercises.filter((e) => e.id === "mp-1"),
    };
    let s = start(lesson);
    const given: AnswerInput = { type: "match_pairs", matches: [], mismatchCount: 0 };
    const result = checkAnswer({ exercise: s.exercises["mp-1"]!, answer: given });
    expect(result.outcome).toBe("incorrect");
    s = sessionReducer(s, { type: "check", answer: given, result, now: clock() });
    s = sessionReducer(s, { type: "continue", now: clock() });
    expect(s.session.status).toBe("completed");
  });

  it("skipped exercise: moves on without re-queue and is excluded from the progress max", () => {
    let s = start(fixtureLesson); // mc-1, mc-2, mp-1, li-1 (sp-1 hidden)
    s = answer(s, correctAnswer(s));
    s = answer(s, correctAnswer(s));
    s = answer(s, correctAnswer(s)); // mp-1
    expect(s.currentId).toBe("li-1");
    expect(sessionStats(s.session).progressMax).toBe(4);
    s = sessionReducer(s, { type: "skip", reason: "audio_unavailable", now: clock() });
    expect(s.session.status).toBe("completed");
    expect(s.session.attempts.at(-1)).toMatchObject({
      exerciseId: "li-1",
      outcome: "skipped",
      mistake: false,
      heartCost: 0,
      answer: null,
    });
    expect(sessionStats(s.session)).toMatchObject({
      exerciseCount: 4,
      skippedCount: 1,
      progressMax: 3,
      firstTryCorrectCount: 3,
      perfect: true,
    });
    expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
  });

  it("all exercises skipped: completed but not perfect (PD-012)", () => {
    const lesson = {
      ...fixtureLesson,
      exercises: fixtureLesson.exercises.filter((e) => e.id === "li-1"),
    };
    let s = start(lesson);
    s = sessionReducer(s, { type: "skip", reason: "audio_unavailable", now: clock() });
    expect(s.session.status).toBe("completed");
    expect(sessionStats(s.session)).toMatchObject({
      mistakeCount: 0,
      progressMax: 0,
      perfect: false,
    });
    expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
  });

  it("skipped multiple choice: recorded with no answer (CR-003)", () => {
    let s = start(mcOnlyLesson);
    s = sessionReducer(s, { type: "skip", reason: "invalid_content", now: clock() });
    expect(s.session.attempts.at(-1)).toMatchObject({
      exerciseType: "multiple_choice",
      outcome: "skipped",
      answer: null,
    });
    expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
  });

  it("unsupported type: left out silently and not counted", () => {
    const s = start(fixtureLesson);
    expect(s.session.hiddenExerciseIds).toEqual(["sp-1"]);
    expect(s.session.queue).not.toContain("sp-1");
    expect(sessionStats(s.session).exerciseCount).toBe(4);
  });

  it("lesson with nothing playable has an empty queue and no current exercise", () => {
    const s = start(mcOnlyLesson, { supportedTypes: new Set() });
    expect(s.session.queue).toEqual([]);
    expect(s.currentId).toBeNull();
    expect(sessionStats(s.session).exerciseCount).toBe(0);
  });

  it("quit: ends the session as quit from any phase and ignores later actions", () => {
    let s = start();
    s = sessionReducer(s, { type: "quit" });
    expect(s.session.status).toBe("quit");
    expect(s.phase).toBe("ended");
    const after = sessionReducer(s, { type: "continue", now: clock() });
    expect(after).toBe(s);

    let f = start();
    const given = wrongAnswer(f);
    f = sessionReducer(f, {
      type: "check",
      answer: given,
      result: checkAnswer({ exercise: f.exercises["mc-1"]!, answer: given }),
      now: clock(),
    });
    expect(sessionReducer(f, { type: "quit" }).session.status).toBe("quit");
  });

  it("ignores actions that don't fit the phase or exercise", () => {
    const s = start();
    expect(sessionReducer(s, { type: "continue", now: clock() })).toBe(s);
    expect(
      sessionReducer(s, { type: "answer_changed", answer: { type: "listen", tiles: ["x"] } }),
    ).toBe(s);
    const given: AnswerInput = { type: "multiple_choice", optionId: "hola" };
    const result = checkAnswer({ exercise: s.exercises["mc-2"]!, answer: given });
    expect(sessionReducer(s, { type: "check", answer: given, result, now: clock() })).toBe(s);
  });

  it("answer_changed with null clears the pending answer", () => {
    let s = start();
    s = sessionReducer(s, { type: "answer_changed", answer: correctAnswer(s) });
    expect(s.pendingAnswer).not.toBeNull();
    s = sessionReducer(s, { type: "answer_changed", answer: null });
    expect(s.pendingAnswer).toBeNull();
  });

  describe("cloze (LES-015 AC 5, PD-012)", () => {
    const CLOZE_TYPES = new Set<ExerciseType>(["multiple_choice", "cloze"]);

    it("is queued like any supported type", () => {
      const s = start(clozeLesson, { supportedTypes: CLOZE_TYPES });
      expect(s.session.queue).toEqual(["cz-1", "cz-2", "mc-de"]);
      expect(sessionStats(s.session).exerciseCount).toBe(3);
    });

    it("one wrong check: 1 mistake, 1 heart, re-queued, then correct as a retry", () => {
      let s = start(clozeLesson, {
        supportedTypes: CLOZE_TYPES,
        heartsEnforced: true,
        heartsAtStart: 5,
      });
      const wrong = wrongAnswer(s);
      const result = checkAnswer({ exercise: s.exercises["cz-1"]!, answer: wrong });
      expect(result).toMatchObject({
        outcome: "incorrect",
        mistake: true,
        heartCost: 1,
        wrongGapIndexes: [0],
        correctAnswer: "Ich lege das Buch auf den Tisch.",
      });
      s = sessionReducer(s, { type: "answer_changed", answer: wrong });
      s = sessionReducer(s, { type: "check", answer: wrong, result, now: clock() });
      expect(s.session.queue).toEqual(["cz-2", "mc-de", "cz-1"]);
      expect(s.session.heartsRemaining).toBe(4);
      s = sessionReducer(s, { type: "continue", now: clock() });

      s = answer(s, correctAnswer(s)); // cz-2, both gaps right
      s = answer(s, correctAnswer(s)); // mc-de
      expect(s.currentId).toBe("cz-1");
      expect(s.presentationKey).toBe("cz-1:1");
      s = answer(s, correctAnswer(s));
      expect(s.session.status).toBe("completed");
      expect(s.session.attempts.map((a) => [a.exerciseId, a.outcome, a.isRetry])).toEqual([
        ["cz-1", "incorrect", false],
        ["cz-2", "correct", false],
        ["mc-de", "correct", false],
        ["cz-1", "correct", true],
      ]);
      expect(sessionStats(s.session)).toMatchObject({
        exerciseCount: 3,
        mistakeCount: 1,
        firstTryCorrectCount: 2,
        perfect: false,
      });
      expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
    });

    it("one wrong gap of two is still a single mistake", () => {
      let s = start(clozeLesson, { supportedTypes: CLOZE_TYPES });
      s = answer(s, correctAnswer(s));
      const wrong = wrongAnswer(s);
      const result = checkAnswer({ exercise: s.exercises["cz-2"]!, answer: wrong });
      expect(result).toMatchObject({ outcome: "incorrect", heartCost: 1, wrongGapIndexes: [1] });
      s = answer(s, wrong);
      expect(sessionStats(s.session).mistakeCount).toBe(1);
    });
  });

  describe("hearts (LES-009 wiring)", () => {
    it("does not deduct hearts unless enforced (v0.2.0)", () => {
      let s = start();
      s = answer(s, wrongAnswer(s));
      expect(s.session.heartsRemaining).toBe(5);
    });

    it("deducts heart costs and ends as out_of_hearts on the next Continue", () => {
      let s = start(mcOnlyLesson, { heartsEnforced: true, heartsAtStart: 2 });
      s = answer(s, wrongAnswer(s));
      expect(s.session.heartsRemaining).toBe(1);
      expect(s.session.status).toBe("in_progress");
      const given = wrongAnswer(s);
      s = sessionReducer(s, {
        type: "check",
        answer: given,
        result: checkAnswer({ exercise: s.exercises[s.currentId!]!, answer: given }),
        now: clock(),
      });
      expect(s.session.heartsRemaining).toBe(0);
      expect(s.phase).toBe("feedback");
      s = sessionReducer(s, { type: "continue", now: clock() });
      expect(s.session.status).toBe("out_of_hearts");
      expect(s.completedAt).toBeNull();
    });

    it("out_of_hearts wins over completing on the last exercise", () => {
      const lesson = {
        ...fixtureLesson,
        exercises: fixtureLesson.exercises.filter((e) => e.id === "mp-1"),
      };
      let s = start(lesson, { heartsEnforced: true, heartsAtStart: 1 });
      const given: AnswerInput = {
        ...(correctAnswer(s) as AnswerInput & { type: "match_pairs" }),
        mismatchCount: 1,
      };
      s = sessionReducer(s, {
        type: "check",
        answer: given,
        result: checkAnswer({ exercise: s.exercises["mp-1"]!, answer: given }),
        now: clock(),
      });
      s = sessionReducer(s, { type: "continue", now: clock() });
      expect(s.session.status).toBe("out_of_hearts");
    });
  });
});

describe("earning hearts and practice (LES-020)", () => {
  const earning = { heartsEnforced: true, heartsGainPerCorrect: 1, heartsMax: 5 };

  it("a correct Check earns the gain, capped at the max", () => {
    let s = start(mcOnlyLesson, { ...earning, heartsAtStart: 4 });
    s = answer(s, correctAnswer(s));
    expect(s.session.heartsRemaining).toBe(5);
    expect(s.heartsGained).toBe(1);
    s = answer(s, correctAnswer(s));
    expect(s.session.heartsRemaining).toBe(5);
    expect(s.heartsGained).toBe(1);
    expect(LessonSessionSchema.safeParse(s.session).success).toBe(true);
  });

  it("a wrong Check costs and never also earns; the re-queued retry earns", () => {
    let s = start(mcOnlyLesson, { ...earning, heartsAtStart: 3 });
    s = answer(s, wrongAnswer(s));
    expect(s.session.heartsRemaining).toBe(2);
    expect(s.heartsLost).toBe(1);
    s = answer(s, correctAnswer(s)); // mc-2
    s = answer(s, correctAnswer(s)); // mc-1 retry
    expect(s.session.heartsRemaining).toBe(4);
    expect(s.heartsGained).toBe(2);
    expect(s.session.status).toBe("completed");
  });

  it("does not earn without enforcement or with a gain of 0", () => {
    let s = start(mcOnlyLesson, { heartsGainPerCorrect: 1, heartsAtStart: 3 });
    s = answer(s, correctAnswer(s));
    expect(s.session.heartsRemaining).toBe(3);
    let t = start(mcOnlyLesson, { heartsEnforced: true, heartsAtStart: 3 });
    t = answer(t, correctAnswer(t));
    expect(t.session.heartsRemaining).toBe(3);
  });

  it("match pairs: no mismatch earns, a mismatch only costs", () => {
    const lesson = {
      ...fixtureLesson,
      exercises: fixtureLesson.exercises.filter((e) => e.id === "mp-1"),
    };
    let clean = start(lesson, { ...earning, heartsAtStart: 3 });
    clean = answer(clean, correctAnswer(clean));
    expect(clean.session.heartsRemaining).toBe(4);
    let messy = start(lesson, { ...earning, heartsAtStart: 3 });
    messy = answer(messy, {
      ...(correctAnswer(messy) as AnswerInput & { type: "match_pairs" }),
      mismatchCount: 2,
    });
    expect(messy.session.heartsRemaining).toBe(2);
    expect(messy.heartsGained).toBe(0);
  });

  it("heartsDelta: speak and skipped never change hearts", () => {
    const base = { ...start(mcOnlyLesson, { ...earning, heartsAtStart: 3 }) };
    expect(heartsDelta(base, { type: "speak" }, { outcome: "correct", heartCost: 0 })).toEqual({
      lost: 0,
      gained: 0,
    });
    expect(
      heartsDelta(base, { type: "multiple_choice" }, { outcome: "skipped", heartCost: 0 }),
    ).toEqual({ lost: 0, gained: 0 });
    expect(
      heartsDelta(base, { type: "multiple_choice" }, { outcome: "correct", heartCost: 0 }),
    ).toEqual({ lost: 0, gained: 1 });
  });

  it("a skip earns nothing", () => {
    let s = start(mcOnlyLesson, { ...earning, heartsAtStart: 3 });
    s = sessionReducer(s, { type: "skip", reason: "audio_unavailable", now: clock() });
    expect(s.session.heartsRemaining).toBe(3);
    expect(s.heartsGained).toBe(0);
  });

  it("practice: starts at 0, wrong costs nothing and is re-queued, never ends out of hearts", () => {
    let s = start(mcOnlyLesson, { ...earning, heartsPractice: true, heartsAtStart: 0 });
    expect(s.phase).toBe("answering");
    s = answer(s, wrongAnswer(s));
    expect(s.session.status).toBe("in_progress");
    expect(s.session.heartsRemaining).toBe(0);
    expect(s.heartsLost).toBe(0);
    expect(s.session.queue).toEqual(["mc-2", "mc-1"]);
    s = answer(s, correctAnswer(s));
    expect(s.session.heartsRemaining).toBe(1);
    s = answer(s, correctAnswer(s));
    expect(s.session.status).toBe("completed");
    expect(sessionStats(s.session).mistakeCount).toBe(1);
  });
});
