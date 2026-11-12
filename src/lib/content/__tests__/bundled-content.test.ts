// @vitest-environment node
/** Guards the hand-written loader map: it must match the manifest and the files. */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CourseSchema } from "@/contracts";
import { BUNDLED_CONTENT, BUNDLED_COURSE_MANIFESTS } from "../bundled-content";

const COURSES_DIR = join(process.cwd(), "content", "courses");
const courseDirs = readdirSync(COURSES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("BUNDLED_CONTENT", () => {
  it("bundles every course in /content", () => {
    expect(Object.keys(BUNDLED_CONTENT.courses).sort()).toEqual([...courseDirs].sort());
    expect(Object.keys(BUNDLED_COURSE_MANIFESTS).sort()).toEqual([...courseDirs].sort());
  });

  it.each(courseDirs)("has one lesson loader per manifest lesson and file (%s)", (courseId) => {
    const course = CourseSchema.parse(BUNDLED_COURSE_MANIFESTS[courseId]);
    const manifestIds = course.units.flatMap((u) => u.lessons.map((l) => l.id)).sort();
    const fileIds = readdirSync(join(COURSES_DIR, courseId, "lessons"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(Object.keys(BUNDLED_CONTENT.lessons[courseId] ?? {}).sort()).toEqual(manifestIds);
    expect(fileIds).toEqual(manifestIds);
  });
});
