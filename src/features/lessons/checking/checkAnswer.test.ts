import { describe, expect, it } from "vitest";
import {
  AnswerCheckResultSchema,
  ExerciseSchema,
  GAME_CONFIG,
  type AnswerCheckInput,
  type AnswerCheckResult,
  type Exercise,
  type ExerciseOfType,
} from "@/contracts";
import { checkAnswer, isMatchPairsComplete, joinTiles, matchesAcceptedAnswer } from "./index";

/** Parses fixtures with the content schema so tests only use valid content. */
function exercise<T extends Exercise>(value: T): T {
  return ExerciseSchema.parse(value) as T;
}

const multipleChoice = exercise({
  id: "mc-water",
  type: "multiple_choice",
  prompt: "Which one means “water”?",
  options: [
    { id: "a", text: "leche" },
    { id: "b", text: "Agua" },
    { id: "c", text: "pan" },
  ],
  correctOptionId: "b",
} satisfies ExerciseOfType<"multiple_choice">);

const translate = exercise({
  id: "wb-good-morning",
  type: "word_bank_translate",
  direction: "to_learning",
  prompt: "Good morning!",
  tiles: ["¡Buenos", "días!", "noches", "Buenas", "tardes"],
  answers: ["¡Buenos días!", "Buenas tardes"],
} satisfies ExerciseOfType<"word_bank_translate">);

const translateToKnown = exercise({
  id: "wb-im-ana",
  type: "word_bank_translate",
  direction: "to_known",
  prompt: "Me llamo Ana.",
  tiles: ["I'm", "Ana", "My", "name", "is", "Im"],
  answers: ["My name is Ana.", "I'm Ana."],
} satisfies ExerciseOfType<"word_bank_translate">);

const yesExercise = exercise({
  id: "wb-yes",
  type: "word_bank_translate",
  direction: "to_learning",
  prompt: "Yes, thank you.",
  tiles: ["Sí", "si", "gracias"],
  answers: ["Sí, gracias."],
} satisfies ExerciseOfType<"word_bank_translate">);

const listen = exercise({
  id: "ls-year",
  type: "listen",
  audio: { src: "/audio/es/ls-year.mp3" },
  tiles: ["Feliz", "año", "ano", "nuevo"],
  answers: ["¡Feliz año nuevo!"],
} satisfies ExerciseOfType<"listen">);

const pairs = [
  { id: "p1", learning: "gato", known: "cat" },
  { id: "p2", learning: "perro", known: "dog" },
  { id: "p3", learning: "agua", known: "water" },
  { id: "p4", learning: "pan", known: "bread" },
  { id: "p5", learning: "leche", known: "milk" },
];
const matchPairs = exercise({
  id: "mp-animals",
  type: "match_pairs",
  pairs,
} satisfies ExerciseOfType<"match_pairs">);
const allMatches = pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id }));

const speak = exercise({
  id: "sp-good-morning",
  type: "speak",
  phrase: "Buenos días",
  translation: "Good morning",
  acceptedTranscripts: ["buen día"],
} satisfies ExerciseOfType<"speak">);

/** Runs the checker and asserts the result satisfies the contract schema. */
function check(input: AnswerCheckInput): AnswerCheckResult {
  const result = checkAnswer(input);
  expect(AnswerCheckResultSchema.safeParse(result).success).toBe(true);
  return result;
}

function tiles(ex: typeof translate | typeof translateToKnown | typeof yesExercise, t: string[]) {
  return check({ exercise: ex, answer: { type: "word_bank_translate", tiles: t } });
}

function heard(t: string[]) {
  return check({ exercise: listen, answer: { type: "listen", tiles: t } });
}

const HEART = GAME_CONFIG.heartsLostPerMistake;

describe("checkAnswer: multiple choice (AC3)", () => {
  it("is correct only for the correct option", () => {
    expect(
      check({ exercise: multipleChoice, answer: { type: "multiple_choice", optionId: "b" } }),
    ).toEqual({
      exerciseId: "mc-water",
      outcome: "correct",
      mistake: false,
      correctAnswer: "Agua",
      heartCost: 0,
    });
  });

  it.each(["a", "c", "zz"])("is incorrect for option %s and costs a heart", (optionId) => {
    expect(
      check({ exercise: multipleChoice, answer: { type: "multiple_choice", optionId } }),
    ).toEqual({
      exerciseId: "mc-water",
      outcome: "incorrect",
      mistake: true,
      correctAnswer: "Agua",
      heartCost: HEART,
    });
  });
});

describe("checkAnswer: translate with word bank (AC4–AC7)", () => {
  it("joins ordered tiles and matches the first accepted answer", () => {
    expect(tiles(translate, ["¡Buenos", "días!"])).toEqual({
      exerciseId: "wb-good-morning",
      outcome: "correct",
      mistake: false,
      correctAnswer: "¡Buenos días!",
      heartCost: 0,
    });
  });

  it("accepts the second accepted answer, still showing the first as canonical", () => {
    const result = tiles(translate, ["Buenas", "tardes"]);
    expect(result.outcome).toBe("correct");
    expect(result.correctAnswer).toBe("¡Buenos días!");
  });

  it("ignores letter case", () => {
    expect(tiles(translate, ["¡BUENOS", "DÍAS!"]).outcome).toBe("correct");
    expect(tiles(translate, ["buenas", "TARDES"]).outcome).toBe("correct");
  });

  it("ignores punctuation (¡Hola! vs hola)", () => {
    expect(tiles(translate, ["Buenos", "días"]).outcome).toBe("correct");
    expect(tiles(translateToKnown, ["My", "name", "is", "Ana"]).outcome).toBe("correct");
  });

  it("ignores leading, trailing and repeated whitespace", () => {
    expect(tiles(translate, ["  ¡Buenos ", "", "   días!  "]).outcome).toBe("correct");
    expect(tiles(translate, ["\tBuenas\n", "tardes "]).outcome).toBe("correct");
  });

  it("treats a multi-word tile the same as single-word tiles", () => {
    expect(tiles(translate, ["Buenos días"]).outcome).toBe("correct");
  });

  it("tile order matters (buenos días vs días buenos)", () => {
    expect(tiles(translate, ["días!", "¡Buenos"])).toEqual({
      exerciseId: "wb-good-morning",
      outcome: "incorrect",
      mistake: true,
      correctAnswer: "¡Buenos días!",
      heartCost: HEART,
    });
  });

  it("accents are significant (si ≠ sí)", () => {
    expect(tiles(yesExercise, ["si", "gracias"]).outcome).toBe("incorrect");
    expect(tiles(yesExercise, ["Sí", "gracias"]).outcome).toBe("correct");
  });

  it("keeps apostrophes inside English words (I'm ≠ Im)", () => {
    expect(tiles(translateToKnown, ["I'm", "Ana"]).outcome).toBe("correct");
    expect(tiles(translateToKnown, ["Im", "Ana"]).outcome).toBe("incorrect");
  });

  it("treats a curly apostrophe like a straight one", () => {
    expect(tiles(translateToKnown, ["I’m", "Ana"]).outcome).toBe("correct");
  });

  it("an empty answer is incorrect", () => {
    expect(tiles(translate, [])).toMatchObject({
      outcome: "incorrect",
      mistake: true,
      heartCost: HEART,
    });
    expect(tiles(translate, ["", "  "]).outcome).toBe("incorrect");
  });

  it("missing or extra words are incorrect", () => {
    expect(tiles(translate, ["Buenos"]).outcome).toBe("incorrect");
    expect(tiles(translate, ["Buenos", "días", "noches"]).outcome).toBe("incorrect");
  });
});

describe("checkAnswer: listen (AC4–AC7)", () => {
  it("is correct for the heard sentence regardless of case and punctuation", () => {
    expect(heard(["feliz", "año", "nuevo"])).toEqual({
      exerciseId: "ls-year",
      outcome: "correct",
      mistake: false,
      correctAnswer: "¡Feliz año nuevo!",
      heartCost: 0,
    });
  });

  it("ñ is significant (ano ≠ año)", () => {
    expect(heard(["Feliz", "ano", "nuevo"])).toMatchObject({
      outcome: "incorrect",
      mistake: true,
      heartCost: HEART,
    });
  });

  it("tile order matters", () => {
    expect(heard(["Feliz", "nuevo", "año"]).outcome).toBe("incorrect");
  });

  it("an empty answer is incorrect", () => {
    expect(heard([]).outcome).toBe("incorrect");
  });
});

describe("checkAnswer: match pairs (AC8)", () => {
  it("is correct when every pair is matched, in any order", () => {
    expect(
      check({
        exercise: matchPairs,
        answer: { type: "match_pairs", matches: [...allMatches].reverse(), mismatchCount: 0 },
      }),
    ).toEqual({
      exerciseId: "mp-animals",
      outcome: "correct",
      mistake: false,
      correctAnswer: null,
      heartCost: 0,
    });
  });

  it.each([
    ["no matches", []],
    ["a missing pair", allMatches.slice(0, 4)],
    [
      "a wrong match",
      [
        ...allMatches.slice(0, 3),
        { learningPairId: "p4", knownPairId: "p5" },
        { learningPairId: "p5", knownPairId: "p4" },
      ],
    ],
    ["a duplicated pair", [...allMatches.slice(0, 4), allMatches[0]!]],
    [
      "an unknown pair id",
      [...allMatches.slice(0, 4), { learningPairId: "p9", knownPairId: "p9" }],
    ],
    ["an extra match", [...allMatches, allMatches[0]!]],
  ])("is incorrect with %s", (_label, matches) => {
    expect(
      check({ exercise: matchPairs, answer: { type: "match_pairs", matches, mismatchCount: 0 } }),
    ).toEqual({
      exerciseId: "mp-animals",
      outcome: "incorrect",
      mistake: true,
      correctAnswer: null,
      heartCost: HEART,
    });
  });

  it("counts any mismatch as one mistake costing one heart, still correct (PD-012)", () => {
    for (const mismatchCount of [1, 3]) {
      expect(
        check({
          exercise: matchPairs,
          answer: { type: "match_pairs", matches: allMatches, mismatchCount },
        }),
      ).toEqual({
        exerciseId: "mp-animals",
        outcome: "correct",
        mistake: true,
        correctAnswer: null,
        heartCost: HEART,
      });
    }
  });

  it("an incomplete board is one mistake and one heart, whatever the mismatch count", () => {
    expect(
      check({
        exercise: matchPairs,
        answer: { type: "match_pairs", matches: allMatches.slice(0, 4), mismatchCount: 4 },
      }),
    ).toMatchObject({ outcome: "incorrect", mistake: true, heartCost: HEART });
  });

  it("isMatchPairsComplete is exported for the player", () => {
    expect(
      isMatchPairsComplete(matchPairs, {
        type: "match_pairs",
        matches: allMatches,
        mismatchCount: 0,
      }),
    ).toBe(true);
  });
});

describe("checkAnswer: speak", () => {
  const say = (transcripts: string[]) =>
    check({ exercise: speak, answer: { type: "speak", skipped: false, transcripts } });

  it("is skipped (no heart) when the learner skips", () => {
    expect(
      check({ exercise: speak, answer: { type: "speak", skipped: true, transcripts: [] } }),
    ).toEqual({
      exerciseId: "sp-good-morning",
      outcome: "skipped",
      mistake: false,
      correctAnswer: "Buenos días",
      heartCost: 0,
    });
  });

  it("is correct when any transcript matches, ignoring accents for speech", () => {
    expect(say(["buenos dias"]).outcome).toBe("correct");
    expect(say(["bueno vías", "Buenos días."]).outcome).toBe("correct");
    expect(say(["Buen día"]).outcome).toBe("correct");
  });

  it("is incorrect without costing a heart", () => {
    expect(say(["buenas noches"])).toEqual({
      exerciseId: "sp-good-morning",
      outcome: "incorrect",
      mistake: true,
      correctAnswer: "Buenos días",
      heartCost: 0,
    });
    expect(say(["", "  ?! "]).outcome).toBe("incorrect");
  });

  it("works without acceptedTranscripts", () => {
    const plain = exercise({
      id: "sp-hola",
      type: "speak",
      phrase: "¡Hola!",
      translation: "Hello!",
    });
    const result = check({
      exercise: plain,
      answer: { type: "speak", skipped: false, transcripts: ["hola"] },
    });
    expect(result.outcome).toBe("correct");
  });
});

describe("checkAnswer: contract guarantees (AC1, AC2, AC9)", () => {
  it("throws on an answer whose type differs from the exercise type", () => {
    const answers = [
      { type: "word_bank_translate", tiles: [] },
      { type: "multiple_choice", optionId: "a" },
      { type: "multiple_choice", optionId: "a" },
      { type: "multiple_choice", optionId: "a" },
      { type: "multiple_choice", optionId: "a" },
    ] as const;
    const exercises = [multipleChoice, translate, listen, matchPairs, speak];
    exercises.forEach((ex, i) => {
      const input = { exercise: ex, answer: answers[i] } as unknown as AnswerCheckInput;
      expect(() => checkAnswer(input)).toThrow(TypeError);
    });
  });

  it("throws for an exercise type it does not know (runtime exhaustiveness)", () => {
    const input = {
      exercise: { id: "x", type: "unknown" },
      answer: { type: "unknown" },
    } as unknown as AnswerCheckInput;
    expect(() => checkAnswer(input)).toThrow(/Unhandled exercise type/);
  });

  it("does not mutate its input and is deterministic", () => {
    const input: AnswerCheckInput = {
      exercise: structuredClone(translate),
      answer: { type: "word_bank_translate", tiles: ["días!", "¡Buenos"] },
    };
    const snapshot = structuredClone(input);
    const first = checkAnswer(input);
    expect(checkAnswer(input)).toEqual(first);
    expect(input).toEqual(snapshot);
  });
});

describe("helpers", () => {
  it("joinTiles keeps the learner's order", () => {
    expect(joinTiles(["días", "Buenos"])).toBe("días Buenos");
  });

  it.each([
    ["Hola", ["hola"], true],
    ["¡Hola!", ["hola"], true],
    ["  hola   amigo ", ["Hola, amigo."], true],
    ["«Hola» — amigo…", ["hola amigo"], true],
    ['"Hola" “amigo”', ["hola amigo"], true],
    ["¿Qué tal?; bien: sí", ["que tal bien si"], false],
    ["¿Qué tal?; bien: sí", ["qué tal bien sí"], true],
    ["ano", ["año"], false],
    ["Im", ["I'm"], false],
    ["", ["hola"], false],
    ["...", ["..."], false],
    ["adiós", ["hola", "adiós"], true],
  ] as const)("matchesAcceptedAnswer(%j, %j) = %s", (given, accepted, expected) => {
    expect(matchesAcceptedAnswer(given, accepted)).toBe(expected);
  });
});
