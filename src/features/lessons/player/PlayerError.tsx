"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

export interface LessonPlayerErrorProps {
  onRetry: () => void;
  /** Back to Learn (`/`). */
  onBack: () => void;
}

/**
 * Placeholder for the Lumi "ember" pose (GAM-001 is not merged yet). Decorative only;
 * uses tokens, no colour literals.
 */
function EmberPlaceholder() {
  return (
    <div aria-hidden="true" className="relative size-24" data-testid="lumi-ember-placeholder">
      <div className="absolute inset-0 rounded-full bg-primary opacity-20" />
      <div className="absolute inset-6 rounded-full bg-primary opacity-60" />
    </div>
  );
}

/** Error state (criterion 15): lesson couldn't load or has no counted exercises. */
export function LessonPlayerError({ onRetry, onBack }: LessonPlayerErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 text-center text-fg">
      <EmberPlaceholder />
      <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">
        We couldn&apos;t load this lesson.
      </h1>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={onRetry}>
          Try again
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onBack}>
          Back to Learn
        </Button>
      </div>
    </main>
  );
}
