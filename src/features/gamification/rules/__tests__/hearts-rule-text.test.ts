import { describe, expect, it } from "vitest";
import { heartsRuleText } from "@/features/gamification";

describe("heartsRuleText (GAM-007 AC6)", () => {
  it("uses GAME_CONFIG hours by default (4 h)", () => {
    expect(heartsRuleText()).toBe(
      "You lose a heart for each wrong answer. One heart comes back every 4 hours.",
    );
  });
  it("singular hour", () => {
    expect(heartsRuleText(3_600_000)).toMatch(/comes back every hour\.$/);
  });
});
