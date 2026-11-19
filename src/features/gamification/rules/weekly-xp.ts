/**
 * The learner's XP this week (GAM-012, Leagues tab). Pure: `today` is a parameter
 * (ARCHITECTURE §2 rule 4). Weeks run Monday to Sunday on the device-local calendar
 * (`LessonResult.localDate`), so timezones and DST never move a result to another week.
 */
import type { LessonResult, LocalDate } from "@/contracts";
import { dayNumberToLocalDate, localDateToDayNumber } from "./local-date";

/** Monday of the week that holds `date` (ISO weeks: Monday first). */
export function weekStartOf(date: LocalDate): LocalDate {
  const day = localDateToDayNumber(date);
  // Day 0 (1970-01-01) was a Thursday: Monday-based weekday = (day + 3) mod 7.
  const weekday = (((day + 3) % 7) + 7) % 7;
  return dayNumberToLocalDate(day - weekday);
}

/**
 * Sum of `xpEarned` (replays included, PD-008) of the results dated from this week's
 * Monday to `today`. Results dated after `today` (a clock moved back) don't count.
 */
export function weeklyXp(
  results: readonly Pick<LessonResult, "localDate" | "xpEarned">[],
  today: LocalDate,
): number {
  const start = localDateToDayNumber(weekStartOf(today));
  const end = localDateToDayNumber(today);
  let total = 0;
  for (const result of results) {
    const day = localDateToDayNumber(result.localDate);
    if (day >= start && day <= end) total += result.xpEarned;
  }
  return total;
}
