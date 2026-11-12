import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonSchema, type HeartsState, type Lesson } from "@/contracts";
import { HeartsMeter, useHearts } from "@/features/gamification";
import { getLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import type { ExerciseComponentMap, ExerciseComponentProps } from "../../exercises/types";
import type { LessonSessionSummary } from "../../player";
import { SKELETON_DELAY_MS } from "../../player/PlayerSkeleton";
import { fixtureLesson, makeClock, mcOnlyLesson, SESSION_ID } from "../../player/testing/fixtures";
import { stubComponents } from "../../player/testing/stubs";
import { HeartsLessonPlayer, type HeartsLessonPlayerProps } from "../HeartsLessonPlayer";
import { HEART_LOSS_SHRINK_MS } from "../LessonHeartsMeter";
import { OUT_OF_HEARTS_HEADING, OUT_OF_HEARTS_REASSURANCE } from "../OutOfHeartsScreen";

// Real GAM-005 hooks over a stubbed local session; `useLoseHearts` is wrapped with a spy
// so each call's cost is visible while the real cache update and save still run.
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

const NOW = new Date("2026-11-08T10:00:00.000Z");

function stored(current: number, refillStartedAt: string | null = null): HeartsState {
  return {
    current,
    refillStartedAt: current < 5 ? (refillStartedAt ?? NOW.toISOString()) : null,
    updatedAt: "2026-11-08T09:00:00.000Z",
  };
}

/** A local session whose hearts live in memory (a "reload" reads what was saved). */
function stubSession(initial: HeartsState | Error) {
  let hearts = initial;
  const getHearts = vi.fn(async () => {
    if (hearts instanceof Error) throw hearts;
    return hearts;
  });
  const saveHearts = vi.fn(async (state: HeartsState) => {
    hearts = state;
  });
  const session = { progress: { getHearts, saveHearts } } as unknown as LocalSession;
  vi.mocked(getLocalSession).mockResolvedValue(session);
  return { getHearts, saveHearts, saved: () => hearts };
}

/** Speak stub (the shared stubs leave speak out) and a match-pairs stub with 3 mismatches. */
function StubSpeak({ headingId, disabled, onComplete }: ExerciseComponentProps<"speak">) {
  return (
    <div>
      <h2 id={headingId} tabIndex={-1}>
        Say it
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onComplete({ type: "speak", skipped: false, transcripts: ["nada"] })}
      >
        Say something wrong
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onComplete({ type: "speak", skipped: true, transcripts: [] })}
      >
        Can&apos;t speak now
      </button>
    </div>
  );
}

function StubPairs({
  exercise,
  headingId,
  disabled,
  onComplete,
}: ExerciseComponentProps<"match_pairs">) {
  const matches = exercise.pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id }));
  return (
    <div>
      <h2 id={headingId} tabIndex={-1}>
        Match the pairs
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onComplete({ type: "match_pairs", matches, mismatchCount: 3 })}
      >
        Finish with 3 mismatches
      </button>
    </div>
  );
}

const components: ExerciseComponentMap = {
  ...stubComponents,
  match_pairs: StubPairs,
  speak: StubSpeak,
};

const only = (...ids: string[]): Lesson =>
  LessonSchema.parse({
    ...fixtureLesson,
    exercises: ids.map((id) => fixtureLesson.exercises.find((e) => e.id === id)!),
  });

/** The Learn top bar's meter, reading the same hearts query (AC 3, 14). */
function TopBar() {
  const { view } = useHearts();
  return view ? (
    <div data-testid="top-bar">
      <HeartsMeter current={view.current} max={view.max} />
    </div>
  ) : null;
}

function setup(
  hearts: HeartsState | Error,
  {
    lesson = mcOnlyLesson,
    topBar = false,
    ...props
  }: Partial<HeartsLessonPlayerProps> & { topBar?: boolean } = {},
) {
  const session = stubSession(hearts);
  const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
  const onQuit = vi.fn();
  const user = userEvent.setup();
  const client = createTestQueryClient();
  const ui = (
    <>
      {topBar && <TopBar />}
      <HeartsLessonPlayer
        lesson={lesson}
        learningLanguage="es"
        knownLanguage="en"
        onFinish={onFinish}
        onQuit={onQuit}
        components={components}
        now={makeClock()}
        createId={() => SESSION_ID}
        random={() => 0}
        {...props}
      />
    </>
  );
  const view = renderWithQueryClient(ui, { client });
  return { ...session, ...view, user, onFinish, onQuit, ui };
}

const lessonMeter = () =>
  within(screen.getByTestId("hearts-slot")).getByRole("img", { name: /^Hearts:/ });
const prompt = () => screen.findByRole("heading", { level: 2 });
const click = (user: ReturnType<typeof userEvent.setup>, name: string | RegExp) =>
  user.click(screen.getByRole("button", { name }));

async function answerWrong(user: ReturnType<typeof userEvent.setup>) {
  await click(user, "Pick wrong");
  await click(user, "Check");
}
async function answerRight(user: ReturnType<typeof userEvent.setup>) {
  await click(user, "Pick correct");
  await click(user, "Check");
}

function stubMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  loseSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("HeartsLessonPlayer", () => {
  it("AC 15: shows the player skeleton while hearts load, then the first exercise", async () => {
    let release!: (state: HeartsState) => void;
    const { getHearts } = setup(stored(5));
    getHearts.mockImplementationOnce(
      () => new Promise<HeartsState>((resolve) => (release = resolve)),
    );
    // The query has not resolved yet: no exercise, the skeleton's status is there.
    expect(screen.getByRole("status")).toHaveTextContent("Loading lesson");
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByTestId("hearts-slot")).not.toBeInTheDocument();
    await waitFor(() => expect(getHearts).toHaveBeenCalled());
    await act(async () => release(stored(5)));
    expect(await prompt()).toHaveTextContent("hello");
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 5 of 5");
    expect(SKELETON_DELAY_MS).toBeGreaterThan(0);
  });

  it("AC 1, 3: the header meter starts at the hearts shown in the Learn top bar", async () => {
    setup(stored(3), { topBar: true });
    await prompt();
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 3 of 5");
    expect(
      within(screen.getByTestId("top-bar")).getByRole("img", { name: /^Hearts:/ }),
    ).toHaveAccessibleName("Hearts: 3 of 5");
  });

  it("AC 4: 5 hearts -> wrong answer -> 4 at once, loseHearts(1) once, saved", async () => {
    const { user, saveHearts } = setup(stored(5));
    await prompt();
    await answerWrong(user);
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 4 of 5");
    expect(loseSpy).toHaveBeenCalledTimes(1);
    expect(loseSpy).toHaveBeenCalledWith(1);
    await waitFor(() => expect(saveHearts).toHaveBeenCalledTimes(1));
    expect(saveHearts.mock.calls[0]![0].current).toBe(4);
    // Continue doesn't lose another one.
    await click(user, "Continue");
    expect(loseSpy).toHaveBeenCalledTimes(1);
  });

  it("AC 4: correct, skipped and speak exercises never change hearts", async () => {
    const lesson = only("mc-1", "sp-1", "mc-2");
    const { user, onFinish, saveHearts } = setup(stored(5), { lesson });
    await prompt();
    await answerRight(user);
    await click(user, "Continue");
    await click(user, "Say something wrong");
    await click(user, "Continue");
    // The wrong speak attempt is re-queued after mc-2; skip it then.
    await click(user, "Cannot play");
    expect(await prompt()).toHaveTextContent("Say it");
    await click(user, "Can't speak now");
    await click(user, "Continue");
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 5 of 5");
    expect(loseSpy).not.toHaveBeenCalled();
    expect(saveHearts).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("AC 5: match pairs with 3 mismatches cost exactly 1 heart when the exercise completes", async () => {
    const { user } = setup(stored(5), { lesson: only("mp-1") });
    await prompt();
    expect(loseSpy).not.toHaveBeenCalled();
    await click(user, "Finish with 3 mismatches");
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 4 of 5");
    expect(loseSpy).toHaveBeenCalledTimes(1);
    expect(loseSpy).toHaveBeenCalledWith(1);
  });

  it("AC 6: announces each loss in a polite live region", async () => {
    const { user } = setup(stored(2));
    await prompt();
    const region = () =>
      screen.getAllByRole("status").find((el) => el.closest("[data-testid=hearts-slot]") !== null)!;
    expect(region()).toHaveAttribute("aria-live", "polite");
    expect(region()).toBeEmptyDOMElement();
    await answerWrong(user);
    await waitFor(() => expect(region()).toHaveTextContent("You lost a heart. 1 left."));
    await click(user, "Continue");
    await answerRight(user);
    await click(user, "Continue");
    await answerWrong(user);
    await waitFor(() => expect(region()).toHaveTextContent("You lost your last heart."));
  });

  describe("AC 7: heart-loss animation", () => {
    it("shrinks the meter briefly (at most 400 ms) when motion is allowed", async () => {
      stubMotion(false);
      const { user } = setup(stored(5));
      await prompt();
      const meter = screen.getByTestId("lesson-hearts-meter");
      expect(meter).not.toHaveAttribute("data-animating");
      await answerWrong(user);
      expect(meter).toHaveAttribute("data-animating", "true");
      expect(meter.className).toContain("motion-safe:scale-75");
      expect(HEART_LOSS_SHRINK_MS * 2).toBeLessThanOrEqual(400);
      await waitFor(() => expect(meter).not.toHaveAttribute("data-animating"));
    });

    it("under prefers-reduced-motion the number changes with no animation", async () => {
      stubMotion(true);
      const { user } = setup(stored(5));
      await prompt();
      await answerWrong(user);
      const meter = screen.getByTestId("lesson-hearts-meter");
      expect(lessonMeter()).toHaveAccessibleName("Hearts: 4 of 5");
      expect(meter).not.toHaveAttribute("data-animating");
      expect(meter.className).not.toContain("scale-75");
    });
  });

  it("AC 8-11: 1 heart -> wrong -> feedback with the answer -> Continue -> out of hearts, no result", async () => {
    const onOutOfHearts = vi.fn();
    const { user, onFinish, onQuit, saved } = setup(stored(1), { onOutOfHearts });
    await prompt();
    await answerWrong(user);
    // AC 11: the feedback still shows the correct answer first.
    const panel = screen.getByTestId("feedback-panel");
    expect(within(panel).getByText("Hola")).toBeInTheDocument();
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 0 of 5");
    expect(screen.queryByText(OUT_OF_HEARTS_HEADING)).not.toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: "Continue" }));
    const heading = await screen.findByRole("heading", { level: 1, name: OUT_OF_HEARTS_HEADING });
    expect(heading).toHaveFocus();
    // The loss just happened: next heart in 4 h, all five in 20 h.
    expect(screen.getByText("Next heart in 4 h")).toBeInTheDocument();
    expect(screen.getByText("Full in 20 h")).toBeInTheDocument();
    expect(screen.getByText(OUT_OF_HEARTS_REASSURANCE)).toBeInTheDocument();
    const lumi = screen.getByTestId("out-of-hearts").querySelector("svg[data-pose]");
    expect(lumi).toHaveAttribute("data-pose", "ember");
    expect(lumi).toHaveAttribute("width", "160");
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute("href", "/");

    // AC 9: no quit button, Escape opens nothing.
    expect(screen.queryByRole("button", { name: "Quit lesson" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // AC 10: no result, no XP: the results flow (onFinish) never runs.
    expect(onFinish).not.toHaveBeenCalled();
    expect(onQuit).not.toHaveBeenCalled();
    expect(onOutOfHearts).toHaveBeenCalledTimes(1);
    expect(onOutOfHearts.mock.calls[0]![0]).toMatchObject({ status: "out_of_hearts" });
    await waitFor(() => expect(saved()).toMatchObject({ current: 0 }));
  });

  it("PD-018: running out on the last exercise beats completing it", async () => {
    const { user, onFinish } = setup(stored(2));
    await prompt();
    await answerWrong(user); // mc-1 wrong: 1 left, re-queued at the end
    await click(user, "Continue");
    await answerRight(user); // mc-2
    await click(user, "Continue");
    expect(await prompt()).toHaveTextContent("hello"); // mc-1 again, the last exercise
    await answerWrong(user);
    await click(user, "Continue");
    expect(
      await screen.findByRole("heading", { level: 1, name: OUT_OF_HEARTS_HEADING }),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("AC 2: start gate at 0 hearts shows the out-of-hearts screen instead of the player", async () => {
    // Last heart lost 48 min ago: next in 3 h 12 min, full in 19 h 12 min.
    const lostAt = new Date(NOW.getTime() - 48 * 60_000).toISOString();
    const { onFinish } = setup(stored(0, lostAt));
    const heading = await screen.findByRole("heading", { level: 1, name: OUT_OF_HEARTS_HEADING });
    expect(heading).toHaveFocus();
    expect(screen.getByText("Next heart in 3 h 12 min")).toBeInTheDocument();
    expect(screen.getByText("Full in 19 h 12 min")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Quit lesson" })).not.toBeInTheDocument();
    // PD-018: nothing but the time lines; no practice or purchase promises.
    expect(screen.queryByText(/practice|buy|refill now|gems/i)).not.toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    expect(loseSpy).not.toHaveBeenCalled();
  });

  it("AC 12: hearts lost before a confirmed quit stay lost, also after a reload", async () => {
    const first = setup(stored(5), { topBar: true });
    await prompt();
    await answerWrong(first.user);
    await click(first.user, "Continue");
    await click(first.user, "Quit lesson");
    await click(first.user, "Quit");
    expect(first.onQuit).toHaveBeenCalledTimes(1);
    expect(within(screen.getByTestId("top-bar")).getByRole("img")).toHaveAccessibleName(
      "Hearts: 4 of 5",
    );
    await waitFor(() => expect(first.saved()).toMatchObject({ current: 4 }));
    first.unmount();

    // "Reload": a fresh query client reads what was saved.
    const saved = first.saved() as HeartsState;
    setup(saved, { topBar: true });
    await prompt();
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 4 of 5");
  });

  it("AC 13: a failed save is logged and the lesson goes on with the in-memory count", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { user, saveHearts } = setup(stored(5));
    saveHearts.mockRejectedValue(new Error("disk full"));
    await prompt();
    await answerWrong(user);
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 4 of 5");
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("could not save a heart loss"),
        expect.any(Error),
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await click(user, "Continue");
    await answerWrong(user);
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 3 of 5");
  });

  it("AC 14: a heart refilled mid-lesson is not added to the lesson counter", async () => {
    const { user, client } = setup(stored(4), { topBar: true });
    await prompt();
    await answerWrong(user);
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 3 of 5");
    // A refill lands in the hearts query (e.g. the refill timer or another tab).
    act(() => client.setQueryData(queryKeys.hearts(), stored(5)));
    await waitFor(() =>
      expect(within(screen.getByTestId("top-bar")).getByRole("img")).toHaveAccessibleName(
        "Hearts: 5 of 5",
      ),
    );
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 3 of 5");
    await click(user, "Continue");
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 3 of 5");
  });

  it("AC 16: if hearts can't be read, the lesson starts with full hearts", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    setup(new Error("IndexedDB unavailable"));
    expect(await prompt()).toHaveTextContent("hello");
    expect(lessonMeter()).toHaveAccessibleName("Hearts: 5 of 5");
    expect(screen.queryByText(OUT_OF_HEARTS_HEADING)).not.toBeInTheDocument();
  });

  it("AC 17: header items and the out-of-hearts button keep their mobile layout classes", async () => {
    const { user } = setup(stored(1));
    await prompt();
    const slot = screen.getByTestId("hearts-slot");
    expect(slot.className).toContain("shrink-0");
    expect(screen.getByTestId("lesson-hearts-meter").className).toContain("whitespace-nowrap");
    await answerWrong(user);
    await click(user, "Continue");
    const link = await screen.findByRole("link", { name: "Back to Learn" });
    expect(link.className).toContain("min-h-12");
    expect(link.parentElement!.className).toContain("sticky");
    expect(link.parentElement!.className).toContain("bottom-0");
  });
});
