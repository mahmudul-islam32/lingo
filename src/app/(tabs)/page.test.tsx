import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { ToastProvider } from "@/components/ui";
import { renderWithQueryClient } from "@/lib/query/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Settings, UserProgress } from "@/contracts";
import { guestProfileStore } from "@/features/profile";
import { installPromptStore } from "../_pwa/install-prompt-store";
import { FLASH_TOAST_KEY } from "../_shell/flash-toast";
import { DEFAULT_COURSE_ID } from "@/lib/content/constants";
import LearnPage, { metadata } from "./page";
import ProfilePage, { metadata as profileMetadata } from "./profile/page";

/** The feature blocks are mocked: this tests Learn's composition only (PLT-009 AC 1, 2). */
const mocks = vi.hoisted(() => ({
  settings: null as Settings | null,
  progress: {
    status: "success" as "loading" | "error" | "success",
    progress: null as Pick<UserProgress, "completedLessonIds"> | null,
  },
  calls: [] as { name: string; props: Record<string, unknown> }[],
}));

vi.mock("@/features/gamification", () => {
  const block = (name: string) => {
    function Block(props: Record<string, unknown>): ReactElement {
      mocks.calls.push({ name, props });
      return (
        <div data-testid={name} className={props.className as string | undefined}>
          {name}:{String(props.courseId)}
        </div>
      );
    }
    return Block;
  };
  return {
    GamificationTopBar: block("top-bar"),
    StreakLumi: block("streak-lumi"),
    DailyGoalRing: block("daily-goal-ring"),
    useUserProgress: () => mocks.progress,
    settingsQuery: () => ({
      queryKey: ["settings"],
      queryFn: async () => mocks.settings,
    }),
  };
});

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

vi.mock("@/features/path", () => ({
  SkillPath: (props: Record<string, unknown>) => {
    mocks.calls.push({ name: "skill-path", props });
    return <div data-testid="skill-path">skill-path:{String(props.courseId)}</div>;
  },
}));

beforeEach(() => {
  mocks.settings = null;
  mocks.progress = { status: "success", progress: { completedLessonIds: [] } };
  mocks.calls = [];
  window.sessionStorage.clear();
});

const renderLearn = () =>
  renderWithQueryClient(
    <ToastProvider>
      <LearnPage />
    </ToastProvider>,
  );

describe("LearnPage (PLT-009)", () => {
  it("shows top bar, streak Lumi + goal ring row, then the skill path, with one h1", () => {
    renderLearn();
    expect(metadata.title).toBe("Learn");

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Learn");
    expect(h1s[0]).toHaveClass("sr-only");

    const order = ["top-bar", "streak-lumi", "daily-goal-ring", "skill-path"].map((id) =>
      screen.getByTestId(id),
    );
    for (let i = 1; i < order.length; i += 1) {
      expect(
        order[i - 1]!.compareDocumentPosition(order[i]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    // Lumi and the ring share one row.
    const row = screen.getByTestId("learn-header");
    expect(row).toContainElement(screen.getByTestId("streak-lumi"));
    expect(row).toContainElement(screen.getByTestId("daily-goal-ring"));
    // The top bar sticks while the path scrolls (AC 9).
    expect(screen.getByTestId("top-bar")).toHaveClass("sticky", "top-0", "z-10");
  });

  it("uses the default course before settings are read; SkillPath gets a course loader", () => {
    renderLearn();
    expect(screen.getByTestId("skill-path")).toHaveTextContent(`skill-path:${DEFAULT_COURSE_ID}`);
    const path = mocks.calls.find((c) => c.name === "skill-path")!;
    expect(typeof path.props.loadCourse).toBe("function");
  });

  it("follows Settings.courseId once settings are read (a Spanish guest keeps en-es)", async () => {
    mocks.settings = {
      courseId: "en-es",
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
    } as Settings;
    renderLearn();
    await waitFor(() =>
      expect(screen.getByTestId("skill-path")).toHaveTextContent("skill-path:en-es"),
    );
    expect(screen.getByTestId("top-bar")).toHaveTextContent("top-bar:en-es");
    expect(screen.getByTestId("streak-lumi")).toHaveTextContent("streak-lumi:en-es");
    expect(screen.getByTestId("daily-goal-ring")).toHaveTextContent("daily-goal-ring:en-es");
    // PLT-024 AC 8: the Spanish course has no levels, so the caption is its name only.
    await waitFor(() => expect(screen.getByTestId("course-caption")).toHaveTextContent("Spanish"));
    expect(screen.getByTestId("course-caption")).toHaveTextContent(/^Spanish$/);
  });

  it("PLT-024 AC 7: an unknown Settings.courseId (course removed) falls back to en-de", async () => {
    mocks.settings = {
      courseId: "xx-removed",
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
    } as Settings;
    renderLearn();
    expect(await screen.findByText("German · A1")).toBeInTheDocument();
    expect(screen.getByTestId("skill-path")).toHaveTextContent(`skill-path:${DEFAULT_COURSE_ID}`);
    expect(mocks.calls.some((c) => c.props.courseId === "xx-removed")).toBe(false);
  });

  it("PLT-024 AC 9: the caption 'German · A1' sits above the path, as text", async () => {
    renderLearn();
    const caption = screen.getByTestId("course-caption");
    expect(await screen.findByText("German · A1")).toBe(caption);
    expect(caption.tagName).toBe("P");
    expect(
      screen.getByTestId("learn-header").compareDocumentPosition(caption) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      caption.compareDocumentPosition(screen.getByTestId("skill-path")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("PLT-024 AC 9: the caption waits for progress, then shows the available lesson's level", async () => {
    mocks.progress = { status: "loading", progress: null };
    const { rerender } = renderLearn();
    // Course is bundled (resolves quickly); progress still loading → empty, same height.
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId("course-caption")).toBeEmptyDOMElement();
    mocks.progress = { status: "error", progress: null };
    rerender(
      <ToastProvider>
        <LearnPage />
      </ToastProvider>,
    );
    // A results read error counts as nothing completed (like the path).
    expect(await screen.findByText("German · A1")).toBeInTheDocument();
  });

  it("has no temporary lesson list and no page-level spinner (AC 2, AC 11)", () => {
    renderLearn();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-skeleton")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("LearnPage install card (PLT-005, kept by PLT-009)", () => {
  it("sits at the top, above the top bar, when the app can be installed", () => {
    guestProfileStore.setState({ onboardingComplete: true });
    installPromptStore.setState({
      ready: true,
      isIos: true,
      isStandalone: false,
      dismissedAt: null,
      init: () => {},
    });
    renderLearn();
    const card = screen.getByTestId("install-card");
    expect(
      card.compareDocumentPosition(screen.getByTestId("top-bar")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("LearnPage flash toast (PLT-009 AC 4)", () => {
  it("shows the toast queued by a locked lesson's redirect, once", async () => {
    window.sessionStorage.setItem(FLASH_TOAST_KEY, "Finish the earlier lessons first.");
    renderLearn();
    expect(await screen.findByText("Finish the earlier lessons first.")).toBeInTheDocument();
    expect(window.sessionStorage.getItem(FLASH_TOAST_KEY)).toBeNull();
  });
});

describe("ProfilePage", () => {
  it("renders one h1 and the empty state", () => {
    render(<ProfilePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Your profile will appear here.")).toBeInTheDocument();
    expect(profileMetadata.title).toBe("Profile");
  });
});
