import { describe, expect, it } from "vitest";
import * as gamification from "@/features/gamification";

describe("@/features/gamification hearts API (GAM-005)", () => {
  it.each([
    "useHearts",
    "useLoseHearts",
    "useMinuteClock",
    "heartsQuery",
    "formatHeartRefill",
    "formatHeartsFull",
    "formatRoundedDuration",
    "HeartsMeter",
  ])("exports %s", (name) => {
    expect(typeof (gamification as Record<string, unknown>)[name]).toBe("function");
  });
});
