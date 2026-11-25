/**
 * Validates importer output in a scratch dir against the contracts (TELC-001):
 *   TELC_OUT=/path/to/out npx vitest run --config scripts/import-telc/vitest.config.mts
 * Checks each course.json (CourseSchema), each lesson (LessonSchema), manifest ↔ files,
 * and globally unique exercise ids.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CourseSchema, LessonSchema } from "@/contracts";

const OUT = process.env.TELC_OUT ?? join(__dirname, "..", "..", "content", "courses");
const courses = readdirSync(OUT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(OUT, d.name, "course.json")))
  .map((d) => d.name);

const read = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));

describe.each(courses)("%s", (courseId) => {
  const dir = join(OUT, courseId);
  const files = readdirSync(join(dir, "lessons")).filter((f) => f.endsWith(".json"));

  it("course.json is valid", () => {
    const parsed = CourseSchema.safeParse(read(join(dir, "course.json")));
    expect(parsed.error?.issues ?? []).toEqual([]);
    const ids = parsed.data?.units.flatMap((u) => u.lessons.map((l) => l.id)) ?? [];
    expect([...ids].sort()).toEqual(files.map((f) => f.replace(/\.json$/, "")).sort());
  });

  it("every lesson is valid", () => {
    const problems: string[] = [];
    const exerciseIds = new Set<string>();
    for (const f of files) {
      const parsed = LessonSchema.safeParse(read(join(dir, "lessons", f)));
      if (!parsed.success) {
        for (const issue of parsed.error.issues.slice(0, 5)) {
          problems.push(`${f} ${issue.path.join(".")}: ${issue.message}`);
        }
        continue;
      }
      for (const e of parsed.data.exercises) {
        if (exerciseIds.has(e.id)) problems.push(`${f}: duplicate exercise id ${e.id}`);
        exerciseIds.add(e.id);
      }
    }
    expect(problems).toEqual([]);
  });
});
