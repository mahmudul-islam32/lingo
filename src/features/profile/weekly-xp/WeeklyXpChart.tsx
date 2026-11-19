import { useId } from "react";
import { Card, Skeleton, VisuallyHidden, cn } from "@/components/ui";
import { chartMax, dayXpLabel, type WeekDayXp } from "./weekly-xp";

export const WEEKLY_XP_TITLE = "XP this week";
export const WEEKLY_XP_EMPTY = "No XP yet this week. Start a lesson to fill your chart.";
export const WEEKLY_XP_ERROR = "Couldn't load this week's XP.";

export function goalLabel(goalXp: number): string {
  return `Goal ${goalXp} XP / day`;
}

export type WeeklyXpChartProps =
  | { status: "loading"; days?: undefined; goalXp: number; className?: string }
  | { status: "error"; days?: undefined; goalXp: number; className?: string }
  | { status: "success"; days: readonly WeekDayXp[]; goalXp: number; className?: string };

/** Height of the bar area in px (design v2 screen 8: 96 px). */
const CHART_HEIGHT = 96;

/**
 * "XP this week" (design v2 screen 8, PLT-026 AC 12–13): 7 bars Mon–Sun, today's bar in
 * coral, the others indigo, days with 0 XP as an empty track, and a dashed daily-goal
 * line. The bars are decorative; a visually hidden table lists each day's XP for screen
 * readers. Errors and loading never hide the rest of the Profile.
 */
export function WeeklyXpChart({ status, days, goalXp, className }: WeeklyXpChartProps) {
  const titleId = useId();
  const max = days ? chartMax(days, goalXp) : 1;
  const goalPct = Math.min(100, (goalXp / max) * 100);
  const empty = status === "success" && days.every((d) => d.xp === 0);

  return (
    <Card
      as="section"
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3", className)}
      data-testid="weekly-xp"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="font-display text-base font-extrabold">
          {WEEKLY_XP_TITLE}
        </h2>
        <span className="text-[0.8125rem] text-fg-muted" data-testid="weekly-xp-goal">
          {goalLabel(goalXp)}
        </span>
      </div>

      {status === "loading" && (
        <div role="status" className="flex flex-col gap-2">
          <VisuallyHidden>Loading this week&apos;s XP</VisuallyHidden>
          <Skeleton shape="rect" className="h-[7.5rem] rounded-control" />
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="text-fg-muted">
          {WEEKLY_XP_ERROR}
        </p>
      )}

      {status === "success" && (
        <>
          <div aria-hidden="true" className="relative" data-testid="weekly-xp-bars">
            <div
              className="relative flex items-end justify-between gap-2"
              style={{ height: CHART_HEIGHT }}
            >
              {days.map((day) => {
                const pct = day.xp > 0 ? Math.max(8, (day.xp / max) * 100) : 0;
                return (
                  <div
                    key={day.date}
                    data-testid="weekly-xp-bar"
                    data-today={day.isToday ? "" : undefined}
                    data-xp={day.xp}
                    title={dayXpLabel(day)}
                    className="relative flex h-full max-w-7 flex-1 items-end overflow-hidden rounded-lg bg-surface-raised"
                  >
                    {pct > 0 && (
                      <div
                        data-testid="weekly-xp-fill"
                        className={cn(
                          "w-full rounded-lg",
                          day.isToday ? "bg-accent" : "bg-primary",
                        )}
                        style={{ height: `${pct}%` }}
                      />
                    )}
                  </div>
                );
              })}
              <div
                data-testid="weekly-xp-goal-line"
                className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-fg-subtle"
                style={{ bottom: `${goalPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between gap-2">
              {days.map((day) => (
                <span
                  key={day.date}
                  className={cn(
                    "max-w-7 flex-1 text-center text-xs font-bold",
                    day.isToday ? "text-accent-strong" : "text-fg-muted",
                  )}
                >
                  {day.initial}
                </span>
              ))}
            </div>
          </div>
          <table className="sr-only">
            <caption>
              {WEEKLY_XP_TITLE}, {goalLabel(goalXp)}
            </caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">XP</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date}>
                  <th scope="row">
                    {day.name}
                    {day.isToday ? " (today)" : ""}
                  </th>
                  <td>{day.xp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
          {empty && <p className="text-sm text-fg-muted">{WEEKLY_XP_EMPTY}</p>}
        </>
      )}
    </Card>
  );
}
