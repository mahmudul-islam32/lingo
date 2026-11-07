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
const AcceptedAnswersSchema = z.array(TextSchema).min(1).max(10);

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
 * (English), answer in the learning language (Spanish); `to_known` = the reverse.
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
  lessons: z.array(LessonSummarySchema).min(1),
});
export type Unit = z.infer<typeof UnitSchema>;

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
    units: z.array(UnitSchema).min(1),
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
  });
export type Course = z.infer<typeof CourseSchema>;
