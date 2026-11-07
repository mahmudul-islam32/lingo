# ADR-001: Project scaffold, tooling and CI

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** CTO-001
- **Decider:** cto

## Context

Polyglow needs a working, boring, reproducible baseline before any feature work
starts: one framework, one test runner per layer, one linter/formatter, and CI
that enforces the definition of done (`typecheck`, `lint`, `test`, `build`).

## Decision

Scaffold a single Next.js App Router app (based on `create-next-app@16.4.5`,
`app-tw` template, `src/` dir, `@/*` import alias) with the following pinned
versions. All dependencies are pinned to exact versions (`.npmrc`
`save-exact=true`); upgrades happen deliberately in their own `chore/` ticket.

| Area               | Package                                             | Version                              |
| ------------------ | --------------------------------------------------- | ------------------------------------ |
| Runtime            | Node.js                                             | 22 LTS (`engines: >=22`, CI uses 22) |
| Framework          | `next`                                              | 16.4.5                               |
| UI                 | `react`, `react-dom`                                | 19.3.1                               |
| Language           | `typescript` (strict)                               | 5.9.3                                |
| Styling            | `tailwindcss`, `@tailwindcss/turbopack`             | 4.3.5                                |
| Lint               | `eslint`                                            | 9.39.5                               |
| Lint config        | `eslint-config-next` (core-web-vitals + typescript) | 16.4.5                               |
| Lint/format bridge | `eslint-config-prettier`                            | 10.1.8                               |
| Format             | `prettier`                                          | 3.9.10                               |
| Unit tests         | `vitest` / `vite`                                   | 5.1.0 / 8.3.6                        |
| Unit tests         | `@vitejs/plugin-react`                              | 6.2.1                                |
| Unit tests         | `jsdom`                                             | 31.0.0                               |
| Unit tests         | `@testing-library/react` / `dom` / `jest-dom`       | 16.3.3 / 10.4.2 / 7.0.1              |
| E2E tests          | `@playwright/test`                                  | 1.65.0                               |
| Types              | `@types/node` / `@types/react` / `@types/react-dom` | 22.20.5 / 19.3.0 / 19.3.0            |

Notable choices:

- **TypeScript 5.9, not 7.x.** TS 7 (native port) is the npm `latest`, but the
  Next.js 16 template and `typescript-eslint` target TS 5. Revisit in a later ticket.
- **ESLint 9, not 10.** Same reason: the official Next.js 16 template ships
  ESLint 9 flat config. ESLint 9 is still maintained.
- **Turbopack** is the Next.js 16 default bundler for `dev` and `build`; Tailwind 4
  is wired through the `@tailwindcss/turbopack` loader in `next.config.ts`
  (no PostCSS config needed).
- **No `next/font/google`.** The template's Google font fetch is removed so builds
  need no network at build time; we use a system font stack until the brand
  font is chosen (self-hosted via `next/font/local` when it is).
- **Template experiments off.** `cacheComponents` / `partialPrefetching` from the
  template are not enabled; we opt in later via ADR if needed.
- **`tsc --noEmit` without `next typegen`.** Layouts type `children` explicitly
  instead of the generated global `LayoutProps`, so `npm run typecheck` works on a
  clean checkout before any build.
- **Vitest** runs in `jsdom`, picks up `src/**/*.test.{ts,tsx}`, resolves the
  `@/` alias, and loads `@testing-library/jest-dom` matchers in `vitest.setup.ts`.
- **Playwright** tests live in `tests/e2e`, run against `next dev` locally and
  `next start` in CI, on a mobile (Pixel 7) and a desktop Chrome project.
  E2E is not part of CI yet (browsers not installed there); a later ticket adds it.
- **Prettier** formats code and our own docs; docs owned by other agents
  (`CLAUDE.md`, `.claude/**`, `docs/product/**`, `docs/STATUS.md` …) are in
  `.prettierignore` so tooling never rewrites files outside the cto's lane.
- **CI** (`.github/workflows/ci.yml`): on pull requests to `main`, Node 22,
  `npm ci`, then typecheck, lint, test, build.

Deferred to later tickets (deliberately not installed yet): Serwist, Supabase
client, Dexie, Zustand, TanStack Query, Framer Motion.

## Consequences

- Every dev agent has the same commands (`dev`, `build`, `typecheck`, `lint`,
  `test`, `test:e2e`) from day one, and CI blocks merges that fail them.
- `npm audit` reports moderate advisories in the dev-only lint chain
  (`minimatch` via `typescript-eslint` via `eslint-config-next`). No runtime
  impact; the suggested "fix" downgrades `eslint-config-next` to 15.x, so we
  accept it and pick up the upstream fix on the next dependency bump.
