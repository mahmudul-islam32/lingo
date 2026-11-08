"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Course, PathNode, Slug } from "@/contracts";
import { Button, Card, Dialog, Lumi, cn } from "@/components/ui";
import { findFrontier, lessonNumberOf, resolvePathActivation } from "../rules";
import {
  EMPTY_UNIT_TEXT,
  OK_TEXT,
  OUT_OF_HEARTS_FALLBACK,
  OUT_OF_HEARTS_TITLE,
  lockedToastText,
  unitProgressText,
} from "./copy";
import { PathNodeItem } from "./PathNode";

export interface SkillPathViewProps {
  /** Course manifest: unit titles, lesson titles and order. */
  course: Course;
  /** From `computePathNodes(course, completedLessonIds, activeLessonId)`. */
  nodes: readonly PathNode[];
  /** `HeartsView.canStartLesson`. False = 0-hearts gate (AC9, AC10). */
  canStartLesson: boolean;
  /** Body of the out-of-hearts dialog: `formatHeartRefill(...)` (GAM-005). */
  heartRefillText?: string | null;
  /**
   * A locked node was activated (AC8). The caller shows `message` as a toast
   * (`useToast().show({ title: message })`). Nothing navigates.
   */
  onLockedLesson: (message: string, lessonId: Slug) => void;
  /** Optional: a lesson link was followed (the link itself navigates, AC7). */
  onNavigate?: (lessonId: Slug) => void;
  className?: string;
}

interface NodeEntry {
  node: PathNode;
  /** Global 1-based number, same as `lessonNumberOf(course, lessonId)`. */
  number: number;
  title: string;
}

/**
 * Units in course order, each with the lessons that have a node. The course manifest is
 * the source of order, titles and units; nodes only add state. Lessons without a node
 * are not shown (a unit with none shows the empty state, AC15).
 */
function buildUnits(course: Course, nodes: readonly PathNode[]) {
  const byId = new Map(nodes.map((node) => [node.lessonId, node]));
  let number = 0;
  return course.units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    entries: unit.lessons.flatMap((lesson): NodeEntry[] => {
      number += 1;
      const node = byId.get(lesson.id);
      return node ? [{ node, number, title: lesson.title }] : [];
    }),
  }));
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Presentational skill path (GAM-008 AC4–AC12, AC15–AC17), fed by `PathNode[]` and
 * callbacks; it reads no store and no data. The `SkillPath` container (with
 * `useUserProgress` / `useHearts`) and the Learn route (PLT-009) compose it.
 */
export function SkillPathView({
  course,
  nodes,
  canStartLesson,
  heartRefillText,
  onLockedLesson,
  onNavigate,
  className,
}: SkillPathViewProps) {
  const baseId = useId();
  const units = useMemo(() => buildUnits(course, nodes), [course, nodes]);
  const frontierId = findFrontier(nodes)?.lessonId ?? null;
  const frontierRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [outOfHeartsOpen, setOutOfHeartsOpen] = useState(false);

  // AC11: bring the next lesson into view on the first render only (not on updates).
  useEffect(() => {
    const target = frontierRef.current;
    if (!target || typeof target.scrollIntoView !== "function") return;
    target.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  function blocked(node: PathNode, element: HTMLElement) {
    const outcome = resolvePathActivation(node, nodes, canStartLesson);
    if (outcome.kind === "locked") {
      const n =
        outcome.unlockLessonId === null ? null : lessonNumberOf(course, outcome.unlockLessonId);
      onLockedLesson(lockedToastText(n), outcome.lessonId);
    } else {
      // `out_of_hearts`. (`open` never reaches here: navigable nodes are links.)
      returnFocusRef.current = element;
      setOutOfHeartsOpen(true);
    }
  }

  let pathIndex = 0;
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-8 overflow-x-hidden px-4 pt-4",
        // AC16: the last node clears the bottom navigation.
        "pb-[calc(env(safe-area-inset-bottom)+7rem)]",
        className,
      )}
    >
      {units.map((unit) => {
        const headingId = `${baseId}-${unit.id}-title`;
        const done = unit.entries.filter((e) => e.node.state === "completed").length;
        return (
          <section key={unit.id} aria-labelledby={headingId} className="flex flex-col gap-6">
            <Card tone="accent" padding="md">
              <h2 id={headingId} className="text-xl font-bold">
                {unit.title}
              </h2>
              {unit.entries.length > 0 && (
                <p className="mt-1 text-night-100">{unitProgressText(done, unit.entries.length)}</p>
              )}
            </Card>

            {unit.entries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Lumi pose="idle" size="md" />
                <p className="font-semibold text-fg">{EMPTY_UNIT_TEXT}</p>
              </div>
            ) : (
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-8 left-1/2 w-1 -translate-x-1/2 rounded-full bg-border"
                />
                <ol aria-labelledby={headingId} className="relative flex flex-col gap-6">
                  {unit.entries.map((entry) => (
                    <PathNodeItem
                      key={entry.node.lessonId}
                      lessonId={entry.node.lessonId}
                      number={entry.number}
                      title={entry.title}
                      state={entry.node.state}
                      index={pathIndex++}
                      canStartLesson={canStartLesson}
                      controlRef={entry.node.lessonId === frontierId ? frontierRef : undefined}
                      onBlockedActivate={(element) => blocked(entry.node, element)}
                      onNavigate={onNavigate}
                    />
                  ))}
                </ol>
              </div>
            )}
          </section>
        );
      })}

      <Dialog
        open={outOfHeartsOpen}
        onClose={() => setOutOfHeartsOpen(false)}
        title={OUT_OF_HEARTS_TITLE}
        description={heartRefillText || OUT_OF_HEARTS_FALLBACK}
        returnFocusRef={returnFocusRef}
        actions={
          <Button variant="primary" size="lg" fullWidth onClick={() => setOutOfHeartsOpen(false)}>
            {OK_TEXT}
          </Button>
        }
      />
    </div>
  );
}
