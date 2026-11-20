import type { ReactNode, Ref } from "react";
import { IconButton, cn } from "@/components/ui";
import { ArrowLeftIcon } from "../icons";

/** Steps when the course offers a start level choice (PLT-025); 3 without it. */
export const TOTAL_STEPS = 4;

export interface StepLayoutProps {
  /** `id` of the `<h1>`, used to name the step's radio group. */
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  title: string;
  /** 1-based step number; steps after the first show "Step N of total" and a Back button. */
  step: number;
  /** Number of steps in this run (3 when the start level step is skipped). */
  total?: number;
  onBack?: () => void;
  /** Rendered above the heading (the Welcome wordmark, Lumi). */
  hero?: ReactNode;
  /** `display` = the big 36 px Welcome headline (screen 1); `default` = 30 px step titles. */
  headingSize?: "display" | "default";
  /** Muted line under the heading. */
  subline?: ReactNode;
  /** Uppercase label above the options, e.g. "I want to learn" (screen 1). */
  eyebrow?: string;
  children?: ReactNode;
  /** Primary action area, pinned to the bottom of the screen. */
  footer: ReactNode;
}

/**
 * Frame shared by the onboarding steps (design v2 screen 1, PLT-026): optional Back +
 * step indicator, the step's one `<h1>` in the display font (focusable with
 * `tabIndex={-1}` so focus can move to it on step change), an optional muted subline and
 * eyebrow, the content, and a footer pinned to the bottom (sticky, above the safe area)
 * for the full-width primary 3D button.
 */
export function StepLayout({
  headingId,
  headingRef,
  title,
  step,
  total = TOTAL_STEPS,
  onBack,
  hero,
  headingSize = "default",
  subline,
  eyebrow,
  children,
  footer,
}: StepLayoutProps) {
  return (
    <div className="flex flex-1 flex-col motion-safe:animate-fade-in">
      {step > 1 && (
        <div className="-ml-2 mb-2 flex items-center gap-2">
          {onBack && <IconButton label="Back" icon={<ArrowLeftIcon />} onClick={onBack} />}
          <p className="text-sm font-bold text-fg-muted">
            Step {step} of {total}
          </p>
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-7", step === 1 && "pt-4")}>
        {hero}
        <div className="flex flex-col gap-2.5">
          <h1
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              "font-display font-extrabold text-balance outline-none",
              headingSize === "display"
                ? "text-[2.25rem] leading-[1.08] tracking-[-0.02em]"
                : "text-[1.875rem] leading-tight tracking-[-0.015em]",
            )}
          >
            {title}
          </h1>
          {subline && <p className="text-base leading-normal text-fg-muted">{subline}</p>}
        </div>
        {eyebrow || children ? (
          <div className="flex flex-col gap-2.5">
            {eyebrow && <p className="eyebrow text-fg-muted">{eyebrow}</p>}
            {children}
          </div>
        ) : null}
      </div>
      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-col gap-3.5 bg-canvas px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {footer}
      </div>
    </div>
  );
}
