import axe from "axe-core";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DailyGoalXp, GoalPlanStatus } from "@/contracts";
import {
  formatGoalDate,
  GOAL_PLAN_BANNED_WORDS,
  GoalPlanCard,
  type GoalPlanCardProps,
} from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";

const BASE = {
  targetLevel: "A2",
  targetDate: "2027-03-12",
  lessonsLeft: 130,
  daysLeft: 111,
} as const;
const STATUSES: Record<GoalPlanStatus["status"], GoalPlanStatus> = {
  "on-track": { ...BASE, lessonsPerDay: 2, suggestedDailyGoalXp: 20, status: "on-track" },
  "raise-goal": { ...BASE, lessonsPerDay: 2, suggestedDailyGoalXp: 20, status: "raise-goal" },
  tight: { ...BASE, daysLeft: 10, lessonsPerDay: 13, suggestedDailyGoalXp: 50, status: "tight" },
  reached: {
    ...BASE,
    lessonsLeft: 0,
    lessonsPerDay: null,
    suggestedDailyGoalXp: null,
    status: "reached",
  },
  "date-passed": {
    ...BASE,
    daysLeft: 0,
    lessonsPerDay: null,
    suggestedDailyGoalXp: null,
    status: "date-passed",
  },
};
const ALL = Object.values(STATUSES);
const TITLE = "Goal: finish A2 by 12 Mar 2027";

function setup(props: Partial<GoalPlanCardProps> & Pick<GoalPlanCardProps, "status">) {
  const onUseSuggestedGoal = vi.fn<(xp: DailyGoalXp) => void>();
  const onEditGoalDate = vi.fn<() => void>();
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), null);
  const all = { dailyGoalXp: 20 as DailyGoalXp, onUseSuggestedGoal, onEditGoalDate, ...props };
  const view = renderWithQueryClient(<GoalPlanCard {...all} />, { client });
  const rerender = (next: Partial<GoalPlanCardProps>) =>
    view.rerender(<GoalPlanCard {...all} {...next} />);
  return { ...view, rerender, onUseSuggestedGoal, onEditGoalDate };
}

async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

const card = () => screen.getByRole("region", { name: "Goal date" });

describe("GoalPlanCard (GAM-013)", () => {
  it("AC9: title for every status, date via en-GB Intl", () => {
    expect(formatGoalDate("2027-03-12")).toBe("12 Mar 2027");
    expect(formatGoalDate("2026-01-01")).toBe("1 Jan 2026");
    for (const status of ALL) {
      const { unmount } = setup({ status });
      expect(within(card()).getByRole("heading", { name: TITLE })).toBeInTheDocument();
      unmount();
    }
  });

  it("AC10 on-track: counts and the daily-goal line, no button or link", () => {
    setup({ status: STATUSES["on-track"], dailyGoalXp: 30 });
    expect(screen.getByText("130 lessons left · 111 days to go")).toBeInTheDocument();
    expect(
      screen.getByText("On track. Your daily goal of 30 XP gets you there."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("AC10 singular counts", () => {
    setup({ status: { ...STATUSES["on-track"], lessonsLeft: 1, daysLeft: 1, lessonsPerDay: 1 } });
    expect(screen.getByText("1 lesson left · 1 day to go")).toBeInTheDocument();
  });

  it("AC10/AC12 raise-goal: aim line and a primary 'Use 20 XP a day' that calls back once", async () => {
    const { onUseSuggestedGoal, onEditGoalDate } = setup({ status: STATUSES["raise-goal"] });
    expect(screen.getByText("130 lessons left · 111 days to go")).toBeInTheDocument();
    expect(screen.getByText("Aim for about 2 lessons a day to get there.")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Use 20 XP a day" });
    expect(button).toHaveClass("bg-primary", "min-h-13");
    await userEvent.click(button);
    expect(onUseSuggestedGoal).toHaveBeenCalledTimes(1);
    expect(onUseSuggestedGoal).toHaveBeenCalledWith(20);
    expect(onEditGoalDate).not.toHaveBeenCalled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("AC10/AC12 tight: tight line, secondary 'Use 50 XP a day' and 'Change date'", async () => {
    const { onUseSuggestedGoal, onEditGoalDate } = setup({ status: STATUSES.tight });
    expect(screen.getByText("130 lessons left · 10 days to go")).toBeInTheDocument();
    expect(
      screen.getByText("This date is tight: about 13 lessons a day. You could pick a later date."),
    ).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Use 50 XP a day" });
    expect(button).toHaveClass("bg-surface");
    await userEvent.click(button);
    expect(onUseSuggestedGoal).toHaveBeenCalledExactlyOnceWith(50);
    await userEvent.click(screen.getByRole("link", { name: "Change date" }));
    expect(onEditGoalDate).toHaveBeenCalledTimes(1);
  });

  it("AC11/AC12 reached: well-done line, 'Set a new goal date', no counts", async () => {
    const { onEditGoalDate } = setup({ status: STATUSES.reached });
    expect(screen.getByText("You've finished A2. Well done!")).toBeInTheDocument();
    expect(card()).not.toHaveTextContent(/lessons? left|days? to go/);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Set a new goal date" }));
    expect(onEditGoalDate).toHaveBeenCalledTimes(1);
  });

  it("AC11 date-passed: new-date line, 'Change date', no counts", () => {
    setup({ status: STATUSES["date-passed"] });
    expect(
      screen.getByText("Your goal date has come. Pick a new date to keep a plan."),
    ).toBeInTheDocument();
    expect(card()).not.toHaveTextContent(/lessons? left|days? to go/);
    expect(screen.getByRole("link", { name: "Change date" })).toHaveAttribute(
      "href",
      "/profile?edit=goal-date",
    );
  });

  it("AC13: null renders only the 'Set a goal date' text link (no card)", async () => {
    const { container, onEditGoalDate } = setup({ status: null });
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(container).toHaveTextContent(/^Have a date in mind\? Set a goal date$/);
    const link = screen.getByRole("link", { name: "Set a goal date" });
    expect(link).toHaveAttribute("href", "/profile?edit=goal-date");
    await userEvent.click(link);
    expect(onEditGoalDate).toHaveBeenCalledTimes(1);
  });

  it("loading (undefined) renders nothing", () => {
    const { container } = setup({ status: undefined });
    expect(container).toBeEmptyDOMElement();
  });

  it("without onEditGoalDate the links navigate to editHref", () => {
    setup({ status: null, onEditGoalDate: undefined, editHref: "/profile?x=1" });
    expect(screen.getByRole("link", { name: "Set a goal date" })).toHaveAttribute(
      "href",
      "/profile?x=1",
    );
  });

  it("dailyGoalXp defaults to Settings.dailyGoalXp", () => {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), {
      courseId: "en-de",
      dailyGoalXp: 50,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
    });
    renderWithQueryClient(<GoalPlanCard status={STATUSES["on-track"]} />, { client });
    expect(screen.getByText(/daily goal of 50 XP/)).toBeInTheDocument();
  });

  it.each([...ALL.map((s) => [s.status, s] as const), ["null", null] as const])(
    "AC14: %s text contains no banned word",
    (_name, status) => {
      const { container } = setup({ status });
      const text = container.textContent ?? "";
      expect(text.length).toBeGreaterThan(0);
      for (const word of GOAL_PLAN_BANNED_WORDS) {
        expect(text).not.toMatch(new RegExp(`\\b${word}\\b`, "i"));
      }
    },
  );

  it("AC14: the banned list is the ticket's list and 'later' is allowed", () => {
    expect([...GOAL_PLAN_BANNED_WORDS]).toEqual([
      "exam",
      "test",
      "pass",
      "behind",
      "late",
      "failed",
    ]);
    expect("pick a later date").not.toMatch(/\blate\b/i);
  });

  it("AC15: status line is plain text in a polite live region that announces the change", () => {
    const { rerender } = setup({ status: STATUSES["raise-goal"] });
    const message = screen.getByTestId("goal-plan-message");
    const region = message.parentElement!;
    expect(region).toHaveAttribute("aria-live", "polite");
    rerender({ status: STATUSES["on-track"], dailyGoalXp: 20 });
    const after = screen.getByTestId("goal-plan-message");
    expect(after.parentElement).toBe(region);
    expect(after).toHaveTextContent("On track. Your daily goal of 20 XP gets you there.");
  });

  it("AC15: keyboard: Tab reaches the button and link; Enter and Space activate them", async () => {
    const user = userEvent.setup();
    const { onUseSuggestedGoal, onEditGoalDate } = setup({ status: STATUSES.tight });
    await user.tab();
    expect(screen.getByRole("button", { name: "Use 50 XP a day" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onUseSuggestedGoal).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(screen.getByRole("link", { name: "Change date" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onEditGoalDate).toHaveBeenCalledTimes(2);
  });

  it("AC16: links have a 48 px touch target and text is not truncated", () => {
    setup({ status: STATUSES.tight });
    expect(screen.getByRole("link", { name: "Change date" })).toHaveClass("min-h-12");
    expect(card().innerHTML).not.toMatch(/truncate|line-clamp|whitespace-nowrap/);
  });

  it.each([...ALL.map((s) => [s.status, s] as const), ["null", null] as const])(
    "AC15: no serious or critical axe violations (%s)",
    async (_name, status) => {
      const { container } = setup({ status });
      expect(await seriousViolations(container)).toEqual([]);
    },
  );
});
