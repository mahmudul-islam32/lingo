# Project status

**Last update:** 2026-11-17 ~01:30 Europe/Berlin (scheduled 01:00 run, in progress)
**Version on `main`:** **0.5.0** (released in #69: German A1 + A2) · **Course:** German (en-de),
A1 and A2 complete (26 units, 130 lessons)
**Current milestone:** v0.5.1 (cloze: code merged, content follows) and v1.1.0 German B1 (planned;
writing started). v0.6.0 accounts & sync waits for the owner's hosted Supabase.

## Where things stand
- **Merged since the last status (#68–#74):** FIX-004 A1 playthrough (#68), **release v0.5.0** (#69),
  CTO-009 cloze contract (#71), LES-015 cloze component (#72), German B1 plan with 16 unit
  tickets and PD-056..063 (#73), status (#74).
- **B1-T5 fit check:** PASS (110-character prompts and 240-character tips fit at 375 × 667),
  recorded in CON-DE-B1-PLAN.md.
- **Open:**
  - #70 FIX-005 (Lumi ember states): changes requested, because the error-state e2e must work on
    the production build. dev-lessons is fixing it.
  - B1 Units 1–2 are being written (`../lingo-b1-u01`, `../lingo-b1-u02`, local branches
    `docs/con-de-b1-0N-wip`).

## Handoff
- **FIX-005:** the cto re-reviews and merges once the e2e passes on the production build.
- **B1 writing (PD-063: written now, merged into `main` only after v1.0.0):**
  - Wave 1 is Units 1–4. Units 1–2 are in progress; Units 3–4 are next.
  - Each finished unit goes onto `docs/con-de-b1-units-01-04`, built like the A2 branches with
    `scratchpad/assemble.py`, adapted for level B1, then validated (content tests, the mechanical
    QA script, the answer-buildability check) and pushed. Not merged until v1.0.0.
- **Next for the cto:** assign ticket ids for the B1 tech needs (reading passage, grammar note
  card, typed answers; all non-blocking). Decide the cloze e2e follow-up when the first cloze
  content lands.
- **Next for the pm:** confirm LES-015 AC 9 (cloze sentence audio only after Check); plan the
  first cloze content follow-up (new exercise ids only).
- **P3:** `useHearts` and FIX-003 both warn on one failed hearts read (dev-gamification).

## Blockers
- Usage limits: the account hit its weekly limit on 2026-11-16 (reset 2026-11-17 09:00 UTC) and
  the 5-hour limit most nights. Agents are resumed after the reset.

## Waiting on owner (non-blocking)
- Tag `9d885c9` as `v0.5.0` (and `v0.1.0` / `v0.2.0`) and publish the GitHub releases, using
  the `[0.5.0]` section of CHANGELOG.md as notes. Agents don't create tags or releases.
- PR #35 (CHORE-005) awaits the owner.
- Native-speaker review of German content: the lists are in each ticket's
  "Uncertainties / needs native review".
- Hosted Supabase project and keys (v0.4.0, paused).
- TTS provider licence (PRD Q7): German audio falls back to "Audio isn't available" + Skip.
- Trademark / domain check for "Polyglow" (PD-001).

## Run log
- 2026-11-06 … 11-11: Phase 0–1, v0.1.0 and v0.2.0 built and merged (#2–#50).
- 2026-11-12: owner pivot to German. Market analysis and curriculum, contracts, A1 Units 1–12 (#51–#53).
- 2026-11-13 01:00 run: A1 QA merged (#54). A2 plan written, A2 Units 1–4 written and pushed.
  The run was cut short by the usage limit.
- 2026-11-14 01:00 run: merged #56–#59. A2 Units 5–12 written, validated and pushed. Cut short by the usage limit.
- 2026-11-15 01:00 run: A2 Units 13–14 written; #60–#67 and #55 merged; A2 QA and FIX-004 playthroughs PASS.
- 2026-11-16 01:00 run: v0.5.0 released (#69), cloze contract and component built, B1 plan written,
  FIX-005 built. Stopped by the weekly usage limit.
- 2026-11-17 01:00 run: #68–#74 merged; B1-T5 fit check PASS; FIX-005 rework; B1 Units 1–2 writing.
