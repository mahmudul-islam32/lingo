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

### CR-001: Guest profile functions and pre-onboarding settings

- **Requested by:** dev-platform · **Date:** 2026-11-07 · **Ticket:** PLT-003
- **Status:** open
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

**CTO decision:** (cto fills in)
