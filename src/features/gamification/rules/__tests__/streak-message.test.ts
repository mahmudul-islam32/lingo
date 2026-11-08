import { describe, expect, it } from "vitest";
import {
  formatStreakAdjective,
  streakAccessibleName,
  streakMessage,
  type StreakStatus,
} from "@/features/gamification";

describe("streakMessage (GAM-009 AC2)", () => {
  it("extended", () => {
    expect(streakMessage("extended", 3)).toBe("You're glowing! Your streak is safe today.");
  });
  it("at_risk uses the N-day adjective, including 1-day", () => {
    expect(streakMessage("at_risk", 1)).toBe("Do a lesson today to keep your 1-day streak.");
    expect(streakMessage("at_risk", 3)).toBe("Do a lesson today to keep your 3-day streak.");
  });
  it("broken", () => {
    expect(streakMessage("broken", 0)).toBe("Your streak went out. Start a new one today.");
  });
  it("none", () => {
    expect(streakMessage("none", 0)).toBe("Finish a lesson to light your first streak.");
  });
  it("throws on an unknown status", () => {
    expect(() => streakMessage("x" as StreakStatus, 0)).toThrow();
  });
  it("formatStreakAdjective", () => {
    expect(formatStreakAdjective(1)).toBe("1-day streak");
    expect(formatStreakAdjective(12)).toBe("12-day streak");
  });
});

describe("streakAccessibleName (GAM-007 AC3)", () => {
  it.each<[StreakStatus, number, string]>([
    ["none", 0, "Streak: 0 days"],
    ["broken", 0, "Streak: 0 days"],
    ["extended", 1, "Streak: 1 day, done for today"],
    ["extended", 4, "Streak: 4 days, done for today"],
    ["at_risk", 2, "Streak: 2 days, do a lesson today to keep it"],
  ])("%s / %i -> %s", (status, n, name) => {
    expect(streakAccessibleName(status, n)).toBe(name);
  });
});
