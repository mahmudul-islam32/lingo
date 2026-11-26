# ADR-018: A goal plan per course (`Settings.goalPlans`, `goalPlanFor`)

- **Status:** Accepted
- **Date:** 2026-11-26
- **Ticket:** CTO-018; consumers GAM-014, PLT-028 (milestone v0.5.5). Amends ADR-015.
- **Decider:** cto (product rules: PD-078, PD-082)

## Context

ADR-015 stores one `Settings.goalPlan` for the whole app. Since TELC-001 the learner can
switch courses, and that single plan then applies to whichever course is active. For
example, a German "A2 by 12 Mar" plan counts telc B1's A1 and A2 lessons after a switch.
PD-078 rules that **the goal date always belongs to the course you are on**. The same
contract files are edited next by CTO-019, and the v0.6.0 settings sync (PLT-010 / PLT-014)
must inherit a settled shape.

## Decision

### 1. Shape

`Settings.goalPlans?: Record<Slug, GoalPlan>` (`GoalPlansSchema`). It holds at most one plan
per course id.

- Keys are validated as slugs. An invalid key or plan makes the whole record invalid, the
  same as any other bad field.
- A missing `goalPlans` means no plans.
- A clear **removes the key**: `null` values are not allowed in the record, so readers
  never see two spellings of "no plan".
- Plans for course ids that are unknown, hidden or have no levels (FIX-014) are kept and
  stay valid; the UI simply doesn't show them (CTO-018 criterion 9).
- `startLevel` and `dailyGoalXp` stay global (PD-082).

### 2. Reading: `goalPlanFor(settings, courseId)`

This pure selector in `src/contracts/user.ts` is the only way to read a course's plan. It
returns `goalPlans[courseId]` when that key exists (an own property, so `"constructor"` is
not a course). Otherwise it returns the legacy `goalPlan`, but only when
`courseId === settings.courseId`. In every other case it returns `null`.

`courseId` is required in `SettingsSchema`, so the ticket's "else `DEFAULT_COURSE_ID`"
fallback can never apply.

### 3. Stored-data migration: `normalizeGoalPlans(settings)`, no Dexie bump

A record written by v0.5.4 has a single `goalPlan`. It is read as the plan of that record's
`courseId`:

- `normalizeGoalPlans` moves it to `goalPlans[courseId]` and deletes the `goalPlan` key.
- If `goalPlans` already has an entry for that course, the existing entry wins.
- The function is pure and idempotent, so no plan is lost or duplicated.

The migration is **lazy**. The settings repository normalizes the stored record whenever it
writes settings, and `goalPlanFor` gives the same answer before and after normalizing. That
means a record that is never written again still reads correctly. A Dexie version bump would
add an upgrade path for no gain, so there is none.

The server applies the same rule in `migrate_guest_to_account`
(`20261126120000_settings_goal_plans.sql`):

- `goal_plans` = `{courseId: goalPlan}` merged with the incoming `goalPlans`, where the
  incoming `goalPlans` wins.
- The legacy `goal_plan` column is written as `null`.

### 4. Writing: `SettingsPatch.goalPlanUpdate`

`goalPlanUpdate?: { courseId, goalPlan: GoalPlan | null }` sets or clears **one** course's
plan; the plans of other courses are never sent. `updateSettings` must do these steps in
this order:

1. Read the stored record and apply `normalizeGoalPlans`.
2. Spread the other patch fields, including a possible `courseId` change.
3. Apply `withGoalPlan(next, goalPlanUpdate)`.
4. Validate and write.

Normalizing _before_ spreading matters. Otherwise a patch that switches `courseId` would
carry an un-migrated legacy plan to the new course. The `goalPlanUpdate` key is never stored
(`withGoalPlan` returns settings without it, and zod strips unknown keys).

### 5. The legacy field and its removal

- `Settings.goalPlan` stays in the schema as `@deprecated`, read-only, nullable and optional.
  Records and queued `settings` sync records written by v0.5.4 must keep parsing. It is
  removed from the schema (with the `goal_plan` column) in the first release after v0.6.0
  in which settings sync has been live. By then every device has rewritten its record
  through §4.
- `SettingsPatch.goalPlan` (the v0.5.4 write path) stays until PLT-028 switches Profile to
  `goalPlanUpdate`, so `main` keeps building. The cto removes it right after PLT-028 merges.
- `CONTRACTS_VERSION` stays `1`. Every change is additive and optional, so queued records
  with `schemaVersion: 1` parse unchanged (tested).

### 6. Conflict rule under settings sync (decision for PLT-014)

v0.6.0 **keeps whole-record last-write-wins** on `updatedAt` for settings, `goalPlans`
included. Two devices editing _different_ courses' plans within the same sync window could
lose one of the edits. That is rare (one learner, two devices, two courses, the same minutes),
visible, and recoverable by entering the date again. A per-course merge would be the only
merged field in an otherwise LWW record, so it is not worth it. PLT-014 inherits this rule.
If it ever needs revisiting, `goalPlans` can be merged by key with a per-entry `updatedAt`
added in a later ADR.

### 7. Rule and status unchanged

`ComputeGoalPlan` keeps its inputs and output: one course, one plan. Callers pass
`goalPlanFor(settings, course.id)`. `GoalPlanStatus` is unchanged.

### 8. Backend

- New nullable `settings.goal_plans jsonb` column, with `CHECK (public.is_valid_goal_plans(goal_plans))`.
  The immutable helper checks that every key is a slug (1–64 characters) and every value has
  the ADR-015 §6 plan shape. A CHECK can't contain a subquery, which is why it is a function.
- RLS is unchanged.
- `migrate_guest_to_account` carries every course's plan (§3).
- The migration was applied and tested on a local Postgres, both the CHECK cases and the RPC
  with legacy-only, legacy plus `goalPlans`, none, and invalid input. It has not been run
  against hosted Supabase.

## Consumer changes

- **GAM-014 (dev-gamification):** `useGoalPlan({ courseId })` passes
  `goalPlanFor(settings, courseId)` to `computeGoalPlan`, instead of
  `settings.goalPlan ?? null`.
- **PLT-028 (dev-platform):**
  - `updateSettings` implements §4 (normalize, spread, `withGoalPlan`).
  - The Profile row and dialog read `goalPlanFor(settings, activeCourseId)` and write
    `goalPlanUpdate`.
  - "Remove goal date" sends `{ courseId, goalPlan: null }`.
  - The results row uses the lesson's course.
  - It adds a repository test for a course switch with a stored v0.5.4 record.
- **CTO-019** edits the same contract files and is based on this ADR.

## Consequences

- One course's plan can no longer change another course's numbers or target.
- Readers have one selector and writers one patch field, so the legacy field stays invisible
  to features.
- Until PLT-028 merges, the v0.5.4 behaviour (a single plan through `SettingsPatch.goalPlan`)
  continues unchanged.
