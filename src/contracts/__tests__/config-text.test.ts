import { describe, expect, it } from "vitest";
import {
  CONTENT_RULES,
  DAILY_GOAL_OPTIONS,
  foldDiacritics,
  GAME_CONFIG,
  GameConfigSchema,
  normalizeAnswerText,
  tokenizeAnswer,
} from "../index";

describe("GAME_CONFIG (PD-003)", () => {
  it("matches the product defaults", () => {
    expect(GAME_CONFIG.xpPerLesson).toBe(10);
    expect(GAME_CONFIG.perfectLessonBonusXp).toBe(5);
    expect(GAME_CONFIG.maxHearts).toBe(5);
    expect(GAME_CONFIG.heartRefillIntervalMs).toBe(4 * 60 * 60 * 1000);
    expect(DAILY_GOAL_OPTIONS).toEqual([10, 20, 30, 50]);
    expect(CONTENT_RULES.matchPairsCount).toBe(5);
  });

  it("passes its own schema", () => {
    expect(GameConfigSchema.safeParse(GAME_CONFIG).success).toBe(true);
  });

  it("rejects a default goal that is not an option", () => {
    expect(GameConfigSchema.safeParse({ ...GAME_CONFIG, defaultDailyGoalXp: 15 }).success).toBe(
      false,
    );
  });
});

describe("text normalisation", () => {
  it("lower-cases, strips punctuation and collapses whitespace, keeping diacritics", () => {
    expect(normalizeAnswerText("  ¡Hola!  ¿Cómo   estás? ")).toBe("hola cómo estás");
    expect(normalizeAnswerText("Buenos días")).not.toBe(normalizeAnswerText("Buenos dias"));
  });

  it("unifies composed and decomposed characters", () => {
    expect(normalizeAnswerText("café")).toBe(normalizeAnswerText("café"));
  });

  it("tokenizes and returns [] for blank input", () => {
    expect(tokenizeAnswer("Me llamo Ana.")).toEqual(["me", "llamo", "ana"]);
    expect(tokenizeAnswer(" ?! ")).toEqual([]);
  });

  it("folds diacritics for lenient comparisons", () => {
    expect(foldDiacritics("¿Qué tal, señor?")).toBe("que tal senor");
  });
});
