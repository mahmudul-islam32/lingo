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
