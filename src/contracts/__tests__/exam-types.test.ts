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

  it("accepts a choice with a figure of 1–4 images (TELC-005)", () => {
    const image = (n: number) => ({ src: `/images/eb/q21-bild-${n}.png`, alt: `Picture ${n}` });
    const base = { id: "c1", type: "choice", prompt: "Welches?", options, correctOptionId: "a" };
    expect(
      ExerciseSchema.safeParse({
        ...base,
        figure: {
          images: [1, 2, 3, 4].map((n) => ({ ...image(n), label: `Bild ${n}` })),
          credit: "BAMF",
        },
      }).success,
    ).toBe(true);
    expect(ExerciseSchema.safeParse({ ...base, figure: { images: [image(1)] } }).success).toBe(
      true,
    );
  });

  it("rejects a figure with no or too many images, a bad path, an empty alt or extra keys", () => {
    const base = { id: "c1", type: "choice", prompt: "Welches?", options, correctOptionId: "a" };
    const ok = { src: "/images/eb/q55.jpg", alt: "A building" };
    for (const figure of [
      { images: [] },
      { images: [ok, ok, ok, ok, ok] },
      { images: [{ ...ok, src: "https://example.com/x.jpg" }] },
      { images: [{ ...ok, src: "/audio/x.mp3" }] },
      { images: [{ ...ok, alt: " " }] },
      { images: [ok], caption: "extra" },
    ]) {
      expect(ExerciseSchema.safeParse({ ...base, figure }).success).toBe(false);
    }
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

describe("telc B1 course levels (TELC-003)", () => {
  it("declares A1, A2, B1 and tags the A1/A2 vocabulary units", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { CourseSchema, groupUnitsByLevel } = await import("../index");
    const course = CourseSchema.parse(
      JSON.parse(
        readFileSync(join(process.cwd(), "content/courses/telc-b1-en-de/course.json"), "utf8"),
      ),
    );
    const groups = groupUnitsByLevel(course);
    expect(groups.map((g) => [g.level.level, g.units.length])).toEqual([
      ["A1", 4],
      ["A2", 5],
      ["B1", 62],
    ]);
    expect(groups[2]!.units[0]!.id).toBe("tb1-u01");
  });
});
