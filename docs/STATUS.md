# Project status

**Last update:** 2026-11-14 ~01:20 Europe/Berlin (scheduled 01:00 run, in progress)
**Version on `main`:** 0.2.0 · **Course priority:** German (en-de), A1 → C1 (owner request;
Spanish stays loadable but hidden)
**Current milestone:** German A1 release (v0.3.x), then German A2 (v0.5.0). v0.4.0 (accounts &
sync) is paused until German A1 ships.

## Where things stand
- **On `main`:** app shell, PWA, onboarding, lesson engine with 4 exercise types, gamification
  (XP, streaks, hearts, daily goal, skill path), v0.2.0 release (#48), German market analysis
  and A1–C1 curriculum (#51), German course support and CEFR levels in the contracts (#52),
  **complete German A1: 12 units, 60 lessons** (#53) and its QA pass (#54).
- **Built, waiting for the `cto` merge queue (in this order):**
  1. `feature/plt-024-german-onboarding-learn`: German as the default course in onboarding and Learn
  2. `feature/gam-010-path-levels`: CEFR level headers on the skill path (follow-up test
     patch for the renamed nodes goes with it)
  3. `feature/les-014-german-audio-tiles`: German audio and tile handling
  4. `feature/les-013-tip-card`: lesson tip card (the e2e must press "Start"; needs axe-core)
  5. `docs/pm-006-german-a2-plan`: A2 curriculum, tickets CON-DE-A2-01..14/QA, decisions
  6. `docs/con-de-a2-units-01-04`: **German A2 Units 1–4**, 20 lessons and 240 exercises.
     Content tests are green. It includes the 20 loader lines in `src/lib/content/bundled-content.ts`,
     which the cto reviews as their own.

## Handoff
- **Merge queue above:** the `cto` resumes it in order. After each merge, rebase the next
  branch on `main` and re-run the revert guard (`git diff --stat origin/main <head>` touches
  only the ticket's files).
- **German A2 Wave 2 (Units 5–8), being written:** worktrees `../lingo-de2-u05` … `u08`
  (local branches `docs/con-de-a2-0N-wip`), with the tickets on `docs/pm-006-german-a2-plan`.
  - When the lessons and the scratchpad fragments are done, the orchestrator adds the units to
    `course.json` with level A2, adds the loader lines, runs the content tests and pushes
    `docs/con-de-a2-units-05-08`.
  - If a unit is unfinished at run end, push its wip branch as is.
- **Then:** A2 Wave 3 (Units 9–11), Wave 4 (Units 12–14), CON-DE-A2-QA. Then German A1
  release acceptance (`pm`) and release (`cto`). Then B1 planning.

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
- 2026-11-14 01:00 run: resumed the cto merge queue and the A2 Wave 2 writers (in progress).
