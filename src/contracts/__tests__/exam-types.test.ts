// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  ExerciseSchema,
  LessonSchema,
  isUngradedExerciseType,
  parseRichText,
  richTextToPlain,
} from "../index";

describe("rich text (TELC-001)", () => {
  it("parses paragraphs, line breaks, lists, headings, bold and italic", () => {
    const blocks = parseRichText("## Title\n\nOne **bold** and *it*\nnext line\n\n- a\n- b");
    expect(blocks.map((b) => b.kind)).toEqual(["heading", "paragraph", "list"]);
    const paragraph = blocks[1]!;
    expect(paragraph.kind === "paragraph" && paragraph.lines).toEqual([
      [
        { kind: "text", text: "One " },
        { kind: "bold", text: "bold" },
        { kind: "text", text: " and " },
        { kind: "italic", text: "it" },
      ],
      [{ kind: "text", text: "next line" }],
    ]);
    expect(richTextToPlain("**A**\n\n- b")).toBe("A\n\nb");
  });

  it("keeps a lone asterisk as text", () => {
    expect(richTextToPlain("5 * 3 = 15")).toBe("5 * 3 = 15");
  });
});

describe("exam exercise types (TELC-001)", () => {
  const options = [
    { id: "a", text: "richtig" },
    { id: "b", text: "falsch" },
  ];

  it("accepts choice with a passage and 2 options, and an explanation", () => {
    const parsed = ExerciseSchema.safeParse({
      id: "c1",
      type: "choice",
      passage: "Ein Text.",
      prompt: "Stimmt das?",
      options,
      correctOptionId: "a",
      explanation: "Because **reasons**.",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a choice whose correct option is missing or texts repeat", () => {
    expect(
      ExerciseSchema.safeParse({
        id: "c1",
        type: "choice",
        prompt: "?",
        options,
        correctOptionId: "z",
      }).success,
    ).toBe(false);
    expect(
      ExerciseSchema.safeParse({
        id: "c1",
        type: "choice",
        prompt: "?",
        options: [options[0], { id: "b", text: "Richtig" }],
        correctOptionId: "a",
      }).success,
    ).toBe(false);
  });

  it("accepts listening, task and explain", () => {
    for (const exercise of [
      {
        id: "l1",
        type: "listening",
        transcript: "A: Hallo.",
        prompt: "?",
        options,
        correctOptionId: "b",
      },
      {
        id: "t1",
        type: "task",
        skill: "writing",
        title: "Brief",
        task: "Schreiben Sie.",
        points: ["Grund"],
        modelAnswer: "Liebe Anna, …",
      },
      {
        id: "e1",
        type: "explain",
        title: "Rule",
        body: "Verb **second**.",
        examples: [{ learning: "Ich gehe.", known: "I go." }],
      },
    ]) {
      expect(ExerciseSchema.safeParse(exercise).error?.issues ?? []).toEqual([]);
    }
  });

  it("allows lessons of up to 40 exercises (mock exams)", () => {
    const exercises = Array.from({ length: 33 }, (_, i) => ({
      id: `q${i}`,
      type: "choice",
      prompt: "?",
      options,
      correctOptionId: "a",
    }));
    expect(
      LessonSchema.safeParse({ id: "m", courseId: "c", unitId: "u", title: "Mock", exercises })
        .success,
    ).toBe(true);
  });

  it("marks task and explain as ungraded", () => {
    expect(isUngradedExerciseType("task")).toBe(true);
    expect(isUngradedExerciseType("explain")).toBe(true);
    expect(isUngradedExerciseType("choice")).toBe(false);
  });
});
