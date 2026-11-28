/**
 * Contract ↔ table mapping for push (ADR-020 §5). Every payload is parsed with its contract
 * schema first. Column names are the snake_case of the fields, with the ADR's exceptions:
 * `xp` is split, `kind` defaults to `lesson`, `exerciseOutcomes` defaults to `null`, the
 * legacy `goalPlan` is never sent, `goalPlans` is normalized (`{}` → `null`), the avatar is
 * split into kind and preset id. `user_id` is never sent for lesson results (the column
 * defaults to `auth.uid()`); the one-row tables send it as their upsert key (RLS checks it).
 */
import {
  HeartsStateSchema,
  LessonResultSchema,
  ProfileUpdateSchema,
  SettingsSchema,
  normalizeGoalPlans,
  type HeartsState,
  type LessonResult,
  type ProfileUpdate,
  type Settings,
} from "@/contracts";

export type LessonResultRow = {
  id: string;
  course_id: string;
  unit_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  exercise_count: number;
  first_try_correct_count: number;
  mistake_count: number;
  skipped_count: number;
  accuracy: number;
  perfect: boolean;
  xp_base: number;
  xp_perfect_bonus: number;
  xp_earned: number;
  hearts_lost: number;
  local_date: string;
  time_zone: string;
  kind: "lesson" | "review";
  exercise_outcomes: LessonResult["exerciseOutcomes"] | null;
};

export function toLessonResultRow(input: LessonResult): LessonResultRow {
  const r = LessonResultSchema.parse(input);
  return {
    id: r.id,
    course_id: r.courseId,
    unit_id: r.unitId,
    lesson_id: r.lessonId,
    started_at: r.startedAt,
    completed_at: r.completedAt,
    duration_ms: r.durationMs,
    exercise_count: r.exerciseCount,
    first_try_correct_count: r.firstTryCorrectCount,
    mistake_count: r.mistakeCount,
    skipped_count: r.skippedCount,
    accuracy: r.accuracy,
    perfect: r.perfect,
    xp_base: r.xp.base,
    xp_perfect_bonus: r.xp.perfectBonus,
    xp_earned: r.xpEarned,
    hearts_lost: r.heartsLost,
    local_date: r.localDate,
    time_zone: r.timeZone,
    kind: r.kind ?? "lesson",
    exercise_outcomes: r.exerciseOutcomes ?? null,
  };
}

export function toSettingsRow(input: Settings, userId: string) {
  const s = normalizeGoalPlans(SettingsSchema.parse(input));
  const plans = s.goalPlans && Object.keys(s.goalPlans).length > 0 ? s.goalPlans : null;
  return {
    user_id: userId,
    course_id: s.courseId,
    daily_goal_xp: s.dailyGoalXp,
    sound_effects_enabled: s.soundEffectsEnabled,
    speaking_exercises_enabled: s.speakingExercisesEnabled,
    start_level: s.startLevel ?? null,
    goal_plans: plans,
    updated_at: s.updatedAt,
  };
}

/** `joinedAt` comes from the stored profile; the server keeps the earliest (trigger). */
export function toProfileRow(input: ProfileUpdate, userId: string, joinedAt: string) {
  const p = ProfileUpdateSchema.parse(input);
  return {
    user_id: userId,
    display_name: p.displayName,
    avatar_kind: p.avatar.kind,
    avatar_preset_id: p.avatar.kind === "preset" ? p.avatar.presetId : null,
    joined_at: joinedAt,
    onboarded_at: p.onboardedAt,
    updated_at: p.updatedAt,
  };
}

export function toHeartsRow(input: HeartsState, userId: string) {
  const h = HeartsStateSchema.parse(input);
  return {
    user_id: userId,
    current: h.current,
    refill_started_at: h.refillStartedAt,
    updated_at: h.updatedAt,
  };
}

export type OneRowTable = "settings" | "profiles" | "hearts_state";
