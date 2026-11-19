"use client";

import type { AnswerCheckResult, Exercise, LanguageCode } from "@/contracts";
import { Button } from "@/components/ui";
import { FeedbackPanel } from "../feedback/FeedbackPanel";

export interface ActionBarProps {
  /** Feedback shown after "Check"; when set, the panel replaces the "Check" button. */
  feedback: { result: AnswerCheckResult; exercise: Exercise; key: string } | null;
  /** True when the current exercise reports an answer ready. */
  canCheck: boolean;
  /** Self-completing exercises (match pairs) have no "Check" button. */
  showCheck: boolean;
  learningLanguage: LanguageCode;
  knownLanguage: LanguageCode;
  onCheck: () => void;
  onContinue: () => void;
  /** Injectable heading randomness for the feedback panel (tests). */
  random?: () => number;
}

/**
 * Bottom bar: the full-width "Check" button (grey and flat while disabled, indigo with a
 * 3D edge when an answer is ready; design v2 screens 3-4), replaced by the feedback sheet
 * after a check (LES-003).
 */
export function ActionBar({
  feedback,
  canCheck,
  showCheck,
  learningLanguage,
  knownLanguage,
  onCheck,
  onContinue,
  random,
}: ActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 shrink-0">
      {feedback ? (
        <FeedbackPanel
          key={feedback.key}
          result={feedback.result}
          exercise={feedback.exercise}
          learningLanguage={learningLanguage}
          knownLanguage={knownLanguage}
          onContinue={onContinue}
          random={random}
        />
      ) : (
        <div className="border-t-2 border-border bg-surface px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            {showCheck ? (
              <Button variant="primary" size="lg" fullWidth disabled={!canCheck} onClick={onCheck}>
                Check
              </Button>
            ) : (
              // Keeps the bar height stable while a match-pairs board is played.
              <div aria-hidden="true" className="min-h-14" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
