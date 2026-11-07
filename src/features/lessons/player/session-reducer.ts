/**
 * Lesson session queue logic (LES-002, PD-012). Pure: no React, no clock, no storage.
 * Time is always passed in as `now`; ids are passed in as `sessionId`.
 *
 * Rules:
 * - The queue starts as the lesson's exercise ids in content order, minus hidden and
 *   unsupported ones (recorded in `hiddenExerciseIds`, never counted).
 * - "Check" appends an `ExerciseAttempt` copying `outcome`, `mistake` and `heartCost`.
 *   An `incorrect` answer moves the exercise to the end of the queue right away; a
 *   `correct` one is removed on "Continue".
 * - Match pairs are never re-queued, even if a (buggy) incomplete board comes back
 *   `incorrect`: they are removed on "Continue" either way.
 * - "Skipped" exercises are removed at once, without feedback and without re-queue.
 * - Hearts are only deducted when `heartsEnforced` (from v0.3.0, LES-009). When they
 *   reach 0 the session ends as `out_of_hearts` on the following "Continue", so the
 *   learner still sees the correct answer first. This wins over `completed`.
 */
import {
  GAME_CONFIG,
  type AnswerCheckResult,
  type AnswerInput,
  type Exercise,
  type ExerciseAttempt,
  type ExerciseType,
  type IsoDateTime,
  type Lesson,
  type LessonSession,
  type Slug,
  type Uuid,
} from "@/contracts";
import type { ExerciseSkipReason } from "../exercises/types";

export type PlayerPhase =
  /** Waiting for an answer; "Check" is enabled iff `pendingAnswer` is non-null. */
  | "answering"
  /** The answer was checked; the feedback panel is open and inputs are locked. */
  | "feedback"
  /** The session is over (`completed`, `quit` or `out_of_hearts`). */
  | "ended";

export interface PlayerState {
  session: LessonSession;
  /** The lesson's exercises by id (hidden ones included, they're just never queued). */
  exercises: Readonly<Record<Slug, Exercise>>;
  phase: PlayerPhase;
  /** Exercise on screen; `null` once the session has ended or if nothing is playable. */
  currentId: Slug | null;
  /** `${exerciseId}:${attemptIndex}`; fixed for the whole presentation (incl. feedback). */
  presentationKey: string | null;
  /** Last value reported through `onAnswerChange`. */
  pendingAnswer: AnswerInput | null;
  /** Result of the last check, shown in the feedback panel. */
  review: AnswerCheckResult | null;
  /** True from v0.3.0 (LES-009): heart costs are deducted and 0 hearts ends the lesson. */
  heartsEnforced: boolean;
  /** Last "Continue" (or last skip) that emptied the queue. */
  completedAt: IsoDateTime | null;
}

export interface CreateSessionInput {
  lesson: Lesson;
  /** Exercise types the player can render (the registry keys). */
  supportedTypes: ReadonlySet<ExerciseType>;
  /** Extra ids to hide (e.g. speak when the API is missing or disabled). */
  hiddenIds?: readonly Slug[];
  /** Moment the first exercise is shown (criterion 12). */
  now: Date;
  sessionId: Uuid;
  /** Hearts when the lesson starts. Default `GAME_CONFIG.maxHearts` (until LES-009). */
  heartsAtStart?: number;
}

/** Creates the contracts `LessonSession` for a lesson (status `in_progress`). */
export function createSession({
  lesson,
  supportedTypes,
  hiddenIds = [],
  now,
  sessionId,
  heartsAtStart = GAME_CONFIG.maxHearts,
}: CreateSessionInput): LessonSession {
  const hiddenSet = new Set(hiddenIds);
  const queue: Slug[] = [];
  const hidden: Slug[] = [];
  for (const exercise of lesson.exercises) {
    if (hiddenSet.has(exercise.id) || !supportedTypes.has(exercise.type)) hidden.push(exercise.id);
    else queue.push(exercise.id);
  }
  const hearts = Math.max(0, Math.floor(heartsAtStart));
  return {
    sessionId,
    courseId: lesson.courseId,
    unitId: lesson.unitId,
    lessonId: lesson.id,
    status: "in_progress",
    startedAt: now.toISOString(),
    queue,
    hiddenExerciseIds: hidden,
    attempts: [],
    heartsAtStart: hearts,
    heartsRemaining: hearts,
  };
}

export interface CreatePlayerStateInput extends CreateSessionInput {
  heartsEnforced?: boolean;
}

/** Initial player state: the session plus the first presentation. */
export function createPlayerState(input: CreatePlayerStateInput): PlayerState {
  const session = createSession(input);
  const exercises: Record<Slug, Exercise> = {};
  for (const exercise of input.lesson.exercises) exercises[exercise.id] = exercise;
  const base: PlayerState = {
    session,
    exercises,
    phase: "answering",
    currentId: null,
    presentationKey: null,
    pendingAnswer: null,
    review: null,
    heartsEnforced: input.heartsEnforced ?? false,
    completedAt: null,
  };
  return present(base);
}

export type SessionAction =
  | { type: "answer_changed"; answer: AnswerInput | null }
  | { type: "check"; answer: AnswerInput; result: AnswerCheckResult; now: Date }
  | { type: "continue"; now: Date }
  | { type: "skip"; reason: ExerciseSkipReason; now: Date }
  | { type: "quit" };

/** Moves to `queue[0]`, or leaves `currentId` null when the queue is empty. */
function present(state: PlayerState): PlayerState {
  const nextId = state.session.queue[0] ?? null;
  if (nextId === null) {
    return { ...state, currentId: null, presentationKey: null, pendingAnswer: null, review: null };
  }
  const attemptIndex = state.session.attempts.filter((a) => a.exerciseId === nextId).length;
  return {
    ...state,
    phase: "answering",
    currentId: nextId,
    presentationKey: `${nextId}:${attemptIndex}`,
    pendingAnswer: null,
    review: null,
  };
}

/** Ends the session if nothing is left to play; else presents the next exercise. */
function advance(state: PlayerState, now: Date): PlayerState {
  if (state.heartsEnforced && state.session.heartsRemaining === 0) {
    return end(state, "out_of_hearts");
  }
  if (state.session.queue.length === 0) {
    return { ...end(state, "completed"), completedAt: now.toISOString() };
  }
  return present(state);
}

function end(state: PlayerState, status: LessonSession["status"]): PlayerState {
  return {
    ...state,
    session: { ...state.session, status },
    phase: "ended",
    currentId: null,
    presentationKey: null,
    pendingAnswer: null,
    review: null,
  };
}

/** Empty answer of the exercise's type, recorded on skipped attempts. */
export function emptyAnswerFor(exercise: Exercise): AnswerInput {
  switch (exercise.type) {
    case "multiple_choice":
      // The contract has no "no option" value; `skipped` is a valid slug that is never an
      // option id in our content. Raised in CR-002.
      return { type: "multiple_choice", optionId: "skipped" };
    case "word_bank_translate":
      return { type: "word_bank_translate", tiles: [] };
    case "listen":
      return { type: "listen", tiles: [] };
    case "match_pairs":
      return { type: "match_pairs", matches: [], mismatchCount: 0 };
    case "speak":
      return { type: "speak", skipped: true, transcripts: [] };
  }
}

function hasAttempt(session: LessonSession, exerciseId: Slug): boolean {
  return session.attempts.some((a) => a.exerciseId === exerciseId);
}

/** Pure reducer. Actions that don't apply to the current phase return `state` unchanged. */
export function sessionReducer(state: PlayerState, action: SessionAction): PlayerState {
  if (state.session.status !== "in_progress") return state;

  switch (action.type) {
    case "answer_changed": {
      if (state.phase !== "answering" || state.currentId === null) return state;
      if (action.answer !== null && action.answer.type !== state.exercises[state.currentId]?.type) {
        return state;
      }
      return { ...state, pendingAnswer: action.answer };
    }

    case "check": {
      const id = state.currentId;
      if (state.phase !== "answering" || id === null) return state;
      const exercise = state.exercises[id];
      if (!exercise || action.answer.type !== exercise.type || action.result.exerciseId !== id) {
        return state;
      }
      const { result } = action;
      const attempt: ExerciseAttempt = {
        exerciseId: id,
        exerciseType: exercise.type,
        answer: action.answer,
        outcome: result.outcome,
        mistake: result.mistake,
        heartCost: result.heartCost,
        isRetry: hasAttempt(state.session, id),
        answeredAt: action.now.toISOString(),
      };
      let queue = state.session.queue;
      if (result.outcome === "incorrect" && exercise.type !== "match_pairs") {
        // Re-queue (PD-012): the current exercise goes to the end of the queue.
        queue = [...queue.slice(1), id];
      }
      const heartsRemaining = state.heartsEnforced
        ? Math.max(0, state.session.heartsRemaining - result.heartCost)
        : state.session.heartsRemaining;
      return {
        ...state,
        session: {
          ...state.session,
          queue,
          attempts: [...state.session.attempts, attempt],
          heartsRemaining,
        },
        phase: "feedback",
        pendingAnswer: action.answer,
        review: result,
      };
    }

    case "continue": {
      const id = state.currentId;
      if (state.phase !== "feedback" || id === null || state.review === null) return state;
      const exercise = state.exercises[id];
      const resolved = state.review.outcome !== "incorrect" || exercise?.type === "match_pairs";
      const queue =
        resolved && state.session.queue[0] === id
          ? state.session.queue.slice(1)
          : state.session.queue;
      return advance({ ...state, session: { ...state.session, queue } }, action.now);
    }

    case "skip": {
      const id = state.currentId;
      if (state.phase !== "answering" || id === null) return state;
      const exercise = state.exercises[id];
      if (!exercise) return state;
      const attempt: ExerciseAttempt = {
        exerciseId: id,
        exerciseType: exercise.type,
        answer: emptyAnswerFor(exercise),
        outcome: "skipped",
        mistake: false,
        heartCost: 0,
        isRetry: hasAttempt(state.session, id),
        answeredAt: action.now.toISOString(),
      };
      const session: LessonSession = {
        ...state.session,
        queue: state.session.queue.filter((q) => q !== id),
        attempts: [...state.session.attempts, attempt],
      };
      return advance({ ...state, session }, action.now);
    }

    case "quit":
      return end(state, "quit");
  }
}

// ---------------------------------------------------------------------------
// Derived values (selectors). All pure functions of the session.
// ---------------------------------------------------------------------------

export interface SessionStats {
  /** Distinct non-hidden exercises presented so far (skipped ones included). */
  exerciseCount: number;
  /** Distinct exercises with a `skipped` attempt. */
  skippedCount: number;
  /** Distinct exercises answered correctly (progress `aria-valuenow`). */
  correctCount: number;
  /** Attempts with `mistake: true` (PD-012). */
  mistakeCount: number;
  /** Exercises whose first attempt was `correct` with no mistake. */
  firstTryCorrectCount: number;
  /** PD-012: no mistakes and at least one counted (non-skipped) exercise. */
  perfect: boolean;
  /** Progress `aria-valuemax`: counted exercises (= exerciseCount − skippedCount). */
  progressMax: number;
}

export function sessionStats(session: LessonSession): SessionStats {
  const hidden = new Set(session.hiddenExerciseIds);
  const ids = new Set<Slug>();
  for (const id of session.queue) if (!hidden.has(id)) ids.add(id);
  const firstAttempt = new Map<Slug, ExerciseAttempt>();
  const skipped = new Set<Slug>();
  const correct = new Set<Slug>();
  let mistakeCount = 0;
  for (const attempt of session.attempts) {
    if (hidden.has(attempt.exerciseId)) continue;
    ids.add(attempt.exerciseId);
    if (!firstAttempt.has(attempt.exerciseId)) firstAttempt.set(attempt.exerciseId, attempt);
    if (attempt.outcome === "skipped") skipped.add(attempt.exerciseId);
    if (attempt.outcome === "correct") correct.add(attempt.exerciseId);
    if (attempt.mistake) mistakeCount += 1;
  }
  let firstTryCorrectCount = 0;
  for (const attempt of firstAttempt.values()) {
    if (attempt.outcome === "correct" && !attempt.mistake) firstTryCorrectCount += 1;
  }
  const exerciseCount = ids.size;
  const skippedCount = skipped.size;
  const progressMax = exerciseCount - skippedCount;
  return {
    exerciseCount,
    skippedCount,
    correctCount: correct.size,
    mistakeCount,
    firstTryCorrectCount,
    perfect: mistakeCount === 0 && progressMax >= 1,
    progressMax,
  };
}
