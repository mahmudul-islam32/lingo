import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "@/contracts";
import { createFullHearts } from "@/features/gamification";
import {
  SkillPath,
  SkillPathView,
  computePathNodes,
  pathCopy,
  type SkillPathProps,
  type SkillPathViewProps,
} from "@/features/path";
import { ToastProvider } from "@/components/ui";
import { queryKeys } from "@/lib/query";
import { renderWithQueryClient } from "@/lib/query/testing";
import {
  GERMAN_FIXTURE_COURSE,
  createGermanFixtureRepository,
} from "@/lib/content/__fixtures__/german-fixture-course";
import { makeResult } from "../../../gamification/rules/__tests__/fixtures";
import { createStubSession } from "../../../gamification/hooks/__tests__/session-stub";
import { unitOneCourse } from "../../rules/__tests__/fixtures";
import {
  allLessonIds,
  lessonIdOf,
  lessonIdsOfLevel,
  makeLevelCourse,
} from "../../rules/__tests__/level-fixtures";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const DE = GERMAN_FIXTURE_COURSE;
const DE_IDS = allLessonIds(DE);
/** A1 (2 units) and A2 (2 units) with content, B1 and B2 "Coming soon". */
const TWO_LEVELS = makeLevelCourse({ A1: 2, A2: 2, B1: 0, B2: 0 });
const A1_IDS = lessonIdsOfLevel(TWO_LEVELS, "A1");

let followed: string[] = [];
function recordNavigation(event: MouseEvent) {
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor) return;
  event.preventDefault();
  followed.push(anchor.getAttribute("href") ?? "");
}

beforeEach(() => {
  followed = [];
  document.addEventListener("click", recordNavigation);
});

afterEach(() => {
  document.removeEventListener("click", recordNavigation);
  vi.restoreAllMocks();
});

function viewProps(course: Course, completed: readonly string[], active: string | null) {
  return { course, nodes: computePathNodes(course, completed, active) };
}

function setup(
  props: Partial<SkillPathViewProps> & {
    course?: Course;
    completed?: readonly string[];
    active?: string | null;
  } = {},
) {
  const { completed = [], active = null, course = DE, ...rest } = props;
  const onLockedLesson = vi.fn<SkillPathViewProps["onLockedLesson"]>();
  const user = userEvent.setup();
  const view = render(
    <SkillPathView
      {...viewProps(course, completed, active)}
      canStartLesson
      onLockedLesson={onLockedLesson}
      {...rest}
    />,
  );
  const rerenderWith = (done: readonly string[]) =>
    view.rerender(
      <SkillPathView
        {...viewProps(course, done, null)}
        canStartLesson
        onLockedLesson={onLockedLesson}
        {...rest}
      />,
    );
  return { user, onLockedLesson, rerenderWith, ...view };
}

/** Node controls (links and buttons named "… Lesson N: …"). */
function nodeControls(): HTMLElement[] {
  return [
    ...screen.queryAllByRole("link", { name: /Lesson \d+: / }),
    ...screen.queryAllByRole("button", { name: /Lesson \d+: / }),
  ];
}
function node(name: string | RegExp): HTMLElement {
  const matches = [
    ...screen.queryAllByRole("link", { name }),
    ...screen.queryAllByRole("button", { name }),
  ];
  expect(matches, `one node named ${String(name)}`).toHaveLength(1);
  return matches[0]!;
}
const levelButton = (title: RegExp) => screen.getByRole("button", { name: title });
const levelSection = (level: string) =>
  document.querySelector<HTMLElement>(`section[data-level="${level}"]`)!;

describe("level and unit headers (GAM-010 AC3, AC4)", () => {
  it("German fixture: A1 header with progress, A2 'Coming soon', in CEFR order", () => {
    setup({ completed: [DE_IDS[0]!] });
    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      "A1 · Beginner, 1 of 4 lessons completed",
      "A2 · Elementary",
    ]);
    expect(within(levelSection("A2")).getByText(pathCopy.COMING_SOON_TEXT)).toBeInTheDocument();
    expect(levelButton(/^A1 · Beginner/)).toHaveAccessibleName(
      "A1 · Beginner, 1 of 4 lessons completed",
    );
  });

  it("unit headers are h3s with 'Unit N', title, description and progress from the data", () => {
    const course = makeLevelCourse({ A1: 2 }, 3);
    setup({ course, completed: [lessonIdOf("A1", 1, 1)] });
    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s.map((h) => h.textContent)).toEqual(["Unit 1: A1 Unit 1", "Unit 2: A1 Unit 2"]);
    expect(h3s[0]).toHaveAccessibleName("Unit 1: A1 Unit 1");
    const unitOne = h3s[0]!.closest("section")!;
    expect(within(unitOne).getByText("1 of 3 lessons completed")).toBeInTheDocument();
    expect(within(unitOne).getByText("What you learn in A1 unit 1.")).toBeInTheDocument();
    expect(within(levelSection("A1")).getByText("1 of 6 lessons completed")).toBeInTheDocument();
  });

  it("shows the level description when expanded", () => {
    setup();
    expect(screen.getByText("Everyday phrases and basic needs.")).toBeInTheDocument();
  });

  it("heading hierarchy: every h3 is inside a level section with an h2", () => {
    setup({ course: TWO_LEVELS, completed: A1_IDS });
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    for (const h3 of screen.getAllByRole("heading", { level: 3 })) {
      const level = h3.closest("section[data-level]")!;
      expect(level.querySelector("h2")).not.toBeNull();
    }
    expect(screen.queryAllByRole("heading", { level: 4 })).toHaveLength(0);
  });

  it("'Coming soon' levels have no button and no nodes; Lumi only on the first", () => {
    setup({ course: TWO_LEVELS });
    for (const level of ["B1", "B2"]) {
      const section = levelSection(level);
      expect(section).toHaveAttribute("data-level-state", "coming_soon");
      expect(within(section).queryByRole("button")).toBeNull();
      expect(within(section).getByText("Coming soon")).toBeInTheDocument();
    }
    expect(levelSection("B1").querySelector("[data-pose='idle']")).not.toBeNull();
    expect(levelSection("B2").querySelector("[data-pose]")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "B1 · Intermediate" })).toBeVisible();
  });
});

describe("lesson numbering, names and toast (GAM-010 AC5)", () => {
  it("names nodes 'Unit N, Lesson M: title, state', numbered within the unit", () => {
    setup({ completed: DE_IDS.slice(0, 1) });
    expect(nodeControls().map((c) => c.getAttribute("data-state"))).toEqual([
      "completed",
      "available",
      "locked",
      "locked",
    ]);
    node("Unit 1, Lesson 1: Hallo!, completed. Start again");
    node("Unit 1, Lesson 2: How Are You?, up next. Start");
    node("Unit 2, Lesson 1: Bread, locked");
    node("Unit 2, Lesson 2: Please, locked");
  });

  it("the visible label starts the name (WCAG 2.5.3): 'Unit 2 · Lesson 1'", () => {
    setup();
    const control = node(/^Unit 2, Lesson 1: Bread, locked$/);
    expect(within(control).getByText("Unit 2 · Lesson 1")).toBeInTheDocument();
    expect(control).not.toHaveAttribute("aria-label");
  });

  it("cross-unit unlocking: finishing Unit 1 makes Unit 2, Lesson 1 up next", () => {
    setup({ completed: DE_IDS.slice(0, 2) });
    expect(node(/^Unit 2, Lesson 1: Bread, up next/).tagName).toBe("A");
    expect(node(/^Unit 2, Lesson 1/)).toHaveAttribute("href", `/lesson/${DE_IDS[2]}`);
  });

  it("the locked toast names the available lesson by unit and lesson", async () => {
    const { user, onLockedLesson } = setup({ completed: DE_IDS.slice(0, 2) });
    await user.click(node(/^Unit 2, Lesson 2:/));
    expect(onLockedLesson).toHaveBeenCalledWith(
      "Finish Unit 2, Lesson 1 to unlock this one.",
      DE_IDS[3],
    );
    expect(followed).toEqual([]);
  });

  it("the toast text for a later unit: 'Finish Unit 2, Lesson 4 to unlock this one.'", () => {
    expect(pathCopy.lockedToastText(4, 2)).toBe("Finish Unit 2, Lesson 4 to unlock this one.");
    expect(pathCopy.lockedToastText(4)).toBe("Finish Lesson 4 to unlock this one.");
    expect(pathCopy.nodeAccessibleName(2, "Bread", "locked", 3)).toBe(
      "Unit 3, Lesson 2: Bread, locked",
    );
    expect(pathCopy.lessonNumberText(2, 3)).toBe("Unit 3 · Lesson 2");
    expect(pathCopy.unitNumberText(3)).toBe("Unit 3");
  });

  it("a locked node in a later level names the current level's lesson", async () => {
    const { user, onLockedLesson } = setup({ course: TWO_LEVELS, completed: A1_IDS.slice(0, 3) });
    await user.click(levelButton(/^A2 ·/));
    await user.click(node(/^Unit 1, Lesson 1: A2 U1 L1, locked/));
    expect(onLockedLesson).toHaveBeenCalledWith(
      "Finish Unit 2, Lesson 2 to unlock this one.",
      lessonIdOf("A2", 1, 1),
    );
  });
});

describe("expand and collapse (GAM-010 AC6, AC7)", () => {
  it("on open only the current level is expanded; completed and locked are collapsed", () => {
    const course = makeLevelCourse({ A1: 1, A2: 1, B1: 1 });
    setup({ course, completed: lessonIdsOfLevel(course, "A1") });
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "false");
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(levelButton(/^B1 ·/)).toHaveAttribute("aria-expanded", "false");
    expect(levelSection("A1")).toHaveAttribute("data-level-state", "completed");
    expect(levelSection("B1")).toHaveAttribute("data-level-state", "locked");
    // Collapsed levels: no unit headers and no nodes in the DOM.
    expect(within(levelSection("A1")).queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    expect(within(levelSection("B1")).queryAllByRole("listitem")).toHaveLength(0);
    expect(nodeControls()).toHaveLength(2);
    expect(node(/^Unit 1, Lesson 1: A2 U1 L1, up next/)).toBeInTheDocument();
  });

  it("aria-controls points at the panel, present when collapsed too", async () => {
    const { user } = setup();
    const button = levelButton(/^A1 ·/);
    const panelId = button.getAttribute("aria-controls")!;
    expect(document.getElementById(panelId)).toContainElement(node(/Hallo!/));
    await user.click(button);
    expect(document.getElementById(panelId)).toBeEmptyDOMElement();
  });

  it("keyboard: Enter collapses and Space expands the focused level", async () => {
    const { user } = setup();
    await user.tab();
    const button = levelButton(/^A1 ·/);
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(nodeControls()).toHaveLength(0);
    expect(button).toHaveFocus();
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(nodeControls()).toHaveLength(4);
    // Tab then moves from the header into the level's first node.
    await user.tab();
    expect(node(/^Unit 1, Lesson 1: Hallo!/)).toHaveFocus();
  });

  it("any level with content can be expanded: completed and locked ones too", async () => {
    const { user } = setup({ course: TWO_LEVELS, completed: A1_IDS });
    await user.click(levelButton(/^A1 ·/));
    await user.click(levelButton(/^A2 ·/));
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "false");
    expect(nodeControls().map((c) => c.getAttribute("data-state"))).toEqual(
      Array(4).fill("completed"),
    );
  });

  it("every lesson completed: the last level with content is open", () => {
    setup({ course: TWO_LEVELS, completed: allLessonIds(TWO_LEVELS) });
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "false");
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(within(levelSection("A2")).getByText("4 of 4 lessons completed")).toBeInTheDocument();
  });

  it("large course (5 levels × 18 units × 5 lessons): only the current level's nodes render", () => {
    const course = makeLevelCourse({ A1: 18, A2: 18, B1: 18, B2: 18, C1: 18 }, 5);
    expect(course.units).toHaveLength(90);
    const done = [...lessonIdsOfLevel(course, "A1"), ...lessonIdsOfLevel(course, "A2")];
    setup({ course, completed: done });
    expect(nodeControls()).toHaveLength(90);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(90);
    expect(items.every((li) => levelSection("B1").contains(li))).toBe(true);
    expect(node(/^Unit 1, Lesson 1: B1 U1 L1, up next/)).toHaveAttribute(
      "href",
      `/lesson/${lessonIdOf("B1", 1, 1)}`,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(18);
  });

  it("large course, new learner: only A1's 90 nodes", () => {
    const course = makeLevelCourse({ A1: 18, A2: 18, B1: 18, B2: 18, C1: 18 }, 5);
    setup({ course });
    expect(nodeControls()).toHaveLength(90);
    expect(screen.getAllByRole("listitem").every((li) => levelSection("A1").contains(li))).toBe(
      true,
    );
  });
});

describe("finishing a level without a reload (GAM-010 AC9)", () => {
  it("the finished level collapses as completed and the next opens with lesson 1 up next", async () => {
    const { user, rerenderWith } = setup({ course: TWO_LEVELS, completed: A1_IDS.slice(0, 3) });
    // The learner opened A2 by hand, then finishes A1's last lesson.
    await user.click(levelButton(/^A2 ·/));
    rerenderWith(A1_IDS);
    expect(levelSection("A1")).toHaveAttribute("data-level-state", "completed");
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "false");
    expect(levelButton(/^A1 ·/)).toHaveAccessibleName(/4 of 4 lessons completed/);
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(node(/^Unit 1, Lesson 1: A2 U1 L1, up next/)).toBeInTheDocument();
    // Toggling still works after the reset.
    await user.click(levelButton(/^A1 ·/));
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "true");
  });

  it("a finished lesson inside the level keeps the learner's toggles", async () => {
    const { user, rerenderWith } = setup({ course: TWO_LEVELS });
    await user.click(levelButton(/^A2 ·/));
    rerenderWith(A1_IDS.slice(0, 1));
    expect(levelButton(/^A1 ·/)).toHaveAttribute("aria-expanded", "true");
    expect(levelButton(/^A2 ·/)).toHaveAttribute("aria-expanded", "true");
  });
});

describe("scroll to the next lesson on open (GAM-010 AC8, FIX-002)", () => {
  const originalScrollTo = window.scrollTo;
  afterEach(() => {
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: originalScrollTo,
    });
    delete (window as Partial<Window>).matchMedia;
  });

  function mockLayout(reduce: boolean) {
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 900,
      height: 80,
      width: 176,
      left: 0,
      right: 176,
      bottom: 980,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(600);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(100);
    const scroll = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scroll,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({ matches: reduce, media: query }) as MediaQueryList,
    });
    return { scroll, rect };
  }

  it("centres the available node of the current level, once, without moving focus", async () => {
    const intoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: intoView,
    });
    const { scroll, rect } = mockLayout(false);
    const { user, rerenderWith } = setup({ course: TWO_LEVELS, completed: A1_IDS });
    expect(rect.mock.contexts).toContain(node(/^Unit 1, Lesson 1: A2 U1 L1, up next/));
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ top: 740, behavior: "smooth" });
    expect(intoView).not.toHaveBeenCalled();
    expect(document.body).toHaveFocus();
    rerenderWith([...A1_IDS, lessonIdOf("A2", 1, 1)]);
    expect(scroll).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(levelButton(/^A1 ·/)).toHaveFocus();
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  });

  it("jumps without animation under reduced motion", () => {
    const { scroll } = mockLayout(true);
    setup();
    expect(scroll).toHaveBeenCalledWith({ top: 740, behavior: "auto" });
  });
});

describe("GAM-008 rules on a course with levels (GAM-010 AC10, AC12, AC13)", () => {
  it("0 hearts: playable nodes open the out-of-hearts dialog", async () => {
    const { user } = setup({ canStartLesson: false, heartRefillText: "Next heart in 1 h" });
    const start = node(/^Unit 1, Lesson 1: Hallo!, up next/);
    expect(start.tagName).toBe("BUTTON");
    await user.click(start);
    expect(screen.getByRole("dialog", { name: "You're out of hearts" })).toHaveTextContent(
      "Next heart in 1 h",
    );
  });

  it("states are shown by icon and text", () => {
    setup({ completed: DE_IDS.slice(0, 1) });
    const [done, next, locked] = nodeControls();
    expect(done!.querySelector("[data-icon='check']")).not.toBeNull();
    expect(within(done!).getByText(/Completed/)).toBeInTheDocument();
    expect(next!.querySelector("[data-pose='idle']")).not.toBeNull();
    expect(locked!.querySelector("[data-icon='lock']")).not.toBeNull();
    expect(within(locked!).getByText("Locked")).toBeInTheDocument();
  });

  it("results-error fallback: no results gives Unit 1, Lesson 1 up next, the rest locked", () => {
    setup({ completed: [] });
    expect(nodeControls().map((c) => c.getAttribute("data-state"))).toEqual([
      "available",
      "locked",
      "locked",
      "locked",
    ]);
  });

  it("375 px: headers wrap, tap targets ≥ 48 px, bottom-nav padding, no colour literals", async () => {
    const { container, user } = setup({ course: TWO_LEVELS, completed: A1_IDS.slice(0, 1) });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("overflow-x-hidden");
    expect(root.className).toMatch(/pb-\[calc\(env\(safe-area-inset-bottom\)\+7rem\)\]/);
    for (const button of screen.getAllByRole("button", { name: /^A[12] ·/ })) {
      expect(button.className).toContain("min-h-12");
      expect(button.className).toContain("w-full");
      expect(button.querySelector(".break-words")).not.toBeNull();
    }
    for (const c of nodeControls()) expect(c.className).toContain("min-h-12");
    const colour = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;
    expect(container.innerHTML).not.toMatch(colour);
    await user.click(levelButton(/^A1 ·/));
    expect(container.innerHTML).not.toMatch(colour);
  });

  it("courses without levels (en-es) keep the GAM-008 layout: no level header", () => {
    setup({ course: unitOneCourse });
    expect(screen.queryAllByRole("button", { expanded: true })).toHaveLength(0);
    expect(screen.queryAllByRole("button", { expanded: false })).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: "First Steps" })).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    node("Lesson 1: Hello!, up next. Start");
  });
});

describe("SkillPath container with the German fixture course", () => {
  const NOW = new Date("2026-11-12T12:00:00.000Z");
  let session: ReturnType<typeof createStubSession>;

  beforeEach(() => {
    session = createStubSession();
    mocks.session = session;
    session.progress.listLessonResults.mockResolvedValue([]);
    session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
    session.profile.findSettings.mockResolvedValue(null);
  });

  function results(...lessonIds: string[]) {
    return lessonIds.map((lessonId) =>
      makeResult({
        courseId: DE.id,
        unitId: DE.units.find((u) => u.lessons.some((l) => l.id === lessonId))!.id,
        lessonId,
        localDate: "2026-11-12",
      }),
    );
  }

  function setupContainer(props: Partial<SkillPathProps> = {}) {
    const repo = createGermanFixtureRepository();
    return renderWithQueryClient(
      <ToastProvider>
        <SkillPath courseId={DE.id} loadCourse={repo.getCourse} timeZone="UTC" {...props} />
      </ToastProvider>,
    );
  }

  it("renders levels from the content repository and updates without a reload", async () => {
    session.progress.listLessonResults.mockResolvedValue(results(DE_IDS[0]!));
    const { client } = setupContainer();
    expect(
      await screen.findByRole("link", { name: /^Unit 1, Lesson 2: How Are You\?, up next/ }),
    ).toBeInTheDocument();
    expect(levelButton(/^A1 · Beginner, 1 of 4/)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("heading", { level: 2, name: "A2 · Elementary" })).toBeInTheDocument();

    session.progress.listLessonResults.mockResolvedValue(results(...DE_IDS.slice(0, 2)));
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(DE.id) }));
    expect(
      await screen.findByRole("link", { name: /^Unit 2, Lesson 1: Bread, up next/ }),
    ).toBeInTheDocument();
    expect(levelButton(/^A1 · Beginner, 2 of 4/)).toBeInTheDocument();
  });

  it("a locked node shows the unit-and-lesson toast", async () => {
    const user = userEvent.setup();
    setupContainer();
    await user.click(await screen.findByRole("button", { name: /^Unit 2, Lesson 2: Please/ }));
    expect(
      await screen.findByText("Finish Unit 1, Lesson 1 to unlock this one."),
    ).toBeInTheDocument();
  });
});
