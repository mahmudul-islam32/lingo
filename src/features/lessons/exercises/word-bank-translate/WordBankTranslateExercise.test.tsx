import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  WordBankTranslateExerciseSchema,
  type AnswerInputOfType,
  type WordBankTranslateExercise as WordBankTranslateData,
} from "@/contracts";
import type { ExerciseComponentProps } from "../types";
import { WordBankTranslateExercise } from "./WordBankTranslateExercise";

const toLearning: WordBankTranslateData = WordBankTranslateExerciseSchema.parse({
  id: "ex-hola",
  type: "word_bank_translate",
  direction: "to_learning",
  prompt: "Hello, how are you?",
  tiles: ["hola", "cómo", "estás", "adiós", "bien", "días"],
  answers: ["Hola, ¿cómo estás?"],
});

const toKnown: WordBankTranslateData = WordBankTranslateExerciseSchema.parse({
  id: "ex-bien",
  type: "word_bank_translate",
  direction: "to_known",
  prompt: "Bien, gracias.",
  tiles: ["fine", "thanks", "thank", "you", "hello", "night"],
  answers: ["Fine, thanks.", "Fine, thank you."],
});

const keepOrder = () => 0.999;

function setup(exercise: WordBankTranslateData, overrides: Partial<ExerciseComponentProps<"word_bank_translate">> = {}) {
  const props: ExerciseComponentProps<"word_bank_translate"> = {
    exercise,
    presentationKey: `${exercise.id}:0`,
    learningLanguage: "es",
    knownLanguage: "en",
    headingId: "exercise-heading",
    disabled: false,
    review: null,
    onAnswerChange: vi.fn<(answer: AnswerInputOfType<"word_bank_translate"> | null) => void>(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
    ...overrides,
  };
  const user = userEvent.setup();
  const view = render(<WordBankTranslateExercise {...props} random={keepOrder} />);
  return { props, user, view };
}

describe("WordBankTranslateExercise", () => {
  it("shows the instruction and the source sentence in the focusable prompt heading", () => {
    setup(toLearning);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "exercise-heading");
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading).toHaveTextContent("Translate this sentence");
    expect(within(heading).getByText("Hello, how are you?")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Your answer" })).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Word bank" })).getAllByRole("button")).toHaveLength(6);
  });

  it("shuffles the tiles from the content", () => {
    const random = vi.fn(() => 0);
    render(
      <WordBankTranslateExercise
        exercise={toLearning}
        presentationKey="k"
        learningLanguage="es"
        knownLanguage="en"
        headingId="h"
        disabled={false}
        review={null}
        onAnswerChange={vi.fn()}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
        random={random}
      />,
    );
    expect(random).toHaveBeenCalled();
    const labels = within(screen.getByRole("group", { name: "Word bank" }))
      .getAllByRole("button")
      .map((b) => b.textContent);
    expect(labels).not.toEqual(toLearning.tiles);
    expect([...labels].sort()).toEqual([...toLearning.tiles].sort());
  });

  it("to_learning: prompt in the known language, tiles in the learning language", () => {
    setup(toLearning);
    expect(screen.getByText("Hello, how are you?")).toHaveAttribute("lang", "en");
    for (const tile of screen.getAllByRole("button")) expect(tile).toHaveAttribute("lang", "es");
  });

  it("to_known: prompt in the learning language, tiles in the known language", () => {
    setup(toKnown);
    expect(screen.getByText("Bien, gracias.")).toHaveAttribute("lang", "es");
    for (const tile of screen.getAllByRole("button")) expect(tile).toHaveAttribute("lang", "en");
  });

  it("reports the answer when a tile is placed and null when the line is empty again", async () => {
    const { props, user } = setup(toLearning);
    await user.click(screen.getByRole("button", { name: "Add hola" }));
    await user.click(screen.getByRole("button", { name: "Add cómo" }));
    expect(props.onAnswerChange).toHaveBeenLastCalledWith({
      type: "word_bank_translate",
      tiles: ["hola", "cómo"],
    });
    await user.click(screen.getByRole("button", { name: "Remove hola" }));
    await user.click(screen.getByRole("button", { name: "Remove cómo" }));
    expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
    expect(props.onSkip).not.toHaveBeenCalled();
    expect(props.onComplete).not.toHaveBeenCalled();
  });

  it("locks the tiles when disabled", async () => {
    const { props, user } = setup(toLearning, { disabled: true });
    const tile = screen.getByRole("button", { name: "Add hola" });
    expect(tile).toBeDisabled();
    await user.click(tile);
    expect(props.onAnswerChange).not.toHaveBeenCalled();
  });
});
