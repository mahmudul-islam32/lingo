/**
 * LES-022: the goal-date row on the results screen (criteria 1–7 and 9, all five
 * statuses and the absent prop). Layout at 375 × 667 (criterion 8) is in
 * `tests/e2e/lessons-results.spec.ts`.
 */
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GoalPlanStatusSchema,
  SettingsSchema,
  type GoalPlanState,
  type GoalPlanStatus,
  type LessonResult,
} from "@/contracts";
import { GOAL_PLAN_BANNED_WORDS, createFullHearts } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { goalDateRowView, lessonsLeftText } from "./goal-date-row";
import { toLessonResult } from "./result";
import { ResultsScreen } from "./ResultsScreen";
import {
  FIXTURE_NOW,
  RESULT_ID,
  YESTERDAY,
  nextResultId,
  perfectSummary,
} from "./testing/fixtures";

const mocks = vi.hoisted(() => ({
  getLocalSession: (() => new Promise(() => {})) as () => Promise<unknown>,
}));
vi.mock("@/lib/offline", () => ({ getLocalSession: () => mocks.getLocalSession() }));

const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });
const COURSE = result.courseId;
const yesterday: LessonResult = { ...result, id: nextResultId(), localDate: YESTERDAY };

function seeded() {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress(COURSE), [yesterday]);
  client.setQueryData(queryKeys.hearts(), createFullHearts(FIXTURE_NOW));
  client.setQueryData(
    queryKeys.settings(),
    SettingsSchema.parse({
      courseId: COURSE,
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: "2026-11-01T00:00:00.000Z",
    }),
  );
  return client;
}

function status(state: GoalPlanState, lessonsLeft = 130): GoalPlanStatus {
  const done = state === "reached" || state === "date-passed";
  return GoalPlanStatusSchema.parse({
    targetLevel: "A2",
    targetDate: "2027-03-12",
    lessonsLeft: state === "reached" ? 0 : lessonsLeft,
    daysLeft: state === "date-passed" ? 0 : 111,
    lessonsPerDay: done ? null : state === "on-track" ? 1 : state === "raise-goal" ? 2 : 13,
    suggestedDailyGoalXp: done
      ? null
      : state === "on-track"
        ? 20
        : state === "raise-goal"
          ? 30
          : 50,
    status: state,
  });
}

const STATES: readonly GoalPlanState[] = [
  "on-track",
  "raise-goal",
  "tight",
  "reached",
  "date-passed",
];
const IN_PROGRESS: readonly GoalPlanState[] = ["on-track", "raise-goal", "tight"];

function stubMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function ui(goalPlan?: GoalPlanStatus | null) {
  return (
    <ResultsScreen
      result={result}
      save={() => Promise.resolve()}
      onContinue={vi.fn()}
      onRetryLesson={vi.fn()}
      {...(goalPlan !== undefined ? { goalPlan } : {})}
    />
  );
}

function renderScreen(goalPlan?: GoalPlanStatus | null, client = seeded()) {
  return renderWithQueryClient(ui(goalPlan), { client });
}

/** Text a screen reader reads: skips `aria-hidden` subtrees. */
function readableText(el: Element): string {
  let out = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent ?? "";
    else if (node instanceof Element && node.getAttribute("aria-hidden") !== "true") {
      out += ` ${readableText(node)} `;
    }
  });
  return out.replace(/\s+/g, " ").trim();
}

const items = () =>
  within(screen.getByRole("list", { name: "Lesson stats" })).getAllByRole("listitem");
const goalDateRow = () => screen.queryByTestId("goal-date-row");

/** `useId` values differ between roots; everything else must match exactly. */
function normalised(html: string): string {
  return html.replace(/«[^»]*»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, "ID");
}

async function seriousAxe(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colours; contrast is checked in the e2e spec.
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

beforeEach(() => {
  mocks.getLocalSession = () => new Promise(() => {});
  stubMotion(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("goalDateRowView (LES-022)", () => {
  it("criterion 2: level, GAM-013 date format and lessons left, singular for 1", () => {
    expect(goalDateRowView(status("on-track"))).toEqual({
      kind: "progress",
      label: "Goal: A2 by 12 Mar 2027",
      value: "130 lessons left",
    });
    expect(goalDateRowView(status("tight", 1))).toMatchObject({ value: "1 lesson left" });
    expect(lessonsLeftText(2)).toBe("2 lessons left");
  });

  it("criteria 1, 3, 4: reached text; nothing for date-passed, null or undefined", () => {
    expect(goalDateRowView(status("reached"))).toEqual({
      kind: "reached",
      text: "Goal reached: you've finished A2!",
    });
    expect(goalDateRowView(status("date-passed"))).toBeNull();
    expect(goalDateRowView(null)).toBeNull();
    expect(goalDateRowView(undefined)).toBeNull();
  });
});

describe("ResultsScreen: goal-date row (LES-022)", () => {
  it("criterion 1: without the prop, with null and with date-passed the screen is unchanged", () => {
    const htmlOf = (goalPlan?: GoalPlanStatus | null) => {
      const { container, unmount } = renderScreen(goalPlan);
      const html = normalised(container.innerHTML);
      expect(items()).toHaveLength(5);
      expect(goalDateRow()).toBeNull();
      unmount();
      return html;
    };
    const absent = htmlOf();
    expect(htmlOf(null)).toBe(absent);
    expect(htmlOf(status("date-passed"))).toBe(absent); // criterion 4
  });

  it.each(IN_PROGRESS)(
    "criteria 2, 6, 7: %s shows one row after the daily-goal row, read as one line",
    (state) => {
      renderScreen(status(state));
      expect(items()).toHaveLength(6);
      expect(items()[4]).toHaveTextContent(/^Daily goal/);
      const row = items()[5]!;
      expect(row).toBe(goalDateRow());
      expect(readableText(row)).toBe("Goal: A2 by 12 Mar 2027 130 lessons left");
      expect(within(row).queryByTestId("goal-date-check")).toBeNull();
    },
  );

  it("criterion 2: singular '1 lesson left'", () => {
    renderScreen(status("raise-goal", 1));
    expect(readableText(goalDateRow()!)).toBe("Goal: A2 by 12 Mar 2027 1 lesson left");
  });

  it("criterion 3: reached: success text and a decorative check icon", () => {
    renderScreen(status("reached"));
    const row = goalDateRow()!;
    expect(items()[5]).toBe(row);
    expect(readableText(row)).toBe("Goal reached: you've finished A2!");
    const text = within(row).getByText("Goal reached: you've finished A2!");
    expect(text).toHaveClass("text-success-fg");
    const check = within(row).getByTestId("goal-date-check");
    expect(check).toHaveAttribute("aria-hidden", "true");
    expect(check).toHaveClass("text-success");
  });

  it.each(STATES)("criterion 5: %s never shows a banned word", (state) => {
    renderScreen(status(state));
    const text = goalDateRow()?.textContent ?? "";
    for (const word of GOAL_PLAN_BANNED_WORDS) {
      expect(text).not.toMatch(new RegExp(`\\b${word}\\b`, "i"));
    }
  });

  it.each(STATES)(
    "criterion 7: %s adds no focus stop; heading focused, Continue is the first Tab stop",
    async (state) => {
      const user = userEvent.setup();
      renderScreen(status(state));
      expect(screen.getByRole("heading", { level: 1, name: "Lesson complete!" })).toHaveFocus();
      const row = goalDateRow();
      if (row) {
        expect(row.querySelectorAll("a, button, input, [tabindex]")).toHaveLength(0);
      }
      await user.tab();
      expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Practice again" })).toHaveFocus();
    },
  );

  it("criterion 6: appears together with the streak and daily-goal rows once the read resolves", async () => {
    let resolveSession: (s: unknown) => void = () => {};
    const session = new Promise((r) => (resolveSession = r));
    mocks.getLocalSession = () => session;
    renderScreen(status("on-track"), createTestQueryClient());
    expect(items()).toHaveLength(3);
    expect(goalDateRow()).toBeNull();
    await act(async () => {
      resolveSession({
        progress: {
          listLessonResults: async () => [yesterday],
          getHearts: async () => createFullHearts(FIXTURE_NOW),
        },
        profile: { findSettings: async () => null },
      });
    });
    await waitFor(() => expect(items()).toHaveLength(6));
    expect(items()[5]).toBe(goalDateRow());
  });

  it.each([true, false])("criterion 6: no animation of the row (reduced motion: %s)", (reduce) => {
    stubMotion(reduce);
    renderScreen(status("on-track"));
    const row = goalDateRow()!;
    expect(row.className).not.toMatch(/animate|transition/);
    expect(row.getAttribute("style")).toBeNull();
  });

  it.each([...STATES, null] as const)(
    "criterion 9: no serious or critical axe violations (%s)",
    async (state) => {
      const { container } = renderScreen(state === null ? null : status(state));
      expect(await seriousAxe(container)).toEqual([]);
    },
  );
});
