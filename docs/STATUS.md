# Project status

**Last update:** 2026-11-15 ~01:20 Europe/Berlin (scheduled 01:00 run, in progress)
**Version on `main`:** 0.2.0 · **Course priority:** German (en-de), A1 → C1 (owner request;
Spanish stays loadable but hidden)
**Current milestone:** release of German A1 (v0.3.x) and A2 (v0.5.0): all content is written
and merged, the A2 QA and LES-014 are in the merge queue. v0.4.0 resumes after the release.

## Where things stand
- **On `main`:** app shell, PWA, onboarding, lesson engine with 4 exercise types, gamification
  (XP, streaks, hearts, daily goal, skill path), v0.2.0 release (#48), German market analysis
  and A1–C1 curriculum (#51), German course support and CEFR levels in the contracts (#52),
  **complete German A1: 12 units, 60 lessons** (#53) and its QA pass (#54).
- **Also merged since:** PLT-024 German onboarding (#56), GAM-010 CEFR path headers (#57),
  LES-013 lesson tip card (#58), German A2 plan and tickets (#59), **German A2 Units 1–14,
  70 lessons** (#60, #61, #62, #63).
- **Queued with the `cto` (in order):**
  1. `docs/con-de-a2-qa`: A2 QA pass (28 exercise fixes, appendix updates, scripted playthrough
     of 16 A2 lessons at 375×667 with 0 issues)
  2. #55 `feature/les-014-german-audio-tiles`: German voice fallback, authored-case tiles
  3. `docs/status-2026-11-15-0015`: this status and the README refresh (German media)
- **In progress (`pm`):** `docs/pm-acc3-german-release-acceptance`: acceptance of v0.3.0–v0.3.3
  and v0.5.0, PD-053 (A2 word-order rule), release recommendation.

## Handoff
- Merge the queue above. Then the `cto` cuts the release(s) the `pm` recommends in PM-ACC3
  (version bump + CHANGELOG on `chore/release-vX.Y.Z`). Tag push returns 403, so tags stay an
  owner item.
- **Next work after the release:** v0.4.0 (accounts & sync) resumes; `pm` plans German B1
  (curriculum §, tickets, appendices, as for A2) and B1 writing starts in waves of 4 units;
  optional CTO-009 → LES-015 (cloze).
- Local worktrees from this run can be removed once their branches are merged:
  `../lingo-de2-*`, `../lingo-pt`, `../lingo-acc`, `../lingo-status`.

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
- 2026-11-15 01:00 run: A2 Units 13–14 written. All A2 merged (#60–#63). A2 QA pass done
  and playtested. README refreshed for German (capture script now plays German Lesson 1).
  Release acceptance started.
