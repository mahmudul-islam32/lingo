# CON-DE-B1-PLAN: German B1 plan (units, grammar order, size, CDS additions, tech needs, tickets)
**Owner:** pm · **Priority:** P1 · **Depends on:** CON-DE-A2-QA merged (A2 inventory final) ·
**Milestone:** v1.1.0 (wave 0) · **Branch:** `docs/pm-007-german-b1-plan` · **Decisions:**
PD-045 … PD-055 (A2 model), PD-056 … PD-063 (this plan)

## User story
As the content team, we want a fixed B1 plan with appendices that are the vocabulary
contract, so that 4 writers can write B1 in parallel without the cross-unit fixes A2 needed.

## Acceptance criteria
1. `curriculum-german.md` has a §4c "B1 plan": 16 units × 5 lessons with lesson ids, theme,
   Life-in-DACH angle, can-do and grammar per unit, the reasons for the order, a size target,
   a gap-word list, a grammar coverage map with recycling duties, and a tech needs list
   (each item marked blocker or not, and which units can be written with today's types).
2. §7 has CDS-20 … CDS-28 for B1, each workable with today's four exercise types.
3. 16 unit tickets `CON-DE-B1-01 … 16` in the A2 format with a fixed per-lesson appendix, and
   `CON-DE-B1-QA` built on the A2 QA findings.
4. `decisions.md` logs PD-056 onward; `ROADMAP.md` v1.1.0 lists the tickets and 4-writer waves.

## What was planned (2026-11-16)
- **Units (PD-056):** U1 Could You Help Me? · U2 Life Stories · U3 People Around Me · U4
  Everyday Work · U5 Learning for Life · U6 Renting a Flat · U7 Doctors and Hospitals · U8
  Orders and Complaints · U9 Environment and the City · U10 If I Had More Time · U11 Letters
  from the Authorities · U12 News and Reports · U13 Food and Markets · U14 Living Together ·
  U15 Discussing and Deciding · U16 Next Steps + B1 checkpoint (16 exercises).
- **Size (PD-057):** 508 appendix entries planned (target ~510, ~800 word forms), not ~1,000;
  ~150 receptive words later with reading passages. Per unit: U1 35, U2 37, U3 33, U4 35,
  U5 31, U6 31, U7 33, U8 31, U9 32, U10 30, U11 31, U12 31, U13 33, U14 31, U15 28, U16 26.
- **Content standard (PD-058, PD-059, PD-061):** CDS-20 length (110-character prompts,
  ≤ 14 answer tiles), CDS-21 240-character tips with one-line tables, CDS-22 B1 allowed
  extras, CDS-23 tense / form mapping, CDS-24 word order with PD-053 from the start, CDS-25
  recycling duties, CDS-26 safe topics, CDS-27 glosses, CDS-28 checkpoint.
- **Tech needs (PD-060):** no writing blocker. B1-T1 cloze (v0.5.1), B1-T2 typed answers,
  B1-T3 reading passage with reverse-direction options, B1-T4 note card: all non-blocking,
  added later by follow-up content tickets with new ids. B1-T5 fit check (240-character tip,
  110-character prompt at 375 × 667) blocks only CDS-20 / CDS-21, with a fallback to A2's
  limits. B1-T6 offline caching for 210 lessons, B1-T7 prompt audio: non-blocking. The cto
  assigns IDs.
- **Waves (PD-062):** 4 writers; wave 1 U1–U4, wave 2 U5–U8, wave 3 U9–U12, wave 4
  U13–U16, wave 5 QA; scripted checks after every wave.
- **Merge rule (PD-063, revised):** writing starts after this plan is merged and B1-T5 is
  done (no longer after CON-DE-NR); B1 still merges into `main` only after v1.0.0 is tagged,
  with a native-review delta pass first; a B1 native review blocks v1.1.0.

## Lessons from the A2 QA, and where the plan answers them
| A2 QA finding | B1 answer |
|---|---|
| 20 of 28 changes aligned word orders that writers handled differently | PD-053 and CDS-24 are fixed before writing (PD-059); clause-first, relative-clause and connector positions are specified |
| 4 coverage rows had 0–1 later uses (`sollen`, `deshalb / trotzdem / ob`, `Gleis`) | Every unit ticket has a recycling criterion with minimum counts (CDS-25) |
| Words used without an appendix entry (`sagen`, `lange`, `kommen`) | 48 gap words placed in U1–U4; a "not yet taught" list in every ticket; seeds checked against the inventory |
| Lexical scan and permutation check left as follow-ups | Both run after every wave and are required in CON-DE-B1-QA criteria 1, 6, 12 |
| Double meanings and glosses checked late | New meanings are separate, marked appendix entries (CDS-27) |
| Native review missing | Delta pass after CON-DE-NR, and a B1 native review that blocks v1.1.0 |

## Out of scope
- Writing B1 lesson files (CON-DE-B1-01 … 16)
- Ticket files for the tech items (the cto writes them; the pm writes the follow-up content
  tickets CON-DE-B1-CLZ / -TYP / -RDG when their types ship)
- B2 planning (v1.2.0)

## UX notes
No new screens. B1 shows under the existing "B1 · Intermediate" level header (GAM-010).

## PM self-check (2026-11-16)
1. **Structure: PASS.** 16 tickets, 5 lessons each, 80 lesson ids `de-b1-uNN-lN-<slug>`, no
   id repeated; §4c lists the same ids and titles as the tickets.
2. **Ranges: PASS.** Every L1–L4 has 5–8 items, every L5 has 4–6, the checkpoint 2.
3. **Grammar list: PASS.** Every point named in the brief is placed: Präteritum (U2),
   relative clauses (U3, U6), passive (U9, U12), Konjunktiv II for politeness (U1) and wishes
   (U10), zu-infinitive (U5, U16), genitive (U11), two-part connectors (U14), n-declension
   (U7), adjective endings in all cases (A2 U6, U6, U13), verbs with prepositions and `da- /
   wo-` (U4), Plusquamperfekt (U12); plus `obwohl`, `damit`, `um … zu`, `als / wenn`,
   `nachdem / bevor`, `während / seitdem / bis`, indirect questions, `lassen`, Futur I with
   `wohl`.
4. **Introduce, then recycle: PASS by plan.** Every coverage-map row has at least 2 later
   units with a duty of at least 2 exercises each (≥ 4 planned later uses; QA needs ≥ 3).
   The last row (U16) is recycled in its own checkpoint.
5. **Inventory: PASS with residual risk.** All A1 and A2 appendices and both QA tickets were
   read. About 110 B1 appendix words were searched in the A1 / A2 tickets: none is already
   taught, except the new meanings, which are marked. Seeds in the lesson outlines use only
   taught words or name the word to avoid. Residual risk: lesson files may contain allowed
   extras I didn't search for; the wave-1 lexical scan catches those.
6. **Exercise types: PASS.** No criterion in any unit ticket needs a type other than MC,
   word bank, match pairs and listen.
7. **Safety: PASS.** No brands, real events, legal, medical, tenancy, consumer or
   migration claims, alcohol or religious holidays in any ticket; each risky unit (U6, U7,
   U8, U11, U12, U14, U15, U16) has its own safety criterion (CDS-26).
8. **Not done here:** the B1-T5 fit check (needs the preview; the pm runs it before wave 1);
   tech ticket files (cto). Every German seed sentence still needs the writers' and the
   native reviewer's check.

## Review
_(cto / orchestrator notes on the plan go here)_

## B1-T5 fit check result (orchestrator, 2026-11-16, build of `main` at `e6a5e47`)
**PASS.** Checked with Chromium at 375 × 667 on the production build, using the LES-013 tip card
and a German word-bank exercise:
- A **240-character tip** in the tip card wraps inside the card, with no horizontal scroll and
  "Start" fully visible.
- A **110-character prompt** above a word bank with **17 tiles** (3 answer tiles plus 14 extra,
  up to `Krankenversicherung`, 19 characters): no horizontal scroll, and "Check" stays visible.
  The tiles that don't fit scroll inside the exercise area under the fixed Check bar.
- With the **feedback panel open** ("That's right!"), no horizontal scroll and "Continue" is visible.

So CDS-20 / CDS-21 (110-character prompts, 240-character tips) can be used, and B1 writing may
start. Caveat for writers: with more than ~12 tiles and a 3-line prompt, the last tile row sits
below the fold until the learner scrolls. Keep B1 word banks to 14 tiles or fewer where possible
(CDS-27 already caps distractors).
