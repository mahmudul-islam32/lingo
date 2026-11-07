import { describe, expect, it, vi } from "vitest";
import { GAME_CONFIG, LessonResultSchema } from "@/contracts";
import { calculateXp } from "@/features/gamification";
import { deviceTimeZone, lessonXpFor, toLessonResult } from "./result";
import { oneMistakeSummary, perfectSummary, RESULT_ID } from "./testing/fixtures";

vi.mock("@/features/gamification", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/gamification")>();
  return { ...actual, calculateXp: vi.fn(actual.calculateXp) };
});

describe("toLessonResult", () => {
  it("perfect lesson: base + perfect bonus from calculateXp, schema-valid", () => {
    const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "Europe/Madrid" });
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({
      id: RESULT_ID,
      courseId: "en-es",
      lessonId: "u1-l1",
      durationMs: 187_000,
      accuracy: 1,
      perfect: true,
      xp: { base: GAME_CONFIG.xpPerLesson, perfectBonus: GAME_CONFIG.perfectLessonBonusXp },
      xpEarned: GAME_CONFIG.xpPerLesson + GAME_CONFIG.perfectLessonBonusXp,
      heartsLost: 0,
      localDate: "2026-11-07",
      timeZone: "Europe/Madrid",
    });
    // With today's GAME_CONFIG this is the "15 XP" of the ticket.
    expect(result.xpEarned).toBe(15);
  });

  it("a mistake removes the bonus and is reflected in accuracy and hearts", () => {
    const result = toLessonResult(oneMistakeSummary, { id: RESULT_ID, timeZone: "UTC" });
    expect(result).toMatchObject({
      accuracy: 0.8,
      perfect: false,
      xp: { base: GAME_CONFIG.xpPerLesson, perfectBonus: 0 },
      xpEarned: GAME_CONFIG.xpPerLesson,
      heartsLost: 1,
    });
  });

  it("the local date follows the timezone (toLocalDate from gamification)", () => {
    const late = { ...perfectSummary, completedAt: "2026-11-07T23:30:00.000Z" };
    expect(toLessonResult(late, { id: RESULT_ID, timeZone: "UTC" }).localDate).toBe("2026-11-07");
    expect(toLessonResult(late, { id: RESULT_ID, timeZone: "Europe/Madrid" }).localDate).toBe(
      "2026-11-08",
    );
  });

  it("defaults to the device timezone", () => {
    const result = toLessonResult(perfectSummary, { id: RESULT_ID });
    expect(result.timeZone).toBe(deviceTimeZone());
  });
});

describe("lessonXpFor", () => {
  it("passes counted exercises (presented − skipped) and mistakes to calculateXp", () => {
    vi.mocked(calculateXp).mockClear();
    const summary = { ...perfectSummary, skippedCount: 2, firstTryCorrectCount: 3 };
    const xp = lessonXpFor(summary);
    expect(calculateXp).toHaveBeenCalledWith({
      status: "completed",
      mistakeCount: 0,
      countedExerciseCount: 3,
    });
    expect(xp).toEqual(vi.mocked(calculateXp).mock.results[0]!.value);
  });

  it("uses whatever calculateXp returns (no XP numbers in the lessons feature)", () => {
    vi.mocked(calculateXp).mockReturnValueOnce({ base: 7, perfectBonus: 3, total: 10 });
    const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });
    expect(result.xp).toEqual({ base: 7, perfectBonus: 3 });
    expect(result.xpEarned).toBe(10);
  });

  it("all exercises skipped: no perfect bonus (PD-012)", () => {
    const allSkipped = { ...perfectSummary, skippedCount: 5, firstTryCorrectCount: 0 };
    expect(lessonXpFor(allSkipped).perfectBonus).toBe(0);
  });
});
