# CON-DE-A1-01: A1 Unit 1 "Hello!": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CTO-008 (level layer in the manifest) ·
**Milestone:** v0.3.1 · **Curriculum:** `curriculum-german.md` §4 Unit 1

## User story
As a beginner moving to a German-speaking country, I want to greet people, say my name and
ask how someone is, using "du" and "Sie" correctly, so that my first conversations go well.

## Unit outline
- **Theme:** greetings, names, formal and informal address
- **Can-do:** I can greet people and say goodbye at any time of day, say my name, ask
  someone's name and ask how they are, using "du" with friends and "Sie" with strangers.
- **Grammar:** `ich`, `du`, `Sie`; `heißen`; `sein` (`ich bin`, `du bist`, `Sie sind`); `wie`;
  nouns are capitalised.

## Acceptance criteria
1. This ticket **creates** `content/courses/en-de/course.json`: id `en-de`, title "German",
   `learningLanguage` `de`, `knownLanguage` `en`, `version` 1, levels A1 "A1 · Beginner", A2
   "A2 · Elementary", B1 "B1 · Intermediate", B2 "B2 · Upper intermediate", C1 "C1 ·
   Advanced" (A2–C1 with no units yet), in the CTO-008 shape.
2. Unit `de-a1-u01`, title "Hello!", description "Say hello and goodbye, introduce yourself
   and ask how someone is, with friends and with strangers.", in level A1, with these lessons
   in order:
   1. `de-a1-u01-l1-hello` "Hello and Goodbye"
   2. `de-a1-u01-l2-whats-your-name` "What's Your Name?"
   3. `de-a1-u01-l3-formal-or-informal` "Formal or Informal"
   4. `de-a1-u01-l4-how-are-you` "How Are You?"
   5. `de-a1-u01-l5-language-school` "First Day at the Language School"
3. All of **CDS-1 to CDS-13** (`curriculum-german.md` §7) pass.
4. At least 4 exercises in the unit contrast `du` and `Sie`, with the register in the
   English prompt ("(formal)", "(to a friend)"), e.g. a multiple choice "Which one means
   'What's your name? (formal)'?" with `Wie heißen Sie?` / `Wie heißt du?` / `Wie heißt Sie?`.
5. Lesson 1 teaches which greeting fits which time of day: at least 2 exercises have an
   English prompt that gives the time ("in the evening").
6. Lesson 5 is a scenario: at least 6 of its exercises are lines of one conversation
   between a learner, a classmate (du) and a teacher (Sie).
7. Every `to_learning` translation of "I'm <name>" / "My name is <name>" accepts `Ich heiße
   …`, `Ich bin …` and `Mein Name ist …` when all three can be built from the tiles.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Hello and Goodbye | hallo (hello / hi), guten Morgen (good morning), guten Tag (hello / good day), guten Abend (good evening), gute Nacht (good night), tschüss (bye), auf Wiedersehen (goodbye, formal) | 7 |
| 2 | What's Your Name? | ich (I), du (you, to a friend), heißen: ich heiße / du heißt (to be called: my name is / your name is), wie? (how? / what?, in "Wie heißt du?"), der Name (the name), mein Name ist (my name is), und (and) | 7 |
| 3 | Formal or Informal | Sie (you, formal), Sie heißen (your name is, formal), Herr (Mr), Frau (Mrs / Ms), freut mich (nice to meet you), danke (thank you / thanks), bitte (please / you're welcome) | 7 |
| 4 | How Are You? | wie geht's? (how are you?, informal), wie geht es Ihnen? (how are you?, formal), gut (good / well / fine), sehr (very), nicht so gut (not so good), auch (also / too), und dir? / und Ihnen? (and you?) | 7 |
| 5 | First Day at the Language School | sein: ich bin / du bist / Sie sind (I am / you are), ja (yes), nein (no), Entschuldigung (excuse me / sorry), der Lehrer / die Lehrerin (the teacher) | 5 |

Unit total: 33 items.

## Out of scope
- Speak exercises (with LES-011, v1.0.0)
- Final audio files (cto pipeline, owner licence)
- `er / sie / wir` forms (Unit 2)

## UX notes
- Tip examples (at most 120 characters): "Use 'du' with friends and 'Sie' with people you don't
  know. 'Sie' always has a capital S."; "Every German noun starts with a capital letter: der
  Name."
- Lesson length: under 5 minutes with 1–2 mistakes.

## Technical notes
_(cto)_

## Review
_(cto confirms schema validation; pm self-review of CDS-1…13 and criteria 4–7 is recorded
here)_

## PM self-review

**Date:** 2026-11-12 · **Status:** self-reviewed, waiting for the orchestrator's test run and the
native-speaker review (PD-038).

Lesson files: `content/courses/en-de/lessons/de-a1-u01-l1-hello.json`,
`de-a1-u01-l2-whats-your-name.json`, `de-a1-u01-l3-formal-or-informal.json`,
`de-a1-u01-l4-how-are-you.json`, `de-a1-u01-l5-language-school.json`. The unit's manifest entry
was handed to the orchestrator as a fragment. Under the parallel-unit workflow, the orchestrator
creates and merges `course.json` (criterion 1), not this worktree.

| Lesson | MC | Word bank (to_learning / to_known) | Match pairs | Listen | Total |
|---|---|---|---|---|---|
| L1 Hello and Goodbye | 4 | 4 (2 / 2) | 1 | 3 | 12 |
| L2 What's Your Name? | 4 | 4 (2 / 2) | 1 | 3 | 12 |
| L3 Formal or Informal | 3 | 5 (3 / 2) | 1 | 3 | 12 |
| L4 How Are You? | 3 | 5 (3 / 2) | 1 | 3 | 12 |
| L5 First Day at the Language School | 4 | 4 (3 / 1) | 1 | 3 | 12 |

### CDS checklist
- **CDS-1 Files:** PASS for the lesson files. Ids, titles and order match criterion 2. The
  orchestrator adds the unit to `course.json` (creation and version are covered by criterion 1).
- **CDS-2 Mix:** PASS. See the table: each lesson has 12 exercises, at least 3 MC, at least 3
  word banks covering both directions, exactly 1 match pairs exercise with 5 pairs, and at least
  2 listen exercises.
- **CDS-3 Vocabulary control:** PASS. Each lesson only uses its appendix items plus items from
  earlier lessons. Extras used: invented first names and surnames; `mich` (from `freut mich`);
  `es`, `geht` (from `wie geht es Ihnen`); `dir` (from `und dir?`); `ist` (from `mein Name ist`);
  `so`, `nicht` (from `nicht so gut`); `der` / `die` only with `Name`, `Lehrer`, `Lehrerin`.
  Distractor options and tiles follow the same rule. Lesson 2 MC ex07 deliberately avoids
  `die Name` / `das Name`, because `das` isn't taught until Unit 4.
- **CDS-4 Alternatives:** PASS. Accepted answers cover `Ich heiße` / `Mein Name ist` /
  `Ich bin` (criterion 7), `Gut, danke` / `Danke, gut`, `Hello` / `Good day`, `What's` /
  `What is`, `Mrs` / `Ms`, `Thank you` / `Thanks`, `good` / `well`, `I'm` / `I am`. Inverted
  orders that are grammatical (`Lena heiße ich.`, `Lena ist mein Name.`, `Mira bin ich.`) are
  accepted wherever their tiles exist.
- **CDS-5 Distractors:** PASS. Every word bank and listen exercise has 2–4 tiles that the
  canonical answer doesn't use, and also 2–4 for every accepted alternative. Each tile set was
  checked for combinations that form another correct translation. The register-wrong
  combinations (`Wie heißt du?` for a "(formal)" prompt, `Wie geht es dir?` / `Und dir?` for a
  "(formal)" prompt) are wrong on purpose and intentionally not accepted.
- **CDS-6 German conventions:** PASS. Correct `ß` / `ü` throughout (`heiße`, `heißt`,
  `heißen`, `tschüss`) and no capital `ẞ`. Tiles use authored case: nouns, names, `Sie` and
  `Ihnen` capitalised, and every other word lower case, including sentence-initial words. No
  lowercase `sie` in the unit. Register is marked in every prompt where `du` / `Sie` matters.
  Match pairs nouns have articles (`der Name`). `Herr` / `Frau` are only used as titles before
  a surname, so they have no article. For the same reason they are kept out of match pairs.
- **CDS-7 MC direction:** PASS. All 18 MC exercises have English prompts in the standard
  "Which one / Which sentence means '…'?" wording, with German options.
- **CDS-8 Originality:** PASS. All sentences and the language-school scenario are original.
  Names: Aylin, Jonas, Mia, Lukas, Priya, Fatima, Ravi, Lena, Mehmet, Arjun, Sofia, Nora,
  Tomasz, Frau Yilmaz, Herr Kowalski, David Wagner, Frau Nguyen, Frau Schulz, Herr Becker,
  Leila, Frau Novak, Mira, Malik, Frau Brandt. No brands and no celebrities.
- **CDS-9 Audio:** PASS. All 15 listen exercises use `/audio/de/a1/u01/<exercise-id>.mp3`.
- **CDS-10 Tip:** PASS. Tips are 77–109 characters and each one names the lesson's German
  feature.
- **CDS-11 Inclusive and safe:** PASS. No slang and no sensitive topics. The only person noun
  is taught in both forms (`der Lehrer` / `die Lehrerin`) and appears only in MC. No legal
  claims.
- **CDS-12 Validation:** PENDING the orchestrator's `npm run test`. Exercise ids follow
  `de-a1-u01-lN-exNN`. Every accepted answer was hand-checked as buildable from its tiles
  after `normalizeAnswerText` (lower case, punctuation removed, `geht's` kept as one token).
- **CDS-13 Fit:** PASS. The longest prompt is 66 characters (L5 ex01) and the longest tile is
  11 characters (`Wiedersehen`).

### Ticket criteria 4–7
- **4 du/Sie contrast (≥4):** PASS. There are 14: L2 ex02, ex11; L3 ex01, ex03, ex08; L4 ex01,
  ex05, ex07, ex09, ex10; L5 ex01, ex04, ex08, ex09 (all with "(formal)" / "(to a friend)" /
  "(to a classmate)").
- **5 time of day (≥2):** PASS. L1 ex02 ("hello in the morning") and ex06 ("hello in the
  evening").
- **6 scenario (≥6 lines):** PASS. 10 of the 12 L5 exercises are lines of one conversation
  between Mira (learner), Jonas (classmate, `du`) and Frau Brandt (teacher, `Sie`): ex01–06,
  ex08–10, ex12.
- **7 name answers:** PASS. L2 ex04, L3 ex07 and L5 ex03 accept every buildable form. L5 ex03
  offers all three. L2 ex08 and L5 ex06 deliberately leave out the `mein Name ist` tiles.

### Notes and open questions
- Two-sentence answers (L2 ex08, L5 ex03, ex06, ex09) don't accept the sentences in reversed
  order (`Freut mich! Ich bin Mira.`). Policy: the translation keeps the prompt's sentence order.
- L5 uses the verb-first chunks `bist du …?` / `sind Sie …?` before yes/no questions are
  taught as grammar in Unit 3. They are needed for `ja` / `nein` and only appear in MC options.
- Native review candidates: the teacher using `Sie` with an adult learner (standard in
  language schools), and `Wie heißen Sie, bitte?`.
