"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, CrossIcon, VisuallyHidden, cn } from "@/components/ui";
import { CONTENT_RULES } from "@/contracts";
import { shuffle } from "../shuffle";
import type { ExerciseComponentProps } from "../types";

export interface MultipleChoiceExerciseProps extends ExerciseComponentProps<"multiple_choice"> {
  /** Random source for the option shuffle; inject a fixed one in tests. */
  random?: () => number;
}

type Option = ExerciseComponentProps<"multiple_choice">["exercise"]["options"][number];

/** Content is playable when it has enough options and the correct id is among them. */
function isPlayable(options: readonly Option[], correctOptionId: string): boolean {
  return (
    options.length >= CONTENT_RULES.multipleChoiceMinOptions &&
    options.some((option) => option.id === correctOptionId)
  );
}

/**
 * Multiple-choice exercise (LES-004, design v2 LES-021): a prompt and 3–4 shuffled text
 * options in a `radiogroup`, shown as a 2 x 2 grid of numbered tiles (one column of rows
 * when an option is too long for a tile at 375 px). Arrow keys move and select (wrapping), digits 1–4 select. Reports the
 * selected option via `onAnswerChange`; never checks the answer itself.
 */
export function MultipleChoiceExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  review,
  onAnswerChange,
  onSkip,
  random = Math.random,
}: MultipleChoiceExerciseProps) {
  // Shuffle once per mount; the player remounts on every presentation (`key`).
  const [options] = useState(() => shuffle(exercise.options, random));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const playable = isPlayable(exercise.options, exercise.correctOptionId);

  useEffect(() => {
    if (!playable) onSkip("invalid_content");
    // Report once per mount; `onSkip` identity changes must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playable]);

  if (!playable) return null;

  const locked = disabled || review !== null;
  const selectedIndex = options.findIndex((option) => option.id === selectedId);
  const focusableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function select(index: number, moveFocus: boolean) {
    const option = options[index];
    if (!option || locked) return;
    if (moveFocus) optionRefs.current[index]?.focus();
    if (option.id === selectedId) return;
    setSelectedId(option.id);
    onAnswerChange({ type: "multiple_choice", optionId: option.id });
  }

  function handleGroupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const count = options.length;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = selectedIndex < 0 ? 0 : (selectedIndex + 1) % count;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = selectedIndex < 0 ? count - 1 : (selectedIndex - 1 + count) % count;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, true);
  }

  function handleRootKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!/^[1-9]$/.test(event.key)) return;
    const index = Number(event.key) - 1;
    if (index >= options.length || index >= CONTENT_RULES.multipleChoiceMaxOptions) return;
    event.preventDefault();
    select(index, true);
  }

  const grid = fitsTwoColumns(options);

  return (
    <section className="flex w-full flex-col gap-6" onKeyDown={handleRootKeyDown}>
      <h2
        id={headingId}
        tabIndex={-1}
        lang={knownLanguage}
        className="font-display text-[1.625rem] leading-tight font-bold text-fg break-words focus:outline-none"
      >
        {exercise.prompt}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-disabled={locked || undefined}
        onKeyDown={handleGroupKeyDown}
        data-layout={grid ? "grid" : "list"}
        className={cn("grid w-full gap-3", grid ? "grid-cols-2" : "grid-cols-1")}
      >
        {options.map((option, index) => {
          const selected = option.id === selectedId;
          const isCorrect = review !== null && option.id === exercise.correctOptionId;
          const isWrongPick = review !== null && selected && !isCorrect;
          return (
            <button
              key={option.id}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={locked || undefined}
              tabIndex={index === focusableIndex ? 0 : -1}
              data-state={isCorrect ? "correct" : isWrongPick ? "incorrect" : undefined}
              onClick={() => select(index, false)}
              className={cn(
                "relative flex w-full min-w-0 border-2 bg-surface text-left text-fg",
                grid
                  ? "min-h-32 flex-col items-start gap-3 rounded-tile p-3.5"
                  : "min-h-16 items-center gap-3.5 rounded-card px-4 py-3",
                "focus-visible:focus-ring motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-100",
                isCorrect
                  ? "border-success bg-success-soft text-success-fg shadow-3d-success"
                  : isWrongPick
                    ? "border-danger bg-danger-tint text-danger-fg shadow-3d-danger"
                    : selected
                      ? "border-primary shadow-ring-selected"
                      : "border-border shadow-3d-card",
                !locked &&
                  !selected &&
                  "hover:border-primary-ring active:translate-y-0.5 active:shadow-3d-card-pressed",
                locked && "cursor-default",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border-2 text-[0.8125rem] font-bold tabular-nums",
                  selected && !review
                    ? "border-primary bg-primary-soft text-primary-fg"
                    : "border-border text-fg-muted",
                )}
              >
                {index + 1}
              </span>
              <span
                lang={learningLanguage}
                className={cn(
                  "min-w-0 font-bold break-words hyphens-auto",
                  grid ? "mt-auto font-display text-xl leading-snug" : "flex-1 text-[1.0625rem]",
                )}
              >
                {option.text}
              </span>
              <Marker
                selected={selected}
                isCorrect={isCorrect}
                isWrongPick={isWrongPick}
                className={grid ? "absolute top-3.5 right-3.5" : undefined}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * The 2 x 2 tile grid needs every option to fit a tile at 375 px (about 11 characters
 * per line in the 20 px display font, two lines at most); else one column of rows.
 */
export const GRID_MAX_OPTION_CHARS = 22;
export const GRID_MAX_WORD_CHARS = 11;

function fitsTwoColumns(options: readonly Option[]): boolean {
  return options.every(
    (option) =>
      option.text.length <= GRID_MAX_OPTION_CHARS &&
      option.text.split(/\s+/).every((word) => word.length <= GRID_MAX_WORD_CHARS),
  );
}

/** Top-right marker: a filled check when selected, review icons after "Check". */
function Marker({
  selected,
  isCorrect,
  isWrongPick,
  className,
}: {
  selected: boolean;
  isCorrect: boolean;
  isWrongPick: boolean;
  className?: string;
}) {
  if (isCorrect) {
    return (
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-on-success",
          className,
        )}
        data-marker="correct"
      >
        <CheckIcon size={16} />
        <VisuallyHidden>correct answer</VisuallyHidden>
      </span>
    );
  }
  if (isWrongPick) {
    return (
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-danger text-on-danger",
          className,
        )}
        data-marker="incorrect"
      >
        <CrossIcon size={14} />
        <VisuallyHidden>your answer, incorrect</VisuallyHidden>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      data-marker={selected ? "selected" : "none"}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary bg-primary text-on-primary" : "border-transparent",
        className,
      )}
    >
      {selected && <CheckIcon size={16} />}
    </span>
  );
}
