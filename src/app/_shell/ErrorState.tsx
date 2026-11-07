"use client";

import { Button } from "@/components/ui";

export interface ErrorStateProps {
  error: Error & { digest?: string };
  /** Next.js error boundary `reset()`: re-renders the route segment. */
  reset: () => void;
}

/**
 * Friendly error UI (criterion 9). Technical details are shown only in development;
 * a production build never renders `error.message` or a stack trace.
 */
export function ErrorState({ error, reset }: ErrorStateProps) {
  const showDetails = process.env.NODE_ENV === "development";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-fg-muted">Please try again. Your progress on this device is safe.</p>
      {showDetails && error.message && (
        <p className="max-w-full text-sm break-words text-fg-muted" data-testid="error-details">
          {error.message}
        </p>
      )}
      <Button size="lg" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
