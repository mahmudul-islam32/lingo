import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeartsState, LessonResult, Profile, Settings } from "@/contracts";
import { deviceTimeZone, toLocalDate, addDays } from "@/features/gamification";
import { createGuestProfileStore, guestProfileStore, weekdayIndex } from "@/features/profile";
import { getLocalSession, openLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { CHANGE_DAILY_GOAL } from "../DailyGoalRow";
import { ProfileScreen } from "../ProfileScreen";

const NOW = new Date("2026-11-19T12:00:00.000Z");

const settings: Settings = {
  courseId: "en-de",
  dailyGoalXp: 20,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: NOW.toISOString(),
};

const hearts: HeartsState = { current: 5, refillStartedAt: null, updatedAt: NOW.toISOString() };

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "aaaaaaaa-0000-4000-8000-000000000001",
    displayName: "Learner",
    avatar: { kind: "initials" },
    joinedAt: "2026-09-10T12:00:00.000Z",
    onboardedAt: "2026-09-10T12:05:00.000Z",
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

let n = 0;
function result(localDate: string, xpEarned: number, lessonId = "de-a1-u01-l1"): LessonResult {
  n += 1;
  return {
    id: `bbbbbbbb-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
    courseId: "en-de",
    unitId: "de-a1-u01",
    lessonId,
    startedAt: `${localDate}T10:00:00.000Z`,
    completedAt: `${localDate}T10:04:00.000Z`,
    durationMs: 240_000,
    exerciseCount: 5,
    firstTryCorrectCount: 5,
    mistakeCount: 0,
    skippedCount: 0,
    accuracy: 1,
    perfect: true,
    xp: { base: xpEarned, perfectBonus: 0 },
    xpEarned,
    heartsLost: 0,
    localDate,
    timeZone: "UTC",
  };
}

function renderProfile(results: LessonResult[], p: Profile = profile()) {
  guestProfileStore.setState({ status: "ready", profile: p, onboardingComplete: true });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  client.setQueryData(queryKeys.hearts(), hearts);
  client.setQueryData(queryKeys.progress("en-de"), results);
  renderWithQueryClient(<ProfileScreen />, { client });
  return client;
}

const tile = (label: string) =>
  within(screen.getByTestId("profile-stats")).getByText(label).closest("li")!;

describe("Profile screen (PLT-026)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("10: guest header with Lumi avatar, Guest, Learning German · Joined <Month YYYY>, gear", async () => {
    renderProfile([]);
    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeInTheDocument();
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Guest");
    expect(screen.getByTestId("profile-avatar").querySelector("svg[data-pose]")).not.toBeNull();
    await waitFor(() =>
      expect(screen.getByTestId("profile-subtitle")).toHaveTextContent(
        /^Learning German · Joined September 2026$/,
      ),
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "#settings");
    expect(document.getElementById("settings")).toContainElement(
      screen.getByRole("heading", { level: 2, name: "Settings" }),
    );
  });

  it("10: a named learner gets white initials on the indigo circle", () => {
    renderProfile([], profile({ displayName: "Alex Lindqvist" }));
    const avatar = screen.getByTestId("profile-avatar");
    expect(avatar).toHaveTextContent("AL");
    expect(avatar.className).toContain("bg-primary");
    expect(avatar.className).toContain("text-on-primary");
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Alex Lindqvist");
  });

  it("11: 2 × 2 stat tiles from real data, no league, words or achievements", async () => {
    const today = toLocalDate(new Date(), deviceTimeZone());
    renderProfile([
      result(addDays(today, -1), 15, "de-a1-u01-l1"),
      result(today, 20, "de-a1-u01-l2"),
      result(today, 10, "de-a1-u01-l2"), // a replay of the same lesson
    ]);
    const stats = await screen.findByTestId("profile-stats");
    expect(within(stats).getAllByRole("listitem")).toHaveLength(4);
    expect(tile("Day streak")).toHaveTextContent("2");
    expect(tile("Total XP")).toHaveTextContent("45");
    expect(tile("Lessons done")).toHaveTextContent("2");
    await waitFor(() => expect(tile("Start level")).toHaveTextContent("A1"));
    // The label is read first ("Total XP, 45").
    expect(tile("Total XP").textContent).toBe("Total XP45");
    for (const absent of [/league/i, /words learned/i, /achievement/i]) {
      expect(screen.queryByText(absent)).not.toBeInTheDocument();
    }
  });

  it("12: XP this week from the saved results, today's bar > 0, goal from settings", async () => {
    const today = toLocalDate(new Date(), deviceTimeZone());
    renderProfile([result(today, 30)]);
    const bars = await screen.findAllByTestId("weekly-xp-bar");
    expect(bars).toHaveLength(7);
    const todayBar = bars[weekdayIndex(today)]!;
    expect(todayBar).toHaveAttribute("data-today");
    expect(todayBar.dataset.xp).toBe("30");
    expect(screen.getByTestId("weekly-xp-goal")).toHaveTextContent("Goal 20 XP / day");
  });

  it("13: no results this week shows the empty chart message", async () => {
    renderProfile([]);
    expect(
      await screen.findByText("No XP yet this week. Start a lesson to fill your chart."),
    ).toBeVisible();
  });

  it("14: daily goal row shows the goal and Change saves a new one; the goal line follows", async () => {
    vi.useRealTimers();
    const opened = openLocalSession({ forceMemory: true });
    const store = createGuestProfileStore({ loadSession: () => opened });
    await store.getState().init();
    const session = await opened;
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    guestProfileStore.setState({ updateSettings: store.getState().updateSettings });
    const client = renderProfile([]);
    const user = userEvent.setup();

    expect(await screen.findByTestId("daily-goal-value")).toHaveTextContent("Regular · 20 XP");
    expect(screen.getByRole("heading", { name: "Daily goal" })).toBeInTheDocument();
    const change = screen.getByRole("button", { name: CHANGE_DAILY_GOAL });
    await user.click(change);
    const dialog = screen.getByRole("dialog", { name: CHANGE_DAILY_GOAL });
    expect(within(dialog).getByRole("radio", { name: "Regular 20 XP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(within(dialog).getByRole("radio", { name: "Intense 50 XP" }));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByTestId("daily-goal-value")).toHaveTextContent("Intense · 50 XP");
    expect(screen.getByTestId("weekly-xp-goal")).toHaveTextContent("Goal 50 XP / day");
    expect((await session.profile.getSettings()).dailyGoalXp).toBe(50);
    expect(client.getQueryData<Settings>(queryKeys.settings())?.dailyGoalXp).toBe(50);
    expect(change).toHaveFocus();
  });

  it("error: the chart says it couldn't load, the rest of Profile still renders", async () => {
    vi.useRealTimers();
    const session = await getLocalSession();
    vi.spyOn(session.progress, "listLessonResults").mockRejectedValue(new Error("boom"));
    guestProfileStore.setState({ status: "ready", profile: profile(), onboardingComplete: true });
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), settings);
    client.setQueryData(queryKeys.hearts(), hearts);
    renderWithQueryClient(<ProfileScreen />, { client });
    expect(await screen.findByText("Couldn't load this week's XP.")).toBeInTheDocument();
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Guest");
    expect(screen.getByRole("heading", { level: 2, name: "Settings" })).toBeInTheDocument();
  });
});
