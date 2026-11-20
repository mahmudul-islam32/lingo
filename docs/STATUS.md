# Project status

**Last update:** 2026-11-20 ~04:00 Europe/Berlin (scheduled 01:00 run)
**Version on `main`:** **0.5.3** (#94: redesign v2) · **Course:** German A1 + A2 on `main`;
B1 Units 1–13 written (unmerged by plan, PD-063)

## Where things stand
- **Owner request (2026-11-19), shipped:** the whole app restyled to the owner's design (light
  indigo and coral, Bricolage Grotesque and DM Sans, 3D buttons and cards, a 4-tab nav with
  Practice and Leagues, Profile with real stats). #86–#93 plus acceptance #95 and FIX-011 #96;
  **released as v0.5.3 (#94)**. Full e2e 142/142 on a production build.
- **README showcase:** re-captured from the new design on this branch.
- **B1 content:** `docs/con-de-b1-units-01-04` → `05-08` → `09-12` → `13-16` (Unit 13 done).
  Validated and pushed, not merged until v1.0.0.

## Handoff
- **B1 Wave 4:** Units 14–16 (with the B1 checkpoint) go on `docs/con-de-b1-units-13-16`, then CON-DE-B1-QA.
- **v0.6.0 accounts and sync** waits for the owner's hosted Supabase.
- **v1.0.0 launch polish:** recorded audio (TTS licence), speaking, native review.

## Blockers
- Usage limits end most runs early; agents are resumed after each reset.

## Waiting on owner (non-blocking)
- Tag `9d885c9` as `v0.5.0`, `3627efc` as `v0.5.2` and `11b5d2d` as `v0.5.3` (and `v0.1.0` / `v0.2.0`) and publish the GitHub releases, using
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
- 2026-11-18 01:00 run: FIX-006/007 and the B1 tech plan merged; B1 Units 5–10 written.
- 2026-11-18 (owner request): start level and earning hearts built and merged (#79–#83).
- 2026-11-19 01:00 run: verified #79–#83 on main (e2e 120/120); B1 Units 11–12 written.
- 2026-11-19 (owner request): redesign v2 built (CTO-016, PLT-026, GAM-012, LES-021).
- 2026-11-20 01:00 run: redesign merged (#86–#96) and released as v0.5.3; B1 Unit 13 written; README re-captured.
