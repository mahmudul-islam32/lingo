# Project status

**Last update:** 2026-11-27 ~04:05 Europe/Berlin (scheduled 01:00 run)
**Version on `main`:** **0.5.5** (#125: smart review) · **Course:** German A1 + A2 on `main`;
B1 Units 1–13 written (unmerged by plan, PD-063)

## Where things stand
- **v0.5.5 "Smart review" released (#125, `c23df26`).** A Review card in Practice and a `/review`
  session replay the exercises you answered, spaced at 1/3/7/14/30 days. Each session has up to 10
  exercises, is free and works at 0 hearts. It counts for XP and streak but never completes a
  lesson. The goal date is now per course. #116–#120 and #123, pm acceptance PM-ACC6 (#124). Full
  e2e 164/164 on a production build.
- After the release: CTO-021 (#126) removed the deprecated `SettingsPatch.goalPlan`, and FIX-015
  (#127) changed the review error button to "Back".
- **Marketing:** MKT-002 (#122) refreshed the positioning and kit for v0.5.4, and added Smart
  review drafts that can be posted now that v0.5.5 is out.
- **Exam courses (PD-084):** telc B1 and Einbürgerungstest will be hidden before the public URL
  goes live (PLT-030, a v1.0.0 gate) until the owner clears their licences and exam names.

## Handoff
- **#128 CTO-022** (open): adds `docs/marketing` to `.prettierignore`. Update it on main, run CI and
  merge. Then the pm formats 2 A1 lesson files, and the cto adds `format:check` to CI.
- **v0.5.6 "Life in Germany topics"** (PD-071): the pm writes the tickets, then the build follows
  the usual flow.
- **Marketing:** check the Smart review drafts against the v0.5.5 CHANGELOG (checklist in social
  post #13). Capture new screenshots for the shot list: the goal card, the goal dialog, the
  results goal row and the Review card. Refresh the README for v0.5.4 and v0.5.5 (orchestrator).
- **dev-platform:** precache lesson files per course instead of all 1,614 at install.
- **B1 Wave 4:** Units 14–16 (with the B1 checkpoint) go on `docs/con-de-b1-units-13-16`, then
  CON-DE-B1-QA. Merge after v1.0.0 (PD-063).
- **v0.6.0 accounts and sync** waits for the owner's hosted Supabase. Its prerequisites CTO-018,
  CTO-019 and CTO-021 are merged.
- **v1.0.0:** PLT-030 (hide the exam courses), recorded audio (TTS licence), speaking, native review.

## Blockers
- Usage limits end most runs early; agents are resumed after each reset.
- Disk is tight (~3 GB free): delete `.next` and `test-results` in worktrees after use.

## Waiting on owner (non-blocking)
- Tags and GitHub releases: `9d885c9` as `v0.5.0`, `3627efc` as `v0.5.2`, `11b5d2d` as
  `v0.5.3`, `6a84047` as `v0.5.4`, `c23df26` as `v0.5.5` (and `v0.1.0` / `v0.2.0`). Agents don't
  create tags or releases.
- Go-ahead to delete merged branches (agents are blocked from deleting branches).
- **Exam courses (marketing A7/A8, PD-084):** confirm the source and licence of the telc B1
  content and the Einbürgerungstest catalogue, including the Q55 Bundestag photo. Also decide
  whether the exam names may be used publicly. Until then these courses are hidden at public launch.
- **Launch gate (marketing A1–A4):** a public URL, a domain and trademark check for "Polyglow",
  an Impressum and privacy policy, and a feedback inbox. Exact steps are in
  `docs/marketing/waiting-on-owner.md`.
- Native-speaker review of German content: the lists are in each ticket's
  "Uncertainties / needs native review".
- Hosted Supabase project and keys (v0.4.0, paused).
- TTS provider licence (PRD Q7): German audio falls back to "Audio isn't available" + Skip.

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
- 2026-11-27 01:00 run: PLT-028 CI fixed, #118–#127 merged; **v0.5.5 released**; MKT-002 kit refresh; PD-083/084; CTO-022 open (#128).
