import { afterEach, describe, expect, it, vi } from "vitest";
import { stubMediaPlayback } from "../test-utils/speech-synthesis";
import { AUDIO_LOAD_TIMEOUT_MS, classifyPlayError, createAudioPlayer } from "./audio-player";

function named(name: string) {
  const e = new Error(name);
  e.name = name;
  return e;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("classifyPlayError", () => {
  it("maps play() rejections", () => {
    expect(classifyPlayError(named("NotAllowedError"))).toBe("blocked");
    expect(classifyPlayError(named("AbortError"))).toBe("aborted");
    expect(classifyPlayError(named("NotSupportedError"))).toBe("failed");
    expect(classifyPlayError("boom")).toBe("failed");
  });
});

describe("createAudioPlayer", () => {
  function make() {
    const elements: HTMLAudioElement[] = [];
    const player = createAudioPlayer(() => {
      const el = document.createElement("audio");
      elements.push(el);
      return el;
    });
    return { player, elements };
  }

  it("uses one shared element, sets src, rate and preservesPitch", async () => {
    stubMediaPlayback("resolve");
    const { player, elements } = make();
    await expect(player.play({ src: "/audio/es/a.mp3", rate: 0.75 })).resolves.toBe("playing");
    await expect(player.play({ src: "/audio/es/b.mp3", rate: 1 })).resolves.toBe("playing");
    expect(elements).toHaveLength(1);
    const el = elements[0] as HTMLAudioElement;
    expect(el.getAttribute("src")).toBe("/audio/es/b.mp3");
    expect(el.playbackRate).toBe(1);
    expect(el.defaultPlaybackRate).toBe(1);
    expect(el.preservesPitch).toBe(true);
  });

  it("restarts the same file from 0", async () => {
    stubMediaPlayback("resolve");
    const { player, elements } = make();
    await player.play({ src: "/audio/es/a.mp3", rate: 1 });
    const el = elements[0] as HTMLAudioElement;
    el.currentTime = 2;
    await player.play({ src: "/audio/es/a.mp3", rate: 1 });
    expect(el.currentTime).toBe(0);
  });

  it("resolves blocked on NotAllowedError and failed on an error event", async () => {
    stubMediaPlayback("block");
    const { player } = make();
    await expect(player.play({ src: "/audio/es/a.mp3", rate: 1 })).resolves.toBe("blocked");
    vi.restoreAllMocks();
    stubMediaPlayback("error");
    await expect(player.play({ src: "/audio/es/b.mp3", rate: 1 })).resolves.toBe("failed");
  });

  it("aborts a pending request when a new one starts or on stop()", async () => {
    stubMediaPlayback("pending");
    const { player } = make();
    const first = player.play({ src: "/audio/es/a.mp3", rate: 1 });
    const second = player.play({ src: "/audio/es/a.mp3", rate: 1 });
    await expect(first).resolves.toBe("aborted");
    player.stop();
    await expect(second).resolves.toBe("aborted");
  });

  it("reports ended and later errors through the handlers", async () => {
    stubMediaPlayback("resolve");
    const { player, elements } = make();
    const onEnded = vi.fn();
    const onError = vi.fn();
    await player.play({ src: "/audio/es/a.mp3", rate: 1 }, { onEnded, onError });
    const el = elements[0] as HTMLAudioElement;
    el.dispatchEvent(new Event("ended"));
    el.dispatchEvent(new Event("error"));
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    // Handlers of a replaced request are detached.
    await player.play({ src: "/audio/es/b.mp3", rate: 1 });
    el.dispatchEvent(new Event("ended"));
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("treats a synchronous throw from play() as failed", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => {
      throw new Error("nope");
    });
    const { player } = make();
    await expect(player.play({ src: "/audio/es/a.mp3", rate: 1 })).resolves.toBe("failed");
  });

  describe("load timeout (FIX-010)", () => {
    it("is about 3 s", () => {
      expect(AUDIO_LOAD_TIMEOUT_MS).toBe(3000);
    });

    it("resolves failed (like an error) when the clip has not started after the timeout", async () => {
      vi.useFakeTimers();
      stubMediaPlayback("pending");
      const pause = vi.mocked(HTMLMediaElement.prototype.pause);
      const { player, elements } = make();
      const onError = vi.fn();
      let outcome: string | undefined;
      void player.play({ src: "/audio/es/a.mp3", rate: 1 }, { onError }).then((r) => {
        outcome = r;
      });
      const pausesBefore = pause.mock.calls.length;

      await vi.advanceTimersByTimeAsync(AUDIO_LOAD_TIMEOUT_MS - 1);
      expect(outcome).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1);
      expect(outcome).toBe("failed");
      // Paused so a late clip never plays over the speech fallback.
      expect(pause.mock.calls.length).toBeGreaterThan(pausesBefore);
      // The timed-out request is detached: a late error is not reported.
      elements[0]!.dispatchEvent(new Event("error"));
      expect(onError).not.toHaveBeenCalled();
    });

    it("uses a custom timeout and does not fire after playback started", async () => {
      vi.useFakeTimers();
      stubMediaPlayback("resolve");
      const { player } = make();
      await expect(player.play({ src: "/audio/es/a.mp3", rate: 1 })).resolves.toBe("playing");
      vi.restoreAllMocks();
      stubMediaPlayback("pending");
      const slow = createAudioPlayer(() => document.createElement("audio"), {
        loadTimeoutMs: 500,
      });
      const result = slow.play({ src: "/audio/es/b.mp3", rate: 1 });
      await vi.advanceTimersByTimeAsync(500);
      await expect(result).resolves.toBe("failed");
    });

    it("a replaced request's timer never touches the newer request", async () => {
      vi.useFakeTimers();
      stubMediaPlayback("pending");
      const pause = vi.mocked(HTMLMediaElement.prototype.pause);
      const { player } = make();
      const first = player.play({ src: "/audio/es/a.mp3", rate: 1 });
      await vi.advanceTimersByTimeAsync(2000);
      let second: string | undefined;
      void player.play({ src: "/audio/es/b.mp3", rate: 1 }).then((r) => {
        second = r;
      });
      await expect(first).resolves.toBe("aborted");
      const pauses = pause.mock.calls.length;

      // The first request's deadline (t = 3 s) passes: nothing happens to the second.
      await vi.advanceTimersByTimeAsync(AUDIO_LOAD_TIMEOUT_MS - 1);
      expect(second).toBeUndefined();
      expect(pause.mock.calls.length).toBe(pauses);

      // Its own deadline (t = 5 s) fails it.
      await vi.advanceTimersByTimeAsync(1);
      expect(second).toBe("failed");
    });

    it("stop() before the deadline: aborted, and no late failure", async () => {
      vi.useFakeTimers();
      stubMediaPlayback("pending");
      const pause = vi.mocked(HTMLMediaElement.prototype.pause);
      const { player } = make();
      const request = player.play({ src: "/audio/es/a.mp3", rate: 1 });
      player.stop();
      await expect(request).resolves.toBe("aborted");
      const pauses = pause.mock.calls.length;
      await vi.advanceTimersByTimeAsync(AUDIO_LOAD_TIMEOUT_MS * 2);
      expect(pause.mock.calls.length).toBe(pauses);
    });
  });
});
