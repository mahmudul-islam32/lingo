/**
 * FIX-001 regression: the player's global Enter shortcut with the real exercise
 * components (not stubs). Enter on a selected multiple-choice option checks; Enter on
 * word-bank and match-pairs tiles stays with the tile and never checks.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonSchema, type Exercise, type Lesson } from "@/contracts";
import { exerciseComponents } from "../exercises/registry";
import { LessonPlayer } from "./LessonPlayer";
import { fixtureLesson, makeClock, mcOnlyLesson, SESSION_ID } from "./testing/fixtures";

function lessonOf(exercises: Exercise[]): Lesson {
  return LessonSchema.parse({ ...mcOnlyLesson, exercises });
}

const wordBankLesson = lessonOf([
  {
    id: "wb-1",
    type: "word_bank_translate",
    direction: "to_learning",
    prompt: "Hello, how are you?",
    tiles: ["hola", "cómo", "estás", "adiós"],
    answers: ["Hola, ¿cómo estás?"],
  },
]);

const matchPairsLesson = lessonOf(
  fixtureLesson.exercises.filter((exercise) => exercise.type === "match_pairs"),
);

function setup(lesson: Lesson) {
  const user = userEvent.setup();
  render(
    <LessonPlayer
      lesson={lesson}
      learningLanguage="es"
      knownLanguage="en"
      onFinish={vi.fn()}
      onQuit={vi.fn()}
      components={exerciseComponents}
      now={makeClock()}
      createId={() => SESSION_ID}
      random={() => 0}
    />,
  );
  return { user };
}

const feedbackPanel = () => screen.queryByTestId("feedback-panel");
const checkButton = () => screen.getByRole("button", { name: "Check" });

describe("LessonPlayer Enter shortcut with real exercises (FIX-001)", () => {
  it("multiple choice: arrow to select, Enter on the focused option shows feedback", async () => {
    const { user } = setup(mcOnlyLesson);
    await user.tab();
    const group = screen.getByRole("radiogroup");
    expect(within(group).getAllByRole("radio")).toContainEqual(document.activeElement);
    await user.keyboard("{ArrowDown}");
    const selected = within(group).getByRole("radio", { checked: true });
    expect(selected).toHaveFocus();
    expect(checkButton()).toBeEnabled();

    await user.keyboard("{Enter}");
    expect(feedbackPanel()).toBeInTheDocument();
    // The option keeps its selection (no native click toggled another one).
    expect(selected).toHaveAttribute("aria-checked", "true");
  });

  it("multiple choice: Enter on an unselected option selects it without checking", async () => {
    const { user } = setup(mcOnlyLesson);
    await user.tab();
    const focused = document.activeElement as HTMLElement;
    expect(focused).toHaveAttribute("role", "radio");
    expect(focused).toHaveAttribute("aria-checked", "false");

    await user.keyboard("{Enter}");
    expect(focused).toHaveAttribute("aria-checked", "true");
    expect(feedbackPanel()).not.toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(feedbackPanel()).toBeInTheDocument();
  });

  it("multiple choice: Enter during feedback continues exactly once", async () => {
    const { user } = setup(mcOnlyLesson);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(feedbackPanel()).toBeInTheDocument();
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toHaveFocus();
    await user.keyboard("{Enter}");
    // One Continue: we're on the next exercise, still answering (no double-fire).
    expect(feedbackPanel()).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Which one means 'good morning'?",
    );
  });

  it("word bank: Enter on a tile moves it and doesn't check", async () => {
    const { user } = setup(wordBankLesson);
    await user.click(screen.getByRole("button", { name: "Add hola" }));
    expect(checkButton()).toBeEnabled();

    screen.getByRole("button", { name: "Add cómo" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove cómo" })).toBeInTheDocument();
    expect(feedbackPanel()).not.toBeInTheDocument();

    screen.getByRole("button", { name: "Remove hola" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("button", { name: "Remove hola" })).not.toBeInTheDocument();
    expect(feedbackPanel()).not.toBeInTheDocument();
  });

  it("match pairs: Enter on a tile selects it and doesn't check", async () => {
    const { user } = setup(matchPairsLesson);
    const tile = screen.getByRole("button", { name: /gato/ });
    tile.focus();
    await user.keyboard("{Enter}");
    expect(tile).toHaveAttribute("aria-pressed", "true");
    expect(feedbackPanel()).not.toBeInTheDocument();
  });
});
