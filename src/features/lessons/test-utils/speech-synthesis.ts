/**
 * Test helpers for LES-007: a fake `speechSynthesis` + `SpeechSynthesisUtterance`
 * installed with `vi.stubGlobal`, and stubs for `HTMLMediaElement` playback.
 * Test-only (imports vitest); never import from app code.
 */
import { vi, type Mock } from "vitest";

export class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  constructor(text = "") {
    this.text = text;
  }
}

export function fakeVoice(lang: string, overrides: Partial<SpeechSynthesisVoice> = {}) {
  return {
    lang,
    name: `Voice ${lang}`,
    voiceURI: `voice-${lang}`,
    default: false,
    localService: true,
    ...overrides,
  } as SpeechSynthesisVoice;
}

export interface SpeechSynthesisMock {
  synth: SpeechSynthesis;
  speak: Mock<(utterance: FakeUtterance) => void>;
  cancel: Mock<() => void>;
  /** Replaces the voice list and fires `voiceschanged`. */
  setVoices: (voices: SpeechSynthesisVoice[]) => void;
  /** Last utterance passed to `speak`. */
  lastUtterance: () => FakeUtterance | undefined;
}

/** Installs a fake speech-synthesis API on `globalThis`. Undo with `vi.unstubAllGlobals()`. */
export function stubSpeechSynthesis(
  initialVoices: SpeechSynthesisVoice[] = [],
): SpeechSynthesisMock {
  let voices = initialVoices;
  const target = new EventTarget();
  const speak = vi.fn<(utterance: FakeUtterance) => void>();
  const cancel = vi.fn<() => void>();
  const synth = Object.assign(target, {
    getVoices: () => voices,
    speak,
    cancel,
    pause: vi.fn(),
    resume: vi.fn(),
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
  }) as unknown as SpeechSynthesis;
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  return {
    synth,
    speak,
    cancel,
    setVoices(next) {
      voices = next;
      target.dispatchEvent(new Event("voiceschanged"));
    },
    lastUtterance: () => speak.mock.calls.at(-1)?.[0],
  };
}

/** Removes the speech-synthesis API entirely (unsupported browser). */
export function stubNoSpeechSynthesis() {
  vi.stubGlobal("speechSynthesis", undefined);
  vi.stubGlobal("SpeechSynthesisUtterance", undefined);
}

export type MediaPlayBehaviour = "resolve" | "block" | "error" | "pending";

function domError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

/**
 * Stubs `HTMLMediaElement.prototype.play`/`pause`. `"block"` rejects with
 * `NotAllowedError` (autoplay blocked); `"error"` dispatches the element's `error` event
 * and rejects with `NotSupportedError` (missing file); `"pending"` never settles (loading).
 * Returns the `play` spy; `spy.mock.contexts` are the elements. Restore with
 * `vi.restoreAllMocks()`.
 */
export function stubMediaPlayback(behaviour: MediaPlayBehaviour | (() => MediaPlayBehaviour)) {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  return vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    const mode = typeof behaviour === "function" ? behaviour() : behaviour;
    if (mode === "resolve") return Promise.resolve();
    if (mode === "block") return Promise.reject(domError("NotAllowedError"));
    if (mode === "pending") return new Promise<void>(() => {});
    queueMicrotask(() => this.dispatchEvent(new Event("error")));
    return Promise.reject(domError("NotSupportedError"));
  });
}
