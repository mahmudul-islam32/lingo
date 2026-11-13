# CON-DE-A1-QA: German A1 content QA pass (all 60 lessons)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-01 … CON-DE-A1-12, LES-014,
GAM-010, PLT-024 · **Milestone:** v0.3.3 · **Decisions:** PD-037, PD-038

## User story
As a German learner, I want all of A1 to be correct, consistent and fair to answer, so that
I trust the course and finish the level.

## Acceptance criteria
1. **Vocabulary progression:** a check of all 60 lessons confirms that every German word in
   exercises and distractor tiles is introduced in the same or an earlier lesson, or is an
   allowed extra (CDS-3). Findings are listed per exercise id. The result is 0 open
   violations.
2. **Totals:** a table in this ticket lists the new items per unit and the A1 total
   (target ~400, PD-038), and shows every lesson within its CDS-3 range.
3. **Grammar coverage:** the A1 grammar coverage map (`curriculum-german.md` §4) is checked:
   every point has at least 5 exercises in its introducing unit and at least 3 in later
   units. Gaps are fixed in the unit files.
4. **Answer fairness:** every word bank and listen exercise is re-checked for missing
   alternatives (CDS-4) and unlisted valid tile combinations (CDS-5). The result is 0 open
   issues.
5. **German conventions:** a pass over all files finds 0 issues with umlauts, `ß`,
   capitalised nouns, articles on nouns, `sie` / `Sie` sharing a tile set, digits in tiles or
   capital `ẞ` (CDS-6, PD-033, PD-037).
6. **Consistency:** English prompt wording follows CDS-7 everywhere, and no exercise appears
   twice across the course (same type, same prompt, same answer).
7. **Playthrough:** the pm plays at least 1 lesson per unit (12 lessons) on the deployed
   preview at 375 × 667, with the German speech fallback, and notes any text overflow,
   language-tag or audio issue. Each issue becomes a `fix/` ticket for its owner.
8. **Native review:** if the owner has arranged a native-speaker review (PD-038), its
   findings are fixed or listed with a reason. If not, this ticket keeps a "needs native
   review" list of every sentence the pm marked as uncertain, and v0.3.3 ships with that
   list (non-blocking until v1.0.0).
9. Exercise ids stay unchanged by the fixes (CDS-12). The course `version` is bumped once for
   the QA changes.
10. `npm run test` (content schema test) is green after the fixes.

## Out of scope
- Speak exercises and final audio (v1.0.0)
- A2 content (v0.5.0)
- New exercise types (curriculum §6)

## UX notes
No new screens. Findings are recorded in this file as a table: exercise id, issue, fix,
status.

## Technical notes
_(cto)_

## Review
_(pm records the QA tables here)_

## QA report

_2026-11-12 · pm · Read all 60 lesson files and the 12 unit tickets (self-reviews and native-review
notes) against CDS-1…13 and PD-030…PD-038. The schema test is run by the orchestrator after
this pass. Course `version` bumped once, 4 → 5 (criterion 9). No exercise id was renamed,
added or removed (CDS-12)._

### Summary
- **38 exercises changed** in 26 lesson files (list below). 9 of them are listen exercises
  with a new transcript: their placeholder audio at the unchanged path must be regenerated
  (PD-034 fallback reads the new text meanwhile): u03-l3-ex09, u05-l5-ex07, u05-l5-ex10,
  u08-l5-ex02, u10-l3-ex12, u11-l1-ex09, u11-l4-ex11, u12-l3-ex03, u12-l5-ex08.
- **Decisions logged:** PD-039 (`im` + month → early A2), PD-040 (`ins Kino` as a U8 chunk;
  `in den Park` removed), PD-041 (`achthundert` as a recognition-only extra; hundreds in A2),
  PD-042 (`das Gleis` = "the platform", no preposition in A1), PD-043 (one word-order
  acceptance rule for all units), PD-044 (MC prompt punctuation).
- **Main issues found:** `eine` used in Unit 3 before Unit 4 teaches it; `in den Park`
  (two-way preposition, A2) in Unit 8; Unit 2 rejected fronted phrases that Units 9 and 12
  accept; three near-duplicate exercises across units; `dürfen` and `es gibt` under the
  coverage-map minimum; a few unnatural sentences (`Mein Hals ist kalt.`, `Guten Tag! Sonst
  noch etwas?`, `Ein Kaffee zum Mitnehmen` in the checkpoint); dated English accepted
  (`Have you no rice?`); inconsistent MC prompt punctuation.

### Changed exercises
| # | Exercise id | Change | Reason |
|---|---|---|---|
| 1 | de-a1-u02-l1-ex04 | Added `Aus Österreich komme ich.` | PD-043: fronted phrase is valid V2; U9/U12 accept it (CDS-4/5) |
| 2 | de-a1-u02-l2-ex03 | Added `In Hamburg wohne ich.` | PD-043 |
| 3 | de-a1-u02-l2-ex05 | Added `In Wien wohne ich jetzt.` | PD-043 |
| 4 | de-a1-u02-l3-ex03 | Added `Deutsch und Englisch spreche ich.` and the swapped pair | PD-043 (object-first) |
| 5 | de-a1-u02-l3-ex07 | Added `Deutsch lerne ich jetzt.` | PD-043; same as U7 L2 ex04 |
| 6 | de-a1-u02-l4-ex03 | Added `In Zürich wohnt sie.` | PD-043 |
| 7 | de-a1-u02-l4-ex07 | Added `In Berlin wohnen sie.` | PD-043 |
| 8 | de-a1-u02-l5-ex01 | Prompt `'who?'?` → `'who?'` | PD-044 |
| 9 | de-a1-u02-l5-ex08 | Added `Deutsch lernen wir hier.` | PD-043 |
| 10 | de-a1-u03-l3-ex07 | `eine Telefonnummer` → `die Telefonnummer` (prompt and options) | CDS-3: `ein / eine` is taught in U4 L3 |
| 11 | de-a1-u03-l3-ex09 | Transcript `Haben Sie die Telefonnummer, Herr Okafor?`; tiles `eine/ein` → `die/der` | CDS-3 (as above) |
| 12 | de-a1-u03-l4-ex08 | `Haben Sie die Handynummer?`; tiles `eine/ein` → `die/der` | CDS-3 (as above) |
| 13 | de-a1-u03-l5-ex01 | Prompt punctuation | PD-044 |
| 14 | de-a1-u05-l2-ex03 | Added `Den Käse kaufe ich.` | PD-043 (object-first) |
| 15 | de-a1-u05-l4-ex06 | Distractor `no` → `eggs`; removed `Do you have no rice?` / `Have you no rice?` | Dated/odd English; the tile change makes it unbuildable (CDS-5) |
| 16 | de-a1-u05-l5-ex07 | `Guten Tag! Sonst noch etwas?` → `Danke! Sonst noch etwas?` | Naturalness: "anything else?" isn't asked right after a greeting |
| 17 | de-a1-u05-l5-ex10 | `Das macht zwölf Euro vierzig. Hier ist der Kassenbon.` | Near-duplicate of u04-l4-ex09; now uses the U5 item `Kassenbon` |
| 18 | de-a1-u05-l5-ex12 | Prompt "No, that's all. The receipt, please." → `Nein, das ist alles. Den Kassenbon, bitte.` | Near-duplicate of u04-l5-ex12; now practises U5 accusative `den` |
| 19 | de-a1-u06-l2-ex07 | Added the two object-first orders | PD-043; same pattern accepted in u10-l1-ex09 |
| 20 | de-a1-u06-l4-ex07 | Added `In Leipzig wohnen Emil und sein Mann.` | PD-043 |
| 21 | de-a1-u08-l3-ex10 | "I'm running to the park" → "I run in the morning." (`Ich laufe morgens.`) | PD-040: `in den` + accusative is A2 |
| 22 | de-a1-u08-l5-ex01 | Pair `gehen` → `ins Kino gehen` / "to go to the cinema" | PD-040: introduces the chunk before ex04 |
| 23 | de-a1-u08-l5-ex02 | `Hallo Aylin! Hast du am Wochenende Zeit und Lust?` | Near-duplicate of u07-l5-ex03 (`Hallo Bastian! Hast du am Samstag Zeit?`) |
| 24 | de-a1-u08-l5-ex04 | `in den Park` → `ins Kino` | PD-040 |
| 25 | de-a1-u08-l5-ex11 | Options and prompt add `ins Kino` | `Wir können am Samstag um acht gehen.` had no destination (native note) |
| 26 | de-a1-u09-l2-ex07 | Register moved inside the quotes | PD-044 |
| 27 | de-a1-u09-l4-ex05 | Register moved inside the quotes | PD-044 |
| 28 | de-a1-u09-l5-ex02 | Register moved inside the quotes | PD-044 |
| 29 | de-a1-u10-l3-ex12 | `Doch, hier gibt es einen Kühlschrank.` | `doch` had 0 uses after U5 (coverage map); replaces the flagged list sentence |
| 30 | de-a1-u10-l5-ex07 | Prompt "The flat is sixty square metres."; distractor `ist` → `hast` | Natural English; `Die Wohnung ist sechzig Quadratmeter` (without `groß`) can't be built |
| 31 | de-a1-u11-l1-ex09 | `Mein Hals ist kalt.` → `Meine Beine sind kalt.` | Unnatural sentence (native note) |
| 32 | de-a1-u11-l4-ex11 | `Das Wartezimmer ist hier rechts.` → `Darf ich hier Platz nehmen?` | `dürfen` had only 4 exercises in U11 (coverage map needs 5) |
| 33 | de-a1-u12-l3-ex03 | `Entschuldigung, gibt es hier ein Bürgeramt?` | `es gibt` had 2 later uses (needs 3); breaks the repeated `wo ist das …?` template |
| 34 | de-a1-u12-l3-ex10 | MC now `Darf ich das Formular hier ausfüllen?` (unsplit-verb distractors kept) | `dürfen` had 0 uses in U12 (needs 3 later) |
| 35 | de-a1-u12-l4-ex02 | Prompt punctuation | PD-044 |
| 36 | de-a1-u12-l4-ex09 | "May I start on Monday?" (`Darf ich am Montag anfangen?`) | `dürfen` recycling; job context |
| 37 | de-a1-u12-l5-ex03 | Prompt `Ein Kaffee zum Mitnehmen` → `Einen Kaffee …` | Accusative in an order (U5 grammar); the checkpoint must model it |
| 38 | de-a1-u12-l5-ex08 | `Ich habe einen Termin um zehn. Darf ich hier warten?` (second `ich` tile) | `dürfen` recycling in the U11 slot of the checkpoint |

### Criterion 1: vocabulary progression (0 open)
Checked every German word in answers, options, prompts and distractor tiles against the
appendices. Open violations after the fixes: **0**.
- Fixed: `eine` in U3 (#10–12); `in den` + accusative in U8 (#21, #24).
- Confirmed in place before use (the Unit 11/12 assumptions): `frei` (U10 L5), `weit`,
  `links`, `rechts` (U9 L5), `muss` (U9 L4), `es gibt` (U10 L3), `Termin`, `Ärztin` (U11 L3),
  `hell` (U10 L4), `nächste` (U9 L4), `Zimmer` / `Wohnzimmer` / `Schlafzimmer` (U10 L1),
  `oft` (U8 L3), `gehen` (U8 L5; first other use U9 L1), `können` (U8 L4), `viel` (U5 L3),
  `heute` (U5 L4), `morgen` / `Zeit` (U7 L5), `Entschuldigung` (U1 L5).
- Documented allowed extras: `achthundert` (PD-041), `ins Kino` (PD-040, counted with
  `das Kino`), `Tage` (plural of `Tag`), `Platz` / `es` / `bis` / `ab` from taught phrases.
- `im` is used nowhere in A1 (PD-039).

### Criterion 2: totals
| Unit | L1 | L2 | L3 | L4 | L5 | Unit total |
|---|---|---|---|---|---|---|
| U1 | 7 | 7 | 7 | 7 | 5 | 33 |
| U2 | 7 | 8 | 7 | 6 | 5 | 33 |
| U3 | 7 | 7 | 6 | 5 | 6 | 31 |
| U4 | 6 | 7 | 6 | 7 | 6 | 32 |
| U5 | 7 | 7 | 6 | 6 | 6 | 32 |
| U6 | 6 | 6 | 6 | 7 | 6 | 31 |
| U7 | 6 | 8 | 7 | 6 | 5 | 32 |
| U8 | 7 | 6 | 6 | 5 | 6 | 30 |
| U9 | 7 | 6 | 6 | 6 | 6 | 31 |
| U10 | 7 | 6 | 5 | 6 | 6 | 30 |
| U11 | 7 | 5 | 6 | 6 | 5 | 29 |
| U12 | 7 | 8 | 8 | 6 | 2 | 31 |
| **A1** | | | | | | **375** |

Every lesson is within its CDS-3 range (L1–L4: 5–8, L5: 2–6). 375 entries (number patterns
count once) is within "~400" (PD-038); with number patterns expanded the learner meets well
over 400 word forms. PASS.

### Criterion 3: grammar coverage
| Grammar point | In introducing unit | Later units | Result |
|---|---|---|---|
| `sein`, `heißen`, du / Sie | U1: all lessons | every unit | PASS |
| Regular present, all persons | U2 L2–L5 | U3–U12 | PASS |
| V2 word order | U2: L2 ex05, ex06, L3 ex07, L5 ex04, ex08 | U7 (15+), U9 L1 ex08, U12 L1 ex04, ex08 | PASS |
| Yes/no questions | U3: L3 ex06–ex09, L4 ex08 | U4–U12 | PASS |
| `haben` | U3: L3 ex07, ex09, ex10, ex11, L4 ex08 | U5 L4, U6 L2, U10 L1, U11 L2 | PASS |
| Gender | U4 (8 MC) | every noun MC from U5 on | PASS |
| `ein / eine`, `möchte` | U4 L3 (all) | U5 L1 ex06, ex08, ex10; U10 L2 ex08; U12 L3 ex04 | PASS |
| Accusative `den / einen` | U5 (9+) | U6 L2, U10 L3, U11 L3 | PASS |
| `kein / nicht`, `doch` | U5 L4 | U8 L4 ex07, L5 ex05; U10 L2 ex12, L3 ex06, ex10, ex12 (`doch`, fixed #29) | PASS after fix |
| Plurals | U5 (5 patterns) | U6 L1, U10 L2, U11 L1 | PASS |
| Possessives | U6 (8+) | U11 L1, L4; U12 L3, L4 | PASS |
| Separable verbs | U7 (11+) | U9 L3, U12 L3, L4, L5 | PASS |
| `können` | U8 L4 (6+) | U11 L3 ex09, U12 L1 ex12, L5 ex10 | PASS |
| `müssen`, imperative | U9 L4, L5 | U11 L4 ex04, ex09, L5 ex03, ex07; U12 L3 ex05 | PASS |
| `es gibt` | U10 L3 (10) | U11 L5 ex04, U12 L3 ex03 (fixed #33), U12 L5 ex05 | PASS after fix |
| `dürfen` | U11 L4 ex01, ex02, ex07, ex11 (fixed #32), ex12 | U12 L3 ex10, L4 ex09, L5 ex08 (fixed #34, #36, #38) | PASS after fix |
| `wollen`, dates | U12 L2, L4 | (none after A1) | PASS |

### Criterion 4: answer fairness (0 open)
Every word bank and listen was re-checked for missing alternatives and unlisted buildable
answers. Unit 2 was aligned with the rest of the course (PD-043, #1–9) and three more
object-first / fronted orders were added (#14, #19, #20). One odd English variant was made
unbuildable by a tile change (#15). Marked German orders that the tiles can't prevent stay
accepted and are on the native-review list below. Remaining deliberate rejections
(register mismatches, statement for an imperative or a yes/no prompt, reversed two-sentence
order) follow the unit tickets and PD-043. Result: **0 open**.

### Criterion 5: German conventions
Umlauts and `ß` correct everywhere, no capital `ẞ`, no `ss` / `ae` substitutes, nouns
capitalised, articles on all match-pair and vocabulary nouns, no digits in tiles or answers
(digits only in two MC prompts: "(8:30)", "€2.50"), no tile set with both `sie` and `Sie` or
`ihr` and `Ihr`. `U-Bahn` is one tile. `Entschuldigung` and `tschüss` are spelled the same in
every unit. **0 issues.**

### Criterion 6: consistency
- MC prompts: 7 fixed to one pattern (PD-044). All MC prompts are English with German
  options (CDS-7).
- Duplicates: no exercise appears twice (same type, prompt and answer). Three cross-unit
  near-duplicates were rewritten (#17, #18, #23). Intended recycling that remains: the
  price listens `Das macht zusammen … Euro …` in U4 (different amounts) and the checkpoint
  MC u12-l5-ex07, which reviews the U9 word bank u09-l5-ex03 in another exercise type.
- Shared items: `Entschuldigung`, `U-Bahn`, `Frau` + surname ("Mrs / Ms" accepted where both
  tiles exist), "(formal)" / "(to a friend)" register notes and "der / die words" tip style
  are consistent across units.
- Accessibility of the English: prompts and tips are plain English without idioms. Changed:
  u10-l5-ex07 ("The flat has sixty square metres" was a German calque). British forms ("flat",
  "at the weekend") are kept consistently, with US variants accepted where tiles exist.

### Criterion 7: playthrough
**OPEN.** This QA pass ran in a worktree without a browser or deployed preview. The 12-lesson
playthrough at 375 × 667 with the German speech fallback is still to do on the v0.3.3
preview; it must include the U3 L5 letter tiles (TTS has to read "J, Ö, R, G" as letter
names) and the 9 listen exercises with new transcripts. Any finding becomes a `fix/` ticket.

### Criterion 8: native review
No native review has been arranged yet (PD-038). Resolved by the pm without a native speaker
(clear cases): the U3 non-word distractors are intentional; `Zwei und zwei ist vier` is
common (both `ist` and `sind` are used); `Ich möchte ein Wasser`, `die Kaffees`, `der
Kassenbon`, `Oma hat eine Katze.`, `Wo tut es weh?`, `Wie viel kostet die Miete?`, `Ist das
Gleis fünf?` (`das` = "that") are standard; rejecting `Kilos` is fair in a transcript-only
listen; `Ich laufe in den Park.`, `Mein Hals ist kalt.`, `Have you no rice?` and the
`Gleis`, `achthundert`, `ins Kino` and `im` questions were fixed or decided (see above).

**Needs native review** (owner item, non-blocking until v1.0.0):
1. u07-l3-ex09: accepted `Morgens früh stehe ich auf.` and `Früh morgens stehe ich auf.`
   (regional or fine?).
2. Specific-before-general time orders that are accepted: u07-l3-ex10 `Ich frühstücke um
   halb neun am Mittwoch.`, u12-l5-ex06 `Ich stehe um sechs am Mittwoch auf.`; place before
   time: u12-l1-ex04 `Ich wohne in Bremen ab April.`, u12-l2-ex09 `Ich fahre nach Hamburg am
   vierten November.` Accept or reject?
3. Marked fronting that the tiles can't prevent: u08-l4-ex03 `Gut kann ich schwimmen.`,
   u08-l5-ex04 `Ins Kino können wir gehen.`, u09-l2-ex10 `Nach München brauche ich eine
   Fahrkarte, hin und zurück.`, u10-l5-ex04 `Frei ist die Wohnung ab sofort.`, u11-l3-ex03
   `Fieber habe ich seit gestern.`
4. u09-l5-ex08 / ex11 and u09-l5-ex04: `Gehen Sie hier rechts.` / `Gehen Sie links …` vs
   `nach rechts / nach links`.
5. u11-l4-ex06: `Wie heißt Ihre Krankenkasse?` (vs the dative `Bei welcher Krankenkasse sind
   Sie?`, A2).
6. u12-l3-ex04: `Ich möchte die Anmeldung machen.` (vs `mich anmelden`, not taught).
7. u05-l3-ex11: `eine Packung Butter` (vs `ein Stück Butter`).
8. All new German written in this QA pass: u03-l3-ex07, ex09, u03-l4-ex08 (`Haben Sie die
   Handynummer?`), u05-l5-ex07, ex10, ex12 (`Den Kassenbon, bitte.`), u08-l3-ex10,
   u08-l5-ex02 (`Zeit und Lust`), ex04, ex11, u10-l3-ex12, u11-l1-ex09, u11-l4-ex11 (`Darf
   ich hier Platz nehmen?`), u12-l3-ex03, ex10, u12-l4-ex09, u12-l5-ex08.

### Criteria 9 and 10
- 9: PASS. Ids unchanged; `version` 4 → 5 in `course.json`.
- 10: PENDING the orchestrator's `npm run test`. Every changed answer was hand-checked as
  buildable from its tiles (duplicate words have duplicate tiles, e.g. `ich` ×2 in
  u12-l5-ex08), with 2–4 distractors beyond the canonical answer.

### CDS result for the whole A1 level
| Rule | Result | Note |
|---|---|---|
| CDS-1 Files | PASS | 12 units, 60 lessons in `course.json`, version bumped |
| CDS-2 Mix | PASS | All 60 lessons have 12 exercises with the required mix; no type changed |
| CDS-3 Vocabulary | PASS after fixes | #10–12, #21, #24; extras per PD-040, PD-041 |
| CDS-4 Alternatives | PASS after fixes | PD-043 applied (#1–7, #9, #14, #19, #20) |
| CDS-5 Distractors | PASS after fixes | #15, #30; 2–4 distractors in every new tile set |
| CDS-6 Conventions | PASS | 0 issues |
| CDS-7 MC direction | PASS after fixes | PD-044 (#8, #13, #26–28, #35) |
| CDS-8 Originality | PASS | No brands, names invented |
| CDS-9 Audio | PASS | Paths unchanged; 9 placeholder files to regenerate |
| CDS-10 Tip | PASS | All tips ≤ 120 characters and name the lesson's feature |
| CDS-11 Inclusive and safe | PASS | No medical advice, legal claims or slang; both job forms accepted |
| CDS-12 Validation | PASS (test pending) | Ids stable; orchestrator runs `npm run test` |
| CDS-13 Fit | PASS | Longest new prompt 68 characters; no new tile over 24 characters |

**Ticket status:** criteria 1–6 and 9 PASS; 7 OPEN (playthrough on the preview); 8 PASS with
the native-review list above; 10 pending the orchestrator's test run.
