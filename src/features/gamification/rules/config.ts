import type { GameConfig } from "@/contracts";

/** The XP values a rule needs. Defaults to `GAME_CONFIG`; tests pass custom values. */
export type XpConfig = Pick<GameConfig, "xpPerLesson" | "perfectLessonBonusXp">;

/** The hearts values a rule needs. Defaults to `GAME_CONFIG`; tests pass custom values. */
export type HeartsConfig = Pick<GameConfig, "maxHearts" | "heartRefillIntervalMs">;
