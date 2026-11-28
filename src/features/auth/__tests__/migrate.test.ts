import { describe, expect, it, vi } from "vitest";
import { CONTRACTS_VERSION, type GuestMigrationPayload } from "@/contracts";
import type { SupabaseClient } from "@/lib/supabase";
import { classifyStatus, createMigrateGuestToAccount, MigrationError } from "../migrate";

const payload = { schemaVersion: CONTRACTS_VERSION } as GuestMigrationPayload;

function client(result: () => Promise<{ error: unknown; status: number }>) {
  const abortSignal = vi.fn(() => result());
  const rpc = vi.fn(() => ({ abortSignal }));
  return { client: { rpc } as unknown as SupabaseClient, rpc, abortSignal };
}

describe("migrateGuestToAccount (ADR-020 §8)", () => {
  it("calls the RPC with the payload", async () => {
    const fake = client(async () => ({ error: null, status: 200 }));
    await createMigrateGuestToAccount(async () => fake.client)(payload);
    expect(fake.rpc).toHaveBeenCalledWith("migrate_guest_to_account", { payload });
  });

  it.each([
    [0, "network"],
    [401, "unauthorized"],
    [503, "server"],
    [429, "server"],
    [400, "invalid"],
  ] as const)("status %i rejects with %s", async (status, reason) => {
    const fake = client(async () => ({ error: { message: "x" }, status }));
    await expect(createMigrateGuestToAccount(async () => fake.client)(payload)).rejects.toEqual(
      new MigrationError(reason),
    );
    expect(classifyStatus(status)).toBe(reason);
  });

  it("a thrown fetch is a network failure; a slow answer a timeout", async () => {
    const thrown = client(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(
      createMigrateGuestToAccount(async () => thrown.client)(payload),
    ).rejects.toMatchObject({ reason: "network" });

    vi.useFakeTimers();
    const slow = client(() => new Promise(() => {}));
    const pending = createMigrateGuestToAccount(async () => slow.client, 1000)(payload);
    const check = expect(pending).rejects.toMatchObject({ reason: "timeout" });
    await vi.advanceTimersByTimeAsync(1000);
    await check;
    vi.useRealTimers();
  });
});
