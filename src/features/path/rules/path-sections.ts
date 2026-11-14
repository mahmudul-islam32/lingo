/**
 * Level and unit layout of the skill path (GAM-010, PD-030, ADR-008). Pure: it slices the
 * nodes of one `computePathNodes` call (unlock order = course order) into
 * Level → Unit → Lesson sections with progress counts and a level state. The screen
 * renders these sections; it never calls `computePathNodes` per level.
 */
import {
  groupUnitsByLevel,
  type CefrLevel,
  type Course,
  type CourseLevel,
  type LessonSummary,
  type PathNode,
  type Slug,
  type Unit,
} from "@/contracts";

/**
 * - `completed`: every lesson of the level is completed.
 * - `current`: the level holds the available (or in-progress) lesson.
 * - `locked`: anything else with content (later levels, or out-of-order results).
 * - `coming_soon`: the level is declared but has no units yet.
 */
export type PathLevelState = "completed" | "current" | "locked" | "coming_soon";

/** One lesson on the path with its node and its numbers. */
export interface PathLessonEntry {
  node: PathNode;
  lesson: LessonSummary;
  /** 1-based position in its unit's manifest ("Lesson 2"). */
  lessonNumber: number;
  /** 1-based position in the whole course (GAM-008 numbering, courses without levels). */
  courseNumber: number;
  /** 1-based number of its unit within its level (or the course, without levels). */
  unitNumber: number;
  /** 0-based position among the shown nodes of the whole path (zigzag offset). */
  pathIndex: number;
}

export interface PathUnitSection {
  unit: Unit;
  /** 1-based, within the level ("Unit 3"); within the course for courses without levels. */
  number: number;
  /** Lessons that have a node, in order. Lessons without a node are not shown. */
  lessons: PathLessonEntry[];
  completed: number;
  total: number;
}

export interface PathLevelSection {
  /** `null`: the implicit single section of a course without levels (en-es). */
  level: CourseLevel | null;
  state: PathLevelState;
  units: PathUnitSection[];
  completed: number;
  total: number;
}

function isFrontier(node: PathNode): boolean {
  return node.state === "available" || node.state === "in_progress";
}

/** Level state from its units (see `PathLevelState`). */
export function pathLevelState(units: readonly PathUnitSection[]): PathLevelState {
  if (units.length === 0) return "coming_soon";
  let completed = 0;
  let total = 0;
  for (const unit of units) {
    if (unit.lessons.some((entry) => isFrontier(entry.node))) return "current";
    completed += unit.completed;
    total += unit.total;
  }
  return total > 0 && completed === total ? "completed" : "locked";
}

/**
 * Level → unit → lesson sections of the path, in course (= unlock) order. Courses with
 * `levels` get one section per declared level (empty ones are `coming_soon`); courses
 * without get one section with `level: null`. Counts come from the data, never a constant.
 */
export function buildPathSections(course: Course, nodes: readonly PathNode[]): PathLevelSection[] {
  const byId = new Map(nodes.map((node) => [node.lessonId, node]));
  let courseNumber = 0;
  let pathIndex = 0;

  const unitSection = (unit: Unit, number: number): PathUnitSection => {
    const lessons = unit.lessons.flatMap((lesson, i): PathLessonEntry[] => {
      courseNumber += 1;
      const node = byId.get(lesson.id);
      if (!node) return [];
      return [
        {
          node,
          lesson,
          lessonNumber: i + 1,
          courseNumber,
          unitNumber: number,
          pathIndex: pathIndex++,
        },
      ];
    });
    const completed = lessons.filter((entry) => entry.node.state === "completed").length;
    return { unit, number, lessons, completed, total: lessons.length };
  };

  const levelSection = (level: CourseLevel | null, units: readonly Unit[]): PathLevelSection => {
    const sections = units.map((unit, i) => unitSection(unit, i + 1));
    return {
      level,
      state: pathLevelState(sections),
      units: sections,
      completed: sections.reduce((sum, unit) => sum + unit.completed, 0),
      total: sections.reduce((sum, unit) => sum + unit.total, 0),
    };
  };

  if (!course.levels) return [levelSection(null, course.units)];
  return groupUnitsByLevel(course).map((group) => levelSection(group.level, group.units));
}

/**
 * The level that opens expanded (GAM-010 AC6): the `current` one; when every lesson is
 * completed, the last completed level; `null` without levels or without any content.
 */
export function defaultExpandedLevel(sections: readonly PathLevelSection[]): CefrLevel | null {
  const current = sections.find((section) => section.state === "current");
  if (current) return current.level?.level ?? null;
  const done = sections.filter((section) => section.state === "completed").at(-1);
  return done?.level?.level ?? null;
}

/** The entry of `lessonId` in the sections, or `null` if it isn't on the path. */
export function findPathLesson(
  sections: readonly PathLevelSection[],
  lessonId: Slug,
): PathLessonEntry | null {
  for (const section of sections) {
    for (const unit of section.units) {
      const entry = unit.lessons.find((e) => e.lesson.id === lessonId);
      if (entry) return entry;
    }
  }
  return null;
}
