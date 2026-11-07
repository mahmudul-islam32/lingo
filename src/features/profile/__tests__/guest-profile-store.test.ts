import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";
import { InvalidDailyGoalError, openLocalSession, type LocalSession } from "@/lib/offline";
import { createGuestProfileStore, selectShowStorageNotice } from "../guest-profile-store";

function storeFor(session: Promise<LocalSession>) {
  return createGuestProfileStore({ loadSession: () => session });
}

describe("guest profile store", () => {
  it("loads the guest on init and exposes profile, settings and storage", async () => {
    const store = storeFor(openLocalSession({ indexedDB: new IDBFactory(), IDBKeyRange }));
    expect(store.getState().status).toBe("idle");
    const pending = store.getState().init();
    expect(store.getState().status).toBe("loading");
    await pending;

    const state = store.getState();
    expect(state.status).toBe("ready");
    expect(state.identity?.kind).toBe("guest");
    expect(state.profile?.id).toBe(state.identity?.kind === "guest" ? state.identity.guestId : "");
    expect(state.settings).toBeNull();
    expect(state.onboardingComplete).toBe(false);
    expect(state.storage?.persistent).toBe(true);
    expect(selectShowStorageNotice(state)).toBe(false);
  });

  it("init runs once even if called repeatedly", async () => {
    const loadSession = vi.fn(() => openLocalSession({ forceMemory: true }));
    const store = createGuestProfileStore({ loadSession });
    await Promise.all([store.getState().init(), store.getState().init()]);
    await store.getState().init();
    // init loads once; later calls reuse the result.
    expect(loadSession).toHaveBeenCalledTimes(1);
  });

  it("updates settings and completes onboarding", async () => {
    const store = storeFor(openLocalSession({ forceMemory: true }));
    await store.getState().init();
    await store.getState().updateSettings({ courseId: "spanish-from-english", dailyGoalXp: 30 });
    expect(store.getState().settings?.dailyGoalXp).toBe(30);
    await store.getState().completeOnboarding();
    expect(store.getState().onboardingComplete).toBe(true);
    expect(store.getState().profile?.onboardedAt).not.toBeNull();
  });

  it("rejects an invalid daily goal and leaves state unchanged", async () => {
    const store = storeFor(openLocalSession({ forceMemory: true }));
    await store.getState().init();
    await expect(
      store.getState().updateSettings({ courseId: "spanish-from-english", dailyGoalXp: 25 }),
    ).rejects.toBeInstanceOf(InvalidDailyGoalError);
    expect(store.getState().settings).toBeNull();
  });

  it("flags the storage notice in memory mode until dismissed", async () => {
    const store = storeFor(openLocalSession({ forceMemory: true }));
    await store.getState().init();
    expect(store.getState().storage?.persistent).toBe(false);
    expect(selectShowStorageNotice(store.getState())).toBe(true);
    store.getState().dismissStorageNotice();
    expect(selectShowStorageNotice(store.getState())).toBe(false);
  });

  it("reports an error status and allows a retry when loading fails", async () => {
    const loadSession = vi
      .fn<() => Promise<LocalSession>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockImplementation(() => openLocalSession({ forceMemory: true }));
    const store = createGuestProfileStore({ loadSession });
    await store.getState().init();
    expect(store.getState()).toMatchObject({ status: "error" });
    expect(store.getState().error?.message).toBe("boom");
    await store.getState().init();
    expect(store.getState().status).toBe("ready");
  });
});
