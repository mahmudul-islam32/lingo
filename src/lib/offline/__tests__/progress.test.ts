import { describe, expect, it } from "vitest";
import { createDevice, lessonResult, NOW } from "./helpers";

describe("ProgressRepository (local)", () => {
  it("saves a lesson result and enqueues it once, idempotently", async () => {
    const device = createDevice();
    const session = await device.open();
    const result = lessonResult();
    await session.progress.saveLessonResult(result);
    await session.progress.saveLessonResult(result);

    expect(await session.progress.listLessonResults(result.courseId)).toEqual([result]);
    expect(await session.progress.listLessonResults("other-course")).toEqual([]);
    const queue = await session.syncQueue.list();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ id: result.id, kind: "lesson_result", schemaVersion: 1 });
  });

  it("lists results oldest first and never coalesces them", async () => {
    const session = await createDevice().open();
    const later = lessonResult({
      id: "4f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f",
      startedAt: "2026-11-07T12:00:00.000Z",
      completedAt: "2026-11-07T12:05:00.000Z",
    });
    await session.progress.saveLessonResult(later);
    await session.progress.saveLessonResult(lessonResult());
    const list = await session.progress.listLessonResults("spanish-from-english");
    expect(list.map((r) => r.completedAt)).toEqual([
      "2026-11-07T10:04:30.000Z",
      "2026-11-07T12:05:00.000Z",
    ]);
    expect(await session.syncQueue.list()).toHaveLength(2);
  });

  it("rejects an invalid lesson result and stores nothing", async () => {
    const session = await createDevice().open();
    await expect(
      session.progress.saveLessonResult(lessonResult({ accuracy: 2 })),
    ).rejects.toMatchObject({ code: "invalid_record" });
    expect(await session.progress.listLessonResults("spanish-from-english")).toEqual([]);
    expect(await session.syncQueue.list()).toEqual([]);
  });

  it("saves hearts (LWW, one pending record) and rejects invalid hearts", async () => {
    const session = await createDevice().open();
    const losing = { current: 4, refillStartedAt: NOW.toISOString(), updatedAt: NOW.toISOString() };
    await session.progress.saveHearts(losing);
    await session.progress.saveHearts({ ...losing, current: 3 });
    expect((await session.progress.getHearts()).current).toBe(3);
    expect((await session.syncQueue.list()).filter((r) => r.kind === "hearts")).toHaveLength(1);

    await expect(
      session.progress.saveHearts({
        current: 4,
        refillStartedAt: null,
        updatedAt: NOW.toISOString(),
      }),
    ).rejects.toMatchObject({ code: "invalid_record" });
    expect((await session.progress.getHearts()).current).toBe(3);
  });
});
