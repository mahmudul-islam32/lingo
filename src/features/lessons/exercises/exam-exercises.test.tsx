import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExerciseSchema, type ExerciseOfType, type ExerciseType } from "@/contracts";
import type { SpeechFallback } from "../audio/speech-fallback";
import { ChoiceExercise } from "./choice/ChoiceExercise";
import { ExplainExercise } from "./explain/ExplainExercise";
import { ListeningExercise, spokenTranscript } from "./listening/ListeningExercise";
import { TaskExercise, countWords } from "./task/TaskExercise";
import type { ExerciseComponentProps } from "./types";

function props<T extends ExerciseType>(exercise: ExerciseOfType<T>): ExerciseComponentProps<T> {
  return {
    exercise,
    presentationKey: `${exercise.id}:0`,
    learningLanguage: "de",
    knownLanguage: "en",
    headingId: "h",
    disabled: false,
    review: null,
    onAnswerChange: vi.fn(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
  };
}

const options = [
  { id: "a", text: "Er kommt morgen." },
  { id: "b", text: "Er kommt heute." },
  { id: "c", text: "Er kommt nicht." },
];

describe("ChoiceExercise (TELC-001)", () => {
  const exercise = ExerciseSchema.parse({
    id: "c1",
    type: "choice",
    title: "Text 1",
    passage: "Lieber Max, ich komme **morgen**.",
    prompt: "Wann kommt er?",
    options,
    correctOptionId: "a",
  }) as ExerciseOfType<"choice">;

  it("shows the passage and the question, and reports a click or letter key", async () => {
    const p = props(exercise);
    render(<ChoiceExercise {...p} />);
    expect(screen.getByText("morgen").tagName).toBe("STRONG");
    expect(screen.getByRole("heading", { name: "Wann kommt er?" })).toHaveAttribute("lang", "de");
    const user = userEvent.setup();
    await user.click(screen.getByRole("radio", { name: /heute/ }));
    expect(p.onAnswerChange).toHaveBeenLastCalledWith({ type: "choice", optionId: "b" });
    await user.keyboard("c");
    expect(p.onAnswerChange).toHaveBeenLastCalledWith({ type: "choice", optionId: "c" });
  });

  it("marks the correct option after review", () => {
    render(
      <ChoiceExercise
        {...props(exercise)}
        disabled
        review={{
          exerciseId: "c1",
          outcome: "incorrect",
          correctAnswer: "x",
          mistake: true,
          heartCost: 1,
        }}
      />,
    );
    expect(screen.getByRole("radio", { name: /morgen/ })).toHaveAttribute("data-status", "correct");
  });
});

describe("ChoiceExercise pictures (TELC-005)", () => {
  const exercise = ExerciseSchema.parse({
    id: "p1",
    type: "choice",
    prompt: "Welches ist das Wappen?",
    figure: {
      images: [1, 2, 3, 4].map((n) => ({
        src: `/images/eb/q21-bild-${n}.png`,
        alt: `Picture ${n}`,
        label: `Bild ${n}`,
      })),
      credit: "Bilder: BAMF",
    },
    options: [1, 2, 3, 4].map((n) => ({ id: String.fromCharCode(96 + n), text: `Bild ${n}` })),
    correctOptionId: "a",
  }) as ExerciseOfType<"choice">;

  it("shows every picture with its alt text, label and the credit, between question and options", () => {
    render(<ChoiceExercise {...props(exercise)} />);
    const figure = screen.getByTestId("exercise-figure");
    const images = screen.getAllByRole("img");
    expect(images.map((img) => img.getAttribute("alt"))).toEqual([
      "Picture 1",
      "Picture 2",
      "Picture 3",
      "Picture 4",
    ]);
    expect(images[0]).toHaveAttribute("src", "/images/eb/q21-bild-1.png");
    expect(figure).toHaveTextContent("Bild 3");
    expect(figure).toHaveTextContent("Bilder: BAMF");
    const heading = screen.getByRole("heading", { name: "Welches ist das Wappen?" });
    const firstOption = screen.getAllByRole("radio")[0]!;
    // DOM order: question → pictures → options.
    expect(heading.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      figure.compareDocumentPosition(firstOption) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders no figure when the exercise has none", () => {
    render(<ChoiceExercise {...props({ ...exercise, figure: undefined })} />);
    expect(screen.queryByTestId("exercise-figure")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("ListeningExercise (TELC-001)", () => {
  const exercise = ExerciseSchema.parse({
    id: "l1",
    type: "listening",
    transcript: "Anna: Hallo!\nBen: Guten Tag.",
    prompt: "Wer grüßt?",
    options,
    correctOptionId: "a",
  }) as ExerciseOfType<"listening">;

  it("drops speaker labels for speech", () => {
    expect(spokenTranscript(exercise.transcript)).toBe("Hallo! … Guten Tag.");
  });

  it("reads the transcript with a German voice", async () => {
    const voice = { lang: "de-DE" } as SpeechSynthesisVoice;
    const speech: SpeechFallback = {
      findVoice: vi.fn().mockResolvedValue(voice),
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    render(<ListeningExercise {...props(exercise)} speech={speech} />);
    const play = await screen.findByRole("button", { name: "Play audio" });
    await userEvent.setup().click(play);
    expect(speech.speak).toHaveBeenCalledWith("Hallo! … Guten Tag.", { voice, rate: 1 });
  });

  it("shows the text when no voice exists", async () => {
    const speech: SpeechFallback = {
      findVoice: vi.fn().mockResolvedValue(null),
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    render(<ListeningExercise {...props(exercise)} speech={speech} />);
    expect(await screen.findByText(/Read the text instead/)).toBeInTheDocument();
    expect(screen.getByText(/Anna: Hallo!/)).toBeInTheDocument();
  });
});

describe("TaskExercise (TELC-001)", () => {
  const exercise = ExerciseSchema.parse({
    id: "t1",
    type: "task",
    skill: "writing",
    title: "Brief an Anna",
    task: "Schreiben Sie einen Brief.",
    points: ["Dank", "Termin"],
    phrases: ["Liebe Anna,"],
    modelAnswer: "Liebe Anna, …",
  }) as ExerciseOfType<"task">;

  it("is ready at once and reports what the learner writes", async () => {
    const p = props(exercise);
    render(<TaskExercise {...p} />);
    expect(p.onAnswerChange).toHaveBeenCalledWith({ type: "task", text: "" });
    expect(screen.getByText("Termin")).toBeInTheDocument();
    await userEvent.setup().type(screen.getByLabelText("Your text"), "Hallo Anna");
    expect(p.onAnswerChange).toHaveBeenLastCalledWith({ type: "task", text: "Hallo Anna" });
    expect(screen.getByText("2 words")).toBeInTheDocument();
  });

  it("counts words", () => {
    expect(countWords("  ")).toBe(0);
    expect(countWords("ein  zwei\ndrei")).toBe(3);
  });
});

describe("ExplainExercise (TELC-001)", () => {
  it("renders the card and is ready at once", () => {
    const exercise = ExerciseSchema.parse({
      id: "e1",
      type: "explain",
      title: "Verb second",
      body: "The verb is in **position 2**.",
      examples: [{ learning: "Morgen gehe ich.", known: "Tomorrow I go." }],
    }) as ExerciseOfType<"explain">;
    const p = props(exercise);
    render(<ExplainExercise {...p} />);
    expect(screen.getByRole("heading", { name: "Verb second" })).toBeInTheDocument();
    expect(screen.getByText("Morgen gehe ich.")).toHaveAttribute("lang", "de");
    expect(p.onAnswerChange).toHaveBeenCalledWith({ type: "explain" });
  });
});
