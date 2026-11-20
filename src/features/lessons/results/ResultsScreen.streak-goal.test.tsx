import { act, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LessonResultSchema,
  SettingsSchema,
  type DailyGoalXp,
  type LessonResult,
} from "@/contracts";
import { createFullHearts } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { MAX_SPARKLE_MS } from "./CelebrationBanner";
import { toLessonResult } from "./result";
import { ANNOUNCEMENT_CLEAR_MS, ResultsScreen } from "./ResultsScreen";
import {
  FIXTURE_NOW,
  LESSON_DATE,
  RESULT_ID,
  YESTERDAY,
  nextResultId,
  oneMistakeSummary,
  perfectSummary,
} from "./testing/fixtures";

const mocks = vi.hoisted(() => ({
  getLocalSession: (() => new Promise(() => {})) as () => Promise<unknown>,
}));
vi.mock("@/lib/offline", () => ({ getLocalSession: () => mocks.getLocalSession() }));

/** This lesson: perfect, 15 XP, on LESSON_DATE, course "en-es". */
const result = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });
const COURSE = result.courseId;
const tenXp = toLessonResult(oneMistakeSummary, { id: RESULT_ID, timeZone: "UTC" });

function earlier(localDate: string, base: LessonResult = result): LessonResult {
  return LessonResultSchema.parse({ ...base, id: nextResultId(), localDate });
}

function seeded(results: readonly LessonResult[], goal: DailyGoalXp = 20) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress(COURSE), [...results]);
  client.setQueryData(queryKeys.hearts(), createFullHearts(FIXTURE_NOW));
  client.setQueryData(
    queryKeys.settings(),
    SettingsSchema.parse({
      courseId: COURSE,
      dailyGoalXp: goal,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: "2026-11-01T00:00:00.000Z",
    }),
  );
  return client;
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

function renderScreen(
  client = seeded([]),
  save: (r: LessonResult) => Promise<void> = () => Promise.resolve(),
) {
  return renderWithQueryClient(<ResultsScreen result={result} save={save} onContinue={vi.fn()} />, {
    client,
  });
}

/** Text a screen reader reads: skips `aria-hidden` subtrees. */
function readableText(el: Element): string {
  let out = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent ?? "";
    else if (node instanceof Element && node.getAttribute("aria-hidden") !== "true") {
      out += ` ${readableText(node)} `;
    }
  });
  return out.replace(/\s+/g, " ").trim();
}

const items = () =>
  within(screen.getByRole("list", { name: "Lesson stats" })).getAllByRole("listitem");
/** The Streak and Daily goal rows as read by a screen reader. */
const rows = () => items().slice(3).map(readableText);
const banner = () => screen.queryByTestId("celebration-banner");
const announcement = () => screen.getByTestId("celebration-announcement");

/** The fixture lesson is perfect, so the gold pill always carries the bonus line. */
const PERFECT_LINE = "Perfect lesson! +5 bonus XP";

/**
 * FIX-010: an event line is shown (and read in the page) exactly once, in its row; the
 * gold pill never repeats it. The polite announcement (AC 7) is not page content.
 */
function expectShownOnce(text: string) {
  const shown = screen
    .queryAllByText(text)
    .filter((el) => !announcement().contains(el) && !el.closest('[aria-hidden="true"]'));
  expect(shown).toHaveLength(1);
  expect(within(screen.getByRole("list", { name: "Lesson stats" })).getByText(text)).toBe(shown[0]);
  expect(banner()?.textContent ?? "").not.toContain(text);
}

/** No streak or goal event in the pill: only the perfect-lesson line. */
function expectPillOnlyPerfect() {
  expect(banner()).toHaveTextContent(new RegExp(`^${PERFECT_LINE.replace(/[+!]/g, "\\$&")}$`));
}

const originalAnimate = Element.prototype.animate;

beforeEach(() => {
  mocks.getLocalSession = () => new Promise(() => {});
  stubMotion(true);
});

afterEach(() => {
  Element.prototype.animate = originalAnimate;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ResultsScreen: streak and daily goal (LES-010)", () => {
  it("AC1, AC3, AC9: both rows are in the stats list at once, after the three stats", () => {
    renderScreen(seeded([earlier(YESTERDAY)]));
    expect(items()).toHaveLength(5);
    expect(items().slice(0, 3).map(readableText)).toEqual([
      "Total XP 15",
      "Time 3:07",
      "Accuracy 100 %",
    ]);
    expect(rows()).toEqual(["Streak extended! 2 days", "Daily goal 15 of 20 XP"]);
  });

  it("AC4, AC14, FIX-010: first lesson ever: 'Streak started!' once, '1 day'", () => {
    renderScreen(seeded([]));
    const streak = items()[3]!;
    expect(streak).toHaveTextContent("Streak started!");
    expect(streak).toHaveTextContent("1 day");
    expect(within(items()[4]!).getByText("15 / 20 XP")).toBeInTheDocument();
    expectShownOnce("Streak started!");
    expectPillOnlyPerfect();
  });

  it("AC4, AC14: first lesson today after yesterday: 'Streak extended!' and 'N days'", () => {
    renderScreen(seeded([earlier(YESTERDAY), earlier("2026-11-05")]));
    expect(rows()[0]).toBe("Streak extended! 3 days");
    expectShownOnce("Streak extended!");
    expectPillOnlyPerfect();
  });

  it("AC4, AC8, AC14: second lesson today: 'Streak', no celebration", () => {
    renderScreen(seeded([earlier(YESTERDAY), earlier(LESSON_DATE, tenXp)], 30));
    expect(rows()).toEqual(["Streak 2 days", "Daily goal 25 of 30 XP"]);
    expectPillOnlyPerfect();
  });

  it("AC5, AC14: goal newly reached: 'Daily goal reached!' row (once), with a bar", () => {
    renderScreen(seeded([earlier(LESSON_DATE, tenXp)], 20));
    expect(rows()[1]).toBe("Daily goal reached! 25 of 20 XP");
    expectShownOnce("Daily goal reached!");
    expectPillOnlyPerfect();
    const bar = within(items()[4]!).getByRole("progressbar", { name: "Daily goal reached!" });
    expect(bar).toHaveAttribute("aria-valuenow", "20");
    expect(bar).toHaveAttribute("aria-valuemax", "20");
    expect(bar).toHaveAttribute("aria-valuetext", "25 of 20 XP");
  });

  it("AC5, AC8, AC14: goal already reached: value with a check icon, no celebration", () => {
    renderScreen(seeded([earlier(LESSON_DATE), earlier(LESSON_DATE)], 20));
    expect(rows()).toEqual(["Streak 1 day", "Daily goal 45 of 20 XP, reached"]);
    expect(within(items()[4]!).getByTestId("goal-check")).toBeInTheDocument();
    expectPillOnlyPerfect();
  });

  it("AC6, AC14, FIX-010: both events: each line once in its row, the pill does not repeat them", () => {
    renderScreen(seeded([earlier(YESTERDAY)], 10));
    expectShownOnce("Streak extended!");
    expectShownOnce("Daily goal reached!");
    expect(screen.queryByText("Streak extended and daily goal reached!")).toBe(null);
    expect(screen.getAllByTestId("celebration-banner")).toHaveLength(1);
    expectPillOnlyPerfect();
  });

  it("AC6, AC14: reduced motion shows the banner without the sparkle", () => {
    const animate = vi.fn();
    Element.prototype.animate = animate as unknown as Element["animate"];
    stubMotion(true);
    renderScreen(seeded([]));
    expect(banner()).toBeInTheDocument();
    expect(screen.queryByTestId("celebration-sparkle")).toBeNull();
    expect(animate).not.toHaveBeenCalled();
  });

  it("AC6: with motion allowed, a sparkle burst of at most 1,000 ms that ends itself", async () => {
    const finishers: Array<() => void> = [];
    const animate = vi.fn(() => {
      const a = { cancel: vi.fn(), onfinish: null as null | (() => void) };
      finishers.push(() => a.onfinish?.());
      return a;
    });
    Element.prototype.animate = animate as unknown as Element["animate"];
    stubMotion(false);
    renderScreen(seeded([]));
    const sparkle = screen.getByTestId("celebration-sparkle");
    expect(sparkle).toHaveAttribute("aria-hidden", "true");
    expect(sparkle).toHaveClass("motion-reduce:hidden", "pointer-events-none");
    await waitFor(() => expect(animate).toHaveBeenCalled());
    for (const call of animate.mock.calls as unknown as Array<[unknown, { duration: number }]>) {
      expect(call[1].duration).toBeLessThanOrEqual(MAX_SPARKLE_MS);
    }
    act(() => finishers.forEach((f) => f()));
    expect(screen.queryByTestId("celebration-sparkle")).toBeNull();
    expect(banner()).toBeInTheDocument();
  });

  it("AC7: the heading has focus and the banner text is announced once, politely", async () => {
    const { rerender } = renderScreen(seeded([earlier(YESTERDAY)]));
    expect(screen.getByRole("heading", { level: 1, name: "Lesson complete!" })).toHaveFocus();
    expect(announcement()).toHaveAttribute("aria-live", "polite");
    await waitFor(() => expect(announcement()).toHaveTextContent("Streak extended!"));
    rerender(
      <ResultsScreen result={{ ...result }} save={() => Promise.resolve()} onContinue={vi.fn()} />,
    );
    expect(announcement()).toHaveTextContent(/^Streak extended!$/);
  });

  it("AC8: nothing announced when nothing is celebrated", async () => {
    renderScreen(seeded([earlier(LESSON_DATE), earlier(LESSON_DATE)], 20));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(announcement()).toHaveTextContent("");
  });

  it("AC10, AC14: earlier results unreadable: '–' (unavailable), lesson XP vs goal, no celebration or error", async () => {
    mocks.getLocalSession = () => Promise.reject(new Error("IndexedDB blocked"));
    renderScreen(createTestQueryClient());
    await waitFor(() => expect(items()).toHaveLength(5));
    expect(rows()).toEqual(["Streak unavailable", "Daily goal 15 of 20 XP"]);
    expect(within(items()[3]!).getByText("–")).toHaveAttribute("aria-hidden", "true");
    expectPillOnlyPerfect();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("AC3: if the read is still loading, the rows appear as soon as it resolves (no spinner)", async () => {
    let resolveSession: (s: unknown) => void = () => {};
    const session = new Promise((r) => (resolveSession = r));
    mocks.getLocalSession = () => session; // one read per query, all waiting on it
    renderScreen(createTestQueryClient());
    expect(items()).toHaveLength(3);
    expect(screen.queryByRole("status", { name: /loading/i })).toBeNull();
    await act(async () => {
      resolveSession({
        progress: {
          listLessonResults: async () => [earlier(YESTERDAY)],
          getHearts: async () => createFullHearts(FIXTURE_NOW),
        },
        profile: { findSettings: async () => null },
      });
    });
    await waitFor(() =>
      expect(rows()).toEqual(["Streak extended! 2 days", "Daily goal 15 of 20 XP"]),
    );
  });

  it("AC3, AC11: the same rows once the refetch already contains this result", () => {
    renderScreen(seeded([earlier(YESTERDAY), result]));
    expect(rows()).toEqual(["Streak extended! 2 days", "Daily goal 15 of 20 XP"]);
    expectShownOnce("Streak extended!");
    expectPillOnlyPerfect();
  });

  it("AC11, AC14: save error: rows and banner still show next to the save-error alert", async () => {
    renderScreen(seeded([]), () => Promise.reject(new Error("QuotaExceededError")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't save this lesson on your device.",
    );
    expect(rows()).toEqual(["Streak started! 1 day", "Daily goal 15 of 20 XP"]);
    expectShownOnce("Streak started!");
    expectPillOnlyPerfect();
  });

  it("FIX-010: not perfect: no gold pill at all, 'Streak started!' shown once", async () => {
    renderWithQueryClient(
      <ResultsScreen result={tenXp} save={() => Promise.resolve()} onContinue={vi.fn()} />,
      { client: seeded([]) },
    );
    expect(banner()).toBeNull();
    expectShownOnce("Streak started!");
    // Still announced politely once (AC 7), then the live region is emptied so reading
    // the page meets the line only in its row.
    await waitFor(() => expect(announcement()).toHaveTextContent(/^Streak started!$/));
    await waitFor(() => expect(announcement()).toHaveTextContent(/^$/), {
      timeout: ANNOUNCEMENT_CLEAR_MS + 1000,
    });
    expectShownOnce("Streak started!");
    expect(screen.getAllByText("Streak started!")).toHaveLength(1);
  });
});
