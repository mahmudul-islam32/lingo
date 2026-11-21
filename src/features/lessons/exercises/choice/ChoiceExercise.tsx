"use client";

import { useEffect } from "react";
import { Card, RichText } from "@/components/ui";
import type { ExerciseComponentProps } from "../types";
import { OptionList } from "../option-list/OptionList";

/**
 * Exam-style question (TELC-001): optional title and reading passage, a question in the
 * learning language and 2–12 options. Reports the chosen option; never checks itself.
 */
export function ChoiceExercise({
  exercise,
  learningLanguage,
  headingId,
  disabled,
  review,
  onAnswerChange,
  onSkip,
}: ExerciseComponentProps<"choice">) {
  const playable = exercise.options.some((o) => o.id === exercise.correctOptionId);
  useEffect(() => {
    if (!playable) onSkip("invalid_content");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playable]);
  if (!playable) return null;

  return (
    <section className="flex w-full min-w-0 flex-col gap-5">
      {exercise.passage && (
        <Card
          tone="flat"
          className="flex max-h-[45dvh] flex-col gap-2 overflow-y-auto"
          tabIndex={0}
        >
          {exercise.title && (
            <p lang={learningLanguage} className="font-display text-lg font-bold text-fg">
              {exercise.title}
            </p>
          )}
          <RichText text={exercise.passage} lang={learningLanguage} className="text-fg" />
        </Card>
      )}
      {!exercise.passage && exercise.title && (
        <p lang={learningLanguage} className="font-semibold text-fg-muted">
          {exercise.title}
        </p>
      )}
      <h2
        id={headingId}
        tabIndex={-1}
        lang={learningLanguage}
        className="font-display text-[1.375rem] leading-tight font-bold break-words text-fg focus:outline-none"
      >
        {exercise.prompt}
      </h2>
      <OptionList
        options={exercise.options}
        correctOptionId={exercise.correctOptionId}
        labelledBy={headingId}
        lang={learningLanguage}
        locked={disabled || review !== null}
        review={review}
        onSelect={(optionId) => onAnswerChange({ type: "choice", optionId })}
      />
    </section>
  );
}
