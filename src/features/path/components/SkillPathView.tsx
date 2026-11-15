"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { CefrLevel, Course, PathNode, Slug } from "@/contracts";
import { Button, Card, Dialog, Lumi, cn } from "@/components/ui";
import {
  buildPathSections,
  defaultExpandedLevel,
  findFrontier,
  findPathLesson,
  resolvePathActivation,
  type PathLevelSection,
  type PathUnitSection,
} from "../rules";
import { ChevronIcon } from "./ChevronIcon";
import {
  COMING_SOON_TEXT,
  EMPTY_UNIT_TEXT,
  OK_TEXT,
  OUT_OF_HEARTS_FALLBACK,
  OUT_OF_HEARTS_TITLE,
  lockedToastText,
  unitNumberText,
  unitProgressText,
} from "./copy";
import { PathNodeItem } from "./PathNode";
import { scrollToCenter } from "./scroll-to-center";

export interface SkillPathViewProps {
  /** Course manifest: levels, unit titles, lesson titles and order. */
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

type ControlRef = RefObject<HTMLAnchorElement | HTMLButtonElement | null>;

/** What every node needs from the path; one stable object so memoised sections bail out. */
interface NodeContext {
  canStartLesson: boolean;
  frontierId: Slug | null;
  frontierRef: ControlRef;
  /** Number lessons within their unit and name the unit (courses with levels, GAM-010). */
  unitNumbers: boolean;
  onBlockedActivate: (lessonId: Slug, element: HTMLElement) => void;
  onNavigate?: (lessonId: Slug) => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function openSet(level: CefrLevel | null): ReadonlySet<CefrLevel> {
  return new Set(level === null ? [] : [level]);
}

interface UnitBlockProps {
  section: PathUnitSection;
  /** `<h2>` without levels (GAM-008 layout), `<h3>` under a level header (GAM-010 AC4). */
  headingLevel: 2 | 3;
  idPrefix: string;
  ctx: NodeContext;
}

/** One unit: header card, then its nodes (or the empty state, GAM-008 AC15). */
const UnitBlock = memo(function UnitBlock({
  section,
  headingLevel,
  idPrefix,
  ctx,
}: UnitBlockProps) {
  const { unit, lessons, completed, total } = section;
  const headingId = `${idPrefix}-${unit.id}-title`;

  return (
    <section aria-labelledby={headingId} data-unit={unit.id} className="flex flex-col gap-6">
      <Card tone="accent" padding="md">
        {headingLevel === 2 ? (
          <h2 id={headingId} className="text-xl font-bold break-words">
            {unit.title}
          </h2>
        ) : (
          <>
            {/* Name "Unit 3: At the Bakery": the colon is for screen readers only. */}
            <h3 id={headingId}>
              <span className="block text-sm font-semibold text-night-100">
                {unitNumberText(section.number)}
              </span>
              <span className="sr-only">:</span>{" "}
              <span className="block text-xl font-bold break-words">{unit.title}</span>
            </h3>
            {unit.description && <p className="mt-1 text-night-50">{unit.description}</p>}
          </>
        )}
        {total > 0 && <p className="mt-1 text-night-100">{unitProgressText(completed, total)}</p>}
      </Card>

      {lessons.length === 0 ? (
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
            {lessons.map((entry) => {
              const id = entry.node.lessonId;
              return (
                <PathNodeItem
                  key={id}
                  lessonId={id}
                  number={ctx.unitNumbers ? entry.lessonNumber : entry.courseNumber}
                  unitNumber={ctx.unitNumbers ? entry.unitNumber : null}
                  title={entry.lesson.title}
                  state={entry.node.state}
                  index={entry.pathIndex}
                  canStartLesson={ctx.canStartLesson}
                  controlRef={id === ctx.frontierId ? ctx.frontierRef : undefined}
                  onBlockedActivate={ctx.onBlockedActivate}
                  onNavigate={ctx.onNavigate}
                />
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
});

interface LevelSectionProps {
  section: PathLevelSection;
  expanded: boolean;
  onToggle: (level: CefrLevel) => void;
  idPrefix: string;
  ctx: NodeContext;
}

/**
 * A CEFR level with content (GAM-010 AC3, AC6, AC7): the `<h2>` holds a disclosure button
 * with `aria-expanded`. Collapsed, the panel is empty: no unit headers and no lesson nodes
 * in the DOM.
 */
const LevelSection = memo(function LevelSection({
  section,
  expanded,
  onToggle,
  idPrefix,
  ctx,
}: LevelSectionProps) {
  const level = section.level!;
  const headingId = `${idPrefix}-level-${level.level}`;
  const panelId = `${headingId}-panel`;

  return (
    <section
      aria-labelledby={headingId}
      data-level={level.level}
      data-level-state={section.state}
      className="flex flex-col gap-6"
    >
      <h2 id={headingId}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => onToggle(level.level)}
          className={cn(
            "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-card px-4 py-3",
            "border-2 border-glow-400 bg-night-700 text-left text-night-50",
            "focus-visible:focus-ring",
          )}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xl font-bold break-words">{level.title}</span>
            <span className="sr-only">,</span>{" "}
            <span className="text-sm font-semibold text-night-100">
              {unitProgressText(section.completed, section.total)}
            </span>
          </span>
          <ChevronIcon
            className={cn("shrink-0 motion-safe:transition-transform", expanded && "rotate-180")}
          />
        </button>
      </h2>
      <div id={panelId} className={expanded ? "flex flex-col gap-8" : "hidden"}>
        {expanded && (
          <>
            {level.description && <p className="px-1 text-fg-muted">{level.description}</p>}
            {section.units.map((unit) => (
              <UnitBlock
                key={unit.unit.id}
                section={unit}
                headingLevel={3}
                idPrefix={idPrefix}
                ctx={ctx}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
});

interface ComingSoonLevelProps {
  section: PathLevelSection;
  idPrefix: string;
  withLumi: boolean;
}

/** A declared level without units (GAM-010 AC3, AC6): muted row, no button, no nodes. */
function ComingSoonLevel({ section, idPrefix, withLumi }: ComingSoonLevelProps) {
  const level = section.level!;
  const headingId = `${idPrefix}-level-${level.level}`;
  return (
    <section
      aria-labelledby={headingId}
      data-level={level.level}
      data-level-state="coming_soon"
      className="flex min-h-12 items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
    >
      {withLumi && <Lumi pose="idle" size="sm" />}
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <h2 id={headingId} className="text-lg font-bold break-words text-fg">
          {level.title}
        </h2>
        <p className="text-sm font-semibold text-fg-muted">{COMING_SOON_TEXT}</p>
      </div>
    </section>
  );
}

/**
 * Presentational skill path (GAM-008 AC4–AC12, AC15–AC17; GAM-010), fed by `PathNode[]`
 * and callbacks; it reads no store and no data. The `SkillPath` container (with
 * `useUserProgress` / `useHearts`) and the Learn route (PLT-009) compose it.
 *
 * Courses with CEFR levels show a collapsible section per level (only the current one
 * open), unit headers with "Unit N" and lessons numbered within their unit. Courses
 * without levels (en-es) keep the GAM-008 layout: unit `<h2>`s and global lesson numbers.
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
  // One `computePathNodes` result, sliced into levels and units (no per-level compute).
  const sections = useMemo(() => buildPathSections(course, nodes), [course, nodes]);
  const unitNumbers = course.levels !== undefined;
  const frontierId = findFrontier(nodes)?.lessonId ?? null;
  const frontierRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [outOfHeartsOpen, setOutOfHeartsOpen] = useState(false);

  // AC6/AC9: the current level opens. When it changes (the last lesson of a level was
  // finished), the learner's toggles reset: the old level collapses, the new one opens.
  const anchor = defaultExpandedLevel(sections);
  const [expansion, setExpansion] = useState(() => ({ anchor, open: openSet(anchor) }));
  const open = expansion.anchor === anchor ? expansion.open : openSet(anchor);
  const toggleLevel = useCallback(
    (level: CefrLevel) =>
      setExpansion((prev) => {
        const next = new Set(prev.anchor === anchor ? prev.open : openSet(anchor));
        if (next.has(level)) next.delete(level);
        else next.add(level);
        return { anchor, open: next };
      }),
    [anchor],
  );

  // AC11: bring the next lesson into view on the first render only (not on updates).
  // FIX-002: by scroll position, not `scrollIntoView`, so the Tab order still starts at
  // the top of the page (skip link, top bar).
  useEffect(() => {
    const target = frontierRef.current;
    if (!target) return;
    scrollToCenter(target, prefersReducedMotion() ? "auto" : "smooth");
  }, []);

  // Latest values for the stable node callback, so memoised nodes don't re-render when
  // only the data around them changes.
  const latest = useRef({ nodes, sections, canStartLesson, onLockedLesson, unitNumbers });
  useLayoutEffect(() => {
    latest.current = { nodes, sections, canStartLesson, onLockedLesson, unitNumbers };
  });

  const onBlockedActivate = useCallback((lessonId: Slug, element: HTMLElement) => {
    const current = latest.current;
    const node = current.nodes.find((n) => n.lessonId === lessonId);
    if (!node) return;
    const outcome = resolvePathActivation(node, current.nodes, current.canStartLesson);
    if (outcome.kind === "locked") {
      const entry =
        outcome.unlockLessonId === null
          ? null
          : findPathLesson(current.sections, outcome.unlockLessonId);
      const message = !entry
        ? lockedToastText(null)
        : current.unitNumbers
          ? lockedToastText(entry.lessonNumber, entry.unitNumber)
          : lockedToastText(entry.courseNumber);
      current.onLockedLesson(message, outcome.lessonId);
    } else {
      // `out_of_hearts`. (`open` never reaches here: navigable nodes are links.)
      returnFocusRef.current = element;
      setOutOfHeartsOpen(true);
    }
  }, []);

  const ctx = useMemo<NodeContext>(
    () => ({ canStartLesson, frontierId, frontierRef, unitNumbers, onBlockedActivate, onNavigate }),
    [canStartLesson, frontierId, unitNumbers, onBlockedActivate, onNavigate],
  );

  const firstComingSoon = sections.find((s) => s.state === "coming_soon");

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-8 overflow-x-hidden px-4 pt-4",
        // AC16: the last node clears the bottom navigation.
        "pb-[calc(env(safe-area-inset-bottom)+7rem)]",
        className,
      )}
    >
      {sections.map((section) => {
        if (section.level === null) {
          // Course without levels (en-es): one implicit section, GAM-008 layout.
          return section.units.map((unit) => (
            <UnitBlock
              key={unit.unit.id}
              section={unit}
              headingLevel={2}
              idPrefix={baseId}
              ctx={ctx}
            />
          ));
        }
        if (section.state === "coming_soon") {
          return (
            <ComingSoonLevel
              key={section.level.level}
              section={section}
              idPrefix={baseId}
              withLumi={section === firstComingSoon}
            />
          );
        }
        return (
          <LevelSection
            key={section.level.level}
            section={section}
            expanded={open.has(section.level.level)}
            onToggle={toggleLevel}
            idPrefix={baseId}
            ctx={ctx}
          />
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
