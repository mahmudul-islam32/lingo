import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTENT_RULES,
  ListenExerciseSchema,
  type AnswerInputOfType,
  type LanguageCode,
  type ListenExercise as ListenData,
} from "@/contracts";
import { createAudioPlayer } from "../../audio/audio-player";
import type { ListenAudio } from "../../audio/listen-audio";
import { createSpeechFallback } from "../../audio/speech-fallback";
import {
  fakeVoice,
  stubMediaPlayback,
  stubNoSpeechSynthesis,
  stubSpeechSynthesis,
  type MediaPlayBehaviour,
} from "../../test-utils/speech-synthesis";
import type { ExerciseComponentProps } from "../types";
import { ListenExercise } from "./ListenExercise";

const exercise: ListenData = ListenExerciseSchema.parse({
  id: "ex-listen",
  type: "listen",
  audio: { src: "/audio/es/buenas-tardes-como-estas.mp3" },
  tiles: ["buenas", "tardes", "cómo", "estás", "noches"],
  answers: ["Buenas tardes, ¿cómo estás?"],
});

const withSlowFile: ListenData = ListenExerciseSchema.parse({
  ...exercise,
  audio: { src: "/audio/es/buenos-dias.mp3", slowSrc: "/audio/es/buenos-dias-slow.mp3" },
  tiles: ["buenos", "días", "noches"],
  answers: ["Buenos días"],
});

/** A German listen exercise as authored in en-de A1 (capitalised nouns, umlaut, `!`). */
const german: ListenData = ListenExerciseSchema.parse({
  id: "de-a1-u04-l1-ex05",
  type: "listen",
  audio: { src: "/audio/de/a1/u04/de-a1-u04-l1-ex05.mp3" },
  tiles: ["guten", "Morgen", "zwei", "Brötchen", "bitte", "drei", "Brot", "Tag"],
  answers: ["Guten Morgen! Zwei Brötchen, bitte."],
});

/** Real adapters over stubbed browser APIs; one fresh audio element per test. */
function makeAudio(voiceTimeoutMs = 30): { audio: ListenAudio; elements: HTMLAudioElement[] } {
  const elements: HTMLAudioElement[] = [];
  return {
    elements,
    audio: {
      player: createAudioPlayer(() => {
        const el = document.createElement("audio");
        elements.push(el);
        return el;
      }),
      speech: createSpeechFallback({ voiceTimeoutMs }),
    },
  };
}

function setup(
  behaviour: MediaPlayBehaviour | (() => MediaPlayBehaviour),
  {
    data = exercise,
    disabled = false,
    learningLanguage = "es",
    voiceTimeoutMs,
  }: {
    data?: ListenData;
    disabled?: boolean;
    learningLanguage?: LanguageCode;
    voiceTimeoutMs?: number;
  } = {},
) {
  const playSpy = stubMediaPlayback(behaviour);
  const { audio, elements } = makeAudio(voiceTimeoutMs);
  const props: ExerciseComponentProps<"listen"> = {
    exercise: data,
    presentationKey: `${data.id}:0`,
    learningLanguage,
    knownLanguage: "en",
    headingId: "exercise-heading",
    disabled,
    review: null,
    onAnswerChange: vi.fn<(answer: AnswerInputOfType<"listen"> | null) => void>(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
  };
  const user = userEvent.setup();
  const view = render(<ListenExercise {...props} audio={audio} random={() => 0.999} />);
  const element = () => elements[0] as HTMLAudioElement;
  return { props, user, view, playSpy, element };
}

const playButton = () => screen.getByRole("button", { name: "Play audio" });
const slowButton = () => screen.getByRole("button", { name: "Play slowly" });

afterEach(() => {
  cleanup(); // unmount (stops audio) while the media stubs are still installed
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ListenExercise", () => {
  it("shows the instruction, Play, Slow and the Spanish word bank", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    setup("resolve");
    const heading = screen.getByRole("heading", { level: 2, name: "Tap what you hear" });
    expect(heading).toHaveAttribute("id", "exercise-heading");
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(playButton()).toBeInTheDocument();
    expect(slowButton()).toHaveTextContent(`Slow${CONTENT_RULES.slowPlaybackRate}×`);
    const bank = screen.getByRole("group", { name: "Word bank" });
    for (const tile of within(bank).getAllByRole("button"))
      expect(tile).toHaveAttribute("lang", "es");
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
  });

  it("never shows the Spanish sentence before Check", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { view } = setup("resolve");
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    expect(view.container).not.toHaveTextContent(/Buenas tardes, ¿cómo estás\?/);
    expect(view.container).not.toHaveTextContent(/buenas tardes cómo estás/i);
  });

  it("autoplays once at normal speed when the browser allows it", async () => {
    const speech = stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { playSpy, element } = setup("resolve");
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    expect(element().getAttribute("src")).toBe(exercise.audio.src);
    expect(element().playbackRate).toBe(1);
    expect(element().preservesPitch).toBe(true);
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it("stays silent and usable when autoplay is blocked", async () => {
    const speech = stubSpeechSynthesis([fakeVoice("es-ES")]);
    let mode: MediaPlayBehaviour = "block";
    const { playSpy, user } = setup(() => mode);
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    expect(screen.queryByText("Audio isn't available right now.")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(speech.speak).not.toHaveBeenCalled();

    mode = "resolve";
    await user.click(playButton());
    expect(playSpy).toHaveBeenCalledTimes(2);
  });

  it("shows a spinner and aria-busy on Play while the file is loading", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    setup("pending");
    expect(playButton()).toHaveAttribute("aria-busy", "true");
    expect(within(playButton()).getByText("Loading")).toBeInTheDocument();
  });

  it("Slow plays the same file at CONTENT_RULES.slowPlaybackRate", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { playSpy, user, element } = setup("resolve");
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await user.click(slowButton());
    expect(playSpy).toHaveBeenCalledTimes(2);
    expect(element().getAttribute("src")).toBe(exercise.audio.src);
    expect(element().playbackRate).toBe(CONTENT_RULES.slowPlaybackRate);
    await user.click(playButton());
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(3));
    expect(element().playbackRate).toBe(1);
  });

  it("Slow uses the dedicated slow file at 1× when the content provides one", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { playSpy, user, element } = setup("resolve", { data: withSlowFile });
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await user.click(slowButton());
    expect(element().getAttribute("src")).toBe(withSlowFile.audio.slowSrc);
    expect(element().playbackRate).toBe(1);
  });

  it("restarts from the beginning when pressed while playing", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { playSpy, user, element } = setup("resolve");
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    const pausesBefore = pause.mock.calls.length;
    element().currentTime = 1.5;
    await user.click(playButton());
    expect(playSpy).toHaveBeenCalledTimes(2);
    expect(pause.mock.calls.length).toBeGreaterThan(pausesBefore);
    expect(element().currentTime).toBe(0);
  });

  it("falls back to an es-* speech voice when the file fails (rate 1, slow constant)", async () => {
    const speech = stubSpeechSynthesis([fakeVoice("en-US"), fakeVoice("es-MX")]);
    const { user, playSpy } = setup("error");
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    const first = speech.lastUtterance();
    expect(first?.text).toBe(exercise.answers[0]);
    expect(first?.lang).toBe("es-MX");
    expect(first?.voice?.lang).toBe("es-MX");
    expect(first?.rate).toBe(1);
    expect(screen.queryByText("Audio isn't available right now.")).not.toBeInTheDocument();
    expect(playButton()).not.toHaveAttribute("aria-busy");

    await user.click(slowButton());
    expect(speech.speak).toHaveBeenCalledTimes(2);
    expect(speech.lastUtterance()?.rate).toBe(CONTENT_RULES.slowPlaybackRate);
    // The file is not retried once it failed; speech restarts (cancel + speak).
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(speech.cancel).toHaveBeenCalled();
    await user.click(playButton());
    expect(speech.lastUtterance()?.rate).toBe(1);
  });

  it("waits for voices that load late (voiceschanged)", async () => {
    const speech = stubSpeechSynthesis([]);
    const playSpy = stubMediaPlayback("error");
    const audio: ListenAudio = {
      player: createAudioPlayer(() => document.createElement("audio")),
      speech: createSpeechFallback({ voiceTimeoutMs: 5_000 }),
    };
    render(
      <ListenExercise
        exercise={exercise}
        presentationKey="k"
        learningLanguage="es"
        knownLanguage="en"
        headingId="h"
        disabled={false}
        review={null}
        onAnswerChange={vi.fn()}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
        audio={audio}
      />,
    );
    await waitFor(() => expect(playSpy).toHaveBeenCalled());
    await waitFor(() => expect(playButton()).toHaveAttribute("aria-busy", "true"));
    act(() => speech.setVoices([fakeVoice("es-ES")]));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    expect(speech.lastUtterance()?.lang).toBe("es-ES");
  });

  // Language-agnostic (LES-014): no voice of the learning language → PD-007 skip. The voice
  // timeout is 0 so `findVoice` resolves at once (no real-time race with `findBy*`), and
  // the answer reset (a passive effect after the async status update) is awaited.
  it.each([
    { learningLanguage: "de", data: german, voices: ["en-GB", "es-ES", "fr-FR"] },
    { learningLanguage: "es", data: exercise, voices: ["en-GB", "de-DE"] },
  ])(
    "with no file and no $learningLanguage voice, shows the message and Skip reports audio_unavailable",
    async ({ learningLanguage, data, voices }) => {
      const speech = stubSpeechSynthesis(voices.map((lang) => fakeVoice(lang)));
      const { props, user } = setup("error", { data, learningLanguage, voiceTimeoutMs: 0 });
      expect(await screen.findByText("Audio isn't available right now.")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
      expect(speech.speak).not.toHaveBeenCalled();
      // Check stays disabled: the answer is cleared and the tiles are locked.
      await waitFor(() => expect(props.onAnswerChange).toHaveBeenLastCalledWith(null));
      for (const tile of within(screen.getByRole("group", { name: "Word bank" })).getAllByRole(
        "button",
      )) {
        expect(tile).toBeDisabled();
      }
      await user.click(screen.getByRole("button", { name: "Skip" }));
      expect(props.onSkip).toHaveBeenCalledWith("audio_unavailable");
    },
  );

  it("treats a browser without speech synthesis like no voice", async () => {
    stubNoSpeechSynthesis();
    const { props, user } = setup("error", { voiceTimeoutMs: 0 });
    await user.click(await screen.findByRole("button", { name: "Skip" }));
    expect(props.onSkip).toHaveBeenCalledWith("audio_unavailable");
  });

  it("reports the ordered tiles as a listen answer", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { props, user } = setup("resolve");
    await user.click(screen.getByRole("button", { name: "Add buenas" }));
    await user.click(screen.getByRole("button", { name: "Add tardes" }));
    expect(props.onAnswerChange).toHaveBeenLastCalledWith({
      type: "listen",
      tiles: ["buenas", "tardes"],
    });
    await user.click(screen.getByRole("button", { name: "Remove buenas" }));
    await user.click(screen.getByRole("button", { name: "Remove tardes" }));
    expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
  });

  it("Play and Slow are reachable with Tab and work with Enter and Space", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { user, playSpy, element } = setup("resolve");
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    await user.tab();
    expect(playButton()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(playSpy).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
    await user.tab();
    expect(slowButton()).toHaveFocus();
    await user.keyboard(" ");
    expect(playSpy).toHaveBeenCalledTimes(3);
    expect(element().playbackRate).toBe(CONTENT_RULES.slowPlaybackRate);
    await user.tab();
    expect(screen.getByRole("group", { name: "Your answer" })).toHaveFocus();
  });

  it("Play and Slow are at least 48 px and side by side", () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    setup("pending");
    expect(playButton()).toHaveClass("min-h-12", "size-20");
    expect(slowButton()).toHaveClass("min-h-12", "min-w-12");
    expect(playButton().parentElement).toBe(slowButton().parentElement);
    expect(playButton().parentElement).toHaveClass("flex", "items-center");
  });

  it("locks Play, Slow and tiles when disabled", async () => {
    stubSpeechSynthesis([fakeVoice("es-ES")]);
    setup("resolve", { disabled: true });
    expect(playButton()).toBeDisabled();
    expect(slowButton()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add buenas" })).toBeDisabled();
  });

  it("stops audio and speech on unmount", async () => {
    const speech = stubSpeechSynthesis([fakeVoice("es-ES")]);
    const { view, playSpy } = setup("resolve");
    await waitFor(() => expect(playSpy).toHaveBeenCalled());
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    const before = pause.mock.calls.length;
    view.unmount();
    expect(pause.mock.calls.length).toBeGreaterThan(before);
    expect(speech.cancel).toHaveBeenCalled();
  });
});

describe("ListenExercise in German (LES-014, PD-034)", () => {
  async function fallbackVoice(voices: SpeechSynthesisVoice[]) {
    const speech = stubSpeechSynthesis(voices);
    setup("error", { data: german, learningLanguage: "de" });
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    return speech.lastUtterance();
  }

  it("prefers de-DE over the default de-CH voice", async () => {
    const utterance = await fallbackVoice([
      fakeVoice("de-CH", { default: true }),
      fakeVoice("de-DE", { localService: false }),
    ]);
    expect(utterance?.voice?.lang).toBe("de-DE");
    expect(utterance?.lang).toBe("de-DE");
    expect(utterance?.text).toBe("Guten Morgen! Zwei Brötchen, bitte.");
  });

  it("falls back to any de-* voice (de-AT) when there is no de-DE voice", async () => {
    const utterance = await fallbackVoice([
      fakeVoice("en-US", { default: true }),
      fakeVoice("de-AT"),
    ]);
    expect(utterance?.voice?.lang).toBe("de-AT");
  });

  it("never picks a Spanish or English voice for German", async () => {
    const speech = stubSpeechSynthesis([
      fakeVoice("es-ES", { default: true }),
      fakeVoice("en-US"),
      fakeVoice("en-DE"),
    ]);
    setup("error", { data: german, learningLanguage: "de", voiceTimeoutMs: 0 });
    expect(await screen.findByText("Audio isn't available right now.")).toBeInTheDocument();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it("speaks German at 1× and at CONTENT_RULES.slowPlaybackRate for Slow", async () => {
    const speech = stubSpeechSynthesis([fakeVoice("de-DE")]);
    const { user } = setup("error", { data: german, learningLanguage: "de" });
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    expect(speech.lastUtterance()?.rate).toBe(1);
    await user.click(slowButton());
    expect(speech.lastUtterance()?.rate).toBe(CONTENT_RULES.slowPlaybackRate);
    expect(speech.lastUtterance()?.voice?.lang).toBe("de-DE");
  });

  it("Slow plays the German file at CONTENT_RULES.slowPlaybackRate", async () => {
    stubSpeechSynthesis([fakeVoice("de-DE")]);
    const { playSpy, user, element } = setup("resolve", { data: german, learningLanguage: "de" });
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    await user.click(slowButton());
    expect(element().getAttribute("src")).toBe(german.audio.src);
    expect(element().playbackRate).toBe(CONTENT_RULES.slowPlaybackRate);
  });

  it("renders the tiles in authored case with lang=de", async () => {
    stubSpeechSynthesis([fakeVoice("de-DE")]);
    setup("resolve", { data: german, learningLanguage: "de" });
    const bank = screen.getByRole("group", { name: "Word bank" });
    const texts = within(bank)
      .getAllByRole("button")
      .map((tile) => {
        expect(tile).toHaveAttribute("lang", "de");
        return tile.textContent;
      });
    expect(texts.sort()).toEqual([...german.tiles].sort());
    expect(screen.getByRole("button", { name: "Add Brötchen" })).toHaveTextContent(/^Brötchen$/);
    expect(screen.getByRole("button", { name: "Add guten" })).toHaveTextContent(/^guten$/);
    await waitFor(() => expect(playButton()).not.toHaveAttribute("aria-busy"));
  });
});
