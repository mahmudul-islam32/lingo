import { describe, expect, it } from "vitest";
import { AudioPathSchema, SPEECH_LOCALES, speechLocale } from "../index";

describe("speechLocale (CTO-008, PD-034)", () => {
  it("maps German to de-DE", () => {
    expect(SPEECH_LOCALES.de).toBe("de-DE");
    expect(speechLocale("de")).toBe("de-DE");
  });

  it("keeps Spanish and tags with a region unchanged", () => {
    expect(speechLocale("es")).toBe("es");
    expect(speechLocale("de-AT")).toBe("de-AT");
    expect(speechLocale("es-MX")).toBe("es-MX");
  });

  it("ignores inherited keys", () => {
    expect(speechLocale("constructor")).toBe("constructor");
  });
});

describe("German audio paths (PD-034)", () => {
  it("accepts /audio/de/<level>/<unit>/<exercise-id>.mp3", () => {
    expect(AudioPathSchema.safeParse("/audio/de/a1/u01/de-a1-u01-l1-ex05.mp3").success).toBe(true);
    expect(AudioPathSchema.safeParse("/audio/de/A1/u01/x.mp3").success).toBe(false);
  });
});
