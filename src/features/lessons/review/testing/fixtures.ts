/**
 * Test-only review fixture (LES-023 AC 14): 3 items from 2 lessons of `en-es` (one
 * `multiple_choice`, one `word_bank_translate`, one `match_pairs`). Not imported by app code.
 */
import { ReviewItemSchema, type ReviewItem } from "@/contracts";

export const reviewItems: ReviewItem[] = [
  {
    courseId: "en-es",
    unitId: "u1",
    lessonId: "u1-l1",
    exercise: {
      id: "rv-mc",
      type: "multiple_choice",
      prompt: "Which one means 'thank you'?",
      options: [
        { id: "gracias", text: "Gracias" },
        { id: "hola", text: "Hola" },
        { id: "adios", text: "Adiós" },
      ],
      correctOptionId: "gracias",
      explanation: "Gracias is how you say thank you.",
    },
  },
  {
    courseId: "en-es",
    unitId: "u2",
    lessonId: "u2-l3",
    exercise: {
      id: "rv-wb",
      type: "word_bank_translate",
      direction: "to_learning",
      prompt: "I drink water",
      answers: ["Yo bebo agua"],
      tiles: ["Yo", "bebo", "agua", "pan"],
    },
  },
  {
    courseId: "en-es",
    unitId: "u1",
    lessonId: "u1-l1",
    exercise: {
      id: "rv-mp",
      type: "match_pairs",
      pairs: [
        { id: "gato", learning: "gato", known: "cat" },
        { id: "perro", learning: "perro", known: "dog" },
        { id: "pan", learning: "pan", known: "bread" },
        { id: "agua", learning: "agua", known: "water" },
        { id: "casa", learning: "casa", known: "house" },
      ],
    },
  },
].map((item) => ReviewItemSchema.parse(item));
