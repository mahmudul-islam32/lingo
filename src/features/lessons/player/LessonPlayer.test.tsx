import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonResultSchema, LessonSessionSchema, type Lesson } from "@/contracts";
import { LessonPlayer, type LessonPlayerProps } from "./LessonPlayer";
import { LessonPlayerError } from "./PlayerError";
import { LessonPlayerSkeleton, SKELETON_DELAY_MS } from "./PlayerSkeleton";
import { buildLessonResult, type LessonSessionSummary } from "./summary";
import { fixtureLesson, makeClock, mcOnlyLesson, SESSION_ID } from "./testing/fixtures";
import { stubComponents } from "./testing/stubs";

function setup(lesson: Lesson = mcOnlyLesson, props: Partial<LessonPlayerProps> = {}) {
  const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
  const onQuit = vi.fn();
  const user = userEvent.setup();
  render(
    <LessonPlayer
      lesson={lesson}
      learningLanguage="es"
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
  return { user, onFinish, onQuit };
}

const progress = () => screen.getByRole("progressbar", { name: "Lesson progress" });
const checkButton = () => screen.getByRole("button", { name: "Check" });
const prompt = () => screen.getByRole("heading", { level: 2 });

afterEach(() => {
  vi.useRealTimers();
});

describe("LessonPlayer", () => {
  it("shows the header, progress and the first exercise with focus on its heading", () => {
    setup();
    expect(screen.getByRole("button", { name: "Quit lesson" })).toBeInTheDocument();
    expect(progress()).toHaveAttribute("aria-valuemin", "0");
    expect(progress()).toHaveAttribute("aria-valuemax", "2");
    expect(progress()).toHaveAttribute("aria-valuenow", "0");
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 1 of 2");
    expect(screen.getByTestId("hearts-slot")).toBeEmptyDOMElement();
    expect(prompt()).toHaveTextContent("Which one means 'hello'?");
    expect(prompt()).toHaveFocus();
    expect(screen.getByText("Exercise 1 of 2", { selector: "[role=status]" })).toBeInTheDocument();
  });

  it("Check is disabled until an answer is ready, and again when it is cleared", async () => {
    const { user } = setup();
    expect(checkButton()).toBeDisabled();
    expect(checkButton()).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    expect(checkButton()).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(checkButton()).toBeDisabled();
  });

  it("correct answer: feedback panel replaces Check, inputs lock, progress advances on Continue", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(checkButton());
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
    const panel = screen.getByTestId("feedback-panel");
    expect(within(panel).getByRole("heading")).toHaveTextContent("Nice work!");
    expect(within(panel).getByRole("button", { name: "Continue" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Pick wrong" })).toBeDisabled();
    expect(screen.getByTestId("stub-review")).toHaveTextContent("correct");
    expect(progress()).toHaveAttribute("aria-valuenow", "1");

    await user.click(within(panel).getByRole("button", { name: "Continue" }));
    expect(prompt()).toHaveTextContent("Which one means 'good morning'?");
    expect(prompt()).toHaveFocus();
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 2 of 2");
  });

  it("Enter triggers Check when enabled, and Continue during feedback", async () => {
    const { user } = setup();
    // Focus is on the prompt heading (not a button).
    await user.keyboard("{Enter}");
    expect(screen.queryByTestId("feedback-panel")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    act(() => prompt().focus());
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("feedback-panel")).toBeInTheDocument();
    act(() => (document.activeElement as HTMLElement).blur());
    await user.keyboard("{Enter}");
    expect(prompt()).toHaveTextContent("Which one means 'good morning'?");
  });

  it("Enter on an exercise button doesn't trigger Check", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    screen.getByRole("button", { name: "Pick wrong" }).focus();
    await user.keyboard("{Enter}");
    // The button's own click ran (answer changed), no check happened.
    expect(screen.queryByTestId("feedback-panel")).not.toBeInTheDocument();
    expect(checkButton()).toBeEnabled();
  });

  it("incorrect answer: shows the correct answer and re-queues the exercise at the end", async () => {
    const { user, onFinish } = setup();
    await user.click(screen.getByRole("button", { name: "Pick wrong" }));
    await user.click(checkButton());
    const panel = screen.getByTestId("feedback-panel");
    expect(within(panel).getByRole("heading")).toHaveTextContent("Not quite");
    expect(within(panel).getByText("Hola")).toHaveAttribute("lang", "es");
    expect(progress()).toHaveAttribute("aria-valuenow", "0");
    await user.click(within(panel).getByRole("button", { name: "Continue" }));

    expect(prompt()).toHaveTextContent("good morning");
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(checkButton());
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // mc-1 comes back, freshly mounted.
    expect(prompt()).toHaveTextContent("hello");
    expect(screen.getByTestId("stub-exercise")).toHaveAttribute("data-presentation", "mc-1:1");
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 2 of 2");
    expect(onFinish).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(checkButton());
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0]![0]).toMatchObject({ mistakeCount: 1, firstTryCorrectCount: 1 });
  });

  it("match pairs finish by themselves, show Continue, pass review=null and are never re-queued", async () => {
    const lesson: Lesson = {
      ...fixtureLesson,
      exercises: fixtureLesson.exercises.filter((e) => e.id === "mp-1"),
    };
    const { user, onFinish } = setup(lesson);
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish with mismatches" }));
    const panel = screen.getByTestId("feedback-panel");
    expect(panel).toHaveAttribute("data-outcome", "correct");
    expect(screen.getByTestId("stub-review")).toHaveTextContent("no review");
    await user.click(within(panel).getByRole("button", { name: "Continue" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    expect(summary).toMatchObject({ mistakeCount: 1, firstTryCorrectCount: 0, perfect: false });
    expect(summary.session.attempts).toHaveLength(1);
  });

  it("skipped exercise moves on, isn't counted, and speak (unsupported) is left out", async () => {
    const { user, onFinish } = setup(fixtureLesson);
    expect(progress()).toHaveAttribute("aria-valuemax", "4");
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole("button", { name: "Pick correct" }));
      await user.click(checkButton());
      await user.click(screen.getByRole("button", { name: "Continue" }));
    }
    await user.click(screen.getByRole("button", { name: "Finish pairs" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(prompt()).toHaveTextContent("Type what you hear");
    await user.click(screen.getByRole("button", { name: "Audio unavailable" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    expect(summary).toMatchObject({
      exerciseCount: 4,
      skippedCount: 1,
      mistakeCount: 0,
      firstTryCorrectCount: 3,
      perfect: true,
    });
    expect(summary.session.hiddenExerciseIds).toEqual(["sp-1"]);
  });

  it("finish: calls onFinish once with a summary that maps to a valid LessonResult", async () => {
    const { user, onFinish } = setup();
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole("button", { name: "Pick correct" }));
      await user.click(checkButton());
      await user.click(screen.getByRole("button", { name: "Continue" }));
    }
    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    expect(summary.session.status).toBe("completed");
    expect(LessonSessionSchema.safeParse(summary.session).success).toBe(true);
    // Clock: 10:00:00 start, then +1 s per call (check, continue, check, continue).
    expect(summary.startedAt).toBe("2026-11-07T10:00:00.000Z");
    expect(summary.completedAt).toBe("2026-11-07T10:00:04.000Z");
    expect(summary).toMatchObject({
      exerciseCount: 2,
      firstTryCorrectCount: 2,
      mistakeCount: 0,
      skippedCount: 0,
      perfect: true,
    });
    const result = buildLessonResult(summary, {
      id: "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b",
      xp: { base: 10, perfectBonus: 5 },
      timeZone: "UTC",
      localDate: "2026-11-07",
    });
    expect(LessonResultSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({ accuracy: 1, perfect: true, xpEarned: 15, durationMs: 4000 });
  });

  describe("quit", () => {
    it("close button opens the dialog with 'Keep learning' focused; it returns focus", async () => {
      const { user, onQuit } = setup();
      const close = screen.getByRole("button", { name: "Quit lesson" });
      await user.click(close);
      const dialog = screen.getByRole("alertdialog", { name: "Quit this lesson?" });
      expect(dialog).toHaveAccessibleDescription("Your progress in this lesson won't be saved.");
      expect(within(dialog).getByRole("button", { name: "Keep learning" })).toHaveFocus();
      await user.click(within(dialog).getByRole("button", { name: "Keep learning" }));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(close).toHaveFocus();
      expect(onQuit).not.toHaveBeenCalled();
    });

    it("Escape opens the dialog; Escape again closes it back to the close button", async () => {
      const { user } = setup();
      await user.keyboard("{Escape}");
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Quit lesson" })).toHaveFocus();
    });

    it("Quit calls onQuit once and never onFinish", async () => {
      const { user, onQuit, onFinish } = setup();
      await user.keyboard("{Escape}");
      await user.click(screen.getByRole("button", { name: "Quit" }));
      expect(onQuit).toHaveBeenCalledTimes(1);
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  describe("hearts (LES-009 wiring)", () => {
    it("reports heart costs and ends with onOutOfHearts at 0, without a result", async () => {
      const onLose = vi.fn();
      const onOutOfHearts = vi.fn();
      const { user, onFinish } = setup(mcOnlyLesson, {
        hearts: { initial: 1, onLose, onOutOfHearts },
        heartsSlot: <span>1 heart</span>,
      });
      expect(screen.getByTestId("hearts-slot")).toHaveTextContent("1 heart");
      await user.click(screen.getByRole("button", { name: "Pick wrong" }));
      await user.click(checkButton());
      expect(onLose).toHaveBeenCalledWith(1);
      expect(onOutOfHearts).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(onOutOfHearts).toHaveBeenCalledTimes(1);
      expect(onOutOfHearts.mock.calls[0]![0]).toMatchObject({ status: "out_of_hearts" });
      expect(onFinish).not.toHaveBeenCalled();
    });

    it("does not lose hearts without the hearts prop (v0.2.0)", async () => {
      const { user, onFinish } = setup();
      await user.click(screen.getByRole("button", { name: "Pick wrong" }));
      await user.click(checkButton());
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(onFinish).not.toHaveBeenCalled();
      expect(prompt()).toBeInTheDocument();
    });
  });

  it("a lesson with 0 counted exercises shows the error state", async () => {
    const { user, onQuit } = setup(mcOnlyLesson, { components: {} });
    expect(
      screen.getByRole("heading", { name: "We couldn't load this lesson." }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to Learn" }));
    expect(onQuit).toHaveBeenCalledTimes(1);
  });

  it("the action bar is sticky at the bottom with a 48 px button; exercise area scrolls", () => {
    setup();
    expect(checkButton().className).toMatch(/min-h-12/);
    expect(checkButton().closest(".sticky")).toHaveClass("bottom-0");
    expect(screen.getByTestId("exercise-area")).toHaveClass("flex-1", "overflow-y-auto");
  });

  it("exercise transitions only animate with motion allowed", () => {
    setup();
    const wrapper = screen.getByTestId("stub-exercise").parentElement!;
    expect(wrapper.className).toMatch(/motion-safe:animate-slide-up/);
    expect(wrapper.className).not.toMatch(/(^|\s)animate-/);
  });
});

describe("LessonPlayerSkeleton", () => {
  it("is a status region labelled 'Loading lesson' and appears after a short delay", () => {
    vi.useFakeTimers();
    render(<LessonPlayerSkeleton />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading lesson");
    expect(screen.getByTestId("player-skeleton")).toHaveClass("opacity-0");
    act(() => vi.advanceTimersByTime(SKELETON_DELAY_MS));
    expect(screen.getByTestId("player-skeleton")).toHaveClass("opacity-100");
  });
});

describe("LessonPlayerError", () => {
  it("offers Try again and Back to Learn", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onBack = vi.fn();
    render(<LessonPlayerError onRetry={onRetry} onBack={onBack} />);
    expect(screen.getByRole("heading", { name: "We couldn't load this lesson." })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await user.click(screen.getByRole("button", { name: "Back to Learn" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
