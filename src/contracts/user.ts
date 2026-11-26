/** User identity, profile and settings. */
import { z } from "zod";
import { IsoDateTimeSchema, LocalDateSchema, SlugSchema, UuidSchema, type Slug } from "./common";
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

/**
 * Goal plans per course (CTO-018, ADR-018, PD-078): at most one plan per course id. Keys
 * are validated as slugs. A plan stored for a course that is unknown, hidden or has no
 * levels stays stored and valid; it is simply not shown (CTO-018 criterion 9).
 */
export const GoalPlansSchema = z.record(SlugSchema, GoalPlanSchema);
export type GoalPlans = z.infer<typeof GoalPlansSchema>;

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
   * Goal dates, one per course (CTO-018, ADR-018). Missing = no plan for any course.
   * Read a course's plan with `goalPlanFor(settings, courseId)`, never directly, so the
   * legacy `goalPlan` below is honoured; write with `goalPlanUpdate` in `SettingsPatch`.
   */
  goalPlans: GoalPlansSchema.optional(),
  /**
   * @deprecated Legacy single goal date (CTO-017, ADR-015), read-only since CTO-018. It
   * belongs to this record's `courseId`. `normalizeGoalPlans` moves it into `goalPlans`
   * and drops it; it stays parseable until ADR-018's removal step (after v0.6.0), so
   * records and queued `settings` sync records written by v0.5.4 still parse.
   */
  goalPlan: GoalPlanSchema.nullable().optional(),
  /** Last-write-wins conflict key. */
  updatedAt: IsoDateTimeSchema,
});
export type Settings = z.infer<typeof SettingsSchema>;

/** The goal-plan fields of `Settings` the helpers below read and write. */
type GoalPlanFields = Pick<Settings, "courseId" | "goalPlan" | "goalPlans">;

/**
 * Sets (`goalPlan`) or clears (`null`) the plan of one course (CTO-018 criterion 2),
 * sent as `SettingsPatch.goalPlanUpdate`. Other courses' plans are never sent.
 */
export const GoalPlanUpdateSchema = z.object({
  courseId: SlugSchema,
  goalPlan: GoalPlanSchema.nullable(),
});
export type GoalPlanUpdate = z.infer<typeof GoalPlanUpdateSchema>;

/**
 * The goal plan of `courseId` (CTO-018 criterion 11, ADR-018 §2), or `null`. Applies the
 * migration rule without writing: an entry in `goalPlans` wins; otherwise the legacy
 * `goalPlan` counts for the record's own `courseId` only. GAM-014 and PLT-028 read plans
 * through this selector only.
 */
export function goalPlanFor(settings: GoalPlanFields, courseId: Slug): GoalPlan | null {
  const plans = settings.goalPlans;
  if (plans && Object.hasOwn(plans, courseId)) return plans[courseId] ?? null;
  if (courseId === settings.courseId) return settings.goalPlan ?? null;
  return null;
}

/**
 * Stored-data migration (CTO-018 criterion 3, ADR-018 §3): moves a legacy `goalPlan` into
 * `goalPlans[settings.courseId]` (an existing entry for that course wins, so nothing is
 * duplicated) and removes the `goalPlan` key. Pure, idempotent, returns a new object;
 * settings without a legacy plan come back with the same goal plans. The settings
 * repository applies it to the stored record **before** merging a patch, so a
 * `courseId` change in the same patch can't carry the legacy plan to another course.
 */
export function normalizeGoalPlans<T extends GoalPlanFields>(settings: T): T {
  if (!("goalPlan" in settings)) return { ...settings };
  const { goalPlan, ...rest } = settings;
  if (goalPlan == null) return rest as T;
  return {
    ...rest,
    goalPlans: { [settings.courseId]: goalPlan, ...settings.goalPlans },
  } as T;
}

/**
 * Applies one `GoalPlanUpdate` (CTO-018 criteria 1–2): normalizes, then sets or removes
 * the plan of `update.courseId`; every other course's plan is unchanged. Pure.
 */
export function withGoalPlan<T extends GoalPlanFields>(settings: T, update: GoalPlanUpdate): T {
  const normalized = normalizeGoalPlans(settings);
  const others = Object.entries(normalized.goalPlans ?? {}).filter(
    ([courseId]) => courseId !== update.courseId,
  );
  const plans: GoalPlans = Object.fromEntries(
    update.goalPlan === null ? others : [...others, [update.courseId, update.goalPlan]],
  );
  return { ...normalized, goalPlans: plans };
}
