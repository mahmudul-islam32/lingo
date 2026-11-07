/**
 * Hearts rules (PD-003, ADR-002 §9). Stored as `{ current, refillStartedAt }` and
 * refilled lazily: no timers. Pure: `now` is always passed in.
 */
import {
  GAME_CONFIG,
  type HeartsState,
  type HeartsView,
  type LoseHearts,
  type RefillHearts,
  type ViewHearts,
} from "@/contracts";
import type { HeartsConfig } from "./config";

/** A fresh, full hearts state (first launch, new guest). */
export function createFullHearts(now: Date, config: HeartsConfig = GAME_CONFIG): HeartsState {
  return { current: config.maxHearts, refillStartedAt: null, updatedAt: now.toISOString() };
}

/**
 * Contract rule `RefillHearts`. `n = floor((now - refillStartedAt) / interval)` hearts
 * arrive; the clock advances by `n` intervals (keeping the partial progress toward the
 * next heart) or stops (`null`) when full.
 *
 * - `updatedAt` is not changed: a refill is derived from the stored state, not a new
 *   write, so it never wins a last-write-wins merge over a real change.
 * - If `now` is before `refillStartedAt` (device clock moved back), nothing refills.
 * - A full state is normalised to `refillStartedAt: null`.
 */
export function refillHearts(
  state: HeartsState,
  now: Date,
  config: HeartsConfig = GAME_CONFIG,
): HeartsState {
  if (state.current >= config.maxHearts) {
    return state.refillStartedAt === null && state.current === config.maxHearts
      ? state
      : { ...state, current: config.maxHearts, refillStartedAt: null };
  }
  if (state.refillStartedAt === null) {
    // Not full but no clock: repair by starting the clock now (never refills instantly).
    return { ...state, refillStartedAt: now.toISOString() };
  }
  const startedAt = Date.parse(state.refillStartedAt);
  const elapsed = now.getTime() - startedAt;
  const refills = Math.floor(elapsed / config.heartRefillIntervalMs);
  if (refills <= 0) return state;

  const current = Math.min(config.maxHearts, state.current + refills);
  return {
    ...state,
    current,
    refillStartedAt:
      current === config.maxHearts
        ? null
        : new Date(startedAt + refills * config.heartRefillIntervalMs).toISOString(),
  };
}
refillHearts satisfies RefillHearts;

/**
 * Contract rule `LoseHearts`. Applies the pending refill at `now` first (so a learner
 * whose hearts silently refilled to full gets a fresh 4-hour clock), then subtracts
 * `cost`, clamped at 0. Starts the refill clock at `now` if hearts were full; otherwise
 * the running clock continues. `updatedAt = now` when hearts change.
 * `cost` must be a non-negative integer (`AnswerCheckResult.heartCost`).
 */
export function loseHearts(
  state: HeartsState,
  cost: number,
  now: Date,
  config: HeartsConfig = GAME_CONFIG,
): HeartsState {
  if (!Number.isInteger(cost) || cost < 0) {
    throw new RangeError(`Heart cost must be a non-negative integer, got ${cost}`);
  }
  const refilled = refillHearts(state, now, config);
  if (cost === 0 || refilled.current === 0) return refilled;

  return {
    current: Math.max(0, refilled.current - cost),
    refillStartedAt: refilled.refillStartedAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
loseHearts satisfies LoseHearts;

/**
 * Contract rule `ViewHearts`: what the top bar and lesson start button show at `now`
 * (after lazy refill). `canStartLesson` is false at 0 hearts.
 */
export function viewHearts(
  state: HeartsState,
  now: Date,
  config: HeartsConfig = GAME_CONFIG,
): HeartsView {
  const { current, refillStartedAt } = refillHearts(state, now, config);
  const view = { current, max: config.maxHearts, canStartLesson: current > 0 };
  if (refillStartedAt === null) {
    return { ...view, nextRefillAt: null, fullAt: null };
  }
  const startedAt = Date.parse(refillStartedAt);
  const interval = config.heartRefillIntervalMs;
  return {
    ...view,
    nextRefillAt: new Date(startedAt + interval).toISOString(),
    fullAt: new Date(startedAt + (config.maxHearts - current) * interval).toISOString(),
  };
}
viewHearts satisfies ViewHearts;
