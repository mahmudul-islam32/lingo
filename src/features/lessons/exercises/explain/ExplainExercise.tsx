"use client";

import { useEffect } from "react";
import { Card, RichText } from "@/components/ui";
import type { ExerciseComponentProps } from "../types";

/**
 * Teaching card (TELC-001): a title, rich-text body (known language with German inline)
 * and optional example pairs. Ready at once; "Continue" moves on without feedback.
 */
export function ExplainExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  onAnswerChange,
}: ExerciseComponentProps<"explain">) {
  useEffect(() => {
    onAnswerChange({ type: "explain" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex w-full min-w-0 flex-col gap-5">
      <h2
        id={headingId}
        tabIndex={-1}
        className="font-display text-[1.625rem] leading-tight font-bold break-words text-fg focus:outline-none"
      >
        {exercise.title}
      </h2>
      <RichText text={exercise.body} lang={knownLanguage} className="text-[1.0625rem] text-fg" />
      {exercise.examples && (
        <Card tone="flat" className="flex flex-col gap-3">
          <p className="eyebrow text-eyebrow">Examples</p>
          <ul className="flex flex-col gap-3">
            {exercise.examples.map((example, i) => (
              <li key={i} className="flex flex-col">
                <span lang={learningLanguage} className="font-bold text-fg">
                  {example.learning}
                </span>
                <span lang={knownLanguage} className="text-fg-muted">
                  {example.known}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
