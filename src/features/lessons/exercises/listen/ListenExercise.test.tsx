import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTENT_RULES,
  ListenExerciseSchema,
  type AnswerInputOfType,
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

/** Real adapters over stubbed browser APIs; one fresh audio element per test. */
function makeAudio(): { audio: ListenAudio; elements: HTMLAudioElement[] } {
  const elements: HTMLAudioElement[] = [];
  return {
    elements,
    audio: {
      player: createAudioPlayer(() => {
        const el = document.createElement("audio");
        elements.push(el);
        return el;
      }),
      speech: createSpeechFallback({ voiceTimeoutMs: 30 }),
    },
  };
}

function setup(
  behaviour: MediaPlayBehaviour | (() => MediaPlayBehaviour),
  { data = exercise, disabled = false }: { data?: ListenData; disabled?: boolean } = {},
) {
  const playSpy = stubMediaPlayback(behaviour);
  const { audio, elements } = makeAudio();
  const props: ExerciseComponentProps<"listen"> = {
    exercise: data,
    presentationKey: `${data.id}:0`,
    learningLanguage: "es",
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

  it("with no file and no Spanish voice, shows the message and Skip reports audio_unavailable", async () => {
    stubSpeechSynthesis([fakeVoice("en-GB")]);
    const { props, user } = setup("error");
    expect(await screen.findByText("Audio isn't available right now.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
    // Check stays disabled: the answer is cleared and the tiles are locked.
    expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
    for (const tile of within(screen.getByRole("group", { name: "Word bank" })).getAllByRole(
      "button",
    )) {
      expect(tile).toBeDisabled();
    }
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(props.onSkip).toHaveBeenCalledWith("audio_unavailable");
  });

  it("treats a browser without speech synthesis like no voice", async () => {
    stubNoSpeechSynthesis();
    const { props, user } = setup("error");
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
