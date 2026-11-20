import type { LessonResult, LocalDate } from "@/contracts";
import { addDays, localDateToDayNumber, weekStartOf } from "@/features/gamification";

export interface WeekDayXp {
  /** Local calendar date of the day. */
  date: LocalDate;
  /** "Monday" … "Sunday" (text alternative). */
  name: string;
  /** "M", "T", "W" … (chart axis). */
  initial: string;
  /** Sum of `xpEarned` of the day's saved results; 0 for days without results. */
  xp: number;
  isToday: boolean;
  /** After today: nothing can be earned yet. */
  isFuture: boolean;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** 0 = Monday … 6 = Sunday. Day number 0 (1970-01-01) was a Thursday. */
export function weekdayIndex(date: LocalDate): number {
  return (((localDateToDayNumber(date) + 3) % 7) + 7) % 7;
}

/** The Monday of the week (Mon–Sun) that contains `date` (GAM-012's `weekStartOf`). */
export function weekStart(date: LocalDate): LocalDate {
  return weekStartOf(date);
}

/**
 * XP per day of the current week, Monday to Sunday (PLT-026 AC 12), from the saved
 * lesson results. A result counts on its `localDate` (the device-local completion date
 * that also drives streak and daily goal); results outside this week are ignored. The
 * per-day breakdown of gamification's `weeklyXp` total (GAM-012).
 */
export function weeklyXpByDay(results: readonly LessonResult[], today: LocalDate): WeekDayXp[] {
  const monday = weekStart(today);
  const sunday = addDays(monday, 6);
  const byDate = new Map<LocalDate, number>();
  for (const result of results) {
    if (result.localDate < monday || result.localDate > sunday) continue;
    byDate.set(result.localDate, (byDate.get(result.localDate) ?? 0) + result.xpEarned);
  }
  return DAY_NAMES.map((name, index) => {
    const date = addDays(monday, index);
    return {
      date,
      name,
      initial: name[0]!,
      xp: byDate.get(date) ?? 0,
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

/** Top of the chart scale: the highest day or the goal, whichever is larger (never 0). */
export function chartMax(days: readonly WeekDayXp[], goalXp: number): number {
  return Math.max(goalXp, 1, ...days.map((d) => d.xp));
}

/** "Wednesday, 40 XP" (one row of the text alternative). */
export function dayXpLabel(day: WeekDayXp): string {
  return `${day.name}, ${day.xp} XP`;
}
