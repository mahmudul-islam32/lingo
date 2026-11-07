# Project: Lingo-style Language Learning PWA

A gamified language-learning Progressive Web App (bite-sized lessons, XP, streaks,
hearts, skill path, leagues). Inspired by apps like Duolingo in **mechanics only**.

## ⚠️ Brand & IP rules (non-negotiable)
- Do NOT use the name "Duolingo", the owl mascot, its colors-as-brand, illustrations,
  sounds, fonts, or any of its course content.
- Our app has its own name, mascot, visual identity and original course content.
- App name: **Polyglow** (decided, see `docs/product/decisions.md` PD-001). Mascot: **Lumi** — an
  original paper-lantern character we design ourselves.

## Team & ownership
| Agent | Owns | Never touches |
|---|---|---|
| orchestrator (CEO session) | `CLAUDE.md`, `ORCHESTRATOR.md`, `KICKOFF.md`, `/.claude/agents/**`, `docs/STATUS.md` | feature code |
| `pm` | `/docs/product/**` (incl. `ROADMAP.md`, product decisions in `docs/product/decisions.md`), `/content/**` (course data) | source code |
| `cto` | `/docs/architecture/**` (technical decisions as ADRs), `/src/contracts/**`, `/supabase/**`, CI config, root tooling config, `package.json` version, `CHANGELOG.md`, releases, code review, opening and merging pull requests into `main` | feature code unless fixing a merge |
| owner (human) | `docs/OWNER-NOTES.md` — agents read it every run, never edit it | — |
| `dev-lessons` | `/src/features/lessons/**` | contracts, other features |
| `dev-gamification` | `/src/features/gamification/**`, `/src/features/path/**` | contracts, other features |
| `dev-platform` | `/src/app/**` (shell, routing), `/src/features/auth/**`, `/src/features/profile/**`, `/src/lib/offline/**`, `/src/lib/sync/**`, PWA config | contracts, other features |

Shared UI components live in `/src/components/ui/**`. Any dev may add a component;
changing an existing one requires a note in the PR description.

## Tech stack
- **Framework:** Next.js (App Router) + React + TypeScript (strict)
- **Styling:** Tailwind CSS; animations with Framer Motion
- **PWA:** Serwist (service worker), web app manifest, installable
- **Offline storage:** IndexedDB via Dexie
- **Backend:** Supabase (Postgres, Auth, Realtime for leaderboards, Row Level Security)
- **Audio:** Web Speech API (speech recognition) + pre-generated TTS audio files
- **State:** Zustand for client state; TanStack Query for server state
- **Testing:** Vitest + React Testing Library (unit), Playwright (e2e)
- **Lint/format:** ESLint + Prettier

## Folder structure
```
/docs
  /product        PRD, user stories, tickets (pm)
  /architecture   ARCHITECTURE.md, ADRs (cto)
/content          course JSON files (pm), validated against contracts
/src
  /app            Next.js routes + PWA shell
  /components/ui  shared UI components
  /contracts      shared TypeScript types + zod schemas (cto ONLY)
  /features
    /lessons
    /gamification
    /path
    /auth
    /profile
  /lib
    /offline
    /sync
    /supabase
/supabase         migrations, seed, RLS policies (cto)
/tests/e2e        Playwright tests
```

## Golden rules for every agent
1. **Read before you write.** Read this file, `/docs/architecture/ARCHITECTURE.md`
   and the relevant ticket before starting.
2. **Contracts are law.** Types in `/src/contracts` are the single source of truth.
   Never redefine or edit them. Need a change? Stop and write a request in
   `/docs/architecture/contract-requests.md` for the CTO.
3. **Stay in your lane.** Only edit files you own (see table above).
4. **One ticket at a time.** Every change maps to a ticket ID (e.g. `LES-003`).
5. **Definition of done:**
   - All acceptance criteria in the ticket are met
   - `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all pass
   - New logic has unit tests; user flows have a Playwright test where relevant
   - Mobile-first: works at 375px width
   - Accessible: keyboard navigable, ARIA labels, sufficient contrast
6. **Commits:** Conventional Commits with ticket ID. **No attribution trailers or
   footers of any kind** — no `Co-Authored-By:`, no `Claude-Session:`, no
   "Generated with …" lines — in commit messages, PR titles or PR descriptions.
   Commits must be authored by the owner's identity, never `Claude <noreply@anthropic.com>`:
   run `git config user.name "Mohammad Mahmudul Islam"` and
   `git config user.email "mahmud.islam32@gmail.com"` before committing. E.g.
   `feat(lessons): add match-pairs exercise [LES-004]`
7. **Branches:** never commit or push directly to `main`. Every change goes on its own
   branch and reaches `main` only through a pull request merged by the `cto` agent.
   Branch names (lowercase, ticket ID first, never a `claude/` or other tool prefix):
   - `feature/<ticket-id>-short-name` — app code (e.g. `feature/les-004-match-pairs`)
   - `docs/<ticket-id>-short-name` — product/architecture docs, content, STATUS updates
   - `chore/<ticket-id>-short-name` — tooling, CI, config, agent setup
   - `fix/<ticket-id>-short-name` — bug fixes
   - Exceptions without a ticket ID: status updates use `docs/status-<YYYY-MM-DD>-<HHMM>`,
     releases use `chore/release-vX.Y.Z` (commit tag `[RELEASE-vX.Y.Z]`)
8. **No secrets in code.** Use `.env.local`; document required vars in `.env.example`.
9. **When unsure, don't block.** Write the question in the ticket or PR, make a
   sensible reversible choice, log it (product → `docs/product/decisions.md`,
   technical → ADR), and continue. The team never waits for the owner.

## Commands
```
npm run dev         # start dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest
npm run test:e2e    # playwright
```
