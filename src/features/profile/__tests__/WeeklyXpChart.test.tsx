import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LessonResult } from "@/contracts";
import { weeklyXpByDay } from "../weekly-xp/weekly-xp";
import { WEEKLY_XP_EMPTY, WEEKLY_XP_ERROR, WeeklyXpChart } from "../weekly-xp/WeeklyXpChart";

const result = (localDate: string, xpEarned: number): LessonResult =>
  ({ localDate, xpEarned }) as LessonResult;

const TODAY = "2026-11-19"; // Thursday

describe("WeeklyXpChart (PLT-026 AC 12–13)", () => {
  it("draws 7 bars Mon–Sun from the results, today's in coral, 0 XP as an empty track", () => {
    const days = weeklyXpByDay([result("2026-11-16", 20), result(TODAY, 40)], TODAY);
    render(<WeeklyXpChart status="success" days={days} goalXp={20} />);
    const bars = screen.getAllByTestId("weekly-xp-bar");
    expect(bars).toHaveLength(7);
    expect(bars.map((b) => b.dataset.xp)).toEqual(["20", "0", "0", "40", "0", "0", "0"]);
    // Empty days: the track only, no fill.
    expect(within(bars[1]!).queryByTestId("weekly-xp-fill")).toBeNull();
    expect(bars[1]!.className).toContain("bg-surface-raised");
    // Today is coral, other days indigo; today's bar is the tallest (40 of max 40).
    const today = bars[3]!;
    expect(today).toHaveAttribute("data-today");
    const todayFill = within(today).getByTestId("weekly-xp-fill");
    expect(todayFill.className).toContain("bg-accent");
    expect(todayFill.style.height).toBe("100%");
    const monday = within(bars[0]!).getByTestId("weekly-xp-fill");
    expect(monday.className).toContain("bg-primary");
    expect(monday.style.height).toBe("50%");
    expect(screen.queryByText(WEEKLY_XP_EMPTY)).not.toBeInTheDocument();
  });

  it('shows the dashed goal line and "Goal <n> XP / day"', () => {
    const days = weeklyXpByDay([result(TODAY, 40)], TODAY);
    render(<WeeklyXpChart status="success" days={days} goalXp={20} />);
    expect(screen.getByTestId("weekly-xp-goal")).toHaveTextContent("Goal 20 XP / day");
    const line = screen.getByTestId("weekly-xp-goal-line");
    expect(line.className).toContain("border-dashed");
    expect(line.style.bottom).toBe("50%");
  });

  it("has a text alternative listing each day's XP; the bars are hidden from AT", () => {
    const days = weeklyXpByDay([result("2026-11-18", 40)], TODAY);
    render(<WeeklyXpChart status="success" days={days} goalXp={30} />);
    expect(screen.getByRole("region", { name: "XP this week" })).toBeInTheDocument();
    expect(screen.getByTestId("weekly-xp-bars")).toHaveAttribute("aria-hidden", "true");
    const table = screen.getByRole("table", { name: /XP this week, Goal 30 XP \/ day/ });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((r) => r.textContent)).toEqual([
      "Monday0 XP",
      "Tuesday0 XP",
      "Wednesday40 XP",
      "Thursday (today)0 XP",
      "Friday0 XP",
      "Saturday0 XP",
      "Sunday0 XP",
    ]);
    expect(within(rows[2]!).getByRole("rowheader", { name: "Wednesday" })).toBeInTheDocument();
  });

  it("with no XP this week shows empty bars and the empty message (not hidden)", () => {
    render(<WeeklyXpChart status="success" days={weeklyXpByDay([], TODAY)} goalXp={10} />);
    expect(screen.getAllByTestId("weekly-xp-bar")).toHaveLength(7);
    expect(screen.queryAllByTestId("weekly-xp-fill")).toHaveLength(0);
    expect(screen.getByText(WEEKLY_XP_EMPTY)).toBeVisible();
    expect(screen.getByTestId("weekly-xp-goal-line").style.bottom).toBe("100%");
  });

  it("shows a skeleton while loading and a message on error", () => {
    const { rerender } = render(<WeeklyXpChart status="loading" goalXp={20} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading this week's XP");
    rerender(<WeeklyXpChart status="error" goalXp={20} />);
    expect(screen.getByRole("alert")).toHaveTextContent(WEEKLY_XP_ERROR);
    expect(screen.queryAllByTestId("weekly-xp-bar")).toHaveLength(0);
  });
});
