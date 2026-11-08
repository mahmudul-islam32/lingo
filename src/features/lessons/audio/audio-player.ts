/**
 * Thin wrapper around one shared `HTMLAudioElement` (ARCHITECTURE §11, LES-007).
 * Injectable: tests pass their own element factory or stub `HTMLMediaElement.prototype`.
 */

/** Outcome of a play request. */
export type PlayResult =
  /** Playback started. */
  | "playing"
  /** The browser refused to start without a user gesture (`NotAllowedError`). */
  | "blocked"
  /** A newer request (or `stop()`) replaced this one before it started. */
  | "aborted"
  /** The file is missing, can't be decoded, or failed to load (incl. offline + uncached). */
  | "failed";

export interface PlayRequest {
  src: string;
  /** `playbackRate`, e.g. 1 or `CONTENT_RULES.slowPlaybackRate`. */
  rate: number;
}

export interface PlayHandlers {
  /** Playback reached the end. */
  onEnded?: () => void;
  /** The element errored after playback had started (e.g. network drop mid-file). */
  onError?: () => void;
}

export interface AudioPlayer {
  /** Plays `src` from the start at `rate`; restarts if something is already playing. */
  play(request: PlayRequest, handlers?: PlayHandlers): Promise<PlayResult>;
  /** Pauses and detaches the current request's handlers. */
  stop(): void;
}

function errorName(error: unknown): string {
  return typeof error === "object" && error !== null && "name" in error
    ? String((error as { name: unknown }).name)
    : "";
}

/** Maps an `HTMLMediaElement.play()` rejection to a result. */
export function classifyPlayError(error: unknown): PlayResult {
  const name = errorName(error);
  if (name === "NotAllowedError") return "blocked";
  if (name === "AbortError") return "aborted";
  return "failed";
}

export function createAudioPlayer(
  createElement: () => HTMLAudioElement = () => new Audio(),
): AudioPlayer {
  let element: HTMLAudioElement | null = null;
  let current: { controller: AbortController; settle: (result: PlayResult) => void } | null = null;

  function getElement(): HTMLAudioElement {
    if (!element) {
      element = createElement();
      element.preload = "auto";
    }
    return element;
  }

  function cancelCurrent() {
    if (!current) return;
    const previous = current;
    current = null;
    previous.controller.abort();
    previous.settle("aborted");
  }

  return {
    play({ src, rate }, handlers = {}) {
      cancelCurrent();
      const el = getElement();
      const controller = new AbortController();
      const { signal } = controller;

      return new Promise<PlayResult>((resolve) => {
        let settled = false;
        const settle = (result: PlayResult) => {
          if (settled) return;
          settled = true;
          resolve(result);
        };
        current = { controller, settle };

        el.addEventListener(
          "error",
          () => {
            if (!settled) settle("failed");
            else handlers.onError?.();
          },
          { signal },
        );
        el.addEventListener("ended", () => handlers.onEnded?.(), { signal });

        try {
          el.pause();
          if (el.getAttribute("src") !== src) {
            el.src = src;
          } else {
            el.currentTime = 0;
          }
          // Loading a new src resets playbackRate to defaultPlaybackRate: set both.
          el.defaultPlaybackRate = rate;
          el.playbackRate = rate;
          el.preservesPitch = true;
          const started = el.play();
          Promise.resolve(started).then(
            () => {
              if (!signal.aborted) settle("playing");
            },
            (error: unknown) => settle(signal.aborted ? "aborted" : classifyPlayError(error)),
          );
        } catch (error) {
          settle(classifyPlayError(error));
        }
      });
    },

    stop() {
      cancelCurrent();
      element?.pause();
    },
  };
}
