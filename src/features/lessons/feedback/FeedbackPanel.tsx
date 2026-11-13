"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AnswerCheckResult, Exercise, LanguageCode } from "@/contracts";
import { Button, CheckIcon, CrossIcon, cn } from "@/components/ui";
import { INCORRECT_HEADING, pickCorrectHeading } from "./headings";

export interface FeedbackPanelProps {
  result: AnswerCheckResult;
  exercise: Exercise;
  learningLanguage: LanguageCode;
  /** Defaults to `learningLanguage` when absent; used for answers in the known language. */
  knownLanguage?: LanguageCode;
  onContinue: () => void;
  /** Injectable for deterministic tests; defaults to `Math.random`. */
  random?: () => number;
}

/** Language of `correctAnswer` for an exercise, for the `lang` attribute. */
export function correctAnswerLanguage(
  exercise: Exercise,
  learningLanguage: LanguageCode,
  knownLanguage: LanguageCode,
): LanguageCode {
  if (exercise.type === "word_bank_translate") {
    return exercise.direction === "to_known" ? knownLanguage : learningLanguage;
  }
  // Multiple-choice options, listen and speak answers are in the learning language
  // (LES-004 technical notes; CON-001 content).
  return learningLanguage;
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Correct / incorrect feedback (LES-003). Replaces the action bar after "Check"; focuses
 * "Continue" on mount and announces its content through a polite live region.
 */
export function FeedbackPanel({
  result,
  exercise,
  learningLanguage,
  knownLanguage = learningLanguage,
  onContinue,
  random,
}: FeedbackPanelProps) {
  const headingId = useId();
  const continueRef = useRef<HTMLButtonElement>(null);
  const correct = result.outcome !== "incorrect";
  const [heading] = useState(() => (correct ? pickCorrectHeading(random) : INCORRECT_HEADING));
  const liveRef = useRef<HTMLSpanElement>(null);

  const correctAnswer = !correct && result.correctAnswer ? result.correctAnswer : null;
  const answerLang = correctAnswerLanguage(exercise, learningLanguage, knownLanguage);
  const heard = exercise.type === "listen" ? (exercise.answers[0] ?? null) : null;

  const parts = [correct ? heading : sentence(heading)];
  if (correctAnswer) parts.push(`Correct answer: ${sentence(correctAnswer)}`);
  if (heard) parts.push(`You heard: ${sentence(heard)}`);
  const message = parts.join(" ");

  useEffect(() => {
    continueRef.current?.focus();
    // Written after mount (not rendered with the region) so screen readers announce it.
    if (liveRef.current) liveRef.current.textContent = message;
    // The panel remounts for every check; announce once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      data-testid="feedback-panel"
      data-outcome={correct ? "correct" : "incorrect"}
      className={cn(
        "max-h-[50dvh] overflow-y-auto border-t-2 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
        "motion-safe:animate-slide-up",
        correct
          ? "border-success bg-success-soft text-success-fg"
          : "border-danger bg-danger-soft text-danger-fg",
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
              correct ? "bg-success text-on-success" : "bg-danger text-on-danger",
            )}
          >
            {correct ? <CheckIcon size={18} /> : <CrossIcon size={18} />}
          </span>
          <h2 id={headingId} className="text-xl font-bold">
            {heading}
          </h2>
        </div>

        {correctAnswer && (
          <p className="break-words">
            <span>Correct answer: </span>
            <strong lang={answerLang} className="font-bold hyphens-auto">
              {correctAnswer}
            </strong>
          </p>
        )}

        {heard && (
          <p className="break-words">
            <span>You heard: </span>
            <span lang={learningLanguage} className="font-semibold">
              {heard}
            </span>
          </p>
        )}

        {/* Same as VisuallyHidden, which doesn't take a ref. */}
        <span
          ref={liveRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="feedback-announcement"
        />

        <Button
          ref={continueRef}
          variant={correct ? "success" : "danger"}
          size="lg"
          fullWidth
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </section>
  );
}
