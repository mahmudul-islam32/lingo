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

/**
 * LES-015: German cloze lesson (`en-de` style): cz-1 (one gap, preposition article),
 * cz-2 (two gaps, the same option ids in both), mc-de (multiple choice).
 */
export const clozeLesson: Lesson = LessonSchema.parse({
  id: "de-test-cloze",
  courseId: "en-de",
  unitId: "u1",
  title: "Cloze test lesson",
  exercises: [
    {
      id: "cz-1",
      type: "cloze",
      sentence: "Ich lege das Buch auf ___ Tisch.",
      translation: "I put the book on the table.",
      audio: { src: "/audio/de/test/cz-1.mp3" },
      gaps: [
        {
          options: [
            { id: "dem", text: "dem" },
            { id: "den", text: "den" },
          ],
          correctOptionId: "den",
        },
      ],
    },
    {
      id: "cz-2",
      type: "cloze",
      sentence: "___ blaue Kleid ist schön, aber ___ Rock nicht.",
      translation: "The blue dress is nice, but the skirt isn't.",
      gaps: [
        {
          options: [
            { id: "der", text: "Der" },
            { id: "die", text: "Die" },
            { id: "das", text: "Das" },
          ],
          correctOptionId: "das",
        },
        {
          options: [
            { id: "der", text: "der" },
            { id: "die", text: "die" },
            { id: "das", text: "das" },
          ],
          correctOptionId: "der",
        },
      ],
    },
    {
      id: "mc-de",
      type: "multiple_choice",
      prompt: "Which one means 'thank you'?",
      options: [
        { id: "danke", text: "Danke" },
        { id: "bitte", text: "Bitte" },
        { id: "tschuess", text: "Tschüss" },
      ],
      correctOptionId: "danke",
    },
  ],
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
