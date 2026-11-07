/**
 * Gamification state: XP events, streak, hearts, daily goal and progress snapshot.
 * Rules (PD-003) live as pure functions in `src/features/gamification/rules/` and
 * `src/features/path/rules/`, typed by `api.ts`; constants come from `config.ts`.
 */
import { z } from "zod";
import {
  IsoDateTimeSchema,
  LocalDateSchema,
  NonNegativeIntSchema,
  SlugSchema,
  UuidSchema,
} from "./common";
import { GAME_CONFIG } from "./config";
import { DailyGoalXpSchema } from "./user";

export const XpReasonSchema = z.enum(["lesson_completed", "perfect_lesson_bonus"]);
export type XpReason = z.infer<typeof XpReasonSchema>;

/** One XP award, derived from a LessonResult (one event per breakdown line > 0). */
export const XpEventSchema = z.object({
  id: UuidSchema,
  lessonResultId: UuidSchema,
  reason: XpReasonSchema,
  amount: z.number().int().positive(),
  occurredAt: IsoDateTimeSchema,
  localDate: LocalDateSchema,
});
export type XpEvent = z.infer<typeof XpEventSchema>;

/**
 * Streak derived from the distinct `localDate`s of lesson results.
 * `current` counts consecutive days ending today or yesterday; 0 if the last
 * active day is older than yesterday.
 */
export const StreakStateSchema = z
  .object({
    current: NonNegativeIntSchema,
    longest: NonNegativeIntSchema,
    lastActiveDate: LocalDateSchema.nullable(),
    /** True when a lesson was completed today (streak already extended today). */
    extendedToday: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.longest < v.current) {
      ctx.addIssue({ code: "custom", message: "longest must be >= current", path: ["longest"] });
    }
    if (v.lastActiveDate === null && (v.longest > 0 || v.extendedToday)) {
      ctx.addIssue({
        code: "custom",
        message: "a streak without any active day must be empty",
        path: ["lastActiveDate"],
      });
    }
    if (v.extendedToday && v.current === 0) {
      ctx.addIssue({
        code: "custom",
        message: "extendedToday implies current >= 1",
        path: ["current"],
      });
    }
  });
export type StreakState = z.infer<typeof StreakStateSchema>;

/**
 * Stored hearts. `refillStartedAt` is the instant the refill clock for the next
 * heart started; it is `null` exactly when hearts are full. Refills are applied
 * lazily: n = floor((now - refillStartedAt) / interval), current = min(max, current + n),
 * refillStartedAt += n * interval (or null when full).
 */
export const HeartsStateSchema = z
  .object({
    current: z.number().int().min(0).max(GAME_CONFIG.maxHearts),
    refillStartedAt: IsoDateTimeSchema.nullable(),
    /** Last-write-wins conflict key. */
    updatedAt: IsoDateTimeSchema,
  })
  .refine((v) => (v.current === GAME_CONFIG.maxHearts) === (v.refillStartedAt === null), {
    message: "refillStartedAt must be null iff hearts are full",
    path: ["refillStartedAt"],
  });
export type HeartsState = z.infer<typeof HeartsStateSchema>;

/** Hearts as shown in the UI at a given instant (after lazy refill). */
export const HeartsViewSchema = z.object({
  current: z.number().int().min(0).max(GAME_CONFIG.maxHearts),
  max: z.number().int().positive(),
  /** When the next heart arrives; `null` when full. */
  nextRefillAt: IsoDateTimeSchema.nullable(),
  /** When hearts will be full again; `null` when full. */
  fullAt: IsoDateTimeSchema.nullable(),
  /** False at 0 hearts: no new lesson may start. */
  canStartLesson: z.boolean(),
});
export type HeartsView = z.infer<typeof HeartsViewSchema>;

/** Today's progress toward the daily goal (sum of `xpEarned` with `localDate === today`). */
export const DailyGoalProgressSchema = z
  .object({
    localDate: LocalDateSchema,
    goalXp: DailyGoalXpSchema,
    earnedXp: NonNegativeIntSchema,
    reached: z.boolean(),
  })
  .refine((v) => v.reached === v.earnedXp >= v.goalXp, {
    message: "reached must equal earnedXp >= goalXp",
    path: ["reached"],
  });
export type DailyGoalProgress = z.infer<typeof DailyGoalProgressSchema>;

/** Skill-path node state (US-GAM-03). `in_progress` = the lesson currently being played. */
export const PathNodeStateSchema = z.enum(["locked", "available", "in_progress", "completed"]);
export type PathNodeState = z.infer<typeof PathNodeStateSchema>;

export const PathNodeSchema = z.object({
  lessonId: SlugSchema,
  unitId: SlugSchema,
  state: PathNodeStateSchema,
});
export type PathNode = z.infer<typeof PathNodeSchema>;

/** Aggregate progress for one course, derived from lesson results + hearts state. */
export const UserProgressSchema = z.object({
  courseId: SlugSchema,
  totalXp: NonNegativeIntSchema,
  /** Distinct lesson ids with at least one LessonResult. */
  completedLessonIds: z.array(SlugSchema),
  lessonsCompletedCount: NonNegativeIntSchema,
  streak: StreakStateSchema,
  hearts: HeartsStateSchema,
  dailyGoal: DailyGoalProgressSchema,
});
export type UserProgress = z.infer<typeof UserProgressSchema>;
