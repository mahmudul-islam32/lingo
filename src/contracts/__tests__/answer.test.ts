import { describe, expect, it } from "vitest";
import { AnswerCheckInputSchema, AnswerCheckResultSchema, AnswerInputSchema } from "../index";
import { matchPairs, multipleChoice } from "./fixtures";

describe("AnswerInputSchema", () => {
  it.each([
    { type: "multiple_choice", optionId: "a" },
    { type: "word_bank_translate", tiles: ["Buenos", "días"] },
    { type: "match_pairs", matches: [{ learningPairId: "p1", knownPairId: "p1" }] },
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
  it("accepts an incorrect answer that costs a heart", () => {
    const result = {
      exerciseId: "ex-1",
      outcome: "incorrect",
      correctAnswer: "agua",
      heartCost: 1,
    };
    expect(AnswerCheckResultSchema.safeParse(result).success).toBe(true);
  });

  it("rejects a heart cost on a correct or skipped answer", () => {
    for (const outcome of ["correct", "skipped"]) {
      const result = { exerciseId: "ex-1", outcome, correctAnswer: null, heartCost: 1 };
      expect(AnswerCheckResultSchema.safeParse(result).success).toBe(false);
    }
  });
});
