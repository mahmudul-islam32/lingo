import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeartsState, LessonResult } from "@/contracts";
import {
  addDays,
  createFullHearts,
  GamificationTopBar,
  loseHearts,
  toLocalDate,
} from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending, type StubSession } from "../../hooks/__tests__/session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "es-en";
const TZ = "UTC";
const HOUR = 3_600_000;

let session: StubSession;

beforeEach(() => {
  session = createStubSession();
  mocks.session = session;
  session.profile.findSettings.mockResolvedValue(null);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function onDay(localDate: string, xp = 15): LessonResult {
  return makeResult({
    courseId: COURSE,
    localDate,
    timeZone: TZ,
    ...(xp === 10 ? { mistakeCount: 1, perfect: false } : {}),
  });
}

function seeded(results: LessonResult[], hearts: HeartsState = createFullHearts(new Date())) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress(COURSE), results);
  client.setQueryData(queryKeys.hearts(), hearts);
  client.setQueryData(queryKeys.settings(), null);
  return client;
}

function renderBar(client = createTestQueryClient()) {
  return renderWithQueryClient(<GamificationTopBar courseId={COURSE} timeZone={TZ} />, {
    client,
  });
}

const today = () => toLocalDate(new Date(), TZ);
const bar = () => screen.getByRole("region", { name: "Your progress" });

describe("GamificationTopBar (GAM-007)", () => {
  it("new learner: 0 days unlit, 0 XP, 5 hearts, in order, as a 3-item list (AC1-5, AC9)", () => {
    renderBar(seeded([]));
    const region = bar();
    expect(region.tagName).toBe("SECTION");
    expect(within(region).queryByRole("heading")).not.toBeInTheDocument();
    const items = within(within(region).getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);

    const streak = within(items[0]!).getByRole("img", { name: "Streak: 0 days" });
    expect(streak).toHaveTextContent("0");
    expect(streak.querySelector("svg")).toHaveAttribute("data-lit", "false");
    expect(within(items[1]!).getByRole("img", { name: "Total XP: 0" })).toHaveTextContent("0 XP");
    expect(within(items[2]!).getByRole("button", { name: "Hearts: 5 of 5" })).toHaveTextContent(
      "5",
    );
  });

  it("extended: lit flame and ', done for today'; total XP sums all results (AC2-4)", () => {
    const t = today();
    renderBar(seeded([onDay(addDays(t, -1), 10), onDay(t)]));
    const streak = screen.getByRole("img", { name: "Streak: 2 days, done for today" });
    expect(streak.querySelector("svg")).toHaveAttribute("data-lit", "true");
    expect(screen.getByRole("img", { name: "Total XP: 25" })).toBeInTheDocument();
  });

  it("at risk: unlit flame and ', do a lesson today to keep it' (AC2, AC3)", () => {
    renderBar(seeded([onDay(addDays(today(), -1))]));
    const streak = screen.getByRole("img", {
      name: "Streak: 1 day, do a lesson today to keep it",
    });
    expect(streak.querySelector("svg")).toHaveAttribute("data-lit", "false");
  });

  it("broken: plain 'Streak: 0 days', unlit", () => {
    renderBar(seeded([onDay(addDays(today(), -3))]));
    expect(screen.getByRole("img", { name: "Streak: 0 days" })).toBeInTheDocument();
  });

  it("dialog when full: 'Your hearts are full.' and the rule line (AC6)", async () => {
    const user = userEvent.setup();
    renderBar(seeded([]));
    await user.click(screen.getByRole("button", { name: "Hearts: 5 of 5" }));
    const dialog = screen.getByRole("dialog", { name: "Hearts" });
    expect(dialog).toHaveTextContent("Your hearts are full.");
    expect(dialog).toHaveTextContent(
      "You lose a heart for each wrong answer. One heart comes back every 4 hours.",
    );
    expect(within(dialog).getByRole("img", { name: "Hearts: 5 of 5" })).toBeInTheDocument();
  });

  it("keyboard: Enter opens, Escape closes; Space opens, 'Got it' closes; focus returns (AC6)", async () => {
    const user = userEvent.setup();
    renderBar(seeded([]));
    const button = screen.getByRole("button", { name: "Hearts: 5 of 5" });
    expect(button).toHaveAttribute("aria-haspopup", "dialog");

    button.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Hearts" })).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(button).toHaveFocus());

    await user.keyboard(" ");
    expect(screen.getByRole("dialog", { name: "Hearts" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(button).toHaveFocus());
  });

  it("0 hearts: outline heart, countdown in the dialog, updated every minute (AC6, AC7)", async () => {
    const t0 = new Date("2026-11-08T10:00:00.000Z");
    vi.useFakeTimers({ now: t0 });
    renderBar(seeded([], loseHearts(createFullHearts(t0), 5, t0)));

    const button = screen.getByRole("button", { name: "Hearts: 0 of 5" });
    expect(button.querySelector("svg")).toHaveAttribute("data-filled", "false");
    fireEvent.click(button);
    const refill = screen.getByTestId("hearts-refill");
    expect(refill).toHaveTextContent("Next heart in 4 h");
    expect(refill).toHaveTextContent("Full in 20 h");

    await act(() => vi.advanceTimersByTimeAsync(61_000));
    expect(screen.getByTestId("hearts-refill")).toHaveTextContent("Next heart in 3 h 59 min");
  });

  it("a heart refill while open updates the button without a reload (AC8)", async () => {
    const t0 = new Date("2026-11-08T10:00:00.000Z");
    vi.useFakeTimers({ now: t0 });
    renderBar(seeded([], loseHearts(createFullHearts(t0), 5, t0)));
    expect(screen.getByRole("button", { name: "Hearts: 0 of 5" })).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(4 * HOUR + 1000));
    expect(screen.getByRole("button", { name: "Hearts: 1 of 5" })).toBeInTheDocument();
  });

  it("after a lesson (query invalidation) streak, XP and hearts update (AC8)", async () => {
    const client = seeded([]);
    renderBar(client);
    expect(screen.getByRole("img", { name: "Total XP: 0" })).toBeInTheDocument();

    const now = new Date();
    session.progress.listLessonResults.mockResolvedValue([onDay(today(), 10)]);
    session.progress.getHearts.mockResolvedValue(loseHearts(createFullHearts(now), 1, now));
    await act(() => client.invalidateQueries());
    expect(await screen.findByRole("img", { name: "Total XP: 10" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Streak: 1 day, done for today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hearts: 4 of 5" })).toBeInTheDocument();
  });

  it("loading: three skeleton pills in the same list and a status (AC10)", () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    session.progress.getHearts.mockReturnValue(pending());
    renderBar();
    const items = within(bar()).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) expect(item.querySelector("[data-skeleton]")).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Loading your progress");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("results error: streak and XP show '–', hearts still work, no banner (AC11)", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    session.progress.getHearts.mockResolvedValue(createFullHearts(new Date()));
    renderBar();
    const streak = await screen.findByRole("img", { name: "Streak unavailable" });
    expect(streak).toHaveTextContent("–");
    expect(screen.getByRole("img", { name: "XP unavailable" })).toHaveTextContent("–");
    expect(screen.getByRole("button", { name: "Hearts: 5 of 5" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hearts error: hearts fall back to full (AC11)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    session.progress.listLessonResults.mockResolvedValue([]);
    session.progress.getHearts.mockRejectedValue(new Error("corrupt"));
    renderBar();
    expect(await screen.findByRole("button", { name: "Hearts: 5 of 5" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hearts button meets the 44 px target and has a visible focus ring (AC12)", () => {
    renderBar(seeded([]));
    const button = screen.getByRole("button", { name: /Hearts/ });
    // min-h-11 = 44 px; min-w-14 = 56 px (also the skeleton pill width, AC10).
    expect(button).toHaveClass("min-h-11", "min-w-14", "focus-visible:focus-ring");
    expect(within(bar()).getByRole("list")).toHaveClass("flex", "justify-between");
  });

  it("new files contain no colour literals (AC13)", () => {
    const dir = join(__dirname, "..");
    for (const file of [
      "GamificationTopBar.tsx",
      "HeartsDialog.tsx",
      "StreakFlameIcon.tsx",
      "StreakLumi.tsx",
    ]) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src, file).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
    }
  });
});
