import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  checkClozeAnswer,
  ClozeExerciseSchema,
  type AnswerCheckResult,
  type ClozeExercise as ClozeData,
} from "@/contracts";
import type { ListenAudio } from "../../audio/listen-audio";
import { ClozeExercise, gapLabel, type ClozeExerciseProps } from "./ClozeExercise";

/** One gap, two options, with audio (ADR-009 example). */
const oneGap: ClozeData = ClozeExerciseSchema.parse({
  id: "cz-table",
  type: "cloze",
  sentence: "Ich lege das Buch auf ___ Tisch.",
  translation: "I put the book on the table.",
  audio: { src: "/audio/de/test/cz-table.mp3" },
  gaps: [
    {
      options: [
        { id: "dem", text: "dem" },
        { id: "den", text: "den" },
      ],
      correctOptionId: "den",
    },
  ],
});

/** Two gaps that reuse the same option ids (`der` / `die` / `das`). */
const twoGaps: ClozeData = ClozeExerciseSchema.parse({
  id: "cz-dress",
  type: "cloze",
  sentence: "___ blaue Kleid ist schön, aber ___ Rock nicht.",
  translation: "The blue dress is nice, but the skirt isn't.",
  gaps: [
    {
      options: [
        { id: "der", text: "Der" },
        { id: "die", text: "Die" },
        { id: "das", text: "Das" },
      ],
      correctOptionId: "das",
    },
    {
      options: [
        { id: "der", text: "der" },
        { id: "die", text: "die" },
        { id: "das", text: "das" },
      ],
      correctOptionId: "der",
    },
  ],
});

/** AC 8: near the contract's worst case: 2 gaps, 4 options each, up to 24 characters. */
const LONG_A = "Donaudampfschifffahrten"; // 23
const LONG_B = "Rechtsschutzversicherung"; // 24
const longWords: ClozeData = ClozeExerciseSchema.parse({
  id: "cz-long",
  type: "cloze",
  sentence: "Die ___ und die ___ sind teuer.",
  translation: "The trips and the insurance are expensive.",
  gaps: [
    {
      options: [
        { id: "a", text: LONG_A },
        { id: "b", text: "Dampfschifffahrtsreisen" },
        { id: "c", text: "Kreuzfahrtgesellschaften" },
        { id: "d", text: "Flusskreuzfahrtenbüros" },
      ],
      correctOptionId: "a",
    },
    {
      options: [
        { id: "a", text: LONG_B },
        { id: "b", text: "Krankenversicherungen" },
        { id: "c", text: "Haftpflichtversicherung" },
        { id: "d", text: "Hausratsversicherungen" },
      ],
      correctOptionId: "a",
    },
  ],
});

/** `random` that always returns ~1 keeps Fisher–Yates in content order. */
const identity = () => 0.999;

function mockAudio() {
  const play = vi.fn(async () => "playing" as const);
  const audio: ListenAudio = {
    player: { play, stop: vi.fn() },
    speech: { findVoice: vi.fn(async () => null), speak: vi.fn(), cancel: vi.fn() },
  };
  return { audio, play };
}

function setup(overrides: Partial<ClozeExerciseProps> = {}) {
  const props: ClozeExerciseProps = {
    exercise: twoGaps,
    presentationKey: "cz:0",
    learningLanguage: "de",
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
  const utils = render(<ClozeExercise {...props} />);
  const rerenderWith = (next: Partial<ClozeExerciseProps>) =>
    utils.rerender(<ClozeExercise {...props} {...next} />);
  return { ...utils, props, rerenderWith, user: userEvent.setup() };
}

const sentence = () => screen.getByTestId("cloze-sentence");
const gap = (n: number) =>
  within(sentence()).getByRole("button", { name: new RegExp(`^blank ${n} of`) });
const optionsGroup = () => screen.getByRole("group", { name: /^Options for blank/ });
const option = (text: string) => within(optionsGroup()).getByRole("button", { name: text });
const optionTexts = () =>
  within(optionsGroup())
    .getAllByRole("button")
    .map((b) => b.textContent);

function reviewOf(exercise: ClozeData, optionIds: string[]): AnswerCheckResult {
  return checkClozeAnswer(exercise, { type: "cloze", optionIds });
}

async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colours; contrast is covered by the token tests.
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

describe("ClozeExercise", () => {
  describe("render (AC 1, AC 7)", () => {
    it("shows a focusable h2 with the given id", () => {
      setup();
      const heading = screen.getByRole("heading", { level: 2, name: "Fill in the blanks" });
      expect(heading).toHaveAttribute("id", "exercise-heading");
      expect(heading).toHaveAttribute("tabindex", "-1");
      expect(heading).toHaveAttribute("lang", "en");
    });

    it("uses the singular heading for one gap", () => {
      setup({ exercise: oneGap });
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Fill in the blank");
    });

    it("renders the sentence in one learning-language element with an empty slot per gap", () => {
      setup();
      expect(sentence()).toHaveAttribute("lang", "de");
      expect(sentence().textContent).toBe(
        "blank 1 of 2, empty blaue Kleid ist schön, aber blank 2 of 2, empty Rock nicht.",
      );
      expect(within(sentence()).getAllByRole("button")).toHaveLength(2);
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2, empty");
      expect(gap(2)).toHaveAccessibleName("blank 2 of 2, empty");
      expect(gap(1)).toHaveAttribute("data-state", "active");
      expect(gap(2)).toHaveAttribute("data-state", "empty");
    });

    it("the gap label is spoken in the known language", () => {
      setup();
      expect(within(gap(1)).getByText("blank 1 of 2, empty")).toHaveAttribute("lang", "en");
      expect(gapLabel(0, 2)).toBe("blank 1 of 2");
    });

    it("shows the translation under the sentence in the known language", () => {
      setup();
      const translation = screen.getByText(twoGaps.translation);
      expect(translation).toHaveAttribute("lang", "en");
      expect(
        sentence().compareDocumentPosition(translation) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("shows only the active gap's options, in the learning language", () => {
      setup();
      expect(optionsGroup()).toHaveAccessibleName("Options for blank 1 of 2");
      expect(optionTexts()).toEqual(["Der", "Die", "Das"]);
      for (const button of within(optionsGroup()).getAllByRole("button")) {
        expect(button).toHaveAttribute("lang", "de");
        expect(button).toHaveAttribute("aria-pressed", "false");
      }
    });

    it("shuffles options per presentation with the injected random source", () => {
      setup({ exercise: oneGap, random: () => 0 });
      expect(optionTexts()).toEqual(["den", "dem"]);
    });

    it("has no audio button before Check (the clip is the answer)", () => {
      setup({ exercise: oneGap });
      expect(screen.queryByRole("button", { name: "Play sentence" })).not.toBeInTheDocument();
    });

    it("skips invalid content (marker count does not match gaps)", () => {
      const onSkip = vi.fn();
      const { container } = setup({
        exercise: { ...oneGap, sentence: "Ohne Lücke." },
        onSkip,
      });
      expect(onSkip).toHaveBeenCalledWith("invalid_content");
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("filling gaps (AC 2, AC 3)", () => {
    it("an option fills the active gap and the next empty gap becomes active", async () => {
      const { user, props } = setup();
      await user.click(option("Das"));
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2: Das");
      expect(within(gap(1)).getByText("Das")).toBeInTheDocument();
      expect(gap(1)).toHaveAttribute("data-state", "filled");
      expect(gap(2)).toHaveAttribute("aria-current", "true");
      expect(optionsGroup()).toHaveAccessibleName("Options for blank 2 of 2");
      expect(optionTexts()).toEqual(["der", "die", "das"]);
      expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
    });

    it("sends the answer only once every gap is filled", async () => {
      const { user, props } = setup();
      await user.click(option("Das"));
      expect(props.onAnswerChange).toHaveBeenCalledTimes(1);
      expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
      await user.click(option("der"));
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "cloze",
        optionIds: ["das", "der"],
      });
    });

    it("after the last gap, the gap stays active and its choice can be changed", async () => {
      const { user, props } = setup();
      await user.click(option("Das"));
      await user.click(option("der"));
      expect(option("der")).toHaveAttribute("aria-pressed", "true");
      await user.click(option("die"));
      expect(option("die")).toHaveAttribute("aria-pressed", "true");
      expect(gap(2)).toHaveAccessibleName("blank 2 of 2: die");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "cloze",
        optionIds: ["das", "die"],
      });
    });

    it("tapping a filled gap makes it active again and clears it", async () => {
      const { user, props } = setup();
      await user.click(option("Das"));
      await user.click(option("der"));
      await user.click(gap(1));
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2, empty");
      expect(gap(1)).toHaveAttribute("aria-current", "true");
      expect(gap(2)).toHaveAccessibleName("blank 2 of 2: der");
      expect(optionsGroup()).toHaveAccessibleName("Options for blank 1 of 2");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
      // Refilling gap 1 completes the answer again (gap 2 is still filled).
      await user.click(option("Das"));
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "cloze",
        optionIds: ["das", "der"],
      });
    });

    it("tapping an empty gap only makes it active", async () => {
      const { user, props } = setup();
      await user.click(gap(2));
      expect(gap(2)).toHaveAttribute("aria-current", "true");
      expect(optionsGroup()).toHaveAccessibleName("Options for blank 2 of 2");
      expect(props.onAnswerChange).not.toHaveBeenCalled();
      // Filling gap 2 first moves on to the empty gap 1 (wrapping).
      await user.click(option("der"));
      expect(gap(1)).toHaveAttribute("aria-current", "true");
    });

    it("a one-gap exercise is answered with a single tap", async () => {
      const { user, props } = setup({ exercise: oneGap });
      await user.click(option("den"));
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({ type: "cloze", optionIds: ["den"] });
    });

    it("ignores input while disabled", async () => {
      const { user, props } = setup({ disabled: true });
      await user.click(option("Das"));
      await user.click(gap(2));
      expect(props.onAnswerChange).not.toHaveBeenCalled();
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2, empty");
      expect(option("Das")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("keyboard (AC 6)", () => {
    it("Tab moves between gaps and options; Enter and Space select", async () => {
      const { user, props } = setup();
      act(() => screen.getByRole("heading", { level: 2 }).focus());
      await user.tab();
      expect(gap(1)).toHaveFocus();
      await user.tab();
      expect(gap(2)).toHaveFocus();
      await user.tab();
      expect(option("Der")).toHaveFocus();
      await user.tab();
      await user.tab();
      expect(option("Das")).toHaveFocus();
      await user.keyboard("{Enter}");
      // Focus follows to the first option of the next gap.
      expect(option("der")).toHaveFocus();
      await user.keyboard(" ");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith({
        type: "cloze",
        optionIds: ["das", "der"],
      });
      expect(option("der")).toHaveFocus();
      // Enter on a filled gap clears it.
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(gap(1)).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2, empty");
      expect(props.onAnswerChange).toHaveBeenLastCalledWith(null);
    });
  });

  describe("review (AC 4)", () => {
    it("marks wrong gaps with an icon and text, correct gaps too, and hides the options", async () => {
      const { user, rerenderWith } = setup();
      await user.click(option("Die"));
      await user.click(option("der"));
      rerenderWith({ disabled: true, review: reviewOf(twoGaps, ["die", "der"]) });
      expect(screen.queryByRole("group", { name: /^Options for/ })).not.toBeInTheDocument();
      expect(gap(1)).toHaveAttribute("data-state", "incorrect");
      expect(gap(1)).toHaveAccessibleName("blank 1 of 2: Die, incorrect");
      expect(gap(1).querySelector("[data-marker=incorrect] svg")).not.toBeNull();
      expect(gap(2)).toHaveAttribute("data-state", "correct");
      expect(gap(2).querySelector("[data-marker=correct] svg")).not.toBeNull();
      expect(gap(1)).not.toHaveAttribute("aria-current");
      expect(gap(1)).toHaveAttribute("aria-disabled", "true");
      await user.click(gap(1));
      expect(gap(1)).toHaveAccessibleName(/: Die/);
    });

    it("all correct: every gap is marked correct", async () => {
      const { user, rerenderWith } = setup();
      await user.click(option("Das"));
      await user.click(option("der"));
      rerenderWith({ disabled: true, review: reviewOf(twoGaps, ["das", "der"]) });
      expect(sentence().querySelectorAll("[data-marker=incorrect]")).toHaveLength(0);
      expect(sentence().querySelectorAll("[data-marker=correct]")).toHaveLength(2);
    });
  });

  describe("audio (AC 9)", () => {
    it("after Check, a play button plays the sentence clip (no autoplay)", async () => {
      const { audio, play } = mockAudio();
      const { user, rerenderWith } = setup({ exercise: oneGap, audio });
      await user.click(option("den"));
      rerenderWith({ disabled: true, review: reviewOf(oneGap, ["den"]) });
      const button = screen.getByRole("button", { name: "Play sentence" });
      expect(play).not.toHaveBeenCalled();
      await user.click(button);
      await waitFor(() =>
        expect(play).toHaveBeenCalledWith(
          { src: "/audio/de/test/cz-table.mp3", rate: 1 },
          expect.anything(),
        ),
      );
    });

    it("falls back to speech and shows a notice when no voice is available", async () => {
      const audio: ListenAudio = {
        player: { play: vi.fn(async () => "failed" as const), stop: vi.fn() },
        speech: { findVoice: vi.fn(async () => null), speak: vi.fn(), cancel: vi.fn() },
      };
      const { user } = setup({
        exercise: oneGap,
        audio,
        disabled: true,
        review: reviewOf(oneGap, ["den"]),
      });
      await user.click(screen.getByRole("button", { name: "Play sentence" }));
      expect(await screen.findByRole("status")).toHaveTextContent(
        "Audio isn't available right now.",
      );
      expect(audio.speech.findVoice).toHaveBeenCalledWith("de-DE");
    });

    it("has no play button without audio", () => {
      setup({ disabled: true, review: reviewOf(twoGaps, ["das", "der"]) });
      expect(screen.queryByRole("button", { name: "Play sentence" })).not.toBeInTheDocument();
    });
  });

  describe("long German words at 375px (AC 8)", () => {
    it("the fixture is the contract's worst case", () => {
      expect(longWords.gaps.every((g) => g.options.length === 4)).toBe(true);
      expect(LONG_B).toHaveLength(24);
    });

    it("sentence, gaps and options wrap instead of overflowing", async () => {
      const { user } = setup({ exercise: longWords });
      expect(sentence()).toHaveClass("break-words", "hyphens-auto", "min-w-0");
      expect(gap(1)).toHaveClass("max-w-full");
      for (const button of within(optionsGroup()).getAllByRole("button")) {
        expect(button).toHaveClass("max-w-full", "break-words", "hyphens-auto");
      }
      expect(optionsGroup()).toHaveClass("flex-wrap", "min-w-0");
      await user.click(option(LONG_A));
      expect(within(gap(1)).getByText(LONG_A)).toHaveClass("break-words", "min-w-0");
    });
  });

  describe("reduced motion", () => {
    it("only animates colour changes behind motion-safe", () => {
      setup();
      for (const button of screen.getAllByRole("button")) {
        const animated = [...button.classList].filter((c) => /transition|duration|animate/.test(c));
        expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
      }
    });
  });

  describe("accessibility (AC 10)", () => {
    it("no serious or critical axe violations: empty, filled and reviewed", async () => {
      const { container, user, rerenderWith } = setup();
      expect(await seriousViolations(container)).toEqual([]);
      await user.click(option("Die"));
      expect(await seriousViolations(container)).toEqual([]);
      await user.click(option("der"));
      rerenderWith({ disabled: true, review: reviewOf(twoGaps, ["die", "der"]) });
      expect(await seriousViolations(container)).toEqual([]);
    });
  });
});
