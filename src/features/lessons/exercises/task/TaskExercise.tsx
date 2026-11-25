"use client";

import { useEffect, useId, useState } from "react";
import { Card, RichText } from "@/components/ui";
import type { ExerciseComponentProps } from "../types";

/** Words in a text (whitespace-separated). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/u).length;
}

/**
 * Open writing / speaking task (TELC-001). Shows the task, points to cover and useful
 * phrases. Writing: a text area with a word count. Speaking: prepare and say it aloud.
 * The answer is always ready ("Show model answer"); the model appears in the feedback.
 */
export function TaskExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  onAnswerChange,
}: ExerciseComponentProps<"task">) {
  const [text, setText] = useState("");
  const areaId = useId();
  const writing = exercise.skill === "writing";

  useEffect(() => {
    onAnswerChange({ type: "task", text: "" });
    // Once per mount: the model answer can always be shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex w-full min-w-0 flex-col gap-5">
      <h2
        id={headingId}
        tabIndex={-1}
        lang={learningLanguage}
        className="font-display text-[1.375rem] leading-tight font-bold break-words text-fg focus:outline-none"
      >
        {exercise.title}
      </h2>
      <Card tone="flat" className="flex flex-col gap-3">
        <RichText text={exercise.task} lang={learningLanguage} className="text-fg" />
        {exercise.points && (
          <div className="flex flex-col gap-1">
            <p className="eyebrow text-eyebrow">Cover these points</p>
            <ul lang={learningLanguage} className="flex list-disc flex-col gap-1 pl-5 text-fg">
              {exercise.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      {exercise.phrases && (
        <details className="rounded-card border-2 border-border p-4">
          <summary className="cursor-pointer font-bold text-fg" lang={knownLanguage}>
            Useful phrases ({exercise.phrases.length})
          </summary>
          <ul lang={learningLanguage} className="mt-3 flex list-disc flex-col gap-1 pl-5 text-fg">
            {exercise.phrases.map((phrase, i) => (
              <li key={i}>{phrase}</li>
            ))}
          </ul>
        </details>
      )}
      {writing ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={areaId} className="font-bold text-fg">
            Your text
          </label>
          <textarea
            id={areaId}
            lang={learningLanguage}
            value={text}
            disabled={disabled}
            rows={8}
            maxLength={20000}
            onChange={(event) => {
              setText(event.target.value);
              onAnswerChange({ type: "task", text: event.target.value });
            }}
            className="w-full rounded-control border-2 border-border bg-surface p-3 text-fg focus-visible:focus-ring"
          />
          <p className="text-sm text-fg-muted" aria-live="polite">
            {countWords(text)} words
          </p>
        </div>
      ) : (
        <p className="text-fg-muted">
          Prepare your answer and say it out loud, then compare it with the model answer.
        </p>
      )}
    </section>
  );
}
