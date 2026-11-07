/**
 * Streak rule (ARCHITECTURE §7). Pure: `today` is passed in as the device-local date.
 */
import type { ComputeStreak, LocalDate, StreakState } from "@/contracts";
import { dayNumberToLocalDate, localDateToDayNumber } from "./local-date";

/**
 * Contract rule `ComputeStreak`.
 *
 * - Input dates may repeat and be in any order (several lessons on one day count once).
 * - `current`: run of consecutive days ending today, or ending yesterday when nothing
 *   was completed today yet (the streak is still alive until today ends); else 0.
 * - `longest`: longest run ever (>= `current`).
 * - `extendedToday`: today is one of the dates.
 * - Dates **after** `today` are ignored. They can only come from travelling west or a
 *   clock change; they start counting once the device date reaches them.
 * - Invalid dates throw `RangeError` (the data layer validates with `LocalDateSchema`).
 */
export const computeStreak: ComputeStreak = (
  activeDates: readonly LocalDate[],
  today: LocalDate,
): StreakState => {
  const todayDay = localDateToDayNumber(today);
  const days = [...new Set(activeDates.map(localDateToDayNumber))]
    .filter((day) => day <= todayDay)
    .sort((a, b) => a - b);

  if (days.length === 0) {
    return { current: 0, longest: 0, lastActiveDate: null, extendedToday: false };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // After the loop `run` is the length of the run that ends on the last active day.
  const lastDay = days[days.length - 1];
  const extendedToday = lastDay === todayDay;
  const alive = extendedToday || lastDay === todayDay - 1;

  return {
    current: alive ? run : 0,
    longest,
    lastActiveDate: dayNumberToLocalDate(lastDay),
    extendedToday,
  };
};
