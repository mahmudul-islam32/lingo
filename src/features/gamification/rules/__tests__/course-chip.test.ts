import { describe, expect, it } from "vitest";
import { courseChip, courseLanguageOf, languageName } from "../course-chip";

describe("courseChip (GAM-012 AC1)", () => {
  it("German course: 'DE', read as 'Course: German'", () => {
    expect(courseChip("en-de")).toEqual({ code: "DE", label: "Course: German" });
  });

  it("Spanish course: 'ES'", () => {
    expect(courseChip("en-es")).toEqual({ code: "ES", label: "Course: Spanish" });
  });

  it("uses the part after the last dash, lower-cased", () => {
    expect(courseLanguageOf("en-DE")).toBe("de");
    expect(courseLanguageOf("pt-br-fr")).toBe("fr");
  });

  it("an id without a dash shows its first two letters", () => {
    expect(courseLanguageOf("german")).toBe("ge");
  });

  it("an unknown language keeps the code as the label", () => {
    expect(languageName("zz")).toBeNull();
    expect(courseChip("en-zz")).toEqual({ code: "ZZ", label: "Course: ZZ" });
  });

  it("an invalid tag never throws", () => {
    expect(languageName("!!")).toBeNull();
  });
});
