import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import { createFullHearts } from "@/features/gamification";
import { SkillPath, courseQuery, type SkillPathProps } from "@/features/path";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../../gamification/rules/__tests__/fixtures";
import { createStubSession, pending } from "../../../gamification/hooks/__tests__/session-stub";
import { L, unitOneCourse } from "../../rules/__tests__/fixtures";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const COURSE = unitOneCourse.id;
const NOW = new Date("2026-11-07T12:00:00.000Z");

let session: ReturnType<typeof createStubSession>;
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
  session = createStubSession();
  mocks.session = session;
  session.progress.listLessonResults.mockResolvedValue([]);
  session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
  session.profile.findSettings.mockResolvedValue(null);
});

afterEach(() => {
  document.removeEventListener("click", recordNavigation);
  vi.restoreAllMocks();
});

function done(...lessonIds: string[]) {
  return lessonIds.map((lessonId) =>
    makeResult({ courseId: COURSE, unitId: "unit-1", lessonId, localDate: "2026-11-07" }),
  );
}

function setup(props: Partial<SkillPathProps> = {}, client = createTestQueryClient()) {
  const loadCourse = vi.fn<SkillPathProps["loadCourse"]>().mockResolvedValue(unitOneCourse);
  const user = userEvent.setup();
  const view = renderWithQueryClient(
    <ToastProvider>
      <SkillPath courseId={COURSE} loadCourse={loadCourse} timeZone="UTC" {...props} />
    </ToastProvider>,
    { client },
  );
  return { ...view, user, loadCourse };
}

/** Playable nodes are links (AC7). */
const node = (name: string) => screen.findByRole("link", { name });

describe("SkillPath container (GAM-008)", () => {
  it("loads the course under ['content', courseId] and shows each node state (AC4–AC6)", async () => {
    session.progress.listLessonResults.mockResolvedValue(done(L[0]));
    const { client, loadCourse } = setup();

    expect(
      await screen.findByRole("link", { name: "Lesson 1: Hello!, completed" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Lesson 2: Nice to Meet You, up next" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lesson 3: At the Café, locked" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText("1 of 5 lessons completed")).toBeInTheDocument();
    expect(loadCourse).toHaveBeenCalledWith(COURSE);
    expect(courseQuery(COURSE, loadCourse).queryKey).toEqual(queryKeys.content(COURSE));
    expect(client.getQueryData<Course>(queryKeys.content(COURSE))).toBe(unitOneCourse);
  });

  it("shows 'in progress' for the active lesson", async () => {
    setup({ activeLessonId: L[0] });
    expect(await node("Lesson 1: Hello!, in progress")).toBeInTheDocument();
  });

  it("opens /lesson/<id> for available and completed nodes (AC7)", async () => {
    session.progress.listLessonResults.mockResolvedValue(done(L[0]));
    const onNavigate = vi.fn();
    const { user } = setup({ onNavigate });
    await user.click(await screen.findByRole("link", { name: /Lesson 2: .*up next/ }));
    await user.click(screen.getByRole("link", { name: /Lesson 1: .*completed/ }));
    expect(followed).toEqual([`/lesson/${L[1]}`, `/lesson/${L[0]}`]);
    expect(onNavigate).toHaveBeenCalledWith(L[1]);
  });

  it("a locked node shows a toast via useToast and does not navigate (AC8)", async () => {
    const { user } = setup();
    await user.click(await screen.findByRole("button", { name: /Lesson 3: .*locked/ }));
    expect(await screen.findByText("Finish Lesson 1 to unlock this one.")).toBeInTheDocument();
    expect(followed).toEqual([]);
  });

  it("0-hearts gate: a dialog with the refill text, focus returns to the node (AC9, AC10)", async () => {
    const { user } = setup({ canStartLesson: false, heartRefillText: "Next heart in 3 h 12 min" });
    const start = await screen.findByRole("button", { name: /Lesson 1: .*up next/ });
    expect(screen.getAllByText("No hearts left").length).toBeGreaterThan(0);
    await user.click(start);
    const dialog = await screen.findByRole("dialog", { name: "You're out of hearts" });
    expect(dialog).toHaveTextContent("Next heart in 3 h 12 min");
    expect(followed).toEqual([]);
    await user.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => expect(start).toHaveFocus());
  });

  it("updates nodes after a lesson without a reload (AC12)", async () => {
    const { client } = setup();
    expect(await node("Lesson 1: Hello!, up next")).toBeInTheDocument();
    session.progress.listLessonResults.mockResolvedValue(done(L[0]));
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(COURSE) }));
    expect(await node("Lesson 1: Hello!, completed")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lesson 2: .*up next/ })).toBeInTheDocument();
  });

  it("shows the skeleton while the course loads (AC13)", () => {
    setup({ loadCourse: () => pending() });
    expect(screen.getByText("Loading your path").closest("[role=status]")).toBeInTheDocument();
  });

  it("shows the skeleton while progress loads (no flash of locked lessons)", async () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    const { client } = setup();
    await waitFor(() => expect(client.getQueryData(queryKeys.content(COURSE))).toBeDefined());
    expect(screen.getByText("Loading your path").closest("[role=status]")).toBeInTheDocument();
  });

  it("course error: message and 'Try again' refetches (AC14)", async () => {
    const loadCourse = vi
      .fn<SkillPathProps["loadCourse"]>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(unitOneCourse);
    const { user } = setup({ loadCourse });
    expect(await screen.findByText("We couldn't load the course.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await node("Lesson 1: Hello!, up next")).toBeInTheDocument();
    expect(loadCourse).toHaveBeenCalledTimes(2);
  });

  it("results error: path still shows with Lesson 1 available, no banner (AC14)", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    setup();
    expect(await node("Lesson 1: Hello!, up next")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lesson 2: .*locked/ })).toBeInTheDocument();
    // The toast queue's (empty) live regions are the only alerts: no error banner.
    for (const alert of screen.queryAllByRole("alert")) expect(alert).toBeEmptyDOMElement();
    expect(screen.queryByText("We couldn't load the course.")).not.toBeInTheDocument();
  });
});
