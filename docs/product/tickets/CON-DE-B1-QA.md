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
