/**
 * The injectable audio adapter used by listen exercises: one audio player plus the
 * speech-synthesis fallback. The default is a lazily created app-wide singleton, so the
 * lesson reuses a single `HTMLAudioElement` (ARCHITECTURE §11).
 */
import { createAudioPlayer, type AudioPlayer } from "./audio-player";
import { createSpeechFallback, type SpeechFallback } from "./speech-fallback";

export interface ListenAudio {
  player: AudioPlayer;
  speech: SpeechFallback;
}

let shared: ListenAudio | null = null;

/** Shared adapter for the browser (created on first use, client-side only). */
export function getDefaultListenAudio(): ListenAudio {
  shared ??= { player: createAudioPlayer(), speech: createSpeechFallback() };
  return shared;
}
