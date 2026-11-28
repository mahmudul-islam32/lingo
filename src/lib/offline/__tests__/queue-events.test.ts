import { describe, expect, it, vi } from "vitest";
import { onSyncQueueChanged } from "../queue-events";
import { createDevice, lessonResult } from "./helpers";

describe("sync queue events (PLT-014 criterion 2)", () => {
  it("notifies once per committed write that queued a record, never for reads", async () => {
    const session = await createDevice().open();
    const listener = vi.fn();
    const off = onSyncQueueChanged(listener);
    await session.progress.listLessonResults("en-de");
    await session.profile.findSettings();
    expect(listener).not.toHaveBeenCalled();
    await session.progress.saveLessonResult(lessonResult());
    expect(listener).toHaveBeenCalledTimes(1);
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
    expect(listener).toHaveBeenCalledTimes(2);
    off();
    await session.progress.saveHearts({
      current: 5,
      refillStartedAt: null,
      updatedAt: new Date().toISOString(),
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
