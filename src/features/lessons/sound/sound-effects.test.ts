import { describe, expect, it, vi } from "vitest";
import { createSoundEffects, MASTER_GAIN, SOUND_NOTES, type SoundEffect } from "./sound-effects";

/** Minimal fake of the Web Audio nodes the player uses. */
function fakeContext(state: AudioContextState = "running") {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const oscillators: { type: OscillatorType; start: ReturnType<typeof vi.fn> }[] = [];
  const gains: { gain: ReturnType<typeof param> }[] = [];
  const ctx = {
    state,
    currentTime: 1,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    createOscillator: vi.fn(() => {
      const osc = {
        type: "sine" as OscillatorType,
        frequency: param(),
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      const gain = { gain: param(), connect: vi.fn() };
      gains.push(gain);
      return gain;
    }),
  };
  return { ctx: ctx as unknown as AudioContext, raw: ctx, oscillators, gains };
}

describe("sound effects (LES-012)", () => {
  it("creates no AudioContext until the first play, then reuses it", () => {
    const { ctx } = fakeContext();
    const factory = vi.fn(() => ctx);
    const sounds = createSoundEffects(factory);
    expect(factory).not.toHaveBeenCalled();
    sounds.play("correct");
    sounds.play("incorrect");
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it.each<SoundEffect>(["correct", "incorrect", "complete"])(
    "schedules one oscillator per note of %s, through a quiet master gain",
    (effect) => {
      const { ctx, oscillators, gains } = fakeContext();
      createSoundEffects(() => ctx).play(effect);
      expect(oscillators).toHaveLength(SOUND_NOTES[effect].length);
      // gains[0] is the master; one envelope gain per note follows.
      expect(gains[0]!.gain.value).toBe(MASTER_GAIN);
      expect(gains).toHaveLength(SOUND_NOTES[effect].length + 1);
      for (const osc of oscillators) expect(osc.start).toHaveBeenCalledTimes(1);
    },
  );

  it("resumes a suspended context (autoplay policy)", () => {
    const { ctx, raw } = fakeContext("suspended");
    createSoundEffects(() => ctx).play("correct");
    expect(raw.resume).toHaveBeenCalledTimes(1);
  });

  it("is a silent no-op without Web Audio or when audio fails", () => {
    expect(() => createSoundEffects(() => null).play("correct")).not.toThrow();
    expect(() =>
      createSoundEffects(() => {
        throw new Error("no audio");
      }).play("complete"),
    ).not.toThrow();
    const { ctx, raw } = fakeContext();
    raw.createOscillator.mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() => createSoundEffects(() => ctx).play("incorrect")).not.toThrow();
  });

  it("keeps every note audible and short (no hanging tones)", () => {
    for (const notes of Object.values(SOUND_NOTES)) {
      for (const note of notes) {
        expect(note.gain).toBeGreaterThan(0);
        expect(note.gain).toBeLessThanOrEqual(1);
        expect(note.start + note.duration).toBeLessThanOrEqual(1);
      }
    }
  });
});
