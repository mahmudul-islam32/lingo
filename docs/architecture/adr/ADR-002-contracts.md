# ADR-002: Architecture baseline and shared contracts

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** CTO-002
- **Decider:** cto

## Context

Three dev agents and the pm work in parallel. They need one source of truth for data
shapes (content, lesson runtime, progress, user, sync) and one set of game rules
(PD-003) before any feature or content work starts. The app must be offline-first
(PRD G3) and let guests play without an account (G1, US-PLT-05).

## Decisions

1. **zod 4 (`zod@4.6.7`, exact pin) is the contract language.** Each domain has one
   module in `src/contracts` (`common`, `config`, `text`, `course`, `answer`,
   `lesson-session`, `user`, `gamification`, `sync`, `api`) exporting `XxxSchema` plus
   `type Xxx = z.infer<typeof XxxSchema>`. Everyone imports from the `@/contracts`
   barrel. Contracts are pure: no React, no IO, no `any`.
2. **Content schemas are strict** (`z.strictObject`): unknown keys fail, so authoring
   typos are caught. Runtime/persisted records use `z.object` (unknown keys are
   stripped), so an older client can read a record written by a newer one.
3. **Exercises are a discriminated union on `type`**: `multiple_choice`,
   `word_bank_translate`, `match_pairs`, `listen`, `speak`. Validation rules are in
   the schema (3–4 MC options with a valid `correctOptionId`, exactly 5 unambiguous
   pairs, tile answers buildable from the tile multiset, a lesson needs at least one
   non-speak exercise, unique ids).
4. **One file per lesson** (`content/courses/<courseId>/lessons/<lessonId>.json`) plus a
   course manifest. Each lesson becomes its own lazily loaded, precached chunk;
   cross-file rules are checked by `src/contracts/__tests__/content.test.ts`.
5. **Canonical text normalisation lives in contracts** (`text.ts`). Both the content
   schema ("answer is buildable from tiles") and the answer checker use it, so they
   can't drift. Diacritics matter for tile answers and are folded only for speech.
6. **Match pairs are never re-queued and cost at most 1 heart** (amended by CR-001,
   2026-11-07, to match PD-012). Mismatched taps get live feedback; the answer carries
   `mismatchCount`. The exercise is `correct` once all pairs are matched, so it is never
   re-queued, but any mismatch sets `AnswerCheckResult.mistake` (one mistake, not
   first-try correct) and `heartCost = 1`, however many mismatches. `mistake` is the
   single flag the session counts for `mistakeCount`, `perfect` and accuracy.
   _Superseded wording:_ "match pairs never cost hearts".
7. **Lesson results are append-only facts; aggregates are derived.** Total XP,
   streak, daily goal, completed lessons and path state are pure functions of the
   `LessonResult` set (+ `HeartsState`, `Settings`). Sync merges are a set union by
   client UUID (idempotent), while settings, profile and hearts use last-write-wins on
   `updatedAt`.
8. **Streak/daily-goal day boundary = device local timezone (PRD Q4).** Each result
   stores `localDate` (`YYYY-MM-DD`) and `timeZone`; rules compare local date
   strings only.
9. **Hearts are stored as `{ current, refillStartedAt }` and refilled lazily**
   (`refillStartedAt` null iff full). No timers or background jobs, and it works
   offline. Hearts lost mid-lesson are saved immediately, so quitting can't undo them.
10. **PD-003 values are constants in `config.ts`** (`GAME_CONFIG`, `CONTENT_RULES`,
    `SYNC_CONFIG`), validated by `GameConfigSchema`. Default onboarding goal = 20 XP
    (pm may tune).
11. **Guests are local-only** (client UUID, no Supabase anonymous auth). This works on
    a first visit with no network and creates no server rows for drive-by visitors.
    Migration happens via one `GuestMigrationPayload` RPC at sign-up/log-in.
12. **Function signatures, not implementations, live in `api.ts`.** Rules are owned by
    dev-gamification (`features/gamification/rules`, `features/path/rules`) and
    dev-lessons (`features/lessons/checking`); the data layer by dev-platform
    (`lib/offline`, `lib/sync`, `lib/content`).
13. **Synced payloads carry `schemaVersion: CONTRACTS_VERSION`** (1), bumped only on
    breaking changes.

## Alternatives considered

- **TypeScript types + JSON Schema / Valibot / io-ts:** zod is the most widely known,
  has inference and works for both content validation and runtime parsing.
- **Supabase anonymous sign-in for guests:** simpler migration (same user id), but it
  needs the network on the first visit and creates rows for every visitor. Rejected for
  MVP.
- **Storing aggregates (XP, streak) as authoritative counters:** simpler reads, but
  multi-device and offline merges become lossy. Rejected.
- **UTC day boundary:** simpler and harder to game, but a learner in UTC−8 would see
  their "day" end at 4 pm. Rejected (PRD Q4).
- **One JSON file per course:** simpler tooling, but the whole course loads at once and
  merge conflicts grow with content. Rejected.

## Consequences

- Devs can start as soon as this merges: every shape and rule they need is defined.
- Every contract change goes through `contract-requests.md` and lists affected features.
- The content test runs in CI, so invalid `/content` JSON blocks the merge. The audio
  existence check is opt-in (`CONTENT_REQUIRE_AUDIO=1`) until placeholder audio exists
  (PRD Q7).
- Proposed ownership additions for `CLAUDE.md` (orchestrator): `src/lib/content/**` →
  dev-platform, `public/audio/**` → pm.
