import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { LessonSchema, type Lesson } from "@/contracts";
import germanHello from "../../../../content/courses/en-de/lessons/de-a1-u01-l1-hello.json";
import { LessonPlayer, type LessonPlayerProps } from "../player/LessonPlayer";
import type { LessonSessionSummary } from "../player/summary";
import { makeClock, mcOnlyLesson, SESSION_ID } from "../player/testing/fixtures";
import { stubComponents } from "../player/testing/stubs";

/** Real German A1 content: Unit 1, Lesson 1 "Hello and Goodbye" (CON-DE-A1-01). */
const germanLesson: Lesson = LessonSchema.parse(germanHello);
const GERMAN_TIP =
  "Guten Morgen, guten Tag and guten Abend follow the time of day. Tschüss is casual, auf Wiedersehen is polite.";

/** 280 characters, the contract limit (`TextSchema`). */
const LONG_TIP = `${"Der, die, das: ".repeat(18)}nouns!`.padEnd(280, ".").slice(0, 280);
const longTipLesson: Lesson = LessonSchema.parse({ ...mcOnlyLesson, tip: LONG_TIP });
const mcTipLesson: Lesson = LessonSchema.parse({ ...mcOnlyLesson, tip: "Hola means hello." });

function setup(lesson: Lesson, props: Partial<LessonPlayerProps> = {}) {
  const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
  const onQuit = vi.fn();
  const user = userEvent.setup();
  const utils = render(
    <LessonPlayer
      lesson={lesson}
      learningLanguage="de"
      knownLanguage="en"
      onFinish={onFinish}
      onQuit={onQuit}
      components={stubComponents}
      now={makeClock()}
      createId={() => SESSION_ID}
      random={() => 0}
      {...props}
    />,
  );
  return { user, onFinish, onQuit, ...utils };
}

const startButton = () => screen.getByRole("button", { name: "Start" });
const progress = () => screen.getByRole("progressbar", { name: "Lesson progress" });
const tipCard = () => screen.queryByTestId("tip-card");
const exercisePrompt = () => screen.queryByTestId("stub-exercise");

async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colours; contrast is covered by the token tests.
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

describe("Lesson tip card (LES-013)", () => {
  it("AC1, AC5: a real German A1 tip is shown before exercise 1 with Lumi and Start", () => {
    setup(germanLesson);
    expect(germanLesson.tip).toBe(GERMAN_TIP);
    const card = screen.getByRole("region", { name: "Tip" });
    expect(within(card).getByText(GERMAN_TIP)).toHaveAttribute("lang", "en");
    const lumi = card.querySelector("svg[data-pose]");
    expect(lumi).toHaveAttribute("data-pose", "idle");
    expect(lumi).toHaveAttribute("aria-hidden", "true");
    expect(startButton()).toBeInTheDocument();
    expect(exercisePrompt()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
  });

  it("AC2: Start shows exercise 1; the card doesn't move progress or announce an exercise", async () => {
    const { user } = setup(germanLesson);
    expect(progress()).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await user.click(startButton());
    expect(tipCard()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Which one means 'hello'?");
    expect(heading).toHaveFocus();
    expect(progress()).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("status")).toHaveTextContent(/^Exercise 1 of \d+$/);
  });

  it("AC2: the card costs no hearts and isn't counted in accuracy or the lesson time", async () => {
    const onLose = vi.fn();
    const { user, onFinish } = setup(mcTipLesson, {
      hearts: { initial: 5, onLose, onOutOfHearts: vi.fn() },
      // Mount 10:00:00 (session), Start 10:00:01, then one tick per action.
      now: makeClock(),
    });
    await user.click(startButton());
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole("button", { name: "Pick correct" }));
      await user.click(screen.getByRole("button", { name: "Check" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));
    }
    expect(onLose).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    expect(summary).toMatchObject({
      exerciseCount: 2,
      firstTryCorrectCount: 2,
      mistakeCount: 0,
      perfect: true,
    });
    expect(summary.session.attempts).toHaveLength(2);
    expect(summary.session.heartsRemaining).toBe(5);
    expect(summary.startedAt).toBe("2026-11-07T10:00:01.000Z");
  });

  it("AC3: a lesson without a tip starts directly with exercise 1", () => {
    setup(mcOnlyLesson);
    expect(tipCard()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
  });

  it("AC6: focus starts on Start, the tip describes it and comes first in reading order", () => {
    setup(germanLesson);
    expect(startButton()).toHaveFocus();
    expect(startButton()).toHaveAccessibleDescription(GERMAN_TIP);
    const text = screen.getByText(GERMAN_TIP);
    expect(text.compareDocumentPosition(startButton()) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it.each(["{Enter}", " "])("AC6: %s on Start starts the lesson", async (key) => {
    const { user } = setup(germanLesson);
    await user.keyboard(key);
    expect(tipCard()).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
    // The same key press doesn't also trigger "Check" or anything else.
    expect(screen.queryByTestId("feedback-panel")).not.toBeInTheDocument();
  });

  it("AC7: the quit dialog opens from the tip card; Keep learning returns to it", async () => {
    const { user, onQuit } = setup(germanLesson);
    await user.click(screen.getByRole("button", { name: "Quit lesson" }));
    const dialog = screen.getByRole("alertdialog", { name: "Quit this lesson?" });
    await user.click(within(dialog).getByRole("button", { name: "Keep learning" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("tip-card")).toBeInTheDocument();
    expect(onQuit).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Quit" }));
    expect(onQuit).toHaveBeenCalledTimes(1);
  });

  it("AC4: a 280-character tip scrolls inside the lesson area; Start stays in the sticky bar", () => {
    setup(longTipLesson);
    expect(LONG_TIP).toHaveLength(280);
    expect(screen.getByText(LONG_TIP)).toBeInTheDocument();
    const area = screen.getByTestId("exercise-area");
    expect(area).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(area).toContainElement(screen.getByTestId("tip-card"));
    expect(area).not.toContainElement(startButton());
    expect(startButton().closest(".sticky")).toHaveClass("bottom-0", "shrink-0");
    expect(startButton().className).toMatch(/min-h-12/);
  });

  it("only animates with motion allowed", () => {
    setup(germanLesson);
    const card = screen.getByTestId("tip-card");
    expect(card.className).toMatch(/motion-safe:animate-slide-up/);
    expect(card.className).not.toMatch(/(^|\s)animate-/);
  });

  it("AC8: no serious or critical axe violations on the tip card", async () => {
    const { container } = setup(germanLesson);
    expect(await seriousViolations(container)).toEqual([]);
  });
});
