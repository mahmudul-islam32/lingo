import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Settings } from "@/contracts";
import { createFullHearts, loseHearts } from "@/features/gamification";
import { PracticeScreen, PRACTICE_EMPTY_TEXT, PRACTICE_INTRO_TEXT } from "@/features/path";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../../gamification/rules/__tests__/fixtures";
import { createStubSession, pending } from "../../../gamification/hooks/__tests__/session-stub";
import { twoUnitCourse } from "../../rules/__tests__/fixtures";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = twoUnitCourse.id; // "en-es", a registered course
const NOW = new Date("2026-11-19T12:00:00.000Z");

let session: ReturnType<typeof createStubSession>;
let getCourse: ReturnType<typeof vi.fn>;
let followed: string[] = [];
function recordNavigation(event: MouseEvent) {
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor) return;
  event.preventDefault();
  followed.push(anchor.getAttribute("href") ?? "");
}

beforeEach(() => {
  // Hearts refill on the real clock: freeze Date at NOW so the 0-hearts case does not
  // depend on the day the suite runs (FIX-008). Timers stay real for userEvent.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  followed = [];
  document.addEventListener("click", recordNavigation);
  session = createStubSession();
  mocks.session = session;
  session.progress.listLessonResults.mockResolvedValue([]);
  session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
  session.profile.findSettings.mockResolvedValue({ courseId: COURSE } as Settings);
  getCourse = vi.fn().mockResolvedValue(twoUnitCourse);
});

afterEach(() => {
  vi.useRealTimers();
  document.removeEventListener("click", recordNavigation);
  vi.restoreAllMocks();
});

function played(lessonId: string, unitId: string, completedAt: string) {
  return makeResult({
    courseId: COURSE,
    unitId,
    lessonId,
    localDate: completedAt.slice(0, 10),
    completedAt,
    startedAt: completedAt,
  });
}

function setup() {
  const repository = { getCourse } as unknown as BundledContentRepository;
  const user = userEvent.setup();
  const view = renderWithQueryClient(
    <ContentRepositoryProvider repository={repository}>
      <PracticeScreen timeZone="UTC" />
    </ContentRepositoryProvider>,
    { client: createTestQueryClient() },
  );
  return { ...view, user };
}

const practiseLinks = () => screen.getAllByRole("link", { name: /^Practise / });

describe("PracticeScreen (GAM-012 AC6–AC9)", () => {
  it("lists only completed lessons, grouped by unit, most recent unit first (AC6, AC8)", async () => {
    session.progress.listLessonResults.mockResolvedValue([
      played("a1", "unit-1", "2026-11-17T10:00:00.000Z"),
      played("a2", "unit-1", "2026-11-18T10:00:00.000Z"),
      played("b1", "unit-2", "2026-11-19T10:00:00.000Z"),
    ]);
    setup();

    const headings = await screen.findAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "Unit 2: Next Steps",
      "Unit 1: First Steps",
    ]);
    expect(practiseLinks().map((a) => a.getAttribute("href"))).toEqual([
      "/lesson/b1",
      "/lesson/a2",
      "/lesson/a1",
    ]);
    // b2 isn't finished: never listed.
    expect(screen.queryByText("B2")).not.toBeInTheDocument();
    const row = practiseLinks()[0]!.closest("li")!;
    expect(row).toHaveTextContent("B1");
    expect(row).toHaveTextContent("Unit 2 · Lesson 1");
    expect(within(row).getByRole("link")).toHaveAccessibleName("Practise B1");
    expect(within(row).getByRole("link")).toHaveTextContent(/^Practise$/);
  });

  it("explains practice and shows the hearts count (AC7)", async () => {
    session.progress.getHearts.mockResolvedValue(loseHearts(createFullHearts(NOW), 3, NOW));
    session.progress.listLessonResults.mockResolvedValue([
      played("a1", "unit-1", "2026-11-17T10:00:00.000Z"),
    ]);
    setup();
    expect(await screen.findByRole("heading", { level: 1, name: "Practice" })).toBeInTheDocument();
    expect(screen.getByText(PRACTICE_INTRO_TEXT)).toBeInTheDocument();
    expect(
      screen.getByText("Practise a finished lesson. It's free, and correct answers earn hearts."),
    ).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: /^Hearts: \d of 5$/ })).toBeInTheDocument();
  });

  it("at 0 hearts the lessons still open with a plain link (practice, PD-065, AC8)", async () => {
    session.progress.getHearts.mockResolvedValue(loseHearts(createFullHearts(NOW), 5, NOW));
    session.progress.listLessonResults.mockResolvedValue([
      played("a1", "unit-1", "2026-11-17T10:00:00.000Z"),
    ]);
    const { user } = setup();
    expect(await screen.findByRole("img", { name: "Hearts: 0 of 5" })).toBeInTheDocument();
    const link = await screen.findByRole("link", { name: "Practise A1" });
    expect(link).not.toHaveAttribute("aria-disabled");
    // Keyboard: Tab reaches it, Enter follows it.
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(followed).toEqual(["/lesson/a1"]);
  });

  it("empty state: Lumi, the hint and 'Go to Learn' (AC9)", async () => {
    setup();
    expect(await screen.findByText(PRACTICE_EMPTY_TEXT)).toBeInTheDocument();
    expect(screen.getByText("Finish your first lesson to practise it here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Learn" })).toHaveAttribute("href", "/");
    expect(document.querySelector("svg[data-pose]")).not.toBeNull();
    expect(screen.queryByRole("link", { name: /^Practise / })).not.toBeInTheDocument();
  });

  it("loading: skeleton cards with a status", () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    setup();
    expect(screen.getByRole("status")).toHaveTextContent("Loading your finished lessons");
  });

  it("results can't be read: error card with 'Try again' that reloads", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    const { user } = setup();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load your finished lessons.",
    );
    session.progress.listLessonResults.mockResolvedValue([
      played("a1", "unit-1", "2026-11-17T10:00:00.000Z"),
    ]);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("link", { name: "Practise A1" })).toBeInTheDocument();
  });

  it("an unknown saved course falls back to the default course", async () => {
    session.profile.findSettings.mockResolvedValue({ courseId: "xx-yy" } as Settings);
    setup();
    await screen.findByText(PRACTICE_EMPTY_TEXT);
    expect(getCourse).toHaveBeenCalledWith("en-de");
  });
});
