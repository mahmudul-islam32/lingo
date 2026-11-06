# Kickoff guide — running the 5-agent team in Claude Code

> **Autonomous mode:** the team now runs on its own via `ORCHESTRATOR.md`. The
> "You review" gates below are decided by the agents themselves (`pm` for
> product, `cto` for technology) and logged in `docs/DECISIONS.md`.

## 1. Set up the folder
Put these files in an empty project folder (and run `git init`):
```
CLAUDE.md
KICKOFF.md
.claude/agents/pm.md
.claude/agents/cto.md
.claude/agents/dev-lessons.md
.claude/agents/dev-gamification.md
.claude/agents/dev-platform.md
```
Replace `[APP_NAME]` and `[MASCOT]` in `CLAUDE.md` with your own brand (or ask the PM agent
to propose options).

## 2. Open Claude Code in that folder
Your main session is the **orchestrator** (you are the CEO). Paste the prompts below one
phase at a time and review the output before moving on.

---

### Phase 0 — Product
> Use the **pm** agent. Read CLAUDE.md. Write `/docs/product/PRD.md` and
> `/docs/product/user-stories.md` for the MVP. Propose 3 original app names and a mascot
> concept. Don't write tickets yet.

✅ **You review:** is the scope right? Pick the name and mascot, update `CLAUDE.md`.

### Phase 1 — Architecture
> Use the **cto** agent. Read CLAUDE.md and the PRD. Do CTO-001 (scaffold repo and tooling)
> and CTO-002 (ARCHITECTURE.md + all contracts in /src/contracts with zod schemas).
> Then do CTO-003 (Supabase schema, RLS, seed) and CTO-004 (shared UI primitives).

✅ **You review:** read `ARCHITECTURE.md` and `/src/contracts`. This is the most important
review of the whole project.

### Phase 2 — Tickets
> Use the **pm** agent to break the MVP into tickets in `/docs/product/tickets/`
> (LES-, GAM-, PLT-, CON-). Then use the **cto** agent to add technical notes and
> assign an owner to each ticket.

> Use the **pm** agent to write the first course unit in `/content/` (5 original lessons),
> validated against the contracts schema.

### Phase 3 — Build (parallel)
Start one developer per independent ticket, ideally each in its own git worktree:
> Use the **dev-platform** agent to implement PLT-001.
> Use the **dev-lessons** agent to implement LES-001.
> Use the **dev-gamification** agent to implement GAM-001.

Tip: start with **one** developer first, check the quality, then go parallel.

### Phase 4 — Review loop (after each ticket)
> Use the **cto** agent to review the branch for <TICKET-ID>, open a pull request,
> and squash-merge it into `main` if approved (or write change requests).
> Then use the **pm** agent to do the acceptance review for <TICKET-ID>.

Repeat Phase 3 → 4 until the MVP is done, then plan Phase 2 features with the PM.

---

## 3. Tips
- **Contracts first.** No dev starts until `/src/contracts` exists and you approved it.
- **Small tickets** finish in one session; big ones drift.
- **Use plan mode** for bigger tickets so the agent shows you its plan before coding.
- **Contract changes** go through `/docs/architecture/contract-requests.md` → CTO.
- **Watch usage.** Parallel agents consume a lot; only run them in parallel when
  tickets are truly independent.
- **Original brand only.** No Duolingo name, owl, artwork, sounds or course content.
