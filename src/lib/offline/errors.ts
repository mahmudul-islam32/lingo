/** Typed errors thrown by the local repositories. Check `error.code` or use `instanceof`. */

export type LocalDataErrorCode =
  | "invalid_daily_goal"
  | "invalid_settings"
  | "invalid_profile_update"
  | "invalid_record"
  | "settings_not_set"
  | "settings_incomplete"
  | "onboarding_prerequisites_missing"
  | "storage_failed";

export class LocalDataError extends Error {
  constructor(
    readonly code: LocalDataErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** The daily goal is not one of `GAME_CONFIG.dailyGoalOptions`. Nothing was stored. */
export class InvalidDailyGoalError extends LocalDataError {
  constructor(
    readonly value: unknown,
    readonly allowed: readonly number[],
  ) {
    super(
      "invalid_daily_goal",
      `Daily goal ${String(value)} is not allowed. Choose one of ${allowed.join(", ")}.`,
    );
  }
}

/** A value failed its zod contract before it was written. Nothing was stored. */
export class InvalidRecordError extends LocalDataError {
  constructor(
    code: "invalid_settings" | "invalid_profile_update" | "invalid_record",
    readonly issues: readonly string[],
  ) {
    super(code, `Invalid data: ${issues.join("; ")}`);
  }
}

/** Settings are read before onboarding chose a course and a daily goal. */
export class SettingsNotSetError extends LocalDataError {
  constructor() {
    super("settings_not_set", "No course and daily goal have been chosen yet.");
  }
}

/** A first settings update must include both a course and a daily goal. */
export class SettingsIncompleteError extends LocalDataError {
  constructor(readonly missing: readonly ("courseId" | "dailyGoalXp")[]) {
    super("settings_incomplete", `Missing settings: ${missing.join(", ")}.`);
  }
}

/** Onboarding can't be completed before a course and a daily goal are saved. */
export class OnboardingPrerequisitesError extends LocalDataError {
  constructor() {
    super(
      "onboarding_prerequisites_missing",
      "Choose a course and a daily goal before completing onboarding.",
    );
  }
}

/**
 * The device storage (IndexedDB or the in-memory fallback) failed: quota, a closed or
 * blocked database, a browser refusing writes (PLT-008 criterion 8). The original error
 * is in `cause`. Nothing was stored by the failed call.
 */
export class StorageError extends LocalDataError {
  constructor(
    readonly operation: string,
    readonly cause: unknown,
  ) {
    super("storage_failed", `Storage failed during ${operation}: ${describeCause(cause)}`);
  }
}

function describeCause(cause: unknown): string {
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`;
  return String(cause);
}

/** Runs a storage operation; any non-`LocalDataError` failure becomes a `StorageError`. */
export async function guardStorage<T>(operation: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof LocalDataError) throw error;
    throw new StorageError(operation, error);
  }
}
