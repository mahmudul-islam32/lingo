import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsSchema, type DailyGoalXp } from "@/contracts";
import { DailyGoalRing, createFullHearts } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending } from "../../hooks/__tests__/session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "es-en";
const TZ = "Europe/Berlin";
const NOW = new Date("2026-11-07T12:00:00.000Z");
const TODAY = "2026-11-07";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function settings(dailyGoalXp: DailyGoalXp) {
  return SettingsSchema.parse({
    courseId: COURSE,
    dailyGoalXp,
    soundEffectsEnabled: true,
    speakingExercisesEnabled: true,
    updatedAt: "2026-11-01T00:00:00.000Z",
  });
}

/** Results worth `xp` today: perfect lessons (15) plus non-perfect ones (10). */
function resultsWorth(xp: number) {
  const out = [];
  let left = xp;
  while (left >= 15 && left !== 20) {
    out.push(makeResult({ courseId: COURSE, localDate: TODAY }));
    left -= 15;
  }
  while (left >= 10) {
    out.push(makeResult({ courseId: COURSE, localDate: TODAY, mistakeCount: 1, perfect: false }));
    left -= 10;
  }
  if (left !== 0) throw new Error(`can't build ${xp} XP`);
  return out;
}

function seeded(earned: number, goal: DailyGoalXp = 20) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress(COURSE), resultsWorth(earned));
  client.setQueryData(queryKeys.hearts(), createFullHearts(NOW));
  client.setQueryData(queryKeys.settings(), settings(goal));
  return client;
}

function renderRing(client = seeded(0)) {
  return renderWithQueryClient(<DailyGoalRing courseId={COURSE} timeZone={TZ} />, { client });
}

function offset() {
  return Number(screen.getByTestId("daily-goal-progress").getAttribute("stroke-dashoffset"));
}

describe("DailyGoalRing (GAM-006)", () => {
  it.each([
    // earned, value text, valuenow, valuetext, hint, dashoffset, reached
    [0, "0 / 20 XP", 0, "0 of 20 XP today", "20 XP to go", 100, false],
    [15, "15 / 20 XP", 15, "15 of 20 XP today", "5 XP to go", 25, false],
    [20, "20 / 20 XP", 20, "Daily goal reached: 20 XP today", "Goal reached!", 0, true],
    [25, "25 / 20 XP", 20, "Daily goal reached: 25 XP today", "Goal reached!", 0, true],
  ])("%i / 20 XP", (earned, value, valueNow, valueText, hint, dashOffset, reached) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    renderRing(seeded(earned));

    // AC3: progressbar semantics on the wrapper; the SVG is decorative.
    const ring = screen.getByRole("progressbar", { name: "Daily goal" });
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "20");
    expect(ring).toHaveAttribute("aria-valuenow", String(valueNow));
    expect(ring).toHaveAttribute("aria-valuetext", valueText);
    expect(ring.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    // AC1, AC2, AC4, AC5, AC6
    expect(screen.getByText("Daily goal")).toBeVisible();
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
    expect(offset()).toBe(dashOffset);

    const stroke = screen.getByTestId("daily-goal-progress");
    expect(stroke).toHaveClass(reached ? "stroke-success" : "stroke-xp");
    // AC5: not by colour alone, a check icon is drawn when reached.
    expect(ring.querySelectorAll("svg")).toHaveLength(reached ? 2 : 1);
  });

  it("reads the goal from settings (AC9)", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    renderRing(seeded(15, 50));
    expect(screen.getByText("15 / 50 XP")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "50");
    expect(screen.getByText("35 XP to go")).toBeInTheDocument();
  });

  it("animates ≤ 600 ms and skips the animation under reduced motion (AC12)", () => {
    const matchMedia = vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", matchMedia);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    renderRing(seeded(15));
    const stroke = screen.getByTestId("daily-goal-progress");
    // jsdom runs no transitions: the CSS contract is a 500 ms transition that the
    // `prefers-reduced-motion: reduce` variant turns off (jump straight to the value).
    expect(stroke).toHaveClass("transition-[stroke-dashoffset]", "duration-500");
    expect(stroke).toHaveClass("motion-reduce:transition-none");
    vi.unstubAllGlobals();
  });

  it("shows the new value after a lesson without a reload (AC7)", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    const client = seeded(0);
    renderRing(client);
    expect(screen.getByText("0 / 20 XP")).toBeInTheDocument();
    // What LES-010 does after saving a result: write/invalidate the raw results key.
    act(() => client.setQueryData(queryKeys.progress(COURSE), resultsWorth(15)));
    expect(await screen.findByText("15 / 20 XP")).toBeInTheDocument();
    expect(offset()).toBe(25);
  });

  it("resets to 0 / G XP at local midnight (AC8)", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(new Date("2026-11-07T22:59:00.000Z")); // 23:59 in Berlin
    renderRing(seeded(15));
    expect(screen.getByText("15 / 20 XP")).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("0 / 20 XP")).toBeInTheDocument();
    expect(screen.getByText("20 XP to go")).toBeInTheDocument();
  });

  it("shows a same-size circular skeleton while loading (AC10)", () => {
    const session = createStubSession();
    mocks.session = session;
    session.progress.listLessonResults.mockReturnValue(pending());
    session.progress.getHearts.mockReturnValue(pending());
    session.profile.findSettings.mockReturnValue(pending());
    const { container } = renderWithQueryClient(<DailyGoalRing courseId={COURSE} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading daily goal");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    const circle = container.querySelector("[data-skeleton].rounded-full");
    expect(circle).toHaveClass("size-20");
  });

  it("replaces the ring with one muted line on error (AC11)", async () => {
    const session = createStubSession();
    mocks.session = session;
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    session.progress.getHearts.mockResolvedValue(createFullHearts(new Date()));
    session.profile.findSettings.mockResolvedValue(null);
    renderWithQueryClient(<DailyGoalRing courseId={COURSE} />);
    await waitFor(() =>
      expect(screen.getByText("Daily goal unavailable right now.")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
