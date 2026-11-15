# CON-DE-A2-14: A2 Unit 14 "Plans and the Future": 5 original lessons incl. A2 checkpoint (en → de)
**Owner:** pm (content writer) · **Priority:** P0 · **Depends on:** CON-DE-A1-QA; appendices
of CON-DE-A2-01 … 13 (PD-052) · **Milestone:** v0.5.0 · **Wave:** 4 · **Curriculum:**
`curriculum-german.md` §4b Unit 14 · **Decisions:** PD-035, PD-045 … PD-052

## User story
As a learner finishing A2, I want to talk about my plans and goals and review the whole
level, so that I know I can handle everyday life and am ready for B1.

## Unit outline
- **Theme:** plans, predictions, goals, life one year after arriving; A2 checkpoint
- **Life in DACH:** one year in: a new course, a new job, moving flat, missing home and
  feeling proud
- **Can-do:** I can talk about plans and make predictions, describe my life now with
  adjectives, and use everything from A2 in a "my first year" situation.
- **Grammar:** **`werden` + infinitive** (future, predictions); `werden` = "to become";
  future time words; adjective endings and all A2 grammar recycled.

## Lesson outline
1. `de-a2-u14-l1-i-will` **"I Will…"**: `Ich werde nächstes Jahr in Wien wohnen.`, `Wirst du
   den Kurs machen?`, `Wir werden bald umziehen` is **not** allowed (`umziehen` is L3); use
   `Wir werden bald eine Wohnung suchen.`, `In Zukunft werde ich mehr lesen.`, `der Plan`,
   `planen`.
2. `de-a2-u14-l2-predictions` **"It Will Rain"**: `Morgen wird es regnen.`, `Es wird kalt.`,
   `Am Abend wird es dunkel.`, `Das wird wahrscheinlich teuer.`, `Sie kommt sicher /
   bestimmt.`, `die Wolke`, `der Nebel`. Recycles U1 weather.
3. `de-a2-u14-l3-goals` **"Goals"**: `Mein Ziel ist B1` is **not** allowed (level codes are UI
   text, not content); use `Mein Ziel ist ein neuer Job.`, `Ich werde die Prüfung machen.`,
   `Ich hoffe, dass ich die Prüfung bestehe.`, `Ich übe jeden Tag` is **not** allowed
   (`jeden` not taught); use `Ich übe immer abends.`, `Ich lerne weiter Deutsch.`, `Mein
   Traum ist ein kleines Haus.`, `Wir ziehen im Mai um.`
4. `de-a2-u14-l4-about-me` **"About Me"**: a short self-portrait one year after arrival:
   `Ich habe eine kleine Wohnung und einen neuen Job.`, `Ich bin glücklich und zufrieden.`,
   `Ich vermisse meine Familie.`, `Ich bin stolz.`, `die Heimat`, `das Leben`.
5. `de-a2-u14-l5-a2-checkpoint` **"A2 Checkpoint: Your First Year"**: 14 exercises, one per A2
   unit, as one invented story: Lina (the A1 checkpoint character) looks back on her first
   year and ahead to the next. New items: `schaffen` (`Ich habe es geschafft!`), `die
   Erinnerung`.

## Acceptance criteria
1. Unit `de-a2-u14`, title "Plans and the Future", description "Talk about plans, goals and
   predictions with werden, and finish A2 with a review of your first year.", in level A2
   after `de-a2-u13`, with these lessons in order:
   1. `de-a2-u14-l1-i-will` "I Will…"
   2. `de-a2-u14-l2-predictions` "It Will Rain"
   3. `de-a2-u14-l3-goals` "Goals"
   4. `de-a2-u14-l4-about-me` "About Me"
   5. `de-a2-u14-l5-a2-checkpoint` "A2 Checkpoint: Your First Year"
2. All of **CDS-1 to CDS-19** pass, with the checkpoint exception of PD-047.
3. `werden` + infinitive appears in at least 6 exercises, covering `ich werde`, `du wirst`,
   `er / sie / es wird` and `wir werden`; where the English has a time word and the tiles
   allow it, the present-tense answer is also accepted (CDS-19.3).
4. `werden` = "to become" appears in at least 2 exercises, and 1 multiple choice for "It's
   getting cold." offers `Es wird kalt.` (correct) with the distractors `Es ist kalt.` and
   `Es werdet kalt.`.
5. L4 has at least 3 exercises with attributive adjective endings (nominative and accusative,
   U6 rules).
6. **A2 checkpoint (L5):** exactly **14 exercises**, one built around each A2 unit (U1–U14),
   told as one story; the mapping unit → exercise id is recorded in the self-review. The
   type mix of CDS-2 holds (at least 3 MC, 3 word banks with both directions, 1 match pairs,
   2 listen). Only the 2 new items below. The tip starts "This lesson reviews all of A2."
7. `die Prüfung` is a generic exam: no exam names, levels as content, pass guarantees or
   certification claims (PD-035).
8. After this ticket, level A2 in `course.json` has exactly 14 units and 70 lessons.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | I Will… | werden: ich werde, du wirst, er wird (will, future), bald (soon), nächstes Jahr (next year), die Zukunft / in Zukunft (the future / in future), der Plan (the plan), planen (to plan) | 6 |
| 2 | It Will Rain | werden (to become / get: Es wird kalt.), wahrscheinlich (probably), sicher (surely / safe), bestimmt (definitely / certainly), die Wolke (the cloud), der Nebel (the fog) | 6 |
| 3 | Goals | das Ziel (the goal), die Prüfung (the exam), bestehen (to pass, an exam), üben (to practise), weiter (further / on: weiter lernen), der Traum (the dream), umziehen / umgezogen (to move house) | 7 |
| 4 | About Me | das Leben (life), glücklich (happy), zufrieden (satisfied / content), stolz (proud), vermissen (to miss), die Heimat (home / home country) | 6 |
| 5 | A2 Checkpoint: Your First Year | schaffen: ich habe es geschafft (to manage / make it), die Erinnerung (the memory) | 2 |

Unit total: 27 items. `nächste` (A1) is used in the fixed chunks `nächstes Jahr` / `nächste
Woche`. `wurde` and Futur II are not taught.

## Out of scope
- `werden` passive (B1), Futur II (B2), `würde` (B1)
- A dedicated checkpoint node, badge or timer (Phase 2, curriculum §6)
- Exam preparation content (PD-035)

## UX notes
- Tip examples: "Future: werden + infinitive at the end: Ich werde Deutsch lernen.";
  "werden alone means become: Es wird dunkel."; checkpoint: "This lesson reviews all of A2.
  Follow Lina through her first year."
- The checkpoint story is warm and ends on an encouraging line (`Ich habe es geschafft!`).

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…19 and criteria 3–8)_

## PM self-review

_2026-11-15 · pm (content writer) · I checked every exercise by hand against CDS-1…19, criteria
3–8 and the zod schemas in `src/contracts/course.ts`: field names, the `type` discriminator, MC
option ids, 5 pairs, and that each answer can be built from its tiles under the PD-033
normalisation in `text.ts`. I checked vocabulary against the A1 appendices, CON-DE-A1-QA, the
CON-DE-A2-01…12 appendices and the CON-DE-A2-13 appendix (PD-052). The orchestrator runs the
schema test._

### Files
- `content/courses/en-de/lessons/de-a2-u14-l1-i-will.json` (12 exercises)
- `content/courses/en-de/lessons/de-a2-u14-l2-predictions.json` (12)
- `content/courses/en-de/lessons/de-a2-u14-l3-goals.json` (12)
- `content/courses/en-de/lessons/de-a2-u14-l4-about-me.json` (12)
- `content/courses/en-de/lessons/de-a2-u14-l5-a2-checkpoint.json` (14, PD-047)
- The unit fragment for `course.json` (`de-a2-unit-14.json`) goes to the orchestrator. I did not
  edit `course.json`.

### Mix per lesson (CDS-2)
| Lesson | MC | WB (to_learning / to_known) | Match | Listen | Total |
|---|---|---|---|---|---|
| L1 | 3 | 5 (3 / 2) | 1 | 3 | 12 |
| L2 | 3 | 5 (3 / 2) | 1 | 3 | 12 |
| L3 | 4 | 5 (3 / 2) | 1 | 2 | 12 |
| L4 | 3 | 5 (3 / 2) | 1 | 3 | 12 |
| L5 | 3 | 7 (5 / 2) | 1 | 3 | 14 |

### CDS results
| Rule | Result | Note |
|---|---|---|
| CDS-1 Files | PASS (fragment) | Ids and titles match criterion 1. The orchestrator inserts the unit after `de-a2-u13` with `level: "A2"` and bumps `version`. |
| CDS-2 Mix | PASS | See the table above. L5 has 14 exercises (PD-047 exception); the type mix holds. |
| CDS-3 Vocabulary | PASS (1 deviation from the outline, see doubt 1) | Each lesson uses every item in its appendix row. Other words come from A1 and A2-01…13. Extras: invented names (Lina, Johanna); real cities (Wien, Berlin, Bonn); forms of taught verbs (`wir werden`, `werdet`, `plane`, `lese`, `bestehe`, `übe`, `ziehen … um`); regular plurals (`Wolken`, `Fragen`, `Kollegen`); adjective endings of taught adjectives and the regular comparative `schneller` (CDS-16). Irregular participles only from appendices (`gefahren`, `umgezogen`, `mitgebracht`); `eingeladen` and `gegeben` are deliberately not used. L5 adds only `geschafft` (`schaffen`) and `die Erinnerung`. |
| CDS-4 Alternatives | PASS | Time-first / PP-first orders (L1 ex06, ex10, ex12; L2 ex03, ex10; L3 ex06, ex10; L5 ex01, ex05, ex14), object-first short NP (L1 ex12, L3 ex03, L5 ex04), `weil` / `wenn` clause-first (L4 ex08, L5 ex08, ex12), `we're` / `he'll` / `I'll` / `I've`, `autumn` / `fall`, `small` / `little`, `satisfied` / `content`, `trip` / `journey`, `surely` / `definitely`. Listens accept the transcript only. |
| CDS-5 Distractors | PASS | Every word bank and listen has 2–4 distractors beyond the canonical answer. I left out tiles that would build unlisted valid answers: `machst` (L1 ex03), `mache` (L3 ex03), `denn` (L4 ex08, L5 ex08), `regnet` (L2 ex12), `will` (L1 ex08), `gemacht` (L5 ex14). The remaining distractor combinations make sentences with another meaning (`Heute wird es regnen.`, `Ich kann nicht kommen, weil ich krank bin.`); none of them translates its prompt. |
| CDS-6 Conventions | PASS | Umlauts and `ß` are correct (`nächstes`, `Prüfung`, `üben`, `glücklich`, `groß`, `schöne`, `Verspätung`, `früh`, `spät`); no capital `ẞ`. Nouns are capitalised and other tiles lower case. No set has both `sie` / `Sie`, `ihr` / `Ihr` or `ihnen` / `Ihnen` (`sie` appears only in L2 ex11). Register is marked: "(to a friend)" in L1 ex03, L3 ex11, L5 ex12. No digits in tiles. Tips use „…“. |
| CDS-7 MC direction | PASS | English prompts, German options, PD-044 punctuation. |
| CDS-8 Originality | PASS | All sentences and the checkpoint story are original. No brands, exam names or media titles. |
| CDS-9 Audio | PASS | All 14 listens use `/audio/de/a2/u14/<id>.mp3`. |
| CDS-11 Safe | PASS | No legal, visa, medical or exam claims; `erkältet` is used only to describe how Lina felt, with no advice. |
| CDS-12 Ids | PASS | `de-a2-u14-lN-exNN`, unique. MC options are `a`–`d`, pairs `p1`–`p5`. |
| CDS-13 Fit | PASS | The longest prompt is 63 characters (L3 ex11). The longest tile is `wahrscheinlich` (14). |
| CDS-14 Drill | PASS | No row is marked *pattern*, but `werden` is still drilled with typical-error MCs: L1 ex02 (V2 instead of a final infinitive, `wird` for `werde`, a finite form at the end), L1 ex05, L2 ex09 (`wirst`, `kommt`, wrong order), L3 ex11 (separable verb split after `werden`). |
| CDS-15 Tip | PASS | All 5 tips name the rule and give one German example; the longest is about 150 characters. The L5 tip starts "This lesson reviews all of A2." |
| CDS-16 | PASS | Endings are nominative / accusative only; no dative attributive adjective is used. |
| CDS-17 | PASS | No tile set has `ihr` / `Ihr` or `ihnen` / `Ihnen`. |
| CDS-18 | PASS | Numbers are words (`zehn Minuten`, `einem Jahr`). |
| CDS-19 | PASS | `war`, `hatte` and `konnte` are Präteritum; other past verbs use the Perfekt (`gekocht`, `gefahren`, `umgezogen`, `mitgebracht`, `geschafft`). "Will" → `werden`. The present is also accepted where the English has a time word and the tiles allow it (L1 ex06, L2 ex03); in the other exercises the present form is not in the tiles. `dass` clauses come after the main clause; `weil` / `wenn` are accepted in both orders. |

### Unit criteria 3–8
| # | Result | Evidence |
|---|---|---|
| 3 | PASS | `werden` + infinitive appears in 15 exercises: L1 ex02–ex07, ex10–ex12; L2 ex03, ex09, ex12; L3 ex03, ex11, ex12; L5 ex14. `ich werde` (L1 ex02, ex06, ex07, ex12), `du wirst` (L1 ex03, ex11; L3 ex11), `er / sie / es wird` (L1 ex05, ex10; L2 ex03, ex09), `wir werden` (L1 ex04). The present is also accepted in L1 ex06 and L2 ex03. |
| 4 | PASS | `werden` = "become" appears in L2 ex01, ex02, ex04, ex05, ex08, ex10. L2 ex02 is the MC for "It's getting cold." with `Es wird kalt.` (correct), `Es ist kalt.` and `Es werdet kalt.`. |
| 5 | PASS | Attributive endings in L4 ex02 (acc. `eine kleine`, `eine neue`), ex03 (acc. `ein neues`), ex09 (acc. `einen netten`), ex11 (nom. `meine neue`), ex12 (nom. `meine neue`). |
| 6 | PASS | 14 exercises, one per unit: U1 ex01 (weather, `aber`), U2 ex02 (Perfekt with `haben`), U3 ex03 (Perfekt with `sein`, `die Erinnerung`), U4 ex04 (dative plural, `mitgebracht`), U5 ex05 (`seit` + dative), U6 ex06 (adjective endings), U7 ex07 (reflexive, `erkältet`), U8 ex08 (`konnte`, `weil`), U9 ex09 (Wohin? + accusative), U10 ex10 (`… Minuten Verspätung`), U11 ex11 (`dass`), U12 ex12 (`wenn`, imperative), U13 ex13 (match: comparison and media), U14 ex14 (`werden`, `stolz`, `Ich habe es geschafft!`). Mix: 3 MC, 7 WB (5 / 2), 1 match, 3 listen. Only `schaffen` and `die Erinnerung` are new. The tip starts "This lesson reviews all of A2." and the story ends on `Ich habe es geschafft!`. |
| 7 | PASS | `die Prüfung` is a generic exam (`Ich werde die Prüfung machen.`, `Ich hoffe, dass ich die Prüfung bestehe.`). No exam names, levels, pass guarantees or certificates. |
| 8 | PENDING (orchestrator) | Once this fragment is added after `de-a2-u13`, A2 has 14 units and 70 lessons, provided U11–U13 are merged. |

### Uncertainties / needs native review
1. **`der Job` is not used.** The outline has `Mein Ziel ist ein neuer Job.` and `einen neuen Job`, but `Job`
   is in no appendix (PD-052). I used `die Stelle` (U11) instead: `Mein Ziel ist eine neue Stelle.` (L3 ex02),
   `eine neue Stelle` (L4 ex02, ex12; L5 ex11). The masculine accusative ending is drilled with `einen
   netten Chef` (L4 ex09). CON-DE-A2-QA may add `der Job` if wanted.
2. `weiter` is always separated from `lernen` by `Deutsch` (`Ich werde weiter Deutsch lernen.`), because
   `weiter lernen` with nothing in between is normally written as one word, `weiterlernen`.
3. L2 ex12 accepts the object-first `Viele Wolken gibt es.` (PD-043 rule 3). It is grammatical but marked.
4. L3 ex06 accepts `Ich übe abends immer.` and `Abends übe ich immer.`; `Immer übe ich abends.` can be built from the tiles and is rejected as marked.
5. L5 ex04 accepts the dative-first `Meinen Kollegen habe ich eine Torte mitgebracht.`. Only the plural `Kollegen` is offered, not `Kolleginnen`.
6. L4 ex02 accepts the swapped coordination (`… eine neue Stelle und eine kleine Wohnung.`).
7. L2 ex06 translates `Sie kommt sicher.` as "She is surely coming." / "She's definitely coming."; "She's sure to come" is not offered.
8. L5 ex01 accepts `… aber es ist im Sommer warm.` (marked but grammatical).
9. **Unit 13 dependency:** L5 ex13 uses `das Handy`, `die Nachrichten`, `schneller`, `am besten` and `so groß wie` from CON-DE-A2-13; these appear in the finished U13 lessons.
