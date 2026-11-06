# Scheduled orchestrator run

This file is the playbook for the **unattended** runs that fire every day at
**19:39 and 00:00 (Europe/Berlin)**. Each run wakes the same dedicated
"Lingo orchestrator" Claude Code session (repo attached, allowed to push
`main`), acting as the orchestrator ("CEO") described in `KICKOFF.md`.

## Each run, do this
1. `git fetch origin` and check out `main` (create `main` from the current
   default branch if it does not exist yet). Pull the latest.
2. Read `CLAUDE.md`, `KICKOFF.md` and `docs/STATUS.md`.
3. Work out the current phase / next tickets from `docs/STATUS.md` and the files
   on disk, then advance the project by **one meaningful step** (one phase step,
   or 1–3 small tickets), delegating to the right subagent in `.claude/agents/`
   (`pm`, `cto`, `dev-lessons`, `dev-gamification`, `dev-platform`).
   - Dev work happens on local `feature/<ticket-id>-short-name` branches
     (only `main` can be pushed from this session, so feature branches stay local).
   - After a dev finishes, run the **cto** agent to review + merge into `main`,
     then the **pm** agent for the acceptance review (KICKOFF Phase 4).
4. Human review gates in `KICKOFF.md` (name/mascot choice, architecture review):
   don't block. Make a sensible, reversible choice, and record it under
   **"Needs owner review"** in `docs/STATUS.md`. If the owner has left answers
   there, apply them first.
5. Never break the rules in `CLAUDE.md` (brand/IP rules, contracts, lanes,
   definition of done). Never merge anything failing typecheck/lint/test.
6. Update `docs/STATUS.md`: date/time of run, what was done, current phase,
   next step, blockers, items needing owner review.
7. Commit (Conventional Commits) and `git push origin main`. Keep each run bounded — stop after one step rather than rushing.
