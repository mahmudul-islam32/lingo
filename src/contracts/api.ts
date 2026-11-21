/**
 * Function signatures of the pure rules and the data layer the UI calls.
 * Types only: implementations live in the owning feature/lib folder
 * (see ARCHITECTURE.md §Module boundaries). No IO happens in this file.
 */
import type { AnswerCheckInput, AnswerCheckResult } from "./answer";
import type { CefrLevel, Course, Lesson } from "./course";
import type { LocalDate, Slug } from "./common";
import type {
  DailyGoalProgress,
  GoalPlanStatus,
  HeartsState,
  HeartsView,
  PathNode,
  StreakState,
  UserProgress,
  XpEvent,
} from "./gamification";
import type { LessonResult, XpBreakdown } from "./lesson-session";
import type { GuestMigrationPayload, SyncPushResult, SyncQueueRecord, SyncStatus } from "./sync";
import type { DailyGoalXp, GoalPlan, Identity, Profile, ProfileUpdate, Settings } from "./user";

// ---------------------------------------------------------------------------
// Pure rules (no IO, no Date.now(): time is always passed in). Unit-tested.
// ---------------------------------------------------------------------------

/** features/lessons/checking — compares an answer with the exercise (uses `text.ts`). */
export type CheckAnswer = (input: AnswerCheckInput) => AnswerCheckResult;

/** features/gamification/rules/xp — PD-003: base XP + perfect bonus. */
export type ComputeLessonXp = (input: { perfect: boolean }) => XpBreakdown;

/** features/gamification/rules/xp — one XpEvent per non-zero breakdown line. */
export type DeriveXpEvents = (result: LessonResult, newId: () => string) => XpEvent[];

/** features/gamification/rules/streak — from the distinct local dates of results. */
export type ComputeStreak = (activeDates: readonly LocalDate[], today: LocalDate) => StreakState;

/** features/gamification/rules/hearts — lazy refill at `now`. */
export type RefillHearts = (state: HeartsState, now: Date) => HeartsState;

/** features/gamification/rules/hearts — subtract `cost` (clamped at 0), start the clock if it was full. */
export type LoseHearts = (state: HeartsState, cost: number, now: Date) => HeartsState;

/**
 * features/gamification/rules/hearts — add `amount` (normally
 * `GAME_CONFIG.heartsGainedPerCorrectAnswer`), capped at `maxHearts` (CTO-015, ADR-013).
 * Reaching max sets `refillStartedAt = null`; below max the refill clock is kept as is.
 * `amount` 0 or already full returns the state unchanged.
 */
export type GainHearts = (state: HeartsState, amount: number, now: Date) => HeartsState;

/** features/gamification/rules/hearts — view model incl. next refill time. */
export type ViewHearts = (state: HeartsState, now: Date) => HeartsView;

/** features/gamification/rules/daily-goal */
export type ComputeDailyGoalProgress = (
  results: readonly LessonResult[],
  goalXp: DailyGoalXp,
  today: LocalDate,
) => DailyGoalProgress;

/** features/gamification/rules/progress — full aggregate from the result set. */
export type ComputeUserProgress = (input: {
  courseId: Slug;
  results: readonly LessonResult[];
  hearts: HeartsState;
  goalXp: DailyGoalXp;
  today: LocalDate;
  now: Date;
}) => UserProgress;

/**
 * features/path/rules — lessons unlock in course order (US-GAM-02). With `startLevel`
 * (`Settings.startLevel`, CTO-015, ADR-013): every lesson of an earlier level is
 * `available` (unless completed); the frontier is the first not-completed lesson at or
 * after the first lesson of `startLevel`. Missing, unknown or contentless level = the
 * first level of the course (the pre-CTO-015 behaviour).
 */
export type ComputePathNodes = (
  course: Course,
  completedLessonIds: readonly Slug[],
  activeLessonId: Slug | null,
  startLevel?: CefrLevel,
) => PathNode[];

/**
 * features/gamification/rules/goal-plan — status of the goal date (CTO-017, ADR-015,
 * PD-071 §1.3; implemented by GAM-013). Pure: it creates and changes no result, XP,
 * streak, hearts or setting. The rule, exactly:
 *
 * 1. `null` when `goalPlan` is missing/`null`, or `goalPlan.targetLevel` is not a level
 *    of `course` with at least one lesson (levels by `Unit.level`, course order, ADR-008).
 * 2. Effective start level = `startLevel` if it is a level of the course with content,
 *    else the first level (same fallback as `ComputePathNodes`, ADR-013).
 * 3. `lessonsLeft` = lessons (checkpoints included) not in `completedLessonIds`, in every
 *    level from the effective start level through `targetLevel` inclusive. Earlier levels
 *    are never counted. If `targetLevel` comes before the start level, only
 *    `targetLevel`'s not-completed lessons are counted.
 * 4. `daysLeft` = `targetDate − today` in calendar days (local dates, so DST and time
 *    zones don't change it; the target day itself is not a study day). May be ≤ 0.
 * 5. When `lessonsLeft > 0` and `daysLeft ≥ 1`: `lessonsPerDay = ceil(lessonsLeft /
 *    daysLeft)`; `requiredXp = lessonsPerDay × GAME_CONFIG.xpPerLesson`;
 *    `suggestedDailyGoalXp` = the smallest `GAME_CONFIG.dailyGoalOptions` value
 *    ≥ `requiredXp`, else the largest option.
 * 6. `status`, first match wins:
 *    `reached` if `lessonsLeft = 0` (any date); `date-passed` if `daysLeft ≤ 0`;
 *    `on-track` if `requiredXp ≤ dailyGoalXp`; `raise-goal` if `requiredXp ≤` the largest
 *    option; else `tight`. For `reached` and `date-passed`, `lessonsPerDay` and
 *    `suggestedDailyGoalXp` are `null`.
 * 7. Based on the daily goal, never on past pace. The result satisfies
 *    `GoalPlanStatusSchema`; `targetLevel` / `targetDate` are copied from `goalPlan`.
 *
 * Example: today 2026-11-21, start A1, target A2 by 2027-03-12, nothing completed in a
 * course with A1 = 60 and A2 = 70 lessons → lessonsLeft 130, daysLeft 111,
 * lessonsPerDay 2, suggested 20; `on-track` at a 20 XP goal, `raise-goal` at 10.
 */
export type ComputeGoalPlan = (input: {
  course: Course;
  completedLessonIds: readonly Slug[];
  /** `Settings.startLevel`; missing = first level of the course. */
  startLevel?: CefrLevel | undefined;
  /** `Settings.goalPlan`; missing or `null` = no goal date → returns `null`. */
  goalPlan?: GoalPlan | null | undefined;
  today: LocalDate;
  dailyGoalXp: DailyGoalXp;
}) => GoalPlanStatus | null;

/** Device-local calendar date of an instant (`YYYY-MM-DD` in the device timezone). */
export type ToLocalDate = (instant: Date, timeZone: string) => LocalDate;

// ---------------------------------------------------------------------------
// Data layer (async; implemented in src/lib/** by dev-platform). The UI calls
// these through TanStack Query hooks; local Dexie is the source of truth.
// ---------------------------------------------------------------------------

/** src/lib/content — bundled, schema-validated course content. Works offline. */
export interface ContentRepository {
  getCourse(courseId: Slug): Promise<Course>;
  getLesson(courseId: Slug, lessonId: Slug): Promise<Lesson>;
}

/** src/lib/offline — local Dexie store for the current identity. */
export interface ProgressRepository {
  getIdentity(): Promise<Identity>;
  listLessonResults(courseId: Slug): Promise<LessonResult[]>;
  /** Persists the result AND enqueues it for sync in one Dexie transaction. */
  saveLessonResult(result: LessonResult): Promise<void>;
  getHearts(): Promise<HeartsState>;
  /** Persists and enqueues (LWW). */
  saveHearts(state: HeartsState): Promise<void>;
}

/**
 * Settings fields the learner can change (CR-002). `dailyGoalXp` is a plain number so
 * UI input is validated at runtime: an option outside `DAILY_GOAL_OPTIONS` is rejected
 * with a typed error and nothing is stored. `goalPlan: null` clears the goal date
 * (CTO-017, ADR-015): the repository spreads the patch, so the stored settings then hold
 * `goalPlan: null`, which `SettingsSchema` accepts and readers treat as "no goal date".
 * Never send `goalPlan: undefined` (it is dropped, ADR-013 Compatibility).
 */
export type SettingsPatch = Partial<
  Pick<
    Settings,
    "courseId" | "soundEffectsEnabled" | "speakingExercisesEnabled" | "startLevel" | "goalPlan"
  >
> & { dailyGoalXp?: number };

export interface ProfileRepository {
  getProfile(): Promise<Profile>;
  updateProfile(update: ProfileUpdate): Promise<Profile>;
  /** Rejects before onboarding has saved settings; use `findSettings` to check. */
  getSettings(): Promise<Settings>;
  /** Like `getSettings`, but `null` before onboarding instead of rejecting (CR-002). */
  findSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<void>;
  /**
   * Merges `patch` into the settings and returns the result (CR-002). The first call
   * must include `courseId` and `dailyGoalXp`; missing toggles take `DEFAULT_SETTINGS`.
   */
  updateSettings(patch: SettingsPatch): Promise<Settings>;
  /** Sets `Profile.onboardedAt` (kept if already set). Requires saved settings (CR-002). */
  completeOnboarding(): Promise<Profile>;
}

/** src/lib/sync — drains the queue to Supabase when online. */
export interface SyncEngine {
  status(): SyncStatus;
  subscribe(listener: (status: SyncStatus) => void): () => void;
  /** Push pending records (idempotent), then pull remote changes. Never throws. */
  syncNow(): Promise<SyncPushResult>;
  pending(): Promise<SyncQueueRecord[]>;
}

/** src/features/auth — guest → account migration (US-PLT-05). Needs network. */
export type MigrateGuestToAccount = (payload: GuestMigrationPayload) => Promise<void>;
