/** LES-023 AC 10–12: `ResultsScreen` in review mode (chosen by the result's kind). */
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  GAME_CONFIG,
  GoalPlanStatusSchema,
  LessonSessionSchema,
  SettingsSchema,
  type ExerciseAttempt,
  type LessonResult,
} from "@/contracts";
import { createFullHearts } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { summarizeSession } from "../player";
import { buildReviewLesson } from "../review";
import { reviewItems } from "../review/testing/fixtures";
import { formatAccuracy } from "./format";
import { toLessonResult } from "./result";
import {
  RESULTS_HEADING,
  REVIEW_MORE_LABEL,
  REVIEW_RESULTS_HEADING,
  REVIEW_SAVE_ERROR_MESSAGE,
  ResultsScreen,
  perfectReviewText,
} from "./ResultsScreen";
import { FIXTURE_NOW, RESULT_ID, perfectSummary } from "./testing/fixtures";

vi.mock("@/lib/offline", () => ({ getLocalSession: () => new Promise(() => {}) }));

const built = buildReviewLesson(reviewItems)!;
const attempt = (exerciseId: string, i: number): ExerciseAttempt => {
  const exercise = built.lesson.exercises.find((e) => e.id === exerciseId)!;
  return {
    exerciseId,
    exerciseType: exercise.type,
    answer:
      exercise.type === "multiple_choice"
        ? { type: "multiple_choice", optionId: exercise.correctOptionId }
        : exercise.type === "word_bank_translate"
          ? { type: "word_bank_translate", tiles: ["Yo", "bebo", "agua"] }
          : { type: "match_pairs", matches: [], mismatchCount: 0 },
    outcome: "correct",
    mistake: false,
    heartCost: 0,
    isRetry: false,
    answeredAt: `2026-11-07T10:0${i}:00.000Z`,
  };
};
const reviewSession = LessonSessionSchema.parse({
  sessionId: "8a4b2c1d-3e5f-4a6b-9c7d-0e1f2a3b4c5d",
  courseId: "en-es",
  unitId: "review",
  lessonId: "review",
  status: "completed",
  startedAt: "2026-11-07T10:00:00.000Z",
  queue: [],
  hiddenExerciseIds: [],
  attempts: ["rv-mc", "rv-wb", "rv-mp"].map(attempt),
  heartsAtStart: 0,
  heartsRemaining: 3,
});
const reviewResult = toLessonResult(
  summarizeSession(reviewSession, "2026-11-07T10:02:30.000Z", undefined, built.review),
  { id: RESULT_ID, timeZone: "UTC" },
);
const lessonResult = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });

function seeded() {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress("en-es"), []);
  client.setQueryData(queryKeys.hearts(), createFullHearts(FIXTURE_NOW));
  client.setQueryData(
    queryKeys.settings(),
    SettingsSchema.parse({
      courseId: "en-es",
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: "2026-11-01T00:00:00.000Z",
    }),
  );
  return client;
}

const onTrack = GoalPlanStatusSchema.parse({
  targetLevel: "A2",
  targetDate: "2027-03-12",
  lessonsLeft: 130,
  daysLeft: 111,
  lessonsPerDay: 1,
  suggestedDailyGoalXp: 20,
  status: "on-track",
});

function renderScreen(
  props: Partial<Parameters<typeof ResultsScreen>[0]> = {},
  result: LessonResult = reviewResult,
) {
  const onContinue = vi.fn();
  const onRetryLesson = vi.fn();
  const save = vi.fn(async () => {});
  const user = userEvent.setup();
  const view = renderWithQueryClient(
    <ResultsScreen
      result={result}
      save={save}
      onContinue={onContinue}
      onRetryLesson={onRetryLesson}
      goalPlan={onTrack}
      {...props}
    />,
    { client: seeded() },
  );
  return { ...view, user, onContinue, onRetryLesson, save };
}

describe("ResultsScreen review mode (LES-023)", () => {
  it("the fixture is a review result scored like a lesson (PD-079)", () => {
    expect(reviewResult.kind).toBe("review");
    expect(reviewResult.xpEarned).toBe(GAME_CONFIG.xpPerLesson + GAME_CONFIG.perfectLessonBonusXp);
  });

  it("AC 10, 12: heading 'Review complete!' with focus, XP / time / accuracy tiles, streak and goal rows, no goal-date row", async () => {
    renderScreen();
    const heading = screen.getByRole("heading", { level: 1, name: REVIEW_RESULTS_HEADING });
    expect(heading).toHaveFocus();
    expect(screen.queryByText(RESULTS_HEADING)).not.toBeInTheDocument();
    const stats = screen.getByRole("list", { name: "Review stats" });
    expect(within(stats).getByText("Total XP")).toBeInTheDocument();
    expect(within(stats).getByText("Time")).toBeInTheDocument();
    expect(within(stats).getByText("Accuracy")).toBeInTheDocument();
    expect(within(stats).getByText(formatAccuracy(1))).toBeInTheDocument();
    expect(await screen.findByTestId("streak-row")).toBeInTheDocument();
    expect(within(stats).getByText(/Daily goal/)).toBeInTheDocument();
    // AC 10: even with a goal plan passed, a review shows no goal-date row.
    expect(screen.queryByTestId("goal-date-row")).not.toBeInTheDocument();
    expect(
      screen.getByText(perfectReviewText(GAME_CONFIG.perfectLessonBonusXp)),
    ).toBeInTheDocument();
  });

  it("AC 11: Continue and 'Review more' call their callbacks; no 'Practice again'", async () => {
    const { user, onContinue, onRetryLesson } = renderScreen();
    expect(screen.queryByRole("button", { name: "Practice again" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: REVIEW_MORE_LABEL }));
    expect(onRetryLesson).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("AC 11: saves the review result once and announces it", async () => {
    const { save } = renderScreen();
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith(reviewResult);
    expect(await screen.findByText("Review saved.")).toBeInTheDocument();
  });

  it("AC 11: a failed save shows the error with 'Try again', which saves again", async () => {
    const save = vi
      .fn<(r: LessonResult) => Promise<void>>()
      .mockRejectedValueOnce(new Error("quota"))
      .mockResolvedValueOnce();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = renderScreen({ save });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(REVIEW_SAVE_ERROR_MESSAGE);
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    // Continue works whatever the save status.
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("a lesson result keeps the lesson copy and the goal-date row", async () => {
    renderScreen({}, lessonResult);
    expect(screen.getByRole("heading", { level: 1, name: RESULTS_HEADING })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practice again" })).toBeInTheDocument();
    expect(await screen.findByTestId("goal-date-row")).toBeInTheDocument();
  });

  it("AC 12: no serious or critical axe violations", async () => {
    const { container } = renderScreen();
    await screen.findByTestId("streak-row");
    const violations = (await axe.run(container)).violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(violations).toEqual([]);
  });
});
