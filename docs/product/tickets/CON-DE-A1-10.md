# CON-DE-A1-10: A1 Unit 10 "The New Flat": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-09 · **Milestone:** v0.3.3 ·
**Curriculum:** `curriculum-german.md` §4 Unit 10

## User story
As a learner looking for a place to live, I want to describe a flat and ask about rent and
size at a viewing, so that I can find a home.

## Unit outline
- **Theme:** rooms, furniture, describing a flat, a flat viewing
- **Can-do:** I can describe a flat and its rooms, say what is in a room, and ask about the
  rent and size at a viewing.
- **Grammar:** `es gibt` + accusative; predicative adjectives and `zu`; gender and plural
  review with room and furniture nouns.

## Acceptance criteria
1. Unit `de-a1-u10`, title "The New Flat", description "Name rooms and furniture, describe
   a flat and ask the right questions at a viewing.", in level A1 after `de-a1-u09`, with
   these lessons in order:
   1. `de-a1-u10-l1-rooms` "Rooms"
   2. `de-a1-u10-l2-furniture` "Furniture"
   3. `de-a1-u10-l3-there-is` "There Is…"
   4. `de-a1-u10-l4-big-small-bright` "Big, Small, Bright"
   5. `de-a1-u10-l5-the-viewing` "The Viewing"
2. All of **CDS-1 to CDS-13** pass. Rents and sizes are written in words.
3. At least 4 exercises use `es gibt` with a masculine accusative, either `einen` (`Es gibt
   einen Balkon.`) or `keinen` (`Es gibt keinen Kühlschrank.`).
4. At least 6 multiple-choice or match-pairs items practise the gender of room and furniture
   nouns, covering all three genders.
5. At least 2 exercises use `zu` + adjective (`Das Zimmer ist zu klein.`).
6. Lesson 5 is a viewing dialogue with a landlord or landlady (Sie), with at least 1 question
   about rent and 1 about size. No real prices are presented as typical; amounts are invented.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Rooms | die Wohnung (the flat / apartment), das Zimmer (the room), die Küche (the kitchen), das Bad (the bathroom), das Schlafzimmer (the bedroom), das Wohnzimmer (the living room), der Balkon (the balcony) | 7 |
| 2 | Furniture | der Tisch (the table), der Stuhl (the chair), das Bett (the bed), der Schrank (the wardrobe / cupboard), das Sofa (the sofa), die Lampe (the lamp) | 6 |
| 3 | There Is… | es gibt (there is / there are), das Fenster (the window), die Waschmaschine (the washing machine), der Kühlschrank (the fridge), die Heizung (the heating) | 5 |
| 4 | Big, Small, Bright | hell (bright / light), dunkel (dark), ruhig (quiet), laut (loud / noisy), schön (beautiful / nice), zu (too, before an adjective) | 6 |
| 5 | The Viewing | die Miete (the rent), der Quadratmeter (the square metre), die Besichtigung (the viewing), frei (available / free), ab sofort (from now on / immediately), der Vermieter / die Vermieterin (the landlord / landlady) | 6 |

Unit total: 30 items.

## Out of scope
- Two-way prepositions (`im Zimmer`, `ins Zimmer`): A2
- Rental contracts, deposits and legal terms: B1

## UX notes
- Tip examples: "'Es gibt' takes the accusative: Es gibt einen Balkon."; "Zimmer is the same
  in the plural: ein Zimmer, zwei Zimmer."
- No property-portal names.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
_Date: 2026-11-12 · Reviewer: pm · Native review still pending (PD-038)._

**Files:** `content/courses/en-de/lessons/de-a1-u10-l1-rooms.json`, `…-l2-furniture.json`,
`…-l3-there-is.json`, `…-l4-big-small-bright.json`, `…-l5-the-viewing.json`. The unit
fragment for `course.json` was handed to the orchestrator; the pm doesn't edit `course.json`
in this worktree.

| Lesson | Exercises | MC | Word bank (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| L1 Rooms | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L2 Furniture | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L3 There Is… | 12 | 4 | 4 (3 / 1) | 1 | 3 |
| L4 Big, Small, Bright | 12 | 4 | 4 (3 / 1) | 1 | 3 |
| L5 The Viewing | 12 | 3 | 5 (3 / 2) | 1 | 3 |

**CDS checks**
1. CDS-1 Files: PASS for the lesson files (ids and titles exactly as criterion 1). The
   `course.json` entry and version bump are done by the orchestrator.
2. CDS-2 Mix: PASS (table above).
3. CDS-3 Vocabulary: PASS, with one flagged item. Each lesson brings in only its appendix
   items (7 / 6 / 5 / 6 / 6). Extras used: names (Amira, Jonas, Frau Brandt); regular plurals
   (`Lampen`, `Fenster`, `Zimmer`); `die Vermieterin` as the paired form of `der Vermieter`;
   `guten Abend` (U1) as a distractor; `ich nehme` (U9); `um zehn Uhr` (U7); `groß / klein`
   (U6); `haben` + `einen` (U5). Irregular plurals (`Stühle`, `Schränke`, `Bäder`) were left out
   on purpose. **Flag:** `achthundert` (L5 ex09) is `acht` + `hundert`, both taught in U3, but
   the hundreds compound itself was never taught. It is the only way to state a realistic
   rent in words. It goes on the CON-DE-A1-QA list. `zu` (too) appears only from L4 on.
4. CDS-4 Alternatives: PASS. Word banks list the topicalised orders the tiles allow
   (`Einen Balkon hat die Wohnung.`, `Neu ist das Sofa.`, `Einen Kühlschrank gibt es.`,
   `Sechzig Quadratmeter hat die Wohnung.`, `Ab sofort ist die Wohnung frei.`), conjunct
   swaps (L1 ex09, L2 ex08), and English variants (wardrobe / cupboard, noisy / loud,
   `There is no` / `There isn't a`, `isn't` / `is not`, `at ten` / `at ten o'clock`, the name
   before or after the question). Listen answers are the exact transcript. Not accepted on
   purpose: L4 ex10 `Die Wohnung ist nicht zu teuer und schön.` (the scope of `nicht` becomes
   ambiguous).
5. CDS-5 Distractors: PASS. Every word bank has 2–4 tiles that appear in no accepted answer.
   Distractors either change the meaning (`zu` vs `sehr`, `sechzehn` vs `sechzig`, `eleven`)
   or are ungrammatical (`ein Balkon`, `der Stuhl` as an object). In L3 ex08 `gibt` / `es` were
   kept out so that `Es gibt vier Fenster` can't be built. No answer needs the same tile twice.
6. CDS-6 Conventions: PASS. Umlauts and ß are correct (`Küche`, `Kühlschrank`, `schön`,
   `groß`, `fünf`), nouns are capitalised, every match-pair noun has its article, tiles are in
   authored case, and no tile set contains `sie`. `Sie` appears only in L5 ex11, marked
   "(formal)"; `du` in L1 ex11 is clear from the name.
7. CDS-7: PASS. All MC prompts are in English and all options are in German, using the
   standard wording.
8. CDS-8: PASS. Sentences and the viewing scenario are original; no brands or property
   portals.
9. CDS-9: PASS. Every listen audio path is `/audio/de/a1/u10/<exercise-id>.mp3`.
10. CDS-10: PASS. Tips are 96–103 characters.
11. CDS-11: PASS. No legal or contract terms, and the rent is an invented amount (800 €)
    that isn't presented as typical.
12. CDS-12: hand-checked against the schema (strict keys, 3–4 options, 5 pairs, ≤ 16 tiles,
    every answer buildable after normalisation). The orchestrator runs `npm run test`.
13. CDS-13: PASS. The longest prompt is 51 characters (L3 ex11) and the longest tile is 14
    (`Entschuldigung`). The match pairs use `der Vermieter` only, because `der Vermieter / die
    Vermieterin` would be a 31-character tile.

**Unit criteria**
- 3: PASS. `es gibt` + masculine accusative: L3 ex02 (`einen Balkon`), ex03 (`einen
  Kühlschrank`), ex06 (`keinen Kühlschrank`), ex09 (`keinen Balkon`), ex12 (`einen
  Kühlschrank`).
- 4: PASS. Eight gender MCs: L1 ex01 (die Küche), ex05 (das Bad), ex07 (der Balkon); L2 ex02
  (der Stuhl), ex03 (das Bett), ex06 (die Lampe); L3 ex04 (der Kühlschrank), ex07 (die
  Heizung). Match pairs with articles add more (L1 ex02, L2 ex01, L3 ex01).
- 5: PASS. `zu` + adjective: L4 ex04, ex05, ex06, ex10; L5 ex10.
- 6: PASS. In L5 Frau Brandt, the landlady, shows the flat (ex02). The learner asks with Sie
  (ex11). Rent: ex08 (`Wie viel kostet die Miete?`), ex09, ex10. Size: ex06 (`Wie groß ist
  die Wohnung?`), ex07 (`sechzig Quadratmeter`).

**Needs native review (to CON-DE-A1-QA)**
- `achthundert` (hundreds compound not formally taught).
- `Wie viel kostet die Miete?`: common in speech; `Wie hoch ist die Miete?` is more formal
  but needs `hoch`.
- `Die Wohnung ist frei ab sofort.` (ad-style word order, accepted) and `Frei ist die
  Wohnung ab sofort.` (marked, accepted).
- `Keine Heizung gibt es.` and `Sehr hell ist die Küche.`: grammatical but marked; accepted.
- `Hier gibt es einen Kühlschrank und zwei Fenster.`: is the list of items natural enough?
