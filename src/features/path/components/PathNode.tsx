"use client";

import Link from "next/link";
import { useId, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from "react";
import type { PathNodeState, Slug } from "@/contracts";
import { CheckIcon, HeartIcon, Lumi, cn } from "@/components/ui";
import { lessonHref } from "../rules";
import {
  NO_HEARTS_TEXT,
  REPLAY_TEXT,
  STATE_TEXT,
  lessonNumberText,
  nodeAccessibleName,
} from "./copy";
import { HalfRingIcon } from "./HalfRingIcon";
import { LockIcon } from "./LockIcon";

/**
 * Left-right zigzag (UX notes): offsets of 0 / +48 px / 0 / -48 px (`translate-x-12` =
 * 3rem = 48 px), the maximum allowed at 375 px.
 */
const ZIGZAG = ["translate-x-0", "translate-x-12", "translate-x-0", "-translate-x-12"] as const;

/**
 * Node disc per state. Colours are tokens only (AC17). Outlines use `border-progress`
 * (amber in dark, `glow-700` in light) and `border-border-strong`, both >= 3:1 against
 * the canvas in each theme. The available node is the largest and glows.
 */
const DISC: Record<PathNodeState, string> = {
  completed: "size-16 border-4 border-progress bg-primary text-on-primary",
  available: "size-20 border-4 border-progress bg-surface ring-8 ring-primary/30 shadow-lg",
  in_progress: "size-16 border-4 border-progress bg-surface text-progress",
  locked: "size-16 border-4 border-border-strong bg-surface-raised text-fg-muted",
};

const CONTROL =
  "flex min-h-12 w-44 max-w-full flex-col items-center gap-2 rounded-card p-2 text-center " +
  "focus-visible:focus-ring";

function StateIcon({ state }: { state: PathNodeState }) {
  switch (state) {
    case "completed":
      return <CheckIcon size={30} data-icon="check" />;
    case "available":
      return <Lumi pose="idle" size="sm" />;
    case "in_progress":
      return <HalfRingIcon />;
    case "locked":
      return <LockIcon />;
  }
}

export interface PathNodeItemProps {
  lessonId: Slug;
  /** 1-based, global lesson number (`lessonNumberOf`). */
  number: number;
  title: string;
  state: PathNodeState;
  /** Position on the path, drives the zigzag offset. */
  index: number;
  /** `HeartsView.canStartLesson`. False: playable nodes become dialog buttons (AC9, AC10). */
  canStartLesson: boolean;
  /**
   * Called for nodes that don't navigate: locked ones (AC8) and, at 0 hearts, playable
   * ones (AC9). `element` is the activated control, for focus return.
   */
  onBlockedActivate: (element: HTMLElement) => void;
  /** Optional: called when a lesson link is followed (navigation itself is the link's). */
  onNavigate?: (lessonId: Slug) => void;
  controlRef?: Ref<HTMLAnchorElement | HTMLButtonElement>;
}

/**
 * One lesson on the path (`<li>`). Playable nodes with hearts are a `next/link` to
 * `/lesson/<id>` (AC7; Space also follows it, like a button). Locked nodes and, at
 * 0 hearts, playable ones are a native `<button>`; locked ones are `aria-disabled` but
 * stay focusable (AC8).
 */
export function PathNodeItem({
  lessonId,
  number,
  title,
  state,
  index,
  canStartLesson,
  onBlockedActivate,
  onNavigate,
  controlRef,
}: PathNodeItemProps) {
  const noHeartsId = useId();
  const locked = state === "locked";
  const showNoHearts = !locked && !canStartLesson;
  const name = nodeAccessibleName(number, title, state);
  const className = cn(
    CONTROL,
    locked ? "cursor-not-allowed" : "cursor-pointer",
    ZIGZAG[index % ZIGZAG.length],
  );

  const content: ReactNode = (
    <>
      <span
        aria-hidden="true"
        data-testid="path-node-disc"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          "motion-safe:transition-transform motion-safe:active:scale-95",
          DISC[state],
        )}
      >
        <StateIcon state={state} />
      </span>
      <span className="flex flex-col items-center rounded-control bg-canvas px-2">
        <span className="text-sm font-semibold text-fg-muted">{lessonNumberText(number)}</span>
        <span className="font-bold text-fg">{title}</span>
        <span className={cn("text-sm font-semibold", locked ? "text-fg-muted" : "text-progress")}>
          {STATE_TEXT[state]}
          {state === "completed" && ` · ${REPLAY_TEXT}`}
        </span>
        {showNoHearts && (
          <span id={noHeartsId} className="flex items-center gap-1 text-sm text-fg-muted">
            <HeartIcon filled={false} size="sm" />
            {NO_HEARTS_TEXT}
          </span>
        )}
      </span>
    </>
  );

  const navigates = !locked && canStartLesson;

  return (
    <li className="relative flex justify-center">
      {navigates ? (
        <Link
          ref={controlRef as Ref<HTMLAnchorElement>}
          href={lessonHref(lessonId)}
          aria-label={name}
          data-state={state}
          className={className}
          onClick={() => onNavigate?.(lessonId)}
          onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => {
            // AC7: Space opens the lesson too (links only react to Enter natively).
            if (event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
        >
          {content}
        </Link>
      ) : (
        <button
          ref={controlRef as Ref<HTMLButtonElement>}
          type="button"
          aria-label={name}
          aria-disabled={locked ? "true" : undefined}
          aria-describedby={showNoHearts ? noHeartsId : undefined}
          data-state={state}
          className={className}
          onClick={(event: MouseEvent<HTMLButtonElement>) => onBlockedActivate(event.currentTarget)}
        >
          {content}
        </button>
      )}
    </li>
  );
}
