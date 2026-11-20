"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  clozeCorrectSentence,
  type AnswerCheckResult,
  type Exercise,
  type LanguageCode,
} from "@/contracts";
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
  // Multiple-choice options, listen and speak answers and the cloze sentence are in the
  // learning language (LES-004 technical notes; CON-001 content; ADR-009).
  return learningLanguage;
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Correct / incorrect feedback (LES-003). Replaces the action bar after "Check"; focuses
 * "Continue" on mount and announces its content through a polite live region.
 * Design v2 (LES-021, screen 5): a red- or green-tint bottom sheet with an icon in a white
 * circle, a display-font heading, an uppercase "Correct answer" eyebrow and a 3D
 * red / green "Continue". Colour is never the only signal (icon + heading text).
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
  // LES-015 AC 4: a correct cloze still shows the full sentence it completed.
  const completed =
    correct && exercise.type === "cloze"
      ? (result.correctAnswer ?? clozeCorrectSentence(exercise))
      : null;

  const parts = [correct ? heading : sentence(heading)];
  if (completed) parts.push(sentence(completed));
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
        "max-h-[50dvh] overflow-y-auto border-t-2 px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6",
        "motion-safe:animate-slide-up",
        correct
          ? "border-success-border bg-success-soft text-success-fg"
          : "border-danger-border bg-danger-soft text-danger-fg",
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            data-testid="feedback-icon"
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface",
              correct ? "text-success" : "text-danger",
            )}
          >
            {correct ? (
              <CheckIcon size={22} strokeWidth={3} />
            ) : (
              <CrossIcon size={22} strokeWidth={3} />
            )}
          </span>
          <h2 id={headingId} className="font-display text-[1.375rem] leading-tight font-extrabold">
            {heading}
          </h2>
        </div>

        {completed && (
          <p
            lang={answerLang}
            className="text-[1.0625rem] font-bold break-words text-fg hyphens-auto"
          >
            {completed}
          </p>
        )}

        {correctAnswer && (
          <p className="flex flex-col gap-1 break-words">
            <span className={cn("eyebrow", correct ? "text-success" : "text-danger")}>
              Correct answer:
            </span>{" "}
            <strong lang={answerLang} className="text-[1.0625rem] font-bold text-fg hyphens-auto">
              {correctAnswer}
            </strong>
          </p>
        )}

        {heard && (
          <p className="flex flex-col gap-1 break-words">
            <span className={cn("eyebrow", correct ? "text-success" : "text-danger")}>
              You heard:
            </span>{" "}
            <span lang={learningLanguage} className="text-[1.0625rem] font-semibold text-fg">
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
          className="mt-1"
        >
          Continue
        </Button>
      </div>
    </section>
  );
}
