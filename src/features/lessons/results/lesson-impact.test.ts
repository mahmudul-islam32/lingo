import { describe, expect, it } from "vitest";
import { LessonResultSchema, type DailyGoalXp, type LessonResult } from "@/contracts";
import { createFullHearts } from "@/features/gamification";
import {
  celebrationText,
  computeLessonImpact,
  type LessonImpact,
  type LessonImpactInputs,
} from "./lesson-impact";
import { toLessonResult } from "./result";
import {
  FIXTURE_NOW,
  LESSON_DATE,
  RESULT_ID,
  YESTERDAY,
  nextResultId,
  oneMistakeSummary,
  perfectSummary,
} from "./testing/fixtures";

/** This lesson: perfect, 15 XP, on LESSON_DATE. */
const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });
const tenXp = toLessonResult(oneMistakeSummary, { id: RESULT_ID, timeZone: "UTC" });

function earlier(
  localDate: string,
  base: LessonResult = result,
  extra: Partial<LessonResult> = {},
) {
  return LessonResultSchema.parse({ ...base, id: nextResultId(), localDate, ...extra });
}

function ok(results: readonly LessonResult[], goalXp: DailyGoalXp = 20): LessonImpactInputs {
  return {
    status: "success",
    goalXp,
    results,
    hearts: createFullHearts(FIXTURE_NOW),
    now: FIXTURE_NOW,
  };
}

const impact = (inputs: LessonImpactInputs): LessonImpact => {
  const out = computeLessonImpact(result, inputs);
  if (!out) throw new Error("expected an impact");
  return out;
};

describe("computeLessonImpact (LES-010)", () => {
  it("first lesson ever: 'Streak started!', '1 day', 15 / 20 XP, banner", () => {
    const out = impact(ok([]));
    expect(out.streak).toEqual({
      label: "Streak started!",
      value: "1 day",
      srValue: "1 day",
      event: "started",
    });
    expect(out.goal).toMatchObject({
      label: "Daily goal",
      value: "15 / 20 XP",
      srValue: "15 of 20 XP",
      reached: false,
      newlyReached: false,
    });
    expect(out.celebration).toBe("Streak started!");
  });

  it("first lesson today after yesterday: 'Streak extended!' and 'N days'", () => {
    const out = impact(ok([earlier(YESTERDAY), earlier("2026-11-05")]));
    expect(out.streak.label).toBe("Streak extended!");
    expect(out.streak.value).toBe("3 days");
    expect(out.streak.event).toBe("extended");
    expect(out.celebration).toBe("Streak extended!");
  });

  it("first lesson after a broken streak says 'Streak started!' (1 day)", () => {
    const out = impact(ok([earlier("2026-11-01"), earlier("2026-11-02")]));
    expect(out.streak.label).toBe("Streak started!");
    expect(out.streak.value).toBe("1 day");
    expect(out.celebration).toBe("Streak started!");
  });

  it("second lesson today, goal not reached: 'Streak', no celebration", () => {
    const out = impact(ok([earlier(YESTERDAY), earlier(LESSON_DATE, tenXp)], 30));
    expect(out.streak).toMatchObject({ label: "Streak", value: "2 days", event: null });
    expect(out.goal).toMatchObject({ label: "Daily goal", value: "25 / 30 XP", reached: false });
    expect(out.celebration).toBeNull();
  });

  it("goal newly reached: 'Daily goal reached!' row and banner", () => {
    const out = impact(ok([earlier(LESSON_DATE, tenXp)], 20));
    expect(out.streak.label).toBe("Streak");
    expect(out.goal).toMatchObject({
      label: "Daily goal reached!",
      value: "25 / 20 XP",
      reached: true,
      newlyReached: true,
    });
    expect(out.celebration).toBe("Daily goal reached!");
  });

  it("goal already reached earlier today: value with the check, no celebration (AC 8)", () => {
    const out = impact(ok([earlier(LESSON_DATE), earlier(LESSON_DATE)], 20));
    expect(out.goal).toMatchObject({
      label: "Daily goal",
      value: "45 / 20 XP",
      reached: true,
      newlyReached: false,
    });
    expect(out.streak.event).toBeNull();
    expect(out.celebration).toBeNull();
  });

  it("both events: 'Streak extended and daily goal reached!'", () => {
    const out = impact(ok([earlier(YESTERDAY)], 10));
    expect(out.streak.label).toBe("Streak extended!");
    expect(out.goal.label).toBe("Daily goal reached!");
    expect(out.celebration).toBe("Streak extended and daily goal reached!");
  });

  it("first lesson ever that also reaches the goal: 'Streak started and daily goal reached!'", () => {
    expect(impact(ok([], 10)).celebration).toBe("Streak started and daily goal reached!");
  });

  it("is the same whether or not the saved results already contain this result (AC 3, 11)", () => {
    const stored = [earlier(YESTERDAY)];
    expect(impact(ok([...stored, result]))).toEqual(impact(ok(stored)));
    expect(impact(ok([result]))).toEqual(impact(ok([])));
  });

  it("uses the lesson's own local date even if the screen is shown after midnight", () => {
    const late = { ...ok([earlier(YESTERDAY)]), now: new Date("2026-11-08T00:30:00.000Z") };
    const out = impact(late);
    expect(out.streak.label).toBe("Streak extended!");
    expect(out.goal.value).toBe("15 / 20 XP");
  });

  it("ignores results of other courses", () => {
    const other = earlier(LESSON_DATE, result, { courseId: "en-fr" });
    expect(impact(ok([other]))).toEqual(impact(ok([])));
  });

  it("earlier results unreadable: '–' / 'unavailable', this lesson's XP vs the goal, no banner (AC 10)", () => {
    const out = computeLessonImpact(result, {
      status: "error",
      goalXp: 10,
      results: null,
      hearts: null,
      now: FIXTURE_NOW,
    });
    expect(out).toEqual({
      streak: { label: "Streak", value: "–", srValue: "unavailable", event: null },
      goal: {
        label: "Daily goal",
        value: "15 / 10 XP",
        srValue: "15 of 10 XP",
        goal: { earnedXp: 15, goalXp: 10 },
        reached: true,
        newlyReached: false,
      },
      celebration: null,
    });
  });

  it("returns null while the inputs are loading (no spinner)", () => {
    expect(
      computeLessonImpact(result, {
        status: "loading",
        goalXp: 20,
        results: null,
        hearts: null,
        now: FIXTURE_NOW,
      }),
    ).toBeNull();
  });
});

describe("celebrationText", () => {
  it.each([
    ["started", false, "Streak started!"],
    ["extended", false, "Streak extended!"],
    [null, true, "Daily goal reached!"],
    ["extended", true, "Streak extended and daily goal reached!"],
    ["started", true, "Streak started and daily goal reached!"],
    [null, false, null],
  ] as const)("%s / goal %s → %s", (streak, goal, text) => {
    expect(celebrationText(streak, goal)).toBe(text);
  });
});
