"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import type {
  AnswerCheckResult,
  AnswerInput,
  ExerciseType,
  LanguageCode,
  Lesson,
  LessonSession,
  Slug,
  Uuid,
} from "@/contracts";
import { VisuallyHidden } from "@/components/ui";
import { checkAnswer } from "../checking";
import { exerciseComponents } from "../exercises/registry";
import { TipCard, TipStartBar } from "../tip";
import type {
  ExerciseComponentMap,
  ExerciseComponentProps,
  ExerciseSkipReason,
} from "../exercises/types";
import { ActionBar } from "./ActionBar";
import { LessonPlayerError } from "./PlayerError";
import { PlayerHeader } from "./PlayerHeader";
import { QuitDialog } from "./QuitDialog";
import { sessionStats } from "./session-reducer";
import { createSessionStore, usePlayerState } from "./session-store";
import { summarizeSession, type LessonSessionSummary } from "./summary";

/**
 * Hearts wiring for v0.3.0 (LES-009). The player only counts down the session's
 * `heartsRemaining`; persisting the loss (`loseHearts` + `saveHearts`) is the caller's
 * job through the gamification / data-layer APIs. Without this prop hearts are not
 * deducted and the lesson can't run out of hearts (v0.2.0 behaviour).
 */
export interface LessonPlayerHearts {
  /** Hearts at lesson start (after the lazy refill). */
  initial: number;
  /** Called right after a "Check" whose result costs hearts (`heartCost > 0`). */
  onLose: (cost: number) => void;
  /** Called once when hearts reach 0, after the learner presses "Continue". No result. */
  onOutOfHearts: (session: LessonSession) => void;
}

export interface LessonPlayerProps {
  lesson: Lesson;
  learningLanguage: LanguageCode;
  knownLanguage: LanguageCode;
  /** Called once after the last "Continue". */
  onFinish: (summary: LessonSessionSummary) => void;
  /** Called after a confirmed quit; the route navigates to "/". */
  onQuit: () => void;
  /** Exercise components by type. Default: the registry. A missing type is left out. */
  components?: ExerciseComponentMap;
  /** Extra exercise ids to hide (e.g. speak when unsupported or disabled). */
  hiddenExerciseIds?: readonly Slug[];
  /** Hearts (LES-009). Omit in v0.2.0. */
  hearts?: LessonPlayerHearts;
  /** Hearts display rendered in the header's reserved slot (LES-009). */
  heartsSlot?: ReactNode;
  /** "Try again" in the error state. Default: reload the page. */
  onRetry?: () => void;
  /** Clock, injectable for tests. Default `() => new Date()`. */
  now?: () => Date;
  /** Session id factory, injectable for tests. Default `crypto.randomUUID()`. */
  createId?: () => Uuid;
  /** Randomness for the feedback heading, injectable for tests. */
  random?: () => number;
}

type AnyExerciseComponent = ComponentType<ExerciseComponentProps>;

const defaultNow = () => new Date();
const defaultCreateId = () => crypto.randomUUID();
const defaultRetry = () => window.location.reload();

/** Targets whose own Enter behaviour wins over the global "Check"/"Continue" shortcut. */
const ENTER_IGNORED_TARGETS =
  "button, a[href], input, textarea, select, [role=radio], [contenteditable=''], [contenteditable='true']";

/**
 * Exception to the above (FIX-001): a choice option (`role=radio`, ARIA radio pattern)
 * has no Enter behaviour of its own once it is selected (arrow keys select), so Enter
 * there means "Check" and a keyboard user doesn't have to Tab to the button
 * (LES-002 AC3). An unselected option keeps its native activation (Enter selects it),
 * except during feedback, where options are locked and Enter means "Continue".
 */
const ENTER_PASSTHROUGH_CHECKED = "[role=radio][aria-checked=true], input[type=radio]:checked";
const ENTER_PASSTHROUGH_ANY = "[role=radio], input[type=radio]";

/** True when the focused element handles Enter itself and the shortcut must stand back. */
function targetOwnsEnter(target: EventTarget | null, inFeedback: boolean): boolean {
  if (!(target instanceof Element)) return false;
  const owner = target.closest(ENTER_IGNORED_TARGETS);
  if (!owner) return false;
  return !owner.matches(inFeedback ? ENTER_PASSTHROUGH_ANY : ENTER_PASSTHROUGH_CHECKED);
}

function supportedTypesOf(components: ExerciseComponentMap): Set<ExerciseType> {
  const types = new Set<ExerciseType>();
  for (const [type, component] of Object.entries(components)) {
    if (component) types.add(type as ExerciseType);
  }
  return types;
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Lesson player (LES-002): one exercise at a time, progress bar, Check/Continue,
 * re-queue of wrong answers (PD-012), quit confirmation, feedback panel (LES-003).
 * A lesson with a `tip` opens on a tip card (LES-013) until "Start"; the card is not an
 * exercise (no progress, accuracy or hearts) and the quit dialog works from it.
 *
 * The session is created once per mount: render it with `key={lesson.id}` if the lesson
 * can change under the same route.
 */
export function LessonPlayer({
  lesson,
  learningLanguage,
  knownLanguage,
  onFinish,
  onQuit,
  components = exerciseComponents,
  hiddenExerciseIds,
  hearts,
  heartsSlot,
  onRetry = defaultRetry,
  now = defaultNow,
  createId = defaultCreateId,
  random,
}: LessonPlayerProps) {
  const [store] = useState(() =>
    createSessionStore({
      lesson,
      supportedTypes: supportedTypesOf(components),
      hiddenIds: hiddenExerciseIds,
      now: now(),
      sessionId: createId(),
      heartsAtStart: hearts?.initial,
      heartsEnforced: hearts !== undefined,
    }),
  );
  // Components are fixed for the session, like the supported types.
  const [componentMap] = useState(components);
  const state = usePlayerState(store);
  const dispatch = store.getState().dispatch;

  const baseId = useId();
  const headingId = `${baseId}-prompt`;
  const tipHeadingId = `${baseId}-tip-heading`;
  const tipTextId = `${baseId}-tip-text`;
  const tip = lesson.tip?.trim() ?? "";
  const [showTip, setShowTip] = useState(tip.length > 0);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const exerciseAreaRef = useRef<HTMLDivElement>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const quitOpenRef = useLatest(quitOpen);
  const nowRef = useLatest(now);
  const callbacks = useLatest({ onFinish, onQuit, hearts });
  const endedRef = useRef(false);

  // -- Session end → callbacks (exactly once) ---------------------------------------
  const { status } = state.session;
  useEffect(() => {
    if (endedRef.current || status === "in_progress") return;
    endedRef.current = true;
    const { session, completedAt } = store.getState().state;
    if (status === "completed" && completedAt) {
      callbacks.current.onFinish(summarizeSession(session, completedAt));
    } else if (status === "quit") {
      callbacks.current.onQuit();
    } else if (status === "out_of_hearts") {
      callbacks.current.hearts?.onOutOfHearts(session);
    }
  }, [status, store, callbacks]);

  // -- Actions -------------------------------------------------------------------------
  const runCheck = useCallback(
    (answer: AnswerInput) => {
      const current = store.getState().state;
      if (current.phase !== "answering" || current.currentId === null) return;
      const exercise = current.exercises[current.currentId];
      if (!exercise || exercise.type !== answer.type) return;
      const result = checkAnswer({ exercise, answer });
      dispatch({ type: "check", answer, result, now: nowRef.current() });
      const heartsConfig = callbacks.current.hearts;
      if (heartsConfig && result.heartCost > 0) heartsConfig.onLose(result.heartCost);
    },
    [store, dispatch, nowRef, callbacks],
  );

  const handleCheck = useCallback(() => {
    const answer = store.getState().state.pendingAnswer;
    if (answer) runCheck(answer);
  }, [store, runCheck]);

  const handleContinue = useCallback(() => {
    dispatch({ type: "continue", now: nowRef.current() });
  }, [dispatch, nowRef]);

  const handleAnswerChange = useCallback(
    (answer: AnswerInput | null) => dispatch({ type: "answer_changed", answer }),
    [dispatch],
  );

  const handleSkip = useCallback(
    (reason: ExerciseSkipReason) => dispatch({ type: "skip", reason, now: nowRef.current() }),
    [dispatch, nowRef],
  );

  const startLesson = useCallback(() => {
    dispatch({ type: "start", now: nowRef.current() });
    setShowTip(false);
  }, [dispatch, nowRef]);

  const openQuit = useCallback(() => setQuitOpen(true), []);
  const keepLearning = useCallback(() => setQuitOpen(false), []);
  const confirmQuit = useCallback(() => {
    setQuitOpen(false);
    dispatch({ type: "quit" });
  }, [dispatch]);

  // -- Global keyboard: Enter = Check/Continue, Escape = quit dialog -------------------
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || quitOpenRef.current) return;
      const current = store.getState().state;
      if (current.phase === "ended") return;
      if (event.key === "Escape") {
        event.preventDefault();
        openQuit();
        return;
      }
      if (event.key !== "Enter" || event.altKey || event.ctrlKey || event.metaKey) return;
      if (targetOwnsEnter(event.target, current.phase === "feedback")) return;
      if (current.phase === "answering") {
        if (!current.pendingAnswer) return;
        event.preventDefault();
        handleCheck();
      } else if (current.phase === "feedback") {
        event.preventDefault();
        handleContinue();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store, quitOpenRef, openQuit, handleCheck, handleContinue]);

  // -- Focus the prompt heading on each new exercise (criterion 13) --------------------
  // While the tip card is shown, "Start" has focus instead (LES-013 AC6).
  const { presentationKey } = state;
  useEffect(() => {
    if (showTip) {
      startButtonRef.current?.focus();
      return;
    }
    if (!presentationKey) return;
    const heading = document.getElementById(headingId);
    if (heading) heading.focus();
    else exerciseAreaRef.current?.focus();
  }, [presentationKey, headingId, showTip]);

  // -- Render --------------------------------------------------------------------------
  const stats = sessionStats(state.session);
  const isEmpty = state.session.status === "in_progress" && state.currentId === null;
  if (isEmpty || stats.exerciseCount === 0) {
    return <LessonPlayerError onRetry={onRetry} onBack={onQuit} />;
  }

  const total = stats.progressMax;
  const position = Math.min(stats.correctCount + 1, Math.max(total, 1));
  const valueText = `Exercise ${position} of ${total}`;

  const exercise = state.currentId ? state.exercises[state.currentId] : undefined;
  const Component = exercise
    ? (componentMap[exercise.type] as AnyExerciseComponent | undefined)
    : undefined;
  const isMatchPairs = exercise?.type === "match_pairs";
  const review: AnswerCheckResult | null = state.phase === "feedback" ? state.review : null;

  const feedback =
    exercise && review && state.presentationKey
      ? {
          key: state.presentationKey,
          exercise,
          // Match pairs complete by themselves: always the "correct" panel (LES-003 notes).
          result: isMatchPairs
            ? { ...review, outcome: "correct" as const, correctAnswer: null }
            : review,
        }
      : null;

  return (
    <div className="flex h-dvh flex-col bg-canvas text-fg">
      <PlayerHeader
        value={stats.correctCount}
        max={total}
        valueText={valueText}
        onQuitRequest={openQuit}
        closeButtonRef={closeButtonRef}
        heartsSlot={heartsSlot}
      />

      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {!showTip && state.phase === "answering" && state.presentationKey ? valueText : ""}
      </VisuallyHidden>

      <main
        ref={exerciseAreaRef}
        tabIndex={-1}
        aria-label={lesson.title}
        data-testid="exercise-area"
        className="min-h-0 flex-1 overflow-y-auto focus:outline-none"
      >
        {showTip && (
          <TipCard
            tip={tip}
            knownLanguage={knownLanguage}
            textId={tipTextId}
            headingId={tipHeadingId}
          />
        )}
        {!showTip && exercise && Component && state.presentationKey && (
          <div
            key={state.presentationKey}
            className="mx-auto w-full max-w-2xl px-4 py-4 motion-safe:animate-slide-up"
          >
            <Component
              exercise={exercise}
              presentationKey={state.presentationKey}
              learningLanguage={learningLanguage}
              knownLanguage={knownLanguage}
              headingId={headingId}
              disabled={state.phase !== "answering"}
              review={isMatchPairs ? null : review}
              onAnswerChange={handleAnswerChange}
              onSkip={handleSkip}
              onComplete={runCheck}
            />
          </div>
        )}
      </main>

      {showTip && state.phase !== "ended" && (
        <TipStartBar onStart={startLesson} describedBy={tipTextId} startRef={startButtonRef} />
      )}
      {!showTip && state.phase !== "ended" && (
        <ActionBar
          feedback={feedback}
          canCheck={state.pendingAnswer !== null}
          showCheck={!isMatchPairs}
          learningLanguage={learningLanguage}
          knownLanguage={knownLanguage}
          onCheck={handleCheck}
          onContinue={handleContinue}
          random={random}
        />
      )}

      <QuitDialog
        open={quitOpen}
        onKeepLearning={keepLearning}
        onQuit={confirmQuit}
        returnFocusRef={closeButtonRef}
      />
    </div>
  );
}
