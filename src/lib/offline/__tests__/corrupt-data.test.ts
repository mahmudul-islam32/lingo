import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "@/contracts";
import { CURRENT_KEY } from "../store";
import { createDevice, lessonResult } from "./helpers";

const GUEST_ID = "11111111-1111-4111-8111-111111111111";

async function seed(
  device: ReturnType<typeof createDevice>,
  write: (db: ReturnType<typeof device.raw>) => Promise<unknown>,
) {
  const db = device.raw();
  await db.open();
  await write(db);
  db.close();
}

const validProfile = {
  id: GUEST_ID,
  displayName: "Learner",
  avatar: { kind: "initials" },
  joinedAt: "2026-10-01T08:00:00.000Z",
  onboardedAt: null,
  updatedAt: "2026-10-01T08:00:00.000Z",
};

describe("corrupt local data", () => {
  it("recovers the guest id from the profile when the identity record is corrupt", async () => {
    const device = createDevice();
    await seed(device, async (db) => {
      await db.table("identity").put({ kind: "guest", guestId: "not-a-uuid" }, CURRENT_KEY);
      await db.table("profile").put(validProfile, CURRENT_KEY);
    });
    const session = await device.open();
    expect(await session.profile.getIdentity()).toEqual({ kind: "guest", guestId: GUEST_ID });
    expect((await session.profile.getProfile()).joinedAt).toBe(validProfile.joinedAt);
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "identity", action: "recovered" }),
    );
  });

  it("rebuilds a corrupt profile and keeps the identity", async () => {
    const device = createDevice();
    await seed(device, async (db) => {
      await db.table("identity").put({ kind: "guest", guestId: GUEST_ID }, CURRENT_KEY);
      await db.table("profile").put("garbage", CURRENT_KEY);
    });
    const session = await device.open();
    const profile = await session.profile.getProfile();
    expect(profile.id).toBe(GUEST_ID);
    expect(profile.onboardedAt).toBeNull();
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "profile", action: "replaced" }),
    );
  });

  it("replaces an unrecoverable identity with a new guest instead of crashing", async () => {
    const device = createDevice();
    await seed(device, async (db) => {
      await db.table("identity").put(42, CURRENT_KEY);
      await db.table("profile").put({ id: 1 }, CURRENT_KEY);
    });
    const session = await device.open();
    const identity = await session.profile.getIdentity();
    expect(identity.kind).toBe("guest");
    expect((await session.profile.getProfile()).id).toBe(
      identity.kind === "guest" ? identity.guestId : "",
    );
  });

  it("drops corrupt settings so onboarding asks again", async () => {
    const device = createDevice();
    await seed(device, async (db) => {
      await db
        .table("settings")
        .put({ courseId: "spanish-from-english", dailyGoalXp: 15 }, CURRENT_KEY);
    });
    const session = await device.open();
    expect(await session.profile.findSettings()).toBeNull();
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "settings", action: "removed" }),
    );
    // Removed from storage, not just hidden.
    const db = device.raw();
    await db.open();
    expect(await db.table("settings").get(CURRENT_KEY)).toBeUndefined();
    db.close();
  });

  it("resets corrupt hearts to full", async () => {
    const device = createDevice();
    await seed(device, async (db) => {
      await db.table("hearts").put({ current: 9, refillStartedAt: null }, CURRENT_KEY);
    });
    const session = await device.open();
    expect((await session.progress.getHearts()).current).toBe(GAME_CONFIG.maxHearts);
  });

  it("skips corrupt lesson results and sync records", async () => {
    const device = createDevice();
    const good = lessonResult();
    await seed(device, async (db) => {
      await db.table("lessonResults").put(good);
      await db
        .table("lessonResults")
        .put({ id: "bad", courseId: "spanish-from-english", xpEarned: "lots" });
      await db.table("syncQueue").put({ id: "bad", kind: "settings", payload: {} });
    });
    const session = await device.open();
    expect(await session.progress.listLessonResults("spanish-from-english")).toEqual([good]);
    expect(await session.syncQueue.list()).toEqual([]);
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "lessonResults", key: "bad", action: "skipped" }),
    );
    expect(device.report).toHaveBeenCalledWith(
      expect.objectContaining({ table: "syncQueue", key: "bad", action: "skipped" }),
    );
  });
});
