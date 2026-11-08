import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressRepository } from "@/contracts";
import type { ExerciseComponentMap, ExerciseComponentProps } from "@/features/lessons";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import { openLocalSession, ProgressRepositoryProvider, StorageError } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { LEARN_PATH, LessonScreen } from "../LessonScreen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/lesson/x" }));

/** LES-008 copy (not exported from the lessons barrel). */
const RESULTS_HEADING = "Lesson complete!";
const SAVE_ERROR_MESSAGE = "We couldn't save this lesson on your device.";
const RESULT_ID = "0b6f1c2e-3d4a-4b5c-8d6e-7f8091a2b3c4";

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

function renderScreen({
  repository = createFixtureRepository(),
  progress,
}: {
  repository?: BundledContentRepository;
  progress: ProgressRepository;
}) {
  const client = createTestQueryClient();
  const Providers = ({ children }: { children: ReactNode }) => (
    <ContentRepositoryProvider repository={repository}>
      <ProgressRepositoryProvider load={async () => progress}>
        {children}
      </ProgressRepositoryProvider>
    </ContentRepositoryProvider>
  );
  return renderWithQueryClient(
    <Providers>
      <LessonScreen
        courseId={FIXTURE_COURSE_ID}
        lessonId="fx-l1"
        components={components}
        createId={() => RESULT_ID}
      />
    </Providers>,
    { client },
  );
}

async function playToTheEnd() {
  const user = userEvent.setup();
  for (let i = 0; i < 2; i += 1) {
    await user.click(await screen.findByRole("button", { name: "Pick correct" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));
  }
  return user;
}

beforeEach(() => router.push.mockReset());

describe("LessonScreen (PLT-007, PLT-008)", () => {
  it("shows the skeleton, then the first exercise of the lesson", async () => {
    const session = await openLocalSession({ forceMemory: true });
    renderScreen({ progress: session.progress });
    expect(screen.getByTestId("player-skeleton")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Which one means 'hello'?" }),
    ).toBeInTheDocument();
  });

  it("shows the lesson error state for invalid content, with retry and back to Learn", async () => {
    const good = createFixtureRepository();
    const repository = {
      ...good,
      getLesson: vi.fn(async () => {
        throw new Error("invalid");
      }),
    };
    const session = await openLocalSession({ forceMemory: true });
    renderScreen({ repository, progress: session.progress });
    expect(
      await screen.findByRole("heading", { name: "We couldn't load this lesson." }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(repository.getLesson).toHaveBeenCalledTimes(2));
    await userEvent.click(await screen.findByRole("button", { name: "Back to Learn" }));
    expect(router.push).toHaveBeenCalledWith(LEARN_PATH);
  });

  it("finishing shows the results screen, saves on the device once and refreshes progress", async () => {
    const session = await openLocalSession({ forceMemory: true });
    const save = vi.spyOn(session.progress, "saveLessonResult");
    const { client } = renderScreen({ progress: session.progress });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const user = await playToTheEnd();

    expect(await screen.findByRole("heading", { level: 1, name: RESULTS_HEADING })).toBeVisible();
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: queryKeys.progress(FIXTURE_COURSE_ID),
        refetchType: "all",
      }),
    );
    expect(save).toHaveBeenCalledTimes(1);
    const results = await session.progress.listLessonResults(FIXTURE_COURSE_ID);
    expect(results).toEqual([
      expect.objectContaining({
        id: RESULT_ID,
        lessonId: "fx-l1",
        unitId: "fx-unit-1",
        exerciseCount: 2,
        mistakeCount: 0,
        perfect: true,
        xpEarned: 15,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    ]);
    expect(results[0]!.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(router.push).toHaveBeenCalledWith(LEARN_PATH);
  });

  it("a storage failure shows the results screen's error state, never a crash", async () => {
    const progress = {
      saveLessonResult: vi.fn(async () => {
        throw new StorageError("saveLessonResult", new Error("quota"));
      }),
    } as unknown as ProgressRepository;
    renderScreen({ progress });
    await playToTheEnd();
    expect(await screen.findByText(SAVE_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: RESULTS_HEADING })).toBeVisible();
  });
});
