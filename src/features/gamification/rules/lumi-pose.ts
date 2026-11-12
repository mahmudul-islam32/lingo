/**
 * Lumi's pose for a streak status (GAM-009 AC1, AC5). Pure. The mapping lives in the
 * gamification feature; `src/components/ui` only draws the four GAM-001 poses.
 */
import type { LumiPose } from "@/components/ui";
import type { StreakStatus } from "./streak-status";

export function lumiPoseForStreak(status: StreakStatus): LumiPose {
  switch (status) {
    case "extended":
      return "happy";
    case "at_risk":
      return "idle";
    case "broken":
      return "ember";
    case "none":
      return "idle";
    default: {
      const unreachable: never = status;
      throw new Error(`Unknown streak status: ${String(unreachable)}`);
    }
  }
}
