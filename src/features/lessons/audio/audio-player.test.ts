import { afterEach, describe, expect, it, vi } from "vitest";
import { stubMediaPlayback } from "../test-utils/speech-synthesis";
import { classifyPlayError, createAudioPlayer } from "./audio-player";

function named(name: string) {
  const e = new Error(name);
  e.name = name;
  return e;
}

afterEach(() => vi.restoreAllMocks());

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
});
