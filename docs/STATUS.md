# Project status

**Last update:** 2026-11-19 ~01:50 Europe/Berlin (scheduled 01:00 run)
**Version on `main`:** 0.5.0, plus v0.5.1 (cloze) and v0.5.2 (start level and earning hearts)
merged and not yet released · **Course:** German A1 + A2 on `main`; B1 Units 1–12 written
(unmerged by plan)

## Where things stand
- **Owner request (2026-11-18), shipped:** start at a later level and earn hearts by answering
  correctly. CTO-015 (#80), GAM-011 (#81), PLT-025 (#82), LES-020 (#83), docs PM-008 (#79).
  Checked by the orchestrator on `main` 66b2e4d: 1,925 unit tests, typecheck, lint, build, and
  **full e2e 120/120 on a production build**.
- **Also merged:** FIX-006 path flake and single hearts warning (#76), CTO-010 B1 tech plan with
  CTO-010..014 and ADR-010..012 (#77), FIX-007 offline-banner axe flake (#78).
- **B1 content (PD-063: merges only after v1.0.0)**, each wave stacked on the previous one,
  validated (content tests, buildability, case pairs, duplicates) and pushed:
  - `docs/con-de-b1-units-01-04`: Units 1–4
  - `docs/con-de-b1-units-05-08`: Units 5–8
  - `docs/con-de-b1-units-09-12`: Units 9–12 (course.json v24, 425 content tests, 2,776 answers)

## Handoff
- **Release:** the cto cuts **v0.5.2** (cloze contract and component, start level, earning
  hearts, FIX-005..007) via `chore/release-v0.5.2`: version bump and CHANGELOG. No tag; the owner tags.
- **README media:** capture.mjs (this branch) now handles the start-level onboarding step. The
  next run re-captures the media, including the level step and the Practice badge.
- **B1 Wave 4 (Units 13–16, including the B1 checkpoint):** stack on `docs/con-de-b1-units-09-12`;
  then CON-DE-B1-QA. The writers' vocabulary requests and the word-order questions are in each
  B1 ticket's self-review.
- **pm:** add ticket files FIX-006 and FIX-007; confirm LES-015 AC 9 (cloze audio after Check);
  plan the first cloze content.

## Blockers
- Usage limits (5-hour and weekly) end most runs early; agents are resumed after each reset.

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
- 2026-11-18 01:00 run: FIX-006/007 and the B1 tech plan merged; B1 Units 5–10 written.
- 2026-11-18 (owner request): start level and earning hearts built and merged (#79–#83).
- 2026-11-19 01:00 run: verified #79–#83 on main (e2e 120/120); B1 Units 11–12 written.
