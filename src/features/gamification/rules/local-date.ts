/**
 * Calendar math on device-local dates (`YYYY-MM-DD`, ADR-002 §8).
 *
 * Day arithmetic never uses a `Date` in local time: a `LocalDate` is mapped to a whole
 * day number (days since 1970-01-01 in UTC), so DST changes and the device timezone
 * cannot shift a day.
 */
import type { LocalDate, ToLocalDate } from "@/contracts";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Days since 1970-01-01 for a valid `YYYY-MM-DD`; throws `RangeError` otherwise. */
export function localDateToDayNumber(date: LocalDate): number {
  const match = LOCAL_DATE_PATTERN.exec(date);
  if (!match) throw new RangeError(`Invalid LocalDate: "${date}"`);
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  // Rejects overflowing dates like 2026-02-30 (which Date.UTC would roll into March).
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid LocalDate: "${date}"`);
  }
  return Math.round(ms / MS_PER_DAY);
}

/** Inverse of `localDateToDayNumber`. */
export function dayNumberToLocalDate(dayNumber: number): LocalDate {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

/** `date` shifted by `days` calendar days (negative for the past). */
export function addDays(date: LocalDate, days: number): LocalDate {
  return dayNumberToLocalDate(localDateToDayNumber(date) + days);
}

/**
 * Contract `ToLocalDate`: the calendar date of `instant` in the IANA `timeZone`
 * (e.g. the device timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`).
 * Throws `RangeError` for an unknown timezone or an invalid instant.
 */
export const toLocalDate: ToLocalDate = (instant: Date, timeZone: string) => {
  if (Number.isNaN(instant.getTime())) throw new RangeError("Invalid instant");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    numberingSystem: "latn",
    calendar: "gregory",
  }).formatToParts(instant);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${String(byType.year).padStart(4, "0")}-${byType.month}-${byType.day}`;
};
