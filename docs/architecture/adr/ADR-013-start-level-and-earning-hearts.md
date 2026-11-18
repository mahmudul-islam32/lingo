# ADR-013: Start level and earning hearts

- **Status:** Accepted
- **Date:** 2026-11-18
- **Ticket:** CTO-015; consumers in dev-gamification, dev-lessons and dev-platform (below)
- **Decider:** cto (owner request)

## Context

The owner asked for two features in one session:

- **(A) Start at a later level.** A learner who already knows some German should not have
  to play through all of A1 before reaching A2 or B1.
- **(B) Earn hearts back.** Correct answers should restore hearts, so practising replaces
  waiting for the 4-hour refill.

Neither fits the current contracts. The path rule unlocks strictly in course order from
the first lesson, and hearts only go down (mistakes) or up (time).

## Decision

### 1. `Settings.startLevel` (`src/contracts/user.ts`)

`startLevel: CefrLevelSchema.optional()`. Missing means "A1, the first level of the
course". The learner sets it at onboarding or later in settings.

Path semantics (`ComputePathNodes`, optional 4th argument `startLevel`):

1. Every lesson of a level **before** `startLevel` is `available` unless it is completed.
   It is playable but is **not** marked completed and grants **no** XP until it is played.
   Skipping ahead never creates `LessonResult`s.
2. The **frontier** (the one `available` / `in_progress` lesson that the normal rule
   produces) is the first not-completed lesson at or after the first lesson of
   `startLevel`. Lessons after the frontier are `locked`, as before.
3. Completed lessons stay completed and replayable, whatever the start level.
4. Lowering `startLevel` again (for example B1 to A1) relocks the not-completed lessons
   between the new frontier and the old one, under the normal rule. Nothing is lost:
   results are never deleted.
5. An unknown level, or a level with no lessons in the course, falls back to the first
   level (the behaviour before this ADR). Levels are matched on `Unit.level` in course
   order (ADR-008).

### 2. Earning hearts (`GAME_CONFIG`, `src/contracts/config.ts`)

- `heartsGainedPerCorrectAnswer: 1`. Each correct Check (any attempt, including the
  retry of a re-queued exercise, and match pairs that end `correct`) restores 1 heart,
  capped at `maxHearts`. Speak exercises are excluded, matching losses. A Check that is
  `correct` but still costs a heart (match pairs with a mismatch, `heartCost > 0`) does
  not also gain one: the net effect of one Check is either −cost or +gain, never both.
- `practiceCostsHearts: false`. Replaying an already completed lesson ("practice")
  never costs hearts and may be started at 0 hearts. Practice Checks still gain hearts,
  so a learner at 0 can practise their way back.
- New rule type `GainHearts(state, amount, now)` in `src/contracts/api.ts`: adds
  `amount`, capped at `maxHearts`; reaching max sets `refillStartedAt = null`; below max
  the refill clock is left as is.
- `HeartsView.canStartLesson` keeps its meaning (`current > 0`) for **new** lessons;
  the practice exception is decided by the caller from the node state (completed) and
  `practiceCostsHearts`.

`GameConfigSchema` validates both fields (`heartsGainedPerCorrectAnswer` integer ≥ 0 and
≤ `maxHearts`; `practiceCostsHearts` boolean). Setting the gain to 0 turns feature (B)
off.

## Compatibility

- `startLevel` is optional, so every stored `Settings` record (Dexie) and every queued
  `settings` sync record stays valid. The repository validates with `SettingsSchema`
  (non-strict `z.object`), which accepts both shapes. No Dexie version bump, no data
  migration, `CONTRACTS_VERSION` stays 1.
- Supabase: migration `20261118120000_settings_start_level.sql` adds a nullable
  `settings.start_level` column (CHECK against the CEFR levels) and carries `startLevel`
  through `migrate_guest_to_account`. A pull mapper (future `src/lib/sync`) must turn
  `null` into a missing key, because `SettingsSchema` rejects `null`.
- `SettingsPatch` (`api.ts`) gains `startLevel`. To go back to the first level, pass
  `"A1"` (or the course's first level) explicitly; callers must not send
  `startLevel: undefined`, because the repository spreads the patch.
- `ComputePathNodes`' new argument is optional, so current callers compile and behave
  as before until they pass it.
- The refill timer is unchanged: a heart still refills every 4 hours while below max,
  and gains do not reset the clock.

## Per-feature work

- **dev-gamification**
  - `computePathNodes(course, completed, active, startLevel?)` per §1, with unit tests
    for each rule (earlier levels available, frontier, completed kept, lowering
    relocks, unknown/contentless fallback).
  - `gainHearts` rule (per `GainHearts`) and a `useGainHearts` hook next to
    `useLoseHearts`.
  - The 0-hearts gate lets completed lessons start while `practiceCostsHearts` is false.
  - A "Start here" action on locked level headers of the path, which sets
    `startLevel` through the profile repository.
- **dev-lessons**
  - `HeartsLessonPlayer` calls the gain hook on every correct non-speak Check with
    `heartCost === 0`.
  - Practice replays (lesson already completed) never call the lose hook and show no
    out-of-hearts stop while `practiceCostsHearts` is false.
- **dev-platform**
  - An onboarding step to choose the start level (default A1; only levels with content).
  - The profile/settings setter for `startLevel` (`updateSettings({ startLevel })`).
  - The lesson-route lock check (`LessonScreen`) passes `settings.startLevel` to
    `computePathNodes`, so a lesson the path shows as playable is never refused.

## Alternatives considered

- **Mark earlier lessons completed (placement by fake results).** Rejected: it would
  grant XP and streak days for work not done and could not be undone.
- **Store the start level as a path override per lesson.** Rejected: more state, harder
  to sync, and one level choice expresses the owner's request.
- **Gain hearts only on first-try correct answers.** Rejected for now: the owner wants
  practice to replace waiting; the gain is tunable in `GAME_CONFIG`.

## Consequences

- Hearts become a soft limit: a careful learner rarely runs out, and a learner at 0 can
  always practise a completed lesson to recover.
- The path view and the lesson route must pass the same `startLevel`, or they disagree.
