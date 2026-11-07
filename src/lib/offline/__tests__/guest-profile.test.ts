import { afterEach, describe, expect, it, vi } from "vitest";
import { DAILY_GOAL_OPTIONS, GAME_CONFIG, IdentitySchema, ProfileSchema } from "@/contracts";
import {
  InvalidDailyGoalError,
  LocalDataError,
  OnboardingPrerequisitesError,
  SettingsIncompleteError,
  SettingsNotSetError,
} from "../errors";
import { createDevice, NOW, UUID_RE } from "./helpers";
import { newUuid } from "../ids";

const COURSE = "spanish-from-english";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("first visit", () => {
  it("creates a guest with a random UUID, createdAt and default settings", async () => {
    const device = createDevice();
    const session = await device.open({ newId: newUuid });
    const result = await session.profile.bootstrap();

    expect(session.storage).toEqual({ kind: "indexeddb", persistent: true, fallbackReason: null });
    expect(result.identity.kind).toBe("guest");
    expect(IdentitySchema.parse(result.identity)).toEqual(result.identity);
    const guestId = result.identity.kind === "guest" ? result.identity.guestId : "";
    expect(guestId).toMatch(UUID_RE);

    expect(ProfileSchema.parse(result.profile)).toEqual(result.profile);
    expect(result.profile).toEqual({
      id: guestId,
      displayName: "Learner",
      avatar: { kind: "initials" },
      joinedAt: NOW.toISOString(),
      onboardedAt: null,
      updatedAt: NOW.toISOString(),
    });
    // No course, no daily goal, onboarding not complete.
    expect(result.settings).toBeNull();
    await expect(session.profile.getSettings()).rejects.toBeInstanceOf(SettingsNotSetError);
    expect(await session.progress.getHearts()).toEqual({
      current: GAME_CONFIG.maxHearts,
      refillStartedAt: null,
      updatedAt: NOW.toISOString(),
    });
    // Creating the guest enqueues nothing (guests have nothing to sync yet).
    expect(await session.syncQueue.list()).toEqual([]);
  });

  it("is idempotent: repeated bootstraps return the same guest", async () => {
    const session = await createDevice().open({ forceMemory: true, newId: newUuid });
    const first = await session.profile.bootstrap();
    expect(await session.profile.bootstrap()).toEqual(first);
  });

  it("generates distinct ids on different devices", async () => {
    const a = await (await createDevice().open({ newId: newUuid })).profile.getIdentity();
    const b = await (await createDevice().open({ newId: newUuid })).profile.getIdentity();
    expect(a).not.toEqual(b);
  });

  it("stores no personal data: no email, no chosen name", async () => {
    const session = await createDevice().open();
    const { profile } = await session.profile.bootstrap();
    expect(JSON.stringify(profile)).not.toMatch(/@|email/i);
    expect(Object.keys(profile).sort()).toEqual(
      ["avatar", "displayName", "id", "joinedAt", "onboardedAt", "updatedAt"].sort(),
    );
  });
});

describe("persistence across reloads", () => {
  it("keeps the same id after a reload and after closing and reopening the browser", async () => {
    const device = createDevice();
    const first = await device.open({ newId: newUuid });
    const id = await first.profile.getIdentity();
    first.close();

    // Reload: a new session on the same IndexedDB.
    const second = await device.open({ newId: newUuid });
    expect(await second.profile.getIdentity()).toEqual(id);
    expect((await second.profile.bootstrap()).profile.joinedAt).toBe(NOW.toISOString());
    second.close();

    // Browser closed and reopened: another new session, same storage.
    const third = await device.open({ newId: newUuid });
    expect(await third.progress.getIdentity()).toEqual(id);
    expect((await third.profile.getProfile()).joinedAt).toBe(NOW.toISOString());
  });

  it("creates only one guest when two tabs start at the same time", async () => {
    const device = createDevice();
    const [a, b] = await Promise.all([
      device.open({ newId: newUuid }),
      device.open({ newId: newUuid }),
    ]);
    const [idA, idB] = await Promise.all([a.profile.getIdentity(), b.profile.getIdentity()]);
    expect(idA).toEqual(idB);
  });
});

describe("no network", () => {
  it("creates and reads the guest without any network request, even offline", async () => {
    const fetchSpy = vi.fn(() => Promise.reject(new TypeError("offline")));
    const xhrSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("XMLHttpRequest", xhrSpy);
    vi.stubGlobal("WebSocket", xhrSpy);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

    const device = createDevice();
    const session = await device.open();
    await session.profile.bootstrap();
    await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 20 });
    await session.profile.completeOnboarding();
    session.close();
    await (await device.open()).profile.getProfile();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
  });
});

describe("settings", () => {
  it("saves course and daily goal and keeps them after a reload", async () => {
    const device = createDevice();
    const session = await device.open();
    const saved = await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 30 });
    expect(saved).toEqual({
      courseId: COURSE,
      dailyGoalXp: 30,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: NOW.toISOString(),
    });
    session.close();

    const reloaded = await device.open();
    expect(await reloaded.profile.getSettings()).toEqual(saved);
    expect((await reloaded.profile.bootstrap()).settings).toEqual(saved);
  });

  it("updates one field at a time once settings exist", async () => {
    const session = await createDevice().open();
    await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 10 });
    const next = await session.profile.updateSettings({ dailyGoalXp: 50 });
    expect(next.dailyGoalXp).toBe(50);
    expect(next.courseId).toBe(COURSE);
    const muted = await session.profile.updateSettings({ soundEffectsEnabled: false });
    expect(muted).toMatchObject({ dailyGoalXp: 50, soundEffectsEnabled: false });
  });

  it("accepts every allowed daily goal option", async () => {
    const session = await createDevice().open();
    for (const goal of DAILY_GOAL_OPTIONS) {
      const saved = await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: goal });
      expect(saved.dailyGoalXp).toBe(goal);
    }
  });

  it("requires course and daily goal on the first update", async () => {
    const session = await createDevice().open();
    const error = await session.profile.updateSettings({ courseId: COURSE }).catch((e) => e);
    expect(error).toBeInstanceOf(SettingsIncompleteError);
    expect((error as SettingsIncompleteError).missing).toEqual(["dailyGoalXp"]);
    expect(await session.profile.findSettings()).toBeNull();
  });

  it("enqueues settings for sync, keeping only the latest pending record", async () => {
    const session = await createDevice().open();
    await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 10 });
    await session.profile.updateSettings({ dailyGoalXp: 20 });
    const queue = await session.syncQueue.list();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ kind: "settings", status: "pending", attemptCount: 0 });
    expect(queue[0]!.kind === "settings" && queue[0]!.payload.dailyGoalXp).toBe(20);
  });

  it("saveSettings stores a full valid Settings record", async () => {
    const session = await createDevice().open();
    const settings = {
      courseId: COURSE,
      dailyGoalXp: 20 as const,
      soundEffectsEnabled: false,
      speakingExercisesEnabled: false,
      updatedAt: NOW.toISOString(),
    };
    await session.profile.saveSettings(settings);
    expect(await session.profile.getSettings()).toEqual(settings);
  });
});

describe("invalid daily goal", () => {
  it.each([0, 15, 25, 100, -10, 20.5, Number.NaN])(
    "rejects %s with a typed error and stores nothing",
    async (goal) => {
      const session = await createDevice().open();
      const error = await session.profile
        .updateSettings({ courseId: COURSE, dailyGoalXp: goal })
        .catch((e) => e);
      expect(error).toBeInstanceOf(InvalidDailyGoalError);
      expect(error).toBeInstanceOf(LocalDataError);
      expect((error as InvalidDailyGoalError).code).toBe("invalid_daily_goal");
      expect((error as InvalidDailyGoalError).allowed).toEqual(DAILY_GOAL_OPTIONS);
      expect(await session.profile.findSettings()).toBeNull();
      expect(await session.syncQueue.list()).toEqual([]);
    },
  );

  it("keeps the previous goal when an invalid one is submitted", async () => {
    const session = await createDevice().open();
    await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 20 });
    await expect(session.profile.updateSettings({ dailyGoalXp: 40 })).rejects.toBeInstanceOf(
      InvalidDailyGoalError,
    );
    expect((await session.profile.getSettings()).dailyGoalXp).toBe(20);
  });

  it("is also rejected by saveSettings", async () => {
    const session = await createDevice().open();
    const bad = {
      courseId: COURSE,
      dailyGoalXp: 15,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
      updatedAt: NOW.toISOString(),
    };
    // @ts-expect-error 15 is not a DailyGoalXp: the runtime check must catch it too.
    await expect(session.profile.saveSettings(bad)).rejects.toBeInstanceOf(InvalidDailyGoalError);
    expect(await session.profile.findSettings()).toBeNull();
  });
});

describe("onboarding", () => {
  it("can't be completed before course and goal are saved", async () => {
    const session = await createDevice().open();
    await expect(session.profile.completeOnboarding()).rejects.toBeInstanceOf(
      OnboardingPrerequisitesError,
    );
    expect((await session.profile.getProfile()).onboardedAt).toBeNull();
  });

  it("sets onboardedAt, persists it and is idempotent", async () => {
    const device = createDevice();
    let tick = NOW.getTime();
    const session = await device.open({ now: () => new Date((tick += 1000)) });
    await session.profile.updateSettings({ courseId: COURSE, dailyGoalXp: 20 });
    const done = await session.profile.completeOnboarding();
    expect(done.onboardedAt).not.toBeNull();
    const again = await session.profile.completeOnboarding();
    expect(again.onboardedAt).toBe(done.onboardedAt);
    session.close();

    const reloaded = await device.open();
    expect((await reloaded.profile.getProfile()).onboardedAt).toBe(done.onboardedAt);
    const queue = await reloaded.syncQueue.list();
    expect(queue.map((r) => r.kind).sort()).toEqual(["profile", "settings"]);
  });
});

describe("profile updates", () => {
  it("updates editable fields and rejects invalid ones", async () => {
    const session = await createDevice().open();
    const profile = await session.profile.getProfile();
    const updated = await session.profile.updateProfile({
      displayName: "Ana",
      avatar: profile.avatar,
      onboardedAt: profile.onboardedAt,
      updatedAt: "2026-11-07T11:00:00.000Z",
    });
    expect(updated).toMatchObject({
      id: profile.id,
      displayName: "Ana",
      joinedAt: profile.joinedAt,
    });
    await expect(
      session.profile.updateProfile({ ...updated, displayName: "   " }),
    ).rejects.toMatchObject({ code: "invalid_profile_update" });
    expect((await session.profile.getProfile()).displayName).toBe("Ana");
  });
});
