import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonResultSchema, type LessonResult } from "@/contracts";
import { toLessonResult } from "./result";
import { ResultsScreen, type ResultsScreenProps } from "./ResultsScreen";
import { MAX_COUNT_UP_MS } from "./use-count-up";
import { OTHER_RESULT_ID, oneMistakeSummary, perfectSummary, RESULT_ID } from "./testing/fixtures";

const perfectResult = toLessonResult(perfectSummary, { id: RESULT_ID, timeZone: "UTC" });
const oneMistakeResult = toLessonResult(oneMistakeSummary, { id: RESULT_ID, timeZone: "UTC" });

function setup(props: Partial<ResultsScreenProps> = {}) {
  const save = vi.fn<(r: LessonResult) => Promise<void>>(() => Promise.resolve());
  const onContinue = vi.fn();
  const onSaved = vi.fn();
  const user = userEvent.setup();
  const all: ResultsScreenProps = {
    result: perfectResult,
    save,
    onContinue,
    onSaved,
    ...props,
  };
  const view = render(<ResultsScreen {...all} />);
  // `save` is the default mock; tests that pass their own keep a reference to it.
  return { user, save, onContinue, onSaved, view, props: all };
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

function stats() {
  const list = screen.getByRole("list", { name: "Lesson stats" });
  return within(list)
    .getAllByRole("listitem")
    .map((li) => readableText(li));
}

const heading = () => screen.getByRole("heading", { level: 1, name: "Lesson complete!" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ResultsScreen", () => {
  it("AC1: shows Lumi, the heading and three stats", async () => {
    const { save, view } = setup();
    expect(view.container.querySelector('svg[data-pose="celebrating"]')).not.toBeNull();
    expect(heading()).toBeInTheDocument();
    expect(stats()).toHaveLength(3);
    await waitFor(() => expect(save).toHaveBeenCalled());
  });

  it("AC1: Lumi is the celebrating pose and decorative", () => {
    const { view } = setup();
    const lumi = view.container.querySelector('svg[data-pose="celebrating"]');
    expect(lumi).not.toBeNull();
    expect(lumi).toHaveAttribute("aria-hidden", "true");
  });

  it("AC3, AC4, AC9: perfect fixture reads 'XP earned 15', 'Accuracy 100 %', 'Time 3:07'", () => {
    setup();
    expect(stats()).toEqual(["XP earned 15", "Accuracy 100 %", "Time 3:07"]);
  });

  it("AC3, AC4: one mistake shows 10 XP, 80 % and m:ss time, without the perfect line", () => {
    setup({ result: oneMistakeResult });
    expect(stats()).toEqual(["XP earned 10", "Accuracy 80 %", "Time 1:05"]);
    expect(screen.queryByText(/Perfect lesson!/)).not.toBeInTheDocument();
  });

  it("AC3: accuracy is rounded to a whole percent", () => {
    setup({ result: { ...oneMistakeResult, accuracy: 2 / 3 } });
    expect(stats()[1]).toBe("Accuracy 67 %");
  });

  it("AC5: perfect lesson shows the bonus line with the calculateXp bonus", () => {
    setup();
    expect(screen.getByText("Perfect lesson! +5 bonus XP")).toBeInTheDocument();
  });

  it("AC2, AC5: XP and bonus come from the result's breakdown, not from constants", () => {
    const custom: LessonResult = {
      ...perfectResult,
      xp: { base: 7, perfectBonus: 3 },
      xpEarned: 10,
    };
    setup({ result: custom });
    expect(screen.getByText("Perfect lesson! +3 bonus XP")).toBeInTheDocument();
    expect(stats()[0]).toBe("XP earned 10");
  });

  describe("AC6: saving", () => {
    it("saves the schema-valid result once, then calls onSaved", async () => {
      const { save, onSaved } = setup();
      await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
      expect(save).toHaveBeenCalledTimes(1);
      expect(save).toHaveBeenCalledWith(perfectResult);
      expect(LessonResultSchema.safeParse(save.mock.calls[0]![0]).success).toBe(true);
      expect(screen.getByRole("status")).toHaveTextContent("Lesson saved.");
    });

    it("re-renders (new callbacks, copied result) never save again", async () => {
      const { save, view, props } = setup();
      await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
      for (let i = 0; i < 3; i++) {
        view.rerender(
          <ResultsScreen
            {...props}
            result={{ ...perfectResult }}
            onContinue={vi.fn()}
            onSaved={vi.fn()}
          />,
        );
      }
      await act(async () => {});
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("StrictMode double effects save once", async () => {
      const save = vi.fn(() => Promise.resolve());
      render(
        <StrictMode>
          <ResultsScreen result={perfectResult} save={save} onContinue={vi.fn()} />
        </StrictMode>,
      );
      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Lesson saved."));
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("a different lesson result (new id) is saved once too", async () => {
      const { save, view, props } = setup();
      await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
      const next = { ...oneMistakeResult, id: OTHER_RESULT_ID };
      view.rerender(<ResultsScreen {...props} result={next} />);
      await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
      expect(save.mock.calls[1]![0].id).toBe(OTHER_RESULT_ID);
    });

    it("saving does not block the stats (no spinner, no busy state)", () => {
      const save = vi.fn(() => new Promise<void>(() => {}));
      setup({ save });
      expect(stats()).toHaveLength(3);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continue" })).not.toHaveAttribute("aria-busy");
    });
  });

  describe("AC7: save error", () => {
    it("shows the alert under the stats, keeps the stats, and retries with the same result", async () => {
      const save = vi
        .fn<(r: LessonResult) => Promise<void>>()
        .mockRejectedValueOnce(new Error("QuotaExceededError"))
        .mockResolvedValueOnce(undefined);
      const { user, onSaved } = setup({ save });

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("We couldn't save this lesson on your device.");
      expect(stats()).toEqual(["XP earned 15", "Accuracy 100 %", "Time 3:07"]);
      expect(onSaved).not.toHaveBeenCalled();

      await user.click(within(alert).getByRole("button", { name: "Try again" }));
      await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
      expect(save).toHaveBeenCalledTimes(2);
      expect(save.mock.calls[1]![0]).toStrictEqual(save.mock.calls[0]![0]);
      expect(save.mock.calls[1]![0].id).toBe(RESULT_ID);
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toHaveTextContent("Lesson saved.");
    });

    it("a retry that fails again keeps the alert", async () => {
      const save = vi.fn(() => Promise.reject(new Error("nope")));
      const { user } = setup({ save });
      await user.click(await screen.findByRole("button", { name: "Try again" }));
      await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("a synchronous throw from save is an error too", async () => {
      const save = vi.fn(() => {
        throw new Error("sync");
      });
      setup({ save });
      expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("an invalid result is never passed to save", async () => {
      const save = vi.fn(() => Promise.resolve());
      setup({ save, result: { ...perfectResult, xpEarned: 99 } });
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(save).not.toHaveBeenCalled();
    });

    it("Continue still works while the error is shown", async () => {
      const { user, onContinue } = setup({ save: () => Promise.reject(new Error("x")) });
      await screen.findByRole("alert");
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("AC8: actions and focus", () => {
    it("focuses the heading on mount", () => {
      setup();
      expect(heading()).toHaveFocus();
    });

    it("has a single Continue button, reachable and usable by keyboard", async () => {
      const { user, onContinue } = setup();
      expect(screen.getAllByRole("button")).toHaveLength(1);
      await user.tab();
      expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("optional 'Practice again' is a secondary action before Continue", async () => {
      const onRetryLesson = vi.fn();
      const { user, onContinue } = setup({ onRetryLesson });
      const buttons = screen.getAllByRole("button");
      expect(buttons.map((b) => b.textContent)).toEqual(["Practice again", "Continue"]);
      await user.click(buttons[0]!);
      expect(onRetryLesson).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("AC11: XP count-up", () => {
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

    /** Manual requestAnimationFrame: `frame(t)` runs the queued callbacks at time t. */
    function stubFrames() {
      let queue: FrameRequestCallback[] = [];
      const raf = vi.fn((cb: FrameRequestCallback) => {
        queue.push(cb);
        return queue.length;
      });
      vi.stubGlobal("requestAnimationFrame", raf);
      vi.stubGlobal("cancelAnimationFrame", vi.fn());
      return {
        raf,
        pending: () => queue.length,
        frame(t: number) {
          const run = queue;
          queue = [];
          act(() => run.forEach((cb) => cb(t)));
        },
      };
    }

    const visibleXp = () =>
      within(screen.getByRole("list", { name: "Lesson stats" }))
        .getAllByRole("listitem")[0]!
        .querySelector('[aria-hidden="true"]')!.textContent;

    it("counts up from 0 to the final value within 800 ms", () => {
      stubMotion(false);
      const frames = stubFrames();
      setup();
      expect(visibleXp()).toBe("0");
      // Screen readers get the final value at once.
      expect(stats()[0]).toBe("XP earned 15");

      frames.frame(1000); // first frame = start
      frames.frame(1000 + MAX_COUNT_UP_MS / 4);
      const mid = Number(visibleXp());
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(15);

      frames.frame(1000 + MAX_COUNT_UP_MS);
      expect(visibleXp()).toBe("15");
      expect(frames.pending()).toBe(0);
    });

    it("under prefers-reduced-motion shows the final value with no animation", () => {
      stubMotion(true);
      const frames = stubFrames();
      setup();
      expect(visibleXp()).toBe("15");
      expect(frames.raf).not.toHaveBeenCalled();
    });
  });
});
