"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { OptionCard, cn } from "@/components/ui";

export interface RadioCardOption<T extends string | number> {
  value: T;
  /** Main label, part of the accessible name. */
  label: string;
  /** Text on the right (e.g. "20 XP"), also part of the accessible name. */
  trailing?: string;
  /** Secondary line below the label, exposed as the accessible description. */
  description?: string;
  /** Decorative leading element, e.g. a course code `Chip` ("DE"). Not part of the name. */
  leading?: ReactNode;
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
 * arrow keys move focus and select, Home/End jump, Space/Enter select. Each option is a
 * design v2 `OptionCard` (PLT-026): the checked card has the indigo ring and a check
 * circle, so the state is never colour alone.
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
            <OptionCard
              key={String(option.value)}
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="radio"
              selected={checked}
              aria-labelledby={option.trailing ? `${labelId} ${trailingId}` : labelId}
              aria-describedby={option.description ? descriptionId : undefined}
              tabIndex={index === tabStop ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              data-checked={checked ? "" : undefined}
              leading={
                option.leading ? (
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    {option.leading}
                  </span>
                ) : undefined
              }
              title={<span id={labelId}>{option.label}</span>}
              description={
                option.description ? (
                  <span id={descriptionId}>{option.description}</span>
                ) : undefined
              }
              trailing={
                option.trailing ? <span id={trailingId}>{option.trailing}</span> : undefined
              }
            />
          );
        })}
      </div>
      {footer}
    </div>
  );
}
