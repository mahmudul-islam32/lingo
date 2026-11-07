import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnswerCheckResult, MultipleChoiceExercise as MultipleChoiceData } from "@/contracts";
import { MultipleChoiceExercise, type MultipleChoiceExerciseProps } from "./MultipleChoiceExercise";

const exercise: MultipleChoiceData = {
  id: "mc-water",
  type: "multiple_choice",
  prompt: "Which one means 'water'?",
  options: [
    { id: "agua", text: "agua" },
    { id: "leche", text: "leche" },
    { id: "pan", text: "pan" },
    { id: "cafe", text: "café" },
  ],
  correctOptionId: "agua",
};

/** `random` that always returns ~1 keeps Fisher–Yates in content order. */
const identity = () => 0.999;

function setup(overrides: Partial<MultipleChoiceExerciseProps> = {}) {
  const props: MultipleChoiceExerciseProps = {
    exercise,
    presentationKey: "mc-water:0",
    learningLanguage: "es",
    knownLanguage: "en",
    headingId: "exercise-heading",
    disabled: false,
    review: null,
    onAnswerChange: vi.fn(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
    random: identity,
    ...overrides,
  };
  const utils = render(<MultipleChoiceExercise {...props} />);
  return { ...utils, props, user: userEvent.setup() };
}

function radios() {
  return screen.getAllByRole("radio");
}

function optionNames() {
  return radios().map((radio) => radio.textContent?.replace(/^\d/, "") ?? "");
}

const correctReview: AnswerCheckResult = {
  exerciseId: "mc-water",
  outcome: "incorrect",
  correctAnswer: "agua",
  mistake: true,
  heartCost: 1,
};

describe("MultipleChoiceExercise", () => {
  describe("render (AC1, AC9, AC10)", () => {
    it("shows the prompt as a focusable h2 with the given id", () => {
      setup();
      const heading = screen.getByRole("heading", { level: 2, name: exercise.prompt });
      expect(heading).toHaveAttribute("id", "exercise-heading");
      expect(heading).toHaveAttribute("tabindex", "-1");
    });

    it("shows every option from the content", () => {
      setup();
      expect(radios()).toHaveLength(4);
      for (const option of exercise.options) {
        expect(screen.getByRole("radio", { name: option.text })).toBeInTheDocument();
      }
    });

    it("supports 3 options", () => {
      setup({ exercise: { ...exercise, options: exercise.options.slice(0, 3) } });
      expect(radios()).toHaveLength(3);
    });

    it("marks the prompt with the known language and options with the learning language", () => {
      setup();
      expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("lang", "en");
      for (const radio of radios()) {
        expect(radio.querySelector('[lang="es"]')).not.toBeNull();
      }
      expect(screen.getByText("café")).toHaveAttribute("lang", "es");
    });

    it("renders full-width options at least 48px tall that wrap long text", () => {
      setup();
      for (const radio of radios()) {
        expect(radio).toHaveClass("w-full", "min-h-12");
        expect(radio.querySelector(".break-words")).not.toBeNull();
      }
    });
  });

  describe("shuffle (AC2)", () => {
    it("orders options with the injected random source", () => {
      setup({ random: () => 0 });
      // Fisher–Yates with random() = 0 on [agua, leche, pan, café].
      expect(optionNames()).toEqual(["leche", "pan", "café", "agua"]);
    });

    it("reshuffles on a new mount (re-queued presentation)", () => {
      const first = setup({ random: identity });
      expect(optionNames()).toEqual(["agua", "leche", "pan", "café"]);
      first.unmount();
      setup({ presentationKey: "mc-water:1", random: () => 0 });
      expect(optionNames()).toEqual(["leche", "pan", "café", "agua"]);
    });

    it("keeps the order stable across re-renders of the same mount", () => {
      let calls = 0;
      const random = () => {
        calls += 1;
        return 0.5;
      };
      const { rerender, props } = setup({ random });
      const before = optionNames();
      const callsAfterMount = calls;
      rerender(<MultipleChoiceExercise {...props} disabled />);
      expect(optionNames()).toEqual(before);
      expect(calls).toBe(callsAfterMount);
    });
  });

  describe("mouse selection (AC3, AC6, AC7)", () => {
    it("selects one option at a time and reports it", async () => {
      const { user, props } = setup();
      await user.click(screen.getByRole("radio", { name: "leche" }));
      expect(screen.getByRole("radio", { name: "leche" })).toHaveAttribute("aria-checked", "true");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "multiple_choice",
        optionId: "leche",
      });

      await user.click(screen.getByRole("radio", { name: "pan" }));
      expect(screen.getByRole("radio", { name: "pan" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("radio", { name: "leche" })).toHaveAttribute(
        "aria-checked",
        "false",
      );
      expect(radios().filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "multiple_choice",
        optionId: "pan",
      });
      expect(props.onAnswerChange).toHaveBeenCalledTimes(2);
    });

    it("does not report again when the selected option is clicked again", async () => {
      const { user, props } = setup();
      await user.click(screen.getByRole("radio", { name: "pan" }));
      await user.click(screen.getByRole("radio", { name: "pan" }));
      expect(props.onAnswerChange).toHaveBeenCalledTimes(1);
    });

    it("shows a check marker and a stronger border on the selected option", async () => {
      const { user } = setup();
      const pan = screen.getByRole("radio", { name: "pan" });
      expect(pan.querySelector('[data-marker="none"]')).not.toBeNull();
      await user.click(pan);
      const marker = pan.querySelector('[data-marker="selected"]');
      expect(marker).not.toBeNull();
      expect(marker?.querySelector("svg")).not.toBeNull();
      expect(pan).toHaveClass("border-primary");
      expect(screen.getByRole("radio", { name: "agua" })).not.toHaveClass("border-primary");
    });
  });

  describe("keyboard (AC4, AC5)", () => {
    it("is a radiogroup labelled by the prompt", () => {
      setup();
      const group = screen.getByRole("radiogroup", { name: exercise.prompt });
      expect(group).toHaveAttribute("aria-labelledby", "exercise-heading");
    });

    it("uses a roving tabindex: one tab stop, Tab leaves the group", async () => {
      const { user } = setup();
      render(<button type="button">after</button>);
      expect(radios().map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
      await user.tab();
      expect(screen.getByRole("radio", { name: "agua" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
    });

    it("arrow keys move focus and selection, wrapping around", async () => {
      const { user, props } = setup();
      await user.tab();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "agua" })).toHaveAttribute("aria-checked", "true");
      await user.keyboard("{ArrowDown}");
      const leche = screen.getByRole("radio", { name: "leche" });
      expect(leche).toHaveAttribute("aria-checked", "true");
      expect(leche).toHaveFocus();
      expect(leche).toHaveAttribute("tabindex", "0");

      await user.keyboard("{ArrowUp}{ArrowUp}");
      const cafe = screen.getByRole("radio", { name: "café" });
      expect(cafe).toHaveAttribute("aria-checked", "true");
      expect(cafe).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: "agua" })).toHaveAttribute("aria-checked", "true");
      await user.keyboard("{ArrowLeft}");
      expect(cafe).toHaveAttribute("aria-checked", "true");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "multiple_choice",
        optionId: "cafe",
      });
    });

    it("number keys 1–4 select the matching option when focus is inside", async () => {
      const { user, props } = setup();
      screen.getByRole("heading", { level: 2 }).focus();
      await user.keyboard("3");
      const pan = screen.getByRole("radio", { name: "pan" });
      expect(pan).toHaveAttribute("aria-checked", "true");
      expect(pan).toHaveFocus();
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "multiple_choice",
        optionId: "pan",
      });
      await user.keyboard("1");
      expect(screen.getByRole("radio", { name: "agua" })).toHaveAttribute("aria-checked", "true");
      await user.keyboard("4");
      expect(screen.getByRole("radio", { name: "café" })).toHaveAttribute("aria-checked", "true");
    });

    it("ignores digits without a matching option", async () => {
      const { user, props } = setup({
        exercise: { ...exercise, options: exercise.options.slice(0, 3) },
      });
      await user.tab();
      await user.keyboard("4");
      await user.keyboard("9");
      expect(props.onAnswerChange).not.toHaveBeenCalled();
    });

    it("prevents default on handled keys so the player's Enter/scroll handlers skip them", () => {
      setup();
      const agua = screen.getByRole("radio", { name: "agua" });
      agua.focus();
      const arrow = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      agua.dispatchEvent(arrow);
      expect(arrow.defaultPrevented).toBe(true);
      const digit = new KeyboardEvent("keydown", { key: "2", bubbles: true, cancelable: true });
      agua.dispatchEvent(digit);
      expect(digit.defaultPrevented).toBe(true);
      const letter = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
      agua.dispatchEvent(letter);
      expect(letter.defaultPrevented).toBe(false);
    });
  });

  describe("disabled / review state (AC8)", () => {
    it("ignores clicks, arrows and digits when disabled", async () => {
      const { user, props } = setup({ disabled: true });
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
      await user.click(screen.getByRole("radio", { name: "pan" }));
      await user.tab();
      await user.keyboard("{ArrowDown}2");
      expect(props.onAnswerChange).not.toHaveBeenCalled();
      expect(radios().every((r) => r.getAttribute("aria-checked") === "false")).toBe(true);
    });

    it("marks the correct option with a check and the wrong pick with a cross", async () => {
      const { user, props, rerender } = setup();
      await user.click(screen.getByRole("radio", { name: "leche" }));
      rerender(<MultipleChoiceExercise {...props} disabled review={correctReview} />);

      const agua = screen.getByRole("radio", { name: /agua/ });
      expect(within(agua).getByText("correct answer")).toBeInTheDocument();
      expect(agua.querySelector('[data-marker="correct"] svg')).not.toBeNull();
      expect(agua).toHaveAttribute("data-state", "correct");

      const leche = screen.getByRole("radio", { name: /leche/ });
      expect(within(leche).getByText("your answer, incorrect")).toBeInTheDocument();
      expect(leche.querySelector('[data-marker="incorrect"] svg')).not.toBeNull();
      expect(leche).toHaveAttribute("data-state", "incorrect");

      const pan = screen.getByRole("radio", { name: "pan" });
      expect(pan).not.toHaveAttribute("data-state");

      await user.click(screen.getByRole("radio", { name: "pan" }));
      expect(leche).toHaveAttribute("aria-checked", "true");
      expect(props.onAnswerChange).toHaveBeenCalledTimes(1);
    });

    it("shows only the check when the correct option was picked", async () => {
      const { user, props, rerender } = setup();
      await user.click(screen.getByRole("radio", { name: "agua" }));
      rerender(
        <MultipleChoiceExercise
          {...props}
          disabled
          review={{ ...correctReview, outcome: "correct", mistake: false, heartCost: 0 }}
        />,
      );
      expect(screen.getByText("correct answer")).toBeInTheDocument();
      expect(screen.queryByText("your answer, incorrect")).toBeNull();
    });
  });

  describe("invalid content", () => {
    it("reports skipped with fewer than the minimum options", () => {
      const { props } = setup({
        exercise: { ...exercise, options: exercise.options.slice(0, 2) },
      });
      expect(props.onSkip).toHaveBeenCalledWith("invalid_content");
      expect(props.onSkip).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("radiogroup")).toBeNull();
    });

    it("reports skipped when the correct option id is missing", () => {
      const { props } = setup({ exercise: { ...exercise, correctOptionId: "nope" } });
      expect(props.onSkip).toHaveBeenCalledWith("invalid_content");
    });

    it("does not skip valid content", () => {
      const { props } = setup();
      expect(props.onSkip).not.toHaveBeenCalled();
    });
  });
});
