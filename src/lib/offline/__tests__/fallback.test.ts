import { afterEach, describe, expect, it, vi } from "vitest";
import { DexieLocalStore } from "../db";
import { IDBFactory } from "fake-indexeddb";
import { openLocalSession } from "../session";
import { createDevice } from "./helpers";

/** An IndexedDB that refuses to open, like some private browsing modes. */
class BrokenIDBFactory extends IDBFactory {
  override open(): IDBOpenDBRequest {
    throw new DOMException("The operation is insecure.", "SecurityError");
  }
}

afterEach(() => vi.restoreAllMocks());

describe("in-memory fallback", () => {
  it("falls back when IndexedDB opens but refuses writes", async () => {
    vi.spyOn(DexieLocalStore.prototype, "transaction").mockRejectedValue(
      new DOMException("Quota exceeded", "QuotaExceededError"),
    );
    const session = await createDevice().open();
    expect(session.storage).toMatchObject({ kind: "memory", persistent: false });
    expect(session.storage.fallbackReason).toMatch(/QuotaExceededError/);
    expect((await session.profile.getProfile()).onboardedAt).toBeNull();
  });

  it("falls back to memory when IndexedDB can't be opened, and flags it", async () => {
    const session = await createDevice().open({ indexedDB: new BrokenIDBFactory() });
    expect(session.storage.kind).toBe("memory");
    expect(session.storage.persistent).toBe(false);
    expect(session.storage.fallbackReason).toMatch(/insecure|SecurityError|Open/i);
  });

  it("falls back when the browser has no IndexedDB at all", async () => {
    // jsdom has no global indexedDB.
    const session = await openLocalSession();
    expect(session.storage.persistent).toBe(false);
  });

  it("keeps working for the session: guest, settings and onboarding", async () => {
    const session = await createDevice().open({ indexedDB: new BrokenIDBFactory() });
    const { identity, settings } = await session.profile.bootstrap();
    expect(settings).toBeNull();
    expect(await session.profile.getIdentity()).toEqual(identity);
    await session.profile.updateSettings({ courseId: "spanish-from-english", dailyGoalXp: 20 });
    const profile = await session.profile.completeOnboarding();
    expect(profile.onboardedAt).not.toBeNull();
    expect((await session.profile.getSettings()).dailyGoalXp).toBe(20);
    await expect(session.profile.updateSettings({ dailyGoalXp: 7 })).rejects.toMatchObject({
      code: "invalid_daily_goal",
    });
  });

  it("does not keep data after the session ends", async () => {
    const device = createDevice();
    const first = await device.open({ forceMemory: true });
    const id = await first.profile.getIdentity();
    first.close();
    const second = await device.open({ forceMemory: true });
    expect(await second.profile.getIdentity()).not.toEqual(id);
  });
});
