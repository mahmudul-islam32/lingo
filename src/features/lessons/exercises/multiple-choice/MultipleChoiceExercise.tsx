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
 * Multiple-choice exercise (LES-004): a prompt and 3–4 shuffled text options in a
 * `radiogroup`. Arrow keys move and select (wrapping), digits 1–4 select. Reports the
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

  return (
    <section className="flex w-full flex-col gap-6" onKeyDown={handleRootKeyDown}>
      <h2
        id={headingId}
        tabIndex={-1}
        lang={knownLanguage}
        className="text-xl font-bold text-fg break-words focus:outline-none sm:text-2xl"
      >
        {exercise.prompt}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-disabled={locked || undefined}
        onKeyDown={handleGroupKeyDown}
        className="flex w-full flex-col gap-3"
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
                "rounded-card bg-surface text-fg flex min-h-12 w-full items-center gap-3 border-2 px-4 py-3 text-left text-lg",
                "focus-visible:focus-ring motion-safe:transition-colors motion-safe:duration-150",
                selected
                  ? "border-primary font-semibold shadow-md"
                  : "border-border hover:border-border-strong",
                isCorrect && "border-success bg-success-soft text-success-fg",
                isWrongPick && "border-danger bg-danger-soft text-danger-fg",
                locked && "cursor-default",
              )}
            >
              <span
                aria-hidden="true"
                className="rounded-control border-border-strong text-fg-muted hidden h-7 w-7 shrink-0 items-center justify-center border text-sm font-semibold sm:inline-flex"
              >
                {index + 1}
              </span>
              <span lang={learningLanguage} className="min-w-0 flex-1 break-words hyphens-auto">
                {option.text}
              </span>
              <Marker selected={selected} isCorrect={isCorrect} isWrongPick={isWrongPick} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Right-hand marker: a filled check when selected, review icons after "Check". */
function Marker({
  selected,
  isCorrect,
  isWrongPick,
}: {
  selected: boolean;
  isCorrect: boolean;
  isWrongPick: boolean;
}) {
  if (isCorrect) {
    return (
      <span className="text-success-fg flex shrink-0 items-center" data-marker="correct">
        <CheckIcon size={22} />
        <VisuallyHidden>correct answer</VisuallyHidden>
      </span>
    );
  }
  if (isWrongPick) {
    return (
      <span className="text-danger-fg flex shrink-0 items-center" data-marker="incorrect">
        <CrossIcon size={22} />
        <VisuallyHidden>your answer, incorrect</VisuallyHidden>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      data-marker={selected ? "selected" : "none"}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary bg-primary text-on-primary" : "border-border-strong",
      )}
    >
      {selected && <CheckIcon size={14} />}
    </span>
  );
}
