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
  /** Hard bounds on exercises per lesson; content targets 10–12. */
  lessonMinExercises: 1,
  lessonMaxExercises: 20,
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
  })
  .refine((c) => c.dailyGoalOptions.includes(c.defaultDailyGoalXp), {
    message: "defaultDailyGoalXp must be one of dailyGoalOptions",
    path: ["defaultDailyGoalXp"],
  })
  .refine((c) => c.heartsGainedPerCorrectAnswer <= c.maxHearts, {
    message: "heartsGainedPerCorrectAnswer must not exceed maxHearts",
    path: ["heartsGainedPerCorrectAnswer"],
  });
export type GameConfig = z.infer<typeof GameConfigSchema>;
