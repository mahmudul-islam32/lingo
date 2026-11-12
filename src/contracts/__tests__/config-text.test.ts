import { describe, expect, it } from "vitest";
import {
  CONTENT_RULES,
  DAILY_GOAL_OPTIONS,
  DEFAULT_SETTINGS,
  foldDiacritics,
  GAME_CONFIG,
  GameConfigSchema,
  normalizeAnswerText,
  SettingsSchema,
  tokenizeAnswer,
} from "../index";

describe("DEFAULT_SETTINGS (CR-002)", () => {
  it("completes a valid Settings record once onboarding picks course and goal", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      courseId: "en-es",
      dailyGoalXp: GAME_CONFIG.defaultDailyGoalXp,
      updatedAt: "2026-11-07T10:00:00.000Z",
    };
    expect(SettingsSchema.safeParse(settings).success).toBe(true);
    expect(DEFAULT_SETTINGS).toEqual({ soundEffectsEnabled: true, speakingExercisesEnabled: true });
  });
});

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

describe("German normalisation (CTO-008, ADR-008, PD-033)", () => {
  const same = (a: string, b: string) => normalizeAnswerText(a) === normalizeAnswerText(b);

  it("keeps ä ö ü ß distinct and folds neither ss nor ae/oe/ue", () => {
    expect(same("schön", "schon")).toBe(false);
    expect(same("Straße", "Strasse")).toBe(false);
    expect(same("Brüder", "Bruder")).toBe(false);
    expect(same("Grüße", "Grusse")).toBe(false);
    expect(same("Müller", "Mueller")).toBe(false);
  });

  it("ignores case, including upper-case umlauts and capital ẞ", () => {
    expect(same("Brot", "brot")).toBe(true);
    expect(same("ÄPFEL", "äpfel")).toBe(true);
    expect(same("Der Hund", "der hund")).toBe(true);
    expect(normalizeAnswerText("STRAẞE")).toBe("straße");
  });

  it("treats NFD input like NFC input", () => {
    expect(normalizeAnswerText("scho\u0308n")).toBe("schön");
    expect(same("Gru\u0308\u00dfe", "Grüße")).toBe(true);
  });

  it("strips German quotation marks and keeps apostrophes", () => {
    expect(normalizeAnswerText("„Hallo“")).toBe("hallo");
    expect(normalizeAnswerText("»Tschüss« ›ja‹")).toBe("tschüss ja");
    expect(same("Wie geht’s?", "wie geht's")).toBe(true);
    expect(same("Wie geht's", "Wie gehts")).toBe(false);
  });

  it("splits hyphenated compounds into words, for tiles and answers alike", () => {
    expect(tokenizeAnswer("Ich nehme die U-Bahn.")).toEqual(["ich", "nehme", "die", "u", "bahn"]);
    expect(tokenizeAnswer("S-Bahn")).toEqual(["s", "bahn"]);
    expect(same("Ich schreibe eine E-Mail.", "ich schreibe eine e-mail")).toBe(true);
  });

  it("folds umlauts (ö → o) and ß (→ ss) for speech comparisons only", () => {
    expect(foldDiacritics("schön")).toBe("schon");
    expect(foldDiacritics("Schöne Grüße!")).toBe("schone grusse");
    expect(foldDiacritics("Grüsse")).toBe(foldDiacritics("Grüße"));
  });
});
