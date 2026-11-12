import { describe, expect, it } from "vitest";
import {
  CEFR_LEVELS,
  CefrLevelSchema,
  cefrLevelIndex,
  CONTENT_RULES,
  CourseSchema,
  ExerciseSchema,
  flattenCourseLessons,
  groupUnitsByLevel,
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
      const tiles = Array.from({ length: CONTENT_RULES.wordBankMaxTiles + 1 }, (_, i) => `w${i}`);
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
    expect(
      LessonSchema.safeParse({ ...lesson, tip: "x".repeat(CONTENT_RULES.lessonTipMaxLength + 1) })
        .success,
    ).toBe(false);
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

describe("CEFR levels (CTO-008, ADR-008)", () => {
  const unit = (id: string, level?: string) => ({
    id,
    title: `Unit ${id}`,
    ...(level ? { level } : {}),
    lessons: [{ id: `${id}-l1`, title: "Lesson" }],
  });
  const lvl = (level: string): { level: string; title: string; description?: string } => ({
    level,
    title: `${level} · Title`,
  });
  const german = (levels: string[] | undefined, units: ReturnType<typeof unit>[]) => ({
    id: "en-de",
    title: "German",
    learningLanguage: "de",
    knownLanguage: "en",
    version: 1,
    ...(levels ? { levels: levels.map(lvl) } : {}),
    units,
  });
  const parse = (value: unknown) => CourseSchema.safeParse(value);

  it("lists the six CEFR levels in order", () => {
    expect(CEFR_LEVELS).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"]);
    expect(cefrLevelIndex("B1")).toBe(2);
    expect(CefrLevelSchema.safeParse("a1").success).toBe(false);
  });

  it("keeps courses without levels valid (backward compatible with en-es)", () => {
    expect(parse(course).success).toBe(true);
    expect(groupUnitsByLevel(course)).toEqual([]);
  });

  it("accepts levels with titles and descriptions, and a level with no units yet", () => {
    const value = german(["A1", "A2"], [unit("a1-u1", "A1"), unit("a1-u2", "A1")]);
    value.levels![0] = { level: "A1", title: "A1 · Beginner", description: "Basics." };
    const result = parse(value);
    expect(issues(result)).toEqual([]);
    const groups = groupUnitsByLevel(result.data!);
    expect(groups.map((g) => [g.level.level, g.units.map((u) => u.id)])).toEqual([
      ["A1", ["a1-u1", "a1-u2"]],
      ["A2", []],
    ]);
  });

  it("validates level titles and descriptions", () => {
    const value = german(["A1"], [unit("u1", "A1")]);
    expect(parse({ ...value, levels: [{ level: "A1", title: "" }] }).success).toBe(false);
    expect(
      parse({ ...value, levels: [{ level: "A1", title: "A1", description: "x".repeat(281) }] })
        .success,
    ).toBe(false);
    expect(parse({ ...value, levels: [{ level: "A1", title: "A1", extra: 1 }] }).success).toBe(
      false,
    );
  });

  it("rejects levels out of CEFR order and a level declared twice", () => {
    expect(issues(parse(german(["A2", "A1"], [unit("u1", "A1")])))).toContain(
      "levels must be in CEFR order (A1, A2, B1, B2, C1, C2)",
    );
    expect(issues(parse(german(["A1", "A1"], [unit("u1", "A1")])))).toContain(
      "level A1 is declared twice",
    );
  });

  it("puts every unit in exactly one declared level", () => {
    // `Unit.level` is a single value, so a unit can't sit in two levels by construction;
    // the same unit listed twice is a duplicate unit id.
    expect(issues(parse(german(["A1", "A2"], [unit("u1", "A1"), unit("u1", "A2")])))).toContain(
      'duplicate unit id "u1"',
    );
    expect(issues(parse(german(["A1"], [unit("u1")])))).toContain(
      "every unit needs a level when the course declares levels",
    );
    expect(issues(parse(german(["A1"], [unit("u1", "B1")])))).toContain(
      "unit level B1 is not one of the course levels",
    );
    expect(issues(parse(german(undefined, [unit("u1", "A1")])))).toContain(
      "unit has a level but the course declares no levels",
    );
  });

  it("requires units grouped by level in CEFR order", () => {
    const result = parse(
      german(["A1", "A2"], [unit("u1", "A1"), unit("u2", "A2"), unit("u3", "A1")]),
    );
    expect(issues(result)).toContain("units must be grouped by level in CEFR order");
  });

  it("flattens lessons in path order across two levels", () => {
    const twoLevels = CourseSchema.parse({
      ...german(["A1", "A2"], []),
      units: [
        {
          id: "a1-u1",
          level: "A1",
          title: "U",
          lessons: [
            { id: "a", title: "A" },
            { id: "b", title: "B" },
          ],
        },
        { id: "a2-u1", level: "A2", title: "U", lessons: [{ id: "c", title: "C" }] },
      ],
    });
    expect(flattenCourseLessons(twoLevels).map((e) => [e.level, e.unit.id, e.lesson.id])).toEqual([
      ["A1", "a1-u1", "a"],
      ["A1", "a1-u1", "b"],
      ["A2", "a2-u1", "c"],
    ]);
    expect(flattenCourseLessons(course).map((e) => e.level)).toEqual([null, null]);
  });

  it("allows the large course sizes a real curriculum needs", () => {
    const units = Array.from({ length: CONTENT_RULES.courseMaxUnits }, (_, u) => ({
      id: `a1-u${u}`,
      title: "Unit",
      level: "A1",
      lessons: Array.from({ length: 10 }, (_, l) => ({ id: `a1-u${u}-l${l}`, title: "L" })),
    }));
    expect(issues(parse(german(["A1"], units)))).toEqual([]);
    expect(parse(german(["A1"], [...units, { ...units[0]!, id: "extra" }])).success).toBe(false);
    const bigUnit = {
      ...unit("a1-u1", "A1"),
      lessons: Array.from({ length: CONTENT_RULES.unitMaxLessons + 1 }, (_, l) => ({
        id: `l${l}`,
        title: "L",
      })),
    };
    expect(parse(german(["A1"], [bigUnit])).success).toBe(false);
  });
});

describe("German tiles (CTO-008, ADR-008)", () => {
  const germanWordBank = {
    id: "de-ex1",
    type: "word_bank_translate",
    direction: "to_learning",
    prompt: "The dog is beautiful.",
    tiles: ["Der", "Hund", "ist", "schön", "schon", "Straße"],
    answers: ["Der Hund ist schön.", "der hund ist schön"],
  } as const;

  it("builds answers from capitalised noun tiles, case-insensitively", () => {
    expect(ExerciseSchema.safeParse(germanWordBank).success).toBe(true);
    expect(isBuildableFromTiles("Der Hund ist schön.", ["der", "hund", "ist", "schön"])).toBe(true);
    expect(isBuildableFromTiles("die Straße", ["Die", "STRASSE"])).toBe(false);
  });

  it("keeps hyphenated compounds buildable (U-Bahn → u bahn)", () => {
    expect(isBuildableFromTiles("Ich nehme die U-Bahn.", ["Ich", "nehme", "die", "U-Bahn"])).toBe(
      true,
    );
    expect(
      isBuildableFromTiles("Ich schreibe eine E-Mail", ["Ich", "schreibe", "eine", "E-Mail"]),
    ).toBe(true);
  });

  it("treats umlauts and ß as significant for tiles", () => {
    expect(isBuildableFromTiles("Der Hund ist schön", ["Der", "Hund", "ist", "schon"])).toBe(false);
    expect(isBuildableFromTiles("die Strasse", ["die", "Straße"])).toBe(false);
    const result = ExerciseSchema.safeParse({
      ...germanWordBank,
      answers: ["Der Hund ist schoen"],
    });
    expect(issues(result)).toContain('answer "Der Hund ist schoen" cannot be built from the tiles');
  });

  it("accepts up to CONTENT_RULES.wordBankMaxTiles tiles and maxAcceptedAnswers answers", () => {
    const tiles = Array.from({ length: CONTENT_RULES.wordBankMaxTiles }, (_, i) => `w${i}`);
    const answers = Array.from({ length: CONTENT_RULES.maxAcceptedAnswers }, () => "w0 w1");
    expect(ExerciseSchema.safeParse({ ...germanWordBank, tiles, answers }).success).toBe(true);
    expect(
      ExerciseSchema.safeParse({ ...germanWordBank, tiles: [...tiles, "x"], answers }).success,
    ).toBe(false);
  });
});
