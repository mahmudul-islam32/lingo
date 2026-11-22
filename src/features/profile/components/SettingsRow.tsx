import type { ReactNode, Ref } from "react";
import { Button } from "@/components/ui";

export interface SettingsRowProps {
  /** Row label, rendered as the row's heading (e.g. "Daily goal"). */
  label: string;
  labelId: string;
  /** Current value, e.g. "Regular · 20 XP". */
  value: ReactNode;
  valueTestId?: string;
  /** Accessible name of the Change button, e.g. "Change daily goal". */
  changeLabel: string;
  /** Visible text of the button. Default "Change" (e.g. "Set" for an empty goal date). */
  actionText?: string;
  onChange: () => void;
  changeRef?: Ref<HTMLButtonElement>;
  /** Dialog, error message … rendered inside the row. */
  children?: ReactNode;
}

/**
 * A Profile settings row (design v2, PLT-026 AC 14): white card, label on the left,
 * value and "Change" on the right. The dialog that "Change" opens is the caller's.
 */
export function SettingsRow({
  label,
  labelId,
  value,
  valueTestId,
  changeLabel,
  actionText = "Change",
  onChange,
  changeRef,
  children,
}: SettingsRowProps) {
  return (
    <section
      aria-labelledby={labelId}
      className="flex flex-col gap-2 rounded-card border-2 border-border bg-surface py-1.5 pr-1.5 pl-4 shadow-3d-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <h3 id={labelId} className="font-body text-base font-bold">
          {label}
        </h3>
        <div className="flex min-w-0 items-center gap-1">
          <span data-testid={valueTestId} className="text-right text-fg-muted">
            {value}
          </span>
          <Button ref={changeRef} variant="ghost" aria-label={changeLabel} onClick={onChange}>
            {actionText}
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
}
