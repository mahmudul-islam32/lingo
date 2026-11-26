import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LessonResult, Settings } from "@/contracts";
import { createFullHearts, loseHearts, type ReviewQueue } from "@/features/gamification";
import {
  PRACTICE_INTRO_TEXT,
  PracticeScreen,
  REVIEW_BANNED_WORDS,
  REVIEW_CAUGHT_UP_TEXT,
  REVIEW_NO_HISTORY_TEXT,
  ReviewCardView,
  reviewDueText,
} from "@/features/path";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeOutcomeResult } from "../../../gamification/rules/__tests__/fixtures";
import { createStubSession, pending } from "../../../gamification/hooks/__tests__/session-stub";
import { twoUnitCourse } from "../../rules/__tests__/fixtures";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = twoUnitCourse.id;
const LESSON = twoUnitCourse.units[0]!.lessons[0]!.id;
const UNIT = twoUnitCourse.units[0]!.id;
const NOW = new Date("2026-12-10T12:00:00.000Z");

type Queue = Pick<ReviewQueue, "status" | "dueCount" | "eligibleCount">;
const STATES: Record<string, Queue> = {
  loading: { status: "loading", dueCount: 0, eligibleCount: 0 },
  "no history": { status: "success", dueCount: 0, eligibleCount: 0 },
  due: { status: "success", dueCount: 3, eligibleCount: 5 },
  "due (one)": { status: "success", dueCount: 1, eligibleCount: 1 },
  "caught up": { status: "success", dueCount: 0, eligibleCount: 4 },
};

const seriousViolations = async (container: Element) => {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colours; contrast is covered by the token tests.
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const card = () => screen.getByRole("region", { name: "Review" });

describe("ReviewCardView states (GAM-015 AC10–AC13)", () => {
  it("loading: a skeleton the height of the card, no text flash", () => {
    render(<ReviewCardView queue={STATES.loading!} />);
    const section = card();
    expect(section).toHaveAttribute("aria-busy", "true");
    expect(section.querySelector(".h-42")).not.toBeNull();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(REVIEW_NO_HISTORY_TEXT)).not.toBeInTheDocument();
  });

  it("no history: the hint, no button", () => {
    render(<ReviewCardView queue={STATES["no history"]!} />);
    expect(within(card()).getByText(REVIEW_NO_HISTORY_TEXT)).toBeInTheDocument();
    expect(
      screen.getByText("Answer exercises in any lesson and they come back here for review."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("due: heading, count line and a primary 'Start review' link to /review", () => {
    render(<ReviewCardView queue={STATES.due!} />);
    expect(within(card()).getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText("3 exercises are ready for review.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Start review" });
    expect(link).toHaveAttribute("href", "/review");
    expect(link.className).toMatch(/min-h-14/);
  });

  it("due: singular copy for one exercise", () => {
    render(<ReviewCardView queue={STATES["due (one)"]!} />);
    expect(screen.getByText("1 exercise is ready for review.")).toBeInTheDocument();
    expect(reviewDueText(2)).toBe("2 exercises are ready for review.");
  });

  it("caught up: the line and a soft 'Review anyway' link to /review", () => {
    render(<ReviewCardView queue={STATES["caught up"]!} />);
    expect(within(card()).getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText(REVIEW_CAUGHT_UP_TEXT)).toBeInTheDocument();
    expect(
      screen.getByText("You're all caught up. Review anyway to keep them fresh."),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Review anyway" });
    expect(link).toHaveAttribute("href", "/review");
    expect(link.className).toMatch(/min-h-12/);
  });

  it("error: the card is not rendered", () => {
    const { container } = render(
      <ReviewCardView queue={{ status: "error", dueCount: 0, eligibleCount: 0 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it.each(Object.entries(STATES))("%s: no banned word (AC12)", (_, queue) => {
    const { container } = render(<ReviewCardView queue={queue} />);
    const text = container.textContent ?? "";
    for (const word of REVIEW_BANNED_WORDS) {
      expect(text).not.toMatch(new RegExp(`\\b${word}\\b`, "i"));
    }
  });

  it.each(Object.entries(STATES))("%s: no serious or critical axe violations", async (_, q) => {
    const { container } = render(
      <main>
        <ReviewCardView queue={q} />
      </main>,
    );
    expect(await seriousViolations(container)).toEqual([]);
  });

  it.each([
    ["due", "Start review"],
    ["caught up", "Review anyway"],
  ])("%s: the link is reachable with Tab and follows with Enter", async (state, name) => {
    const user = userEvent.setup();
    render(<ReviewCardView queue={STATES[state]!} />);
    await user.tab();
    expect(screen.getByRole("link", { name })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(followed).toEqual(["/review"]);
  });

  it("the count line is plain text (no live region, no role)", () => {
    render(<ReviewCardView queue={STATES.due!} />);
    const line = screen.getByText("3 exercises are ready for review.");
    expect(line.tagName).toBe("P");
    expect(line).not.toHaveAttribute("role");
    expect(line).not.toHaveAttribute("aria-live");
  });
});

describe("ReviewCard on Practice (GAM-015 AC9, AC11, AC15)", () => {
  let session: ReturnType<typeof createStubSession>;
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    session = createStubSession();
    mocks.session = session;
    session.progress.getHearts.mockResolvedValue(createFullHearts(NOW));
    session.profile.findSettings.mockResolvedValue({ courseId: COURSE } as Settings);
  });

  const wrong = (date: string): LessonResult =>
    makeOutcomeResult({
      courseId: COURSE,
      lessonId: LESSON,
      date,
      outcomes: [["ex-1", "incorrect"]],
    });

  function setup() {
    const repository = {
      getCourse: vi.fn().mockResolvedValue(twoUnitCourse),
    } as unknown as BundledContentRepository;
    return renderWithQueryClient(
      <ContentRepositoryProvider repository={repository}>
        <PracticeScreen timeZone="UTC" />
      </ContentRepositoryProvider>,
      { client: createTestQueryClient() },
    );
  }

  it("sits under the intro and above the lesson list", async () => {
    session.progress.listLessonResults.mockResolvedValue([
      { ...wrong("2026-12-09"), unitId: UNIT },
    ]);
    setup();
    const start = await screen.findByRole("link", { name: "Start review" });
    const intro = screen.getByText(PRACTICE_INTRO_TEXT);
    const firstLesson = (await screen.findAllByRole("link", { name: /^Practise / }))[0]!;
    expect(intro.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      start.compareDocumentPosition(firstLesson) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("1 exercise is ready for review.")).toBeInTheDocument();
  });

  it("no history is shown also when the lesson list is empty", async () => {
    session.progress.listLessonResults.mockResolvedValue([]);
    setup();
    expect(await screen.findByText(REVIEW_NO_HISTORY_TEXT)).toBeInTheDocument();
  });

  it("is offered at 0 hearts and after any number of reviews today (no cap)", async () => {
    let hearts = createFullHearts(NOW);
    for (let i = 0; i < 5; i += 1) hearts = loseHearts(hearts, 1, NOW);
    session.progress.getHearts.mockResolvedValue(hearts);
    const reviews = Array.from({ length: 6 }, (_, i) =>
      makeOutcomeResult({
        courseId: COURSE,
        lessonId: LESSON,
        kind: "review",
        date: "2026-12-10",
        time: `0${i}:00`,
        outcomes: [["ex-1", "incorrect"]],
      }),
    );
    session.progress.listLessonResults.mockResolvedValue(reviews);
    setup();
    expect(await screen.findByRole("link", { name: "Start review" })).toHaveAttribute(
      "href",
      "/review",
    );
  });

  it("a read error hides the card; the list shows its own error as before", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    setup();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Review" })).not.toBeInTheDocument();
  });

  it("while loading, the card skeleton does not add a second status", () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    setup();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});
