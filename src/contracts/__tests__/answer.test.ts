import { describe, expect, it } from "vitest";
import { AnswerCheckInputSchema, AnswerCheckResultSchema, AnswerInputSchema } from "../index";
import { matchPairs, multipleChoice } from "./fixtures";

describe("AnswerInputSchema", () => {
  it.each([
    { type: "multiple_choice", optionId: "a" },
    { type: "word_bank_translate", tiles: ["Buenos", "días"] },
    {
      type: "match_pairs",
      matches: [{ learningPairId: "p1", knownPairId: "p1" }],
      mismatchCount: 0,
    },
    { type: "listen", tiles: ["Me", "llamo", "Ana"] },
    { type: "speak", skipped: false, transcripts: ["buenos días"] },
    { type: "speak", skipped: true, transcripts: [] },
  ])("accepts $type", (answer) => {
    expect(AnswerInputSchema.safeParse(answer).success).toBe(true);
  });

  it("rejects a skipped speak answer with transcripts, and a spoken one without", () => {
    expect(
      AnswerInputSchema.safeParse({ type: "speak", skipped: true, transcripts: ["hola"] }).success,
    ).toBe(false);
    expect(
      AnswerInputSchema.safeParse({ type: "speak", skipped: false, transcripts: [] }).success,
    ).toBe(false);
  });

  it("requires a non-negative integer mismatchCount on match pairs (CR-001)", () => {
    const matches = [{ learningPairId: "p1", knownPairId: "p1" }];
    for (const mismatchCount of [undefined, -1, 1.5]) {
      expect(
        AnswerInputSchema.safeParse({ type: "match_pairs", matches, mismatchCount }).success,
      ).toBe(false);
    }
  });

  it("rejects a variant with the wrong payload", () => {
    expect(AnswerInputSchema.safeParse({ type: "multiple_choice", tiles: [] }).success).toBe(false);
  });
});

describe("AnswerCheckInputSchema", () => {
  it("accepts a matching exercise/answer pair", () => {
    const input = { exercise: multipleChoice, answer: { type: "multiple_choice", optionId: "b" } };
    expect(AnswerCheckInputSchema.safeParse(input).success).toBe(true);
  });

  it("rejects an answer of a different type than the exercise", () => {
    const input = { exercise: matchPairs, answer: { type: "multiple_choice", optionId: "a" } };
    expect(AnswerCheckInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("AnswerCheckResultSchema", () => {
  const base = { exerciseId: "ex-1", correctAnswer: null };

  it.each([
    [
      "an incorrect answer that costs a heart",
      { outcome: "incorrect", mistake: true, heartCost: 1 },
    ],
    ["an incorrect speak answer (no heart)", { outcome: "incorrect", mistake: true, heartCost: 0 }],
    ["a clean correct answer", { outcome: "correct", mistake: false, heartCost: 0 }],
    ["correct match pairs with a mismatch", { outcome: "correct", mistake: true, heartCost: 1 }],
    ["a skipped speak answer", { outcome: "skipped", mistake: false, heartCost: 0 }],
  ])("accepts %s", (_label, fields) => {
    expect(AnswerCheckResultSchema.safeParse({ ...base, ...fields }).success).toBe(true);
  });

  it.each([
    ["a heart cost without a mistake", { outcome: "correct", mistake: false, heartCost: 1 }],
    ["a skipped answer that is a mistake", { outcome: "skipped", mistake: true, heartCost: 0 }],
    ["a skipped answer that costs a heart", { outcome: "skipped", mistake: false, heartCost: 1 }],
    [
      "an incorrect answer that is not a mistake",
      { outcome: "incorrect", mistake: false, heartCost: 0 },
    ],
    ["a missing mistake flag", { outcome: "correct", heartCost: 0 }],
  ])("rejects %s", (_label, fields) => {
    expect(AnswerCheckResultSchema.safeParse({ ...base, ...fields }).success).toBe(false);
  });
});
