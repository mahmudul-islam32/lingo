# ADR-015: Goal date (`Settings.goalPlan`, `GoalPlanStatus`, `computeGoalPlan`)

- **Status:** Accepted; amended by [ADR-018](ADR-018-goal-plan-per-course.md) (one plan per course)
- **Date:** 2026-11-21
- **Ticket:** CTO-017; consumers GAM-013, PLT-027, LES-022 (milestone v0.5.4 "Goal date")
- **Decider:** cto (product rules: PD-071 §1, PD-064)

## Context

PD-071 accepts "goal date": the learner picks a target level and a date, and the app shows
how many lessons are left, about how many a day, and a suggested daily goal. Three tickets
build on it (rule and Learn card, Profile dialog, results row), so they need one stored shape,
one status shape and one written rule.

## Decision

### 1. Stored plan: `Settings.goalPlan` (`src/contracts/user.ts`)

```ts
GoalPlanSchema = z.object({ targetLevel: CefrLevelSchema, targetDate: LocalDateSchema });
SettingsSchema.goalPlan = GoalPlanSchema.nullable().optional();
```

- **Missing or `null` both mean "no goal date".** Readers use `settings.goalPlan ?? null`.
- **Clear = `updateSettings({ goalPlan: null })`.** The repository spreads the patch, so the
  stored record then holds `goalPlan: null`. Unlike `startLevel` (ADR-013), `null` is valid
  in the schema, so clearing needs no special case in the repository and maps 1:1 to the
  nullable Supabase column (a pull mapper needs no `null` → missing step). Never send
  `goalPlan: undefined` (dropped by `useUpdateSettings`, ADR-013 Compatibility).
- `SettingsPatch` (`api.ts`) includes `goalPlan`.
- The schema is structural only. "After today" and "at most
  `GAME_CONFIG.goalPlanMaxDays` (730) days ahead" depend on today, so the Profile dialog
  (PLT-027) enforces them on save; a stored plan whose date has since passed stays valid and
  shows as `date-passed`. A target level without content is stored as is and makes
  `computeGoalPlan` return `null`.

### 2. Config

`GAME_CONFIG.goalPlanMaxDays = 730`, validated by `GameConfigSchema` (positive integer). The
lessons-a-day maths uses the existing `xpPerLesson` and `dailyGoalOptions`.

### 3. Computed status: `GoalPlanStatus` (`src/contracts/gamification.ts`)

`targetLevel`, `targetDate`, `lessonsLeft` (int ≥ 0), `daysLeft` (int, may be ≤ 0),
`lessonsPerDay` (int ≥ 1 or `null`), `suggestedDailyGoalXp` (a `DailyGoalXp` or `null`),
`status`: `"on-track" | "raise-goal" | "tight" | "reached" | "date-passed"`
(`GoalPlanStateSchema`). `GoalPlanStatusSchema` also checks the invariants: the two numbers
are `null` exactly for `reached` / `date-passed`; `reached` iff `lessonsLeft = 0`; with lessons
left, `date-passed` iff `daysLeft ≤ 0`. GAM-013 tests can assert rule output against it.

The names are kind on purpose: there is no "behind", "late" or "failed" state (PD-071 §1.4).

### 4. Rule: `ComputeGoalPlan` (`src/contracts/api.ts`)

One input object `{ course, completedLessonIds, startLevel?, goalPlan?, today, dailyGoalXp }`
→ `GoalPlanStatus | null`, implemented by GAM-013 in
`src/features/gamification/rules/`. The doc comment in `api.ts` is the single source of the
rule (lessons counted, days, rounding, thresholds, worked example). In short: lessons left =
not-completed lessons from the effective start level through the target level (only the
target level if it is earlier); days left = `targetDate − today`; lessons a day =
`ceil(lessons / days)`; suggestion = smallest option ≥ lessons a day × 10 XP, else the largest;
status `reached` > `date-passed` > `on-track` > `raise-goal` > `tight`.

### 5. Computed on the device, never stored

`GoalPlanStatus` is derived from settings, lesson results and today's local date every time
it is shown (`useGoalPlan`, GAM-013). It is not persisted in Dexie, not queued for sync and has
no Supabase column, because:

- all inputs are already stored and synced, so a stored copy could only go stale (a lesson
  result, a daily-goal change or midnight would all have to rewrite it);
- it depends on "today" in the device timezone, which the server doesn't know (same reason
  the streak is computed locally, ARCHITECTURE §Streak day boundary);
- it is cheap: one pass over at most `courseMaxLessons` lessons.

### 6. Sync readiness (Supabase)

Migration `20261121120000_settings_goal_plan.sql` adds one nullable `settings.goal_plan`
`jsonb` column (the camelToSnake name of the contract field, like every other settings
column, so `supabase-schema.test.ts` covers it unchanged). A CHECK constrains it to `null` or
an object with a CEFR `targetLevel` and a `YYYY-MM-DD` `targetDate`. `migrate_guest_to_account`
carries `goalPlan` with the same LWW rule (missing or JSON `null` → SQL `null`). RLS is
unchanged (the existing `settings` policies cover the new column). Not run against hosted
Supabase (none exists yet, PD-054). The v0.6.0 sync mapper (PLT-010 / PLT-014) passes the
object through as is; SQL `null` ↔ `goalPlan: null`.

## Compatibility

- `goalPlan` is optional, so every stored `Settings` record and queued `settings` sync record
  stays valid. No Dexie version bump, no data migration, `CONTRACTS_VERSION` stays 1.
- `ComputeGoalPlan` is a new type; nothing existing changes. `SettingsPatch` only widens.

## Per-feature work

- **dev-gamification (GAM-013):** `computeGoalPlan` per `api.ts` with 100 % branch coverage,
  `useGoalPlan()`, `GoalPlanCard`.
- **dev-platform (PLT-027):** Profile row and dialog (min tomorrow, max today +
  `goalPlanMaxDays`), save via `updateSettings({ goalPlan })`, remove via
  `updateSettings({ goalPlan: null })`, Learn and results wiring.
- **dev-lessons (LES-022):** optional `GoalPlanStatus | null` prop on `ResultsScreen`.

## Alternatives considered

- **Clear by deleting the key (`optional()` only, like `startLevel`).** Rejected: the spread
  patch can't delete a key, so the repository would need a special case, and the sync pull
  would need a `null` → missing mapper. `null` is simpler and still lets old records parse.
- **Store the status (or `lessonsPerDay`) with the plan.** Rejected, see §5.
- **Validate the date window in the schema.** Rejected: the schema has no "today", and a plan
  that was valid when saved must stay readable after its date.
- **Two typed columns (`goal_target_level`, `goal_target_date`).** Rejected: the plan is
  read and written as one value, the JSON column keeps the 1:1 field-to-column rule of the
  schema test, and the CHECK still guards its shape. Nothing queries the plan server-side.

## Consequences

- Every reader must treat `undefined` and `null` the same.
- The Learn card, the Profile preview and the results row all call the same rule, so they
  can't disagree, as long as they pass the same `startLevel` and today.
