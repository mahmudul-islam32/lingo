/**
 * Integration: a real CON-001 lesson, validated with `LessonSchema`, played end to end
 * through `LessonPlayer` with the real exercise registry, every answer correct.
 * Covers the v0.2.0 lesson engine wiring (LES-002..LES-008) without mocks of our own
 * code; only browser media playback is stubbed (jsdom has none).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonSchema, type Exercise, type Lesson } from "@/contracts";
import {
  exerciseComponents,
  LessonPlayer,
  toLessonResult,
  type LessonSessionSummary,
} from "@/features/lessons";

const LESSON_FILE = join(process.cwd(), "content/courses/en-es/lessons/u1-l1-hello.json");
const RESULT_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

function loadLesson(): Lesson {
  return LessonSchema.parse(JSON.parse(readFileSync(LESSON_FILE, "utf8")));
}

/** Words of a canonical answer, as word-bank tile texts ("Hola, ¿cómo estás?" → hola cómo estás). */
function answerWords(answer: string): string[] {
  return answer
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

type User = ReturnType<typeof userEvent.setup>;

async function addTiles(user: User, words: string[]) {
  for (const word of words) {
    const [tile] = screen.getAllByRole("button", { name: `Add ${word}` });
    await user.click(tile!);
  }
}

async function answerCorrectly(user: User, exercise: Exercise) {
  switch (exercise.type) {
    case "multiple_choice": {
      const option = exercise.options.find((o) => o.id === exercise.correctOptionId)!;
      await user.click(screen.getByRole("radio", { name: new RegExp(`^${option.text}$`) }));
      await user.click(screen.getByRole("button", { name: "Check" }));
      return;
    }
    case "match_pairs":
      // Self-completing: no "Check".
      for (const pair of exercise.pairs) {
        await user.click(screen.getByRole("button", { name: pair.learning }));
        await user.click(screen.getByRole("button", { name: pair.known }));
      }
      return;
    case "word_bank_translate":
    case "listen":
      await addTiles(user, answerWords(exercise.answers[0]!));
      await user.click(screen.getByRole("button", { name: "Check" }));
      return;
    case "speak":
      throw new Error("speak is not in the v0.2.0 registry");
  }
}

describe("lesson engine integration: en-es u1-l1-hello", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("supports every exercise type the lesson uses", () => {
    const lesson = loadLesson();
    for (const exercise of lesson.exercises) {
      expect(exerciseComponents[exercise.type], exercise.type).toBeDefined();
    }
  });

  it("plays the whole lesson with correct answers and yields a perfect result", async () => {
    const lesson = loadLesson();
    const user = userEvent.setup();
    const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
    const onQuit = vi.fn();
    let t = Date.parse("2026-11-07T10:00:00.000Z");

    render(
      <LessonPlayer
        lesson={lesson}
        learningLanguage="es"
        knownLanguage="en"
        onFinish={onFinish}
        onQuit={onQuit}
        now={() => new Date((t += 1000))}
        createId={() => "0b7c1f3a-2d4e-4f60-8a9b-1c2d3e4f5a6b"}
        random={() => 0}
      />,
    );

    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuemax", String(lesson.exercises.length));

    // The lesson's tip card comes first (LES-013): it doesn't move the progress bar.
    expect(lesson.tip).toBeTruthy();
    expect(progress).toHaveAttribute("aria-valuenow", "0");
    await user.click(screen.getByRole("button", { name: "Start" }));

    for (const [index, exercise] of lesson.exercises.entries()) {
      expect(progress).toHaveAttribute("aria-valuenow", String(index));
      await answerCorrectly(user, exercise);
      const panel = await screen.findByTestId("feedback-panel");
      expect(panel, exercise.id).toHaveAttribute("data-outcome", "correct");
      await user.click(screen.getByRole("button", { name: "Continue" }));
    }

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onQuit).not.toHaveBeenCalled();

    const summary = onFinish.mock.calls[0]![0];
    expect(summary).toMatchObject({
      exerciseCount: lesson.exercises.length,
      firstTryCorrectCount: lesson.exercises.length,
      mistakeCount: 0,
      skippedCount: 0,
      perfect: true,
    });
    expect(summary.session.status).toBe("completed");
    expect(summary.session.lessonId).toBe("u1-l1-hello");

    const result = toLessonResult(summary, { id: RESULT_ID, timeZone: "UTC" });
    expect(result).toMatchObject({
      lessonId: "u1-l1-hello",
      courseId: "en-es",
      accuracy: 1,
      perfect: true,
      xp: { base: 10, perfectBonus: 5 },
      xpEarned: 15,
      heartsLost: 0,
    });
    // Plays 12 real exercises with userEvent: ~1 s alone, but it can pass 5 s under
    // full-suite load (jsdom per file), so it gets a longer timeout.
  }, 20_000);
});
