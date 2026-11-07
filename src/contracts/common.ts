/**
 * Shared primitive schemas used by every contract module.
 *
 * Contracts are pure: no React, no IO, no feature logic. Only zod schemas,
 * inferred types, constants and small pure helpers needed by validation rules.
 */
import { z } from "zod";

/** Kebab-case slug used for authored content ids (course, unit, lesson, exercise). */
export const SlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");
export type Slug = z.infer<typeof SlugSchema>;

/** RFC 9562 UUID, generated on the client with `crypto.randomUUID()`. Used as idempotency key. */
export const UuidSchema = z.uuid();
export type Uuid = z.infer<typeof UuidSchema>;

/** UTC instant as ISO 8601 with `Z`, e.g. `2026-11-07T10:15:00.000Z` (`Date#toISOString`). */
export const IsoDateTimeSchema = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

/**
 * Calendar date in the learner's device-local timezone, `YYYY-MM-DD`.
 * Streaks and daily goals are computed on these, never on UTC instants (ADR-002).
 */
export const LocalDateSchema = z.iso.date();
export type LocalDate = z.infer<typeof LocalDateSchema>;

/** IANA timezone name from `Intl.DateTimeFormat().resolvedOptions().timeZone`. */
export const TimeZoneSchema = z.string().min(1).max(64);
export type TimeZone = z.infer<typeof TimeZoneSchema>;

/** BCP 47 language tag, restricted to `ll` or `ll-RR` (e.g. `es`, `en`, `es-MX`). */
export const LanguageCodeSchema = z
  .string()
  .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "must be a BCP 47 tag like `es` or `es-MX`");
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

/** Non-negative integer (counts, XP totals). */
export const NonNegativeIntSchema = z.number().int().min(0);

/** Path of a pre-generated audio file served from `/public/audio/**`. */
export const AudioPathSchema = z
  .string()
  .regex(
    /^\/audio\/[a-z0-9][a-z0-9/_-]*\.(?:mp3|m4a|ogg|opus|webm)$/,
    "must be a path like `/audio/es/hola.mp3`",
  );
export type AudioPath = z.infer<typeof AudioPathSchema>;

/** Returns the values that occur more than once, in first-seen order. Pure helper for refinements. */
export function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}
