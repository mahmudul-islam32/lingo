import { describe, expect, it } from "vitest";
import {
  CourseSchema,
  ExerciseSchema,
  isBuildableFromTiles,
  LessonSchema,
  type Exercise,
} from "../index";
import { course, lesson, listen, matchPairs, multipleChoice, speak, wordBank } from "./fixtures";

function issues(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  return result.error?.issues.map((i) => i.message) ?? [];
}

describe("ExerciseSchema", () => {
  it.each([multipleChoice, wordBank, matchPairs, listen, speak] satisfies Exercise[])(
    "accepts a valid $type exercise",
    (exercise) => {
      expect(ExerciseSchema.parse(exercise)).toEqual(exercise);
    },
  );

  it("rejects an unknown exercise type", () => {
    expect(ExerciseSchema.safeParse({ ...multipleChoice, type: "fill_blank" }).success).toBe(false);
  });

  it("rejects unknown keys (strict content schemas catch typos)", () => {
    expect(ExerciseSchema.safeParse({ ...multipleChoice, promt: "typo" }).success).toBe(false);
  });

  it("rejects a non-slug id", () => {
    expect(ExerciseSchema.safeParse({ ...multipleChoice, id: "Ex 1" }).success).toBe(false);
  });

  describe("multiple_choice", () => {
    it("rejects fewer than 3 or more than 4 options", () => {
      const two = { ...multipleChoice, options: multipleChoice.options.slice(0, 2) };
      const five = {
        ...multipleChoice,
        options: [...multipleChoice.options, { id: "d", text: "café" }, { id: "e", text: "té" }],
      };
      expect(ExerciseSchema.safeParse(two).success).toBe(false);
      expect(ExerciseSchema.safeParse(five).success).toBe(false);
    });

    it("rejects a correctOptionId that is not an option", () => {
      const result = ExerciseSchema.safeParse({ ...multipleChoice, correctOptionId: "z" });
      expect(issues(result)).toContain("correctOptionId must match one of the option ids");
    });

    it("rejects duplicate option ids and texts", () => {
      const dupId = {
        ...multipleChoice,
        options: [...multipleChoice.options.slice(0, 2), { id: "a", text: "sal" }],
      };
      const dupText = {
        ...multipleChoice,
        options: [...multipleChoice.options.slice(0, 2), { id: "c", text: "Agua" }],
      };
      expect(ExerciseSchema.safeParse(dupId).success).toBe(false);
      expect(ExerciseSchema.safeParse(dupText).success).toBe(false);
    });

    it("rejects an empty prompt", () => {
      expect(ExerciseSchema.safeParse({ ...multipleChoice, prompt: "   " }).success).toBe(false);
    });
  });

  describe("word_bank_translate", () => {
    it("rejects an answer that cannot be built from the tiles", () => {
      const result = ExerciseSchema.safeParse({ ...wordBank, answers: ["Buenas tardes"] });
      expect(result.success).toBe(false);
      expect(issues(result)[0]).toMatch(/cannot be built from the tiles/);
    });

    it("respects tile multiplicity", () => {
      expect(isBuildableFromTiles("la casa la", ["la", "casa"])).toBe(false);
      expect(isBuildableFromTiles("la casa la", ["la", "casa", "la"])).toBe(true);
    });

    it("rejects an empty answers list and an invalid direction", () => {
      expect(ExerciseSchema.safeParse({ ...wordBank, answers: [] }).success).toBe(false);
      expect(ExerciseSchema.safeParse({ ...wordBank, direction: "es_en" }).success).toBe(false);
    });

    it("rejects too many tiles", () => {
      const tiles = Array.from({ length: 17 }, (_, i) => `w${i}`);
      expect(ExerciseSchema.safeParse({ ...wordBank, tiles, answers: ["w1"] }).success).toBe(false);
    });
  });

  describe("match_pairs", () => {
    it("requires exactly 5 pairs", () => {
      const four = { ...matchPairs, pairs: matchPairs.pairs.slice(0, 4) };
      expect(ExerciseSchema.safeParse(four).success).toBe(false);
    });

    it("rejects ambiguous duplicate words", () => {
      const pairs = matchPairs.pairs.map((p, i) => (i === 4 ? { ...p, known: "Cat" } : p));
      const result = ExerciseSchema.safeParse({ ...matchPairs, pairs });
      expect(issues(result)[0]).toMatch(/duplicate known word "cat"/);
    });
  });

  describe("listen", () => {
    it("requires audio", () => {
      expect(ExerciseSchema.safeParse({ ...listen, audio: undefined }).success).toBe(false);
    });

    it("rejects audio paths outside /audio", () => {
      const bad = { ...listen, audio: { src: "https://example.com/a.mp3" } };
      expect(ExerciseSchema.safeParse(bad).success).toBe(false);
    });
  });

  describe("speak", () => {
    it("accepts a phrase without audio", () => {
      expect(ExerciseSchema.safeParse({ ...speak, audio: undefined }).success).toBe(true);
    });

    it("rejects a missing translation", () => {
      expect(ExerciseSchema.safeParse({ ...speak, translation: undefined }).success).toBe(false);
    });
  });
});

describe("LessonSchema", () => {
  it("accepts a valid lesson", () => {
    expect(LessonSchema.parse(lesson)).toEqual(lesson);
  });

  it("rejects duplicate exercise ids", () => {
    const bad = { ...lesson, exercises: [multipleChoice, { ...wordBank, id: "ex-1" }] };
    expect(issues(LessonSchema.safeParse(bad))).toContain('duplicate exercise id "ex-1"');
  });

  it("rejects a lesson made only of speak exercises", () => {
    const bad = { ...lesson, exercises: [speak] };
    expect(LessonSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an empty lesson and an over-long tip", () => {
    expect(LessonSchema.safeParse({ ...lesson, exercises: [] }).success).toBe(false);
    expect(LessonSchema.safeParse({ ...lesson, tip: "x".repeat(201) }).success).toBe(false);
  });

  it("reports the path of a nested invalid exercise", () => {
    const bad = { ...lesson, exercises: [{ ...multipleChoice, correctOptionId: "z" }] };
    const result = LessonSchema.safeParse(bad);
    expect(result.error?.issues[0]?.path).toEqual(["exercises", 0, "correctOptionId"]);
  });
});

describe("CourseSchema", () => {
  it("accepts a valid course", () => {
    expect(CourseSchema.parse(course)).toEqual(course);
  });

  it("rejects same learning and known language", () => {
    expect(CourseSchema.safeParse({ ...course, knownLanguage: "es" }).success).toBe(false);
  });

  it("rejects duplicate lesson ids across units", () => {
    const unit2 = { id: "unit-2", title: "More", lessons: [{ id: "greetings-1", title: "Again" }] };
    const result = CourseSchema.safeParse({ ...course, units: [...course.units, unit2] });
    expect(issues(result)).toContain('duplicate lesson id "greetings-1"');
  });

  it("rejects an invalid language tag and a non-positive version", () => {
    expect(CourseSchema.safeParse({ ...course, learningLanguage: "Spanish" }).success).toBe(false);
    expect(CourseSchema.safeParse({ ...course, version: 0 }).success).toBe(false);
  });
});
