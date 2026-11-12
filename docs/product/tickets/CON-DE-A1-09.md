# CON-DE-A1-09: A1 Unit 9 "By Bus and Train": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-08 · **Milestone:** v0.3.3 ·
**Curriculum:** `curriculum-german.md` §4 Unit 9

## User story
As a learner getting around a German city, I want to buy tickets, understand departures and
delays and ask for directions, so that I get where I need to go.

## Unit outline
- **Theme:** public transport, tickets, platforms, delays, directions
- **Can-do:** I can buy a ticket, ask when and where a train leaves, understand a simple
  delay notice, and ask for and follow simple directions.
- **Grammar:** `müssen` (+ separable verb: `Ich muss umsteigen`); imperative, Sie form;
  `mit dem / mit der` as chunks; `nach` + city; `wohin`.

## Acceptance criteria
1. Unit `de-a1-u09`, title "By Bus and Train", description "Buy a ticket, find your
   platform, deal with a delay and ask the way.", in level A1 after `de-a1-u08`, with these
   lessons in order:
   1. `de-a1-u09-l1-getting-around` "Getting Around"
   2. `de-a1-u09-l2-buying-a-ticket` "Buying a Ticket"
   3. `de-a1-u09-l3-departures` "Departures and Platforms"
   4. `de-a1-u09-l4-changing-trains` "I Have to Change"
   5. `de-a1-u09-l5-which-way` "Which Way?"
2. All of **CDS-1 to CDS-13** pass. Platform numbers and times are written in words.
3. `mit dem` / `mit der` appear only as fixed chunks with the transport nouns taught here
   (`mit dem Bus`, `mit der U-Bahn`); no other dative is needed.
4. At least 4 word-bank exercises use `müssen` with the infinitive at the end, and at least
   2 of them combine it with a separable verb (`Wir müssen in Köln umsteigen.`).
5. At least 4 exercises use the Sie imperative (`Gehen Sie geradeaus.`, `Nehmen Sie die
   U-Bahn.`), and 1 multiple choice contrasts the imperative with the statement (`Sie gehen
   geradeaus.`).
6. At least 3 listen exercises are short, original platform or delay announcements (one or
   two sentences each).
7. Hyphenated nouns (`U-Bahn`) are single tiles (CDS rule, CTO-008 criterion 17).

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Getting Around | der Bus (the bus), die Bahn (the train / railway), die U-Bahn (the underground / subway), die Straßenbahn (the tram), das Auto (the car), zu Fuß (on foot), mit dem / mit der … (by …, fixed chunk) | 7 |
| 2 | Buying a Ticket | die Fahrkarte (the ticket), einfach (one-way / single), hin und zurück (return / round trip), der Automat (the ticket machine), nach (to, with cities: nach Hamburg), nehmen: du nimmst (to take) | 6 |
| 3 | Departures and Platforms | der Zug (the train), das Gleis (the platform / track), abfahren (to depart), ankommen (to arrive), die Verspätung (the delay), pünktlich (on time) | 6 |
| 4 | I Have to Change | müssen: ich muss, du musst (must / to have to), umsteigen (to change trains / buses), die Haltestelle (the stop), der Bahnhof (the station), nächste (next), wohin? (where to?) | 6 |
| 5 | Which Way? | geradeaus (straight ahead), links (left), rechts (right), weit (far), nah (near), wie komme ich zum / zur …? (how do I get to …?) | 6 |

Unit total: 31 items.

## Out of scope
- Full dative and `zu` + dative (A2)
- Real transport company names, real timetables or real line numbers

## UX notes
- Tip examples: "With müssen, the second verb goes to the end: Ich muss umsteigen.";
  "Instructions: verb first, then Sie: Gehen Sie links!"
- Announcement audio uses a calm, clear voice (PD-034), no station jingles.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–7)_

## PM self-review
_Date: 2026-11-12 · Reviewer: pm · Native review still pending (PD-038)._

**Files:** `content/courses/en-de/lessons/de-a1-u09-l1-getting-around.json`,
`…-l2-buying-a-ticket.json`, `…-l3-departures.json`, `…-l4-changing-trains.json`,
`…-l5-which-way.json`. The unit fragment for `course.json` was handed to the orchestrator; the
pm doesn't edit `course.json` in this worktree.

| Lesson | Exercises | MC | Word bank (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| L1 Getting Around | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L2 Buying a Ticket | 12 | 4 | 4 (3 / 1) | 1 | 3 |
| L3 Departures and Platforms | 12 | 4 | 4 (3 / 1) | 1 | 3 |
| L4 I Have to Change | 12 | 3 | 5 (4 / 1) | 1 | 3 |
| L5 Which Way? | 12 | 3 | 5 (4 / 1) | 1 | 3 |

**CDS checks**
1. CDS-1 Files: PASS for the lesson files (ids and titles exactly as criterion 1). The
   `course.json` entry and version bump are done by the orchestrator.
2. CDS-2 Mix: PASS (table above).
3. CDS-3 Vocabulary: PASS, with notes. Each lesson brings in only its appendix items
   (7 / 6 / 6 / 6 / 6). Extras: invented names (Mira, Jonas); city names (Hamburg, Köln,
   Bremen, München, Leipzig, Dresden, Kiel, Bonn, Hannover, Nürnberg); verb forms whose pattern is taught (`er nimmt` pattern from
   `du nimmst`, `wir / Sie müssen`, `du steigst um`, `fährt … ab`, `kommt … an`); `zum` /
   `zur` only inside the L5 chunk `wie komme ich zum / zur …?` with taught nouns (Bahnhof,
   Haltestelle). Platforms are given without a preposition (`Ist das Gleis fünf?`) because
   `auf` / `von Gleis …` aren't taught; no `Minuten` in delay notices for the same reason.
4. CDS-4 Alternatives: PASS. Topicalised orders listed (`Mit dem Bus fahre ich.`, `Heute
   fahren wir mit der U-Bahn.`, `In Hannover müssen wir umsteigen.`, `Umsteigen müssen wir in
   Hannover.`, `Hier müssen Sie umsteigen.`, `Einkaufen muss ich heute.`). English variants:
   underground / subway, are going / go, costs / is, far / far away, where are you going (to)
   / where do you go (to). L5 ex11 also accepts `Gehen Sie links, dann geradeaus.`. Listen
   answers are the exact transcript.
5. CDS-5 Distractors: PASS. Every word bank and listen has 2–4 tiles that appear in no
   accepted answer, and no answer needs the same tile twice. Deliberately rejected
   combinations: the statement `Sie gehen …` for imperative prompts (marked with "!"), `Steigst
   du um?` for "Do you have to change?", `Du musst …` where the prompt is "(formal)", other
   cities / times / numbers (wrong meaning). `Bahn` and `U-Bahn` never share a tile set.
6. CDS-6 Conventions: PASS. Umlauts and ß correct (`Straßenbahn`, `Fuß`, `fährt`,
   `Verspätung`, `pünktlich`, `nächste`, `zurück`, `müssen`, `Köln`, `München`, `Nürnberg`),
   nouns capitalised with articles in match pairs and gender MCs, tiles in authored case,
   `U-Bahn` one tile. Only `Sie` (L4 ex07, L5) appears; no lower-case `sie` tile in the unit.
   "(formal)" / "(to a friend)" marked where the register matters.
7. CDS-7: PASS. English prompts, German options, standard wording.
8. CDS-8: PASS. Original sentences; no transport company names, line numbers or timetables.
9. CDS-9: PASS. Every audio path is `/audio/de/a1/u09/<exercise-id>.mp3`.
10. CDS-10: PASS. Tips are 73–92 characters.
11. CDS-11: PASS.
12. CDS-12: hand-checked (strict keys, 3–4 options, 5 pairs, ≤16 tiles, every answer
    buildable after normalisation, ids `de-a1-u09-lN-exNN`). `npm run test` is to be run by
    the orchestrator.
13. CDS-13: PASS. Longest prompt 61 characters (L2 ex07); longest tile 14 (`Entschuldigung`).

**Unit criteria**
- 2: PASS. Platform numbers and times are words (`Gleis fünf`, `um acht Uhr`, `um halb zehn`).
- 3: PASS. `mit dem / mit der` only in L1 with Bus, Auto, Bahn, U-Bahn, Straßenbahn.
- 4: PASS. `müssen` + infinitive at the end in word banks: L4 ex03, ex06, ex10; L5 ex09. All
  four use a separable verb (`umsteigen` ×3, `einkaufen`). MC: L4 ex02.
- 5: PASS. Sie imperative: L5 ex02, ex04, ex05, ex08, ex11. Contrast MC with `Sie gehen
  geradeaus.`: L5 ex02.
- 6: PASS. Announcement listens: L3 ex03, ex06, ex10; L4 ex04, ex07, ex11.
- 7: PASS. `U-Bahn` is a single tile (L1 ex08) and appears whole in L1 ex01 / ex06.

**Needs native review (to CON-DE-A1-QA)**
- `Entschuldigung, ist das Gleis fünf?` (natural enough without `hier`?).
- `Gehen Sie hier rechts.` / `Gehen Sie geradeaus und dann links.` vs `nach rechts / links`.
- Announcement wording without `auf / von Gleis` and without minutes (`Der Zug nach Leipzig
  hat leider Verspätung.`, `Sie müssen in Nürnberg umsteigen.`).
- Marked orders accepted as grammatical: `Umsteigen müssen wir in Hannover.`, `Einkaufen
  muss ich heute.`, `Mit der U-Bahn fahren wir heute.`, `Nach München brauche ich eine
  Fahrkarte, hin und zurück.`.
- Rejecting the statement `Sie gehen links und dann geradeaus.` for an imperative prompt,
  although it is also used to give directions in speech.
