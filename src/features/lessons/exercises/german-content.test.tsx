/**
 * LES-014: real German A1 lessons (content/courses/en-de) rendered through the exercise
 * registry. Checks authored case, `lang` attributes (learning side `de`, prompts in the
 * known language, PD-019), the feedback answer as authored, and the long-word wrapping
 * classes that keep tiles, options and pairs inside a 375 px viewport.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CourseSchema,
  ExerciseSchema,
  LessonSchema,
  type AnswerCheckResult,
  type Exercise,
  type ExerciseType,
  type Lesson,
} from "@/contracts";
import { checkAnswer } from "../checking";
import { FeedbackPanel } from "../feedback/FeedbackPanel";
import { fakeVoice, stubMediaPlayback, stubSpeechSynthesis } from "../test-utils/speech-synthesis";
import { exerciseComponents } from "./registry";
import type { ExerciseComponentProps } from "./types";

const COURSE_DIR = join(__dirname, "..", "..", "..", "..", "content", "courses", "en-de");

const course = CourseSchema.parse(
  JSON.parse(readFileSync(join(COURSE_DIR, "course.json"), "utf8")),
);

function loadLesson(id: string): Lesson {
  return LessonSchema.parse(
    JSON.parse(readFileSync(join(COURSE_DIR, "lessons", `${id}.json`), "utf8")),
  );
}

const LESSON_IDS = [
  "de-a1-u01-l1-hello",
  "de-a1-u04-l1-bread-and-rolls",
  "de-a1-u11-l5-pharmacy",
  "de-a1-u12-l5-a1-checkpoint",
];

const { learningLanguage, knownLanguage } = course;

function renderExercise(exercise: Exercise) {
  const Component = exerciseComponents[exercise.type] as
    React.ComponentType<ExerciseComponentProps<ExerciseType>> | undefined;
  if (!Component) throw new Error(`No component for ${exercise.type}`);
  const props: ExerciseComponentProps<ExerciseType> = {
    exercise,
    presentationKey: `${exercise.id}:0`,
    learningLanguage,
    knownLanguage,
    headingId: "exercise-heading",
    disabled: false,
    review: null,
    onAnswerChange: vi.fn(),
    onSkip: vi.fn(),
    onComplete: vi.fn(),
  };
  return render(<Component {...props} />);
}

/** Language and text of every learning/known-language string an exercise shows. */
function expectedTexts(exercise: Exercise): { lang: string; texts: string[] } {
  switch (exercise.type) {
    case "multiple_choice":
      return { lang: learningLanguage, texts: exercise.options.map((o) => o.text) };
    case "word_bank_translate":
      return {
        lang: exercise.direction === "to_learning" ? learningLanguage : knownLanguage,
        texts: exercise.tiles,
      };
    case "listen":
      return { lang: learningLanguage, texts: exercise.tiles };
    case "match_pairs":
      return { lang: learningLanguage, texts: exercise.pairs.map((p) => p.learning) };
    default:
      return { lang: learningLanguage, texts: [] };
  }
}

/** Text of each element with `lang`, excluding the exercise's own wrapper elements. */
function textsWithLang(container: HTMLElement, lang: string): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>(`[lang="${lang}"]`))
    .filter((el) => !el.querySelector(`[lang="${lang}"]`))
    .filter((el) => el.getAttribute("aria-hidden") !== "true")
    .map((el) => el.textContent ?? "");
}

afterEach(() => {
  cleanup(); // unmount (stops audio) while the media stubs are still installed
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function stubAudio() {
  stubSpeechSynthesis([fakeVoice("de-DE")]);
  stubMediaPlayback("pending");
}

describe("en-de course", () => {
  it("is German for English speakers", () => {
    expect(learningLanguage).toBe("de");
    expect(knownLanguage).toBe("en");
  });
});

describe.each(LESSON_IDS)("German A1 lesson %s through the registry", (lessonId) => {
  const lesson = loadLesson(lessonId);

  it.each(lesson.exercises.map((exercise) => [exercise.id, exercise] as const))(
    "%s renders authored text with the right lang",
    (_id, exercise) => {
      stubAudio();
      const { container } = renderExercise(exercise);
      const { lang, texts } = expectedTexts(exercise);
      const shown = textsWithLang(container, lang);
      for (const text of texts) expect(shown).toContain(text);
      // Authored case: nothing is lower-cased or upper-cased for display.
      const transformed = container.querySelectorAll(
        ".lowercase, .uppercase, .capitalize, [style*='text-transform']",
      );
      for (const el of transformed) expect(el.closest("[lang]")).toBeNull();
      // Prompts stay in the known language (PD-019), except to_known translations.
      if (exercise.type === "multiple_choice") {
        expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("lang", knownLanguage);
      }
      if (exercise.type === "word_bank_translate") {
        const prompt = within(screen.getByRole("heading", { level: 2 })).getByText(exercise.prompt);
        expect(prompt).toHaveAttribute(
          "lang",
          exercise.direction === "to_learning" ? knownLanguage : learningLanguage,
        );
      }
    },
  );
});

describe("German tiles keep their authored case (AC 4)", () => {
  const lesson = loadLesson("de-a1-u04-l1-bread-and-rolls");
  const translate = lesson.exercises.find((e) => e.id === "de-a1-u04-l1-ex04")!;

  it("shows Bäckerei and Brot capitalised and das/ist in lower case", () => {
    renderExercise(translate);
    expect(screen.getByRole("button", { name: "Add Bäckerei" })).toHaveTextContent(/^Bäckerei$/);
    expect(screen.getByRole("button", { name: "Add Brot" })).toHaveTextContent(/^Brot$/);
    expect(screen.getByRole("button", { name: "Add das" })).toHaveTextContent(/^das$/);
    expect(screen.getByRole("button", { name: "Add ist" })).toHaveTextContent(/^ist$/);
    for (const tile of within(screen.getByRole("group", { name: "Word bank" })).getAllByRole(
      "button",
    )) {
      expect(tile).toHaveAttribute("lang", "de");
    }
  });
});

describe("German feedback answer (AC 5)", () => {
  const lesson = loadLesson("de-a1-u04-l1-bread-and-rolls");

  it.each(
    lesson.exercises
      .filter((e) => e.type === "word_bank_translate" || e.type === "listen")
      .map((e) => [e.id, e] as const),
  )("%s shows answers[0] exactly as authored", (_id, exercise) => {
    const result: AnswerCheckResult = checkAnswer({
      exercise,
      answer:
        exercise.type === "listen"
          ? { type: "listen", tiles: ["drei"] }
          : { type: "word_bank_translate", tiles: ["xyz"] },
    });
    expect(result.outcome).toBe("incorrect");
    const answer = (exercise as { answers: string[] }).answers[0]!;
    expect(result.correctAnswer).toBe(answer);
    render(
      <FeedbackPanel
        result={result}
        exercise={exercise}
        learningLanguage={learningLanguage}
        knownLanguage={knownLanguage}
        onContinue={vi.fn()}
        random={() => 0}
      />,
    );
    const strong = screen.getByText(answer, { selector: "strong" });
    const toKnown = exercise.type === "word_bank_translate" && exercise.direction === "to_known";
    expect(strong).toHaveAttribute("lang", toKnown ? "en" : "de");
    expect(strong).toHaveClass("hyphens-auto");
  });

  it("keeps umlauts, ß and capitals", () => {
    const exercise = ExerciseSchema.parse({
      id: "de-test-ex01",
      type: "word_bank_translate",
      direction: "to_learning",
      prompt: "The street is big.",
      tiles: ["Die", "Straße", "ist", "groß", "Äpfel"],
      answers: ["Die Straße ist groß."],
    });
    render(
      <FeedbackPanel
        result={checkAnswer({
          exercise,
          answer: { type: "word_bank_translate", tiles: ["Äpfel"] },
        })}
        exercise={exercise}
        learningLanguage="de"
        knownLanguage="en"
        onContinue={vi.fn()}
        random={() => 0}
      />,
    );
    expect(screen.getByText("Die Straße ist groß.", { selector: "strong" })).toHaveAttribute(
      "lang",
      "de",
    );
  });
});

describe("Long German words wrap inside 375 px (AC 7)", () => {
  // jsdom has no layout: these check the CSS that makes the text wrap (overflow-wrap,
  // hyphens with lang="de", width capped to the container, no nowrap anywhere).
  const longTile = "Krankenversicherungskarte"; // 25 characters
  const longOption =
    "Die Krankenversicherungskarte liegt in der Handtasche neben dem Personalausweis."; // 80
  const longPair = "die Krankenversicherungskarten im Koffer"; // 40 (contract max)

  it("fixtures have the lengths from the ticket", () => {
    expect(longTile).toHaveLength(25);
    expect(longOption).toHaveLength(80);
    expect(longPair).toHaveLength(40);
  });

  it("a 25-character tile wraps (overflow-wrap anywhere, hyphens auto, max-w-full)", () => {
    const exercise = ExerciseSchema.parse({
      id: "de-long-ex01",
      type: "word_bank_translate",
      direction: "to_learning",
      prompt: "the health insurance card",
      tiles: ["die", longTile, "Versichertenkarte", "Krankenpflegerin"],
      answers: [`die ${longTile}`],
    });
    const { container } = renderExercise(exercise);
    const tile = screen.getByRole("button", { name: `Add ${longTile}` });
    expect(tile).toHaveAttribute("lang", "de");
    expect(tile).toHaveClass("wrap-anywhere", "hyphens-auto", "max-w-full", "min-w-0");
    expect(tile).toHaveTextContent(longTile);
    expect(screen.getByRole("group", { name: "Word bank" })).toHaveClass("flex-wrap", "min-w-0");
    expect(container.querySelector(".whitespace-nowrap, .truncate, .w-max")).toBeNull();
  });

  it("an 80-character option wraps inside the radio", () => {
    const exercise = ExerciseSchema.parse({
      id: "de-long-ex02",
      type: "multiple_choice",
      prompt: "Where is the card?",
      options: [
        { id: "a", text: longOption },
        { id: "b", text: "Sie liegt im Auto." },
        { id: "c", text: "Ich weiß es nicht." },
      ],
      correctOptionId: "a",
    });
    renderExercise(exercise);
    const text = screen.getByText(longOption);
    expect(text).toHaveAttribute("lang", "de");
    expect(text).toHaveClass("min-w-0", "break-words", "hyphens-auto");
    expect(screen.getAllByRole("radio")[0]).toHaveClass("w-full");
  });

  it("a 40-character match-pairs item wraps", () => {
    const exercise = ExerciseSchema.parse({
      id: "de-long-ex03",
      type: "match_pairs",
      pairs: [
        { id: "p1", learning: longPair, known: "the liability insurance certificate" },
        { id: "p2", learning: "die Versichertenkarte", known: "the insurance card" },
        { id: "p3", learning: "die Krankenpflegerin", known: "the nurse" },
        { id: "p4", learning: "das Brot", known: "the bread" },
        { id: "p5", learning: "ich", known: "I" },
      ],
    });
    renderExercise(exercise);
    const text = screen.getByText(longPair);
    expect(text.closest("[lang]")).toHaveAttribute("lang", "de");
    expect(text).toHaveClass("min-w-0", "break-words");
    expect(text.closest("button")).toHaveClass("hyphens-auto", "break-words");
    expect(screen.getByText("ich")).toBeInTheDocument();
  });
});
