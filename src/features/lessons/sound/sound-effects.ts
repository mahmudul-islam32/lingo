/**
 * Lesson sound effects (LES-012): a short chime for a correct answer, a soft low tone for
 * a wrong one and a little fanfare when the lesson is complete.
 *
 * The sounds are synthesised with the Web Audio API, so there are no audio files to load,
 * cache offline or license. They are Polyglow's own (CLAUDE.md brand rules): simple sine /
 * triangle notes with short envelopes, not a copy of any other app's sounds.
 *
 * Every call is best-effort: no Web Audio (SSR, old browsers, tests), a suspended context
 * or an audio error never throws and never blocks the lesson.
 */

export type SoundEffect = "correct" | "incorrect" | "complete";

export interface SoundEffects {
  play(effect: SoundEffect): void;
}

/** One note: frequency in Hz, start offset and duration in seconds, peak gain 0–1. */
interface Note {
  frequency: number;
  start: number;
  duration: number;
  gain: number;
  wave: OscillatorType;
  /** Optional glide target in Hz (pitch slides to it over the note). */
  glideTo?: number;
}

/** Master volume. Kept low: the sounds sit under speech audio, never over it. */
export const MASTER_GAIN = 0.35;

// Note frequencies (equal temperament, A4 = 440 Hz).
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880;
const C6 = 1046.5;
const E6 = 1318.51;

/** The notes of each effect. Exported for tests. */
export const SOUND_NOTES: Record<SoundEffect, readonly Note[]> = {
  // Two quick rising notes, bright and light: "ding-ding".
  correct: [
    { frequency: E5, start: 0, duration: 0.12, gain: 0.5, wave: "sine" },
    { frequency: A5, start: 0.09, duration: 0.28, gain: 0.55, wave: "sine" },
    { frequency: A5 * 2, start: 0.09, duration: 0.2, gain: 0.08, wave: "triangle" },
  ],
  // A soft, low "bwoh-bwoh" that slides down: clearly "not quite", never harsh.
  incorrect: [
    { frequency: 233.08, start: 0, duration: 0.16, gain: 0.45, wave: "triangle", glideTo: 220 },
    { frequency: 196, start: 0.15, duration: 0.3, gain: 0.45, wave: "triangle", glideTo: 174.61 },
  ],
  // Rising arpeggio that lands on a held major chord.
  complete: [
    { frequency: C5, start: 0, duration: 0.14, gain: 0.4, wave: "sine" },
    { frequency: E5, start: 0.11, duration: 0.14, gain: 0.4, wave: "sine" },
    { frequency: G5, start: 0.22, duration: 0.14, gain: 0.4, wave: "sine" },
    { frequency: C6, start: 0.33, duration: 0.6, gain: 0.45, wave: "sine" },
    { frequency: E5, start: 0.33, duration: 0.6, gain: 0.2, wave: "sine" },
    { frequency: G5, start: 0.33, duration: 0.6, gain: 0.2, wave: "sine" },
    { frequency: E6, start: 0.33, duration: 0.35, gain: 0.06, wave: "triangle" },
  ],
};

const ATTACK_S = 0.012;

type AudioContextFactory = () => AudioContext | null;

function defaultContextFactory(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

function scheduleNote(ctx: AudioContext, output: AudioNode, at: number, note: Note): void {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const start = at + note.start;
  const end = start + note.duration;
  osc.type = note.wave;
  osc.frequency.setValueAtTime(note.frequency, start);
  if (note.glideTo) osc.frequency.exponentialRampToValueAtTime(note.glideTo, end);
  // Short attack, exponential decay: no clicks at the start or the end.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(note.gain, start + ATTACK_S);
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(env);
  env.connect(output);
  osc.start(start);
  osc.stop(end + 0.02);
}

/**
 * Creates a player. The `AudioContext` is created lazily on the first `play`, which runs
 * inside the learner's tap on "Check" (a user gesture), so browsers allow the sound.
 */
export function createSoundEffects(
  createContext: AudioContextFactory = defaultContextFactory,
): SoundEffects {
  let ctx: AudioContext | null | undefined;
  let master: GainNode | null = null;

  function context(): AudioContext | null {
    if (ctx === undefined) {
      try {
        ctx = createContext();
        if (ctx) {
          master = ctx.createGain();
          master.gain.value = MASTER_GAIN;
          master.connect(ctx.destination);
        }
      } catch {
        ctx = null;
      }
    }
    return ctx;
  }

  return {
    play(effect) {
      try {
        const audio = context();
        if (!audio || !master) return;
        if (audio.state === "suspended") void audio.resume().catch(() => undefined);
        const at = audio.currentTime + 0.01;
        for (const note of SOUND_NOTES[effect]) scheduleNote(audio, master, at, note);
      } catch {
        // Sound is decoration: never let it break the lesson.
      }
    },
  };
}

/** No-op player: sound effects off. */
export const silentSoundEffects: SoundEffects = { play: () => undefined };

let shared: SoundEffects | null = null;

/** One app-wide player (one `AudioContext`; browsers limit how many a page may open). */
export function sharedSoundEffects(): SoundEffects {
  shared ??= createSoundEffects();
  return shared;
}
