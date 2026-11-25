import { describe, expect, it } from "vitest";
import { ExerciseSchema, type ExerciseOfType } from "@/contracts";
import { checkAnswer } from "./index";

const choice = ExerciseSchema.parse({
  id: "ch-1",
  type: "choice",
  prompt: "Wer wählt den Bundeskanzler?",
  options: [
    { id: "a", text: "der Bundestag" },
    { id: "b", text: "das Volk" },
  ],
  correctOptionId: "a",
}) as ExerciseOfType<"choice">;

const listening = { ...choice, id: "li-1", type: "listening", transcript: "Hallo." } as const;

describe("checkAnswer · exam types (TELC-001)", () => {
  it("grades choice like multiple choice", () => {
    expect(
      checkAnswer({ exercise: choice, answer: { type: "choice", optionId: "a" } }),
    ).toMatchObject({
      outcome: "correct",
      heartCost: 0,
      correctAnswer: "der Bundestag",
    });
    expect(
      checkAnswer({ exercise: choice, answer: { type: "choice", optionId: "b" } }),
    ).toMatchObject({
      outcome: "incorrect",
      mistake: true,
      heartCost: 1,
    });
  });

  it("grades listening by option", () => {
    const result = checkAnswer({
      exercise: ExerciseSchema.parse(listening),
      answer: { type: "listening", optionId: "b" },
    });
    expect(result.outcome).toBe("incorrect");
  });

  it("never grades task or explain", () => {
    const task = ExerciseSchema.parse({
      id: "t-1",
      type: "task",
      skill: "speaking",
      title: "Thema",
      task: "Sprechen Sie.",
      modelAnswer: "Ich finde …",
    });
    const explain = ExerciseSchema.parse({ id: "e-1", type: "explain", title: "T", body: "B" });
    for (const [exercise, answer] of [
      [task, { type: "task", text: "" }],
      [explain, { type: "explain" }],
    ] as const) {
      expect(checkAnswer({ exercise, answer })).toEqual({
        exerciseId: exercise.id,
        outcome: "correct",
        correctAnswer: null,
        mistake: false,
        heartCost: 0,
      });
    }
  });

  it("rejects a mismatched answer type", () => {
    expect(() =>
      checkAnswer({ exercise: choice, answer: { type: "listening", optionId: "a" } }),
    ).toThrow(TypeError);
  });
});
