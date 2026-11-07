import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressRepository } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import type { ExerciseComponentMap, ExerciseComponentProps } from "@/features/lessons";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import { openLocalSession, ProgressRepositoryProvider, StorageError } from "@/lib/offline";
import {
  LEARN_PATH,
  LessonScreen,
  SAVE_FAILED_TOAST_TITLE,
  SAVED_TOAST_TITLE,
} from "../LessonScreen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/lesson/x" }));

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
  lessonId = "fx-l1",
}: {
  repository?: BundledContentRepository;
  progress: ProgressRepository;
  lessonId?: string;
}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>
      <ContentRepositoryProvider repository={repository}>
        <ProgressRepositoryProvider load={async () => progress}>
          {children}
        </ProgressRepositoryProvider>
      </ContentRepositoryProvider>
    </ToastProvider>
  );
  return render(
    <LessonScreen
      courseId={FIXTURE_COURSE_ID}
      lessonId={lessonId}
      components={components}
      createId={() => RESULT_ID}
    />,
    { wrapper },
  );
}

async function playToTheEnd() {
  const user = userEvent.setup();
  for (let i = 0; i < 2; i += 1) {
    await user.click(await screen.findByRole("button", { name: "Pick correct" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));
  }
}

beforeEach(() => {
  router.push.mockReset();
});
afterEach(() => vi.restoreAllMocks());

describe("LessonScreen (PLT-007, PLT-008)", () => {
  it("shows the skeleton, then the first exercise of the lesson", async () => {
    const session = await openLocalSession({ forceMemory: true });
    renderScreen({ progress: session.progress });
    expect(screen.getByTestId("player-skeleton")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Which one means 'hello'?" }),
    ).toBeInTheDocument();
  });

  it("shows the lesson error state for invalid content, and goes back to Learn", async () => {
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
    expect(repository.getLesson).toHaveBeenCalledTimes(2);
    await userEvent.click(await screen.findByRole("button", { name: "Back to Learn" }));
    expect(router.push).toHaveBeenCalledWith(LEARN_PATH);
  });

  it("saves the result on the device once, then returns to Learn with a toast", async () => {
    const session = await openLocalSession({ forceMemory: true });
    const save = vi.spyOn(session.progress, "saveLessonResult");
    renderScreen({ progress: session.progress });
    await playToTheEnd();

    await waitFor(() => expect(router.push).toHaveBeenCalledWith(LEARN_PATH));
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
    expect(await screen.findByText(SAVED_TOAST_TITLE)).toBeInTheDocument();
    expect(screen.getByText("+15 XP")).toBeInTheDocument();
  });

  it("shows an error toast (no crash) when saving fails, and still returns to Learn", async () => {
    const progress = {
      saveLessonResult: vi.fn(async () => {
        throw new StorageError("saveLessonResult", new Error("quota"));
      }),
    } as unknown as ProgressRepository;
    renderScreen({ progress });
    await playToTheEnd();
    expect(await screen.findByText(SAVE_FAILED_TOAST_TITLE)).toBeInTheDocument();
    expect(router.push).toHaveBeenCalledWith(LEARN_PATH);
  });
});
