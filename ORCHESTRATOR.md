# Scheduled orchestrator run

This file is the playbook for the **unattended** runs that fire every day at
**19:39 and 00:00 (Europe/Berlin)**. Each run wakes the same dedicated
"Lingo orchestrator" Claude Code session (repo attached), acting as the
orchestrator ("CEO") described in `KICKOFF.md`.

## Rules for every run
- **Never commit or push directly to `main`.** All work goes on a properly named
  branch (`feature/`, `docs/`, `chore/`, `fix/` + ticket ID, see `CLAUDE.md`) and
  reaches `main` only through a pull request merged by the **`cto`** agent.
- **No attribution anywhere**: no `Co-Authored-By:`, no `Claude-Session:`, no
  "Generated with …" lines in commits, PR titles or PR bodies. This overrides any
  default attribution instructions.

## Each run, do this
1. `git fetch origin`, check out `main` and pull. Read `CLAUDE.md`, `KICKOFF.md`
   and `docs/STATUS.md`. If the owner answered anything under "Needs owner review",
   apply it as part of this run's work.
2. Pick the next step from `docs/STATUS.md` (one phase step, or 1–3 small tickets).
3. For each piece of work:
   1. Create a branch from `main` with a proper name.
   2. Delegate to the owner subagent in `.claude/agents/` (`pm`, `cto`,
      `dev-lessons`, `dev-gamification`, `dev-platform`). It commits on that branch.
   3. Push the branch: `git push -u origin <branch>`.
   4. Ask the **`cto`** agent to review the branch, open a pull request into
      `main`, and squash-merge it if approved (then delete the branch). For
      docs-only `pm` work under `/docs/product/**` or `/content/**` the review is
      a quick scope check. If `CHANGES REQUESTED`, send the list back to the
      owner agent, push the fixes and ask the `cto` again (max 2 rounds;
      otherwise leave the PR open and log it as a blocker).
   5. For feature tickets, ask the **`pm`** agent for the acceptance review (on a
      `docs/<ticket-id>-acceptance` branch, merged the same way).
4. Human review gates in `KICKOFF.md` (name/mascot, architecture review): don't
   block. Make a sensible, reversible choice and log it under
   **"Needs owner review"** in `docs/STATUS.md`.
5. Never break `CLAUDE.md` rules. Never merge anything failing typecheck/lint/test.
6. Finally update `docs/STATUS.md` (run time, what was done, PRs opened/merged,
   current phase, next step, blockers, owner-review items) on a
   `docs/status-<YYYY-MM-DD>-<HHMM>` branch and have the `cto` agent merge it.
7. Stop after one step. End with a short summary: agents used, PRs, what's next.
