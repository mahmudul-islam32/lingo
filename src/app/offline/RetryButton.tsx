"use client";

import { Button } from "@/components/ui";

/** Reloads the current URL: if the network is back, the learner lands where they wanted. */
export function RetryButton({ reload = () => window.location.reload() }: { reload?: () => void }) {
  return (
    <Button size="lg" onClick={() => reload()}>
      Try again
    </Button>
  );
}
