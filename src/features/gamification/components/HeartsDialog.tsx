"use client";

import type { RefObject } from "react";
import type { HeartsView } from "@/contracts";
import { Button, Dialog, HeartIcon } from "@/components/ui";
import { useMinuteClock } from "../hooks/use-minute-clock";
import { formatHeartRefill, formatHeartsFull } from "../rules/hearts-format";
import { HEARTS_FULL_TEXT, heartsRuleText } from "../rules/hearts-rule-text";
import { HeartsMeter } from "./HeartsMeter";

export interface HeartsDialogProps {
  open: boolean;
  onClose: () => void;
  /** `useHearts().view`. */
  view: HeartsView;
  /** The hearts button: focus returns here on close (GAM-007 AC6). */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * "Hearts" dialog (GAM-007 AC6, AC7): the meter, the refill countdown (or "Your hearts are
 * full.") and the rule line. The countdown follows `useMinuteClock(open)`, so it updates at
 * least once a minute while open and arms no timer while closed.
 */
export function HeartsDialog({ open, onClose, view, returnFocusRef }: HeartsDialogProps) {
  const now = useMinuteClock(open);
  const next = formatHeartRefill(view, now);
  const full = formatHeartsFull(view, now);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        // GAM-012 AC12: heart badge + display-font title; the name stays "Hearts".
        <span className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-danger-tint">
            <HeartIcon size="md" />
          </span>
          Hearts
        </span>
      }
      returnFocusRef={returnFocusRef}
      actions={
        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          Got it
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-center rounded-card border-2 border-danger-border bg-danger-tint px-4 py-3">
          <HeartsMeter current={view.current} max={view.max} size="lg" tone="rose" />
        </div>
        {next === null ? (
          <p className="text-fg">{HEARTS_FULL_TEXT}</p>
        ) : (
          <p className="text-fg" data-testid="hearts-refill">
            {next}
            {full && <span className="block text-fg-muted">{full}</span>}
          </p>
        )}
        <p className="text-fg-muted">{heartsRuleText()}</p>
      </div>
    </Dialog>
  );
}
