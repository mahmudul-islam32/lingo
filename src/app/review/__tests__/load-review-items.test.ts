import { describe, expect, it, vi } from "vitest";
import type { Lesson } from "@/contracts";
import { ContentNotFoundError } from "@/lib/content";
import {
  GERMAN_FIXTURE_COURSE_ID as DE,
  GERMAN_FIXTURE_LESSONS,
} from "@/lib/content/__fixtures__/german-fixture-course";
import { loadReviewItems } from "../load-review-items";

const L1 = "de-a1-u01-l1-hallo";
const L2 = "de-a1-u01-l2-wie-geht-s";
const L3 = "de-a1-u02-l1-brot";

function loader(failures: Record<string, Error> = {}) {
  return vi.fn(async (_course: string, lessonId: string): Promise<Lesson> => {
    if (failures[lessonId]) throw failures[lessonId];
    const lesson = GERMAN_FIXTURE_LESSONS[lessonId];
    if (!lesson) throw new ContentNotFoundError("lesson", lessonId);
    return lesson;
  });
}

describe("loadReviewItems (PLT-029 AC 5, 10, 11)", () => {
  it("keeps the ranked order, loads each lesson once and stops at the session size", async () => {
    const loadLesson = loader();
    const result = await loadReviewItems({
      courseId: DE,
      size: 3,
      loadLesson,
      candidates: [
        { lessonId: L2, exerciseId: "de-a1-u01-l2-ex02" },
        { lessonId: L1, exerciseId: "de-a1-u01-l1-ex01" },
        { lessonId: L2, exerciseId: "de-a1-u01-l2-ex01" },
        { lessonId: L3, exerciseId: "de-a1-u02-l1-ex01" },
      ],
    });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.items.map((i) => [i.lessonId, i.exercise.id])).toEqual([
      [L2, "de-a1-u01-l2-ex02"],
      [L1, "de-a1-u01-l1-ex01"],
      [L2, "de-a1-u01-l2-ex01"],
    ]);
    expect(result.items[0]).toMatchObject({ courseId: DE, unitId: "de-a1-u01" });
    expect(loadLesson.mock.calls.map((c) => c[1])).toEqual([L2, L1]);
  });

  it("skips candidates whose lesson or exercise no longer exists", async () => {
    const result = await loadReviewItems({
      courseId: DE,
      loadLesson: loader(),
      candidates: [
        { lessonId: "gone-lesson", exerciseId: "x" },
        { lessonId: L1, exerciseId: "gone-exercise" },
        { lessonId: L1, exerciseId: "de-a1-u01-l1-ex02" },
      ],
    });
    expect(result).toMatchObject({ status: "ok", items: [{ lessonId: L1 }] });
  });

  it("is empty without candidates or when none loads because content is missing", async () => {
    expect(await loadReviewItems({ courseId: DE, loadLesson: loader(), candidates: [] })).toEqual({
      status: "empty",
    });
    expect(
      await loadReviewItems({
        courseId: DE,
        loadLesson: loader(),
        candidates: [{ lessonId: "gone", exerciseId: "x" }],
      }),
    ).toEqual({ status: "empty" });
  });

  it("offline: lessons that can't load are skipped while others play", async () => {
    const result = await loadReviewItems({
      courseId: DE,
      loadLesson: loader({ [L1]: new TypeError("Failed to fetch") }),
      candidates: [
        { lessonId: L1, exerciseId: "de-a1-u01-l1-ex01" },
        { lessonId: L2, exerciseId: "de-a1-u01-l2-ex01" },
      ],
    });
    expect(result).toMatchObject({ status: "ok", items: [{ lessonId: L2 }] });
  });

  it("is an error when every lesson tried failed with a network or storage error", async () => {
    const offline = new TypeError("Failed to fetch");
    const result = await loadReviewItems({
      courseId: DE,
      loadLesson: loader({ [L1]: offline, [L2]: offline }),
      candidates: [
        { lessonId: L1, exerciseId: "de-a1-u01-l1-ex01" },
        { lessonId: L2, exerciseId: "de-a1-u01-l2-ex01" },
      ],
    });
    expect(result).toEqual({ status: "error", error: offline });
  });
});
