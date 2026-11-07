/**
 * Speech-synthesis fallback for listen exercises (PD-007): read the sentence with a
 * voice of the learning language when the audio file is missing or fails.
 * Globals are read lazily, so tests can `vi.stubGlobal` them after import.
 */

export interface SpeakOptions {
  voice: SpeechSynthesisVoice;
  /** 1 for "Play", `CONTENT_RULES.slowPlaybackRate` for "Slow". */
  rate: number;
}

export interface SpeechFallback {
  /**
   * A voice whose `lang` is `lang` or `lang-*` (e.g. `es` → `es-ES`, `es-MX`), or null.
   * Waits for `voiceschanged` up to `timeoutMs` because some browsers load voices async.
   */
  findVoice(lang: string): Promise<SpeechSynthesisVoice | null>;
  /** Speaks `text`, cancelling anything already being spoken (restart). */
  speak(text: string, options: SpeakOptions): void;
  cancel(): void;
}

export interface SpeechFallbackOptions {
  getSynthesis?: () => SpeechSynthesis | undefined;
  getUtterance?: () => typeof SpeechSynthesisUtterance | undefined;
  /** How long to wait for voices to load. Default 1000 ms (LES-007 notes). */
  voiceTimeoutMs?: number;
}

function normalise(tag: string): string {
  return tag.trim().replace(/_/g, "-").toLowerCase();
}

/**
 * Picks the best voice for `lang`: exact tag match first (`es-MX` for `es-MX`), then any
 * voice of the same base language; within each group prefer the platform default and
 * then local (offline-capable) voices.
 */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  const wanted = normalise(lang);
  const base = wanted.split("-")[0] ?? wanted;
  const matching = voices.filter((voice) => {
    const tag = normalise(voice.lang);
    return tag === base || tag.startsWith(`${base}-`);
  });
  if (!matching.length) return null;
  const score = (voice: SpeechSynthesisVoice) =>
    (normalise(voice.lang) === wanted ? 4 : 0) +
    (voice.default ? 2 : 0) +
    (voice.localService ? 1 : 0);
  return matching.reduce((best, voice) => (score(voice) > score(best) ? voice : best));
}

function defaultSynthesis(): SpeechSynthesis | undefined {
  return typeof globalThis.speechSynthesis === "undefined" ? undefined : globalThis.speechSynthesis;
}

function defaultUtterance(): typeof SpeechSynthesisUtterance | undefined {
  return typeof globalThis.SpeechSynthesisUtterance === "undefined"
    ? undefined
    : globalThis.SpeechSynthesisUtterance;
}

export function createSpeechFallback({
  getSynthesis = defaultSynthesis,
  getUtterance = defaultUtterance,
  voiceTimeoutMs = 1000,
}: SpeechFallbackOptions = {}): SpeechFallback {
  function safeVoices(synth: SpeechSynthesis): SpeechSynthesisVoice[] {
    try {
      return synth.getVoices() ?? [];
    } catch {
      return [];
    }
  }

  return {
    findVoice(lang) {
      const synth = getSynthesis();
      if (!synth || !getUtterance()) return Promise.resolve(null);
      const immediate = pickVoice(safeVoices(synth), lang);
      if (immediate || voiceTimeoutMs <= 0) return Promise.resolve(immediate);

      return new Promise((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          synth.removeEventListener?.("voiceschanged", onChange);
          resolve(pickVoice(safeVoices(synth), lang));
        };
        const onChange = () => {
          if (pickVoice(safeVoices(synth), lang)) finish();
        };
        const timer = setTimeout(finish, voiceTimeoutMs);
        synth.addEventListener?.("voiceschanged", onChange);
      });
    },

    speak(text, { voice, rate }) {
      const synth = getSynthesis();
      const Utterance = getUtterance();
      if (!synth || !Utterance) return;
      try {
        synth.cancel();
        const utterance = new Utterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = rate;
        synth.speak(utterance);
      } catch {
        // Speech can be refused without a user gesture; Play/Slow stay available.
      }
    },

    cancel() {
      try {
        getSynthesis()?.cancel();
      } catch {
        // ignore
      }
    },
  };
}
