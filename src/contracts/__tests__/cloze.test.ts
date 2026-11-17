import { describe, expect, it } from "vitest";
import {
  AnswerCheckInputSchema,
  AnswerCheckResultSchema,
  AnswerInputSchema,
  checkClozeAnswer,
  CLOZE_GAP_MARKER,
  ClozeExerciseSchema,
  clozeCorrectSentence,
  CONTENT_RULES,
  countClozeGaps,
  EXERCISE_TYPES,
  ExerciseSchema,
  fillClozeSentence,
  GAME_CONFIG,
  LessonSchema,
  splitClozeSentence,
  type ClozeExercise,
} from "../index";
import { lesson } from "./fixtures";

function issues(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  return result.error?.issues.map((i) => i.message) ?? [];
}

/** German one-gap preposition + article (two-way preposition, accusative). */
const onTheTable: ClozeExercise = {
  id: "de-a2-u06-l1-ex11",
  type: "cloze",
  sentence: "Ich lege das Buch auf ___ Tisch.",
  translation: "I put the book on the table.",
  audio: { src: "/audio/de/de-a2-u06-l1-ex11.mp3" },
  gaps: [
    {
      options: [
        { id: "dem", text: "dem" },
        { id: "den", text: "den" },
      ],
      correctOptionId: "den",
    },
  ],
};

/** German two-gap sentence: article + adjective ending. */
const blueDress: ClozeExercise = {
  id: "de-a2-u04-l2-ex09",
  type: "cloze",
  sentence: "___ blaue Kleid ist schön, aber ___ Rock nicht.",
  translation: "The blue dress is pretty, but the skirt isn't.",
  gaps: [
    {
      options: [
        { id: "der", text: "Der" },
        { id: "die", text: "Die" },
        { id: "das", text: "Das" },
      ],
      correctOptionId: "das",
    },
    {
      options: [
        { id: "der", text: "der" },
        { id: "die", text: "die" },
        { id: "das", text: "das" },
        { id: "den", text: "den" },
      ],
      correctOptionId: "der",
    },
  ],
};

/** CTO-009 AC 3: gender choice is a one-gap cloze at the start of a noun phrase. */
const genderChoice: ClozeExercise = {
  id: "de-a1-gender-tisch",
  type: "cloze",
  sentence: "___ Tisch",
  translation: "the table",
  gaps: [
    {
      options: [
        { id: "der", text: "der" },
        { id: "die", text: "die" },
        { id: "das", text: "das" },
      ],
      correctOptionId: "der",
    },
  ],
};

const [gap0] = onTheTable.gaps;

describe("cloze helpers", () => {
  it("uses three underscores as the marker", () => {
    expect(CLOZE_GAP_MARKER).toBe("___");
  });

  it("splits a sentence into text and gaps in reading order", () => {
    expect(splitClozeSentence(blueDress.sentence)).toEqual([
      { kind: "gap", gapIndex: 0 },
      { kind: "text", text: " blaue Kleid ist schön, aber " },
      { kind: "gap", gapIndex: 1 },
      { kind: "text", text: " Rock nicht." },
    ]);
    expect(countClozeGaps(blueDress.sentence)).toBe(2);
    expect(countClozeGaps("no gaps")).toBe(0);
  });

  it("fills gaps, keeping the marker for missing fills", () => {
    expect(fillClozeSentence(onTheTable.sentence, ["den"])).toBe(
      "Ich lege das Buch auf den Tisch.",
    );
    expect(fillClozeSentence(blueDress.sentence, ["Das"])).toBe(
      "Das blaue Kleid ist schön, aber ___ Rock nicht.",
    );
  });

  it("builds the correct sentence with the authored case", () => {
    expect(clozeCorrectSentence(blueDress)).toBe("Das blaue Kleid ist schön, aber der Rock nicht.");
  });
});

describe("ClozeExerciseSchema: valid (AC 1, 3, 8)", () => {
  it("is a registered exercise type", () => {
    expect(EXERCISE_TYPES).toContain("cloze");
  });

  it.each([
    ["a one-gap German sentence with audio", onTheTable],
    ["a two-gap German sentence", blueDress],
    ["a der/die/das gender choice", genderChoice],
  ])("accepts %s", (_label, exercise) => {
    expect(ExerciseSchema.parse(exercise)).toEqual(exercise);
  });

  it("accepts 2 and 4 options per gap", () => {
    expect(ClozeExerciseSchema.safeParse(onTheTable).success).toBe(true);
    expect(ClozeExerciseSchema.safeParse(blueDress).success).toBe(true);
  });

  it("allows the same option ids in different gaps", () => {
    expect(blueDress.gaps[0]!.options.map((o) => o.id)).toEqual(["der", "die", "das"]);
    expect(ClozeExerciseSchema.safeParse(blueDress).success).toBe(true);
  });

  it("accepts a sentence of exactly 80 characters with its longest options", () => {
    const sentence = `Ich lege das Buch auf ___ Tisch${".".repeat(80 - "Ich lege das Buch auf den Tisch".length)}`;
    expect(fillClozeSentence(sentence, ["den"])).toHaveLength(80);
    expect(ClozeExerciseSchema.safeParse({ ...onTheTable, sentence }).success).toBe(true);
  });

  it("accepts an option of 24 characters and a translation of 80", () => {
    const long = "a".repeat(CONTENT_RULES.clozeOptionMaxLength);
    const exercise = {
      ...genderChoice,
      translation: "t".repeat(CONTENT_RULES.clozeTranslationMaxLength),
      gaps: [
        {
          ...genderChoice.gaps[0]!,
          options: [...genderChoice.gaps[0]!.options, { id: "x", text: long }],
        },
      ],
    };
    expect(ClozeExerciseSchema.safeParse(exercise).success).toBe(true);
  });

  it("is valid inside a lesson next to other types", () => {
    const withCloze = { ...lesson, exercises: [...lesson.exercises, onTheTable] };
    expect(LessonSchema.safeParse(withCloze).success).toBe(true);
  });
});

describe("ClozeExerciseSchema: invalid (AC 1, 2)", () => {
  it("rejects a marker count that differs from gaps.length", () => {
    const oneMarkerTwoGaps = { ...onTheTable, gaps: [gap0, gap0] };
    const twoMarkersOneGap = { ...blueDress, gaps: [blueDress.gaps[0]] };
    const noMarker = { ...onTheTable, sentence: "Ich lege das Buch auf den Tisch." };
    expect(issues(ExerciseSchema.safeParse(oneMarkerTwoGaps))).toContain(
      "sentence has 1 gap marker(s) but gaps has 2 entries",
    );
    expect(issues(ExerciseSchema.safeParse(twoMarkersOneGap))).toContain(
      "sentence has 2 gap marker(s) but gaps has 1 entries",
    );
    expect(ExerciseSchema.safeParse(noMarker).success).toBe(false);
  });

  it("rejects 0 or more than 2 gaps", () => {
    expect(
      ExerciseSchema.safeParse({ ...onTheTable, sentence: "Kein Platz.", gaps: [] }).success,
    ).toBe(false);
    const three = { ...onTheTable, sentence: "___ und ___ und ___.", gaps: [gap0, gap0, gap0] };
    expect(ExerciseSchema.safeParse(three).success).toBe(false);
  });

  it("rejects malformed markers and stray underscores", () => {
    for (const sentence of ["auf ____ Tisch", "auf __ Tisch", "auf ___ Tisch_"]) {
      expect(ExerciseSchema.safeParse({ ...onTheTable, sentence }).success, sentence).toBe(false);
    }
  });

  it("rejects adjacent gaps and a sentence of gaps only", () => {
    const adjacent = { ...blueDress, sentence: "Das ______ Kleid." };
    const spaced = { ...blueDress, sentence: "Das ___ ___ Kleid." };
    const gapsOnly = { ...onTheTable, sentence: "___" };
    for (const exercise of [adjacent, spaced, gapsOnly]) {
      expect(issues(ExerciseSchema.safeParse(exercise))).toContain(
        "gaps must be separated by text and the sentence needs text besides its gaps",
      );
    }
  });

  it("rejects fewer than 2 or more than 4 options in a gap", () => {
    const one = { ...onTheTable, gaps: [{ ...gap0, options: gap0!.options.slice(0, 1) }] };
    const five = {
      ...onTheTable,
      gaps: [
        {
          options: ["dem", "den", "der", "die", "das"].map((t) => ({ id: t, text: t })),
          correctOptionId: "den",
        },
      ],
    };
    expect(ExerciseSchema.safeParse(one).success).toBe(false);
    expect(ExerciseSchema.safeParse(five).success).toBe(false);
  });

  it("rejects duplicate option ids within a gap", () => {
    const exercise = {
      ...onTheTable,
      gaps: [
        {
          ...gap0,
          options: [
            { id: "den", text: "dem" },
            { id: "den", text: "den" },
          ],
        },
      ],
    };
    expect(issues(ExerciseSchema.safeParse(exercise))).toContain('duplicate option id "den"');
  });

  it("rejects duplicate option texts within a gap, case-insensitively", () => {
    const exercise = {
      ...onTheTable,
      gaps: [
        {
          ...gap0,
          options: [
            { id: "a", text: "Den" },
            { id: "den", text: "den" },
          ],
        },
      ],
    };
    expect(issues(ExerciseSchema.safeParse(exercise))).toContain('duplicate option text "den"');
  });

  it("rejects a correctOptionId that is not an option of its gap", () => {
    const exercise = { ...onTheTable, gaps: [{ ...gap0, correctOptionId: "das" }] };
    expect(issues(ExerciseSchema.safeParse(exercise))).toContain(
      "correctOptionId must match one of the gap's option ids",
    );
  });

  it("rejects option texts over 24 characters, blank or with underscores", () => {
    for (const text of ["a".repeat(CONTENT_RULES.clozeOptionMaxLength + 1), "  ", "d_m"]) {
      const exercise = {
        ...onTheTable,
        gaps: [{ ...gap0, options: [gap0!.options[1], { id: "x", text }] }],
      };
      expect(ExerciseSchema.safeParse(exercise).success, text).toBe(false);
    }
  });

  it("rejects a sentence over 80 characters after filling the longest options (CDS-13)", () => {
    const base = "Ich lege das Buch auf den Tisch";
    const sentence = `Ich lege das Buch auf ___ Tisch${".".repeat(81 - base.length)}`;
    expect(issues(ExerciseSchema.safeParse({ ...onTheTable, sentence }))).toContain(
      "sentence is 81 characters with its longest options; max 80",
    );
  });

  it("rejects a translation over 80 characters or blank", () => {
    const long = { ...onTheTable, translation: "t".repeat(81) };
    expect(ExerciseSchema.safeParse(long).success).toBe(false);
    expect(ExerciseSchema.safeParse({ ...onTheTable, translation: " " }).success).toBe(false);
  });

  it("rejects unknown keys on the exercise, gap and option", () => {
    expect(ExerciseSchema.safeParse({ ...onTheTable, prompt: "x" }).success).toBe(false);
    expect(
      ExerciseSchema.safeParse({ ...onTheTable, gaps: [{ ...gap0, hint: "x" }] }).success,
    ).toBe(false);
    expect(
      ExerciseSchema.safeParse({
        ...onTheTable,
        gaps: [{ ...gap0, options: [{ id: "den", text: "den", lang: "de" }, gap0!.options[0]] }],
      }).success,
    ).toBe(false);
  });

  it("rejects a missing translation", () => {
    const rest: Partial<ClozeExercise> = { ...onTheTable };
    delete rest.translation;
    expect(ExerciseSchema.safeParse(rest).success).toBe(false);
  });
});

describe("cloze answer contract (AC 4, 6)", () => {
  it("accepts one option id per gap and rejects an empty or too long answer", () => {
    expect(AnswerInputSchema.safeParse({ type: "cloze", optionIds: ["das", "der"] }).success).toBe(
      true,
    );
    expect(AnswerInputSchema.safeParse({ type: "cloze", optionIds: [] }).success).toBe(false);
    expect(AnswerInputSchema.safeParse({ type: "cloze", optionIds: ["a", "b", "c"] }).success).toBe(
      false,
    );
  });

  it("pairs a cloze answer only with a cloze exercise", () => {
    const answer = { type: "cloze", optionIds: ["den"] };
    expect(AnswerCheckInputSchema.safeParse({ exercise: onTheTable, answer }).success).toBe(true);
    expect(
      AnswerCheckInputSchema.safeParse({
        exercise: onTheTable,
        answer: { type: "multiple_choice", optionId: "den" },
      }).success,
    ).toBe(false);
  });

  it("is correct only when every gap is right", () => {
    const result = checkClozeAnswer(blueDress, { type: "cloze", optionIds: ["das", "der"] });
    expect(result).toEqual({
      exerciseId: blueDress.id,
      outcome: "correct",
      correctAnswer: "Das blaue Kleid ist schön, aber der Rock nicht.",
      mistake: false,
      heartCost: 0,
      wrongGapIndexes: [],
    });
    expect(AnswerCheckResultSchema.safeParse(result).success).toBe(true);
  });

  it.each([
    [["der", "der"], [0]],
    [["das", "den"], [1]],
    [
      ["die", "die"],
      [0, 1],
    ],
    [["das"], [1]],
  ])("answer %j marks gaps %j wrong, 1 mistake and 1 heart", (optionIds, wrong) => {
    const result = checkClozeAnswer(blueDress, { type: "cloze", optionIds });
    expect(result).toMatchObject({
      outcome: "incorrect",
      mistake: true,
      heartCost: GAME_CONFIG.heartsLostPerMistake,
      wrongGapIndexes: wrong,
      correctAnswer: "Das blaue Kleid ist schön, aber der Rock nicht.",
    });
    expect(AnswerCheckResultSchema.safeParse(result).success).toBe(true);
  });

  it("checks the one-gap preposition and the gender choice", () => {
    expect(checkClozeAnswer(onTheTable, { type: "cloze", optionIds: ["den"] }).outcome).toBe(
      "correct",
    );
    expect(
      checkClozeAnswer(onTheTable, { type: "cloze", optionIds: ["dem"] }).wrongGapIndexes,
    ).toEqual([0]);
    expect(
      checkClozeAnswer(genderChoice, { type: "cloze", optionIds: ["der"] }).correctAnswer,
    ).toBe("der Tisch");
  });

  it("an extra id beyond the last gap is incorrect", () => {
    const result = checkClozeAnswer(onTheTable, { type: "cloze", optionIds: ["den", "den"] });
    expect(result.outcome).toBe("incorrect");
    expect(AnswerCheckResultSchema.safeParse(result).success).toBe(true);
  });

  it("the result schema keeps wrongGapIndexes consistent with the outcome", () => {
    const base = { exerciseId: "x", correctAnswer: "s" };
    expect(
      AnswerCheckResultSchema.safeParse({
        ...base,
        outcome: "correct",
        mistake: false,
        heartCost: 0,
        wrongGapIndexes: [0],
      }).success,
    ).toBe(false);
    expect(
      AnswerCheckResultSchema.safeParse({
        ...base,
        outcome: "incorrect",
        mistake: true,
        heartCost: 1,
        wrongGapIndexes: [],
      }).success,
    ).toBe(false);
  });
});
