# Project status

**Last update:** 2026-11-16 ~01:20 Europe/Berlin (scheduled 01:00 run, in progress)
**Version on `main`:** 0.2.0 → **0.5.0** (release PR in progress) · **Course:** German (en-de),
A1 and A2 complete (26 units, 130 lessons), QA'd and playtested
**Current milestone:** v0.5.0 release (German A1 + A2, combined per PD-054). Next: v0.5.1 (cloze),
v0.6.0 (accounts & sync, renumbered from v0.4.0), v1.1.0 German B1 (planning now).

## Where things stand
- **Merged in the 2026-11-15 run (#54–#67):** German A1 QA, PLT-024 German onboarding, GAM-010
  CEFR path, LES-013 tip card, A2 plan, **A2 Units 1–14** (#60–#63), A2 QA (#64), README refresh
  (#65), release acceptance PM-ACC3 (#66), FIX-003 hearts fallback (#67), LES-014 German voice (#55).
- **FIX-004** (A1 release-candidate playthrough on `e6a5e47`): PASS, recorded on
  `docs/fix-004-a1-playthrough`.
- **This run:**
  - `cto`: merge FIX-004 docs, then the `chore/release-v0.5.0` PR (version + CHANGELOG). The tag
    and GitHub release are left to the owner.
  - `pm`: CON-DE-B1-PLAN on `docs/pm-007-german-b1-plan` (B1 curriculum §4c, 16 unit tickets with
    fixed appendices, tech needs list, PD-056+).
  - `dev-lessons`: FIX-005 (Lumi ember on the error / audio-unavailable states) on
    `fix/fix-005-lumi-ember-states`.

## Handoff
- Resume any of the three items above that isn't merged: the branches are pushed, and the cto
  merges them in this order: FIX-004 docs → release v0.5.0 → FIX-005 → B1 plan.
- Next: CTO-009 → LES-015 (cloze, v0.5.1); the cto's tech proposals from the B1 plan; then B1
  writing in waves of 4 units. v0.6.0 accounts needs the owner's hosted Supabase; until then,
  local/mock work only.
- P3 follow-up (dev-gamification): `useHearts` and FIX-003 both warn on one failed hearts read.

## Blockers
- The 5-hour usage limit ends most runs early; agents are resumed after the reset.

## Waiting on owner (non-blocking)
- Push tags `v0.1.0` / `v0.2.0` / `v0.5.0` and create the GitHub releases (tag push returns
  HTTP 403 for the agents; v0.5.0 notes will be in CHANGELOG.md).
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
- 2026-11-15 01:00 run: A2 Units 13–14 written. All A2 merged (#60–#63). A2 QA pass done
  and playtested. README refreshed for German (capture script now plays German Lesson 1).
  Release acceptance started.
- 2026-11-15 01:00 run: A2 Units 13–14 written; #60–#67 and #55 merged; A2 QA and FIX-004 playthroughs PASS.
- 2026-11-16 01:00 run: v0.5.0 release PR, B1 plan, FIX-005 (in progress).
