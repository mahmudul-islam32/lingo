import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MatchPairsExercise as MatchPairsData } from "@/contracts";
import {
  MATCH_PAIRS_MIN,
  MISMATCH_FEEDBACK_MS,
  MatchPairsExercise,
  type MatchPairsExerciseProps,
} from "./MatchPairsExercise";

const pairs = [
  { id: "hola", learning: "hola", known: "hello" },
  { id: "gato", learning: "gato", known: "cat" },
  { id: "perro", learning: "perro", known: "dog" },
  { id: "agua", learning: "agua", known: "water" },
  { id: "pan", learning: "pan", known: "bread" },
];

const exercise: MatchPairsData = { id: "mp-basics", type: "match_pairs", pairs };

/** `random` ≈ 1 keeps content order, so the board is predictable. */
const identity = () => 0.999;

function setup(overrides: Partial<MatchPairsExerciseProps> = {}) {
  const props: MatchPairsExerciseProps = {
    exercise,
    presentationKey: "mp-basics:0",
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
  const utils = render(<MatchPairsExercise {...props} />);
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  return { ...utils, props, user };
}

function column(name: "Spanish words" | "English words") {
  return screen.getByRole("list", { name });
}

function tile(name: string) {
  return screen.getByRole("button", { name });
}

function columnTexts(name: "Spanish words" | "English words") {
  return within(column(name))
    .getAllByRole("button")
    .map((button) => button.textContent);
}

function status() {
  return screen.getByRole("status");
}

/**
 * RTL only recognises Jest fake timers: without this shim its async wrapper waits on a
 * faked `setTimeout(0)` forever. Exposing `jest.advanceTimersByTime` lets it advance them.
 */
const globalWithJest = globalThis as typeof globalThis & { jest?: unknown };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  globalWithJest.jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) };
});

afterEach(() => {
  delete globalWithJest.jest;
  vi.useRealTimers();
});

describe("MatchPairsExercise", () => {
  describe("render and shuffle (AC1, AC8, AC11)", () => {
    it("shows the instruction as the focusable heading", () => {
      setup();
      const heading = screen.getByRole("heading", { level: 2, name: "Match the pairs" });
      expect(heading).toHaveAttribute("id", "exercise-heading");
      expect(heading).toHaveAttribute("tabindex", "-1");
    });

    it("puts Spanish on the left and English on the right", () => {
      setup();
      const lists = screen.getAllByRole("list");
      expect(lists[0]).toHaveAccessibleName("Spanish words");
      expect(lists[1]).toHaveAccessibleName("English words");
      expect(columnTexts("Spanish words")).toEqual(pairs.map((p) => p.learning));
      expect(columnTexts("English words")).toEqual(pairs.map((p) => p.known));
    });

    it("shuffles each column separately and keeps all pairs", () => {
      // First shuffle (left) sees 0s, second (right) sees ~1s.
      let call = 0;
      const random = () => (call++ < pairs.length - 1 ? 0 : 0.999);
      setup({ random });
      const left = columnTexts("Spanish words");
      const right = columnTexts("English words");
      expect(left).not.toEqual(pairs.map((p) => p.learning));
      expect(right).toEqual(pairs.map((p) => p.known));
      expect([...left].sort()).toEqual(pairs.map((p) => p.learning).sort());
      expect([...right].sort()).toEqual(pairs.map((p) => p.known).sort());
    });

    it("keeps all pairs with a real random source", () => {
      setup({ random: Math.random });
      expect([...columnTexts("Spanish words")].sort()).toEqual(pairs.map((p) => p.learning).sort());
      expect([...columnTexts("English words")].sort()).toEqual(pairs.map((p) => p.known).sort());
    });

    it("marks tiles with the course languages", () => {
      setup();
      for (const button of within(column("Spanish words")).getAllByRole("button")) {
        expect(button).toHaveAttribute("lang", "es");
      }
      for (const button of within(column("English words")).getAllByRole("button")) {
        expect(button).toHaveAttribute("lang", "en");
      }
    });

    it("uses two columns with tiles at least 44px tall that wrap long words", () => {
      setup({
        exercise: {
          ...exercise,
          pairs: [
            ...pairs.slice(0, 4),
            { id: "long", learning: "desafortunadamen", known: "unfortunately" },
          ],
        },
      });
      expect(column("Spanish words").parentElement).toHaveClass("grid-cols-2");
      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveClass("min-h-11", "w-full", "break-words");
        expect(button).not.toHaveClass("truncate");
      }
    });

    it.each([3, 4, 6])("supports %i pairs", (count) => {
      const many = [...pairs, { id: "leche", learning: "leche", known: "milk" }].slice(0, count);
      const { props } = setup({ exercise: { ...exercise, pairs: many } as MatchPairsData });
      expect(screen.getAllByRole("button")).toHaveLength(count * 2);
      expect(props.onSkip).not.toHaveBeenCalled();
    });

    it("reports skipped with fewer than 3 pairs", () => {
      const { props } = setup({
        exercise: { ...exercise, pairs: pairs.slice(0, MATCH_PAIRS_MIN - 1) } as MatchPairsData,
      });
      expect(props.onSkip).toHaveBeenCalledTimes(1);
      expect(props.onSkip).toHaveBeenCalledWith("invalid_content");
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });

  describe("selection (AC2)", () => {
    it("highlights a selected tile with aria-pressed", async () => {
      const { user } = setup();
      expect(tile("hola")).toHaveAttribute("aria-pressed", "false");
      await user.click(tile("hola"));
      expect(tile("hola")).toHaveAttribute("aria-pressed", "true");
      expect(tile("hola")).toHaveAttribute("data-state", "selected");
    });

    it("moves the selection within the same column", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("gato"));
      expect(tile("hola")).toHaveAttribute("aria-pressed", "false");
      expect(tile("gato")).toHaveAttribute("aria-pressed", "true");
      await user.click(tile("cat"));
      expect(tile("cat")).toBeDisabled();
    });
  });

  describe("match (AC3, AC7, AC9)", () => {
    it("marks a matching pair as matched: disabled, success style, check icon", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("hello"));
      for (const name of ["hola", "hello"]) {
        const button = tile(name);
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("data-state", "matched");
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(button).toHaveClass("bg-success-soft", "text-success-fg", "border-dashed");
        expect(button.querySelector("svg")).not.toBeNull();
      }
      expect(status()).toHaveTextContent("Matched: hola, hello");
    });

    it("works starting from the right column", async () => {
      const { user } = setup();
      await user.click(tile("cat"));
      await user.click(tile("gato"));
      expect(tile("gato")).toBeDisabled();
      expect(status()).toHaveTextContent("Matched: gato, cat");
    });

    it("never reports an answer through onAnswerChange", async () => {
      const { user, props } = setup();
      await user.click(tile("hola"));
      await user.click(tile("hello"));
      await user.click(tile("gato"));
      await user.click(tile("dog"));
      expect(props.onAnswerChange).not.toHaveBeenCalled();
    });
  });

  describe("mismatch (AC4, AC7, AC10)", () => {
    it("shows the error style for 600 ms, then clears; tiles stay available", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      for (const name of ["hola", "cat"]) {
        expect(tile(name)).toHaveAttribute("data-state", "mismatch");
        expect(tile(name)).toHaveClass("bg-danger-soft", "text-danger-fg");
        expect(tile(name).querySelector("svg")).not.toBeNull();
        expect(tile(name)).toHaveAttribute("aria-pressed", "false");
      }
      expect(status()).toHaveTextContent("Not a match");

      act(() => {
        vi.advanceTimersByTime(MISMATCH_FEEDBACK_MS - 1);
      });
      expect(tile("hola")).toHaveAttribute("data-state", "mismatch");
      act(() => {
        vi.advanceTimersByTime(1);
      });
      for (const name of ["hola", "cat"]) {
        expect(tile(name)).toHaveAttribute("data-state", "idle");
        expect(tile(name)).toBeEnabled();
        expect(tile(name).querySelector("svg")).toBeNull();
      }
    });

    it("only shakes under motion-safe (reduced motion shows no shake)", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      const classes = tile("hola").className.split(/\s+/);
      expect(classes).toContain("motion-safe:animate-shake");
      expect(classes).not.toContain("animate-shake");
    });

    it("re-announces a repeated mismatch", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      const first = status().textContent;
      act(() => {
        vi.advanceTimersByTime(MISMATCH_FEEDBACK_MS);
      });
      await user.click(tile("hola"));
      await user.click(tile("dog"));
      expect(status()).toHaveTextContent("Not a match");
      expect(status().textContent).not.toBe(first);
    });

    it("a new tap during the feedback clears the error and selects", async () => {
      const { user } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      await user.click(tile("gato"));
      expect(tile("hola")).toHaveAttribute("data-state", "idle");
      expect(tile("gato")).toHaveAttribute("aria-pressed", "true");
    });

    it("clears the pending timeout on unmount", async () => {
      const { user, unmount } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("completion (AC5)", () => {
    it("calls onComplete once with all matches and mismatchCount 0", async () => {
      const { user, props } = setup();
      for (const pair of pairs) {
        await user.click(tile(pair.learning));
        await user.click(tile(pair.known));
      }
      expect(props.onComplete).toHaveBeenCalledTimes(1);
      expect(props.onComplete).toHaveBeenCalledWith({
        type: "match_pairs",
        matches: pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id })),
        mismatchCount: 0,
      });
      expect(screen.queryByRole("button", { name: /check/i })).toBeNull();
    });

    it("reports the number of mismatches", async () => {
      const { user, props } = setup();
      await user.click(tile("hola"));
      await user.click(tile("cat"));
      await user.click(tile("perro"));
      await user.click(tile("water"));
      for (const pair of pairs) {
        await user.click(tile(pair.learning));
        await user.click(tile(pair.known));
      }
      expect(props.onComplete).toHaveBeenCalledTimes(1);
      const answer = vi.mocked(props.onComplete).mock.calls[0]?.[0];
      expect(answer?.mismatchCount).toBe(2);
      expect(answer?.matches).toHaveLength(pairs.length);
    });

    it("does not complete before the last pair", async () => {
      const { user, props } = setup();
      for (const pair of pairs.slice(0, -1)) {
        await user.click(tile(pair.learning));
        await user.click(tile(pair.known));
      }
      expect(props.onComplete).not.toHaveBeenCalled();
    });

    it("ignores input when disabled", async () => {
      const { user, props } = setup({ disabled: true });
      await user.click(tile("hola"));
      await user.click(tile("hello"));
      expect(tile("hola")).toHaveAttribute("aria-pressed", "false");
      expect(tile("hola")).toHaveAttribute("aria-disabled", "true");
      expect(props.onComplete).not.toHaveBeenCalled();
    });
  });

  describe("keyboard (AC6)", () => {
    async function tabTo(user: ReturnType<typeof userEvent.setup>, name: string) {
      for (let i = 0; i < 12 && document.activeElement !== tile(name); i += 1) {
        await user.tab();
      }
      expect(tile(name)).toHaveFocus();
    }

    it("tiles are buttons in tab order; Enter and Space select", async () => {
      const { user, props } = setup();
      await user.tab();
      expect(tile("hola")).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(tile("hola")).toHaveAttribute("aria-pressed", "true");
      await tabTo(user, "hello");
      await user.keyboard(" ");
      expect(tile("hola")).toBeDisabled();
      expect(tile("hello")).toBeDisabled();
      // Focus moves to the next available tile instead of being lost.
      expect(tile("gato")).toHaveFocus();
      expect(status()).toHaveTextContent("Matched: hola, hello");
      expect(props.onComplete).not.toHaveBeenCalled();
    });

    it("skips matched tiles in the tab order", async () => {
      const { user } = setup();
      await user.click(tile("gato"));
      await user.click(tile("cat"));
      tile("hola").focus();
      await user.tab();
      expect(tile("perro")).toHaveFocus();
      tile("hello").focus();
      await user.tab();
      expect(tile("dog")).toHaveFocus();
    });

    it("completes a whole board with the keyboard only", async () => {
      const { user, props } = setup();
      await user.tab();
      for (const pair of pairs) {
        await tabTo(user, pair.learning);
        await user.keyboard("{Enter}");
        await tabTo(user, pair.known);
        await user.keyboard(" ");
      }
      expect(props.onComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
    });

    it("prevents default on Enter/Space so the player's Enter handler ignores it", () => {
      setup();
      const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      tile("hola").dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(true);
      const other = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
      tile("hola").dispatchEvent(other);
      expect(other.defaultPrevented).toBe(false);
    });
  });
});
