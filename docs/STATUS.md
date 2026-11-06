# Project status

**Last run:** 2026-11-06 (manual test run requested by owner)
**Current phase:** Phase 0 — Product ✅ done (pending owner review of branding)
**Next step:** Phase 1 — `cto` agent does CTO-001 (scaffold repo + tooling) and
CTO-002 (`docs/architecture/ARCHITECTURE.md` + contracts in `/src/contracts` with zod).
CTO-003 (Supabase) and CTO-004 (UI primitives) follow in a later run.
**Blockers:** none.

## Needs owner review
_Answer inline (e.g. "✅ approved" or your alternative); the next run applies it._

1. **App name + mascot (KICKOFF Phase 0 gate).** Provisional choice: **Polyglow**
   with mascot **Lumi** (a small paper lantern whose glow grows with your streak;
   palette midnight indigo + amber/gold). Alternatives: Wordsprout, Tandu; backup
   mascot Mo the hermit crab. See `docs/product/branding-proposals.md`.
   ⚠️ Trademark / domain / handle availability **not checked** — owner must verify.
   `CLAUDE.md` still has `[APP_NAME]`/`[MASCOT]` placeholders; they will be replaced
   once you confirm. Reversible: until then, code uses a single config constant.
   - Owner answer:
2. **MVP scope.** en → es (neutral Latin American Spanish); 1 unit × 5 lessons;
   exercise types MC, word-bank translate, match pairs, listen (+ optional speak);
   leagues/leaderboards deferred to Phase 2. See `docs/product/PRD.md`.
   - Owner answer:
3. **Open questions Q6 (minimum age 13+ / consent copy) and Q7 (TTS provider
   licence)** in `docs/product/PRD.md` need owner input. Q2–Q5 will be decided by
   pm/cto with defaults listed in the PRD.
   - Owner answer:

## Run log
- 2026-11-06 — Agent team files added; scheduled runs set for 19:39 and 00:00 Europe/Berlin.
- 2026-11-06 (manual test run) — Phase 0. Agents: `pm`. Created
  `docs/product/PRD.md`, `docs/product/user-stories.md` (51 stories),
  `docs/product/branding-proposals.md`. Provisional branding Polyglow/Lumi logged for
  owner review. Remote `main` did not exist; created from local checkout and pushed.
