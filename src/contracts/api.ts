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
import type { ReviewSelection } from "./review";
import type { Topic } from "./topics";
import type { GuestMigrationPayload, SyncPushResult, SyncQueueRecord, SyncStatus } from "./sync";
import type {
  DailyGoalXp,
  GoalPlan,
  GoalPlanUpdate,
  Identity,
  Profile,
  ProfileUpdate,
  Settings,
} from "./user";

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

/**
 * features/gamification/rules/progress — full aggregate from the result set.
 *
 * Review results (CTO-019 criterion 8, ADR-019 §3; `isReviewResult`) count for `totalXp`,
 * today's XP, the daily goal and the streak like any result, and are **never** in
 * `completedLessonIds` / `lessonsCompletedCount`. The same holds for `ComputePathNodes`,
 * the Practice list and `ComputeGoalPlan` (callers pass `completedLessonIds` from here).
 */
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
  /**
   * This course's plan: `goalPlanFor(settings, course.id)` (CTO-018, ADR-018); missing or
   * `null` = no goal date → returns `null`.
   */
  goalPlan?: GoalPlan | null | undefined;
  today: LocalDate;
  dailyGoalXp: DailyGoalXp;
}) => GoalPlanStatus | null;

/**
 * features/gamification/rules — smart review selection (CTO-019 criterion 9, ADR-019 §5;
 * implemented by GAM-015, which owns the worked examples). Pure. "Outcome" = one
 * `ExerciseOutcome`; its date is the `localDate` of the result that holds it.
 *
 * 1. **Eligible:** every `(lessonId, exerciseId)` of `course` with at least one `correct`
 *    or `incorrect` outcome, whose `exerciseType` is in `REVIEW_EXERCISE_TYPES`, and whose
 *    lesson is still in the course manifest. `skipped` outcomes are ignored. Exercises
 *    never answered are never selected.
 * 2. **Per exercise:** `lastSeen` = date of the latest counted outcome; `correctRun` =
 *    number of `correct` outcomes in a row at the end of its history (ordered by result
 *    `completedAt`). `interval` = 0 days when `correctRun = 0`, else
 *    `GAME_CONFIG.reviewIntervalsDays[min(correctRun, length) − 1]`.
 *    `dueDate = lastSeen + interval`; **due** when `dueDate ≤ today`.
 * 3. **Order:** due first, then not due. Within each group: `correctRun` ascending, then
 *    `dueDate` ascending, then course order of the lesson, then the exercise's position in
 *    its latest result's outcomes, then `exerciseId`. Only the first candidate per
 *    `exerciseId` is kept (no two items with the same id in one session).
 * 4. Returns `{ candidates, dueCount, eligibleCount }` (`ReviewSelectionSchema`):
 *    `candidates` is the full ranked list (the route takes the first
 *    `GAME_CONFIG.reviewSessionSize` that load); `dueCount` counts due eligible exercises.
 *    Exercise ids are unique across all courses (content test, CTO-008, CTO-020), so
 *    counting `(lessonId, exerciseId)` pairs or ids gives the same numbers, and the
 *    dedupe in 3 never drops an eligible exercise for valid content.
 * 5. Worked examples (today 2026-12-10, intervals [1, 3, 7, 14, 30]): A wrong 12-09 → due;
 *    B right 12-09 → run 1, due 12-10, due; C right 12-08, 12-09 → run 2, due 12-12, not
 *    due; D wrong 12-01, right 12-02, 12-05 → run 2, due 12-08, due; E right ×5, last
 *    11-01 → due 12-01, due; F right ×6, last 11-20 → interval 30, due 12-20, not due;
 *    G only skipped, H `speak`, I lesson not in the manifest → not eligible. Order
 *    A, B, D, E, C, F; `dueCount` 4; `eligibleCount` 6.
 * 6. Results of other courses are ignored; review results' outcomes count like any other
 *    (they point to source lessons).
 */
export type SelectReviewItems = (input: {
  course: Course;
  /** The course's results (any kind); results without outcomes contribute nothing. */
  results: readonly LessonResult[];
  today: LocalDate;
}) => ReviewSelection;

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
  /**
   * The topics of a course in file order (CTO-023, ADR-021), validated with
   * `CourseTopicsSchema` and `courseTopicsIssues`; `[]` for a course without topics.
   * Bundled and offline like lessons. Query key: `queryKeys.topics(courseId)`.
   */
  getTopics(courseId: Slug): Promise<Topic[]>;
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
 * with a typed error and nothing is stored. Goal dates are set and cleared per course with
 * `goalPlanUpdate` only; the legacy single `goalPlan` can't be written (CTO-021, ADR-018 §5).
 */
export type SettingsPatch = Partial<
  Pick<Settings, "courseId" | "soundEffectsEnabled" | "speakingExercisesEnabled" | "startLevel">
> & {
  dailyGoalXp?: number;
  /**
   * Sets or clears one course's goal plan (CTO-018, ADR-018 §4). `updateSettings` reads
   * the stored record, applies `normalizeGoalPlans`, spreads the other patch fields, then
   * `withGoalPlan(next, goalPlanUpdate)`; this key itself is never stored.
   */
  goalPlanUpdate?: GoalPlanUpdate;
};

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
