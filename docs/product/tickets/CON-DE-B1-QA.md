# CON-DE-B1-QA: German B1 content QA pass (all 80 lessons)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-B1-01 … CON-DE-B1-16, the per-wave
scripted checks (PD-062), CON-DE-NR (for criterion 13) · **Milestone:** v1.1.0 · **Wave:** 5 ·
**Decisions:** PD-035, PD-043, PD-052, PD-053, PD-056 … PD-063

## User story
As a German learner, I want all of B1 to be correct, consistent and fair to answer, so that
I trust the course, finish the level and move on to B2.

## What this QA does differently from CON-DE-A2-QA
The A2 QA found its problems late: 20 of 28 changes aligned word orders that four writers had
handled differently, 4 grammar rows had 0–1 later uses, 3 words were used without an
appendix entry, and the mechanical lexical scan and permutation check were left as
follow-ups. For B1 these are planned in: PD-053 and CDS-24 apply from the first lesson, every
unit has recycling duties (CDS-25), gap words are in the appendices (§4c), and the scripts run
after **every** wave (criterion 12). This pass confirms and closes; it shouldn't need to
rewrite.

## Acceptance criteria
1. **Vocabulary progression:** the scripted lexical scan (every token of every exercise,
   option and tile in the 80 lessons against A1, A2, the B1 appendices and the CDS-3 /
   CDS-16 / CDS-22 extras) reports 0 open violations. Every word a writer requested in a
   self-review is either in an appendix (count updated) or removed. Results are listed per
   exercise id.
2. **Totals:** a table lists the new items per lesson and unit and the B1 total (target ~510,
   planned 508, PD-057); every lesson is within its CDS-3 range (L1–L4: 5–8, L5: 2–6,
   checkpoint 2).
3. **Grammar coverage:** every row of the B1 coverage map (`curriculum-german.md` §4c) has at
   least 5 exercises in its introducing unit and at least 3 in later units, and every
   recycling duty in the 16 tickets is met (CDS-25). Gaps are fixed in the unit files.
4. **Gap words:** each of the 48 gap words (§4c) first appears in or after the lesson whose
   appendix lists it, and at least twice in that unit.
5. **Ordering rules:** a search over all B1 files confirms none of these before its lesson:
   Konjunktiv II beyond the U1 chunks before U10 L2; regular Präteritum before U2 L1 and
   unlisted irregular Präteritum anywhere; relative clauses before U3 L2 (dative before U6
   L2, with prepositions before U6 L4); `wo- / da-` compounds before U4 L3; zu-infinitive
   before U5 L2; dative adjective endings before U6 L3; non-nominative singular n-nouns before
   U7 L2; `obwohl` before U8 L2; `damit` before U8 L4; passive before U9 L2; `lassen` before U9
   L4; genitive and `wegen / trotz / während` before U11 L2–L3; `wurde`, passive Präteritum
   before U12 L2; Plusquamperfekt, `nachdem`, `bevor` before U12 L3; endings without article
   before U13 L2; attributive comparison before U13 L4; `sondern` and two-part connectors
   before U14 L2; `während / seitdem / bis` as conjunctions before U15 L3–L4; `ohne / statt …
   zu` before U16 L2; `wohl` before U16 L4. No double infinitive and no `ließ` anywhere
   (CDS-24.4).
6. **Answer fairness:** every word bank and listen follows CDS-4, CDS-5, PD-043, PD-053,
   CDS-23 and CDS-24. The scripted permutation check (all tile orders of every
   `to_learning` bank, compared with the accepted list) has been reviewed for **all** banks,
   not a sample; every exercise has at most 20 accepted answers. 0 open issues.
7. **German conventions:** 0 issues with umlauts, `ß`, capitalised nouns, articles,
   case-only tile pairs (`sie / Sie`, `ihnen / Ihnen`, `ihr / Ihr`, CDS-17), digits in tiles,
   tiles over 24 characters, prompts over 110, MC options over 90 and tips over 240 (or the
   fallback limits, B1-T5).
8. **Consistency:** MC prompts follow CDS-7 / PD-044; every recycled item keeps its gloss and
   every new meaning is marked (CDS-27); no exercise appears twice across A1, A2 and B1 (same
   type, prompt and answer).
9. **Grammar drill and tips:** every pattern lesson meets CDS-14 (at least 4 exercises, 1 MC
   with typical-error distractors); every tip meets CDS-21.
10. **Safety and claims:** a search over all files (German and English) finds no real news,
    people, places' events or institutions beyond the generic nouns; no migration, residence,
    citizenship, benefit, tax, tenancy, consumer or employment rules; no deadlines, fees or
    fines stated as rules; no diagnoses, doses or insurance coverage; no politics, religion,
    religious holidays, alcohol, gambling or brands (CDS-8, CDS-11, CDS-26, PD-035, PD-051,
    PD-061).
11. **Playthrough:** at least 1 lesson per unit (16 lessons) plus the B1 checkpoint are
    played on the combined preview at 375 × 667 with the German speech fallback; every tip
    card shows and fits; every correct answer is accepted. Each issue becomes a `fix/`
    ticket for its owner.
12. **Per-wave records:** this ticket lists the results of the four per-wave script runs
    (PD-062): lexical scan, permutation and buildability, lengths, case-only pairs, digits,
    ordering regexes, duplicates; each with 0 open findings or the fix that closed it, and
    the appendix amendments the pm made between waves.
13. **Native-review delta (PD-063):** after CON-DE-NR, every A1 / A2 item the review renamed,
    removed or re-glossed is listed, searched for in all B1 files and fixed there; the B1
    appendices' "already taught" notes are updated. Done before any B1 PR merges.
14. **Native review of B1 (PD-063):** findings of the B1 native review (CON-DE-B1-NR) are
    fixed or listed with a reason. It is **blocking for the v1.1.0 release**. Until it
    happens, this ticket keeps a consolidated "needs native review" list from the 16
    self-reviews.
15. **Structure:** level B1 in `course.json` has exactly 16 units and 80 lessons in plan
    order after `de-a2-u14`; A1 and A2 are unchanged. Exercise ids stay unchanged by the QA
    fixes (CDS-12); the course `version` is bumped once for the QA changes; `npm run test` is
    green.

## Out of scope
- Cloze, typed and reading-passage exercises (follow-ups CON-DE-B1-CLZ / -TYP / -RDG)
- Speak exercises and final audio
- B2 content (v1.2.0)

## UX notes
No new screens. Findings are recorded in this file as tables: exercise id, issue, fix, status
(as in CON-DE-A2-QA).

## Technical notes
_(cto)_ The per-wave scripts are the ones the orchestrator already ran for A2 (case-only pairs,
digits, lengths, ordering regexes, duplicates, buildability), plus the two the A2 QA left
open: the token-level lexical scan against appendix lists and the full permutation check.

## Review
_(pm records the QA tables here)_

## QA report

_2026-11-21 · pm. Written without running commands. The orchestrator's scripts already
reported 0 findings for schema validity, buildability of every accepted answer, case-only tile
pairs and exact duplicates across A1–B1; those are not repeated here. Everything else below is
from reading the 16 self-reviews, targeted searches over all 80 B1 files and reading the
affected exercises. Decisions: PD-073 (vocabulary), PD-074 (answer fairness)._

### Summary
- **14 exercises changed in 13 lesson files** (table below, rows #1–#9 and #11–#15), plus 1
  tip (#10). Exercise ids unchanged,
  no lesson added or removed. Changed listens: none, so no audio needs regenerating.
- **8 appendix entries added** (U3 L4, U8 L3, U12 L3, U13 L4, U14 L3, U15 L1, L2, L3) and 4
  notes added to existing entries without a count change (U4 L3, U4 L4, U5 L5). B1 total
  **516** (planned 508, target ~510).
- **2 new PDs:** PD-073 settles every vocabulary request; PD-074 decides the 6 open
  answer-fairness questions.
- `course.json` `version` 28 → 29 (once, for all QA changes).

### Changed exercises
| # | Exercise id | Change | Reason | Status |
|---|---|---|---|---|
| 1 | de-b1-u03-l1-ex04 | Added `Sie ist mit den Kindern geduldig.` and `Geduldig ist sie mit den Kindern.` | Middle-field order was missing (PD-053.2); fronted predicative (PD-074.2) | Fixed |
| 2 | de-b1-u03-l1-ex11 | Added the 4 fronted coordinated predicatives (`Lustig und hilfsbereit sind meine Freunde.` × order × Freunde / Freundinnen); 8 answers | PD-074.2 | Fixed |
| 3 | de-b1-u03-l5-ex03 | Distractor tile `wen` → `wo` | `wen` is taught in U4 L3 (PD-073.4) | Fixed |
| 4 | de-b1-u05-l1-ex10 | Added `Anfänger sind die Teilnehmer, die am Dienstag kommen.` | PD-074.2 (bare predicative noun) | Fixed |
| 5 | de-b1-u06-l2-ex03 | Added `Sehr nett ist die Nachbarin, der ich helfe.` / `… der Nachbar, dem …` | Unit 6 fronted-adjective rejection, PD-074.2 | Fixed |
| 6 | de-b1-u07-l1-ex03 | Added `Schwindlig ist mir seit gestern.` | PD-074.2 | Fixed |
| 7 | de-b1-u07-l2-ex12 | Added `Sehr nett ist die Ärztin, zu der ich gehe.` / `… der Arzt, zu dem …` | PD-074.2 | Fixed |
| 8 | de-b1-u08-l2-ex07 | Tiles `kam`, `kamen` → `ist`, `gekommen`; answers now `Obwohl ich lange gewartet habe, ist das Paket nicht gekommen.` + main-clause-first | Mixed tenses, PD-074.5 | Fixed |
| 9 | de-b1-u08-l5-ex06 | Tiles `kam`, `kamen` → `ist`, `gekommen`; answers `Obwohl ich gekündigt habe, ist noch eine Rechnung gekommen.` + `Noch eine Rechnung ist gekommen, obwohl …` | PD-074.5 | Fixed |
| 10 | de-b1-u08-l5 tip | Example changed to the all-Perfekt sentence (about 232 characters) | PD-074.5 | Fixed |
| 11 | de-b1-u10-l4-ex03 | Added `Ich würde den Kurs an deiner Stelle machen.` | Aligns with L5 ex07, PD-074.6 | Fixed |
| 12 | de-b1-u12-l3-ex03 | "(telling a friend)" removed; tiles `haben`, `gekauft` → `kauften`, `kaufen`; answers in the Präteritum in both clauses (3 orders) | Mixed tenses (`haben … gekauft, bevor … begann`), PD-074.5; matches the L3 tip | Fixed |
| 13 | de-b1-u13-l4-ex03 | Added `Der günstigere Preis ist das.` | Identity-sentence swap, as U11 L2 ex03 / ex05 accept (PD-074.2) | Fixed |
| 14 | de-b1-u16-l1-ex11 | Removed `Jemanden, der Deutsch spricht, sucht meine Firma.` | Object + relative clause fronted; U3 L2 ex03 rejects the same (PD-074.3) | Fixed |
| 15 | de-b1-u16-l2-ex12 | Added `Mir erklärt sie das Programm, damit ich es ausprobieren kann.` | Fronted dative pronoun accepted in U3 L5 ex06, U11 L4 ex12 and A2 (PD-074.3) | Fixed |

Every new answer was checked by hand against its tile multiset; rewritten tile sets keep 2–4
distractors (#8: `bin`, `der`; #9: `weil`, `bin`, `einen`; #12: `nachdem`, `sind`, `beginnen`,
`kaufen`). In #9 the buildable `Eine Rechnung ist noch gekommen, …` ("still came") is rejected
as a different meaning and goes on the native-review list. No answer list exceeds 8 entries.

### Criterion 1: vocabulary progression (PASS for every flagged word; full token scan open)
| Word | First B1 use | Outcome |
|---|---|---|
| `zusammen` "together" | U3 L4 ex02, ex08 | **Added** U3 L4 (7 → 8), new meaning |
| `noch` "still", `noch nicht` | U8 L3 ex05; U11 L4 ex03, ex09, ex10 | **Added** U8 L3 (7 → 8), new meaning. U4 L4 `noch einmal` and U8 L5 `noch eine` are A1 meanings |
| `gewesen` | U12 L3 ex05 (only use) | **Added** U12 L3 (6 → 7) |
| `da` | U15 L1 ex04, ex05, tips L1 / L5 | **Added** U15 L1 (7 → 8). U11 L1 avoided it |
| `fehlen` "miss" | U15 L2 ex02, ex07, tip | **Added** U15 L2 (6 → 7), new meaning |
| `beste / besten` | U13 L4 ex02, ex04, ex09; L5 ex09 | **Added** U13 L4 (6 → 7) |
| `Rad fahren` | U15 L3 ex08 (answer 3), L4 ex03, tip | **Added** U15 L3 (5 → 6) |
| `nach` + time | U14 L3 ex06 (only use; search `nach` + article / number over A1–B1) | **Added** U14 L3 (7 → 8), new meaning |
| `ab` + day | U6 L1 (`ab sofort`), U9 L3 ex04 | No entry: A1 U12 precedent |
| `uns` as a dative | U3 L5 ex06, U9 L1 ex07 | No entry: A2 U4 lists dative `uns` |
| `darum` | U4 L4 ex06, ex08, tip; U4 L5; U6 L5 | Noted in the U4 L3 pattern line |
| `wen` | U3 L5 ex03 (distractor), U4 L3 ex02, ex03, ex11; U11 L3; U14 L5 | U3 L5 tile replaced; noted in the U4 L3 pattern line |
| `einfach` "simple" | U4 L4 ex05, tip | Marked in the U4 L4 `ganz` entry |
| `große Fortschritte` | U5 L5 ex04, tip | Chunk added to the U5 L5 entry |
| `letztes Jahr` | U14 L1 ex09, L5 ex06 | No entry (A2 chunk adjective + A1 noun) |
| `alles` / `etwas` | U1 L1, U2 L3, U4 L1, U14 L4, L5 | No entry (A1 taught phrases) |
| `gegangen`-type participles | `gegangen` U16 L2; `gekommen` U11 L3, U16 L5, now U8 L2, L5; `angekommen` U11, U12; `umgezogen` U7 L5 | All in A2 U3 / U14 except `gewesen` (added) |
| `der Abend`, `täglich`, `die Mitglieder`, `bis`, `eine Frage zu`, `liegen`, `am ersten Tag`, `bessere`, `Lass mich`, `waschen`, `die Torte` | per self-reviews | No entry (PD-073.3) |
| `geholfen`, `nachgedacht`, `das Fest`, `der Markt`, `zurückbringen`, `auf Deutsch` | — | Avoided by the writers; search: 0 uses |

**Cross-unit assumptions checked:** U5 ← U4 `sich interessieren für`, `darauf`; U6 ← U4 `darum`
(now documented in U4 L3); U8 ← U7 `der Kunde` n-forms (U7 L2); U9 ← U8 `damit` (U8 L4); U11
← U8 `die Rechnung` (U8 L1); U13 ← U9 `lassen` "let" (U9 L4 gloss); U14 ← U12 Plusquamperfekt
(U12 L3); U16 ← U15 `seitdem`, `während` (U15 L3–L4). Each is in the earlier appendix and is
first used in or after that lesson.
**Not done:** the mechanical token-by-token lexical scan of all 80 files (needs the
orchestrator's script). Criterion 1 is PASS for every flagged word; the scan result must be
added here before the ticket closes.

### Criterion 2: totals (PASS)
| Unit | L1 | L2 | L3 | L4 | L5 | Total |
|---|---|---|---|---|---|---|
| U1 Could You Help Me? | 7 | 8 | 7 | 7 | 6 | 35 |
| U2 Life Stories | 7 | 8 | 8 | 8 | 6 | 37 |
| U3 People Around Me | 8 | 7 | 6 | **8** | 5 | **34** |
| U4 Everyday Work | 7 | 8 | 8 | 8 | 4 | 35 |
| U5 Learning for Life | 7 | 7 | 7 | 6 | 4 | 31 |
| U6 Renting a Flat | 8 | 6 | 6 | 7 | 4 | 31 |
| U7 Doctors and Hospitals | 7 | 8 | 7 | 7 | 4 | 33 |
| U8 Orders and Complaints | 7 | 6 | **8** | 6 | 5 | **32** |
| U9 Environment and the City | 7 | 7 | 7 | 7 | 4 | 32 |
| U10 If I Had More Time | 8 | 6 | 6 | 6 | 4 | 30 |
| U11 Letters from the Authorities | 8 | 6 | 6 | 7 | 4 | 31 |
| U12 News and Reports | 7 | 6 | **7** | 8 | 4 | **32** |
| U13 Food and Markets | 7 | 7 | 8 | **7** | 5 | **34** |
| U14 Living Together | 7 | 6 | **8** | 7 | 4 | **32** |
| U15 Discussing and Deciding | **8** | **7** | **6** | 6 | 4 | **31** |
| U16 Next Steps | 7 | 5 | 6 | 6 | 2 | 26 |
| **B1** | | | | | | **516** |

Bold = changed by this QA. Every lesson is in its CDS-3 range (L1–L4 5–8, L5 2–6, checkpoint
2). 516 is within ~1.5 % of the ~510 target (planned 508, PD-057). The unit tickets carry the
updated rows and totals.

### Criterion 3: grammar coverage (PASS on self-review evidence; spot-checked)
Every row of the §4c map meets ≥ 5 in its introducing unit and ≥ 3 later, per the recycling
tables in the 16 self-reviews (each lists exercise ids). Spot checks: `obwohl` later in U10 L1
ex07, L5 ex08–09, U14 L1 ex05, L5 ex08, U15 L4 ex12, L5 ex05; `damit` in U9 L1 ex10, L5 ex07,
U14 L1 ex10, L3 ex11, U16 L2 ex12, L4 ex08; Plusquamperfekt in U14 L3 ex09, L4 ex07, L5 ex10,
U16 L2 ex10, L3 ex10, L5 ex12; two-part connectors in U15 L2 ex12, L5 ex10, ex12, U16 L1 ex07,
L3 ex12, L5 ex14. The QA changes remove no recycling use (#8, #9 keep `obwohl`; #12 keeps
`bevor`; #14, #15 keep the relative clause and `damit`). CDS-14: each pattern lesson has ≥ 4
pattern exercises and a typical-error MC (self-review evidence; U2 L1, U3 L2, U8 L4, U14 L3,
U15 L1 MCs opened). CDS-21: tips read in U3 L5, U4 L3, L4, U7 L1, L3, U8 L2, L5, U12 L3, U14
L3, L5, U15 L1, L2, L4, U16 L2 each name the rule with a German example; #10 stays ≤ 240.

### Criterion 4: gap words (PASS, spot searches)
Searches over U1–U3 for the U1–U4 gap words (`man`, `also`, `meinen`, `jemand`, `niemand`,
`alle`, `jeder`, `beide`, `allein`, `ein paar`, `andere`, `der Mensch`, `die Leute`, `die
Person`, `die Arbeit`, `fertig`, `wieder`, `schlecht`, `falsch`, `eigentlich`, `ganz`,
`natürlich`, `früher`, `damals`, `leben`, `zuerst` … `dachte`) found no use before the listing
lesson; the only hit is `jedes Mal` in U2 L4, which is its own appendix chunk. "At least twice
in the unit" is from the self-reviews (each lists the ids).

### Criterion 5: ordering rules (PASS, searches)
0 hits before their lessons for: Konjunktiv II beyond the U1 chunks in U1–U9 (`würde`,
`hätten`, `wäre(n)`, `könnte`, `sollte` outside `könnten Sie`, `hätte gern`, `das wäre`);
`obwohl`, `damit` in U1–U7; `während`, `wegen`, `trotz` before U11 L3; `nachdem`, `bevor`,
`wurde(n)` before U12; `sondern` and the two-part connectors before U14 L2 (the U12 `statt`
hits are `stattfinden`); `ohne / statt … zu`, `wohl` before U16; `die Hand`, `die Rechnung`,
`der Preis`, `reisen`, `der Weg` before their lessons; `ließ` and double infinitives anywhere.
Not searched by me: passive present before U9 L2, relative clauses before U3 L2, endings
without article before U13 L2 (regex work for the orchestrator; the self-reviews report none).

### Criterion 6: answer fairness (PASS for the decided policies; permutation script open)
The six open questions are decided in PD-074 and applied (#1, #2, #4–#9, #11–#15):
1. **Swapped two-part connectors:** U14 / U15 / U16 were already consistent with PD-074.1
   (symmetric swaps accepted in U14 L2 ex10, L3 ex02, ex12, L4 ex12, U15 L5 ex12, U16 L1 ex07;
   `nicht nur` swaps rejected in U14 L2 ex03, U16 L3 ex12). No change.
2. **Fronted adjectives and objects:** #1, #2, #4–#7, #13 add, #14 removes, #15 adds.
3. **`dass`-less orders:** the only `dass` word bank with an opinion verb (U6 L5 ex06) already
   accepts both PD-053.4 orders; U15 `Meinung, dass` items are an MC, a `to_known` (that-less
   English accepted) and a listen. No change.
4. **Mixed Perfekt / Präteritum:** search for Perfekt + listed Präteritum in one answer found
   3 (#8, #9, #12); fixed. U16 L3 ex11 option b is a deliberate wrong MC option.
5. **U10 L4 ex03 vs L5 ex07:** #11.
6. **Unit 6 fronted-adjective rejections:** #5; the same pattern in U3 L1 and U7 L1 / L2 (#1,
   #6, #7).
At most 20 answers per exercise: the largest list after QA is 8 (U3 L1 ex11, U14 L3 ex02).
**Not done:** the full permutation check of every `to_learning` bank against its accepted
list (criterion 6 wording). It needs the orchestrator's script; any finding goes into this
table before the ticket closes.

### Criteria 7–10
- **7 Conventions:** scripts already clean for case pairs; the new tiles (`ist`, `gekommen`,
  `kauften`, `kaufen`, `wo`) are lower case, no digits, ≤ 24 characters; no new prompt exceeds
  110 characters. Length / digit script results: **to add** from the orchestrator.
- **8 Consistency:** new meanings now have entries (`zusammen`, `noch`, `nach`, `fehlen`) or a
  marked note (`einfach`); duplicates script: 0. #12's new prompt duplicates no existing one
  (search).
- **9 Drill and tips:** see criterion 3.
- **10 Safety:** searches (German and English) for alcohol words, religious holidays, brand
  names, `Gesetz`, `Frist`, `Gebühr`, `Strafe`, residence / visa / citizenship terms, doses
  and diagnoses: 0 hits in rules or claims. Borderline but kept (already justified in the
  self-reviews): U8 L3 `Das Gerät hat noch Garantie.` (one device), U11 L4 `bis spätestens
  Freitag` (one invented letter), U9 L2 `Für die Flaschen bekommt man Pfand.` (no amount),
  U12 L1 ex10 mayor visiting a school (mild, kept), U14 L3 `Nach zehn Uhr ist im Haus Ruhe.`
  (the building's own rule, PD-051).

### Criteria 11–15
- **11 Playthrough:** not done (needs the combined preview); orchestrator.
- **12 Per-wave records:** the per-wave script outputs are not in the repo; the orchestrator
  adds them. Appendix amendments between waves: none were made by the pm; all are in this QA
  (PD-073).
- **13 Native-review delta:** waits for CON-DE-NR (not yet done). Open.
- **14 B1 native review:** CON-DE-B1-NR not done; the consolidated list is below. Blocking for
  v1.1.0.
- **15 Structure:** no lesson added or removed, ids unchanged, A1 / A2 files untouched,
  `version` 28 → 29. `npm run test` to be run by the orchestrator.

### Needs native review (consolidated from the 16 self-reviews and this QA)
1. **Fronted predicatives (PD-053.1, PD-074.2):** U2 L3 ex08 `Glücklich war Mira am Ende.`; U3
   L1 ex04 `Geduldig ist sie mit den Kindern.`, ex11 `Lustig und hilfsbereit sind meine
   Freunde.` (QA); U3 L2 ex10 `Allein wohnt er, …`; U3 L5 ex09 `Allein war ich, als …`; U5 L1
   ex10 `Anfänger sind die Teilnehmer, …` (QA); U5 L3 ex07 `Schwer ist Deutsch.`; U6 L2 ex03,
   U7 L2 ex12 `Sehr nett ist die …, der / zu der …` (QA); U7 L1 ex03 `Schwindlig ist mir seit
   gestern.` (QA); U10 L5 ex11 `Toll war die Stimmung …`; U12 L5 ex09; U13 L1 ex03, L4 ex10,
   ex12, L5 ex10; U14 L4 ex03 `Fremd war am Anfang alles.`; U15 L2 ex06 (6 `Ruhig ist es
   einerseits …` answers), L4 ex09; U16 L3 ex12, L4 ex09, ex12.
2. **Identity-sentence swaps:** U4 L1 ex10; U11 L2 ex03, ex05; U13 L4 ex03 (QA).
3. **Fronted objects, pronouns, adverbs, infinitives:** U1 L2 ex06, L4 ex08, L5 ex05; U2 L1
   ex12, L2 ex04, L3 ex03, ex09; U3 L4 ex05, L5 ex06 `Uns half mein Bruder …`; U4 L1 ex04, L4
   ex04, ex12 `Schlecht druckt der Drucker, …`, fronted prepositional objects and da-words; U5
   L2 ex11, L4 ex03, ex09, L5 ex06; U6 L2 ex06; U7 L2 ex03, ex08, ex11, L3 ex05, ex12, L4 ex08,
   L5 ex04; U8 L1 ex10, L4 ex03, ex06, ex08, L5 ex04, ex08; U9 L1 ex03, ex08, ex10, L3 ex09,
   ex11, L4 ex10, L5 ex04, ex07, ex10 (fronted `von` agents); U10 L1–L5 fronted `gern / lieber`,
   PPs, objects, `Gehen würden wir, …`; U11 L1 ex07, ex12, L4 ex12, L5 ex12; U12 L1 ex07, L3
   ex05, L4 ex10; U13 L1 ex10, L2 ex03, ex10, L5 ex06, ex12; U14 L1 ex12, L2 ex03, ex12, L3
   ex06, ex12, L4 ex10, ex12, L5 ex03, ex05; U15 L1 ex03, L2 ex04, ex10, L3 ex05, L4 ex04,
   ex12, L5 ex12; U16 L2 ex04, ex06, ex10, ex12 `Mir erklärt sie …` (QA), L3 ex03, ex07, ex09,
   L5 ex05, ex12, ex15.
4. **Middle-field orders:** U1 L1 ex04, L5 ex09 (`bitte` positions), L3 ex10; U2 L1 ex04, ex08
   (`damals`, `früher` at the end), L2 ex11; U8 L5 ex12, U11 L4 ex05 (adverb before a definite
   object); U9 L4 ex03; U10 L4 ex03 (QA), L5 ex07; U11 L3 ex03; U12 L3 ex05; U13 L3 ex07; U14 L1
   ex12, L2 ex06; U16 L5 ex07.
5. **Rejections to confirm:** U1 L1 ex12 `das mir`; U2 L4 ex03 mid-placed `wenn` clause; U3 L4
   ex12 V2 demonstrative; U3 L2 ex03, U16 L1 ex11 (QA) fronted object + relative clause; U5 L5
   ex06 `Radio jeden Tag`; U6 L5 ex04 `Ich warte, dass …`; U7 L3 reflexive left out; U8 L5 ex06
   `Eine Rechnung ist noch gekommen` (QA); U11 L3 ex06; U12 L3 ex09 `Schon hatten wir …`, L5
   ex07; U13 L3 ex05 fronted participle; U14 L2 ex03, U16 L3 ex12 swapped `nicht nur`; U14 L4
   ex12; U15 L3 ex08 `Rad fahren die meisten`, L5 ex04, ex08.
6. **Word and usage choices:** U1 `mal` (L1 ex06), `Ich bringe das Buch am Montag.`, `Mein
   Internet …`; U2 L5 ex07 `Ich dachte, er ist Lehrer.`, L3 ex09 `begann einen Kurs`; U4 L5
   ex05 `Ich freue mich auf ihn.`; U5 L2 ex08 non-reflexive `entschieden`, L5 ex11; U6 L5 ex09
   letter closing; U7 L1 ex10 `mit starken Schmerzen`; U8 L4 ex08 English "finds"; U9 L1 ex06
   "The nature …"; U10 L3 ex11 `würde` in the `wenn` clause, L1 ex02 `Gehen wir …?`; U11 L3 ex08
   "is processed"; U13 L4 "lower price" for `günstigere`, L5 ex12 `Torte`; U14 `zwar` kept out
   of `to_learning` banks; U15 `fehlen` "miss", L4 ex08 "Now I speak …"; U16 L5 ex06 `liegt`.
7. **New German written in this QA:** U8 L2 ex07 `Obwohl ich lange gewartet habe, ist das
   Paket nicht gekommen.`; U8 L5 ex06 and tip `Obwohl ich gekündigt habe, ist noch eine
   Rechnung gekommen.`; U12 L3 ex03 `Bevor das Stadtfest begann, kauften wir Kuchen.`

### Still unchecked (for the orchestrator before the ticket closes)
1. Token-level lexical scan of all 80 B1 files against A1, A2, the B1 appendices (with the
   PD-073 additions) and the CDS-3 / 16 / 22 extras (criterion 1).
2. Full permutation check of every `to_learning` bank, including the 14 banks changed here
   (criterion 6).
3. Length, digit and ordering-regex scripts on the changed files; `npm run test` and the
   buildability check on #3, #8, #9, #12 (new tiles).
4. Per-wave script records (criterion 12), playthrough (11), CON-DE-NR delta (13), CON-DE-B1-NR
   (14).

**Ticket status:** criteria 1, 2, 4, 6 PASS for everything a writer flagged and every open
policy question (1 and 6 still need the two scripts); 3, 5, 7–10 PASS on searches and
self-review evidence; 15 PASS pending `npm run test`; 11–14 open (orchestrator / native
review).

### Orchestrator scripted checks (2026-11-21, after the QA fixes)
- Content and contract tests: 445 passed (schema and manifest for all A1, A2 and B1 lessons).
- Buildability: 3,181 accepted answers checked against their tiles; 0 can't be built.
- Case-only tile pairs (sie/Sie, ihr/Ihr, ihnen/Ihnen): 0. Exact duplicate exercises across A1–B1: 0.
- Limits: 0 B1 prompts over 110 characters, 0 tips over 240, 0 B1 tile sets over 14, 0 tiles
  over 24 characters or with digits.
- Decision numbers: renumbered to PD-073 / PD-074, because PD-064..PD-072 are already used on
  `main` and the docs branches.
- Still open: the token-by-token vocabulary scan and the full permutation check (criteria 1 and 6
  scripts), the playthrough (11) and the native reviews (13, 14). B1 merges after v1.0.0 (PD-063).
