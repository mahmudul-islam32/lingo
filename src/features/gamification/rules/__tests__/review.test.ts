import { describe, expect, it } from "vitest";
import {
  CourseSchema,
  GAME_CONFIG,
  ReviewSelectionSchema,
  type Course,
  type LessonResult,
} from "@/contracts";
import enDeCourse from "../../../../../content/courses/en-de/course.json";
import { reviewIntervalDays, reviewSchedule, selectReviewItems } from "../review";
import { makeOutcomeResult } from "./fixtures";

const DE: Course = CourseSchema.parse(enDeCourse);
const LESSONS = DE.units.flatMap((u) => u.lessons.map((l) => l.id));
const L1 = LESSONS[0]!;
const L2 = LESSONS[1]!;
const L3 = LESSONS[2]!;
const GONE = "de-a1-removed-lesson";
const TODAY = "2026-12-10";

type Outcome = "correct" | "incorrect" | "skipped";
const answer = (
  exerciseId: string,
  date: string,
  outcome: Outcome,
  extra: { lessonId?: string; type?: "speak" | "listen"; time?: string; courseId?: string } = {},
): LessonResult =>
  makeOutcomeResult({
    courseId: extra.courseId ?? DE.id,
    lessonId: extra.lessonId ?? L1,
    date,
    ...(extra.time ? { time: extra.time } : {}),
    outcomes: [[exerciseId, outcome, extra.type]],
  });

const select = (results: LessonResult[], today = TODAY) =>
  ReviewSelectionSchema.parse(selectReviewItems({ course: DE, results, today }));
const ids = (results: LessonResult[], today = TODAY) =>
  select(results, today).candidates.map((c) => c.exerciseId);

describe("reviewIntervalDays (GAM-015 AC2)", () => {
  it("0 without a correct run, then the configured intervals, capped at the last", () => {
    expect(GAME_CONFIG.reviewIntervalsDays).toEqual([1, 3, 7, 14, 30]);
    expect([0, 1, 2, 3, 4, 5, 6, 40].map((run) => reviewIntervalDays(run))).toEqual([
      0, 1, 3, 7, 14, 30, 30, 30,
    ]);
    expect(reviewIntervalDays(3, [2])).toBe(2);
  });
});

describe("selectReviewItems worked example (GAM-015 AC5)", () => {
  const results: LessonResult[] = [
    answer("a", "2026-12-09", "incorrect"),
    answer("b", "2026-12-09", "correct"),
    answer("c", "2026-12-08", "correct"),
    answer("c", "2026-12-09", "correct"),
    answer("d", "2026-12-01", "incorrect"),
    answer("d", "2026-12-02", "correct"),
    answer("d", "2026-12-05", "correct"),
    ...["10-01", "10-05", "10-10", "10-20", "11-01"].map((d) =>
      answer("e", `2026-${d}`, "correct"),
    ),
    ...["09-01", "09-05", "09-10", "09-20", "10-10", "11-20"].map((d) =>
      answer("f", `2026-${d}`, "correct"),
    ),
    answer("g", "2026-12-09", "skipped"),
    answer("h", "2026-12-01", "incorrect", { type: "speak" }),
  ];
  // I: a lesson that is no longer in the manifest (a lesson result of a removed lesson).
  results.push(answer("i", "2026-12-01", "incorrect", { lessonId: GONE }));

  it("orders A, B, D, E, C, F with dueCount 4 and eligibleCount 6", () => {
    const selection = select(results);
    expect(selection.candidates.map((c) => c.exerciseId)).toEqual(["a", "b", "d", "e", "c", "f"]);
    expect(selection.candidates.every((c) => c.lessonId === L1)).toBe(true);
    expect(selection.dueCount).toBe(4);
    expect(selection.eligibleCount).toBe(6);
  });

  it("derives each exercise's run and due date", () => {
    const byId = Object.fromEntries(
      reviewSchedule({ course: DE, results, today: TODAY }).map((e) => [e.exerciseId, e]),
    );
    expect(byId.a).toMatchObject({ correctRun: 0, dueDate: "2026-12-09", due: true });
    expect(byId.b).toMatchObject({ correctRun: 1, dueDate: "2026-12-10", due: true });
    expect(byId.c).toMatchObject({ correctRun: 2, dueDate: "2026-12-12", due: false });
    expect(byId.d).toMatchObject({ correctRun: 2, dueDate: "2026-12-08", due: true });
    expect(byId.e).toMatchObject({ correctRun: 5, dueDate: "2026-12-01", due: true });
    expect(byId.f).toMatchObject({ correctRun: 6, dueDate: "2026-12-20", due: false });
    expect(byId.g).toBeUndefined();
    expect(byId.h).toBeUndefined();
    expect(byId.i).toBeUndefined();
  });

  it("does not depend on the input order of the results", () => {
    expect(ids([...results].reverse())).toEqual(["a", "b", "d", "e", "c", "f"]);
  });
});

describe("selectReviewItems rules (GAM-015 AC1–AC4, AC6)", () => {
  it("is empty without history or for results without outcomes (PD-080)", () => {
    expect(select([])).toEqual({ candidates: [], dueCount: 0, eligibleCount: 0 });
    const legacy = makeOutcomeResult({ courseId: DE.id, lessonId: L1, date: TODAY, outcomes: [] });
    const withoutOutcomes: LessonResult = { ...legacy };
    delete withoutOutcomes.exerciseOutcomes;
    expect(select([withoutOutcomes, legacy])).toEqual({
      candidates: [],
      dueCount: 0,
      eligibleCount: 0,
    });
  });

  it("a wrong answer after a correct run resets the run (latest by completedAt)", () => {
    const history = [
      answer("x", "2026-12-01", "correct"),
      answer("x", "2026-12-02", "correct"),
      answer("x", "2026-12-09", "incorrect", { time: "09:00" }),
      answer("x", "2026-12-09", "correct", { time: "08:00" }),
    ];
    const [entry] = reviewSchedule({ course: DE, results: history, today: TODAY });
    expect(entry).toMatchObject({ correctRun: 0, lastSeen: "2026-12-09", due: true });
  });

  it("skipped outcomes neither break nor extend a run", () => {
    const history = [answer("x", "2026-12-08", "correct"), answer("x", "2026-12-09", "skipped")];
    const [entry] = reviewSchedule({ course: DE, results: history, today: TODAY });
    expect(entry).toMatchObject({ correctRun: 1, lastSeen: "2026-12-08", dueDate: "2026-12-09" });
  });

  it("ignores other courses' results", () => {
    expect(ids([answer("x", "2026-12-09", "incorrect", { courseId: "telc-b1-en-de" })])).toEqual(
      [],
    );
  });

  it("counts review results' outcomes against their source lessons", () => {
    const review = makeOutcomeResult({
      courseId: DE.id,
      lessonId: L2,
      kind: "review",
      date: "2026-12-09",
      outcomes: [
        ["y", "incorrect", "listen", L2],
        ["z", "correct", "multiple_choice", L1],
      ],
    });
    const selection = select([answer("y", "2026-12-01", "correct", { lessonId: L2 }), review]);
    expect(selection.candidates).toEqual([
      { lessonId: L2, exerciseId: "y" },
      { lessonId: L1, exerciseId: "z" },
    ]);
    expect(selection.dueCount).toBe(2);
  });

  it("not-due exercises still come after every due one, in the same order rules", () => {
    const history = [
      answer("n1", "2026-12-09", "correct", { time: "09:00" }), // run 1, due 12-10 → due
      answer("n2", "2026-12-10", "correct"), // run 1, due 12-11 → not due
      answer("n3", "2026-12-10", "incorrect"), // run 0 → due
    ];
    const selection = select(history);
    expect(selection.candidates.map((c) => c.exerciseId)).toEqual(["n3", "n1", "n2"]);
    expect(selection.dueCount).toBe(2);
  });

  it("ties: dueDate, then course order, then position in the latest result, then id", () => {
    const sameRun = [
      answer("late", "2026-12-08", "incorrect"),
      answer("early", "2026-12-07", "incorrect"),
    ];
    expect(ids(sameRun)).toEqual(["early", "late"]);

    const byLesson = [
      answer("in-l3", "2026-12-09", "incorrect", { lessonId: L3 }),
      answer("in-l1", "2026-12-09", "incorrect", { lessonId: L1 }),
    ];
    expect(ids(byLesson)).toEqual(["in-l1", "in-l3"]);

    const byPosition = makeOutcomeResult({
      courseId: DE.id,
      lessonId: L1,
      date: "2026-12-09",
      outcomes: [
        ["p-b", "incorrect"],
        ["p-a", "incorrect"],
      ],
    });
    expect(ids([byPosition])).toEqual(["p-b", "p-a"]);

    const byId = [
      answer("id-b", "2026-12-09", "incorrect", { time: "08:00" }),
      answer("id-a", "2026-12-09", "incorrect", { time: "09:00" }),
    ];
    expect(ids(byId)).toEqual(["id-a", "id-b"]);
    expect(ids([...byId].reverse())).toEqual(["id-a", "id-b"]);
    const many = ["id-d", "id-a", "id-c", "id-b"].map((id) =>
      answer(id, "2026-12-09", "incorrect"),
    );
    expect(ids(many)).toEqual(["id-a", "id-b", "id-c", "id-d"]);
  });

  it("keeps only the first candidate per exerciseId", () => {
    const history = [
      answer("same", "2026-12-09", "incorrect", { lessonId: L2 }),
      answer("same", "2026-12-09", "correct", { lessonId: L1 }),
    ];
    const selection = select(history);
    expect(selection.candidates).toEqual([{ lessonId: L2, exerciseId: "same" }]);
    expect(selection.eligibleCount).toBe(2);
    expect(selection.dueCount).toBe(2);
  });

  it("is pure: the input results are not changed", () => {
    const history = Object.freeze([
      Object.freeze(answer("x", "2026-12-09", "incorrect")),
      Object.freeze(answer("y", "2026-12-08", "correct")),
    ]) as readonly LessonResult[];
    const before = JSON.stringify(history);
    selectReviewItems({ course: DE, results: history, today: TODAY });
    expect(JSON.stringify(history)).toBe(before);
  });
});
