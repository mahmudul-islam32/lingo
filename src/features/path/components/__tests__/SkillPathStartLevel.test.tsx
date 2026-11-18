/**
 * GAM-011 AC7–AC10, AC19 (PD-064): skipped levels ("Open" nodes), "Start here" on locked
 * level headers (focus, live region, scroll, failure toast) and the container's
 * `Settings.startLevel` wiring.
 */
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CefrLevel, Settings } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import { createFullHearts } from "@/features/gamification";
import {
  SkillPath,
  SkillPathView,
  computePathNodes,
  pathCopy,
  type SkillPathProps,
  type SkillPathViewProps,
} from "@/features/path";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { createStubSession } from "../../../gamification/hooks/__tests__/session-stub";
import { lessonIdOf, makeLevelCourse } from "../../rules/__tests__/level-fixtures";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

/** A1, A2, B1 with one unit of 2 lessons each; B2 "Coming soon". */
const COURSE = makeLevelCourse({ A1: 1, A2: 1, B1: 1, B2: 0 });
const NOW = new Date("2026-11-18T12:00:00.000Z");

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

const startHere = (name: string) => screen.getByRole("button", { name });
const queryStartHere = () => screen.queryAllByRole("button", { name: /^Start here/ });
const levelButton = (title: RegExp) => screen.getByRole("button", { name: title });
const announcement = () => screen.getByTestId("path-announcement");

function viewSetup(
  props: Partial<SkillPathViewProps> & {
    completed?: string[];
    startLevel?: CefrLevel | null;
  } = {},
) {
  const { completed = [], startLevel = null, ...rest } = props;
  const onStartHere = vi.fn<NonNullable<SkillPathViewProps["onStartHere"]>>(async () => {});
  const user = userEvent.setup();
  const element = (level: CefrLevel | null) => (
    <SkillPathView
      course={COURSE}
      nodes={computePathNodes(COURSE, completed, null, level ?? undefined)}
      startLevel={level}
      onStartHere={onStartHere}
      canStartLesson
      onLockedLesson={vi.fn()}
      {...rest}
    />
  );
  const view = render(element(startLevel));
  return {
    ...view,
    user,
    onStartHere,
    rerenderAt: (level: CefrLevel) => view.rerender(element(level)),
  };
}

describe("skipped levels: 'Open' nodes (GAM-011 AC7)", () => {
  it("A1 lessons are open links with the open-lock icon; A2 L1 is up next", async () => {
    const { user } = viewSetup({ startLevel: "A2", completed: [lessonIdOf("A1", 1, 2)] });
    expect(
      screen.getByRole("link", { name: "Unit 1, Lesson 1: A2 U1 L1, up next. Start" }),
    ).toBeInTheDocument();
    // A2 is the current (expanded) level; A1 opens on demand.
    await user.click(levelButton(/^A1 · Beginner/));
    const open = screen.getByRole("link", { name: "Unit 1, Lesson 1: A1 U1 L1, open" });
    expect(open).toHaveAttribute("href", `/lesson/${lessonIdOf("A1", 1, 1)}`);
    expect(open).toHaveAttribute("data-state", "open");
    expect(open).toHaveTextContent("Open");
    expect(open).not.toHaveTextContent(/Completed|Start|Up next/);
    expect(open.querySelector('[data-icon="lock-open"]')).not.toBeNull();
    expect(
      screen.getByRole("link", { name: "Unit 1, Lesson 2: A1 U1 L2, completed. Start again" }),
    ).toBeInTheDocument();
    expect(document.querySelector('section[data-level="A1"]')).toHaveAttribute(
      "data-level-state",
      "open",
    );
  });

  it("an open node opens with Enter and Space", async () => {
    const { user } = viewSetup({ startLevel: "A2" });
    await user.click(levelButton(/^A1 · Beginner/));
    const open = screen.getByRole("link", { name: /A1 U1 L1, open/ });
    open.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(followed).toEqual([`/lesson/a1-u01-l1`, `/lesson/a1-u01-l1`]);
  });

  it("at 0 hearts an open node opens the dialog (not practice, PD-065)", async () => {
    const { user } = viewSetup({ startLevel: "A2", canStartLesson: false });
    await user.click(levelButton(/^A1 · Beginner/));
    const open = screen.getByRole("button", { name: /A1 U1 L1, open/ });
    expect(open).toHaveAccessibleDescription(pathCopy.NO_HEARTS_TEXT);
    await user.click(open);
    expect(screen.getByRole("dialog", { name: "You're out of hearts" })).toBeInTheDocument();
    expect(followed).toEqual([]);
  });
});

describe("'Start here' on locked level headers (GAM-011 AC8–AC10)", () => {
  it("only fully locked levels get the button, named 'Start here: <code> <title>'", () => {
    viewSetup();
    const buttons = queryStartHere();
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Start here: A2 Elementary",
      "Start here: B1 Intermediate",
    ]);
    for (const button of buttons) expect(button).toHaveTextContent(/^Start here$/);
    // Not inside the heading's disclosure button.
    expect(within(levelButton(/^A2 · Elementary/)).queryByRole("button")).toBeNull();
  });

  it("no button on current, open, completed or partly completed levels", () => {
    viewSetup({ startLevel: "A2", completed: [lessonIdOf("B1", 1, 2)] });
    expect(queryStartHere()).toEqual([]);
  });

  it("no button without onStartHere", () => {
    viewSetup({ onStartHere: undefined });
    expect(queryStartHere()).toEqual([]);
  });

  it("saves the level, then focuses, announces and scrolls to the new up-next lesson", async () => {
    const scroll = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scroll,
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
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
    const { user, onStartHere, rerenderAt } = viewSetup();
    scroll.mockClear();
    expect(announcement()).toHaveTextContent("");

    await user.click(startHere("Start here: B1 Intermediate"));
    expect(onStartHere).toHaveBeenCalledWith("B1");
    // The caller saved it and passes the new start level (and nodes).
    rerenderAt("B1");

    const next = screen.getByRole("link", { name: "Unit 1, Lesson 1: B1 U1 L1, up next. Start" });
    expect(next).toHaveFocus();
    expect(announcement()).toHaveTextContent("Starting at B1 Intermediate.");
    expect(announcement()).toHaveAttribute("aria-live", "polite");
    expect(scroll).toHaveBeenCalled();
    expect(queryStartHere()).toEqual([]);
  });

  it("works with the keyboard only (Tab to the button, Enter)", async () => {
    const { user, onStartHere } = viewSetup();
    const button = startHere("Start here: A2 Elementary");
    button.focus();
    await user.keyboard("{Enter}");
    expect(onStartHere).toHaveBeenCalledWith("A2");
  });

  it("a failed save leaves the path as it was and moves no focus later", async () => {
    const { user, onStartHere, rerenderAt } = viewSetup();
    onStartHere.mockRejectedValueOnce(new Error("save failed"));
    const button = startHere("Start here: A2 Elementary");
    await user.click(button);
    await waitFor(() => expect(button).not.toHaveAttribute("aria-busy", "true"));
    expect(button).toBeInTheDocument();
    expect(announcement()).toHaveTextContent("");
    // A later, unrelated start level change doesn't steal focus.
    rerenderAt("A2");
    expect(document.activeElement).not.toBe(
      screen.getByRole("link", { name: /A2 U1 L1, up next/ }),
    );
    expect(announcement()).toHaveTextContent("");
  });
});

describe("SkillPath container: Settings.startLevel (GAM-011)", () => {
  const settings = (startLevel?: CefrLevel): Settings => ({
    courseId: COURSE.id,
    dailyGoalXp: 20,
    soundEffectsEnabled: true,
    speakingExercisesEnabled: true,
    ...(startLevel ? { startLevel } : {}),
    updatedAt: NOW.toISOString(),
  });

  let session: ReturnType<typeof createStubSession> & {
    profile: { updateSettings: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    const stub = createStubSession();
    session = { ...stub, profile: { ...stub.profile, updateSettings: vi.fn() } };
    mocks.session = session;
    session.progress.listLessonResults.mockResolvedValue([]);
    session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
  });

  function setup(props: Partial<SkillPathProps> = {}) {
    const client = createTestQueryClient();
    const loadCourse = vi.fn<SkillPathProps["loadCourse"]>().mockResolvedValue(COURSE);
    const user = userEvent.setup();
    renderWithQueryClient(
      <ToastProvider>
        <SkillPath courseId={COURSE.id} loadCourse={loadCourse} timeZone="UTC" {...props} />
      </ToastProvider>,
      { client },
    );
    return { client, user };
  }

  it("reads the start level from ['settings']", async () => {
    session.profile.findSettings.mockResolvedValue(settings("A2"));
    setup();
    expect(await screen.findByRole("link", { name: /A2 U1 L1, up next/ })).toBeInTheDocument();
  });

  it("a settings read error falls back to the first level", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    session.profile.findSettings.mockRejectedValue(new Error("read failed"));
    setup();
    expect(await screen.findByRole("link", { name: /A1 U1 L1, up next/ })).toBeInTheDocument();
  });

  it("'Start here' saves through the profile repository and updates the path", async () => {
    session.profile.findSettings.mockResolvedValue(settings());
    session.profile.updateSettings.mockResolvedValue(settings("B1"));
    const { user, client } = setup();
    await user.click(await screen.findByRole("button", { name: "Start here: B1 Intermediate" }));
    expect(session.profile.updateSettings).toHaveBeenCalledWith({ startLevel: "B1" });
    const next = await screen.findByRole("link", { name: /B1 U1 L1, up next/ });
    await waitFor(() => expect(next).toHaveFocus());
    expect(client.getQueryData<Settings>(queryKeys.settings())?.startLevel).toBe("B1");
    expect(announcement()).toHaveTextContent("Starting at B1 Intermediate.");
  });

  it("a failed save shows the toast and keeps the path (AC10)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    session.profile.findSettings.mockResolvedValue(settings());
    session.profile.updateSettings.mockRejectedValue(new Error("quota"));
    const { user } = setup();
    await user.click(await screen.findByRole("button", { name: "Start here: A2 Elementary" }));
    expect(await screen.findByText(pathCopy.START_LEVEL_ERROR_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /A1 U1 L1, up next/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start here: A2 Elementary" })).toBeInTheDocument();
  });

  it("props override the settings and the setter", async () => {
    session.profile.findSettings.mockResolvedValue(settings("A2"));
    const onStartHere = vi.fn(async () => {});
    const { user } = setup({ startLevel: "B1", onStartHere });
    expect(await screen.findByRole("link", { name: /B1 U1 L1, up next/ })).toBeInTheDocument();
    await act(async () => {});
    expect(queryStartHere()).toEqual([]);
    await user.click(levelButton(/^A1 · Beginner/));
    expect(screen.getByRole("link", { name: /A1 U1 L1, open/ })).toBeInTheDocument();
    expect(onStartHere).not.toHaveBeenCalled();
  });
});

describe("copy helpers (GAM-011)", () => {
  it("levelLabel strips the code and separator from the title", () => {
    expect(pathCopy.levelLabel({ level: "A2", title: "A2 · Elementary" })).toBe("A2 Elementary");
    expect(pathCopy.levelLabel({ level: "B1", title: "Intermediate" })).toBe("B1 Intermediate");
    expect(pathCopy.levelLabel({ level: "C1", title: "C1" })).toBe("C1");
    expect(pathCopy.startHereName({ level: "A2", title: "A2 · Elementary" })).toBe(
      "Start here: A2 Elementary",
    );
    expect(pathCopy.startingAtText({ level: "A2", title: "A2 · Elementary" })).toBe(
      "Starting at A2 Elementary.",
    );
  });
});
