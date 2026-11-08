import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourseSchema, type Course, type PathNode } from "@/contracts";
import { ToastProvider, useToast } from "@/components/ui";
import {
  SKELETON_NODE_COUNT,
  SkillPathError,
  SkillPathSkeleton,
  SkillPathView,
  computePathNodes,
  pathCopy,
  type SkillPathViewProps,
} from "@/features/path";
import { L, twoUnitCourse, unitOneCourse } from "../../rules/__tests__/fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const TITLES = ["Hello!", "Nice to Meet You", "At the Café", "Count It", "Around Town"];

/** Records followed links and stops jsdom's (unimplemented) navigation. */
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

function setup(
  props: Partial<SkillPathViewProps> & { completed?: string[]; active?: string | null } = {},
) {
  const { completed = [], active = null, ...rest } = props;
  const course = rest.course ?? unitOneCourse;
  const onLockedLesson = vi.fn<SkillPathViewProps["onLockedLesson"]>();
  const onNavigate = vi.fn<NonNullable<SkillPathViewProps["onNavigate"]>>();
  const user = userEvent.setup();
  const view = render(
    <SkillPathView
      course={course}
      nodes={computePathNodes(course, completed, active)}
      canStartLesson
      heartRefillText="Next heart in 3 h 12 min"
      onLockedLesson={onLockedLesson}
      onNavigate={onNavigate}
      {...rest}
    />,
  );
  return { user, onLockedLesson, onNavigate, ...view };
}

/** A node control (link or button) by its accessible name. */
const node = (name: string | RegExp) => screen.getByLabelText(name);
const controls = (listName = "First Steps") =>
  within(screen.getByRole("list", { name: listName }))
    .getAllByRole("listitem")
    .map((item) => item.firstElementChild as HTMLElement);

describe("SkillPathView: structure (AC4)", () => {
  it("shows the unit header with its title and completed count", () => {
    setup({ completed: [L[0], L[1]] });
    expect(screen.getByRole("heading", { level: 2, name: "First Steps" })).toBeInTheDocument();
    expect(screen.getByText("2 of 5 lessons completed")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "First Steps" })).toBeInTheDocument();
  });

  it("renders the 5 lessons as an ordered list with number and title visible", () => {
    setup();
    const list = screen.getByRole("list", { name: "First Steps" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    items.forEach((item, i) => {
      expect(item).toHaveTextContent(`Lesson ${i + 1}`);
      expect(item).toHaveTextContent(TITLES[i]!);
    });
  });

  it("playable nodes are links to /lesson/<id>; locked nodes are buttons", () => {
    setup({ completed: [L[0]] });
    const [done, next, ...locked] = controls();
    expect(done).toHaveRole("link");
    expect(done).toHaveAttribute("href", `/lesson/${L[0]}`);
    expect(next).toHaveRole("link");
    expect(next).toHaveAttribute("href", `/lesson/${L[1]}`);
    for (const c of locked) {
      expect(c.tagName).toBe("BUTTON");
      expect(c).toHaveAttribute("type", "button");
      expect(c).not.toBeDisabled();
    }
  });

  it("every node is reachable with Tab, in order, locked ones included (AC8)", async () => {
    const { user } = setup({ completed: [L[0]] });
    for (const c of controls()) {
      await user.tab();
      expect(c).toHaveFocus();
    }
  });

  it("zigzags nodes with an offset of at most 48 px (translate-x-12)", () => {
    setup();
    const classes = controls().map((c) => c.className);
    expect(classes[0]).toContain("translate-x-0");
    expect(classes[1]).toContain("translate-x-12");
    expect(classes[3]).toContain("-translate-x-12");
    for (const c of classes) expect(c).not.toMatch(/translate-x-(1[3-9]|[2-9]\d)/);
  });

  it("leaves room for the bottom navigation and prevents horizontal scrolling (AC16)", () => {
    const { container } = setup();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("overflow-x-hidden");
    expect(root.className).toContain("max-w-md");
    expect(root.className).toMatch(/pb-\[calc\(env\(safe-area-inset-bottom\)\+7rem\)\]/);
  });

  it("node discs are at least 64 px and tap targets at least 48 px (AC16)", () => {
    setup();
    for (const c of controls()) expect(c.className).toContain("min-h-12");
    const discs = screen.getAllByTestId("path-node-disc");
    expect(discs[0]!.className).toContain("size-20"); // available is the largest
    for (const disc of discs.slice(1)) expect(disc.className).toContain("size-16");
  });

  it("uses no colour literals (AC17)", () => {
    const { container } = setup({ completed: [L[0]], active: L[1] });
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });
});

describe("SkillPathView: states and accessible names (AC5, AC6)", () => {
  it.each<{ state: PathNode["state"]; text: string; icon: string | null; suffix: string }>([
    { state: "completed", text: "Completed", icon: "check", suffix: "completed" },
    { state: "available", text: "Start", icon: null, suffix: "up next" },
    { state: "locked", text: "Locked", icon: "lock", suffix: "locked" },
    { state: "in_progress", text: "Continue", icon: "half-ring", suffix: "in progress" },
  ])("$state: icon and text '$text', name ', $suffix'", ({ state, text, icon, suffix }) => {
    // L1 completed, L2 in progress or available, L3 locked.
    setup({ completed: [L[0]], active: state === "in_progress" ? L[1] : null });
    const index = { completed: 0, available: 1, in_progress: 1, locked: 2 }[state];
    const control = node(`Lesson ${index + 1}: ${TITLES[index]}, ${suffix}`);
    expect(control).toHaveAttribute("data-state", state);
    expect(control).toHaveTextContent(text);
    if (icon) {
      expect(control.querySelector(`[data-icon="${icon}"]`)).not.toBeNull();
    } else {
      // Available: Lumi inside a glow ring.
      expect(control.querySelector('svg[data-pose="idle"]')).not.toBeNull();
      expect(within(control).getByTestId("path-node-disc").className).toContain("ring-8");
    }
  });

  it("completed nodes say 'Start again' (AC7)", () => {
    setup({ completed: [L[0]] });
    expect(node("Lesson 1: Hello!, completed")).toHaveTextContent("Start again");
    expect(node("Lesson 2: Nice to Meet You, up next")).not.toHaveTextContent("Start again");
  });

  it("names every node of a new learner", () => {
    setup();
    expect(controls().map((c) => c.getAttribute("aria-label"))).toEqual([
      "Lesson 1: Hello!, up next",
      "Lesson 2: Nice to Meet You, locked",
      "Lesson 3: At the Café, locked",
      "Lesson 4: Count It, locked",
      "Lesson 5: Around Town, locked",
    ]);
  });

  it("all 5 done: every node completed, none up next", () => {
    setup({ completed: [...L] });
    expect(screen.getByText("5 of 5 lessons completed")).toBeInTheDocument();
    for (const c of controls()) expect(c).toHaveAttribute("data-state", "completed");
    expect(screen.queryByLabelText(/up next/)).toBeNull();
  });

  it("only locked nodes are aria-disabled", () => {
    setup({ completed: [L[0]] });
    const [done, next, ...locked] = controls();
    expect(done).not.toHaveAttribute("aria-disabled");
    expect(next).not.toHaveAttribute("aria-disabled");
    for (const c of locked) expect(c).toHaveAttribute("aria-disabled", "true");
  });
});

describe("SkillPathView: activation (AC7, AC8)", () => {
  it("click on the available node follows /lesson/<id> once", async () => {
    const { user, onNavigate, onLockedLesson } = setup();
    await user.click(node(/^Lesson 1:/));
    expect(followed).toEqual([`/lesson/${L[0]}`]);
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith(L[0]);
    expect(onLockedLesson).not.toHaveBeenCalled();
  });

  it.each(["{Enter}", " "])("keyboard %s on a completed node opens it", async (key) => {
    const { user, onNavigate } = setup({ completed: [L[0]] });
    node(/^Lesson 1:/).focus();
    await user.keyboard(key);
    expect(followed).toEqual([`/lesson/${L[0]}`]);
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith(L[0]);
  });

  it("other keys on a link do nothing", async () => {
    const { user } = setup();
    node(/^Lesson 1:/).focus();
    await user.keyboard("a");
    expect(followed).toEqual([]);
  });

  it("an in-progress node opens the lesson", async () => {
    const { user } = setup({ active: L[0] });
    await user.click(node("Lesson 1: Hello!, in progress"));
    expect(followed).toEqual([`/lesson/${L[0]}`]);
  });

  it("works without an onNavigate callback", async () => {
    const { user } = setup({ onNavigate: undefined });
    await user.click(node(/^Lesson 1:/));
    expect(followed).toEqual([`/lesson/${L[0]}`]);
  });

  it.each(["click", "{Enter}", " "])(
    "a locked node (%s) asks to finish the available lesson and does not navigate",
    async (how) => {
      const { user, onNavigate, onLockedLesson } = setup({ completed: [L[0]] });
      const target = node(/^Lesson 4:/);
      if (how === "click") await user.click(target);
      else {
        target.focus();
        await user.keyboard(how);
      }
      expect(followed).toEqual([]);
      expect(onNavigate).not.toHaveBeenCalled();
      expect(onLockedLesson).toHaveBeenCalledExactlyOnceWith(
        "Finish Lesson 2 to unlock this one.",
        L[3],
      );
      expect(target).toHaveFocus();
    },
  );

  it("out-of-order results: locked toast names the available lesson", async () => {
    const { user, onLockedLesson } = setup({ completed: [L[0], L[2]] });
    expect(node(/^Lesson 3:/)).toHaveAttribute("data-state", "completed");
    await user.click(node(/^Lesson 5:/));
    expect(onLockedLesson).toHaveBeenCalledWith("Finish Lesson 2 to unlock this one.", L[4]);
  });

  it("shows the locked message as a toast through useToast", async () => {
    function Harness() {
      const toast = useToast();
      return (
        <SkillPathView
          course={unitOneCourse}
          nodes={computePathNodes(unitOneCourse, [], null)}
          canStartLesson
          onLockedLesson={(message) => toast.show({ title: message })}
        />
      );
    }
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await user.click(node(/^Lesson 3:/));
    expect(screen.getByRole("status")).toHaveTextContent("Finish Lesson 1 to unlock this one.");
  });

  it("a locked node with no frontier falls back to a generic message", async () => {
    const nodes: PathNode[] = [{ lessonId: L[0], unitId: "unit-1", state: "locked" }];
    const { user, onLockedLesson } = setup({ nodes });
    await user.click(node(/^Lesson 1:/));
    expect(onLockedLesson).toHaveBeenCalledWith(
      "Finish the earlier lessons to unlock this one.",
      L[0],
    );
  });

  it("a frontier outside the course falls back to the generic message", async () => {
    const nodes: PathNode[] = [
      { lessonId: "orphan", unitId: "unit-x", state: "available" },
      { lessonId: L[0], unitId: "unit-1", state: "locked" },
    ];
    const { user, onLockedLesson } = setup({ nodes });
    expect(screen.queryByLabelText(/orphan/)).toBeNull();
    await user.click(node(/^Lesson 1:/));
    expect(onLockedLesson).toHaveBeenCalledWith(
      "Finish the earlier lessons to unlock this one.",
      L[0],
    );
  });
});

describe("SkillPathView: 0-hearts gate (AC9, AC10)", () => {
  it("playable nodes become buttons with 'No hearts left' and an outlined heart", () => {
    setup({ completed: [L[0]], canStartLesson: false });
    const [done, next, locked] = controls();
    for (const c of [done!, next!]) {
      expect(c.tagName).toBe("BUTTON");
      expect(c).not.toHaveAttribute("href");
      expect(c).not.toHaveAttribute("aria-disabled");
      expect(c).toHaveTextContent("No hearts left");
      expect(c.querySelector('svg[data-filled="false"]')).not.toBeNull();
      expect(c).toHaveAccessibleDescription("No hearts left");
    }
    expect(locked).not.toHaveTextContent("No hearts left");
    expect(locked).not.toHaveAttribute("aria-describedby");
  });

  it("hides the hint when hearts are available", () => {
    setup({ completed: [L[0]] });
    expect(screen.queryByText("No hearts left")).toBeNull();
  });

  it.each([
    ["available", /^Lesson 2:/],
    ["completed", /^Lesson 1:/],
  ])("activating a %s node opens the dialog, not the lesson", async (_, name) => {
    const { user, onNavigate } = setup({ completed: [L[0]], canStartLesson: false });
    await user.click(node(name));
    expect(followed).toEqual([]);
    expect(onNavigate).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "You're out of hearts" });
    expect(dialog).toHaveAccessibleDescription("Next heart in 3 h 12 min");
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("OK");
    expect(buttons[0]).toHaveFocus();
    expect(dialog).not.toHaveTextContent(/practice|buy|purchase|gems|shop/i);
  });

  it("OK closes the dialog and returns focus to the node (keyboard)", async () => {
    const { user } = setup({ completed: [L[0]], canStartLesson: false });
    const target = node(/^Lesson 2:/);
    target.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(target).toHaveFocus();
  });

  it("Escape closes the dialog and returns focus to the node", async () => {
    const { user } = setup({ completed: [L[0]], canStartLesson: false });
    const target = node(/^Lesson 1:/);
    await user.click(target);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(target).toHaveFocus();
  });

  it("locked nodes still show the locked toast at 0 hearts", async () => {
    const { user, onLockedLesson } = setup({ canStartLesson: false });
    await user.click(node(/^Lesson 2:/));
    expect(onLockedLesson).toHaveBeenCalledWith("Finish Lesson 1 to unlock this one.", L[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("falls back to a neutral refill text without heartRefillText", async () => {
    const { user } = setup({ canStartLesson: false, heartRefillText: null });
    await user.click(node(/^Lesson 1:/));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(pathCopy.OUT_OF_HEARTS_FALLBACK);
  });
});

describe("SkillPathView: scroll to the next lesson (AC11, AC12)", () => {
  function mockMotion(reduce: boolean | null) {
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scroll,
    });
    if (reduce !== null) {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: (query: string) =>
          ({ matches: reduce && query.includes("reduce"), media: query }) as MediaQueryList,
      });
    }
    return scroll;
  }

  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
    delete (window as Partial<Window>).matchMedia;
  });

  it("smooth-scrolls the available node into view on open", () => {
    const scroll = mockMotion(false);
    setup({ completed: [L[0]] });
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(node(/^Lesson 2:/));
    expect(scroll).toHaveBeenCalledWith({ block: "center", inline: "nearest", behavior: "smooth" });
  });

  it("scrolls to the frontier button at 0 hearts too", () => {
    const scroll = mockMotion(false);
    setup({ completed: [L[0]], canStartLesson: false });
    expect(scroll.mock.contexts[0]).toBe(node(/^Lesson 2:/));
  });

  it("jumps without animation under prefers-reduced-motion", () => {
    const scroll = mockMotion(true);
    setup();
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("scrolls smoothly when matchMedia is missing", () => {
    const scroll = mockMotion(null);
    setup();
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("does not scroll when everything is completed", () => {
    const scroll = mockMotion(false);
    setup({ completed: [...L] });
    expect(scroll).not.toHaveBeenCalled();
  });

  it("works when scrollIntoView is missing (jsdom, old browsers)", () => {
    expect("scrollIntoView" in HTMLElement.prototype).toBe(false);
    expect(() => setup()).not.toThrow();
  });

  it("updates without a reload after finishing a lesson, without scrolling again", () => {
    const scroll = mockMotion(false);
    const { rerender, onLockedLesson } = setup();
    rerender(
      <SkillPathView
        course={unitOneCourse}
        nodes={computePathNodes(unitOneCourse, [L[0]], null)}
        canStartLesson
        onLockedLesson={onLockedLesson}
      />,
    );
    expect(node(/^Lesson 1:/)).toHaveAttribute("data-state", "completed");
    expect(node(/^Lesson 2:/)).toHaveAttribute("data-state", "available");
    expect(node(/^Lesson 2:/)).toHaveAttribute("href", `/lesson/${L[1]}`);
    expect(screen.getByText("1 of 5 lessons completed")).toBeInTheDocument();
    expect(scroll).toHaveBeenCalledTimes(1);
  });
});

describe("SkillPathView: multiple units and empty state (AC15)", () => {
  it("renders one section per unit and numbers lessons globally", () => {
    setup({ course: twoUnitCourse, completed: ["a1", "a2"] });
    expect(screen.getAllByRole("region")).toHaveLength(2);
    expect(controls("Next Steps").map((c) => c.getAttribute("aria-label"))).toEqual([
      "Lesson 3: B1, up next",
      "Lesson 4: B2, locked",
    ]);
    expect(screen.getByText("2 of 2 lessons completed")).toBeInTheDocument();
    expect(screen.getByText("0 of 2 lessons completed")).toBeInTheDocument();
  });

  it("the zigzag continues across units", () => {
    setup({ course: twoUnitCourse });
    expect(controls("Next Steps")[0]!.className).toContain("translate-x-0");
    expect(controls("Next Steps")[1]!.className).toContain("-translate-x-12");
  });

  it("a locked toast in unit 2 names the global lesson number", async () => {
    const { user, onLockedLesson } = setup({ course: twoUnitCourse, completed: ["a1", "a2"] });
    await user.click(node(/^Lesson 4:/));
    expect(onLockedLesson).toHaveBeenCalledWith("Finish Lesson 3 to unlock this one.", "b2");
  });

  it("a unit without lesson nodes shows 'New lessons are on the way.' with Lumi idle", () => {
    const course: Course = CourseSchema.parse({
      ...twoUnitCourse,
      units: [
        ...twoUnitCourse.units,
        { id: "unit-3", title: "Coming Soon", lessons: [{ id: "c1", title: "C1" }] },
      ],
    });
    // The manifest requires >= 1 lesson per unit; its nodes can still be empty.
    const nodes = computePathNodes(course, [], null).filter((n) => n.unitId !== "unit-3");
    const { container } = setup({ course, nodes });
    const region = screen.getByRole("region", { name: "Coming Soon" });
    expect(region).toHaveTextContent("New lessons are on the way.");
    expect(within(region).queryByRole("list")).toBeNull();
    expect(region.querySelector('svg[data-pose="idle"]')).not.toBeNull();
    expect(container).not.toHaveTextContent(/of 0 lessons/);
  });

  it("results error fallback: no completed ids gives Lesson 1 available, rest locked (AC14)", () => {
    setup({ completed: [] });
    expect(controls().map((c) => c.dataset.state)).toEqual([
      "available",
      "locked",
      "locked",
      "locked",
      "locked",
    ]);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("SkillPathSkeleton (AC13)", () => {
  it("is a status 'Loading your path' with a header and 5 node skeletons", () => {
    const { container } = render(<SkillPathSkeleton />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading your path");
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(1 + SKELETON_NODE_COUNT);
    expect(SKELETON_NODE_COUNT).toBe(5);
  });
});

describe("SkillPathError (AC14)", () => {
  it("shows the message, Lumi ember and a working 'Try again'", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<SkillPathError onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load the course.");
    expect(container.querySelector('svg[data-pose="ember"]')).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("path copy", () => {
  it("formats unit progress, names and the locked toast", () => {
    expect(pathCopy.unitProgressText(0, 5)).toBe("0 of 5 lessons completed");
    expect(pathCopy.unitProgressText(1, 1)).toBe("1 of 1 lesson completed");
    expect(pathCopy.nodeAccessibleName(3, "At the Café", "in_progress")).toBe(
      "Lesson 3: At the Café, in progress",
    );
    expect(pathCopy.lockedToastText(2)).toBe("Finish Lesson 2 to unlock this one.");
    expect(pathCopy.lockedToastText(null)).toBe("Finish the earlier lessons to unlock this one.");
  });
});
