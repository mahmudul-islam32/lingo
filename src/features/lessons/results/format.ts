/** Pure display formatters for the results screen (LES-008 criteria 3 and 4). */

/**
 * Lesson time as `m:ss` (e.g. 187 000 ms → "3:07"). Whole seconds are truncated, like a
 * stopwatch; minutes are not capped (65 min → "65:00"). Negative or non-finite → "0:00".
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Whole percent of an accuracy in `[0, 1]` (PD-012: rounded to the nearest whole number). */
export function accuracyPercent(accuracy: number): number {
  if (!Number.isFinite(accuracy)) return 0;
  return Math.round(Math.min(1, Math.max(0, accuracy)) * 100);
}

/** Accuracy as shown on the results screen: "N %" (criterion 3). */
export function formatAccuracy(accuracy: number): string {
  return `${accuracyPercent(accuracy)} %`;
}
