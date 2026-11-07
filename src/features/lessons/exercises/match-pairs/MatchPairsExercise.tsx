"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, CrossIcon, VisuallyHidden, cn } from "@/components/ui";
import type { LanguageCode } from "@/contracts";
import { shuffle } from "../shuffle";
import type { ExerciseComponentProps } from "../types";
import {
  clearMismatch,
  createMatchPairsState,
  isComplete,
  select,
  toAnswer,
  type MatchPairsState,
  type MatchSide,
} from "./match-pairs-model";

/** How long a wrong pair stays in the error style before it clears (AC4). */
export const MISMATCH_FEEDBACK_MS = 600;
/** Supported pair range; content ships exactly `CONTENT_RULES.matchPairsCount`. */
export const MATCH_PAIRS_MIN = 3;

export interface MatchPairsExerciseProps extends ExerciseComponentProps<"match_pairs"> {
  /** Random source for the column shuffles; inject a fixed one in tests. */
  random?: () => number;
}

type Pair = ExerciseComponentProps<"match_pairs">["exercise"]["pairs"][number];

/** "Spanish" for `es` (UI is English); falls back to the code. */
function languageName(code: LanguageCode): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Match-pairs exercise (LES-006): learning-language tiles on the left, known-language
 * tiles on the right, each column shuffled separately. Self-completing: calls
 * `onComplete` once with the matches and `mismatchCount` when every pair is matched.
 */
export function MatchPairsExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  onSkip,
  onComplete,
  random = Math.random,
}: MatchPairsExerciseProps) {
  const [columns] = useState(() => ({
    learning: shuffle(exercise.pairs, random),
    known: shuffle(exercise.pairs, random),
  }));
  const [model, setModel] = useState<MatchPairsState>(createMatchPairsState);
  const [announcement, setAnnouncement] = useState({ text: "", count: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  /** Tile (or heading) to focus after the render that disables the focused matched tile. */
  const focusTargetRef = useRef<string | null>(null);
  const playable = exercise.pairs.length >= MATCH_PAIRS_MIN;

  useEffect(() => {
    if (!playable) onSkip("invalid_content");
    // Report once per mount; `onSkip` identity changes must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playable]);

  useEffect(() => {
    const target = focusTargetRef.current;
    if (target === null) return;
    focusTargetRef.current = null;
    if (target === "heading") document.getElementById(headingId)?.focus();
    else tileRefs.current.get(target)?.focus();
  }, [model, headingId]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    [],
  );

  if (!playable) return null;

  const pairIds = exercise.pairs.map((pair) => pair.id);

  function announce(text: string) {
    // The counter alternates a trailing no-break space so repeated texts are re-announced.
    setAnnouncement((previous) => ({ text, count: previous.count + 1 }));
  }

  function handleSelect(side: MatchSide, pair: Pair) {
    if (disabled || completedRef.current) return;
    const result = select(model, side, pair.id, pairIds);
    if (result.event === "ignored") return;
    setModel(result.state);

    if (result.event === "mismatch") {
      announce("Not a match");
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setModel(clearMismatch);
      }, MISMATCH_FEEDBACK_MS);
    } else if (result.event === "matched") {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      announce(`Matched: ${pair.learning}, ${pair.known}`);
      const complete = isComplete(result.state, pairIds);
      // The focused tile becomes disabled; keep keyboard users in the exercise.
      const nextTile = columns.learning.find((p) => !result.state.matched.includes(p.id));
      focusTargetRef.current = complete || !nextTile ? "heading" : `learning:${nextTile.id}`;
      if (complete) {
        completedRef.current = true;
        onComplete(toAnswer(result.state));
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, side: MatchSide, pair: Pair) {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Handle activation ourselves so the player's global Enter ("Check") never fires.
    event.preventDefault();
    if (event.repeat) return;
    handleSelect(side, pair);
  }

  function renderColumn(side: MatchSide) {
    const lang = side === "learning" ? learningLanguage : knownLanguage;
    return (
      <ul
        aria-label={`${languageName(lang)} words`}
        className="flex min-w-0 flex-col gap-3"
        data-column={side}
      >
        {columns[side].map((pair) => {
          const text = side === "learning" ? pair.learning : pair.known;
          const matched = model.matched.includes(pair.id);
          const pressed = model.selected[side] === pair.id;
          const mismatched = model.mismatch !== null && model.mismatch[side] === pair.id;
          return (
            <li key={pair.id} className="flex">
              <button
                ref={(element) => {
                  const key = `${side}:${pair.id}`;
                  if (element) tileRefs.current.set(key, element);
                  else tileRefs.current.delete(key);
                }}
                type="button"
                lang={lang}
                aria-pressed={pressed}
                aria-disabled={(disabled && !matched) || undefined}
                disabled={matched}
                data-state={
                  matched ? "matched" : mismatched ? "mismatch" : pressed ? "selected" : "idle"
                }
                onClick={() => handleSelect(side, pair)}
                onKeyDown={(event) => handleKeyDown(event, side, pair)}
                onKeyUp={(event) => {
                  // Some browsers activate buttons on Space keyup; we already handled keydown.
                  if (event.key === " ") event.preventDefault();
                }}
                className={cn(
                  "rounded-control flex min-h-11 w-full min-w-0 items-center justify-center gap-1.5 border-2 px-2 py-2",
                  "text-center text-base leading-tight font-semibold break-words hyphens-auto",
                  "focus-visible:focus-ring motion-safe:transition-colors motion-safe:duration-150",
                  "bg-surface text-fg border-border-strong hover:bg-surface-raised",
                  pressed &&
                    "border-primary bg-glow-100 text-night-900 hover:bg-glow-100 shadow-md ring-primary ring-2",
                  mismatched &&
                    "border-danger bg-danger-soft text-danger-fg hover:bg-danger-soft motion-safe:animate-shake",
                  matched &&
                    "border-success bg-success-soft text-success-fg cursor-default border-dashed shadow-none",
                )}
              >
                <span className="min-w-0 break-words">{text}</span>
                {matched && <CheckIcon size={18} className="shrink-0" />}
                {mismatched && <CrossIcon size={18} className="shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <h2
        id={headingId}
        tabIndex={-1}
        className="text-fg text-xl font-bold focus:outline-none sm:text-2xl"
      >
        Match the pairs
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {renderColumn("learning")}
        {renderColumn("known")}
      </div>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement.text}
        {announcement.count % 2 === 1 ? " " : ""}
      </VisuallyHidden>
    </section>
  );
}
