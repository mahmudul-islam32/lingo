"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { OptionCard, Chip } from "@/components/ui";
import type { AnswerCheckResult, LanguageCode } from "@/contracts";

export interface OptionListOption {
  id: string;
  text: string;
}

export interface OptionListProps {
  options: readonly OptionListOption[];
  correctOptionId: string;
  labelledBy: string;
  lang: LanguageCode;
  locked: boolean;
  review: AnswerCheckResult | null;
  onSelect: (optionId: string) => void;
}

/** Option label: A, B, C … (exam style; 12 options at most). */
export const optionLetter = (index: number) => String.fromCharCode(65 + index);

/**
 * Radio list of long options (TELC-001: `choice`, `listening`). Options keep the authored
 * order (exam answer sheets are ordered: headlines a–j, ads a–l). Arrow keys move and
 * select (wrapping); letter keys A–L select.
 */
export function OptionList({
  options,
  correctOptionId,
  labelledBy,
  lang,
  locked,
  review,
  onSelect,
}: OptionListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.id === selectedId);

  function select(index: number, moveFocus: boolean) {
    const option = options[index];
    if (!option || locked) return;
    if (moveFocus) refs.current[index]?.focus();
    if (option.id === selectedId) return;
    setSelectedId(option.id);
    onSelect(option.id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const count = options.length;
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = selectedIndex < 0 ? 0 : (selectedIndex + 1) % count;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = selectedIndex < 0 ? count - 1 : (selectedIndex - 1 + count) % count;
    } else if (/^[a-l]$/i.test(event.key)) {
      const index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (index < count) next = index;
    }
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-disabled={locked || undefined}
      onKeyDown={onKeyDown}
      className="flex w-full flex-col gap-2.5"
    >
      {options.map((option, index) => {
        const selected = option.id === selectedId;
        const isCorrect = review !== null && option.id === correctOptionId;
        const isWrongPick = review !== null && selected && !isCorrect;
        return (
          <OptionCard
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="radio"
            selected={selected}
            status={isCorrect ? "correct" : isWrongPick ? "incorrect" : undefined}
            aria-disabled={locked || undefined}
            tabIndex={index === (selectedIndex >= 0 ? selectedIndex : 0) ? 0 : -1}
            onClick={() => select(index, false)}
            leading={
              <Chip size="sm" tone="indigo" aria-hidden="true">
                {optionLetter(index)}
              </Chip>
            }
            title={<span lang={lang}>{option.text}</span>}
            className={locked ? "cursor-default" : undefined}
          />
        );
      })}
    </div>
  );
}
