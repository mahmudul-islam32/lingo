import { describe, expect, it } from "vitest";
import { createDevice, NOW } from "./helpers";

describe("SyncQueueStore", () => {
  it("lists due records, updates and removes them", async () => {
    const session = await createDevice().open();
    await session.profile.updateSettings({ courseId: "spanish-from-english", dailyGoalXp: 20 });
    const [record] = await session.syncQueue.list();
    expect(record).toBeDefined();
    expect(await session.syncQueue.listDue(NOW)).toHaveLength(1);

    const later = new Date(NOW.getTime() + 60_000).toISOString();
    await session.syncQueue.update({
      ...record!,
      attemptCount: 1,
      nextAttemptAt: later,
      lastError: "503",
    });
    expect(await session.syncQueue.listDue(NOW)).toEqual([]);
    expect(await session.syncQueue.get(record!.id)).toMatchObject({ attemptCount: 1 });

    await expect(session.syncQueue.update({ ...record!, attemptCount: -1 })).rejects.toMatchObject({
      code: "invalid_record",
    });

    await session.syncQueue.remove(record!.id);
    expect(await session.syncQueue.list()).toEqual([]);
    expect(await session.syncQueue.get(record!.id)).toBeNull();
  });

  it("does not drop rejected records when coalescing", async () => {
    const session = await createDevice().open();
    await session.profile.updateSettings({ courseId: "spanish-from-english", dailyGoalXp: 20 });
    const [first] = await session.syncQueue.list();
    await session.syncQueue.update({ ...first!, status: "rejected" });
    await session.profile.updateSettings({ dailyGoalXp: 30 });
    const statuses = (await session.syncQueue.list()).map((r) => r.status).sort();
    expect(statuses).toEqual(["pending", "rejected"]);
  });
});
