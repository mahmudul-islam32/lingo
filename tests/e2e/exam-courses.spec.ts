import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding, completeOnboardingAsSpanishGuest } from "./onboarding-helpers";

/**
 * TELC-001 (PD-073): the telc B1 and Einbürgerungstest courses are offered at onboarding,
 * play their exam exercise types (explain cards, choice with explanation), and Profile →
 * Course switches between courses. Ids and answers come from the generated content.
 */
const CONTENT = path.join(process.cwd(), "content", "courses");
const read = (file: string) => JSON.parse(readFileSync(path.join(CONTENT, file), "utf8"));

const ebCourse = read("einbuergerung-en-de/course.json");
const ebKompass = ebCourse.units[0].lessons[0].id as string;
const ebQuestions = read(`einbuergerung-en-de/lessons/${ebCourse.units[0].lessons[1].id}.json`);

/** Lessons with a `tip` open on the tip card until "Start" (LES-013). */
async function startLesson(page: Page, lesson: { tip?: string }) {
  if (lesson.tip) await page.getByRole("button", { name: "Start", exact: true }).click();
}

test("onboarding offers the Einbürgerungstest; explain cards and a question play", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.getByRole("radio", { name: "telc B1 Exam Prep" })).toBeVisible();
  await page.getByRole("radio", { name: "Einbürgerungstest" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  // No CEFR levels: the level step is skipped.
  await page.getByRole("radio", { name: "Regular 20 XP" }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page).toHaveURL(new RegExp(`/lesson/${ebKompass}$`));

  const kompass = read(`einbuergerung-en-de/lessons/${ebKompass}.json`);
  await startLesson(page, kompass);
  // Explain cards: "Continue" moves on without a feedback panel.
  const count = kompass.exercises.length;
  for (let i = 0; i < count; i += 1) {
    await expect(page.getByTestId("exercise-eyebrow")).toHaveText("Learn");
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await expect(page.getByText(/Lesson complete|XP/).first()).toBeVisible();

  // A question lesson: choice + explanation.
  await page.goto(`/lesson/${ebQuestions.id}`);
  await startLesson(page, ebQuestions);
  const first = ebQuestions.exercises[0];
  const correct = first.options.find((o: { id: string }) => o.id === first.correctOptionId).text;
  await expect(page.getByRole("heading", { level: 2, name: first.prompt })).toBeVisible();
  await page.getByRole("radio", { name: correct }).click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByTestId("feedback-panel")).toHaveAttribute("data-outcome", "correct");
  await expect(page.getByTestId("feedback-explanation")).toBeVisible();
});

test("Profile → Course switches to telc B1 Exam Prep", async ({ page }) => {
  await completeOnboarding(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Change course" }).click();
  const dialog = page.getByRole("dialog", { name: "Change course" });
  await dialog.getByRole("radio", { name: /telc B1 Exam Prep/ }).click();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("course-value")).toHaveText("telc B1 Exam Prep");
  await page.goto("/");
  // TELC-003: the course has A1, A2 and B1; with start level A1 the learner begins at A1.
  await expect(page.getByTestId("course-caption")).toHaveText("telc B1 Exam Prep · A1");
});

test("telc B1: a confident learner sets the start level to B1 in Profile", async ({ page }) => {
  await completeOnboarding(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Change course" }).click();
  const courseDialog = page.getByRole("dialog", { name: "Change course" });
  await courseDialog.getByRole("radio", { name: /telc B1 Exam Prep/ }).click();
  await courseDialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("course-value")).toHaveText("telc B1 Exam Prep");

  await page.getByRole("button", { name: "Change start level" }).click();
  const levelDialog = page.getByRole("dialog", { name: "Change start level" });
  await expect(levelDialog.getByRole("radio")).toHaveCount(3);
  await levelDialog.getByRole("radio", { name: /B1 · telc exam/ }).click();
  await levelDialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("start-level-value")).toHaveText("B1 · telc exam");

  await page.goto("/");
  await expect(page.getByTestId("course-caption")).toHaveText("telc B1 Exam Prep · B1");
});

/**
 * FIX-014 (PD-077): a course without levels has no goal date, so Learn shows no
 * "Set a goal date" link, the results screen no goal-date row, and a stale
 * `/profile?edit=goal-date` opens Profile normally and drops the parameter.
 */
test.describe("FIX-014: no goal-date UI on courses without levels (375 px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  async function expectProfileWithoutGoalDate(page: Page) {
    await page.goto("/profile?edit=goal-date");
    await expect(page.getByRole("heading", { level: 3, name: "Daily goal" })).toBeVisible();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3, name: "Goal date" })).toHaveCount(0);
  }

  test("Einbürgerungstest: no link on Learn, no results row, no Profile dialog", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "Einbürgerungstest" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Regular 20 XP" }).click();
    await page.getByRole("button", { name: "Start learning" }).click();
    await expect(page).toHaveURL(new RegExp(`/lesson/${ebKompass}$`));

    // The first lesson's results show no goal-date row (criterion 5).
    const kompass = read(`einbuergerung-en-de/lessons/${ebKompass}.json`);
    await startLesson(page, kompass);
    for (let i = 0; i < kompass.exercises.length; i += 1) {
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await expect(page.getByText(/Lesson complete|XP/).first()).toBeVisible();
    await expect(page.getByTestId("goal-date-row")).toHaveCount(0);

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await expect(page.getByTestId("course-caption")).toHaveText("Einbürgerungstest");
    await expect(page.getByRole("link", { name: /^Lesson 2: .*, up next/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Set a goal date" })).toHaveCount(0);
    await expect(page.getByTestId("goal-plan-empty")).toHaveCount(0);
    await expect(page.getByTestId("goal-plan-card")).toHaveCount(0);

    await expectProfileWithoutGoalDate(page);
  });

  test("en-es (hidden course): no link on Learn, no Profile dialog", async ({ page }) => {
    await completeOnboardingAsSpanishGuest(page);
    await expect(page.getByRole("link", { name: /^Lesson 1: .*, up next/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Set a goal date" })).toHaveCount(0);
    await expect(page.getByTestId("goal-plan-empty")).toHaveCount(0);
    await expectProfileWithoutGoalDate(page);
  });
});
