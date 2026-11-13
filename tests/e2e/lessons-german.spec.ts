import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";

/**
 * LES-014 AC 7-9 in a real browser: a German lesson with long compounds
 * ("Versichertenkarte", "Krankenkasse", "Wartezimmer"), umlauts and `ß`, played at
 * 375 x 667. Every exercise must fit the viewport (no horizontal scrolling) and each
 * exercise type must have no serious or critical axe violations.
 *
 * The lesson is Unit 11 Lesson 4 of `content/courses/en-de`; earlier lessons are marked
 * complete by seeding lesson results on the device so the path rule unlocks it.
 */
const COURSE_DIR = path.join(process.cwd(), "content/courses/en-de");
const LESSON_ID = "de-a1-u11-l4-reception";

interface CourseFile {
  units: { id: string; lessons: { id: string }[] }[];
}

type Exercise =
  | {
      id: string;
      type: "multiple_choice";
      options: { id: string; text: string }[];
      correctOptionId: string;
    }
  | { id: string; type: "match_pairs"; pairs: { learning: string; known: string }[] }
  | { id: string; type: "word_bank_translate" | "listen"; tiles: string[]; answers: string[] }
  | { id: string; type: string };

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(COURSE_DIR, file), "utf8")) as T;
}

/** Lessons before `LESSON_ID` in course order, with their unit id. */
function lessonsBefore(): { unitId: string; lessonId: string }[] {
  const course = readJson<CourseFile>("course.json");
  const result: { unitId: string; lessonId: string }[] = [];
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (lesson.id === LESSON_ID) return result;
      result.push({ unitId: unit.id, lessonId: lesson.id });
    }
  }
  throw new Error(`${LESSON_ID} not found in course.json`);
}

/** Stores a completed LessonResult for each lesson (IndexedDB `polyglow`, `lessonResults`). */
async function seedCompletedLessons(page: Page, lessons: { unitId: string; lessonId: string }[]) {
  await page.evaluate(
    (lessons) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("lessonResults", "readwrite");
          const store = tx.objectStore("lessonResults");
          const end = Date.now() - 60 * 60 * 1000;
          lessons.forEach(({ unitId, lessonId }, index) => {
            const completed = new Date(end - (lessons.length - index) * 60_000);
            const started = new Date(completed.getTime() - 120_000);
            const pad = (n: number) => String(n).padStart(2, "0");
            store.put({
              id: crypto.randomUUID(),
              courseId: "en-de",
              unitId,
              lessonId,
              startedAt: started.toISOString(),
              completedAt: completed.toISOString(),
              durationMs: 120_000,
              exerciseCount: 12,
              firstTryCorrectCount: 12,
              mistakeCount: 0,
              skippedCount: 0,
              accuracy: 1,
              perfect: true,
              xp: { base: 10, perfectBonus: 5 },
              xpEarned: 15,
              heartsLost: 0,
              localDate: `${completed.getFullYear()}-${pad(completed.getMonth() + 1)}-${pad(completed.getDate())}`,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    lessons,
  );
}

/** Fails if the page scrolls sideways or any element sticks out of the viewport. */
async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("main *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.left < -0.5 || rect.right > width + 0.5) {
        offenders.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? "").slice(0, 40)}"`);
      }
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      width,
      offenders: offenders.slice(0, 5),
    };
  });
  expect(overflow.offenders, `${label}: elements outside the viewport`).toEqual([]);
  expect(overflow.scrollWidth, `${label}: horizontal scroll`).toBeLessThanOrEqual(overflow.width);
}

/** Strips punctuation and splits an authored answer into word tokens. */
function tokens(answer: string): string[] {
  return answer
    .replace(/[.,!?;:"“”„]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

async function addTiles(page: Page, tiles: string[], answer: string) {
  const bank = page.getByRole("group", { name: "Word bank" });
  for (const token of tokens(answer)) {
    const tile = tiles.find((t) => t.toLowerCase() === token.toLowerCase());
    if (!tile) throw new Error(`no tile for "${token}" in "${answer}"`);
    await bank
      .getByRole("button", { name: `Add ${tile}`, exact: true })
      .first()
      .click();
  }
}

test.describe("German lesson in the browser (LES-014 AC 7-9)", () => {
  test.use({ viewport: { width: 375, height: 667 }, reducedMotion: "reduce" });

  test("long words fit 375 px, no serious axe violations, umlauts and ß render", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    const lesson = readJson<{ exercises: Exercise[] }>(`lessons/${LESSON_ID}.json`);

    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "German" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Casual 10 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();
    await expect(page).toHaveURL(/\/lesson\/de-a1-u01-l1-[a-z0-9-]+$/);

    await seedCompletedLessons(page, lessonsBefore());
    await page.goto(`/lesson/${LESSON_ID}`);
    await expect(page).toHaveURL(new RegExp(`/lesson/${LESSON_ID}$`));

    const checkedTypes = new Set<string>();
    for (const exercise of lesson.exercises) {
      const heading = page.getByTestId("exercise-area").getByRole("heading", { level: 2 });
      await expect(heading).toBeVisible();
      await expectNoHorizontalOverflow(page, exercise.id);
      if (!checkedTypes.has(exercise.type)) {
        checkedTypes.add(exercise.type);
        await expectNoSeriousA11yViolations(page);
      }
      // AC 8: a visual record of umlauts and ß in normal and bold weights.
      if (["de-a1-u11-l4-ex02", "de-a1-u11-l4-ex06", "de-a1-u11-l4-ex10"].includes(exercise.id)) {
        await testInfo.attach(`${exercise.id}.png`, {
          body: await page.screenshot({
            fullPage: true,
            path: testInfo.outputPath(`${exercise.id}.png`),
          }),
          contentType: "image/png",
        });
      }

      if (exercise.type === "multiple_choice" && "options" in exercise) {
        const correct = exercise.options.find((o) => o.id === exercise.correctOptionId)!;
        await page.getByRole("radio", { name: correct.text, exact: true }).click();
        await page.getByRole("button", { name: "Check" }).click();
      } else if (exercise.type === "match_pairs" && "pairs" in exercise) {
        for (const pair of exercise.pairs) {
          await page.getByRole("button", { name: pair.learning, exact: true }).click();
          await page.getByRole("button", { name: pair.known, exact: true }).click();
        }
      } else if ("tiles" in exercise) {
        if (exercise.type === "listen") {
          // Placeholder clips and no German voice in headless Chromium: the PD-007 skip
          // appears once playback has failed. With a voice, the tiles stay enabled.
          const skip = page.getByRole("button", { name: "Skip" });
          await skip.waitFor({ state: "visible", timeout: 10_000 }).catch(() => undefined);
          if (await skip.isVisible()) {
            await skip.click();
            continue;
          }
        }
        await addTiles(page, exercise.tiles, exercise.answers[0]!);
        await page.getByRole("button", { name: "Check" }).click();
      } else {
        throw new Error(`unhandled exercise type ${exercise.type}`);
      }
      await expectNoHorizontalOverflow(page, `${exercise.id} feedback`);
      if (exercise.id === "de-a1-u11-l4-ex10") {
        // Feedback shows the authored answer in bold with lang="de" (AC 5, AC 8).
        await testInfo.attach(`${exercise.id}-feedback.png`, {
          body: await page.screenshot({
            fullPage: true,
            path: testInfo.outputPath(`${exercise.id}-feedback.png`),
          }),
          contentType: "image/png",
        });
      }
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
    expect([...checkedTypes].sort()).toEqual(
      ["listen", "match_pairs", "multiple_choice", "word_bank_translate"].sort(),
    );
  });
});
