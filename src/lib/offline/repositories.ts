/**
 * Local (Dexie or in-memory) implementations of `ProfileRepository` and
 * `ProgressRepository` from `@/contracts` for the identity on this device.
 * Every write is validated against the contract first; every read is parsed.
 * No network access happens here.
 */
import {
  DAILY_GOAL_OPTIONS,
  DailyGoalXpSchema,
  HeartsStateSchema,
  IdentitySchema,
  LessonResultSchema,
  ProfileSchema,
  ProfileUpdateSchema,
  SettingsSchema,
  type HeartsState,
  type Identity,
  type LessonResult,
  type Profile,
  type ProfileRepository,
  type ProfileUpdate,
  type SettingsPatch,
  type ProgressRepository,
  type Settings,
  type Slug,
} from "@/contracts";
import {
  createDefaultProfile,
  createFullHearts,
  createGuestIdentity,
  DEFAULT_SETTINGS_TOGGLES,
  identityId,
} from "./defaults";
import {
  guardStorage,
  InvalidDailyGoalError,
  InvalidRecordError,
  OnboardingPrerequisitesError,
  SettingsIncompleteError,
  SettingsNotSetError,
} from "./errors";
import { CURRENT_KEY, type LocalStore, type StoreTx } from "./store";
import { buildSyncRecord, enqueueInTx } from "./sync-queue";
import { formatIssues, readRecord, type CorruptRecordReporter } from "./validation";

export interface RepositoryDeps {
  now: () => Date;
  newId: () => string;
  report: CorruptRecordReporter;
}

/** Re-exported from the contracts (CR-002). */
export type { SettingsPatch };

export interface GuestBootstrapResult {
  identity: Identity;
  profile: Profile;
  /** `null` until onboarding has chosen a course and a daily goal. */
  settings: Settings | null;
}

export interface LocalProfileRepository extends ProfileRepository {
  /** Creates the guest on first launch (idempotent) and returns everything the shell needs. */
  bootstrap(): Promise<GuestBootstrapResult>;
  getIdentity(): Promise<Identity>;
}

export type LocalProgressRepository = ProgressRepository;

export function assertDailyGoal(value: unknown): void {
  if (!DailyGoalXpSchema.safeParse(value).success) {
    throw new InvalidDailyGoalError(value, DAILY_GOAL_OPTIONS);
  }
}

function validateSettings(settings: unknown): Settings {
  if (typeof settings === "object" && settings !== null && "dailyGoalXp" in settings) {
    assertDailyGoal((settings as { dailyGoalXp: unknown }).dailyGoalXp);
  }
  const parsed = SettingsSchema.safeParse(settings);
  if (!parsed.success) throw new InvalidRecordError("invalid_settings", formatIssues(parsed.error));
  return parsed.data;
}

/**
 * Reads identity, profile and hearts, creating or repairing them as needed.
 * Corrupt records are replaced, keeping the guest id whenever it can be recovered.
 */
async function ensureIdentity(
  tx: StoreTx,
  deps: RepositoryDeps,
): Promise<{ identity: Identity; profile: Profile }> {
  const identityRead = readRecord(IdentitySchema, await tx.get("identity", CURRENT_KEY));
  const profileRead = readRecord(ProfileSchema, await tx.get("profile", CURRENT_KEY));

  let identity: Identity;
  if (identityRead.status === "ok") {
    identity = identityRead.value;
  } else {
    if (profileRead.status === "ok") {
      // Keep the learner's id: rebuild the identity from the intact profile.
      identity = createGuestIdentity(profileRead.value.id);
      deps.report({
        table: "identity",
        key: CURRENT_KEY,
        action: "recovered",
        issues: identityRead.status === "corrupt" ? identityRead.issues : ["missing"],
      });
    } else {
      // First launch on this device (or nothing recoverable): a new random guest id.
      identity = createGuestIdentity(deps.newId());
      if (identityRead.status === "corrupt") {
        deps.report({
          table: "identity",
          key: CURRENT_KEY,
          action: "replaced",
          issues: identityRead.issues,
        });
      }
    }
    await tx.put("identity", CURRENT_KEY, identity);
  }

  const id = identityId(identity);
  let profile: Profile;
  if (profileRead.status === "ok" && profileRead.value.id === id) {
    profile = profileRead.value;
  } else {
    if (profileRead.status === "ok") {
      profile = { ...profileRead.value, id };
      deps.report({
        table: "profile",
        key: CURRENT_KEY,
        action: "recovered",
        issues: ["profile id did not match the identity"],
      });
    } else {
      profile = createDefaultProfile(id, deps.now());
      if (profileRead.status === "corrupt") {
        deps.report({
          table: "profile",
          key: CURRENT_KEY,
          action: "replaced",
          issues: profileRead.issues,
        });
      }
    }
    await tx.put("profile", CURRENT_KEY, profile);
  }

  await readHearts(tx, deps);
  return { identity, profile };
}

async function readHearts(tx: StoreTx, deps: RepositoryDeps): Promise<HeartsState> {
  const read = readRecord(HeartsStateSchema, await tx.get("hearts", CURRENT_KEY));
  if (read.status === "ok") return read.value;
  if (read.status === "corrupt") {
    deps.report({ table: "hearts", key: CURRENT_KEY, action: "replaced", issues: read.issues });
  }
  const hearts = createFullHearts(deps.now());
  await tx.put("hearts", CURRENT_KEY, hearts);
  return hearts;
}

async function readSettings(tx: StoreTx, deps: RepositoryDeps): Promise<Settings | null> {
  const read = readRecord(SettingsSchema, await tx.get("settings", CURRENT_KEY));
  if (read.status === "ok") return read.value;
  if (read.status === "corrupt") {
    // Unusable settings: drop them so onboarding asks again instead of crashing.
    deps.report({ table: "settings", key: CURRENT_KEY, action: "removed", issues: read.issues });
    await tx.delete("settings", CURRENT_KEY);
  }
  return null;
}

async function writeSettings(tx: StoreTx, deps: RepositoryDeps, settings: Settings) {
  await tx.put("settings", CURRENT_KEY, settings);
  await enqueueInTx(
    tx,
    buildSyncRecord({ kind: "settings", payload: settings }, deps.now(), deps.newId),
  );
}

async function writeProfile(tx: StoreTx, deps: RepositoryDeps, profile: Profile) {
  const parsed = ProfileSchema.safeParse(profile);
  if (!parsed.success) {
    throw new InvalidRecordError("invalid_profile_update", formatIssues(parsed.error));
  }
  await tx.put("profile", CURRENT_KEY, parsed.data);
  await enqueueInTx(
    tx,
    buildSyncRecord(
      { kind: "profile", payload: ProfileUpdateSchema.parse(parsed.data) },
      deps.now(),
      deps.newId,
    ),
  );
  return parsed.data;
}

export function createLocalProfileRepository(
  store: LocalStore,
  deps: RepositoryDeps,
): LocalProfileRepository {
  return {
    bootstrap: () =>
      store.transaction("rw", async (tx) => {
        const { identity, profile } = await ensureIdentity(tx, deps);
        const settings = await readSettings(tx, deps);
        return { identity, profile, settings };
      }),

    getIdentity: () =>
      store.transaction("rw", async (tx) => (await ensureIdentity(tx, deps)).identity),

    getProfile: () =>
      store.transaction("rw", async (tx) => (await ensureIdentity(tx, deps)).profile),

    updateProfile: async (update: ProfileUpdate) => {
      const parsed = ProfileUpdateSchema.safeParse(update);
      if (!parsed.success) {
        throw new InvalidRecordError("invalid_profile_update", formatIssues(parsed.error));
      }
      return store.transaction("rw", async (tx) => {
        const { profile } = await ensureIdentity(tx, deps);
        return writeProfile(tx, deps, { ...profile, ...parsed.data });
      });
    },

    findSettings: () => store.transaction("rw", (tx) => readSettings(tx, deps)),

    getSettings: () =>
      store.transaction("rw", async (tx) => {
        const settings = await readSettings(tx, deps);
        if (!settings) throw new SettingsNotSetError();
        return settings;
      }),

    saveSettings: async (settings: Settings) => {
      const valid = validateSettings(settings);
      await store.transaction("rw", async (tx) => {
        await ensureIdentity(tx, deps);
        await writeSettings(tx, deps, valid);
      });
    },

    updateSettings: async (patch: SettingsPatch) => {
      if (patch.dailyGoalXp !== undefined) assertDailyGoal(patch.dailyGoalXp);
      return store.transaction("rw", async (tx) => {
        await ensureIdentity(tx, deps);
        const current = await readSettings(tx, deps);
        if (!current) {
          const missing = (["courseId", "dailyGoalXp"] as const).filter(
            (key) => patch[key] === undefined,
          );
          if (missing.length > 0) throw new SettingsIncompleteError(missing);
        }
        const next = validateSettings({
          ...DEFAULT_SETTINGS_TOGGLES,
          ...current,
          ...patch,
          updatedAt: deps.now().toISOString(),
        });
        await writeSettings(tx, deps, next);
        return next;
      });
    },

    completeOnboarding: () =>
      store.transaction("rw", async (tx) => {
        const { profile } = await ensureIdentity(tx, deps);
        if (!(await readSettings(tx, deps))) throw new OnboardingPrerequisitesError();
        if (profile.onboardedAt !== null) return profile;
        const iso = deps.now().toISOString();
        return writeProfile(tx, deps, { ...profile, onboardedAt: iso, updatedAt: iso });
      }),
  };
}

/**
 * Every method rejects with a typed error only: `InvalidRecordError` for invalid input,
 * `StorageError` (with `cause`) for any storage failure (PLT-008 criterion 8).
 */
export function createLocalProgressRepository(
  store: LocalStore,
  deps: RepositoryDeps,
): LocalProgressRepository {
  const repository = createUnguardedProgressRepository(store, deps);
  return {
    getIdentity: () => guardStorage("getIdentity", () => repository.getIdentity()),
    listLessonResults: (courseId) =>
      guardStorage("listLessonResults", () => repository.listLessonResults(courseId)),
    saveLessonResult: (result) =>
      guardStorage("saveLessonResult", () => repository.saveLessonResult(result)),
    getHearts: () => guardStorage("getHearts", () => repository.getHearts()),
    saveHearts: (state) => guardStorage("saveHearts", () => repository.saveHearts(state)),
  };
}

function createUnguardedProgressRepository(
  store: LocalStore,
  deps: RepositoryDeps,
): LocalProgressRepository {
  return {
    getIdentity: () =>
      store.transaction("rw", async (tx) => (await ensureIdentity(tx, deps)).identity),

    listLessonResults: (courseId: Slug) =>
      store.transaction("r", async (tx) => {
        const rows = await tx.getWhere("lessonResults", "courseId", courseId);
        const results: LessonResult[] = [];
        for (const row of rows) {
          const read = readRecord(LessonResultSchema, row);
          if (read.status === "ok") results.push(read.value);
          else if (read.status === "corrupt") {
            const key = (row as { id?: unknown }).id;
            deps.report({
              table: "lessonResults",
              key: typeof key === "string" ? key : "?",
              action: "skipped",
              issues: read.issues,
            });
          }
        }
        return results.sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
      }),

    saveLessonResult: async (result: LessonResult) => {
      const parsed = LessonResultSchema.safeParse(result);
      if (!parsed.success)
        throw new InvalidRecordError("invalid_record", formatIssues(parsed.error));
      const valid = parsed.data;
      await store.transaction("rw", async (tx) => {
        const existing = readRecord(LessonResultSchema, await tx.getRow("lessonResults", valid.id));
        // Append-only and idempotent by id: saving the same result twice is a no-op.
        if (existing.status === "ok") return;
        await tx.putRow("lessonResults", valid);
        await enqueueInTx(
          tx,
          buildSyncRecord(
            { kind: "lesson_result", payload: valid, id: valid.id },
            deps.now(),
            deps.newId,
          ),
        );
      });
    },

    getHearts: () => store.transaction("rw", (tx) => readHearts(tx, deps)),

    saveHearts: async (state: HeartsState) => {
      const parsed = HeartsStateSchema.safeParse(state);
      if (!parsed.success)
        throw new InvalidRecordError("invalid_record", formatIssues(parsed.error));
      await store.transaction("rw", async (tx) => {
        await tx.put("hearts", CURRENT_KEY, parsed.data);
        await enqueueInTx(
          tx,
          buildSyncRecord({ kind: "hearts", payload: parsed.data }, deps.now(), deps.newId),
        );
      });
    },
  };
}
