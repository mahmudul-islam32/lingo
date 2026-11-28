/**
 * `MigrateGuestToAccount` (contract `api.ts`, ADR-020 §8): uploads the guest's data with
 * the `migrate_guest_to_account` RPC. Idempotent on the server (a replay inserts no result
 * twice), so a retry after a lost response is safe. Rejects with a `MigrationError`.
 */
import type { GuestMigrationPayload, MigrateGuestToAccount } from "@/contracts";
import { getSupabaseClient, type SupabaseClient } from "@/lib/supabase";

export type MigrationFailure = "network" | "timeout" | "server" | "unauthorized" | "invalid";

export class MigrationError extends Error {
  constructor(readonly reason: MigrationFailure) {
    super(`guest migration failed: ${reason}`);
    this.name = "MigrationError";
  }
}

/** The RPC answer is given at most this long before the attempt counts as failed. */
export const MIGRATION_TIMEOUT_MS = 20_000;

export function classifyStatus(status: number): MigrationFailure {
  if (status === 0) return "network";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 408 || status === 429 || status >= 500) return "server";
  return "invalid";
}

export function createMigrateGuestToAccount(
  load: () => Promise<SupabaseClient | null> = getSupabaseClient,
  timeoutMs = MIGRATION_TIMEOUT_MS,
): MigrateGuestToAccount {
  return async (payload: GuestMigrationPayload) => {
    const client = await load();
    if (!client) throw new MigrationError("invalid");
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new MigrationError("timeout"));
      }, timeoutMs);
    });
    try {
      const { error, status } = await Promise.race([
        client.rpc("migrate_guest_to_account", { payload }).abortSignal(controller.signal),
        timeout,
      ]);
      if (error) throw new MigrationError(classifyStatus(status));
    } catch (error) {
      if (error instanceof MigrationError) throw error;
      throw new MigrationError(controller.signal.aborted ? "timeout" : "network");
    } finally {
      clearTimeout(timer);
    }
  };
}

export const migrateGuestToAccount: MigrateGuestToAccount = createMigrateGuestToAccount();
