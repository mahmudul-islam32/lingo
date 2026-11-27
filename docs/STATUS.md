# Project status

**Last update:** 2026-11-26 ~04:15 Europe/Berlin (scheduled 01:00 run)
**Version on `main`:** **0.5.4** (#110: goal date) · v0.5.5 "Smart review" in progress ·
**Course:** German A1 + A2 on `main`; B1 Units 1–13 written (unmerged by plan, PD-063)

## Where things stand
- **v0.5.4 "Goal date" released (#110, `6a84047`).** Target level and date in Profile, a Learn
  card and a results row. The pm rejected PLT-027 on AC 10 (dead link on courses without
  levels); FIX-014 (#112) fixed it and was accepted (PM-011 #111, PM-012 #113). Owner-merge
  breakages fixed: FIX-012 (#107, sound toggle name), FIX-013 (#109, pwa-prod timeout).
  Full e2e 156/156 on a production build.
- **v0.5.5 "Smart review" + per-course goal plan:** tickets written (#113, PD-079–082).
  Contracts CTO-018 (#114, ADR-018) and CTO-019 (#115, ADR-019) merged. LES-023 (#116, review
  player and per-exercise outcomes) and GAM-014 (#117) merged. PLT-028, GAM-015 and PLT-029 are
  reviewed PRs (see Handoff).

## Handoff
- **v0.5.5, merge in this order:**
  1. **#118 PLT-028** (changes requested): `goal-date-per-course.spec.ts:59` fails axe
     color-contrast on mobile CI, on the telc B1 level options in the goal-date dialog. It passes
     locally. dev-platform should check for dimmed options or wait for the dialog to finish fading
     in; the fix steps are in the PR description.
  2. **#119 GAM-015** (approved): merge right before PLT-029 so Practice never links to a missing page.
  3. **#120 PLT-029** (approved): update on main, re-check the revert guard, fresh CI, then the
     full e2e including pwa-prod.
  4. pm acceptance of v0.5.5, then `chore/release-v0.5.5`.
- **v0.5.5 follow-ups:**
  - cto: remove `SettingsPatch.goalPlan` (ADR-018 §5); add a content check for exercise ids
    unique within a course.
  - dev-lessons: a "Back" label option on `LessonPlayerError` for `/review`.
  - dev-platform: precache lesson files per course instead of all 1,614 at install.
- **Next milestones:** v0.5.6 Life in Germany topics; marketing launch-kit refresh for
  v0.5.4/v0.5.5.
- **B1 Wave 4:** Units 14–16 (with the B1 checkpoint) go on `docs/con-de-b1-units-13-16`, then
  CON-DE-B1-QA. Merge after v1.0.0 (PD-063).
- **v0.6.0 accounts and sync** waits for the owner's hosted Supabase. CTO-018 and CTO-019 are
  already merged ahead of it, as required.
- **v1.0.0 launch polish:** recorded audio (TTS licence), speaking, native review.

## Blockers
- Usage limits end most runs early; agents are resumed after each reset.
- Disk is tight (~3 GB free): delete `.next` and `test-results` in worktrees after use.

## Waiting on owner (non-blocking)
- Tags and GitHub releases: `9d885c9` as `v0.5.0`, `3627efc` as `v0.5.2`, `11b5d2d` as
  `v0.5.3`, `6a84047` as `v0.5.4` (and `v0.1.0` / `v0.2.0`). Agents don't create tags or releases.
- Go-ahead to delete merged branches (agents are blocked from deleting branches).
- **telc courses (TELC-001..005):** confirm the source and licence of the questions and images.
  The commits say they come "from the telc app". CLAUDE.md requires original or licensed
  content.
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
- 2026-11-25 (owner "resume run"): v0.5.4 integrated, FIX-012/013 fixed owner-merge breakages, PM-011 rejected PLT-027 → FIX-014.
- 2026-11-26 01:00 run: #111–#117 merged; **v0.5.4 released**; v0.5.5 contracts, LES-023 and GAM-014 merged; PLT-028/GAM-015/PLT-029 open (#118–#120).
