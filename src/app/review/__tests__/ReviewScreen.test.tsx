import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  REVIEW_SESSION_ID,
  type ProgressRepository,
  type ReviewCandidate,
  type ReviewSelection,
} from "@/contracts";
import { ToastProvider } from "@/components/ui";
import type { ExerciseComponentMap, ExerciseComponentProps } from "@/features/lessons";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import {
  createGermanFixtureRepository,
  GERMAN_FIXTURE_COURSE_ID as DE,
} from "@/lib/content/__fixtures__/german-fixture-course";
import { openLocalSession, ProgressRepositoryProvider, resetLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import type { ReviewQueueState } from "../review-deps";
import {
  GO_TO_PRACTICE,
  PRACTICE_PATH,
  REVIEW_EMPTY_TEXT,
  REVIEW_EMPTY_TITLE,
  ReviewScreen,
} from "../ReviewScreen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/review" }));

const RESULT_ID = "0b6f1c2e-3d4a-4b5c-8d6e-7f8091a2b3c4";
const ERROR_HEADING = "We couldn't load this lesson.";

function StubChoice({
  exercise,
  headingId,
  disabled,
  onAnswerChange,
}: ExerciseComponentProps<"multiple_choice">) {
  return (
    <div>
      <h2 id={headingId} tabIndex={-1}>
        {exercise.prompt}
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onAnswerChange({ type: "multiple_choice", optionId: exercise.correctOptionId })
        }
      >
        Pick correct
      </button>
    </div>
  );
}
const components: ExerciseComponentMap = { multiple_choice: StubChoice };

const CANDIDATES: ReviewCandidate[] = [
  { lessonId: "de-a1-u01-l1-hallo", exerciseId: "de-a1-u01-l1-ex01" },
  { lessonId: "de-a1-u01-l2-wie-geht-s", exerciseId: "de-a1-u01-l2-ex01" },
];

function selection(candidates: ReviewCandidate[]): ReviewSelection {
  return { candidates, dueCount: candidates.length, eligibleCount: candidates.length };
}

function queueOf(state: Partial<ReviewQueueState>): ReviewQueueState {
  return {
    selection: selection(CANDIDATES),
    isPending: false,
    error: null,
    refetch: vi.fn(async () => undefined),
    ...state,
  };
}

async function renderReview(
  queue: ReviewQueueState,
  repository: BundledContentRepository = createGermanFixtureRepository(),
  progress?: ProgressRepository,
  { zeroHearts = false }: { zeroHearts?: boolean } = {},
) {
  const session = await openLocalSession({ forceMemory: true });
  await session.profile.updateSettings({ courseId: DE, dailyGoalXp: 20 });
  if (zeroHearts) {
    const now = new Date().toISOString();
    await session.progress.saveHearts({ current: 0, refillStartedAt: now, updatedAt: now });
  }
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), await session.profile.getSettings());
  const useQueue = vi.fn(() => queue);
  const Providers = ({ children }: { children: ReactNode }) => (
    <ToastProvider>
      <ContentRepositoryProvider repository={repository}>
        <ProgressRepositoryProvider load={async () => progress ?? session.progress}>
          {children}
        </ProgressRepositoryProvider>
      </ContentRepositoryProvider>
    </ToastProvider>
  );
  const view = renderWithQueryClient(
    <Providers>
      <ReviewScreen useQueue={useQueue} components={components} createId={() => RESULT_ID} />
    </Providers>,
    { client },
  );
  return { ...view, client, session, useQueue };
}

async function seriousViolations() {
  const results = await axe.run(document.body, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

beforeEach(() => {
  router.push.mockReset();
  resetLocalSession();
  window.sessionStorage.clear();
});

describe("/review (PLT-029)", () => {
  it("9: shows the player skeleton while the queue loads", async () => {
    await renderReview(queueOf({ isPending: true, selection: undefined }));
    expect(screen.getByTestId("player-skeleton")).toBeInTheDocument();
  });

  it("5: asks the queue for the active course", async () => {
    const { useQueue } = await renderReview(queueOf({}));
    await screen.findByRole("button", { name: "Pick correct" });
    expect(useQueue).toHaveBeenCalledWith(DE);
  });

  it("8, 13: empty queue → Lumi, the copy, a focused heading and 'Go to Practice'", async () => {
    await renderReview(queueOf({ selection: selection([]) }));
    const heading = await screen.findByRole("heading", { level: 1, name: REVIEW_EMPTY_TITLE });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText(REVIEW_EMPTY_TEXT)).toBeVisible();
    expect(screen.getByRole("link", { name: GO_TO_PRACTICE })).toHaveAttribute(
      "href",
      PRACTICE_PATH,
    );
    expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
    expect(await seriousViolations()).toEqual([]);
  });

  it("8: candidates whose lessons are all gone → the empty state", async () => {
    await renderReview(queueOf({ selection: selection([{ lessonId: "gone", exerciseId: "x" }]) }));
    expect(
      await screen.findByRole("heading", { level: 1, name: REVIEW_EMPTY_TITLE }),
    ).toBeVisible();
  });

  it("10: a failed queue read → the error state; Try again re-reads, Back goes to Practice", async () => {
    const queue = queueOf({ error: new Error("disk"), selection: undefined });
    await renderReview(queue);
    expect(await screen.findByRole("heading", { name: ERROR_HEADING })).toBeVisible();
    expect(await seriousViolations()).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(queue.refetch).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Back to Learn" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(router.push).toHaveBeenCalledWith(PRACTICE_PATH);
  });

  it("10: every candidate lesson failing to load (not missing) → the error state", async () => {
    const good = createGermanFixtureRepository();
    const repository = {
      ...good,
      getLesson: vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    };
    await renderReview(queueOf({}), repository);
    expect(await screen.findByRole("heading", { name: ERROR_HEADING })).toBeVisible();
  });

  it("6, 7, 12: plays the review, saves a review result, invalidates progress, Continue → Practice", async () => {
    // AC 7: no path lock, and 0 hearts don't block a review.
    const { session, client } = await renderReview(queueOf({}), undefined, undefined, {
      zeroHearts: true,
    });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const user = userEvent.setup();
    for (let i = 0; i < 2; i += 1) {
      await user.click(await screen.findByRole("button", { name: "Pick correct" }));
      await user.click(screen.getByRole("button", { name: "Check" }));
      await user.click(await screen.findByRole("button", { name: "Continue" }));
    }
    expect(
      await screen.findByRole("heading", { level: 1, name: "Review complete!" }),
    ).toBeVisible();
    await waitFor(async () =>
      expect(await session.progress.listLessonResults(DE)).toEqual([
        expect.objectContaining({
          id: RESULT_ID,
          kind: "review",
          lessonId: REVIEW_SESSION_ID,
          exerciseOutcomes: [
            expect.objectContaining({ lessonId: "de-a1-u01-l1-hallo", outcome: "correct" }),
            expect.objectContaining({ lessonId: "de-a1-u01-l2-wie-geht-s", outcome: "correct" }),
          ],
        }),
      ]),
    );
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: queryKeys.progress(DE) }),
      ),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(router.push).toHaveBeenCalledWith(PRACTICE_PATH);
  });

  it("6: 'Review more' re-reads the queue and starts a new review without a reload", async () => {
    const queue = queueOf({ selection: selection(CANDIDATES.slice(0, 1)) });
    await renderReview(queue);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Pick correct" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { level: 1, name: "Review complete!" });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Review more" }));
    });
    expect(queue.refetch).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Pick correct" })).toBeInTheDocument();
  });
});
