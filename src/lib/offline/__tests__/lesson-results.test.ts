import Dexie from "dexie";
import { IDBKeyRange } from "fake-indexeddb";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DexieLocalStore, PolyglowDatabase, SCHEMA_VERSIONS } from "../db";
import { LocalDataError, StorageError } from "../errors";
import { createDevice, lessonResult } from "./helpers";

afterEach(() => vi.restoreAllMocks());

/** PLT-008: lesson results saved on the device through ProgressRepository. */
describe("saving lesson results (PLT-008)", () => {
  it("stores the device-local date and timezone, and a pending sync record", async () => {
    const session = await createDevice().open();
    const result = lessonResult({ localDate: "2026-11-08", timeZone: "Pacific/Auckland" });
    await session.progress.saveLessonResult(result);

    const [stored] = await session.progress.listLessonResults(result.courseId);
    expect(stored).toMatchObject({ localDate: "2026-11-08", timeZone: "Pacific/Auckland" });
    const queue = await session.syncQueue.list();
    expect(queue).toEqual([
      expect.objectContaining({
        id: result.id,
        kind: "lesson_result",
        status: "pending",
        attemptCount: 0,
        lastError: null,
        payload: result,
      }),
    ]);
  });

  it("is idempotent: the same result id twice is one result and one queue record", async () => {
    const session = await createDevice().open();
    const result = lessonResult();
    await session.progress.saveLessonResult(result);
    // A replay of the same save must not overwrite the immutable result.
    await session.progress.saveLessonResult({ ...result, durationMs: 1 });
    const list = await session.progress.listLessonResults(result.courseId);
    expect(list).toEqual([result]);
    expect(await session.syncQueue.list()).toHaveLength(1);
  });

  it("reads the completed lesson ids of a course (distinct lessonIds)", async () => {
    const session = await createDevice().open();
    await session.progress.saveLessonResult(lessonResult());
    await session.progress.saveLessonResult(
      lessonResult({ id: "5f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f" }),
    );
    await session.progress.saveLessonResult(
      lessonResult({ id: "6f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f", lessonId: "greetings-2" }),
    );
    await session.progress.saveLessonResult(
      lessonResult({ id: "7f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f", courseId: "other" }),
    );
    const results = await session.progress.listLessonResults("spanish-from-english");
    expect(new Set(results.map((r) => r.lessonId))).toEqual(
      new Set(["greetings-1", "greetings-2"]),
    );
  });

  it("keeps results across sessions (reload) on the same device", async () => {
    const device = createDevice();
    const first = await device.open();
    await first.progress.saveLessonResult(lessonResult());
    first.close();
    const second = await device.open();
    expect(await second.progress.listLessonResults("spanish-from-english")).toHaveLength(1);
  });

  it("wraps storage failures in a typed StorageError with the cause", async () => {
    const session = await createDevice().open();
    const cause = new DOMException("Quota exceeded", "QuotaExceededError");
    vi.spyOn(DexieLocalStore.prototype, "transaction").mockRejectedValue(cause);
    const error = await session.progress.saveLessonResult(lessonResult()).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error).toBeInstanceOf(LocalDataError);
    expect(error).toMatchObject({ code: "storage_failed", operation: "saveLessonResult", cause });
    await expect(session.progress.listLessonResults("x")).rejects.toBeInstanceOf(StorageError);
  });

  it("reports a closed database as a StorageError, not a crash", async () => {
    const session = await createDevice().open();
    session.close();
    await expect(session.progress.saveLessonResult(lessonResult())).rejects.toMatchObject({
      code: "storage_failed",
    });
  });

  it("keeps validation errors as they are (not wrapped)", async () => {
    const session = await createDevice().open();
    await expect(
      session.progress.saveLessonResult(lessonResult({ accuracy: 2 })),
    ).rejects.toMatchObject({ code: "invalid_record" });
  });

  it("saves results in a database created by PLT-003 and keeps the guest profile", async () => {
    // PLT-003 already shipped `lessonResults` and `syncQueue` in schema v1, so PLT-008
    // needs no new Dexie version: an existing v1 database is used as it is.
    expect(SCHEMA_VERSIONS.map((v) => v.version)).toEqual([1]);
    const device = createDevice();
    const first = await device.open();
    const { profile } = await first.profile.bootstrap();
    first.close();

    const raw = new Dexie("polyglow", { indexedDB: device.factory, IDBKeyRange });
    await raw.open();
    expect(raw.verno).toBe(1);
    raw.close();

    const second = await device.open();
    await second.progress.saveLessonResult(lessonResult());
    expect((await second.profile.getProfile()).id).toBe(profile.id);
    expect(await second.progress.listLessonResults("spanish-from-english")).toHaveLength(1);
    expect(device.raw()).toBeInstanceOf(PolyglowDatabase);
  });
});
