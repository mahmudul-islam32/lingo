/**
 * LES-023 AC 3–9, 12, 14: the review session in the player, with the real exercise
 * components and the real hearts hooks over a stubbed local session.
 */
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GAME_CONFIG,
  ReviewItemSchema,
  isReviewResult,
  type HeartsState,
  type ReviewItem,
} from "@/contracts";
import { getLocalSession, type LocalSession } from "@/lib/offline";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import type { LessonSessionSummary } from "../player";
import { makeClock, SESSION_ID } from "../player/testing/fixtures";
import { PRACTICE_BADGE_LABEL } from "../hearts/PracticeBadge";
import { OUT_OF_HEARTS_HEADING } from "../hearts/OutOfHeartsScreen";
import { toLessonResult } from "../results";
import type { SoundEffect, SoundEffects } from "../sound/sound-effects";
import { ReviewPlayer, type ReviewPlayerProps } from "./ReviewPlayer";
import { reviewItems } from "./testing/fixtures";

const { loseSpy } = vi.hoisted(() => ({ loseSpy: vi.fn<(cost: number) => void>() }));

vi.mock("@/lib/offline", () => ({ getLocalSession: vi.fn() }));
vi.mock("@/features/gamification", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/gamification")>();
  return {
    ...actual,
    useLoseHearts: () => {
      const lose = actual.useLoseHearts();
      return (cost: number) => {
        loseSpy(cost);
        return lose(cost);
      };
    },
  };
});

const NOW = new Date("2026-11-26T10:00:00.000Z");
const RESULT_ID = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";

function stored(current: number): HeartsState {
  return {
    current,
    refillStartedAt: current < GAME_CONFIG.maxHearts ? NOW.toISOString() : null,
    updatedAt: "2026-11-26T09:00:00.000Z",
  };
}

function setup(hearts: number, props: Partial<ReviewPlayerProps> = {}) {
  let state = stored(hearts);
  const saveHearts = vi.fn(async (next: HeartsState) => {
    state = next;
  });
  const session = {
    progress: { getHearts: vi.fn(async () => state), saveHearts },
  } as unknown as LocalSession;
  vi.mocked(getLocalSession).mockResolvedValue(session);
  const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
  const onQuit = vi.fn();
  const user = userEvent.setup();
  const view = renderWithQueryClient(
    <ReviewPlayer
      items={reviewItems}
      learningLanguage="es"
      knownLanguage="en"
      onFinish={onFinish}
      onQuit={onQuit}
      now={makeClock()}
      createId={() => SESSION_ID}
      random={() => 0}
      {...props}
    />,
    { client: createTestQueryClient() },
  );
  return { ...view, user, onFinish, onQuit, saveHearts };
}

type User = ReturnType<typeof userEvent.setup>;
const prompt = () => screen.findByRole("heading", { level: 2 });
const meter = () =>
  within(screen.getByTestId("hearts-slot")).getByRole("img", { name: /^Hearts:/ });
const progress = () => screen.getByRole("progressbar");

async function check(user: User) {
  await user.click(screen.getByRole("button", { name: "Check" }));
}
async function continueOn(user: User) {
  await user.click(screen.getByRole("button", { name: "Continue" }));
}
async function answerMc(user: User, right: boolean) {
  await user.click(screen.getByRole("radio", { name: right ? /Gracias/ : /Hola/ }));
  await check(user);
}
async function answerWordBank(user: User) {
  for (const tile of ["Yo", "bebo", "agua"]) {
    await user.click(screen.getByRole("button", { name: `Add ${tile}` }));
  }
  await check(user);
}
async function answerPairs(user: User) {
  for (const [learning, known] of [
    ["gato", "cat"],
    ["perro", "dog"],
    ["pan", "bread"],
    ["agua", "water"],
    ["casa", "house"],
  ] as const) {
    await user.click(screen.getByRole("button", { name: new RegExp(`^${learning}`) }));
    await user.click(screen.getByRole("button", { name: new RegExp(`^${known}`) }));
  }
  await screen.findByTestId("feedback-panel");
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  loseSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ReviewPlayer (LES-023)", () => {
  it("AC 3, 4, 6, 7: plays the items in order with the real exercises, names the region Review, no tip", async () => {
    const { user, onFinish } = setup(5);
    expect(await prompt()).toHaveTextContent("Which one means 'thank you'?");
    expect(screen.getByRole("main", { name: "Review" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 1 of 3");
    expect(progress()).toHaveAttribute("aria-valuemax", "3");
    // ADR-017 lang tagging, as in a lesson.
    expect(
      screen.getByRole("radio", { name: /Gracias/ }).querySelector("[lang='es']"),
    ).not.toBeNull();

    await answerMc(user, true);
    // AC 6: the exercise's own explanation in the feedback panel.
    expect(screen.getByTestId("feedback-panel")).toHaveTextContent(
      "Gracias is how you say thank you.",
    );
    await continueOn(user);
    expect(await prompt()).toHaveTextContent("I drink water");
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 2 of 3");
    await answerWordBank(user);
    await continueOn(user);
    expect(await prompt()).toHaveTextContent(/match/i);
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 3 of 3");
    await answerPairs(user);
    await continueOn(user);

    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    const result = toLessonResult(summary, { id: RESULT_ID, timeZone: "UTC" });
    expect(isReviewResult(result)).toBe(true);
    expect(result.exerciseOutcomes?.map((o) => [o.lessonId, o.exerciseId, o.outcome])).toEqual([
      ["u1-l1", "rv-mc", "correct"],
      ["u2-l3", "rv-wb", "correct"],
      ["u1-l1", "rv-mp", "correct"],
    ]);
    expect(result.perfect).toBe(true);
  });

  it("AC 3, 5: a wrong answer is re-queued at the end and costs no heart; at 0 hearts it starts and correct Checks earn", async () => {
    const { user, onFinish, saveHearts } = setup(0);
    await prompt();
    // AC 5: the Practice badge, and no out-of-hearts screen at 0 hearts.
    expect(
      within(screen.getByTestId("hearts-slot")).getByText(PRACTICE_BADGE_LABEL),
    ).toBeInTheDocument();
    expect(screen.queryByText(OUT_OF_HEARTS_HEADING)).not.toBeInTheDocument();
    expect(meter()).toHaveAccessibleName(`Hearts: 0 of ${GAME_CONFIG.maxHearts}`);

    await answerMc(user, false);
    expect(loseSpy).not.toHaveBeenCalled();
    expect(meter()).toHaveAccessibleName(`Hearts: 0 of ${GAME_CONFIG.maxHearts}`);
    await continueOn(user);
    await answerWordBank(user);
    const gain = GAME_CONFIG.heartsGainedPerCorrectAnswer;
    expect(meter()).toHaveAccessibleName(`Hearts: ${gain} of ${GAME_CONFIG.maxHearts}`);
    await continueOn(user);
    await answerPairs(user);
    await continueOn(user);
    // The wrong multiple choice comes back last.
    expect(await prompt()).toHaveTextContent("Which one means 'thank you'?");
    expect(progress()).toHaveAttribute("aria-valuetext", "Exercise 3 of 3");
    await answerMc(user, true);
    await continueOn(user);

    expect(screen.queryByText(OUT_OF_HEARTS_HEADING)).not.toBeInTheDocument();
    expect(onFinish).toHaveBeenCalledTimes(1);
    const result = toLessonResult(onFinish.mock.calls[0]![0], { id: RESULT_ID, timeZone: "UTC" });
    expect(result.heartsLost).toBe(0);
    expect(result.exerciseOutcomes?.[0]).toMatchObject({
      exerciseId: "rv-mc",
      outcome: "incorrect",
    });
    await waitFor(() => expect(saveHearts).toHaveBeenCalled());
  });

  it("AC 8: quit shows the dialog; confirming calls onQuit and produces nothing", async () => {
    const { user, onFinish, onQuit } = setup(3);
    await prompt();
    await answerMc(user, true);
    await continueOn(user);
    await user.click(screen.getByRole("button", { name: "Quit review" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Quit this review?" });
    expect(dialog).toHaveTextContent("Your progress in this review won't be saved.");
    await user.click(within(dialog).getByRole("button", { name: "Keep learning" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onQuit).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Quit" }),
    );
    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("AC 9: sound effects follow soundEffectsEnabled", async () => {
    const play = vi.fn<(effect: SoundEffect) => void>();
    const sounds: SoundEffects = { play };
    const { user, unmount } = setup(5, { sounds, soundEffectsEnabled: true });
    await prompt();
    await answerMc(user, true);
    expect(play).toHaveBeenLastCalledWith("correct");
    unmount();

    play.mockClear();
    const off = setup(5, { sounds, soundEffectsEnabled: false });
    await prompt();
    await answerMc(off.user, false);
    expect(play).not.toHaveBeenCalled();
  });

  it("shows the player error state when no item can be played", async () => {
    const onQuit = vi.fn();
    const user = userEvent.setup();
    renderWithQueryClient(
      <ReviewPlayer
        items={[]}
        learningLanguage="es"
        knownLanguage="en"
        onFinish={vi.fn()}
        onQuit={onQuit}
        onRetry={vi.fn()}
      />,
      { client: createTestQueryClient() },
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    // Exact name (FIX-015): a /back/i match would also accept "Back to Learn".
    const back = screen.getByRole("button", { name: "Back" });
    expect(back).toHaveTextContent(/^Back$/);
    expect(screen.queryByRole("button", { name: "Back to Learn" })).not.toBeInTheDocument();
    await user.click(back);
    expect(onQuit).toHaveBeenCalledTimes(1);
  });
});

/** Ten multiple-choice items from two lessons (AC 12). */
const tenItems: ReviewItem[] = Array.from({ length: 10 }, (_, i) =>
  ReviewItemSchema.parse({
    courseId: "en-es",
    unitId: i % 2 === 0 ? "u1" : "u2",
    lessonId: i % 2 === 0 ? "u1-l1" : "u2-l1",
    exercise: {
      id: `rv-kb-${i}`,
      type: "multiple_choice",
      prompt: `Question ${i + 1}: which one means 'yes'?`,
      options: [
        { id: "si", text: "Sí" },
        { id: "no", text: "No" },
        { id: "tal-vez", text: "Tal vez" },
      ],
      correctOptionId: "si",
    },
  }),
);

describe("ReviewPlayer keyboard and axe (LES-023 AC 12)", () => {
  it("a 10-item review plays with the keyboard only (Tab, arrows, Enter)", async () => {
    const { user, onFinish } = setup(5, { items: tenItems });
    for (let i = 0; i < 10; i += 1) {
      expect(await prompt()).toHaveTextContent(`Question ${i + 1}:`);
      expect(progress()).toHaveAttribute("aria-valuetext", `Exercise ${i + 1} of 10`);
      await user.tab();
      // Options are shuffled: arrow keys move and select (radio pattern) until "Sí".
      expect(document.activeElement).toHaveAttribute("role", "radio");
      if (document.activeElement?.textContent?.includes("Sí")) await user.keyboard(" ");
      while (!document.activeElement?.textContent?.includes("Sí")) {
        await user.keyboard("{ArrowDown}");
      }
      expect(document.activeElement).toHaveAttribute("aria-checked", "true");
      await user.keyboard("{Enter}");
      expect(screen.getByTestId("feedback-panel")).toBeInTheDocument();
      await user.keyboard("{Enter}");
    }
    expect(onFinish).toHaveBeenCalledTimes(1);
    const result = toLessonResult(onFinish.mock.calls[0]![0], { id: RESULT_ID, timeZone: "UTC" });
    expect(result.exerciseOutcomes).toHaveLength(10);
    expect(result.firstTryCorrectCount).toBe(10);
  });

  it("has no serious or critical axe violations while answering and in feedback", async () => {
    const { user, container } = setup(5);
    await prompt();
    const serious = async () =>
      (await axe.run(container)).violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
    expect(await serious()).toEqual([]);
    await answerMc(user, false);
    expect(await serious()).toEqual([]);
  });
});
