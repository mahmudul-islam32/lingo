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
  HeartsState,
  HeartsView,
  PathNode,
  StreakState,
  UserProgress,
  XpEvent,
} from "./gamification";
import type { LessonResult, XpBreakdown } from "./lesson-session";
import type { GuestMigrationPayload, SyncPushResult, SyncQueueRecord, SyncStatus } from "./sync";
import type { DailyGoalXp, Identity, Profile, ProfileUpdate, Settings } from "./user";

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
 * with a typed error and nothing is stored.
 */
export type SettingsPatch = Partial<
  Pick<Settings, "courseId" | "soundEffectsEnabled" | "speakingExercisesEnabled" | "startLevel">
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
