/** Test-only fixtures for the lesson player (schema-valid). Not imported by app code. */
import { LessonSchema, type Lesson } from "@/contracts";

const pairs = [
  { id: "gato", learning: "gato", known: "cat" },
  { id: "perro", learning: "perro", known: "dog" },
  { id: "pan", learning: "pan", known: "bread" },
  { id: "agua", learning: "agua", known: "water" },
  { id: "casa", learning: "casa", known: "house" },
];

/** mc-1, mc-2 (multiple choice), mp-1 (match pairs), sp-1 (speak), li-1 (listen). */
export const fixtureLesson: Lesson = LessonSchema.parse({
  id: "u1-l1-test",
  courseId: "en-es",
  unitId: "u1",
  title: "Test lesson",
  exercises: [
    {
      id: "mc-1",
      type: "multiple_choice",
      prompt: "Which one means 'hello'?",
      options: [
        { id: "hola", text: "Hola" },
        { id: "adios", text: "Adiós" },
        { id: "gracias", text: "Gracias" },
      ],
      correctOptionId: "hola",
    },
    {
      id: "mc-2",
      type: "multiple_choice",
      prompt: "Which one means 'good morning'?",
      options: [
        { id: "buenos-dias", text: "Buenos días" },
        { id: "buenas-noches", text: "Buenas noches" },
        { id: "buenas-tardes", text: "Buenas tardes" },
      ],
      correctOptionId: "buenos-dias",
    },
    { id: "mp-1", type: "match_pairs", pairs },
    { id: "sp-1", type: "speak", phrase: "Buenos días", translation: "Good morning" },
    {
      id: "li-1",
      type: "listen",
      audio: { src: "/audio/es/hola-que-tal.mp3" },
      tiles: ["Hola", "qué", "tal", "adiós"],
      answers: ["Hola, ¿qué tal?"],
    },
  ],
});

/** Only multiple-choice exercises: mc-1, mc-2. */
export const mcOnlyLesson: Lesson = LessonSchema.parse({
  ...fixtureLesson,
  exercises: fixtureLesson.exercises.filter((e) => e.type === "multiple_choice"),
});

export const SESSION_ID = "8a4b2c1d-3e5f-4a6b-9c7d-0e1f2a3b4c5d";

/** Deterministic clock: each call is 1 s after the previous one. */
export function makeClock(start = Date.parse("2026-11-07T10:00:00.000Z"), stepMs = 1000) {
  let t = start;
  return () => {
    const d = new Date(t);
    t += stepMs;
    return d;
  };
}
