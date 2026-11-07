# Project status

**Last update:** 2026-11-07 ~11:10 Europe/Berlin (owner-attended session, after the 01:06 scheduled run)
**Current phase:** Phase 1 — Architecture (KICKOFF), autonomous mode with 3-hour long runs
**Current milestone:** pre-`v0.1.0` (no ROADMAP.md yet)

## Merged today
- #3 BRAND-001 — Polyglow / Lumi adopted, `docs/product/decisions.md` (PD-001…PD-003).
- #4 CTO-001 — Next.js scaffold, tooling and CI (typecheck/lint/test/build green).
- #5 CHORE-003 — long runs (up to 3 h, whole features, handoff/resume) in `ORCHESTRATOR.md`.

## Handoff
_(none — nothing unfinished)_

## Next steps (next run, as one long run)
1. `cto`: finish Phase 1 in one go — CTO-002 (`docs/architecture/ARCHITECTURE.md` + all
   contracts in `/src/contracts` with zod), CTO-003 (Supabase schema, RLS, seed — local/mock,
   no keys needed), CTO-004 (shared UI primitives in `/src/components/ui`).
2. `pm`: `docs/product/ROADMAP.md` (v0.1.0 MVP foundation, v0.2.0 first playable lesson …),
   tickets in `docs/product/tickets/`, and the first course unit in `/content/`.
3. `cto` adds technical notes/owners to tickets; then devs start building in parallel.

## Blockers
- Unattended runs were blocked from opening/merging PRs by the permission classifier
  (01:06 run). Owner is adding `.claude/settings.json` with allow rules for the GitHub PR
  tools, git and npm. If the next run is still blocked, it pushes branches and records it here.

## Waiting on owner (non-blocking)
- Trademark / domain / handle check for "Polyglow" (PD-001).
- PRD Q6 minimum age / consent copy; Q7 TTS provider licence (see `docs/product/decisions.md`).
- Owner email is hard-coded in CLAUDE.md / ORCHESTRATOR.md (public if the repo is public).
- Stale branch `docs/status-2026-11-07-0106` (superseded by this update) can be deleted.

## Run log
- 2026-11-06 — Agent team files added; scheduled runs set.
- 2026-11-06 (manual test run) — Phase 0. `pm` wrote PRD, user stories (51), branding proposals.
- 2026-11-06 (owner) — CHORE-001 / CHORE-002 merged: PR-only flow, autonomous loop, owner identity.
- 2026-11-07 01:06 — `pm` BRAND-001, `cto` CTO-001 scaffold (all checks green). PR
  create/merge denied by the permission classifier; branches pushed.
- 2026-11-07 (owner-attended) — PRs #3, #4, #5 opened and squash-merged; scheduled prompts
  updated for 3-hour runs.
