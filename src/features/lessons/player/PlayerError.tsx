"use client";

import { useEffect, useRef } from "react";
import { Button, Card, Lumi } from "@/components/ui";

export interface LessonPlayerErrorProps {
  onRetry: () => void;
  /** Back to Learn (`/`). */
  onBack: () => void;
}

/** Error state (criterion 15): lesson couldn't load or has no counted exercises. */
export function LessonPlayerError({ onRetry, onBack }: LessonPlayerErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-canvas px-4 text-fg">
      <Card
        tone="default"
        padding="lg"
        className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
      >
        {/* Decorative (aria-hidden); the heading carries the message (FIX-005). */}
        <span className="flex size-28 items-center justify-center rounded-full bg-primary-tint">
          <Lumi pose="ember" size="md" />
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-[1.375rem] leading-tight font-bold focus:outline-none"
        >
          We couldn&apos;t load this lesson.
        </h1>
        <div className="flex w-full flex-col gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={onRetry}>
            Try again
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onBack}>
            Back to Learn
          </Button>
        </div>
      </Card>
    </main>
  );
}
