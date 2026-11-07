"use client";

import type { MouseEvent } from "react";
import { cn } from "@/components/ui";
import { MAIN_ID } from "./main-landmark";

export interface SkipLinkProps {
  /** `id` of the element to move focus to. Default: the `<main>` landmark. */
  targetId?: string;
  className?: string;
}

/**
 * First focusable element on every page. Hidden until focused; activating it moves
 * keyboard focus to `<main>` (works without JS through the `#main` fragment as well).
 */
export function SkipLink({ targetId = MAIN_ID, className }: SkipLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.scrollIntoView?.({ block: "start" });
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]",
        "focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-control focus:px-4",
        "focus:bg-primary focus:font-semibold focus:text-on-primary focus-visible:focus-ring",
        className,
      )}
    >
      Skip to content
    </a>
  );
}
