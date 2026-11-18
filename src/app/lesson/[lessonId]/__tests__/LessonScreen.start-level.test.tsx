import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Course, PathNode, ProgressRepository, Slug } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import type { ExerciseComponentMap, ExerciseComponentProps } from "@/features/lessons";
import { ContentRepositoryProvider } from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import {
  getLocalSession,
  openLocalSession,
  ProgressRepositoryProvider,
  resetLocalSession,
} from "@/lib/offline";
import { lessonResult } from "@/lib/offline/__tests__/helpers";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { accessOf, isPracticeStart, LEARN_PATH, LessonScreen } from "../LessonScreen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/lesson/x" }));

/**
 * PLT-025 AC 12: routing with mocked path state. Until GAM-011 is merged the real
 * `computePathNodes` ignores `startLevel`; this stand-in opens `fx-l2` only for an "A2"
 * start, so the test proves the route passes the stored level through.
 */
const path = vi.hoisted(() => ({ computePathNodes: vi.fn() }));
vi.mock("@/features/path", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/path")>()),
  computePathNodes: path.computePathNodes,
}));

/** Shows the `practice` flag the route passes to the player (LES-020). */
vi.mock("@/features/lessons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/lessons")>();
  function SpyPlayer(
    props: ComponentProps<typeof actual.HeartsLessonPlayer> & { practice?: boolean },
  ) {
    return (
      <>
        <span data-testid="practice-flag">{String(props.practice)}</span>
        <actual.HeartsLessonPlayer {...props} />
      </>
    );
  }
  return { ...actual, HeartsLessonPlayer: SpyPlayer };
});

function fakeNodes(
  course: Course,
  completed: readonly Slug[],
  _active: Slug | null,
  startLevel?: string,
): PathNode[] {
  return course.units.flatMap((unit) =>
    unit.lessons.map((lesson, index) => ({
      lessonId: lesson.id,
      unitId: unit.id,
      state: completed.includes(lesson.id)
        ? "completed"
        : index === 0 || startLevel === "A2"
          ? "available"
          : "locked",
    })),
  ) as PathNode[];
}

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
function StubWordBank({
  exercise,
  headingId,
  disabled,
  onAnswerChange,
}: ExerciseComponentProps<"word_bank_translate">) {
  return (
    <div>
      <h2 id={headingId} tabIndex={-1}>
        {exercise.prompt}
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onAnswerChange({
            type: "word_bank_translate",
            tiles: exercise.answers[0]!.replace(/[.,!?]/g, "").split(" "),
          })
        }
      >
        Pick correct
      </button>
    </div>
  );
}
const components: ExerciseComponentMap = {
  multiple_choice: StubChoice,
  word_bank_translate: StubWordBank,
};

function renderScreen(progress: ProgressRepository, lessonId: Slug) {
  const Providers = ({ children }: { children: ReactNode }) => (
    <ToastProvider>
      <ContentRepositoryProvider repository={createFixtureRepository()}>
        <ProgressRepositoryProvider load={async () => progress}>
          {children}
        </ProgressRepositoryProvider>
      </ContentRepositoryProvider>
    </ToastProvider>
  );
  return renderWithQueryClient(
    <Providers>
      <LessonScreen
        courseId={FIXTURE_COURSE_ID}
        lessonId={lessonId}
        components={components}
        createId={() => "0b6f1c2e-3d4a-4b5c-8d6e-7f8091a2b3c4"}
      />
    </Providers>,
    { client: createTestQueryClient() },
  );
}

async function saveSettings(startLevel?: "A1" | "A2") {
  const shared = await getLocalSession();
  await shared.profile.updateSettings({
    courseId: FIXTURE_COURSE_ID,
    dailyGoalXp: 20,
    ...(startLevel ? { startLevel } : {}),
  });
}

const firstPrompt = () =>
  screen.findByRole("heading", { level: 2, name: "Which one means 'hello'?" });

beforeEach(() => {
  router.replace.mockReset();
  resetLocalSession();
  window.sessionStorage.clear();
  path.computePathNodes.mockReset().mockImplementation(fakeNodes);
});

describe("LessonScreen with a start level (PLT-025 AC 12)", () => {
  it("passes settings.startLevel to computePathNodes: an A2 starter opens the lesson", async () => {
    await saveSettings("A2");
    const session = await openLocalSession({ forceMemory: true });
    renderScreen(session.progress, "fx-l2");
    expect(await firstPrompt()).toBeInTheDocument();
    expect(path.computePathNodes).toHaveBeenCalledWith(expect.anything(), [], null, "A2");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("without a start level (or A1) the same lesson is locked and redirects to Learn", async () => {
    await saveSettings("A1");
    const session = await openLocalSession({ forceMemory: true });
    renderScreen(session.progress, "fx-l2");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(LEARN_PATH));
    expect(path.computePathNodes).toHaveBeenCalledWith(expect.anything(), [], null, "A1");
  });

  it("before onboarding (no settings) the start level is undefined", async () => {
    const session = await openLocalSession({ forceMemory: true });
    renderScreen(session.progress, "fx-l1");
    expect(await firstPrompt()).toBeInTheDocument();
    expect(path.computePathNodes).toHaveBeenCalledWith(expect.anything(), [], null, undefined);
  });
});

describe("LessonScreen practice flag (PLT-025 AC 13, 14)", () => {
  it("a lesson completed before it starts opens with practice", async () => {
    const shared = await getLocalSession();
    await shared.progress.saveLessonResult(
      lessonResult({ courseId: FIXTURE_COURSE_ID, unitId: "fx-unit-1", lessonId: "fx-l1" }),
    );
    const session = await openLocalSession({ forceMemory: true });
    renderScreen(session.progress, "fx-l1");
    expect(await firstPrompt()).toBeInTheDocument();
    expect(screen.getByTestId("practice-flag")).toHaveTextContent("true");
  });

  it("a first completion is not practice; Practice again after the save is", async () => {
    const session = await openLocalSession({ forceMemory: true });
    renderScreen(session.progress, "fx-l1");
    const user = userEvent.setup();
    expect(await firstPrompt()).toBeInTheDocument();
    expect(screen.getByTestId("practice-flag")).toHaveTextContent("false");
    for (let i = 0; i < 2; i += 1) {
      await user.click(await screen.findByRole("button", { name: "Pick correct" }));
      await user.click(screen.getByRole("button", { name: "Check" }));
      await user.click(await screen.findByRole("button", { name: "Continue" }));
    }
    await screen.findByRole("heading", { level: 1, name: "Lesson complete!" });
    await waitFor(async () =>
      expect(await session.progress.listLessonResults(FIXTURE_COURSE_ID)).toHaveLength(1),
    );
    await user.click(await screen.findByRole("button", { name: "Practice again" }));
    expect(await firstPrompt()).toBeInTheDocument();
    expect(screen.getByTestId("practice-flag")).toHaveTextContent("true");
  });

  it("pure helpers: accessOf forwards the level, isPracticeStart is completion", () => {
    expect(isPracticeStart(["a"], "a")).toBe(true);
    expect(isPracticeStart([], "a")).toBe(false);
    const course = {
      units: [{ id: "u", lessons: [{ id: "a" }, { id: "b" }] }],
    } as unknown as Course;
    expect(accessOf(course, [], "b")).toBe("locked");
    expect(accessOf(course, [], "b", "A2")).toBe("open");
  });
});
