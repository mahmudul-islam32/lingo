/** User identity, profile and settings. */
import { z } from "zod";
import { IsoDateTimeSchema, SlugSchema, UuidSchema } from "./common";
import { DAILY_GOAL_OPTIONS } from "./config";

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

export const SettingsSchema = z.object({
  /** Active course. Only one exists in MVP, but onboarding still picks it. */
  courseId: SlugSchema,
  dailyGoalXp: DailyGoalXpSchema,
  soundEffectsEnabled: z.boolean(),
  /** When false, speak exercises are hidden (US-LES-09). */
  speakingExercisesEnabled: z.boolean(),
  /** Last-write-wins conflict key. */
  updatedAt: IsoDateTimeSchema,
});
export type Settings = z.infer<typeof SettingsSchema>;
