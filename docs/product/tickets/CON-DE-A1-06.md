# CON-DE-A1-06: A1 Unit 6 "Family and Friends": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-05 · **Milestone:** v0.3.2 ·
**Curriculum:** `curriculum-german.md` §4 Unit 6

## User story
As a learner making friends and filling in family details, I want to introduce my family and
talk about the people in my photos, so that I can share my life with others.

## Unit outline
- **Theme:** family members, relationships, pets, describing people
- **Can-do:** I can introduce my family, say who is who in a photo, and say whether I am
  married and have children or siblings.
- **Grammar:** possessives `mein`, `dein`, `Ihr`, `sein`, `ihr` (+ `meinen` in the
  accusative); `haben` + accusative; `Das ist …` / `Das sind …`; predicative adjectives.

## Acceptance criteria
1. Unit `de-a1-u06`, title "Family and Friends", description "Introduce your family, talk
   about brothers, sisters, partners and pets, and describe people in your photos.", in level
   A1 after `de-a1-u05`, with these lessons in order:
   1. `de-a1-u06-l1-my-family` "My Family"
   2. `de-a1-u06-l2-brothers-and-sisters` "Brothers and Sisters"
   3. `de-a1-u06-l3-your-family` "Your Family?"
   4. `de-a1-u06-l4-grandparents-and-pets` "Grandparents and Pets"
   5. `de-a1-u06-l5-photos` "Photos on the Phone"
2. All of **CDS-1 to CDS-13** pass.
3. At least 4 exercises choose between `mein` and `meine` (or `dein / deine`) by the noun's
   gender or plural.
4. At least 2 exercises use `haben` + masculine accusative (`Ich habe einen Bruder.`, `Hast du
   einen Hund?`), and at least 1 uses `keine Geschwister`.
5. At least 2 exercises contrast `sein` (his) and `ihr` (her), with an English prompt that
   makes the owner clear.
6. Family content is inclusive: examples include single people, couples without children, a
   single parent and a family with step-relatives or same-sex partners described neutrally.
   No exercise assumes a family type.
7. `die Frau` as "wife" and "woman / Mrs" is handled: every `to_known` answer with `Frau`
   accepts the meaning that fits the sentence, and prompts avoid ambiguity.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | My Family | die Familie (the family), die Mutter (the mother), der Vater (the father), die Eltern (the parents), das Kind / die Kinder (the child / children), mein / meine (my) | 6 |
| 2 | Brothers and Sisters | der Bruder (the brother), die Schwester (the sister), die Geschwister (siblings), der Sohn (the son), die Tochter (the daughter), älter / jünger (older / younger) | 6 |
| 3 | Your Family? | dein / deine (your, informal), Ihr / Ihre (your, formal), verheiratet (married), ledig (single), der Mann / die Frau (the husband / the wife), der Partner / die Partnerin (the partner) | 6 |
| 4 | Grandparents and Pets | die Großeltern (the grandparents), die Oma (grandma), der Opa (grandpa), der Hund (the dog), die Katze (the cat), das Foto (the photo), sein / ihr (his / her) | 7 |
| 5 | Photos on the Phone | wer ist das? (who is that?), das sind … (these are …), groß (tall / big), klein (short / small), nett (nice / kind), süß (cute / sweet) | 6 |

Unit total: 31 items.

## Out of scope
- Possessives in the dative (`mit meiner Mutter`): A2
- Adjective endings before nouns (`mein kleiner Bruder`): A2

## UX notes
- Tip examples: "Use mein with der and das words, meine with die words and plurals.";
  "Formal Ihr (your) has a capital I, like Sie."
- `sie` / `Sie` rule (PD-033) applies with `ihr` / `Ihr` too: never both in one tile set.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–7)_

## PM self-review
_Date: 2026-11-12 · pm · native-speaker review still pending (PD-038)._

**Files:** 5 lesson files in `content/courses/en-de/lessons/` (`de-a1-u06-l1-my-family`,
`-l2-brothers-and-sisters`, `-l3-your-family`, `-l4-grandparents-and-pets`, `-l5-photos`).
The unit entry for `course.json` was handed to the orchestrator as a fragment. The
orchestrator adds it after `de-a1-u05` and bumps the course `version`.

**Mix per lesson (12 exercises each, 60 in total):**

| Lesson | MC | WB to_learning | WB to_known | Match | Listen |
|---|---|---|---|---|---|
| L1 My Family | 4 | 2 | 2 | 1 | 3 |
| L2 Brothers and Sisters | 4 | 2 | 2 | 1 | 3 |
| L3 Your Family? | 4 | 3 | 2 | 1 | 2 |
| L4 Grandparents and Pets | 4 | 2 | 2 | 1 | 3 |
| L5 Photos on the Phone | 3 | 3 | 2 | 1 | 3 |

**CDS checks**
- CDS-1 Files: PASS for the lesson files, with the ticket's ids and titles. course.json is
  handled by the orchestrator.
- CDS-2 Mix: PASS (table above).
- CDS-3 Vocabulary: PASS. Every item comes from this unit's appendix or Units 1–5. `das sind`
  and `wer ist das?` first appear in L5 and nowhere earlier. Allowed extras: names (Kemal, Nia,
  Mira, Selin, Jonas, Ewa, Ines, Chiara, Ben, Momo, Lea, Emil, Ole, Jana, Malik, Weber), real
  cities (Hamburg, Salzburg, Bonn, Leipzig, Kiel, Graz), regular plurals (`Kinder`,
  `Schwestern`), and the `seine` / `ihre` / `deine` / `Ihre` forms, which follow the
  `mein / meine` pattern. Note: L2 ex11 (`meinen Kaffee`) reuses `Kaffee` (U4) and
  `brauchen` (U5). It's there for the `meinen` accusative from the grammar outline.
- CDS-4 Alternatives: PASS. Word-order variants are listed wherever the tiles allow them
  (`Kemal heißt mein Vater.`, `Zwei Kinder habe ich.`, son/daughter order, 4 orders of
  "two sisters and a brother", `this` / `that`, `are from` / `come from`, `cute` / `sweet`,
  `Mrs` / `Ms`, `sein Partner` / `seine Partnerin`).
- CDS-5 Distractors: PASS. Every word bank and listen exercise has 2–4 distractors. I checked
  each combination: the distractors only form wrong-meaning or ungrammatical sentences.
  Answers never need the same tile twice.
- CDS-6 Conventions: PASS. Umlauts and ß are correct (`Großeltern`, `heißt`, `süß`, `älter`,
  `jünger`, `zwölf`). Nouns are capitalised, and match pairs nouns have their article. No tile
  set contains both `sie` and `Sie`, or both `ihr` and `Ihr`. L3 only uses `Sie`. L2 only uses
  `sie`. L4 and L5 only use lower-case `ihr`. Register is marked ("(formal)", "(to a
  friend)").
- CDS-7 MC direction: PASS. 19 MC, all with English prompts and German options.
- CDS-8 Originality: PASS. All sentences and names are invented.
- CDS-9 Audio: PASS. 14 listen exercises, all at `/audio/de/a1/u06/<exercise-id>.mp3`.
- CDS-10 Tip: PASS. Longest is 100 characters (L3).
- CDS-11 Inclusive and safe: PASS (see criterion 6). Person nouns: L5 ex12 accepts both
  `Partner` and `Partnerin`.
- CDS-12 Validation: ids follow `de-a1-u06-lN-exNN` and are unique. I checked by hand that
  every answer can be built from its tiles after the `text.ts` normalisation. `npm run test`
  is still to be run by the orchestrator.
- CDS-13 Fit: PASS. The longest prompt is 65 characters (L3 ex08) and the longest tile is 11
  (`verheiratet`).

**Ticket criteria**
- 3 (mein/meine, dein/deine by gender or plural, ≥ 4): PASS, 8 exercises. These are L1 ex03,
  ex04, ex07, ex11; L2 ex08; L3 ex02, ex08; L5 ex03.
- 4 (`haben` + masculine accusative ≥ 2, `keine Geschwister` ≥ 1): PASS. `haben` + masculine
  accusative is in L2 ex02, ex07, ex10; L3 ex10, ex12; L4 ex04. `keine Geschwister` is in
  L2 ex05.
- 5 (sein / ihr contrast with a clear owner ≥ 2): PASS, in L4 ex03 (his cat), ex07 (his
  husband) and ex10 (her grandpa). L4 ex06 and ex12 add more `ihr` practice.
- 6 (inclusive families): PASS. Single person: L3 ex04. Couple without children: L3 ex07.
  Single parent: L3 ex12 (`Ich bin ledig und habe einen Sohn.`). Same-sex partners, described
  neutrally: L3 ex09 (Ines and her Partnerin Chiara) and L4 ex07 (Emil and his husband).
  Step-relatives are not used because their nouns aren't in the A1 appendix. No exercise
  assumes a family type.
- 7 (`Frau` as wife vs Mrs): PASS. The `to_known` answer for `Meine Frau heißt Ewa.` (L3 ex05)
  is "My wife …". For `Frau Weber ist sehr nett.` (L5 ex11) it is "Mrs / Ms Weber …". In both
  cases the other meaning is only a distractor (`woman`, `wife`).

**Needs native review (for CON-DE-A1-QA)**
1. L2 ex11 `Ich brauche meinen Kaffee.` is natural, but it's off-theme. It's the only
   `meinen` item.
2. L4 ex08 `Oma hat eine Katze.`: `Oma` is used without an article, like a name. This is
   standard in speech, but please confirm it works as the answer to "Grandma has a cat."
3. L1 ex08 and L3 ex07 / ex12 accept inverted or swapped-clause variants. Check that none
   sounds unnatural.
4. L5 ex01 glosses `groß` as "tall / big" and `klein` as "short / small". The English for
   `klein` about people ("short") may need a usage note later.
