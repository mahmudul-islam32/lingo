import { test } from "@playwright/test";
import { localStackProblem } from "../local-supabase";

/**
 * Skips the file with the reason when the local stack isn't running; with
 * `ACCOUNTS_REQUIRED=1` (CI) a missing stack fails instead (ADR-020 §9).
 */
export function requireLocalStack(): void {
  test.beforeAll(async () => {
    const problem = await localStackProblem();
    if (problem !== null && process.env.ACCOUNTS_REQUIRED === "1") throw new Error(problem);
    test.skip(problem !== null, problem ?? "");
  });
}

/** `localStorage` key of the session (`AUTH_STORAGE_KEY` in `src/lib/supabase/client.ts`). */
export const AUTH_STORAGE_KEY = "polyglow-auth";
