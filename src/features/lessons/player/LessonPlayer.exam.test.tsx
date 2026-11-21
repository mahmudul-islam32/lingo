import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonSchema } from "@/contracts";
import { LessonPlayer } from "./LessonPlayer";
import { makeClock, SESSION_ID } from "./testing/fixtures";
import type { LessonSessionSummary } from "./summary";

const lesson = LessonSchema.parse({
  id: "tb1-test",
  courseId: "telc-b1-en-de",
  unitId: "tb1-u00",
  title: "Exam types",
  exercises: [
    { id: "e1", type: "explain", title: "Rule card", body: "Verb **second**." },
    {
      id: "c1",
      type: "choice",
      passage: "Ich komme morgen.",
      prompt: "Wann?",
      options: [
        { id: "a", text: "morgen" },
        { id: "b", text: "heute" },
      ],
      correctOptionId: "a",
      explanation: "The text says *morgen*.",
    },
    {
      id: "t1",
      type: "task",
      skill: "speaking",
      title: "Über Hobbys sprechen",
      task: "Erzählen Sie.",
      modelAnswer: "Ich spiele gern Fußball.",
    },
  ],
});

describe("LessonPlayer · exam types (TELC-001)", () => {
  it("plays explain → choice with explanation → task with model answer, all without hearts", async () => {
    const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
    const onLose = vi.fn();
    const onGain = vi.fn();
    const user = userEvent.setup();
    render(
      <LessonPlayer
        lesson={lesson}
        learningLanguage="de"
        knownLanguage="en"
        onFinish={onFinish}
        onQuit={vi.fn()}
        now={makeClock()}
        createId={() => SESSION_ID}
        random={() => 0}
        hearts={{ initial: 3, onLose, onOutOfHearts: vi.fn(), gainPerCorrect: 1, onGain }}
      />,
    );

    expect(screen.getByText("Learn")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    // No feedback panel for the card: straight to the question.
    expect(screen.getByText("Reading")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /heute/ }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByTestId("feedback-explanation")).toHaveTextContent("The text says morgen.");
    expect(onLose).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Speaking")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show model answer" }));
    expect(screen.getByRole("heading", { name: "Model answer" })).toBeInTheDocument();
    expect(screen.getByText("Ich spiele gern Fußball.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // The re-queued choice comes back; answer it correctly.
    await user.click(screen.getByRole("radio", { name: /morgen/ }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onFinish).toHaveBeenCalledTimes(1);
    // Only the correct choice earned a heart; the card and the task never do.
    expect(onGain).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0]![0]).toMatchObject({ exerciseCount: 3, mistakeCount: 1 });
  });
});
