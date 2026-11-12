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
