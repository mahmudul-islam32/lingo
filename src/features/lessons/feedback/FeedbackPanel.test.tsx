import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnswerCheckResult, Exercise } from "@/contracts";
import { fixtureLesson } from "../player/testing/fixtures";
import { FeedbackPanel, correctAnswerLanguage } from "./FeedbackPanel";
import { ALL_FEEDBACK_HEADINGS, CORRECT_HEADINGS, pickCorrectHeading } from "./headings";

const mc = fixtureLesson.exercises.find((e) => e.id === "mc-2")!;
const listen = fixtureLesson.exercises.find((e) => e.id === "li-1")!;

function result(outcome: "correct" | "incorrect", correctAnswer: string | null): AnswerCheckResult {
  const mistake = outcome === "incorrect";
  return { exerciseId: "x", outcome, correctAnswer, mistake, heartCost: mistake ? 1 : 0 };
}

function renderPanel(r: AnswerCheckResult, exercise: Exercise = mc, onContinue = vi.fn()) {
  render(
    <FeedbackPanel
      result={r}
      exercise={exercise}
      learningLanguage="es"
      knownLanguage="en"
      onContinue={onContinue}
      random={() => 0.5}
    />,
  );
  return onContinue;
}

describe("pickCorrectHeading", () => {
  it("is deterministic with an injected random source", () => {
    expect(pickCorrectHeading(() => 0)).toBe("Nice work!");
    expect(pickCorrectHeading(() => 0.5)).toBe("That's right!");
    expect(pickCorrectHeading(() => 0.99)).toBe("Well done!");
    expect(pickCorrectHeading(() => 1)).toBe("Well done!");
    expect(pickCorrectHeading(() => Number.NaN)).toBe("Nice work!");
  });

  it("never uses blaming words", () => {
    for (const heading of ALL_FEEDBACK_HEADINGS) {
      expect(heading).not.toMatch(/wrong|fail|bad/i);
    }
  });
});

describe("FeedbackPanel", () => {
  it("correct state: check heading, announcement and focus on Continue", () => {
    renderPanel(result("correct", "Buenos días"));
    const heading = screen.getByRole("heading", { level: 2 });
    expect(CORRECT_HEADINGS).toContain(heading.textContent);
    expect(heading).toHaveTextContent("That's right!");
    expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("That's right!");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    expect(screen.getByTestId("feedback-panel")).toHaveAttribute("data-outcome", "correct");
    expect(screen.getByTestId("feedback-panel").className).toMatch(/bg-success-soft/);
  });

  it("incorrect state: 'Not quite', bold answer in lang=es, live-region text", () => {
    renderPanel(result("incorrect", "Buenos días"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Not quite");
    expect(screen.getByText("Correct answer:")).toBeInTheDocument();
    const answer = screen.getByText("Buenos días");
    expect(answer.tagName).toBe("STRONG");
    expect(answer).toHaveAttribute("lang", "es");
    expect(screen.getByRole("status")).toHaveTextContent("Not quite. Correct answer: Buenos días.");
    expect(screen.getByTestId("feedback-panel").className).toMatch(/bg-danger-soft/);
    expect(screen.getByTestId("feedback-panel").className).toMatch(/max-h-\[50dvh\]/);
  });

  it("Enter and Space on the focused Continue call onContinue", async () => {
    const user = userEvent.setup();
    const onContinue = renderPanel(result("incorrect", "Hola"));
    await user.keyboard("{Enter}");
    expect(onContinue).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onContinue).toHaveBeenCalledTimes(2);
  });

  it("listen variant shows the sentence that was played, in both states", () => {
    renderPanel(result("correct", "Hola, ¿qué tal?"), listen);
    expect(screen.getByText("You heard:")).toBeInTheDocument();
    expect(screen.getByText("Hola, ¿qué tal?")).toHaveAttribute("lang", "es");
    expect(screen.getByRole("status")).toHaveTextContent("You heard: Hola, ¿qué tal?");
  });

  it("listen incorrect shows both the answer and the sentence", () => {
    renderPanel(result("incorrect", "Hola, ¿qué tal?"), listen);
    expect(screen.getAllByText("Hola, ¿qué tal?")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Not quite. Correct answer: Hola, ¿qué tal? You heard: Hola, ¿qué tal?",
    );
  });

  it("uses the known language for answers of to_known translations", () => {
    const toKnown: Exercise = {
      id: "wb-1",
      type: "word_bank_translate",
      direction: "to_known",
      prompt: "Buenos días",
      tiles: ["Good", "morning", "night"],
      answers: ["Good morning"],
    };
    expect(correctAnswerLanguage(toKnown, "es", "en")).toBe("en");
    expect(correctAnswerLanguage({ ...toKnown, direction: "to_learning" }, "es", "en")).toBe("es");
    expect(correctAnswerLanguage(mc, "es", "en")).toBe("es");
  });
});
