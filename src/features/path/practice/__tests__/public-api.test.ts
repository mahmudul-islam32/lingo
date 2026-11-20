import { describe, expect, it } from "vitest";
import * as path from "@/features/path";

describe("@/features/path Practice API (GAM-012)", () => {
  it.each(["PracticeScreen", "buildPracticeList"])("exports %s", (name) => {
    expect(typeof (path as Record<string, unknown>)[name]).toBe("function");
  });
});
