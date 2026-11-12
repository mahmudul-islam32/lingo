import { describe, expect, it } from "vitest";
import { LUMI_POSES } from "@/components/ui";
import { lumiPoseForStreak, type StreakStatus } from "@/features/gamification";

describe("lumiPoseForStreak (GAM-009 AC1, AC5)", () => {
  it.each<[StreakStatus, string]>([
    ["extended", "happy"],
    ["at_risk", "idle"],
    ["broken", "ember"],
    ["none", "idle"],
  ])("%s -> %s", (status, pose) => {
    expect(lumiPoseForStreak(status)).toBe(pose);
  });

  it("only returns existing GAM-001 poses", () => {
    for (const s of ["extended", "at_risk", "broken", "none"] as const) {
      expect(LUMI_POSES).toContain(lumiPoseForStreak(s));
    }
  });

  it("throws on an unknown status (exhaustive switch)", () => {
    expect(() => lumiPoseForStreak("frozen" as StreakStatus)).toThrow(/Unknown streak status/);
  });
});
