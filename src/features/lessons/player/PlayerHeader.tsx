"use client";

import type { ReactNode, Ref } from "react";
import { CloseIcon, IconButton, ProgressBar } from "@/components/ui";

export interface PlayerHeaderProps {
  /** Exercises answered correctly so far (`aria-valuenow`). */
  value: number;
  /** Counted exercises (`aria-valuemax`). */
  max: number;
  /** "Exercise N of M". */
  valueText: string;
  onQuitRequest: () => void;
  closeButtonRef: Ref<HTMLButtonElement>;
  /** Hearts display, filled by LES-009 (v0.3.0). Empty slot until then. */
  heartsSlot?: ReactNode;
}

/** Close button, progress bar and the (reserved) hearts slot. */
export function PlayerHeader({
  value,
  max,
  valueText,
  onQuitRequest,
  closeButtonRef,
  heartsSlot,
}: PlayerHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <IconButton
        ref={closeButtonRef}
        label="Quit lesson"
        icon={<CloseIcon size={24} />}
        onClick={onQuitRequest}
      />
      <ProgressBar
        value={value}
        max={max}
        label="Lesson progress"
        valueText={valueText}
        size="md"
        className="flex-1"
      />
      <div data-testid="hearts-slot" className="flex min-w-11 shrink-0 items-center justify-end">
        {heartsSlot}
      </div>
    </header>
  );
}
