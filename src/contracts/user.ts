/** User identity, profile and settings. */
import { z } from "zod";
import { IsoDateTimeSchema, LocalDateSchema, SlugSchema, UuidSchema } from "./common";
import { DAILY_GOAL_OPTIONS } from "./config";
import { CefrLevelSchema } from "./course";

/** Daily XP goal: one of `GAME_CONFIG.dailyGoalOptions` (10 / 20 / 30 / 50). */
export const DailyGoalXpSchema = z.literal(DAILY_GOAL_OPTIONS);
export type DailyGoalXp = z.infer<typeof DailyGoalXpSchema>;

/**
 * Who the local data belongs to. Guests get a client-generated UUID and never talk
 * to the server; on sign-up their data is migrated to the account (ARCHITECTURE §Auth).
 */
export const IdentitySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("guest"), guestId: UuidSchema }),
  /** `userId` is the Supabase `auth.users.id`. */
  z.object({ kind: z.literal("account"), userId: UuidSchema }),
]);
export type Identity = z.infer<typeof IdentitySchema>;

export const DisplayNameSchema = z.string().trim().min(1).max(30);

/** Avatar: initials derived from the display name, or one of our original preset avatars. */
export const AvatarSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("initials") }),
  z.object({ kind: z.literal("preset"), presetId: SlugSchema }),
]);
export type Avatar = z.infer<typeof AvatarSchema>;

export const ProfileSchema = z.object({
  /** Guest id or account user id (matches `Identity`). */
  id: UuidSchema,
  displayName: DisplayNameSchema,
  avatar: AvatarSchema,
  /** "Join date" on the profile. For migrated guests: the guest's original creation time. */
  joinedAt: IsoDateTimeSchema,
  /** Set when onboarding (course + daily goal) is finished. */
  onboardedAt: IsoDateTimeSchema.nullable(),
  /** Last-write-wins conflict key (ARCHITECTURE §Sync). */
  updatedAt: IsoDateTimeSchema,
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Editable profile fields, sent through the sync queue. */
export const ProfileUpdateSchema = ProfileSchema.pick({
  displayName: true,
  avatar: true,
  onboardedAt: true,
  updatedAt: true,
});
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/**
 * The learner's goal date (CTO-017, ADR-015, PD-071 §1): finish `targetLevel` by
 * `targetDate`. Structural only: "after today" and "within `GAME_CONFIG.goalPlanMaxDays`"
 * depend on today and are enforced by the Profile dialog (PLT-027), not by this schema,
 * so a stored plan whose date has passed stays valid (status `date-passed`).
 */
export const GoalPlanSchema = z.object({
  /** A level of the course with content; `computeGoalPlan` returns `null` otherwise. */
  targetLevel: CefrLevelSchema,
  /** Device-local calendar date `YYYY-MM-DD` (no time, no zone). */
  targetDate: LocalDateSchema,
});
export type GoalPlan = z.infer<typeof GoalPlanSchema>;

export const SettingsSchema = z.object({
  /** Active course. Only one exists in MVP, but onboarding still picks it. */
  courseId: SlugSchema,
  dailyGoalXp: DailyGoalXpSchema,
  soundEffectsEnabled: z.boolean(),
  /** When false, speak exercises are hidden (US-LES-09). */
  speakingExercisesEnabled: z.boolean(),
  /**
   * CEFR level the learner chose to start at (CTO-015, ADR-013). Missing means the first
   * level of the course (A1). Lessons of earlier levels are playable ("available", never
   * auto-completed, no XP granted); the frontier is the first not-completed lesson at or
   * after the first lesson of this level. An unknown or contentless level falls back to
   * the first level. Optional so stored settings stay valid (no Dexie/schema bump).
   */
  startLevel: CefrLevelSchema.optional(),
  /**
   * Goal date (CTO-017, ADR-015). Missing or `null` both mean "no goal date"; readers
   * treat them alike (`settings.goalPlan ?? null`). `null` is what a clear writes
   * (`updateSettings({ goalPlan: null })`), so the spread patch needs no special case and
   * syncs as nullable columns. Optional so stored settings stay valid (no Dexie bump).
   */
  goalPlan: GoalPlanSchema.nullable().optional(),
  /** Last-write-wins conflict key. */
  updatedAt: IsoDateTimeSchema,
});
export type Settings = z.infer<typeof SettingsSchema>;
