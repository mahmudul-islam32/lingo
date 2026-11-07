# Contract requests

Devs and the pm never edit `/src/contracts`. If you need a contract change, **stop**
and add an entry below (newest first). The cto answers in the same entry, makes the
change on a `chore/` branch and lists every affected feature.

Status values: `open` · `approved` · `rejected` · `done`.

## Template

Copy this block, fill it in, and put it under "Requests".

```md
### CR-NNN: <short title>

- **Requested by:** <agent> · **Date:** YYYY-MM-DD · **Ticket:** <TICKET-ID>
- **Status:** open
- **Contract(s):** e.g. `src/contracts/course.ts` → `ListenExerciseSchema`
- **Problem:** what you can't do with the current contract
- **Proposed change:** fields/types to add, remove or change (with an example)
- **Breaking?:** yes/no (does it change persisted or synced data or existing content?)

**CTO decision:** (cto fills in) approved/rejected, reasoning, final shape, affected
features, follow-up PR
```

## Requests

### CR-003: Skipped attempts and "perfect" when every exercise is skipped

- **Requested by:** dev-lessons · **Date:** 2026-11-07 · **Ticket:** LES-002
- **Status:** open
- **Contract(s):** `src/contracts/lesson-session.ts` → `ExerciseAttemptSchema.answer`,
  `LessonResultSchema` (`perfect` refinement); `src/contracts/answer.ts` →
  `MultipleChoiceAnswerSchema`
- **Problem:**
  1. A skipped attempt must carry an `answer` of the exercise's type. That works for tile,
     match-pairs and speak answers (empty arrays), but `MultipleChoiceAnswerSchema.optionId`
     is a required slug, so a skipped multiple-choice exercise (`onSkip("invalid_content")`)
     has no honest "no option" value.
  2. PD-012 says a perfect lesson needs "0 mistakes **and at least 1 counted exercise**",
     but `LessonResultSchema` requires `perfect === (mistakeCount === 0)`. If every
     exercise was skipped (for example all listen exercises with no audio), the
     result has to say `perfect: true` even though PD-012 says it isn't.
- **Proposed change:**
  1. Make `ExerciseAttemptSchema.answer` nullable, required to be `null` iff
     `outcome === "skipped"` (e.g. `{ outcome: "skipped", answer: null }`).
  2. Change the refinement to `perfect === (mistakeCount === 0 && exerciseCount - skippedCount >= 1)`
     (and keep "perfect bonus requires perfect").
- **Breaking?:** (1) no, `ExerciseAttempt` is in-memory only. (2) It's a tighter rule on a
  synced payload, but only for the all-skipped case, which can't have been produced yet.
- **Workaround in place:** (1) the reducer records `{ type: "multiple_choice", optionId:
"skipped" }` for a skipped multiple-choice exercise (`emptyAnswerFor`). (2)
  `LessonSessionSummary.perfect` follows PD-012 and drives the XP bonus, while
  `buildLessonResult` sets `perfect: mistakeCount === 0` so the result stays schema-valid.
  The all-skipped edge case gets no perfect bonus.

**CTO decision:** _(pending)_

### CR-002: Guest profile functions and pre-onboarding settings

- **Requested by:** dev-platform · **Date:** 2026-11-07 · **Ticket:** PLT-003
- **Status:** done
- **Contract(s):** `src/contracts/api.ts` → `ProfileRepository`; `src/contracts/config.ts`;
  `src/contracts/user.ts` → `SettingsSchema`, `DisplayNameSchema`
- **Problem:**
  1. PLT-003 AC1 says a new guest has "no course chosen, no daily goal, onboarding not
     complete", but `SettingsSchema` requires `courseId` and `dailyGoalXp`. There is no
     valid `Settings` value before onboarding, so `ProfileRepository.getSettings()` can't
     return one.
  2. PLT-003 AC4 / PLT-004 AC8 need "update course and daily goal" and "set onboarding
     complete". `ProfileRepository` only has `saveSettings(Settings)` (whole record) and
     `updateProfile(ProfileUpdate)`.
  3. The defaults for `soundEffectsEnabled` and `speakingExercisesEnabled` are not in
     `config.ts`.
  4. `DisplayNameSchema` requires a name, so a guest gets the placeholder "Learner"
     (ARCHITECTURE §6). PLT-003 AC8 says "no name until the learner provides one".
- **What PLT-003 does for now (no contract types redefined):** the settings record is
  absent until onboarding. `getSettings()` rejects with `SettingsNotSetError` before
  that. `src/lib/offline` adds these methods on top of the contract interface
  (`LocalProfileRepository extends ProfileRepository`): `bootstrap()`, `getIdentity()`,
  `findSettings(): Promise<Settings | null>`, `updateSettings(patch)` (the first call must
  include course and goal) and `completeOnboarding()`. The toggles default to `true`
  and the display name defaults to "Learner" (`src/lib/offline/defaults.ts`).
- **Proposed change:**
  ```ts
  // api.ts
  export type SettingsPatch = Partial<Omit<Settings, "updatedAt">>;
  export interface ProfileRepository {
    getProfile(): Promise<Profile>;
    updateProfile(update: ProfileUpdate): Promise<Profile>;
    /** Rejects before onboarding; use findSettings to check. */
    getSettings(): Promise<Settings>;
    findSettings(): Promise<Settings | null>;
    saveSettings(settings: Settings): Promise<void>;
    /** First call must include courseId and dailyGoalXp. Invalid goal → typed error, nothing stored. */
    updateSettings(patch: SettingsPatch): Promise<Settings>;
    /** Sets onboardedAt (kept if already set). Requires saved settings. */
    completeOnboarding(): Promise<Profile>;
  }
  // config.ts
  export const DEFAULT_SETTINGS = {
    soundEffectsEnabled: true,
    speakingExercisesEnabled: true,
  } as const;
  ```
  Optional: put the data-layer error codes (`invalid_daily_goal`, `settings_not_set`,
  `settings_incomplete`, `onboarding_prerequisites_missing`, `invalid_record`) in
  contracts so UI code in other features can match on them. Decide whether
  `Profile.displayName` should be nullable for guests (that would change a synced payload,
  so it's breaking) or whether "Learner" is fine as a placeholder.
- **Breaking?:** no for the `api.ts` / `config.ts` additions (new members, and
  `src/lib/offline` already implements them). Yes only if `displayName` becomes nullable.
- **Docs note (not a contract):** the Dexie schema adds a `courseId` index on
  `lessonResults` (for `listLessonResults(courseId)`) and a `kind` index on `syncQueue`
  (to coalesce last-write-wins records). ARCHITECTURE §4.1 could list them.

**CTO decision:** partially approved (2026-11-07), branch `chore/cr-002-profile-repository`.

- **Approved: `ProfileRepository` additions** in `api.ts`: `findSettings()`,
  `updateSettings(patch: SettingsPatch)`, `completeOnboarding()`, plus the exported
  `SettingsPatch` type, exactly as `src/lib/offline` already implements them (the
  implementation's own `SettingsPatch` now re-exports the contract type, and
  `LocalProfileRepository` keeps only `bootstrap()` / `getIdentity()` on top).
  "No `Settings` record before onboarding" is the documented state: `getSettings()`
  rejects, `findSettings()` returns `null`. `SettingsSchema` stays strict (no nullable
  `courseId` / `dailyGoalXp`), so a stored or synced settings record is always complete.
- **Approved: `DEFAULT_SETTINGS`** in `config.ts` (`soundEffectsEnabled: true`,
  `speakingExercisesEnabled: true`). `src/lib/offline/defaults.ts` reads it.
- **Rejected: nullable guest `displayName`.** It would change a synced payload
  (`Profile`, `GuestMigrationPayload`) and the `profiles.display_name not null` column
  (ADR-003), i.e. a `CONTRACTS_VERSION` bump, for no MVP benefit. "Learner" is a fixed,
  non-personal placeholder, so PLT-003 AC8 (no personal data stored) holds. If the
  product later needs "name not chosen yet", add an optional `displayNameChosen`
  flag instead of a null.
- **Deferred: error codes in contracts.** UI code imports the typed errors from
  `@/lib/offline` (public API), which is allowed. Move `LocalDataErrorCode` into the
  contracts only when a second data layer (Supabase repositories) needs the same codes.
- **Docs note:** ARCHITECTURE §4.1 now lists the `courseId` index on `lessonResults`
  and the `kind` / `status` indexes on `syncQueue`. §5 records the Zustand mirror of
  profile/settings as a temporary deviation until TanStack Query is added.
- **Breaking?** No. New interface members are already implemented by the only
  implementation; `CONTRACTS_VERSION` stays 1.
- **Affected features:** platform (PLT-003 `lib/offline`, adjusted minimally in this
  branch; PLT-004 onboarding uses `updateSettings` / `completeOnboarding`; future
  Supabase `ProfileRepository` must implement the new members); profile (store already
  calls these methods). Lessons and gamification: none.

### CR-001: Match-pairs answer should carry the mismatch count

- **Requested by:** dev-lessons · **Date:** 2026-11-07 · **Ticket:** LES-001
- **Status:** done
- **Contract(s):** `src/contracts/answer.ts` → `MatchPairsAnswerSchema` (and optionally
  `AnswerCheckResultSchema`)
- **Problem:** LES-001 AC8 and PD-012 need the check result to report whether any
  mismatch happened during a match-pairs exercise (accuracy, mistakes, and from v0.3.0
  at most 1 heart). The answer only holds the final `matches`, so `checkAnswer` cannot
  know about mismatched taps. ADR-002 §6 already names `mistakeCount` as the way to
  add this.
- **Proposed change:** add `mismatchCount: NonNegativeIntSchema` to
  `MatchPairsAnswerSchema`, e.g.
  `{ type: "match_pairs", matches: [...], mismatchCount: 2 }`. Optionally add
  `hadMismatch: z.boolean().optional()` to `AnswerCheckResultSchema` so the session
  can compute accuracy from the result alone.
- **Breaking?:** no for content. `ExerciseAttempt.answer` is in-memory only, so no
  persisted or synced data changes; `CONTRACTS_VERSION` stays 1.
- **Workaround in place:** `checkMatchPairsWithMismatches({ exercise, answer,
mismatchCount })` in `src/features/lessons/checking` returns
  `{ result, hadMismatch }`, with the count tracked by the player. It will be folded
  into `checkAnswer` once this is approved.
- **Related note (no change requested):** `AnswerCheckResult.heartCost` is documented as
  "1 for incorrect non-speak answers", while ADR-002 §6 says match pairs never cost
  hearts. `checkAnswer` follows the contract (an incomplete match-pairs submission is
  `incorrect` with `heartCost` 1). The UI never submits an incomplete board, so in
  practice match pairs cost 0 hearts. Please confirm or adjust the wording.

**CTO decision:** approved (2026-11-07), branch `chore/cr-001-match-pairs-mismatch`.

- **Answer:** `MatchPairsAnswerSchema.mismatchCount: NonNegativeIntSchema` (required).
  The player counts mismatched taps; there is no hidden default, so a forgotten count
  fails typecheck instead of silently reporting 0.
- **Result:** instead of a match-pairs-only `hadMismatch`, `AnswerCheckResultSchema` gets
  a required, type-agnostic `mistake: boolean`: true for every `incorrect` outcome and
  for a `correct` match pairs with `mismatchCount > 0`; never for `skipped`. The session
  counts `mistake` for `LessonResult.mistakeCount`, `perfect` and first-try accuracy, so
  PD-012 lives in one place (`checkAnswer`). `ExerciseAttemptSchema` copies `mistake`.
  Refinements: `incorrect` ⇒ `mistake`; `skipped` ⇒ not `mistake`; `heartCost > 0` ⇒
  `mistake`.
- **Heart cost (the related note):** PD-012 wins over the old ADR-002 §6 wording. Match
  pairs cost **at most 1 heart**: 1 if `mismatchCount > 0` (outcome stays `correct`, no
  re-queue), 1 for an incomplete board (`incorrect`), else 0. Hearts only take effect in
  v0.3.0 (LES-009), so v0.2.0 behaviour is unchanged. ADR-002 §6 and ARCHITECTURE §
  "Rules" / match-pairs row are updated.
- **Breaking?** No persisted or synced shape changes (`LessonResult`, Supabase tables
  untouched; `ExerciseAttempt` is in-memory only). `CONTRACTS_VERSION` stays 1.
- **Workaround removed:** `checkMatchPairsWithMismatches` / `MatchPairsCheck` are
  deleted from `src/features/lessons/checking`; `checkAnswer` reads `mismatchCount`.
- **Affected features:** lessons (LES-001 checker, done in this branch; LES-002 session
  must copy `mistake` into attempts and count it; LES-006 match-pairs player must send
  `mismatchCount`; LES-008 results screen reads the counts; LES-009 hearts uses
  `heartCost`), gamification (GAM-002 consumes `perfect`/`heartCost` only, no code
  change). Platform: none.
