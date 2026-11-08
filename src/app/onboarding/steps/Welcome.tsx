import type { Ref } from "react";
import { Button, Lumi } from "@/components/ui";
import { StepLayout } from "./StepLayout";

export const WELCOME_HEADING = "Learn Spanish in five minutes a day";

export interface WelcomeProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  onStart: () => void;
}

/**
 * Step 1. No "I already have an account" link until accounts exist (PD-011, PLT-018).
 */
export function Welcome({ headingId, headingRef, onStart }: WelcomeProps) {
  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={WELCOME_HEADING}
      step={1}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onStart}>
          Get started
        </Button>
      }
      hero={
        <div className="flex justify-center pt-8">
          <Lumi pose="happy" size="lg" />
        </div>
      }
    >
      <p className="text-lg text-fg-muted">Short lessons, real progress.</p>
    </StepLayout>
  );
}
