// @vitest-environment node
/**
 * Validates every course JSON in /content against the contracts, plus cross-file
 * rules the single-file schemas cannot see. Layout (ARCHITECTURE.md §Content):
 *   content/courses/<courseId>/course.json
 *   content/courses/<courseId>/lessons/<lessonId>.json
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CourseSchema, LessonSchema } from "../index";

const COURSES_DIR = join(process.cwd(), "content", "courses");
const PUBLIC_DIR = join(process.cwd(), "public");
const REQUIRE_AUDIO = process.env.CONTENT_REQUIRE_AUDIO === "1";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

const courseIds = existsSync(COURSES_DIR)
  ? readdirSync(COURSES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

describe("content/courses", () => {
  it("layout is readable and ships the en-de and en-es courses (CTO-008)", () => {
    expect(courseIds).toEqual(expect.arrayContaining(["en-de", "en-es"]));
  });

  const lessonPaths = courseIds.flatMap((id) => {
    const dir = join(COURSES_DIR, id, "lessons");
    return existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .map((f) => join(dir, f))
      : [];
  });
  const duplicates = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

  it("lesson ids are unique across all courses (the route is /lesson/<lessonId>)", () => {
    const manifestIds = courseIds.flatMap((id) => {
      const course = CourseSchema.safeParse(readJson(join(COURSES_DIR, id, "course.json")));
      return (course.data?.units ?? []).flatMap((u) => u.lessons.map((l) => l.id));
    });
    expect(duplicates(manifestIds)).toEqual([]);
    expect(duplicates(lessonPaths.map((p) => p.split(/[\\/]/).at(-1)!))).toEqual([]);
  });

  it("exercise ids are unique across all lessons of all courses (CTO-008)", () => {
    const ids = lessonPaths.flatMap((path) => {
      const lesson = LessonSchema.safeParse(readJson(path));
      return (lesson.data?.exercises ?? []).map((e) => e.id);
    });
    expect(duplicates(ids)).toEqual([]);
  });

  it("en-de is German for English speakers with CEFR levels on every unit (ADR-008)", () => {
    const course = CourseSchema.parse(readJson(join(COURSES_DIR, "en-de", "course.json")));
    expect(course).toMatchObject({ learningLanguage: "de", knownLanguage: "en" });
    expect(course.levels?.[0]?.level).toBe("A1");
    expect(course.units.every((u) => u.level !== undefined)).toBe(true);
  });

  describe.each(courseIds)("course %s", (courseDir) => {
    const dir = join(COURSES_DIR, courseDir);
    const lessonsDir = join(dir, "lessons");
    const course = CourseSchema.safeParse(readJson(join(dir, "course.json")));

    it("course.json matches CourseSchema", () => {
      expect(course.error?.issues ?? []).toEqual([]);
      expect(course.data?.id).toBe(courseDir);
    });

    const lessonFiles = existsSync(lessonsDir)
      ? readdirSync(lessonsDir).filter((f) => f.endsWith(".json"))
      : [];

    it("has exactly one lesson file per lesson in the manifest", () => {
      const manifestIds = (course.data?.units ?? []).flatMap((u) => u.lessons.map((l) => l.id));
      const fileIds = lessonFiles.map((f) => f.replace(/\.json$/, ""));
      expect([...fileIds].sort()).toEqual([...manifestIds].sort());
    });

    it.each(lessonFiles)("lessons/%s matches LessonSchema and its manifest entry", (file) => {
      const lesson = LessonSchema.safeParse(readJson(join(lessonsDir, file)));
      expect(lesson.error?.issues ?? []).toEqual([]);
      if (!lesson.data || !course.data) return;
      expect(lesson.data.id).toBe(file.replace(/\.json$/, ""));
      expect(lesson.data.courseId).toBe(course.data.id);
      const unit = course.data.units.find((u) => u.lessons.some((l) => l.id === lesson.data.id));
      expect(unit?.id).toBe(lesson.data.unitId);
    });

    // Enforced once real/placeholder audio ships (PRD Q7); CI enables it then.
    it.runIf(REQUIRE_AUDIO).each(lessonFiles)(
      "lessons/%s only references existing audio",
      (file) => {
        const lesson = LessonSchema.safeParse(readJson(join(lessonsDir, file)));
        const paths = (lesson.data?.exercises ?? []).flatMap((e) =>
          "audio" in e && e.audio
            ? [e.audio.src, ...(e.audio.slowSrc ? [e.audio.slowSrc] : [])]
            : [],
        );
        const missing = paths.filter((p) => !existsSync(join(PUBLIC_DIR, p)));
        expect(missing).toEqual([]);
      },
    );
  });
});
