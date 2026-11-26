import { describe, expect, it } from "vitest";
import { GAME_CONFIG, REVIEW_SESSION_ID, type ReviewItem } from "@/contracts";
import { REVIEW_TITLE, buildReviewLesson } from "./review-lesson";
import { reviewItems } from "./testing/fixtures";

const [mc, wb, mp] = reviewItems as [ReviewItem, ReviewItem, ReviewItem];

function withId(item: ReviewItem, id: string, lessonId = item.lessonId): ReviewItem {
  return { ...item, lessonId, exercise: { ...item.exercise, id } } as ReviewItem;
}

describe("buildReviewLesson (LES-023)", () => {
  it("keeps the given order, uses the reserved ids and the title 'Review', and has no tip", () => {
    const built = buildReviewLesson(reviewItems)!;
    expect(built.lesson).toMatchObject({
      id: REVIEW_SESSION_ID,
      unitId: REVIEW_SESSION_ID,
      courseId: "en-es",
      title: REVIEW_TITLE,
    });
    expect(built.lesson.tip).toBeUndefined();
    expect(built.lesson.exercises.map((e) => e.id)).toEqual(["rv-mc", "rv-wb", "rv-mp"]);
    expect(built.review.sourceLessonIds).toEqual({
      "rv-mc": "u1-l1",
      "rv-wb": "u2-l3",
      "rv-mp": "u1-l1",
    });
  });

  it("returns null for no items", () => {
    expect(buildReviewLesson([])).toBeNull();
  });

  it("keeps the first item per exercise id", () => {
    const built = buildReviewLesson([mc, withId(wb, "rv-mc", "u9-l9"), mp])!;
    expect(built.lesson.exercises.map((e) => e.id)).toEqual(["rv-mc", "rv-mp"]);
    expect(built.review.sourceLessonIds["rv-mc"]).toBe("u1-l1");
  });

  it("drops items of another course, non-reviewable types and the reserved lesson id", () => {
    const speak = {
      ...mc,
      exercise: { id: "rv-sp", type: "speak", phrase: "Hola", translation: "Hello" },
    } as ReviewItem;
    const built = buildReviewLesson([
      mc,
      { ...wb, courseId: "en-de" },
      speak,
      withId(mp, "rv-x", REVIEW_SESSION_ID),
      mp,
    ])!;
    expect(built.lesson.exercises.map((e) => e.id)).toEqual(["rv-mc", "rv-mp"]);
  });

  it("plays at most reviewSessionSize items", () => {
    const many = Array.from({ length: GAME_CONFIG.reviewSessionSize + 3 }, (_, i) =>
      withId(mc, `rv-${i}`),
    );
    expect(buildReviewLesson(many)!.lesson.exercises).toHaveLength(GAME_CONFIG.reviewSessionSize);
  });
});
