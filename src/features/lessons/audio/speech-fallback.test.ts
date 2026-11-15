import { afterEach, describe, expect, it, vi } from "vitest";
import { speechLocale } from "@/contracts";
import {
  fakeVoice,
  stubNoSpeechSynthesis,
  stubSpeechSynthesis,
} from "../test-utils/speech-synthesis";
import { createSpeechFallback, pickVoice } from "./speech-fallback";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("pickVoice", () => {
  it("matches the base language only (es → es-*, never en)", () => {
    expect(pickVoice([fakeVoice("en-US")], "es")).toBeNull();
    expect(pickVoice([fakeVoice("en-US"), fakeVoice("es-ES")], "es")?.lang).toBe("es-ES");
    expect(pickVoice([fakeVoice("es_MX")], "es")?.lang).toBe("es_MX");
    expect(pickVoice([fakeVoice("est-EE")], "es")).toBeNull();
  });

  it("prefers an exact tag, then the default voice, then local voices", () => {
    const es = fakeVoice("es-ES", { localService: false });
    const mx = fakeVoice("es-MX");
    expect(pickVoice([es, mx], "es-ES")).toBe(es);
    const def = fakeVoice("es-US", { default: true, localService: false });
    expect(pickVoice([mx, def], "es")).toBe(def);
    expect(pickVoice([es, mx], "es")).toBe(mx);
  });
});

describe("pickVoice with the course speech locale (LES-014, PD-034)", () => {
  const de = speechLocale("de");

  it("maps German to de-DE and keeps Spanish as es", () => {
    expect(de).toBe("de-DE");
    expect(speechLocale("es")).toBe("es");
  });

  it("de-DE beats a default de-CH voice", () => {
    const ch = fakeVoice("de-CH", { default: true });
    const deDE = fakeVoice("de-DE", { localService: false });
    expect(pickVoice([ch, deDE], de)).toBe(deDE);
  });

  it("falls back to any de-* voice, then null; never es or en", () => {
    expect(pickVoice([fakeVoice("en-US", { default: true }), fakeVoice("de-AT")], de)?.lang).toBe(
      "de-AT",
    );
    expect(pickVoice([fakeVoice("es-ES"), fakeVoice("en-GB")], de)).toBeNull();
    expect(pickVoice([fakeVoice("dex-XX")], de)).toBeNull();
  });

  it("Spanish keeps its behaviour (default es-* voice wins, no region preference)", () => {
    const mx = fakeVoice("es-MX", { default: true });
    const es = fakeVoice("es-ES");
    expect(pickVoice([es, mx], speechLocale("es"))).toBe(mx);
  });
});

describe("createSpeechFallback", () => {
  it("returns null when speech synthesis is unsupported", async () => {
    stubNoSpeechSynthesis();
    await expect(createSpeechFallback().findVoice("es")).resolves.toBeNull();
  });

  it("waits up to the timeout for voiceschanged", async () => {
    vi.useFakeTimers();
    const mock = stubSpeechSynthesis([]);
    const speech = createSpeechFallback({ voiceTimeoutMs: 1000 });
    const found = speech.findVoice("es");
    mock.setVoices([fakeVoice("es-ES")]);
    await expect(found).resolves.toMatchObject({ lang: "es-ES" });

    const none = speech.findVoice("fr");
    await vi.advanceTimersByTimeAsync(1000);
    await expect(none).resolves.toBeNull();
  });

  it("speaks with the voice, its lang and the rate, cancelling first", () => {
    const mock = stubSpeechSynthesis([]);
    const voice = fakeVoice("es-ES");
    createSpeechFallback().speak("Hola", { voice, rate: 0.75 });
    expect(mock.cancel).toHaveBeenCalled();
    expect(mock.lastUtterance()).toMatchObject({ text: "Hola", lang: "es-ES", rate: 0.75, voice });
  });

  it("never throws when the browser refuses to speak", () => {
    const mock = stubSpeechSynthesis([]);
    mock.speak.mockImplementation(() => {
      throw new Error("not-allowed");
    });
    expect(() =>
      createSpeechFallback().speak("Hola", { voice: fakeVoice("es-ES"), rate: 1 }),
    ).not.toThrow();
  });
});
