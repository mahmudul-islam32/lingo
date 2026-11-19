"use client";

import Link from "next/link";
import { memo, useId, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from "react";
import type { Slug } from "@/contracts";
import { CheckIcon, HeartIcon, StarIcon, cn } from "@/components/ui";
import { canStartNode, lessonHref, type PathNodeDisplay } from "../rules";
import {
  NO_HEARTS_TEXT,
  PRACTICE_EARNS_HEARTS_TEXT,
  REPLAY_TEXT,
  STATE_TEXT,
  lessonNumberText,
  nodeAccessibleName,
  nodePillText,
} from "./copy";
import { HalfRingIcon } from "./HalfRingIcon";
import { LockIcon } from "./LockIcon";
import { OpenLockIcon } from "./OpenLockIcon";

/**
 * Left-right zigzag (UX notes): offsets of 0 / +48 px / 0 / -48 px (`translate-x-12` =
 * 3rem = 48 px), the maximum allowed at 375 px.
 */
const ZIGZAG = ["translate-x-0", "translate-x-12", "translate-x-0", "-translate-x-12"] as const;

/**
 * Node disc per state (design v2, screen 2): big round "3D" discs with a solid bottom
 * edge, never a blur. Tokens only (AC17).
 * - completed: indigo with a white check, `shadow-3d-node` (0 6px 0 #312E81).
 * - available / in progress (the frontier, "current"): the largest disc, coral with a
 *   white icon and a soft coral halo (`shadow-3d-node-current`). White on coral is 3.3:1,
 *   so it carries an icon only, never text (ADR-014).
 * - locked: light grey with a grey lock and a grey edge (`shadow-3d-node-locked`).
 * - open (a skipped-level lesson, GAM-011): the same grey disc with an indigo open lock,
 *   so it reads as playable without competing with the current node.
 */
const DISC: Record<PathNodeDisplay, string> = {
  completed: "size-18 bg-primary text-on-primary shadow-3d-node",
  available: "size-21 bg-accent text-on-accent shadow-3d-node-current",
  in_progress: "size-21 bg-accent text-on-accent shadow-3d-node-current",
  locked: "size-18 bg-disabled text-fg-muted shadow-3d-node-locked",
  open: "size-18 bg-disabled text-primary shadow-3d-node-locked",
};

const CONTROL =
  "group flex min-h-12 w-44 max-w-full flex-col items-center gap-2 rounded-card p-2 text-center " +
  "focus-visible:focus-ring";

function StateIcon({ state }: { state: PathNodeDisplay }) {
  switch (state) {
    case "completed":
      return <CheckIcon size={32} strokeWidth={3} data-icon="check" />;
    case "available":
      return <StarIcon size={36} data-icon="star" />;
    case "in_progress":
      return <HalfRingIcon size={34} />;
    case "locked":
      return <LockIcon size={28} />;
    case "open":
      return <OpenLockIcon size={28} />;
  }
}

export interface PathNodeItemProps {
  lessonId: Slug;
  /**
   * 1-based lesson number: global (`lessonNumberOf`) without `unitNumber`, within the unit
   * with it (GAM-010).
   */
  number: number;
  /** Unit number within its level (GAM-010 AC5); `null`/omitted for courses without levels. */
  unitNumber?: number | null;
  title: string;
  /** Node state, or `open` for a skipped-level lesson (`pathNodeDisplay`, GAM-011). */
  state: PathNodeDisplay;
  /** Position on the path, drives the zigzag offset. */
  index: number;
  /**
   * `HeartsView.canStartLesson`. False (0 hearts): not-completed playable nodes become
   * dialog buttons (AC9, AC10); completed ones stay links (practice, GAM-011 AC15).
   */
  canStartLesson: boolean;
  /**
   * Called for nodes that don't navigate: locked ones (AC8) and, at 0 hearts, playable
   * not-completed ones (AC9). `element` is the activated control, for focus return. Keep it stable
   * (`useCallback`): nodes are memoised (GAM-010 performance).
   */
  onBlockedActivate: (lessonId: Slug, element: HTMLElement) => void;
  /** Optional: called when a lesson link is followed (navigation itself is the link's). */
  onNavigate?: (lessonId: Slug) => void;
  controlRef?: Ref<HTMLAnchorElement | HTMLButtonElement>;
}

/**
 * One lesson on the path (`<li>`). Nodes that may start (`canStartNode`) are a `next/link`
 * to `/lesson/<id>` (AC7; Space also follows it, like a button): playable ones with
 * hearts, and completed ones at any hearts (practice, GAM-011). Locked nodes and, at
 * 0 hearts, not-completed playable ones are a native `<button>`; locked ones are
 * `aria-disabled` but stay focusable (AC8).
 *
 * Memoised (GAM-010): with 60+ lessons, a parent update (hearts clock, a level toggle,
 * one finished lesson) only re-renders the nodes whose props changed.
 */
export const PathNodeItem = memo(function PathNodeItem({
  lessonId,
  number,
  unitNumber = null,
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
  const navigates = canStartNode(
    { state: state === "open" ? "available" : state },
    {
      canStartLesson,
    },
  );
  // At 0 hearts: "No hearts left" on nodes that can't start, "Practice: earns hearts" on
  // completed ones that still can (GAM-011 AC16).
  const heartsNote =
    locked || canStartLesson ? null : navigates ? PRACTICE_EARNS_HEARTS_TEXT : NO_HEARTS_TEXT;
  const name = nodeAccessibleName(number, title, state, unitNumber);
  const className = cn(
    CONTROL,
    locked ? "cursor-not-allowed" : "cursor-pointer",
    ZIGZAG[index % ZIGZAG.length],
  );

  const current = state === "available" || state === "in_progress";
  const content: ReactNode = (
    <>
      {current && (
        // "Start · Lesson 3" above the current node (screen 2). Visible copy only: the
        // name below already says "up next. Start" / "in progress. Continue".
        <span
          aria-hidden="true"
          data-testid="path-node-pill"
          className="rounded-chip border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold whitespace-nowrap text-primary"
        >
          {nodePillText(state, number)}
        </span>
      )}
      <span
        aria-hidden="true"
        data-testid="path-node-disc"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          "motion-safe:transition-[transform,box-shadow] motion-safe:duration-100",
          !locked && "group-active:translate-y-0.5",
          DISC[state],
        )}
      >
        <StateIcon state={state} />
      </span>
      {/*
        FIX-002 (WCAG 2.5.3): the name comes from this text, not an aria-label. It holds
        the visible text below in the same order, plus the punctuation and state word
        ("up next") that only screen readers need. The visible copy is aria-hidden so it
        isn't read twice.
      */}
      <span className="sr-only">{name}</span>
      <span
        aria-hidden="true"
        className="mt-1 flex flex-col items-center rounded-control bg-canvas px-2"
      >
        <span className="text-xs font-bold tracking-wide text-fg-muted uppercase">
          {lessonNumberText(number, unitNumber)}
        </span>
        <span className="text-sm font-bold text-fg">{title}</span>
        <span
          className={cn(
            "text-xs font-bold",
            locked ? "text-fg-muted" : current ? "text-accent-strong" : "text-primary-fg",
          )}
        >
          {STATE_TEXT[state]}
          {state === "completed" && ` · ${REPLAY_TEXT}`}
        </span>
        {heartsNote && (
          <span id={noHeartsId} className="flex items-center gap-1 text-xs text-fg-muted">
            <HeartIcon filled={false} size="sm" />
            {heartsNote}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li className="relative flex justify-center">
      {navigates ? (
        <Link
          ref={controlRef as Ref<HTMLAnchorElement>}
          href={lessonHref(lessonId)}
          data-state={state}
          aria-describedby={heartsNote ? noHeartsId : undefined}
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
          aria-disabled={locked ? "true" : undefined}
          aria-describedby={heartsNote ? noHeartsId : undefined}
          data-state={state}
          className={className}
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            onBlockedActivate(lessonId, event.currentTarget)
          }
        >
          {content}
        </button>
      )}
    </li>
  );
});
