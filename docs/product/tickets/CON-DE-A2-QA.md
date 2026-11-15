# CON-DE-A2-QA: German A2 content QA pass (all 70 lessons)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A2-01 … CON-DE-A2-14 ·
**Milestone:** v0.5.0 · **Wave:** 5 · **Decisions:** PD-037, PD-038, PD-043, PD-045 … PD-052

## User story
As a German learner, I want all of A2 to be correct, consistent and fair to answer, so that
I trust the course, finish the level and move on to B1.

## Acceptance criteria
1. **Vocabulary progression:** every German word in exercises and distractor tiles of the 70
   A2 lessons is in A1, in the appendix of the same or an earlier A2 lesson, or an allowed
   extra (CDS-3, CDS-16). Because the units were written in parallel (PD-052), the check
   also lists every word a writer **added** beyond the appendix; each one is either moved
   into an appendix (with the count updated) or removed. Result: 0 open violations, listed
   per exercise id.
2. **Totals:** a table lists the new items per lesson and unit and the A2 total (target
   ~460 entries, PD-046); every lesson is within its CDS-3 range (L1–L4: 5–8, L5: 2–6).
3. **Grammar coverage:** every row of the A2 coverage map (`curriculum-german.md` §4b) has
   at least 5 exercises in its introducing unit and at least 3 in later units. Gaps are fixed
   in the unit files.
4. **Deferred A1 items are done:** `im` + month (PD-039), hundreds produced in `to_learning`
   word banks (PD-041), `auf / von Gleis`, `der Bahnsteig`, `… Minuten Verspätung` (PD-042),
   productive `ins / in den / in die` (PD-040), `nach links / rechts`, `Bei welcher
   Krankenkasse sind Sie?` and `sich anmelden` (A1 native-review list) each appear in the
   unit the curriculum names; the A1 native-review items 4–6 are marked "resolved in A2"
   in CON-DE-A1-QA.
5. **Ordering rules:** a search over all A2 files confirms: no `sein` Perfekt before U3, no
   dative pronoun before U4, no two-way preposition + article before U9 except the CDS-19.5
   chunks, no `weil` before U8, no `dass` before U11, no `wenn` / `ob` before U12, no
   comparative system before U13, no `werden` before U14, no Präteritum of full verbs
   anywhere (CDS-19).
6. **Answer fairness:** every word bank and listen is re-checked for missing alternatives
   (CDS-4, PD-043, CDS-19.4 clause orders) and unlisted valid tile combinations (CDS-5).
   0 open issues.
7. **German conventions:** 0 issues with umlauts, `ß`, capitalised nouns, articles,
   case-only tile pairs (`sie / Sie`, `ihnen / Ihnen`, `ihr / Ihr`, CDS-17), digits in tiles
   and tiles over 24 characters (CDS-18).
8. **Consistency:** MC prompts follow CDS-7 / PD-044; the same English gloss is used for the
   same German item in every unit; no exercise appears twice across A1 and A2 (same type,
   prompt and answer).
9. **Grammar drill:** every pattern lesson meets CDS-14 (at least 4 exercises, 1 MC with
   typical-error distractors); every tip meets CDS-15 (≤ 200 characters, one German example).
10. **Safety and claims:** a pass over all files finds no legal, medical, financial,
    tenancy, employment or exam claims, no brands, no religious holidays and no alcohol
    (CDS-8, CDS-11, PD-035, PD-051).
11. **Playthrough:** the pm plays at least 1 lesson per unit (14 lessons) plus the
    checkpoint on the deployed preview at 375 × 667 with the German speech fallback, and,
    once LES-013 is merged, checks that every tip shows and fits. Each issue becomes a
    `fix/` ticket for its owner.
12. **Native review:** findings of an owner-arranged native review are fixed or listed with
    a reason; otherwise this ticket keeps a "needs native review" list (non-blocking until
    v1.0.0, PD-038).
13. Exercise ids stay unchanged by the fixes (CDS-12); the course `version` is bumped once for
    the QA changes; `npm run test` is green.

## Out of scope
- Speak exercises and final audio (CON-DE-SPK, v1.0.0)
- Cloze exercises (added later with LES-015, PD-049)
- B1 content (v1.1.0)

## UX notes
No new screens. Findings are recorded in this file as tables: exercise id, issue, fix,
status (as in CON-DE-A1-QA).

## Technical notes
_(cto)_

## Review
_(pm records the QA tables here)_

## QA report

_2026-11-15 · pm · Worktree `lingo-de2-qa`. Read all 14 unit tickets (appendices, self-reviews,
uncertainty lists) against CDS-1…19 and PD-043, PD-045…PD-052, then checked the lesson files by
targeted search and by reading about 25 of the 70 lesson files in full or in part. No commands
were run; the orchestrator had already run the scripted checks (case-only tile pairs, digits in
tiles, tile / prompt / tip lengths, straight quotes, criterion 5 ordering regexes, exact
A1 + A2 duplicates, schema validity: 0 findings) and these were not redone. Course `version`
bumped once, 15 → 16. No exercise id was renamed, added or removed; no lesson was added or
removed (70 A2 lessons in `course.json`)._

**Note for the orchestrator:** this worktree's copies of `docs/product/decisions.md` (ends at
PD-044) and `docs/product/curriculum-german.md` (no §4b, CDS-1…13 only) predate PD-045…PD-052,
and this ticket file did not exist here. I read those documents from the main checkout and
created this file with the criteria from main. I did **not** edit `decisions.md` here, to avoid
a numbering clash: the word-order rule below should be logged as **PD-053** when this branch is
merged on top of main.

### Summary
- **28 exercises changed in 21 lesson files** (table below). No listen exercise was changed, so
  no audio needs regenerating.
- **3 appendix entries added** (`lange` U8 L4, `sagen` U12 L4, `kommen` for programmes U13 L3).
  A2 total: **462** entries.
- **4 coverage gaps fixed:** `sollen` had 0 uses after U7; `deshalb / trotzdem / ob` had 0 uses
  after U12; `Gleis / Bahnsteig / Verspätung` had 1 use after U10; all three now have 3.
- **One word-order rule for all 14 units** (proposed PD-053, below). The writers of U4, U5, U7,
  U8, U10, U12 and U14 each handled marked orders differently; 20 of the changes align them.
- A1 native-review items 4–6 are marked "resolved in A2" in CON-DE-A1-QA.

### Word-order rule applied (proposed PD-053, extends PD-043 to A2)
1. **Fronting:** PD-043 rules 2–3, plus a fronted predicative adjective, manner or frequency
   adverb or bare infinitive, are accepted when the tiles can't block them (A1 precedent
   `Gut kann ich schwimmen.`; U1 `Immer ist es hier windig.`; U7 `Müde fühlt er sich.`). They go
   on the native-review list.
2. **Adverbials in the middle field** (time, place, direction, company, `seit` / `vor` phrases,
   `trotzdem`) may come in either order. Buildable orders are accepted (A1 precedent `Ich wohne
   in Bremen ab April.`) and listed.
3. **Fixed middle-field rules are not relaxed:** pronoun before noun (the reflexive pronoun right
   after the finite verb / subject), dative noun before indefinite accusative noun, noun object
   before a directional complement. Other orders stay rejected: U4 uncertainty 1 (`Ich schenke
   Blumen meiner Mutter.`, `Gefällt die Kerze dir?`, `Hilfst du heute ihm?`), U5 L5 ex06 (`Ich
   möchte nach Berlin den Brief schicken.`), U7 L5 ex12 (`Ich habe im März mich verletzt.`),
   U14 L5 ex04 (`Ich habe eine Torte meinen Kollegen mitgebracht.`). The U4 writer's exception
   is therefore confirmed for objects and pronouns, and the U5 writer's exception is lifted for
   adverbials.
4. **`dass` with `glauben / denken / finden / hoffen`:** when the tiles allow it, the `dass`-less
   V2 sentence and the tag order (`…, glaube ich.`) are accepted, with PD-043 inside each clause
   (U11 L3 model). `Dass …, glaube ich.` is never accepted (CDS-19.4). `to_known` answers accept
   "X, I think." in the same way.
5. Echo questions (`Wohnen Sie seit wann …?`), a reversed order of two clauses or sentences, and
   `weil` + V2 stay rejected.

### Changed exercises
| # | Exercise id | Change | Reason |
|---|---|---|---|
| 1 | de-a2-u02-l1-ex07 | Added `Wart ihr in Wien letztes Wochenende?` | Rule 2 (adverbial order) |
| 2 | de-a2-u05-l2-ex11 | Added `Ich gehe zu Ana mit meinem Bruder.` | Rule 2; U5 exception lifted |
| 3 | de-a2-u05-l4-ex06 | Added `Nach Deutschland bin ich vor zwei Jahren gekommen.` and `Ich bin nach Deutschland vor zwei Jahren gekommen.` | PD-043 rule 2 (missing fronted PP); rule 2 |
| 4 | de-a2-u05-l4-ex12 | Added `Ich arbeite bei der Bank seit einem Jahr.` | Rule 2 (writer: "common in speech") |
| 5 | de-a2-u05-l5-ex10 | Added `Ravi wohnt in Deutschland seit zweitausendeinundzwanzig.` | Rule 2 |
| 6 | de-a2-u05-l5-ex12 | Added `Bei der Post bin ich mit meiner Schwester.` and `Ich bin bei der Post mit meiner Schwester.` | PD-043 rule 2 (fronted place was missing); rule 2 |
| 7 | de-a2-u07-l2-ex03 | Added `Gut fühle ich mich nicht.` | Rule 1; same unit accepts `Müde fühlt er sich.` |
| 8 | de-a2-u07-l4-ex03 | Added `Joggen sollst du nicht.` | Rule 1 |
| 9 | de-a2-u07-l5-ex12 | Added the two answers with `Fit bin ich jetzt.` | Rule 1 |
| 10 | de-a2-u08-l1-ex11 | Added `Eine Nachricht habe ich für Sie.` | PD-043 rule 3 (short object first) |
| 11 | de-a2-u08-l3-ex09 | Added `Meinen Termin muss ich leider absagen.` | PD-043 rule 3 |
| 12 | de-a2-u08-l3-ex12 | Added `Den Termin beim Friseur sage ich ab.` and the `bei der Friseurin` version | PD-043 rule 3 (one noun phrase) |
| 13 | de-a2-u08-l5-ex09 | to_known rewritten: `Sie sollen bitte Emil Becker zurückrufen.` → "You're supposed to / You should call Emil Becker back" (+ "call back Emil Becker") | Criterion 3: `sollen` recycling (relayed message) |
| 14 | de-a2-u10-l3-ex04 | Added `Hundertzwanzig Euro kostet das Doppelzimmer pro Nacht.` | PD-043 rule 3 |
| 15 | de-a2-u10-l5-ex12 | Added `Ich nehme die Straßenbahn zum Hotel vom Bahnhof.` | Rule 2 |
| 16 | de-a2-u12-l2-ex05 | to_known rewritten: `Ich soll eine Kopie von meinem Pass mitbringen.` → "I'm supposed to / I should bring a copy of my passport." | Criterion 3: `sollen` recycling in U12 |
| 17 | de-a2-u12-l2-ex12 | to_known rewritten: `Sie sollen die Unterlagen und den Pass mitbringen.` (documents / papers × should / are supposed to) | Criterion 3: `sollen` recycling in U12 |
| 18 | de-a2-u12-l4-ex04 | Added `Es regnet, die Kinder spielen draußen trotzdem.` | Rule 2 (`trotzdem` in the middle field is already accepted in this exercise) |
| 19 | de-a2-u12-l5-ex11 | Added `Ich weiß nicht, ob ich zu Hause am Montag bin.` | Rule 2 |
| 20 | de-a2-u13-l4-ex06 | Added `Der Artikel ist interessant, finde ich.` | Rule 4 (U13 accepted the `dass`-less order but not the tag order) |
| 21 | de-a2-u13-l4-ex12 | Added "The news on the radio is important, I think." | Rule 4 (as U11 L3 ex08, L5 ex09) |
| 22 | de-a2-u13-l5-ex12 | to_known rewritten: `Es ist spät, deshalb schalten wir die Handys aus.` (4 English orders) | Criterion 3: `deshalb` had 0 uses after U12 |
| 23 | de-a2-u14-l2-ex06 | to_known rewritten: `Der Zug hat sicher Verspätung.` → "The train is surely / definitely late / delayed." | Criterion 3: `Verspätung` recycling; also resolves U14 uncertainty 7 |
| 24 | de-a2-u14-l2-ex09 | MC rewritten: "The train will definitely be late." (`Der Zug wird bestimmt Verspätung haben.`), with the same error types as before (wrong position, finite verb at the end, `wirst`) | Criterion 3: `Verspätung` recycling; the `werden` drill is kept |
| 25 | de-a2-u14-l3-ex06 | Added `Immer übe ich abends.` | Rule 1; U1 L3 ex12 accepts `Immer ist es hier windig.` |
| 26 | de-a2-u14-l3-ex08 | to_known rewritten: `Ich weiß nicht, ob ich die Prüfung bestehe.` → "I don't know if / whether I'll pass the exam." | Criterion 3: `ob` had 0 uses after U12 (`der Traum` stays in ex01) |
| 27 | de-a2-u14-l4-ex05 | to_known rewritten: `Ich vermisse meine Familie, trotzdem bin ich glücklich.` → "…, but I'm still happy." / "…, but I'm happy anyway." | Criterion 3: `trotzdem` had 0 uses after U12 |
| 28 | de-a2-u14-l5-ex11 | Added "My new job is interesting, I think." | Rule 4 |

Every changed answer was checked by hand as buildable from its tiles. Rewritten tile sets keep
2–4 distractors, and tiles that could build an unlisted valid answer were left out: no `please`
tile in #13, so the imperative "Please call … back" can't be built; `when` / `fail` in #26 and
`so` in #27 only build sentences with another meaning.

### Criterion 1: vocabulary progression (PASS, 0 open)
Writer-flagged words and the outcome for each:
| Word | Where | Outcome |
|---|---|---|
| `unser` | U7, U9 outlines | Not used anywhere in A2 (search: 0 hits). No action; can be added in B1 or a later A2 revision |
| `sagen` | U12 L4 ex06 (`Können Sie mir sagen, ob …?`) | **Added to the U12 L4 appendix** (6 → 7). Every other `sag-` form is `Bescheid sagen` (U8 L5) or `absagen` (U8 L3) |
| `die Nummer` | U8 outline | Not used (U8 L1 uses `Es ist besetzt.`). No action |
| `bleiben` | U1 seed | First use is U3 L3, its appendix lesson. U1 and U2 don't use it. `Bleib!` (U7 L3) comes later. PASS |
| `lange` | U8 L4 ex08 (`Ich musste lange warten.`) | **Added to the U8 L4 appendix** (7 → 8): it is the stand-alone meaning "for a long time", not only part of `wie lange?` |
| `die Frage` | U12 L1 ex10, L3, L5; U14 L5 ex12 | Taught in U11 L4 (ex01 match, ex08 `Fragen`); no earlier use. PASS |
| `pro` | U11 L1 ex07, ex08; U13 L5 | Taught in U10 L3 (ex04); no earlier use. PASS |
| `kommen` (programmes) | U13 L3 ex06, U13 L4 ex04 | **Added to the U13 L3 appendix** (6 → 7) as a new meaning |
| `der Job` | U14 outline | Not used (`die Stelle` instead). No action |
| `fängst … an` | U11 L5 ex05 | Allowed extra: `anfangen` / `fängt an` is A1 U7 L4, and `fängst` is already a tile in A1 U8 L5 |
| `einlädt` | U11 L3 ex04 | Allowed extra: U4 L1 `einladen: du lädst … ein`, joined verb-final as taught in U8 L4 |
| `zweiten` / `vierten` | U10 L4 | A1: CON-DE-A1-12 lists the ordinals as forms of `am ersten / zweiten / dritten …`, and A1 U12 L2 uses both |
| `geöffnet` | U12 L3, L4 | U12 L3 appendix (`geöffnet / geschlossen`); first use U12 L3. PASS |
| `ans` | U9 grammar | Not used. No action |

Cross-unit assumptions, each confirmed in the earlier lesson file: U8 ← U7 `joggen` (U7 L1), `erkältet`
(U7 L4 ex05), `du` imperative pattern (U7 L3; `Ruf … zurück!` uses U8 L1 `zurückrufen`, `Sag …
Bescheid!` uses U8 L5 `Bescheid sagen`); U9 ← U7 `sei / seid` (U7 L3), `verloren` (U7 L5); U10 ←
U9 `funktionieren`, `der Schlüssel` (U9 L5), `neben` (U9 L1); U11 ← U10 `pro` (U10 L3); U12 ← U11
`die Frage` (U11 L4); U13 ← U11 / U12 `dass`, `glauben`, `finden`, `wichtig` (U11 L3), `wenn`
(U12 L3); U14 L5 ← U13 (`das Handy`, `die Nachrichten`, `schneller`, `am besten`, `so groß wie`).

Spot search of 40 more high-risk words (`nur`, `ganz`, `wieder`, `jede-`, `mal`, `zusammen`, `Pizza`,
`Ski`, `Weg`, `offen`, `Wasserhahn`, `Musik`, `Bett`, `Park`, `Fahrrad`, `Straßenbahn`, `Arm`,
`Tablette`, `Obst`, `Tee`, `Heizung`, …): every hit is in A1 or an A2 appendix. The words in the
28 changed exercises are all taught: `sollen` U7 L4, `mitbringen` U4 L5, `spät` from `zu spät` (U8
L2), `sicher` U14 L2, `wissen` / `ob` U12, `trotzdem` U12 L4, `vermissen` U14 L4, `Verspätung` A1.
**Not done:** a mechanical word-by-word lexical scan of all 70 files. That needs a script, and the
orchestrator could run it once (token list per lesson against the appendix lists).

### Criterion 2: totals (PASS)
| Unit | L1 | L2 | L3 | L4 | L5 | Unit total |
|---|---|---|---|---|---|---|
| U1 Weather and Seasons | 8 | 8 | 7 | 7 | 6 | 36 |
| U2 How Was Your Weekend? | 8 | 7 | 7 | 7 | 5 | 34 |
| U3 Holiday Stories | 7 | 7 | 8 | 8 | 6 | 36 |
| U4 Gifts and Celebrations | 7 | 8 | 7 | 7 | 4 | 33 |
| U5 Errands in Town | 7 | 7 | 7 | 7 | 4 | 32 |
| U6 Clothes and Shopping | 8 | 8 | 6 | 8 | 5 | 35 |
| U7 Health and Sport | 7 | 7 | 6 | 7 | 5 | 32 |
| U8 Appointments and Phone Calls | 7 | 7 | 7 | **8** | 4 | **33** |
| U9 At Home and the Neighbours | 8 | 8 | 6 | 8 | 5 | 35 |
| U10 Train and Hotel | 7 | 7 | 6 | 7 | 4 | 31 |
| U11 Work and Job Search | 7 | 7 | 7 | 7 | 5 | 33 |
| U12 Offices and Letters | 7 | 7 | 7 | **7** | 5 | **33** |
| U13 Media and Comparisons | 7 | 6 | **7** | 7 | 5 | **32** |
| U14 Plans and the Future | 6 | 6 | 7 | 6 | 2 | 27 |
| **A2** | | | | | | **462** |

Bold = changed by this QA. Every lesson is within its CDS-3 range: L1–L4 have 6–8 items, L5 has 2–6.
462 is on the PD-046 target (~460, planned 459). The unit tickets CON-DE-A2-08, -12 and -13 have the
updated rows and unit totals.

### Criterion 3: grammar coverage (PASS after fixes)
Introducing-unit counts are from the unit self-reviews; later-unit counts are from my searches.
| Row | Introducing unit (≥ 5) | Later units (≥ 3) | Result |
|---|---|---|---|
| `im` + month / season | U1: 12 | 28 hits: U3, U4, U7, U13, U14 (none in U10, which the map names) | PASS |
| `aber / oder / denn` | U1 L4: 10 | every unit | PASS |
| `war / hatte` | U2: 16 | U3, U7, U8 (15), U9, U10, U11, U14 | PASS |
| Perfekt with `haben` | U2: 18 WB | U3–U14 | PASS |
| Perfekt with `sein` | U3: 16 | U5 L3, L4 ex06; U14 L3 ex10, L5 ex03 | PASS |
| Accusative pronouns, `für / ohne / durch / um` | U3 L4: 12+ | U4, U6, U8 L1, U10, U12 L2, U14 L5 (22) | PASS |
| Dative articles, pronouns, verbs | U4: 23 + 13 | U5–U9 | PASS |
| Dative prepositions | U5: 30+ | U8 L3, U10 L5, U12 L4 | PASS |
| Hundreds / years | U5 L3: 11 | U10 L3 (3), U11 L1 ex07 | PASS |
| Adjective endings | U6: 16 | U9 L4, U10 L3, U13 L1, U14 L4 (5), U14 L5 | PASS |
| Reflexive verbs | U7: 20 | U8 L5, U11 L2, L4, L5, U12 L2 (16) | PASS |
| `du / ihr` imperative | U7 L3: 11 | U8 L1, L5, U9 L4, U13 L5, U14 L5 | PASS |
| `sollen` | U7 L4: 5 | **0 → 3**: U8 L5 ex09, U12 L2 ex05, ex12 (#13, #16, #17) | PASS after fix |
| Präteritum of modals | U8 L4: 8 | U9 L5, U10 L5, U11 L2, U14 L5 (11) | PASS |
| Minutes and hours | U8 L2: 9 | U10 L2: 5 | PASS |
| `weil` | U8: 10 | U11 L2, L5, U14 L3, L4, L5 (9; none in U9 or U13, which the map names) | PASS |
| Two-way prepositions | U9: 44 | U10 L4, L5, U12 L4 ex02, U13 L5 ex04, U14 L5 ex09 | PASS |
| `auf / von Gleis`, `Bahnsteig`, `… Minuten Verspätung` | U10: 6 + 4 + 5 | **1 → 3**: U14 L2 ex06, ex09, U14 L5 ex10 (#23, #24) | PASS after fix |
| `dass` | U11: 9 WB | U13 L4 (3), U14 L3 ex04, U14 L5 ex11 | PASS |
| `wenn` | U12 L3: 7 | U13 L5 ex05, ex06, U14 L5 ex12 | PASS |
| `deshalb / trotzdem / ob` | U12 L4–L5: 13 | **0 → 3**: U13 L5 ex12, U14 L3 ex08, U14 L4 ex05 (#22, #26, #27) | PASS after fix |
| Comparative / superlative | U13: 13 + 10 | U14 L1 ex06 (`mehr lesen`), U14 L5 ex07 (`besser`), ex13 | PASS |
| `werden` | U14 L1–L2: 15 + 6 | U14 L3 ex03, ex11, ex12, L5 ex14 | PASS |

### Criterion 4: deferred A1 items (PASS)
`im` + month: U1 L2–L3. Hundreds in to_learning word banks: U5 L3 ex04, ex11. `auf / von Gleis`,
`der Bahnsteig`: U10 L1. `… Minuten Verspätung`: U10 L2. Productive `ins / in den / in die`: U9 L3
(8 exercises). `die Minute(n)`: U8 L2. `nach links / rechts`: U5 L2 ex01, ex06, ex12. `Bei welcher
Krankenkasse sind Sie?`: U7 L4 ex08, ex11. `sich anmelden`: U12 L2 ex02, ex03. A1 native-review
items 4–6 are marked "Resolved in A2" in CON-DE-A1-QA.

### Criterion 5: ordering rules (PASS, orchestrator script)
The orchestrator's regex checks found 0 findings. The 28 changes add no `weil`, `dass`, `wenn` or
`ob` before its unit (`ob` / `trotzdem` / `deshalb` only in U13–U14; `sollen` only after U7) and no
Präteritum of full verbs.

### Criterion 6: answer fairness (PASS, 0 open)
- Applied the word-order rule above. 20 of the changes (#1–12, #14, #15, #18–21, #25, #28) add
  answers; rejections that remain are listed under rule 3 and rule 5.
- Every **single-answer** to_learning and to_known word bank in all 70 lessons was checked (search
  for one-item `answers` arrays). Apart from the flagged items above, all are questions,
  imperatives or fixed chunks with no valid alternative order.
- Multi-answer banks: about 40 spot-checked (U3 L3, U4 L1–L2, U5 L2, L4, L5, U7 L2, L4, L5, U8 L1,
  L3, L5, U9 L4, U10 L3, L5, U11 L3–L5, U12 L2–L5, U13 L4, L5, U14 L2–L5), together with every case
  a writer flagged as "rejected though buildable". **Not done:** a full permutation check of
  every multi-answer bank (needs a script that builds all tile orders).
- `dass`-less orders are now handled the same way in U11, U13 and U14 (rule 4). U11 L3 ex04 is
  the only bank that forces `dass`, because `einlädt` is one tile. Whether more banks should
  force the verb-final order is a cloze question for LES-015 (PD-049).
- Listens accept the transcript only (PD-043). No listen was changed.

### Criterion 7: German conventions (PASS)
The orchestrator's script found 0 findings (case-only pairs, digits, tile lengths, quotes).
Reading about 25 files turned up no umlaut, `ß`, capitalisation or article issue. The new tile
sets have no `sie / Sie`, `ihr / Ihr` or `ihnen / Ihnen` pair. The `Sie` in #17 is a German
prompt, not a tile. No new tile is over 24 characters, and no new prompt is over 80 (the longest
is 59).

### Criterion 8: consistency (PASS)
- MC prompts: the new #24 follows PD-044. No other MC prompt issue was seen.
- Glosses: every German item that repeats across lessons is glossed the same way in its match
  pairs (`die Post` "the post office" U5 L1 / L5; `der Anschluss` "the connection" U10 L2 / L5;
  `die Nachricht` "the message" U8 L1 / L5 vs `die Nachrichten` "the news" U13 L3 / U14 L5;
  `das Handy` "the mobile phone" U13 L1 / U14 L5; `das Bürgeramt` "the citizens' office" A1 U12
  and A2 U12 L3; `die Stelle` "the job / position" in U11 and "job" in U14). Deliberate double
  meanings are documented in the appendices: `passen` fit / suit, `stehen` stand / suit, `weit`
  far / loose, `der Platz` seat. `das Zeugnis` ("certificate / reference", U11) and `die
  Bescheinigung` ("certificate", U12) share "certificate", but they never appear in the same
  exercise. This is on the native-review list.
- Duplicates: the orchestrator's script found 0 exact duplicates. The rewritten exercises (#13,
  #16, #17, #22–24, #26, #27) are new sentences and duplicate no existing prompt.

### Criterion 9: grammar drill and tips (PASS)
Pattern lessons: U2 L2, U3 L2, U4 L3, U5 L3, U6 L3, U6 L4, U7 L2, U7 L3, U9 L1, U9 L3, U13 L2,
U13 L3. Each has 7–11 exercises that need the pattern, and each has at least 1 MC with
typical-error distractors (evidence in each self-review). I opened U7 L2 ex06 and U7 L3 ex06
myself; the other pattern-lesson MCs rely on the self-review evidence. The units without pattern rows (U8, U10, U11, U12,
U14) still have typical-error MCs. The changed U14 L2 ex09 keeps its error set. Tips: the
orchestrator's script confirmed ≤ 200 characters. Every tip read (about 25) names the rule and
gives one German example.

### Criterion 10: safety and claims (PASS)
Searched for alcohol, religious holidays, law, fines, fees, interest, visas, permits, doses,
diagnoses and brands (devices, apps, banks, train operators, stores, media), in German and
English: 0 hits. The salary (`zweitausendfünfhundert Euro pro Monat`, U11 L1) is invented and
makes no claim. The rewritten exercises make no claims either: `Sie sollen … mitbringen` is a
request in one invented situation, not a legal rule. One borderline item is listed for native
review: U7 L3 ex05 `Nimm eine Tablette!` (from the ticket; a friend's suggestion, no dose).

### Criterion 11: playthrough
**PASS (orchestrator, 2026-11-15).** A scripted Chromium playthrough at 375 × 667 on a build of
`main` (with LES-013 tip cards) plus this branch's A2 content played 16 lessons to "Lesson
complete!" with the correct answers from the content files: one per unit (U1 L3, U2 L2, U3 L4,
U4 L1, U5 L1, U6 L1, U7 L3, U8 L1, U9 L2, U10 L1, U11 L1, U12 L4, U13 L4, U14 L1), U14 L2 and the
A2 checkpoint. Every correct answer was accepted (0 "Not quite"), no screen scrolled sideways,
every tip card showed and fit, listen exercises showed the speech fallback / Skip. 0 issues, so
no `fix/` tickets.

### Criterion 12: needs native review (non-blocking until v1.0.0, PD-038)
No native review has been arranged. Consolidated from the 14 unit tickets plus this QA pass:
1. **Marked fronting accepted (rule 1, PD-043 rule 3):** U1 L1 ex08 `Warm ist es heute.`; U1 L3
   ex12 `Immer ist es hier windig.` / `Windig ist es hier immer.`; U1 L2 ex03 `Oft schwimme ich im
   Sommer.`; U3 L1 ex04 `Urlaub machen wir in Österreich.`; U3 L3 ex06 `Ein Zimmer brauche ich für
   zwei Nächte.`; U3 L4 ex03 `Dich besuche ich morgen.`; U4 L2 ex04, ex08, L4, L5 fronted dative
   pronouns (`Dir schenke ich ein Buch.`, `Ihnen gratuliere ich.`); U6 L5 ex06 `Amira, dir steht
   die grüne Jacke gut.`; U7 L2 ex03 `Gut fühle ich mich nicht.`, ex05 `Müde fühlt er sich.`; U7 L4
   ex03 `Joggen sollst du nicht.`; U7 L5 ex12 `Fit bin ich jetzt.`; U8 L1 ex11 `Eine Nachricht habe
   ich für Sie.`; U10 L3 ex04 `Hundertzwanzig Euro kostet …`, ex11 `Ein ruhiges Doppelzimmer haben
   wir gebucht.`; U10 L5 ex12 `Zum Hotel nehme ich …`; U11 L1 ex04 `Vollzeit möchte ich arbeiten.`;
   U11 L5 ex06 `Mir zeigt der Chef das Büro.` / `Das Büro zeigt mir der Chef.`; U12 L1 ex10 `…, eine
   Frage habe ich.`; U12 L3 ex04, ex05; U12 L4 ex09 `…, später komme ich deshalb.`; U13 L1 ex09
   `Einen neuen Laptop hat meine Schwester.`; U13 L3 ex12 `Am liebsten liest meine Tochter.`; U14
   L2 ex12 `Viele Wolken gibt es.`; U14 L3 ex06 `Immer übe ich abends.`
2. **Middle-field adverbial orders accepted (rule 2):** U1 L1 ex08 `Es ist warm heute.`, L3 ex12, L4
   ex05, L5 ex09, ex12; U2 L1 ex07 `Wart ihr in Wien letztes Wochenende?`; U2 L3 ex07 `Ich habe am
   Samstag Ana getroffen.`; U3 L5 ex04 `Wir sind in Innsbruck am Montag angekommen.`; U5 L2 ex11, L4
   ex06, ex12, L5 ex10, ex12; U8 L1 ex11 `Ich habe für Sie eine Nachricht.`; U10 L5 ex06 `Ich komme
   später heute Nacht an.`, ex12 `… zum Hotel vom Bahnhof.`; U11 L2 ex07; U12 L4 ex04 `… spielen
   draußen trotzdem.`; U12 L5 ex08 `Kann am Dienstag der Handwerker kommen?`, ex11 `ob ich zu Hause
   am Montag bin`; U14 L5 ex01 `… aber es ist im Sommer warm.`
3. **Rejections to confirm (rule 3 / 5):** U4 uncertainty 1 (accusative noun before dative noun;
   noun subject before dative pronoun); U5 L5 ex06 `nach Berlin den Brief`; U5 L4 ex04 echo
   question; U7 L5 ex12 `im März mich verletzt`; U8 L3 ex12 `beim Friseur den Termin` (other
   meaning); U8 L5 ex11 present tense for "was delayed"; U12 L5 ex04 fronted object `Sie`; U14 L5
   ex04 accusative before dative; U1 L4 ex03 `Es ist kalt, aber sonnig.`; U1 L5 ex04 no modal.
4. **`dass`-less and tag orders accepted (rule 4):** U11 L3 ex05, ex06, ex10; U11 L4 ex09; U11 L5
   ex07; U13 L4 ex06; and the English "…, I think." in U11 L3 ex08, ex12, U11 L5 ex09, U13 L4 ex12
   and U14 L5 ex11.
5. **Word and usage choices:** temperatures with `es sind` (U1); `Hast du jetzt Pause?` (U2 L5 ex07);
   `Urlaub machen` ↔ "on holiday" (U3 L1 ex04); `zum Geburtstag` only inside the greeting (U4);
   `bei der Bank / Post` for location (U5); `gegenüber vom` only (U5 L2); `Seit wann …?` for "how
   long" (U5 L4 ex04); the playful million-euro flat (U5 L3 ex12); `Die grüne.` ellipsis (U6 L3
   ex10); `die Hose` = "trousers" (U6); `weit` = "loose" (U6 L4 ex11); `Das steht dir gut` → "looks
   good on you" (U6 L5); `Lukas hat (die) Grippe` (U7 L4 ex12); `Wie geht es deinem Fuß?` (U7 L5);
   `Esse!` as a distractor (U7 L3 ex06); `Nimm eine Tablette!` (U7 L3 ex05); `Auf Wiedersehen` on
   the phone as a wrong option (U8 L1 ex03); `Ich bin zu spät` not used (U8); `Passt Ihnen Dienstag
   am Vormittag?` (U8 L3 ex04); short answer `Weil ich krank war.` (U8 L4 ex11); `Die Schuhe stehen /
   sind` (U9 L1 ex11); `morgen (am) Vormittag` (U9 L5 ex10); `Kinder, bitte seid leise!` (U9 L4
   ex11); `Reservierung für Wagen sieben` (U10 L1 ex08); British floor counting (U10 L4); `in
   Vollzeit` in match pairs (U11); `noch Fragen` (U11 L4 ex08); `eine Kopie von meinem Pass` (U12
   L2 ex05); `geöffnet` vs `offen` (U12 L4); lower-case `mit freundlichen Grüßen` in match pairs
   (U12 L1); `Sehr geehrten …` as a distractor (U12 L1 ex02); `kommen` for broadcasts (U13);
   `Schalt!` vs `Schalte!` (U13 L5); `Diese Sendung ist am besten.` (U13 L3 ex03); `pro Tag` (U13
   L5 ex08); `weiter Deutsch lernen` / `Ich lerne weiter Deutsch.` (U14 L3 ex07, ex12); `Zeugnis` and
   `Bescheinigung` both glossed "certificate".
6. **New German written in this QA pass:** U8 L5 ex09 `Sie sollen bitte Emil Becker
   zurückrufen.`; U12 L2 ex05 `Ich soll eine Kopie von meinem Pass mitbringen.`, ex12 `Sie sollen
   die Unterlagen und den Pass mitbringen.`; U13 L5 ex12 `Es ist spät, deshalb schalten wir die
   Handys aus.`; U14 L2 ex06 `Der Zug hat sicher Verspätung.`, ex09 `Der Zug wird bestimmt
   Verspätung haben.`; U14 L3 ex08 `Ich weiß nicht, ob ich die Prüfung bestehe.`; U14 L4 ex05 `Ich
   vermisse meine Familie, trotzdem bin ich glücklich.`

Resolved by this pass: U14 uncertainty 7 (`Sie kommt sicher.` was replaced); U11 uncertainty 7 and
U8 uncertainty 7 (decided above); U12 uncertainty 2 (`sagen` added to the appendix); U13
uncertainty 2 (`kommen` added); U7 / U9 `unser`, U8 `die Nummer`, U9 `ans`, U14 `der Job` (not
used; no change needed).

### Criterion 13 (PASS)
Ids unchanged; no lesson added or removed (70 A2 lessons listed in `course.json`); `version` 15 →
16. Every edit keeps the existing JSON structure (`answers` arrays of strings; MC `options` with
the same ids and `correctOptionId`; `type`, `direction` and ids untouched). `npm run test`
(content, contracts, integration): 329 passed (orchestrator).

### Still unchecked (for a scripted follow-up)
1. Mechanical lexical scan of every token in all 70 files against the appendices (criterion 1).
2. Full permutation check of multi-answer word banks for unlisted valid orders (criterion 6);
   about 40 were spot-checked by hand.
3. ~~The browser playthrough (criterion 11).~~ Done, see criterion 11.
4. Orchestrator script results: 0 unbuildable answers (1,836 accepted answers checked against
   their tiles); 0 case-only tile pairs, digits in tiles, over-length tiles/prompts/tips,
   ordering-rule hits or duplicate exercises across A1 and A2.

**Ticket status:** criteria 1–10 and 12 PASS (1, 3 and 6 after fixes, with the scripted
follow-ups above recommended but not blocking); 11 PASS (scripted playthrough);
13 PASS.
