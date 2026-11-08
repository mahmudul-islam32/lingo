"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { CheckIcon, cn } from "@/components/ui";

export interface RadioCardOption<T extends string | number> {
  value: T;
  /** Main label, part of the accessible name. */
  label: string;
  /** Text on the right (e.g. "20 XP"), also part of the accessible name. */
  trailing?: string;
  /** Secondary line below the label, exposed as the accessible description. */
  description?: string;
}

export interface RadioCardGroupProps<T extends string | number> {
  options: readonly RadioCardOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `id` of the element naming the group (usually the step's `<h1>`). */
  labelledBy: string;
  className?: string;
  /** Optional content rendered after the options (inside the group's wrapper, not a radio). */
  footer?: ReactNode;
}

const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight"]);
const PREV_KEYS = new Set(["ArrowUp", "ArrowLeft"]);

/**
 * Single-choice list of cards following the WAI-ARIA radio group pattern: one Tab stop
 * (roving `tabIndex`: the checked option, or the first one when nothing is checked),
 * arrow keys move focus and select, Home/End jump, Space/Enter select. The checked card
 * shows an indigo border and a check icon, so the state is never colour alone.
 */
export function RadioCardGroup<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  className,
  footer,
}: RadioCardGroupProps<T>) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((o) => o.value === value);
  const tabStop = checkedIndex === -1 ? 0 : checkedIndex;

  function select(index: number) {
    const option = options[index];
    if (!option) return;
    refs.current[index]?.focus();
    onChange(option.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = options.length;
    let target: number | null = null;
    if (NEXT_KEYS.has(event.key)) target = (index + 1) % count;
    else if (PREV_KEYS.has(event.key)) target = (index - 1 + count) % count;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = count - 1;
    else if (event.key === " ") target = index;
    if (target === null) return;
    event.preventDefault();
    select(target);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-col gap-3">
        {options.map((option, index) => {
          const checked = index === checkedIndex;
          const labelId = `${baseId}-${index}-label`;
          const trailingId = `${baseId}-${index}-trailing`;
          const descriptionId = `${baseId}-${index}-description`;
          return (
            <button
              key={String(option.value)}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-labelledby={option.trailing ? `${labelId} ${trailingId}` : labelId}
              aria-describedby={option.description ? descriptionId : undefined}
              tabIndex={index === tabStop ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              data-checked={checked ? "" : undefined}
              className={cn(
                "flex min-h-14 w-full items-center gap-3 rounded-card border-2 px-4 py-3 text-left",
                "focus-visible:focus-ring motion-safe:transition-colors",
                checked
                  ? "border-night-400 bg-surface-raised"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span id={labelId} className="text-lg font-semibold">
                  {option.label}
                </span>
                {option.description && (
                  <span id={descriptionId} className="text-sm text-fg-muted">
                    {option.description}
                  </span>
                )}
              </span>
              {option.trailing && (
                <span id={trailingId} className="shrink-0 font-semibold text-fg-muted">
                  {option.trailing}
                </span>
              )}
              <span
                aria-hidden="true"
                data-testid={checked ? "check-icon" : undefined}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                  checked ? "border-night-400 bg-night-400 text-night-950" : "border-border-strong",
                )}
              >
                {checked && <CheckIcon size={16} />}
              </span>
            </button>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
