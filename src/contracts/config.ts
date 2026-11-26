/**
 * Game and content constants (PD-003). Features MUST read values from here and
 * never hard-code them, so the pm can tune them in one place (via a contract request).
 */
import { z } from "zod";

/** Bumped when a persisted/synced contract changes shape incompatibly. */
export const CONTRACTS_VERSION = 1 as const;

export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50] as const;
export type DailyGoalOption = (typeof DAILY_GOAL_OPTIONS)[number];

export const GAME_CONFIG = {
  /** XP for completing any lesson, including replays (PD-003, US-GAM-14). */
  xpPerLesson: 10,
  /** Extra XP when a lesson is finished with zero incorrect answers. */
  perfectLessonBonusXp: 5,
  /** Maximum and starting hearts, for guests and accounts alike (PD-003 Q3). */
  maxHearts: 5,
  /** Hearts lost per incorrect answer. Speak exercises never cost hearts. */
  heartsLostPerMistake: 1,
  /**
   * Hearts restored per correct "Check" (any attempt, incl. a retry of a re-queued
   * exercise), capped at `maxHearts` (CTO-015, ADR-013). Speak exercises never gain,
   * as they never cost; a correct Check with `heartCost > 0` (match pairs mismatch) does
   * not gain. The refill timer is unchanged and keeps running below max.
   */
  heartsGainedPerCorrectAnswer: 1,
  /**
   * Whether replaying an already completed lesson ("practice") costs hearts. When false,
   * practice never loses hearts and may start at 0 hearts (CTO-015, ADR-013).
   */
  practiceCostsHearts: false,
  /** One heart refills after this long, up to `maxHearts`. 4 hours. */
  heartRefillIntervalMs: 4 * 60 * 60 * 1000,
  /** Daily XP goal choices offered at onboarding and in settings. */
  dailyGoalOptions: DAILY_GOAL_OPTIONS,
  /** Pre-selected option at onboarding. */
  defaultDailyGoalXp: 20 satisfies DailyGoalOption,
  /**
   * Latest allowed goal date = today + this many days (CTO-017, ADR-015, PD-071 §1.1).
   * The earliest is tomorrow ("after today"), which needs no constant.
   */
  goalPlanMaxDays: 730,
  /**
   * Exercises in one review session at most (CTO-019, ADR-019, PD-079). The route takes
   * the first this many ranked candidates that load (PLT-029).
   */
  reviewSessionSize: 10,
  /**
   * Days until an exercise is due again after 1, 2, 3, … correct reviews in a row
   * (`correctRun`); the last value repeats. Strictly increasing positive integers.
   */
  reviewIntervalsDays: [1, 3, 7, 14, 30],
} as const;

/**
 * Defaults for the settings toggles when settings are first created at onboarding
 * (CR-002). `courseId` and `dailyGoalXp` have no default: onboarding chooses them
 * (`GAME_CONFIG.defaultDailyGoalXp` is only the pre-selected option).
 */
export const DEFAULT_SETTINGS = {
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
} as const;

export const CONTENT_RULES = {
  /** Multiple-choice option count range (PRD 6.1: 3–4 options). */
  multipleChoiceMinOptions: 3,
  multipleChoiceMaxOptions: 4,
  /** Match-pairs exercises have exactly this many pairs (PRD 6.1). */
  matchPairsCount: 5,
  /**
   * Hard bounds on exercises per lesson; content targets 10–12. Raised from 20 to 40 for
   * full mock exams (Einbürgerungstest: 33 questions; TELC-001).
   */
  lessonMinExercises: 1,
  lessonMaxExercises: 40,
  /** Max tiles in a word bank (answer tiles + distractors); raised for B2/C1 sentences. */
  wordBankMaxTiles: 24,
  /** Max accepted answers per tile exercise (word-order and du/ihr/Sie variants). */
  maxAcceptedAnswers: 20,
  /** Max characters for a lesson tip (PRD: "a short tip line"; grammar tips need more). */
  lessonTipMaxLength: 280,
  /** Lessons per unit (ADR-008). */
  unitMinLessons: 1,
  unitMaxLessons: 30,
  /** Units per course manifest, across all levels (A1–C1 plans ~10–20 per level). */
  courseMaxUnits: 150,
  /** Lessons per course manifest, across all units. */
  courseMaxLessons: 2000,
  /** Cloze (ADR-009, CTO-009): 1–2 gaps marked with `CLOZE_GAP_MARKER`, 2–4 options each. */
  clozeMinGaps: 1,
  clozeMaxGaps: 2,
  clozeMinOptions: 2,
  clozeMaxOptions: 4,
  /** Max characters of one cloze option (CDS-13: no tile longer than 24). */
  clozeOptionMaxLength: 24,
  /** Max characters of the sentence with every gap filled by its longest option (CDS-13). */
  clozeSentenceMaxLength: 80,
  /** Max characters of the known-language translation under the sentence. */
  clozeTranslationMaxLength: 80,
  /** `playbackRate` used for the slow replay when no dedicated slow file exists. */
  slowPlaybackRate: 0.7,
  /**
   * Exam-prep exercise types (TELC-001): `choice`, `listening`, `task`, `explain`, and the
   * optional `explanation` every exercise may carry. Rich text uses the light markup of
   * `rich-text.ts` (paragraphs, line breaks, `**bold**`, `*italic*`, `- ` bullets).
   */
  explanationMaxLength: 3000,
  /** Short heading of a reading text, task, listening item or explain card. */
  titleMaxLength: 160,
  /** Reading passage of a `choice` exercise or body of an `explain` card. */
  passageMaxLength: 8000,
  /** Question of a `choice` / `listening` exercise (longer than a plain prompt). */
  longPromptMaxLength: 600,
  /** One option of a `choice` / `listening` exercise (headlines, ads, sentences). */
  longOptionMaxLength: 400,
  /** `choice` / `listening` option count (2 for richtig/falsch, up to 12 for headlines/ads). */
  choiceMinOptions: 2,
  choiceMaxOptions: 12,
  /** Transcript of a `listening` exercise, read aloud with speech synthesis. */
  transcriptMaxLength: 6000,
  /** Task text and model answer of a `task` (writing/speaking) exercise. */
  taskMaxLength: 6000,
  modelAnswerMaxLength: 10000,
  /** Bullet lists of a task (Leitpunkte) or useful phrases. */
  taskMaxPoints: 12,
  taskMaxPhrases: 40,
  /** Example pairs on an explain card. */
  explainMaxExamples: 24,
  /** Max characters a learner may type into a writing task. */
  taskAnswerMaxLength: 20000,
} as const;

export const SYNC_CONFIG = {
  /** First retry delay; doubles per failed attempt (exponential backoff). */
  retryBaseDelayMs: 2_000,
  /** Backoff ceiling. */
  retryMaxDelayMs: 5 * 60 * 1000,
  /** After this many attempts with a non-retryable error a record is marked `rejected`. */
  maxAttempts: 10,
} as const;

/** Schema guarding the constants above; also documents the allowed ranges for tuning. */
export const GameConfigSchema = z
  .object({
    xpPerLesson: z.number().int().positive(),
    perfectLessonBonusXp: z.number().int().min(0),
    maxHearts: z.number().int().positive(),
    heartsLostPerMistake: z.number().int().positive(),
    heartsGainedPerCorrectAnswer: z.number().int().min(0),
    practiceCostsHearts: z.boolean(),
    heartRefillIntervalMs: z.number().int().positive(),
    dailyGoalOptions: z.array(z.number().int().positive()).min(1),
    defaultDailyGoalXp: z.number().int().positive(),
    goalPlanMaxDays: z.number().int().positive(),
    reviewSessionSize: z.number().int().positive(),
    reviewIntervalsDays: z.array(z.number().int().positive()).min(1),
  })
  .refine((c) => c.dailyGoalOptions.includes(c.defaultDailyGoalXp), {
    message: "defaultDailyGoalXp must be one of dailyGoalOptions",
    path: ["defaultDailyGoalXp"],
  })
  .refine((c) => c.heartsGainedPerCorrectAnswer <= c.maxHearts, {
    message: "heartsGainedPerCorrectAnswer must not exceed maxHearts",
    path: ["heartsGainedPerCorrectAnswer"],
  })
  .refine((c) => c.reviewIntervalsDays.every((d, i, all) => i === 0 || d > (all[i - 1] ?? 0)), {
    message: "reviewIntervalsDays must be strictly increasing",
    path: ["reviewIntervalsDays"],
  });
export type GameConfig = z.infer<typeof GameConfigSchema>;
