/**
 * LES-021 (design v2, PD-066): RTL tests for the new layouts. Behaviour is covered by the
 * existing tests; these pin the visual structure the ticket asks for: the 2 x 2 numbered
 * MC grid, the exercise eyebrow, the prompt speaker, the slow "0.7×" button, the sheet
 * colours by result and the three coloured stat tiles with the coral streak banner.
 * Contrast is checked in the browser (axe in the e2e specs); jsdom has no colours.
 */
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTENT_RULES,
  ExerciseSchema,
  ListenExerciseSchema,
  SettingsSchema,
  WordBankTranslateExerciseSchema,
  type AnswerCheckResult,
  type ExerciseOfType,
  type LessonResult,
} from "@/contracts";
import { createFullHearts } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { createAudioPlayer } from "./audio/audio-player";
import { createSpeechFallback } from "./audio/speech-fallback";
import { ListenExercise } from "./exercises/listen/ListenExercise";
import {
  GRID_MAX_OPTION_CHARS,
  MultipleChoiceExercise,
} from "./exercises/multiple-choice/MultipleChoiceExercise";
import { EXERCISE_EYEBROWS } from "./exercises/eyebrows";
import type { ExerciseComponentProps } from "./exercises/types";
import {
  PROMPT_SPEAKER_LABEL,
  WordBankTranslateExercise,
} from "./exercises/word-bank-translate/WordBankTranslateExercise";
import { FeedbackPanel } from "./feedback/FeedbackPanel";
import { LessonPlayer } from "./player/LessonPlayer";
import { makeClock, mcOnlyLesson, SESSION_ID } from "./player/testing/fixtures";
import { toLessonResult } from "./results/result";
import { ResultsScreen } from "./results/ResultsScreen";
import {
  FIXTURE_NOW,
  RESULT_ID,
  YESTERDAY,
  nextResultId,
  perfectSummary,
} from "./results/testing/fixtures";
import {
  fakeVoice,
  stubMediaPlayback,
  stubNoSpeechSynthesis,
  stubSpeechSynthesis,
} from "./test-utils/speech-synthesis";

vi.mock("@/lib/offline", () => ({ getLocalSession: () => new Promise(() => {}) }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colours; contrast runs in the e2e specs.
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

function baseProps<T extends ExerciseComponentProps["exercise"]["type"]>(
  exercise: ExerciseOfType<T>,
): ExerciseComponentProps<T> {
  return {
    exercise,
    presentationKey: `${exercise.id}:0`,
    learningLanguage: "de",
    knownLanguage: "en",
    headingId: "exercise-heading",
    disabled: false,
    review: null,
    onAnswerChange: vi.fn(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
  } as ExerciseComponentProps<T>;
}

const mc = ExerciseSchema.parse({
  id: "de-mc",
  type: "multiple_choice",
  prompt: "Which one means 'coffee'?",
  options: [
    { id: "tee", text: "der Tee" },
    { id: "kaffee", text: "der Kaffee" },
    { id: "milch", text: "die Milch" },
    { id: "wasser", text: "das Wasser" },
  ],
  correctOptionId: "kaffee",
}) as ExerciseOfType<"multiple_choice">;

describe("Multiple choice: 2 x 2 numbered tiles (AC2)", () => {
  it("lays four short options out in two columns with number badges 1-4", async () => {
    const { container } = render(
      <MultipleChoiceExercise {...baseProps<"multiple_choice">(mc)} random={() => 0.999} />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("data-layout", "grid");
    expect(group).toHaveClass("grid-cols-2");
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(4);
    radios.forEach((radio, index) => {
      const badge = radio.firstElementChild!;
      expect(badge).toHaveAttribute("aria-hidden", "true");
      expect(badge).toHaveTextContent(String(index + 1));
      // The number badge is decorative: the name stays the German option text.
      expect(radio).toHaveAccessibleName(radio.querySelector('[lang="de"]')!.textContent!);
    });
    expect(await seriousViolations(container)).toEqual([]);
  });

  it("number keys select, and the selected tile gets the indigo ring", async () => {
    const user = userEvent.setup();
    render(<MultipleChoiceExercise {...baseProps<"multiple_choice">(mc)} random={() => 0.999} />);
    screen.getAllByRole("radio")[0]!.focus();
    await user.keyboard("2");
    const second = screen.getAllByRole("radio")[1]!;
    expect(second).toHaveAttribute("aria-checked", "true");
    expect(second).toHaveClass("border-primary", "shadow-ring-selected");
    expect(second).toHaveFocus();
  });

  it("falls back to one column when an option is too long for a tile", () => {
    const long = "Ich hätte gern einen Kaffee.";
    expect(long.length).toBeGreaterThan(GRID_MAX_OPTION_CHARS);
    const exercise = {
      ...mc,
      options: [...mc.options.slice(0, 3), { id: "lang", text: long }],
    } as ExerciseOfType<"multiple_choice">;
    render(<MultipleChoiceExercise {...baseProps<"multiple_choice">(exercise)} />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("data-layout", "list");
    expect(group).toHaveClass("grid-cols-1");
  });

  it("a single long German compound also forces the list layout", () => {
    const exercise = {
      ...mc,
      options: [...mc.options.slice(0, 3), { id: "k", text: "Krankenversicherungskarte" }],
    } as ExerciseOfType<"multiple_choice">;
    render(<MultipleChoiceExercise {...baseProps<"multiple_choice">(exercise)} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-layout", "list");
  });
});

describe("Lesson player: eyebrow above the prompt", () => {
  it("shows the uppercase exercise-type eyebrow for the current exercise", () => {
    render(
      <LessonPlayer
        lesson={mcOnlyLesson}
        learningLanguage="es"
        knownLanguage="en"
        onFinish={vi.fn()}
        onQuit={vi.fn()}
        now={makeClock()}
        createId={() => SESSION_ID}
        random={() => 0}
      />,
    );
    const eyebrow = screen.getByTestId("exercise-eyebrow");
    expect(eyebrow).toHaveTextContent(EXERCISE_EYEBROWS.multiple_choice);
    expect(eyebrow).toHaveClass("eyebrow", "text-eyebrow");
    // The close button keeps its name; the progress bar is the 16 px v2 bar.
    expect(screen.getByRole("button", { name: "Quit lesson" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Lesson progress" })).toHaveClass("h-4");
  });
});

const wordBank = WordBankTranslateExerciseSchema.parse({
  id: "de-wb",
  type: "word_bank_translate",
  direction: "to_known",
  prompt: "Ich hätte gern einen Kaffee.",
  tiles: ["I", "would", "like", "a", "coffee", "tea"],
  answers: ["I would like a coffee."],
});

describe("Word bank: speaker + prompt bubble (AC3)", () => {
  it("shows a speaker that reads the German prompt when a German voice exists", async () => {
    const synth = stubSpeechSynthesis([fakeVoice("de-DE")]);
    const user = userEvent.setup();
    const { container } = render(
      <WordBankTranslateExercise
        {...baseProps<"word_bank_translate">(wordBank)}
        speech={createSpeechFallback({ voiceTimeoutMs: 0 })}
      />,
    );
    const speaker = await screen.findByRole("button", { name: PROMPT_SPEAKER_LABEL });
    // The speaker sits outside the heading: the heading name is instruction + prompt.
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).not.toContainElement(speaker);
    expect(within(heading).getByTestId("prompt-bubble")).toHaveAttribute("lang", "de");
    await user.click(speaker);
    expect(synth.lastUtterance()?.text).toBe(wordBank.prompt);
    expect(synth.lastUtterance()?.lang).toBe("de-DE");
    expect(await seriousViolations(container)).toEqual([]);
  });

  it("has no speaker without speech synthesis (graceful, nothing else changes)", async () => {
    stubNoSpeechSynthesis();
    render(
      <WordBankTranslateExercise
        {...baseProps<"word_bank_translate">(wordBank)}
        speech={createSpeechFallback({ voiceTimeoutMs: 0 })}
      />,
    );
    await act(async () => {});
    expect(screen.queryByRole("button", { name: PROMPT_SPEAKER_LABEL })).toBeNull();
    expect(screen.getByRole("group", { name: "Word bank" })).toBeInTheDocument();
  });

  it("tiles are white 3D chips and a placed tile leaves a grey placeholder", async () => {
    stubNoSpeechSynthesis();
    const user = userEvent.setup();
    render(
      <WordBankTranslateExercise
        {...baseProps<"word_bank_translate">(wordBank)}
        speech={createSpeechFallback({ voiceTimeoutMs: 0 })}
        random={() => 0.999}
      />,
    );
    const bank = screen.getByRole("group", { name: "Word bank" });
    const tile = within(bank).getByRole("button", { name: "Add coffee" });
    expect(tile).toHaveClass("bg-surface", "shadow-3d-card");
    await user.click(tile);
    expect(within(bank).getByTestId("word-bank-placeholder")).toHaveClass("bg-disabled");
  });
});

describe("Listen: big speaker and slow button (AC4)", () => {
  it("has a 96 px 'Play audio' button and a 'Slow 0.7×' soft button", () => {
    stubMediaPlayback("resolve");
    const exercise = ListenExerciseSchema.parse({
      id: "de-li",
      type: "listen",
      audio: { src: "/audio/de/x.mp3" },
      tiles: ["guten", "Morgen", "Tag"],
      answers: ["Guten Morgen"],
    });
    render(
      <ListenExercise
        {...baseProps<"listen">(exercise)}
        audio={{
          player: createAudioPlayer(() => document.createElement("audio")),
          speech: createSpeechFallback({ voiceTimeoutMs: 0 }),
        }}
      />,
    );
    const play = screen.getByRole("button", { name: "Play audio" });
    expect(play).toHaveClass("size-24", "bg-primary");
    const slow = screen.getByRole("button", {
      name: `Slow ${CONTENT_RULES.slowPlaybackRate}× speed`,
    });
    expect(slow).toHaveTextContent(`${CONTENT_RULES.slowPlaybackRate}×`);
    expect(slow).toHaveClass("bg-primary-soft", "size-16");
  });
});

function check(outcome: "correct" | "incorrect"): AnswerCheckResult {
  const mistake = outcome === "incorrect";
  return {
    exerciseId: mc.id,
    outcome,
    correctAnswer: mistake ? "der Kaffee" : null,
    mistake,
    heartCost: mistake ? 1 : 0,
  };
}

describe("Feedback sheet colours by result (AC8-10)", () => {
  it("incorrect: red sheet, cross icon, CORRECT ANSWER eyebrow, red 3D Continue with focus", async () => {
    const { container } = render(
      <FeedbackPanel
        result={check("incorrect")}
        exercise={mc}
        learningLanguage="de"
        knownLanguage="en"
        onContinue={vi.fn()}
      />,
    );
    const sheet = screen.getByTestId("feedback-panel");
    expect(sheet).toHaveClass("bg-danger-soft", "border-danger-border");
    expect(screen.getByRole("heading", { level: 2, name: "Not quite" })).toBeInTheDocument();
    expect(within(sheet).getByTestId("feedback-icon")).toHaveClass("text-danger");
    expect(screen.getByText("Correct answer:")).toHaveClass("eyebrow", "text-danger");
    expect(screen.getByText("der Kaffee")).toHaveAttribute("lang", "de");
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveClass("bg-danger", "shadow-3d-danger");
    expect(button).toHaveFocus();
    expect(screen.getByTestId("feedback-announcement")).toHaveAttribute("aria-live", "polite");
    expect(await seriousViolations(container)).toEqual([]);
  });

  it("correct: green sheet, check icon and a green 3D Continue", async () => {
    const { container } = render(
      <FeedbackPanel
        result={check("correct")}
        exercise={mc}
        learningLanguage="de"
        knownLanguage="en"
        onContinue={vi.fn()}
        random={() => 0}
      />,
    );
    const sheet = screen.getByTestId("feedback-panel");
    expect(sheet).toHaveClass("bg-success-soft");
    expect(within(sheet).getByTestId("feedback-icon")).toHaveClass("text-success");
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveClass("bg-success", "shadow-3d-success");
    expect(button).toHaveFocus();
    expect(await seriousViolations(container)).toEqual([]);
  });
});

describe("Results: three stat tiles and the streak banner (AC12-15)", () => {
  const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });

  function seeded(results: LessonResult[]) {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.progress(result.courseId), results);
    client.setQueryData(queryKeys.hearts(), createFullHearts(FIXTURE_NOW));
    client.setQueryData(
      queryKeys.settings(),
      SettingsSchema.parse({
        courseId: result.courseId,
        dailyGoalXp: 20,
        soundEffectsEnabled: true,
        speakingExercisesEnabled: true,
        updatedAt: "2026-11-01T00:00:00.000Z",
      }),
    );
    return client;
  }

  it("Total XP gold, Time indigo, Accuracy green, Lumi celebrating in a circle", async () => {
    const yesterday = { ...result, id: nextResultId(), localDate: YESTERDAY };
    const { container } = renderWithQueryClient(
      <ResultsScreen result={result} save={() => Promise.resolve()} onContinue={vi.fn()} />,
      { client: seeded([yesterday]) },
    );
    const items = within(screen.getByRole("list", { name: "Lesson stats" })).getAllByRole(
      "listitem",
    );
    expect(items.slice(0, 3).map((li) => li.firstElementChild!.textContent)).toEqual([
      "Total XP",
      "Time",
      "Accuracy",
    ]);
    expect(items[0]).toHaveClass("border-xp-gold");
    expect(items[0]!.firstElementChild).toHaveClass("bg-xp-gold", "text-on-xp-gold");
    expect(items[1]).toHaveClass("border-primary");
    expect(items[2]).toHaveClass("border-success");
    expect(items[1]).toHaveTextContent("3:07");
    expect(items[2]).toHaveTextContent("100 %");

    // Coral streak banner: "2-day streak!" plus the existing line.
    const streak = screen.getByTestId("streak-row");
    expect(streak).toHaveClass("bg-accent-tint");
    expect(streak).toHaveTextContent("2-day streak!");
    expect(streak).toHaveTextContent("Streak extended!");

    const art = screen.getByTestId("results-art");
    expect(art).toHaveAttribute("aria-hidden", "true");
    expect(art.querySelector('svg[data-pose="celebrating"]')).not.toBeNull();
    expect(screen.queryByText(/Review my mistakes/i)).toBeNull();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Lesson saved."));
    expect(await seriousViolations(container)).toEqual([]);
  });
});
