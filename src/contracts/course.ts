/**
 * Course content: Course → Unit → LessonSummary (course manifest) and Lesson →
 * Exercise (one file per lesson). Used to validate every JSON file in `/content`.
 *
 * Content schemas are STRICT: unknown keys are rejected so authoring typos fail fast.
 *
 * File layout (see ARCHITECTURE.md §Content):
 *   content/courses/<courseId>/course.json          → CourseSchema
 *   content/courses/<courseId>/lessons/<lessonId>.json → LessonSchema
 */
import { z } from "zod";
import { AudioPathSchema, findDuplicates, LanguageCodeSchema, SlugSchema } from "./common";
import { CONTENT_RULES } from "./config";
import { tokenizeAnswer } from "./text";

/**
 * CEFR level (ADR-008). A course that declares `levels` tags every unit with one of
 * them; courses without levels (the original en-es course) stay valid.
 */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const CefrLevelSchema = z.enum(CEFR_LEVELS);
export type CefrLevel = z.infer<typeof CefrLevelSchema>;

/** Position of a level in `CEFR_LEVELS` (A1 = 0). Pure helper for ordering rules. */
export function cefrLevelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/** Short authored text shown to the learner. */
const TextSchema = z.string().trim().min(1).max(280);

export const EXERCISE_TYPES = [
  "multiple_choice",
  "word_bank_translate",
  "match_pairs",
  "listen",
  "speak",
] as const;
export const ExerciseTypeSchema = z.enum(EXERCISE_TYPES);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

/** Audio clip with an optional dedicated slow recording (else `CONTENT_RULES.slowPlaybackRate`). */
export const AudioClipSchema = z.strictObject({
  src: AudioPathSchema,
  slowSrc: AudioPathSchema.optional(),
});
export type AudioClip = z.infer<typeof AudioClipSchema>;

/**
 * Accepted answers for tile-based exercises. The first entry is the canonical answer
 * shown on a wrong attempt; further entries are accepted alternatives (US-CON-03).
 */
const AcceptedAnswersSchema = z.array(TextSchema).min(1).max(CONTENT_RULES.maxAcceptedAnswers);

/** Tiles offered in a word bank: answer tiles plus distractors. */
const TilesSchema = z
  .array(z.string().trim().min(1).max(40))
  .min(2)
  .max(CONTENT_RULES.wordBankMaxTiles);

/** Counts tokens of a multiset; pure helper. */
function countTokens(tokens: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

/**
 * True when `answer` (after normalisation) can be built from the tile multiset.
 * Exported for the content tooling and for tests.
 */
export function isBuildableFromTiles(answer: string, tiles: readonly string[]): boolean {
  const available = countTokens(tiles.flatMap((tile) => tokenizeAnswer(tile)));
  const needed = countTokens(tokenizeAnswer(answer));
  if (needed.size === 0) return false;
  for (const [token, count] of needed) {
    if ((available.get(token) ?? 0) < count) return false;
  }
  return true;
}

function refineTileAnswers(
  value: { tiles: string[]; answers: string[] },
  ctx: z.RefinementCtx,
): void {
  value.answers.forEach((answer, index) => {
    if (!isBuildableFromTiles(answer, value.tiles)) {
      ctx.addIssue({
        code: "custom",
        message: `answer "${answer}" cannot be built from the tiles`,
        path: ["answers", index],
      });
    }
  });
}

const exerciseBase = {
  id: SlugSchema,
};

/** Prompt plus 3–4 text options; exactly one is correct. */
export const MultipleChoiceExerciseSchema = z
  .strictObject({
    ...exerciseBase,
    type: z.literal("multiple_choice"),
    prompt: TextSchema,
    /** Optional audio for the prompt (e.g. "Which one means …?" with a spoken word). */
    audio: AudioClipSchema.optional(),
    options: z
      .array(z.strictObject({ id: SlugSchema, text: TextSchema }))
      .min(CONTENT_RULES.multipleChoiceMinOptions)
      .max(CONTENT_RULES.multipleChoiceMaxOptions),
    correctOptionId: SlugSchema,
  })
  .superRefine((value, ctx) => {
    for (const id of findDuplicates(value.options.map((o) => o.id))) {
      ctx.addIssue({ code: "custom", message: `duplicate option id "${id}"`, path: ["options"] });
    }
    const texts = value.options.map((o) => o.text.toLowerCase());
    for (const text of findDuplicates(texts)) {
      ctx.addIssue({
        code: "custom",
        message: `duplicate option text "${text}"`,
        path: ["options"],
      });
    }
    if (!value.options.some((o) => o.id === value.correctOptionId)) {
      ctx.addIssue({
        code: "custom",
        message: "correctOptionId must match one of the option ids",
        path: ["correctOptionId"],
      });
    }
  });
export type MultipleChoiceExercise = z.infer<typeof MultipleChoiceExerciseSchema>;

/**
 * Which way a translation goes: `to_learning` = prompt in the known language
 * (English), answer in the learning language (e.g. German); `to_known` = the reverse.
 */
export const TranslationDirectionSchema = z.enum(["to_learning", "to_known"]);
export type TranslationDirection = z.infer<typeof TranslationDirectionSchema>;

/** Build the translation of `prompt` by tapping tiles. */
export const WordBankTranslateExerciseSchema = z
  .strictObject({
    ...exerciseBase,
    type: z.literal("word_bank_translate"),
    direction: TranslationDirectionSchema,
    prompt: TextSchema,
    /** Optional audio of the prompt (only meaningful for `to_known`). */
    audio: AudioClipSchema.optional(),
    tiles: TilesSchema,
    answers: AcceptedAnswersSchema,
  })
  .superRefine(refineTileAnswers);
export type WordBankTranslateExercise = z.infer<typeof WordBankTranslateExerciseSchema>;

/** Match each learning-language word to its known-language translation. */
export const MatchPairsExerciseSchema = z
  .strictObject({
    ...exerciseBase,
    type: z.literal("match_pairs"),
    pairs: z
      .array(
        z.strictObject({
          id: SlugSchema,
          /** Learning-language side, e.g. "gato". */
          learning: z.string().trim().min(1).max(40),
          /** Known-language side, e.g. "cat". */
          known: z.string().trim().min(1).max(40),
        }),
      )
      .length(CONTENT_RULES.matchPairsCount),
  })
  .superRefine((value, ctx) => {
    for (const id of findDuplicates(value.pairs.map((p) => p.id))) {
      ctx.addIssue({ code: "custom", message: `duplicate pair id "${id}"`, path: ["pairs"] });
    }
    for (const side of ["learning", "known"] as const) {
      const words = value.pairs.map((p) => p[side].toLowerCase());
      for (const word of findDuplicates(words)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate ${side} word "${word}" makes the pairs ambiguous`,
          path: ["pairs"],
        });
      }
    }
  });
export type MatchPairsExercise = z.infer<typeof MatchPairsExerciseSchema>;

/** Play audio, then build what was heard (in the learning language) with tiles. */
export const ListenExerciseSchema = z
  .strictObject({
    ...exerciseBase,
    type: z.literal("listen"),
    audio: AudioClipSchema,
    tiles: TilesSchema,
    /** `answers[0]` is the exact transcript of `audio`. */
    answers: AcceptedAnswersSchema,
  })
  .superRefine(refineTileAnswers);
export type ListenExercise = z.infer<typeof ListenExerciseSchema>;

/**
 * Read a phrase aloud; checked with the Web Speech API. Optional by design:
 * hidden when unsupported or disabled, always skippable, never costs a heart.
 */
export const SpeakExerciseSchema = z.strictObject({
  ...exerciseBase,
  type: z.literal("speak"),
  /** Learning-language phrase to say, e.g. "Buenos días". */
  phrase: TextSchema,
  /** Known-language translation shown under the phrase. */
  translation: TextSchema,
  /** Model pronunciation. */
  audio: AudioClipSchema.optional(),
  /** Extra transcripts to accept besides `phrase` (compared diacritic-insensitively). */
  acceptedTranscripts: z.array(TextSchema).max(10).optional(),
});
export type SpeakExercise = z.infer<typeof SpeakExerciseSchema>;

export const ExerciseSchema = z.discriminatedUnion("type", [
  MultipleChoiceExerciseSchema,
  WordBankTranslateExerciseSchema,
  MatchPairsExerciseSchema,
  ListenExerciseSchema,
  SpeakExerciseSchema,
]);
export type Exercise = z.infer<typeof ExerciseSchema>;

/** Narrow helper: `ExerciseOfType<"listen">` is `ListenExercise`. */
export type ExerciseOfType<T extends ExerciseType> = Extract<Exercise, { type: T }>;

/** One lesson file: `content/courses/<courseId>/lessons/<lessonId>.json`. */
export const LessonSchema = z
  .strictObject({
    id: SlugSchema,
    courseId: SlugSchema,
    unitId: SlugSchema,
    title: TextSchema,
    /** Optional short tip shown before the first exercise (US-LES-16). */
    tip: z.string().trim().min(1).max(CONTENT_RULES.lessonTipMaxLength).optional(),
    /** Presented in this order; wrong answers are re-queued at the end at runtime. */
    exercises: z
      .array(ExerciseSchema)
      .min(CONTENT_RULES.lessonMinExercises)
      .max(CONTENT_RULES.lessonMaxExercises),
  })
  .superRefine((value, ctx) => {
    for (const id of findDuplicates(value.exercises.map((e) => e.id))) {
      ctx.addIssue({
        code: "custom",
        message: `duplicate exercise id "${id}"`,
        path: ["exercises"],
      });
    }
    if (value.exercises.every((e) => e.type === "speak")) {
      ctx.addIssue({
        code: "custom",
        message: "a lesson needs at least one non-speak exercise (speak can be hidden)",
        path: ["exercises"],
      });
    }
  });
export type Lesson = z.infer<typeof LessonSchema>;

/** Lesson entry in the course manifest; order in the array is the unlock order. */
export const LessonSummarySchema = z.strictObject({
  id: SlugSchema,
  title: TextSchema,
});
export type LessonSummary = z.infer<typeof LessonSummarySchema>;

export const UnitSchema = z.strictObject({
  id: SlugSchema,
  title: TextSchema,
  description: TextSchema.optional(),
  /** CEFR level of the unit. Required iff the course declares `levels` (ADR-008). */
  level: CefrLevelSchema.optional(),
  lessons: z
    .array(LessonSummarySchema)
    .min(CONTENT_RULES.unitMinLessons)
    .max(CONTENT_RULES.unitMaxLessons),
});
export type Unit = z.infer<typeof UnitSchema>;

/**
 * A CEFR level of a course: the top layer of the path (PD-030), Course → Level → Unit →
 * Lesson. Units point at their level with `Unit.level`; a level may have no units yet
 * (shown as "Coming soon", GAM-010).
 */
export const CourseLevelSchema = z.strictObject({
  level: CefrLevelSchema,
  /** English display title, e.g. "A1 · Beginner". */
  title: z.string().trim().min(1).max(40),
  description: TextSchema.optional(),
});
export type CourseLevel = z.infer<typeof CourseLevelSchema>;

/** Level rules of a course manifest (ADR-008); see `CourseSchema.levels`. */
function refineLevels(
  value: {
    levels?: { level: CefrLevel }[] | undefined;
    units: { level?: CefrLevel | undefined }[];
  },
  ctx: z.RefinementCtx,
): void {
  const { units } = value;
  if (!value.levels) {
    units.forEach((unit, index) => {
      if (unit.level !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "unit has a level but the course declares no levels",
          path: ["units", index, "level"],
        });
      }
    });
    return;
  }
  const declared = value.levels.map((l) => l.level);
  for (const level of findDuplicates(declared)) {
    ctx.addIssue({ code: "custom", message: `level ${level} is declared twice`, path: ["levels"] });
  }
  const indexes = declared.map(cefrLevelIndex);
  if (indexes.some((current, i) => i > 0 && current < indexes[i - 1]!)) {
    ctx.addIssue({
      code: "custom",
      message: "levels must be in CEFR order (A1, A2, B1, B2, C1, C2)",
      path: ["levels"],
    });
  }
  let previous = -1;
  units.forEach((unit, index) => {
    if (unit.level === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "every unit needs a level when the course declares levels",
        path: ["units", index, "level"],
      });
      return;
    }
    if (!declared.includes(unit.level)) {
      ctx.addIssue({
        code: "custom",
        message: `unit level ${unit.level} is not one of the course levels`,
        path: ["units", index, "level"],
      });
    }
    const current = cefrLevelIndex(unit.level);
    if (current < previous) {
      ctx.addIssue({
        code: "custom",
        message: "units must be grouped by level in CEFR order",
        path: ["units", index, "level"],
      });
    }
    previous = Math.max(previous, current);
  });
}

/** Course manifest: `content/courses/<courseId>/course.json`. */
export const CourseSchema = z
  .strictObject({
    id: SlugSchema,
    title: TextSchema,
    /** Language being learned, e.g. `es`. */
    learningLanguage: LanguageCodeSchema,
    /** Language the learner already knows (UI + translations), e.g. `en`. */
    knownLanguage: LanguageCodeSchema,
    /** Content revision, bumped on every content change; used for cache busting. */
    version: z.number().int().positive(),
    /**
     * The course's CEFR levels in CEFR order, each declared once (ADR-008). A level may
     * have no units yet ("Coming soon"). Optional for backward compatibility (en-es has
     * none); when present every unit has a `level` from this list and units are grouped
     * by level in CEFR order, so the unit order is the path order.
     */
    levels: z.array(CourseLevelSchema).min(1).max(CEFR_LEVELS.length).optional(),
    units: z.array(UnitSchema).min(1).max(CONTENT_RULES.courseMaxUnits),
  })
  .superRefine((value, ctx) => {
    if (value.learningLanguage === value.knownLanguage) {
      ctx.addIssue({
        code: "custom",
        message: "learningLanguage and knownLanguage must differ",
        path: ["knownLanguage"],
      });
    }
    for (const id of findDuplicates(value.units.map((u) => u.id))) {
      ctx.addIssue({ code: "custom", message: `duplicate unit id "${id}"`, path: ["units"] });
    }
    const lessonIds = value.units.flatMap((u) => u.lessons.map((l) => l.id));
    for (const id of findDuplicates(lessonIds)) {
      ctx.addIssue({ code: "custom", message: `duplicate lesson id "${id}"`, path: ["units"] });
    }
    if (lessonIds.length > CONTENT_RULES.courseMaxLessons) {
      ctx.addIssue({
        code: "custom",
        message: `a course has at most ${CONTENT_RULES.courseMaxLessons} lessons`,
        path: ["units"],
      });
    }
    refineLevels(value, ctx);
  });
export type Course = z.infer<typeof CourseSchema>;

/** One lesson in path order with its unit and level (`null` for courses without levels). */
export interface CourseLessonEntry {
  lesson: LessonSummary;
  unit: Unit;
  level: CefrLevel | null;
}

/**
 * Every lesson of a course in unlock/path order: A1 unit 1 lesson 1 … last level's last
 * lesson (ADR-008). Pure; `computePathNodes` and the content layer use this order.
 */
export function flattenCourseLessons(course: Course): CourseLessonEntry[] {
  return course.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({ lesson, unit, level: unit.level ?? null })),
  );
}

/** A declared level with its units in course order (empty for "Coming soon" levels). */
export interface CourseLevelGroup {
  level: CourseLevel;
  units: Unit[];
}

/** Units grouped by the course's declared levels, in CEFR order; `[]` without levels. */
export function groupUnitsByLevel(course: Course): CourseLevelGroup[] {
  return (course.levels ?? []).map((level) => ({
    level,
    units: course.units.filter((unit) => unit.level === level.level),
  }));
}
