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
