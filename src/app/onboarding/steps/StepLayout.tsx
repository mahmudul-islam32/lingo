import type { ReactNode, Ref } from "react";
import { IconButton } from "@/components/ui";
import { ArrowLeftIcon } from "../icons";

export const TOTAL_STEPS = 3;

export interface StepLayoutProps {
  /** `id` of the `<h1>`, used to name the step's radio group. */
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  title: string;
  /** 1-based step number; steps 2 and 3 show "Step N of 3" and a Back button. */
  step: number;
  onBack?: () => void;
  /** Rendered above the heading (the Welcome illustration). */
  hero?: ReactNode;
  children?: ReactNode;
  /** Primary action area, pinned to the bottom of the screen. */
  footer: ReactNode;
}

/**
 * Frame shared by the onboarding steps: optional Back + step indicator, the step's one
 * `<h1>` (focusable with `tabIndex={-1}` so focus can move to it on step change), the
 * content, and a footer pinned to the bottom (sticky, above the safe area).
 */
export function StepLayout({
  headingId,
  headingRef,
  title,
  step,
  onBack,
  hero,
  children,
  footer,
}: StepLayoutProps) {
  return (
    <div className="flex flex-1 flex-col motion-safe:animate-fade-in">
      {step > 1 && (
        <div className="-ml-2 mb-2 flex items-center gap-2">
          {onBack && <IconButton label="Back" icon={<ArrowLeftIcon />} onClick={onBack} />}
          <p className="text-sm font-semibold text-fg-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-6">
        {hero}
        <h1
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight text-balance outline-none"
        >
          {title}
        </h1>
        {children}
      </div>
      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-col gap-3 bg-canvas px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {footer}
      </div>
    </div>
  );
}
