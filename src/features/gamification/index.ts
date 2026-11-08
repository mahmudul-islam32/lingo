/**
 * Public API of the gamification feature. Other features import only from
 * `@/features/gamification` (ARCHITECTURE §2).
 */
export * from "./rules";
export { heartsQuery } from "./data/queries";
export { formatHeartRefill, formatHeartsFull, formatRoundedDuration } from "./rules/hearts-format";
export { useHearts, type UseHeartsResult } from "./hooks/use-hearts";
export { useLoseHearts, type LoseHeartsFn } from "./hooks/use-lose-hearts";
export { useMinuteClock } from "./hooks/use-minute-clock";
export { HeartsMeter, type HeartsMeterProps } from "./components/HeartsMeter";
