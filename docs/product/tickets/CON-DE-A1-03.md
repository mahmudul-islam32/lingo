# CON-DE-A1-03: A1 Unit 3 "Numbers and Letters": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-02 · **Milestone:** v0.3.1 ·
**Curriculum:** `curriculum-german.md` §4 Unit 3

## User story
As a learner filling in forms and making calls, I want to say numbers, my phone number and
my age, and spell my name, so that people write my details correctly.

## Unit outline
- **Theme:** numbers 0–100, phone numbers, age, the alphabet and spelling
- **Can-do:** I can count to 100, give my phone number and age, and spell my name, including
  ä, ö, ü and ß.
- **Grammar:** `haben`; `Ich bin … Jahre alt`; yes/no questions with the verb first; units
  before tens (`einundzwanzig`); `-zehn`, `-zig`.

## Acceptance criteria
1. Unit `de-a1-u03`, title "Numbers and Letters", description "Count to 100, give your
   phone number and age, and spell your name letter by letter.", in level A1 after
   `de-a1-u02`, with these lessons in order:
   1. `de-a1-u03-l1-count-to-six` "Count to Six"
   2. `de-a1-u03-l2-count-to-twelve` "Count to Twelve"
   3. `de-a1-u03-l3-how-old-are-you` "How Old Are You?"
   4. `de-a1-u03-l4-big-numbers` "Big Numbers"
   5. `de-a1-u03-l5-spell-it` "Spell It, Please"
2. All of **CDS-1 to CDS-13** pass. Numbers in tiles and answers are written as words
   (no digits).
3. At least 3 exercises are yes/no questions with the verb first (`Hast du eine
   Telefonnummer?`, `Bist du zwanzig?`).
4. At least 3 exercises (in lesson 4 or later) build two-digit numbers with units before tens
   (`vierundzwanzig`), including 1 multiple choice with a tens-first distractor
   (`zwanzigvier`).
5. Lesson 5 has at least 2 listen exercises where a name is spelled, and at least 1 exercise
   each for `ä`, `ö`, `ü` and `ß` (e.g. a name with `ö`, a street with `ß`).
6. `sechzehn`, `siebzehn`, `sechzig`, `siebzig` and `dreißig` are spelled correctly and each
   appears at least once.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Count to Six | null (zero), eins (one), zwei (two), drei (three), vier (four), fünf (five), sechs (six) | 7 |
| 2 | Count to Twelve | sieben (seven), acht (eight), neun (nine), zehn (ten), elf (eleven), zwölf (twelve), die Telefonnummer (the phone number) | 7 |
| 3 | How Old Are You? | dreizehn … neunzehn (13–19, taught as the -zehn pattern), zwanzig (twenty), wie alt? (how old?), alt (old), das Jahr / die Jahre (the year / years), haben: ich habe, du hast, er hat, Sie haben (to have) | 6 |
| 4 | Big Numbers | einundzwanzig … neunundzwanzig (the "one-and-twenty" pattern), dreißig (thirty), vierzig … neunzig (the -zig pattern), hundert (hundred), die Handynummer (the mobile number) | 5 |
| 5 | Spell It, Please | das Alphabet (the alphabet), buchstabieren (to spell), wie schreibt man das? (how do you spell that?), das Eszett (the letter ß), noch einmal (once more / again), langsam (slowly) | 6 |

Unit total: 31 entries (number patterns count as one entry each).

## Out of scope
- Prices (Unit 4), times (Unit 7), dates and ordinals (Unit 12)
- Numbers above 100

## UX notes
- Tip examples: "German says the units first: 24 is vierundzwanzig, 'four and twenty'.";
  "ß is a letter of its own. It sounds like a sharp s."
- Phone numbers are read in single digits or pairs; accept both in `to_known` answers.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
Date: 2026-11-12. The checks were done by hand; the schema test was not run in this session.
The orchestrator runs `npm run test` after it merges the unit into `course.json`.

| Check | Result | Notes |
|---|---|---|
| Crit. 1 / CDS-1 Files | PASS (pending merge) | 5 lesson files with the ticket's ids and titles. The unit fragment (id, title, description, lessons in order) was handed to the orchestrator. `course.json` and `version` are not edited here, because units 1–4 are written in parallel. |
| CDS-2 Mix | PASS | Every lesson has 12 exercises. MC / WB (to_learning + to_known) / match / listen: L1 4 / 2+2 / 1 / 3; L2 4 / 2+2 / 1 / 3; L3 4 / 2+2 / 1 / 3; L4 4 / 2+2 / 1 / 3; L5 3 / 3+1 / 1 / 4. |
| CDS-3 Vocabulary | PASS, 1 note | Only appendix items plus Units 1–2. Allowed extras: names (Jonas, Leyla, Okafor, Novak, Jörg, Krüger, Jäger), Hamburg, the street name Mühlenstraße, the plural `Freunde`, forms of taught verbs (`lerne`, `lernst`, `buchstabiert`, `ist`, `sind`), `das` / `man` / `schreibt` from the taught phrase. Note: `eine` (L3, L4) is the feminine form of `ein` (from `ein bisschen`). The ticket uses it in criterion 3. Logged for CON-DE-A1-QA. |
| CDS-4 Alternatives | PASS | Age: `Ich bin achtzehn Jahre alt.` / `Ich bin achtzehn.`; `is/are` in sums; English place-first order; 4 `noch einmal, bitte` / `bitte langsam` orders; the mobile number read in pairs, digit by digit and both mixes (4 answers, L4-ex06, UX note). |
| CDS-5 Distractors | PASS | 2–4 distractor tiles in every word bank and listen exercise. Each tile combination was checked against the accepted list. Letter distractors (O, U, A, Ö) contrast with the umlauts. |
| CDS-6 Conventions | PASS | ä/ö/ü/ß written correctly, no `ss`/`ae` and no capital ẞ. Nouns are capitalised, and match pairs give each noun its article (die Telefonnummer, die Handynummer, das Jahr, das Alphabet, das Eszett). Tiles keep their authored case, sentence-initial words are lower case, and spelled letters are capitals. No `sie` + `Sie` in the same tile set. "(formal)" and "(to a friend)" are marked where needed. |
| CDS-7 MC direction | PASS | English prompts, German options, standard wording. |
| CDS-8 Originality | PASS | All sentences and names are original. |
| CDS-9 Audio | PASS | Every listen has `/audio/de/a1/u03/<exercise-id>.mp3` (placeholder). |
| CDS-10 Tip | PASS | Each tip is ≤ 120 characters (longest: L3, 96). |
| CDS-11 Safe | PASS | No sensitive content and no person nouns that need paired forms. |
| CDS-12 Ids | PASS (pending test) | `de-a1-u03-lN-exNN`, unique. |
| CDS-13 Fit | PASS | Longest prompt 75 characters (L4-ex06). Longest tile 16 characters (`siebenundfünfzig`). No digits in tiles or answers. |
| Crit. 2 Numbers as words | PASS | No digits in tiles or answers. Digits only appear in the L4 tip. |
| Crit. 3 Yes/no questions | PASS | L3-ex06 `Bist du zwanzig?`, L3-ex07 `Hast du eine Telefonnummer?`, L3-ex08 `Ist er sechzehn?`, L3-ex09 `Haben Sie eine Telefonnummer, Herr Okafor?`, L4-ex08 `Haben Sie eine Handynummer?` |
| Crit. 4 Units before tens | PASS | L4-ex01 MC (distractor `zwanzigvier`), L4-ex04, L4-ex07 (`fünfzigacht`), L4-ex09 (`achtunddreißig` vs `dreiundachtzig`), L4-ex10, L4-ex12. |
| Crit. 5 Lesson 5 spelling | PASS | Spelled names in listen exercises: ex03 Jörg (ö), ex06 Krüger (ü), ex12 Jäger (ä). ß: ex09 `Mühlenstraße`, plus `das Eszett` in ex02 and ex05. ä also in ex10. |
| Crit. 6 Spelling of numbers | PASS | sechzehn (L3-ex01, ex08), siebzehn (L3-ex03, ex12), sechzig (L4-ex03), siebzig (L4-ex03, ex05), dreißig (L4-ex02, ex03, ex12). |

**Needs native review (for CON-DE-A1-QA):**
- MC distractors that are not real words on purpose: `sechszehn`, `dreizig`, `zwanzigvier`, `zwanzigundvier`, `fünfzigacht`.
- `Zwei und zwei ist vier` (colloquial `ist`; `sind` is also used).
- Letter tiles: placeholder TTS has to read "J, Ö, R, G" as German letter names.
- `Ist er sechzehn?`: the statement-order tiles `Er ist sechzehn` can also be built, and that echo-question form is not accepted. This is on purpose, because the lesson teaches verb-first questions.
