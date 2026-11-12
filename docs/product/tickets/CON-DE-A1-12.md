# CON-DE-A1-12: A1 Unit 12 "Offices and Work": 5 original lessons incl. A1 checkpoint (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-11 · **Milestone:** v0.3.3 ·
**Curriculum:** `curriculum-german.md` §4 Unit 12

## User story
As a newcomer, I want to give my date of birth, register my address, fill in a simple form
and say what job I do, so that my first official appointments and my first day at work go
smoothly.

## Unit outline
- **Theme:** months and dates, registering an address, simple forms, jobs; A1 checkpoint
- **Can-do:** I can say my date of birth, register my address and fill in a simple form,
  say what my job is and where I work, and use everything from A1 in a "first week in
  Germany" situation.
- **Grammar:** months; dates with ordinals (`am dritten Mai`); `wollen`; `als` + job without
  an article; review of V2, W-questions, separable verbs and formal `Sie` / `Ihr`.

## Acceptance criteria
1. Unit `de-a1-u12`, title "Offices and Work", description "Give dates, register your
   address, fill in a form, talk about your job, and finish A1 with a review of your first
   week.", in level A1 after `de-a1-u11`, with these lessons in order:
   1. `de-a1-u12-l1-months` "Months"
   2. `de-a1-u12-l2-dates` "Dates"
   3. `de-a1-u12-l3-registration-office` "The Registration Office"
   4. `de-a1-u12-l4-jobs` "Jobs"
   5. `de-a1-u12-l5-a1-checkpoint` "A1 Checkpoint: Your First Week"
2. All of **CDS-1 to CDS-13** pass. Dates are written in words (`am dritten Mai`), never
   `3.5.`.
3. At least 3 exercises use ordinals in dates, covering the irregular `ersten`, `dritten`
   and `siebten`, and 1 multiple choice has a regular-ending distractor (`dreiten`).
4. At least 2 exercises use `als` + job with no article (`Ich arbeite als
   Krankenpflegerin.`), and every job answer accepts both forms (CDS-11).
5. At least 2 exercises use `wollen` with the infinitive at the end.
6. Lesson 3 is set at a registration office with an official (Sie), and practises the form
   fields first name, surname, date of birth, address and signature. It contains **no legal
   claims** about registration rules or deadlines (PD-035).
7. **A1 checkpoint (lesson 5):** 12 exercises, one built around each A1 unit (1–12), told as
   one invented first-week story. Only the 2 new items below are introduced. The lesson tip
   says "This lesson reviews all of A1."
8. After this ticket, the A1 level in `course.json` contains exactly 12 units and 60
   lessons.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Months | der Monat (the month), der Januar (January), der Februar (February), der März (March), der April (April), der Mai (May), der Juni (June) | 7 |
| 2 | Dates | der Juli (July), der August (August), der September (September), der Oktober (October), der November (November), der Dezember (December), am ersten / zweiten / dritten … (on the first / second / third …), geboren: ich bin am … geboren (born) | 8 |
| 3 | The Registration Office | die Anmeldung (the registration), das Bürgeramt (the citizens' office), das Formular (the form), ausfüllen (to fill in), der Vorname (the first name), der Nachname (the surname), das Geburtsdatum (the date of birth), die Unterschrift (the signature) | 8 |
| 4 | Jobs | der Beruf (the job / profession), als (as), der Krankenpfleger / die Krankenpflegerin (the nurse), der Ingenieur / die Ingenieurin (the engineer), die Firma (the company), wollen: ich will, du willst (to want) | 6 |
| 5 | A1 Checkpoint: Your First Week | der Kollege / die Kollegin (the colleague), willkommen (welcome) | 2 |

Unit total: 31 items. `die Adresse` was taught in Unit 2.

## Out of scope
- Letters from authorities, residence permits, job centre vocabulary: B1
- Workplace small talk beyond the first day: A2
- A dedicated checkpoint node or badge (Phase 2, curriculum §6)

## UX notes
- Tip examples: "Dates use ordinals: am ersten Mai, am dritten Juni."; "No article before
  jobs: Ich bin Ingenieurin."
- The checkpoint story is warm and encouraging: the learner's first week ends with a
  colleague saying `Willkommen, Lina!` (invented name; only taught words).

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–8)_

## PM self-review
_2026-11-12, pm. Self-review only. Native-speaker review is still pending (PD-038), and the
schema test is run by the orchestrator._

**Files:** `content/courses/en-de/lessons/de-a1-u12-l1-months.json`, `…-l2-dates.json`,
`…-l3-registration-office.json`, `…-l4-jobs.json`, `…-l5-a1-checkpoint.json`. The unit
fragment (id, title, description, lessons) was handed to the orchestrator for `course.json`.
The pm did not edit `course.json`.

**Mix per lesson (CDS-2):**
| Lesson | Ex. | MC | WB (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| L1 Months | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L2 Dates | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L3 Registration Office | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L4 Jobs | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L5 A1 Checkpoint | 12 | 3 | 4 (2 / 2) | 1 | 4 |

**CDS checks:**
- CDS-1: PASS for lesson ids, titles and file names. The `course.json` insert and the
  version bump are the orchestrator's step.
- CDS-2: PASS (see the table).
- CDS-3: PASS, with these allowed extras.
  - Proper nouns: Bremen, Graz, Leipzig, Hamburg, Bonn, Frankfurt, Stuttgart, München,
    Köln; names Amara, Ravi Menon, Haddad, Lina Rao, Johanna; the invented street
    Lindenweg.
  - Forms of taught patterns: ordinals beyond the listed three (`zweiten`, `vierten`,
    `zwölften`) under "am ersten / zweiten / dritten …"; `achtundzwanzig`; `er will`.
  - `Tage`: the plural of `Tag`, which learners know from "guten Tag".
  - `ab` / `bis` + month: these words come from the taught phrases `ab sofort` / `bis dann`.
  - Recycled from Units 9–11: `nächste`, `Termin`, `Ärztin`, `Kopf … tut weh`,
    `wie komme ich zum …`, `hell`, `es gibt`, `frei`, `Wohnung`.
  - Every appendix item is used in its lesson. L5 introduces only `der Kollege / die
    Kollegin` and `willkommen`.
- CDS-4: PASS. Every word bank lists all word orders the tiles allow (fronted objects and
  adverbials, sentence-level V2 variants, both job forms). Listen answers are the exact
  transcript, as in Units 1–8.
- CDS-5: PASS. Each word bank and listen has 2–4 distractors beyond the canonical answer.
  The pm checked every tile set for unlisted valid translations. Register mismatches
  (`du` tiles under a "(formal)" prompt) aren't valid answers. No answer uses a tile twice,
  and duplicated words have duplicate tiles.
- CDS-6: PASS. Umlauts and ß are correct, with no capital ẞ. Nouns are capitalised and all
  match-pair nouns have articles. Tiles are in authored case. `sie` / `Sie` never share a
  tile set (L1 ex12, L3 ex05: `Sie` only; L4 ex11: `sie` only). `Ihr` / `ihr` never share
  one either (L3 ex08: `Ihr` / `Ihre` only).
- CDS-7: PASS. All 16 MCs have an English prompt and German options.
- CDS-8: PASS. All sentences, names and the Lina story are original. No brands.
- CDS-9: PASS. 16 listen exercises use `/audio/de/a1/u12/<exercise-id>.mp3`.
- CDS-10: PASS. Tips are 74 to 105 characters.
- CDS-11: PASS. Learner job answers accept both forms (L4 ex03, ex10). No legal, visa or
  deadline claims. L3 only practises form fields and polite requests.
- CDS-12: ids follow `de-a1-u12-lN-exNN` and are unique. The pm checked buildability by hand.
  `npm run test` is pending with the orchestrator.
- CDS-13: PASS. The longest prompt is 68 characters and the longest tile is
  `Krankenpflegerin` (16).

**Ticket criteria:**
- 2: PASS. Dates are always written in words, never as digits.
- 3: PASS. There are 11 ordinal-date exercises: 9 in L2 (ex02, ex03, ex04, ex07, ex08,
  ex09, ex10, ex11, ex12), plus L3 ex11 and L5 ex11. They cover `ersten`, `dritten` and `siebten`, and L2 ex02 has the
  `dreiten` distractor.
- 4: PASS. `als` + job without an article appears in L4 ex03, ex06, ex10 and ex12, and the
  to_learning answers accept both forms.
- 5: PASS. `wollen` with the infinitive at the end appears in L4 ex07, ex08, ex10 and ex12.
- 6: PASS. L3 is set with an official (Sie) and covers first name (ex01, ex07), surname
  (ex06, ex07), date of birth (ex02, ex11), address (ex08, ex09) and signature (ex01, ex12).
- 7: PASS. L5 has 12 exercises. The units map as U1 ex12, U2 ex01, U3 ex02, U4 ex03, U5 ex04,
  U6 ex09, U7 ex06, U8 ex10, U9 ex07, U10 ex05, U11 ex08 and U12 ex11. The tip starts "This
  lesson reviews all of A1." The story ends with "Willkommen, Lina!"
- 8: this is checked by the orchestrator once Units 9–12 are merged into `course.json`.

**Needs native review (for CON-DE-A1-QA):**
- L3 ex04 `die Anmeldung machen`: natural and spoken, but less formal than `sich anmelden`,
  which hasn't been taught.
- L1 `ab` / `bis` + month without an article; L1 ex09 `Der nächste Monat ist Juni` (some
  speakers prefer `der Juni`).
- Accepted marginal orders: L1 ex04 `Ich wohne in Bremen ab April.`, L2 ex09 `Ich fahre
  nach Hamburg am vierten November.` and L5 ex06 `Ich stehe um sechs am Mittwoch auf.`
  These follow the precedent for accepting such orders in Units 7–8.
- Follow-up idea: `im Mai` is not taught in A1 because it isn't in the appendix. Teach it
  early in A2, or add it to the U12 L1 appendix in CON-DE-A1-QA.
