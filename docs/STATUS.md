# Project status

**Last update:** 2026-11-15 ~01:20 Europe/Berlin (scheduled 01:00 run, in progress)
**Version on `main`:** 0.2.0 · **Course priority:** German (en-de), A1 → C1 (owner request;
Spanish stays loadable but hidden)
**Current milestone:** German A1 release (v0.3.x), then German A2 (v0.5.0). v0.4.0 (accounts &
sync) is paused until German A1 ships.

## Where things stand
- **On `main`:** app shell, PWA, onboarding, lesson engine with 4 exercise types, gamification
  (XP, streaks, hearts, daily goal, skill path), v0.2.0 release (#48), German market analysis
  and A1–C1 curriculum (#51), German course support and CEFR levels in the contracts (#52),
  **complete German A1: 12 units, 60 lessons** (#53) and its QA pass (#54).
- **Also merged since:** PLT-024 German onboarding (#56), GAM-010 CEFR path headers (#57),
  LES-013 lesson tip card (#58), German A2 plan and tickets (#59).
- **Open PRs / queued with the `cto` (in order):**
  1. #60 `docs/con-de-a2-units-01-04`: German A2 Units 1–4 (20 lessons)
  2. #55 `feature/les-014-german-audio-tiles`: German voice fallback, authored-case tiles
  3. `docs/con-de-a2-units-05-08`: A2 Units 5–8 (stacked; merge only its delta)
  4. `docs/con-de-a2-units-09-11`: A2 Units 9–11 (stacked)
  5. `docs/con-de-a2-units-12-14`: A2 Units 12–14 (Unit 12 pushed; 13 and 14 being finished)
  - Each content branch adds its lessons, units in `course.json` (level A2) and loader lines in
    `src/lib/content/bundled-content.ts`. Content tests are green on each.

## Handoff
- **Merge queue above:** the `cto` merges in order. The A2 content branches are stacked
  (01-04 → 05-08 → 09-11 → 12-14). After each squash-merge, rebuild the next one on `main`
  with only its own delta, then run the revert guard.
- **A2 Wave 4:** Unit 13 written (worktree `../lingo-de2-u13`), Unit 14 in progress
  (`../lingo-de2-u14`, lessons 1–2 done). The orchestrator adds both to
  `docs/con-de-a2-units-12-14` with `scratchpad/assemble.py 13 14`, runs the content tests and pushes.
- **Then:** CON-DE-A2-QA (cross-unit pass; open questions collected in each ticket's
  "Uncertainties": missing `unser`, `sagen`, `die Nummer`, `bleiben`; word-order acceptance policy).
  Then German A1/A2 release acceptance (`pm`) and release (`cto`). Then B1 planning (`pm`).

## Blockers
- The 5-hour usage limit has cut the last runs short. Agents are resumed (not restarted)
  after the reset, and fewer writers run in parallel.

## Waiting on owner (non-blocking)
- Push tags `v0.1.0` / `v0.2.0` (tag push returns HTTP 403 for the agents).
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
- 2026-11-15 01:00 run: resumed the cto queue and the Unit 13–14 writers (in progress).
