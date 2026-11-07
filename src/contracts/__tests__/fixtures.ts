/** Valid fixtures shared by the contract tests. Tests derive invalid variants from these. */
import type {
  Course,
  HeartsState,
  LessonResult,
  ListenExercise,
  MatchPairsExercise,
  MultipleChoiceExercise,
  Profile,
  Settings,
  SpeakExercise,
  WordBankTranslateExercise,
  Lesson,
} from "../index";

export const UUID_A = "3f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f";
export const UUID_B = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";

export const multipleChoice: MultipleChoiceExercise = {
  id: "ex-1",
  type: "multiple_choice",
  prompt: 'Which one means "water"?',
  options: [
    { id: "a", text: "agua" },
    { id: "b", text: "pan" },
    { id: "c", text: "leche" },
  ],
  correctOptionId: "a",
};

export const wordBank: WordBankTranslateExercise = {
  id: "ex-2",
  type: "word_bank_translate",
  direction: "to_learning",
  prompt: "Good morning, how are you?",
  tiles: ["Buenos", "días", "cómo", "estás", "noches", "usted"],
  answers: ["Buenos días, ¿cómo estás?", "Buenos días, cómo estás"],
};

export const matchPairs: MatchPairsExercise = {
  id: "ex-3",
  type: "match_pairs",
  pairs: [
    { id: "p1", learning: "gato", known: "cat" },
    { id: "p2", learning: "perro", known: "dog" },
    { id: "p3", learning: "casa", known: "house" },
    { id: "p4", learning: "libro", known: "book" },
    { id: "p5", learning: "mesa", known: "table" },
  ],
};

export const listen: ListenExercise = {
  id: "ex-4",
  type: "listen",
  audio: { src: "/audio/es/me-llamo-ana.mp3", slowSrc: "/audio/es/me-llamo-ana-slow.mp3" },
  tiles: ["Me", "llamo", "Ana", "Hola", "soy"],
  answers: ["Me llamo Ana."],
};

export const speak: SpeakExercise = {
  id: "ex-5",
  type: "speak",
  phrase: "Buenos días",
  translation: "Good morning",
  audio: { src: "/audio/es/buenos-dias.mp3" },
};

export const lesson: Lesson = {
  id: "greetings-1",
  courseId: "spanish-from-english",
  unitId: "unit-1",
  title: "Greetings",
  tip: "Use ¡Hola! with anyone, any time of day.",
  exercises: [multipleChoice, wordBank, matchPairs, listen, speak],
};

export const course: Course = {
  id: "spanish-from-english",
  title: "Spanish",
  learningLanguage: "es",
  knownLanguage: "en",
  version: 1,
  units: [
    {
      id: "unit-1",
      title: "Everyday basics",
      lessons: [
        { id: "greetings-1", title: "Greetings" },
        { id: "introductions-1", title: "Introductions" },
      ],
    },
  ],
};

export const lessonResult: LessonResult = {
  id: UUID_A,
  courseId: "spanish-from-english",
  unitId: "unit-1",
  lessonId: "greetings-1",
  startedAt: "2026-11-07T10:00:00.000Z",
  completedAt: "2026-11-07T10:04:30.000Z",
  durationMs: 270_000,
  exerciseCount: 5,
  firstTryCorrectCount: 3,
  mistakeCount: 1,
  skippedCount: 1,
  accuracy: 0.75,
  perfect: false,
  xp: { base: 10, perfectBonus: 0 },
  xpEarned: 10,
  heartsLost: 1,
  localDate: "2026-11-07",
  timeZone: "Europe/Berlin",
};

export const heartsFull: HeartsState = {
  current: 5,
  refillStartedAt: null,
  updatedAt: "2026-11-07T10:00:00.000Z",
};

export const heartsRefilling: HeartsState = {
  current: 3,
  refillStartedAt: "2026-11-07T09:00:00.000Z",
  updatedAt: "2026-11-07T10:00:00.000Z",
};

export const settings: Settings = {
  courseId: "spanish-from-english",
  dailyGoalXp: 20,
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
  updatedAt: "2026-11-07T10:00:00.000Z",
};

export const profile: Profile = {
  id: UUID_B,
  displayName: "Sam",
  avatar: { kind: "initials" },
  joinedAt: "2026-11-07T09:00:00.000Z",
  onboardedAt: "2026-11-07T09:01:00.000Z",
  updatedAt: "2026-11-07T09:01:00.000Z",
};
