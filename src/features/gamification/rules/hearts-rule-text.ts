/** Hearts dialog copy (GAM-007 AC6). Pure; hours come from `GAME_CONFIG`. */
import { GAME_CONFIG } from "@/contracts";

const HOUR_MS = 3_600_000;

export const HEARTS_FULL_TEXT = "Your hearts are full.";

/** "You lose a heart for each wrong answer. One heart comes back every 4 hours." */
export function heartsRuleText(refillIntervalMs: number = GAME_CONFIG.heartRefillIntervalMs) {
  const hours = refillIntervalMs / HOUR_MS;
  const every = hours === 1 ? "every hour" : `every ${hours} hours`;
  return `You lose a heart for each wrong answer. One heart comes back ${every}.`;
}
