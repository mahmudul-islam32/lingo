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
import { GAME_CONFIG, type CefrLevel, type Course, type PathNode, type Slug } from "@/contracts";
import { Button, Card, Dialog, HeartIcon, Lumi, cn } from "@/components/ui";
import {
  buildPathSections,
  defaultExpandedLevel,
  findFrontier,
  findPathLesson,
  isLevelFullyLocked,
  pathNodeDisplay,
  resolvePathActivation,
  startLessonIndex,
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
  PRACTISE_TO_EARN_TEXT,
  LEVEL_EYEBROW_PREFIX,
  START_HERE_TEXT,
  lockedToastText,
  startHereName,
  startingAtText,
  unitNumberText,
  unitProgressText,
} from "./copy";
import { LockIcon } from "./LockIcon";
import { PathNodeItem } from "./PathNode";
import { scrollToCenter, whenScrollSettles } from "./scroll-to-center";

export interface SkillPathViewProps {
  /** Course manifest: levels, unit titles, lesson titles and order. */
  course: Course;
  /** From `computePathNodes(course, completedLessonIds, activeLessonId, startLevel)`. */
  nodes: readonly PathNode[];
  /**
   * `Settings.startLevel`, the same value passed to `computePathNodes` (GAM-011,
   * ADR-013). Earlier levels' playable lessons show as "Open"; when it changes, the path
   * scrolls to the new up-next lesson.
   */
  startLevel?: CefrLevel | null;
  /**
   * "Start here" on a locked level header (GAM-011 AC8–AC10): saves the start level. The
   * view keeps nothing itself: on success the caller passes the new `startLevel` (and
   * nodes), and the view scrolls to, focuses and announces the new up-next lesson. On
   * failure the promise rejects and the caller shows the error toast. Without this prop
   * no "Start here" button is shown.
   */
  onStartHere?: (level: CefrLevel) => Promise<void> | void;
  /**
   * `HeartsView.canStartLesson`. False = 0-hearts gate (AC9, AC10): not-completed lessons
   * open the dialog; completed ones still open (practice, GAM-011 AC15).
   */
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
  /** Level whose "Start here" is being saved (its button shows busy). */
  pendingStart: CefrLevel | null;
  onStartHere?: (level: CefrLevel) => void;
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
  /** CEFR code of the unit's level ("A1") for the banner eyebrow; `null` without levels. */
  levelCode?: CefrLevel | null;
  /** `<h2>` without levels (GAM-008 layout), `<h3>` under a level header (GAM-010 AC4). */
  headingLevel: 2 | 3;
  idPrefix: string;
  ctx: NodeContext;
}

/** One unit: header card, then its nodes (or the empty state, GAM-008 AC15). */
const UnitBlock = memo(function UnitBlock({
  section,
  levelCode = null,
  headingLevel,
  idPrefix,
  ctx,
}: UnitBlockProps) {
  const { unit, lessons, completed, total } = section;
  const headingId = `${idPrefix}-${unit.id}-title`;

  return (
    <section aria-labelledby={headingId} data-unit={unit.id} className="flex flex-col gap-6">
      {/* GAM-012 AC2 (screen 2): indigo banner, eyebrow "LEVEL A1 · UNIT 2", white title. */}
      <Card tone="accent" padding="none" className="flow-root px-5 py-4.5" data-path-header="">
        {headingLevel === 2 ? (
          <>
            <p aria-hidden="true" className="eyebrow text-primary-ring">
              {unitNumberText(section.number)}
            </p>
            <h2
              id={headingId}
              className="mt-1 font-display text-[1.3125rem] leading-tight font-bold break-words"
            >
              {unit.title}
            </h2>
          </>
        ) : (
          <>
            {/*
              Eyebrow "LEVEL A1 · UNIT 2" (GAM-012 AC2). The level part floats just before
              the heading, outside it and aria-hidden, so the heading stays "Unit 3: At the
              Bakery" (the colon is for screen readers only).
            */}
            {levelCode && (
              <span aria-hidden="true" className="float-left me-1 eyebrow text-primary-ring">
                {LEVEL_EYEBROW_PREFIX} {levelCode} ·
              </span>
            )}
            <h3 id={headingId}>
              <span className="block eyebrow text-primary-ring">
                {unitNumberText(section.number)}
              </span>
              <span className="sr-only">:</span>{" "}
              <span className="mt-1 block clear-left font-display text-[1.3125rem] leading-tight font-bold break-words">
                {unit.title}
              </span>
            </h3>
            {unit.description && (
              <p className="mt-1.5 text-sm text-primary-tint">{unit.description}</p>
            )}
          </>
        )}
        {total > 0 && (
          <p className="mt-2 text-sm font-bold text-primary-ring">
            {unitProgressText(completed, total)}
          </p>
        )}
      </Card>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Lumi pose="idle" size="md" />
          <p className="font-semibold text-fg">{EMPTY_UNIT_TEXT}</p>
        </div>
      ) : (
        <div className="relative">
          <ol aria-labelledby={headingId} className="relative flex flex-col gap-5">
            {lessons.map((entry) => {
              const id = entry.node.lessonId;
              return (
                <PathNodeItem
                  key={id}
                  lessonId={id}
                  number={ctx.unitNumbers ? entry.lessonNumber : entry.courseNumber}
                  unitNumber={ctx.unitNumbers ? entry.unitNumber : null}
                  title={entry.lesson.title}
                  state={pathNodeDisplay(entry.node, ctx.frontierId)}
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
  const locked = isLevelFullyLocked(section);
  const startHere = locked && ctx.onStartHere ? ctx.onStartHere : null;
  const starting = ctx.pendingStart === level.level;

  return (
    <section
      aria-labelledby={headingId}
      data-level={level.level}
      data-level-state={section.state}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center gap-2" data-path-header="">
        <h2 id={headingId} className="min-w-0 flex-[1_1_14rem]">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => onToggle(level.level)}
            className={cn(
              "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-card px-4 py-3",
              "border-2 border-border bg-surface text-left text-fg shadow-3d-card",
              "hover:border-primary-ring active:translate-y-0.5 active:shadow-3d-card-pressed",
              "focus-visible:focus-ring motion-safe:transition-[border-color,box-shadow,transform]",
            )}
          >
            {/*
              DOM order title, then progress (the name "A1 · Beginner, 1 of 6 lessons
              completed"); shown reversed, the progress as the eyebrow (GAM-012 AC5).
            */}
            <span className="flex min-w-0 flex-1 flex-col-reverse">
              <span className="font-display text-xl leading-tight font-extrabold break-words">
                {level.title}
              </span>
              <span className="sr-only">,</span>{" "}
              <span className="eyebrow text-primary-fg">
                {unitProgressText(section.completed, section.total)}
              </span>
            </span>
            {locked && <LockIcon size={22} className="shrink-0 text-fg-muted" />}
            <ChevronIcon
              className={cn(
                "shrink-0 text-primary motion-safe:transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        </h2>
        {startHere && (
          // GAM-011 AC8: outside the heading's disclosure button (no nested controls). The
          // name starts with the visible text (WCAG 2.5.3).
          <Button
            variant="secondary"
            size="lg"
            aria-label={startHereName(level)}
            loading={starting}
            loadingLabel={startHereName(level)}
            className="shrink-0"
            onClick={() => startHere(level.level)}
          >
            {START_HERE_TEXT}
          </Button>
        )}
      </div>
      <div id={panelId} className={expanded ? "flex flex-col gap-8" : "hidden"}>
        {expanded && (
          <>
            {level.description && <p className="px-1 text-fg-muted">{level.description}</p>}
            {section.units.map((unit) => (
              <UnitBlock
                key={unit.unit.id}
                section={unit}
                levelCode={level.level}
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

/** Decorative empty heart in a rose tint (GAM-012 AC12). */
function OutOfHeartsBadge() {
  return (
    <span
      data-testid="out-of-hearts-badge"
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-danger-tint"
    >
      <HeartIcon filled={false} size="md" className="text-heart" />
    </span>
  );
}

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
      className="flex min-h-12 items-center gap-3 rounded-card border-2 border-border bg-surface px-4 py-3"
    >
      {withLumi && <Lumi pose="idle" size="sm" />}
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <h2 id={headingId} className="font-display text-lg font-bold break-words text-fg">
          {level.title}
        </h2>
        <p className="eyebrow text-fg-muted">{COMING_SOON_TEXT}</p>
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
  startLevel = null,
  onStartHere,
  canStartLesson,
  heartRefillText,
  onLockedLesson,
  onNavigate,
  className,
}: SkillPathViewProps) {
  const baseId = useId();
  // One `computePathNodes` result, sliced into levels and units (no per-level compute).
  const sections = useMemo(
    () => buildPathSections(course, nodes, startLevel),
    [course, nodes, startLevel],
  );
  const unitNumbers = course.levels !== undefined;
  const startIndex = startLessonIndex(course, startLevel);
  const frontierId = findFrontier(nodes, startIndex)?.lessonId ?? null;
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

  // GAM-011 AC9: the level whose "Start here" is being saved, and the polite
  // announcement once the path moved there.
  const [pendingStart, setPendingStart] = useState<CefrLevel | null>(null);
  const requestedStart = useRef<CefrLevel | null>(null);
  // Written on the DOM node (not state), like `data-auto-scroll`: no effect-driven render.
  const announcementRef = useRef<HTMLParagraphElement>(null);

  // AC11: bring the next lesson into view on the first render, and again when the start
  // level changes (GAM-011: the frontier moved), but not on other updates (a finished
  // lesson). After this view's own "Start here", focus moves to the new up-next lesson
  // and it is announced (GAM-011 AC9).
  // FIX-002: by scroll position, not `scrollIntoView`, so the Tab order still starts at
  // the top of the page (skip link, top bar).
  // FIX-006: `data-auto-scroll="settled"` on the root once that scroll is over (or there
  // was none), a deterministic signal for e2e layout measurements. Set on the DOM node,
  // not via state, so it costs no re-render.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (root) root.dataset.autoScroll = "pending";
    const settle = () => {
      if (root) root.dataset.autoScroll = "settled";
    };
    const target = frontierRef.current;
    if (requestedStart.current !== null && requestedStart.current === startLevel) {
      requestedStart.current = null;
      target?.focus({ preventScroll: true });
      const level = course.levels?.find((l) => l.level === startLevel);
      if (level && announcementRef.current) {
        announcementRef.current.textContent = startingAtText(level);
      }
    }
    // FIX-009: centred below the sticky top bar, and no level or unit header card left
    // half under it.
    const headers = root ? Array.from(root.querySelectorAll("[data-path-header]")) : [];
    const scroll = target
      ? scrollToCenter(target, prefersReducedMotion() ? "auto" : "smooth", { headers })
      : null;
    if (!scroll) {
      settle();
      return;
    }
    return whenScrollSettles(scroll, settle);
    // Only the start level re-runs it; `course` is read for the announcement only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLevel]);

  // Latest values for the stable node callback, so memoised nodes don't re-render when
  // only the data around them changes.
  const latest = useRef({
    nodes,
    sections,
    canStartLesson,
    onLockedLesson,
    unitNumbers,
    startIndex,
    onStartHere,
  });
  useLayoutEffect(() => {
    latest.current = {
      nodes,
      sections,
      canStartLesson,
      onLockedLesson,
      unitNumbers,
      startIndex,
      onStartHere,
    };
  });

  const startHere = useCallback((level: CefrLevel) => {
    const save = latest.current.onStartHere;
    if (!save) return;
    requestedStart.current = level;
    if (announcementRef.current) announcementRef.current.textContent = "";
    setPendingStart(level);
    void Promise.resolve()
      .then(() => save(level))
      .catch(() => {
        // The caller shows the error toast (AC10); the path stays as it was.
        if (requestedStart.current === level) requestedStart.current = null;
      })
      .finally(() => setPendingStart((current) => (current === level ? null : current)));
  }, []);
  const hasStartHere = onStartHere !== undefined;

  const onBlockedActivate = useCallback((lessonId: Slug, element: HTMLElement) => {
    const current = latest.current;
    const node = current.nodes.find((n) => n.lessonId === lessonId);
    if (!node) return;
    const outcome = resolvePathActivation(
      node,
      current.nodes,
      current.canStartLesson,
      current.startIndex,
    );
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
    () => ({
      canStartLesson,
      frontierId,
      frontierRef,
      pendingStart,
      onStartHere: hasStartHere ? startHere : undefined,
      unitNumbers,
      onBlockedActivate,
      onNavigate,
    }),
    [
      canStartLesson,
      frontierId,
      pendingStart,
      hasStartHere,
      startHere,
      unitNumbers,
      onBlockedActivate,
      onNavigate,
    ],
  );

  // GAM-011 AC17 (PD-065): the dialog suggests practice only with a completed lesson.
  const canPractise =
    !GAME_CONFIG.practiceCostsHearts && nodes.some((node) => node.state === "completed");

  const firstComingSoon = sections.find((s) => s.state === "coming_soon");

  return (
    <div
      ref={rootRef}
      data-auto-scroll="pending"
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

      {/* GAM-011 AC9: "Starting at A2 Elementary." after "Start here". */}
      <p
        ref={announcementRef}
        aria-live="polite"
        className="sr-only"
        data-testid="path-announcement"
      />

      {/* GAM-012 AC12: restyled (heart badge, display title, primary Button); same copy. */}
      <Dialog
        open={outOfHeartsOpen}
        onClose={() => setOutOfHeartsOpen(false)}
        title={
          <span className="flex items-center gap-3">
            <OutOfHeartsBadge />
            {OUT_OF_HEARTS_TITLE}
          </span>
        }
        description={
          <>
            {heartRefillText || OUT_OF_HEARTS_FALLBACK}
            {canPractise && (
              <>
                {" "}
                <span className="mt-2 block">{PRACTISE_TO_EARN_TEXT}</span>
              </>
            )}
          </>
        }
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
