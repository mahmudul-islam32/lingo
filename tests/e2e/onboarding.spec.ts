import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import { GERMAN_LESSON_1, lessonUrl } from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/** PLT-024 AC 3: the language name comes from the default course (en-de). */
const WELCOME = "Learn German in five minutes a day";
const COURSE = "What do you want to learn?";
const GOAL = "Choose a daily goal";

const h1 = (page: Page) => page.getByRole("heading", { level: 1 });

/** Waits for the step's fade-in (finite animations) to finish, so axe measures final colours. */
async function axeAfterAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        // Skip looping ones (e.g. skeleton pulses).
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
  await expectNoSeriousA11yViolations(page);
}

test.describe("onboarding (PLT-004)", () => {
  // Criterion 15: keyboard only, as a new visitor; lands in Lesson 1, then Learn stays home.
  test("a new visitor completes onboarding with the keyboard only", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to all controls by default");
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(h1(page)).toHaveText(WELCOME);

    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Get started" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(h1(page)).toHaveText(COURSE);
    await expect(h1(page)).toBeFocused();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    const german = page.getByRole("radio", { name: "German" });
    await expect(german).toBeVisible(); // course data loaded
    // PLT-024 AC 1, 2: German is the only course, preselected; Spanish isn't offered.
    await expect(page.getByRole("radio")).toHaveCount(1);
    await expect(german).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Spanish")).toHaveCount(0);
    // Back comes before the heading; Shift+Tab reaches it, Tab goes on to the option.
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Back" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(german).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(h1(page)).toHaveText(GOAL);
    await expect(h1(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("radio", { name: "Casual 10 XP" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const regular = page.getByRole("radio", { name: "Regular 20 XP" });
    await expect(regular).toBeFocused();
    await expect(regular).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Start learning" })).toBeFocused();
    await page.keyboard.press("Enter");

    // PLT-007 criterion 6 / PLT-024 AC 4: "Start learning" opens the first German lesson;
    // Learn is home from then on.
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    await page.goto("/");
    await expect(h1(page)).toHaveText("Learn");
    await page.reload();
    await expect(h1(page)).toHaveText("Learn");
    await expect(page).toHaveURL(/\/$/);
  });

  test("criterion 9: /profile redirects to onboarding until it is complete, then the reverse", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/onboarding$/);
    await completeOnboarding(page);
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/profile");
    await expect(h1(page)).toHaveText("Profile");
  });

  test("criteria 6 and 10: Back keeps selections; a reload restarts at Welcome", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Get started" }).click();
    await page.getByRole("radio", { name: "German" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "Serious 30 XP" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("radio", { name: "German" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.reload();
    await expect(h1(page)).toHaveText(WELCOME);
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test("criterion 14: no serious or critical axe violations on any step", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(h1(page)).toHaveText(WELCOME);
    await axeAfterAnimations(page);
    await page.getByRole("button", { name: "Get started" }).click();
    await expect(page.getByRole("radio", { name: "German" })).toBeVisible();
    await axeAfterAnimations(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(h1(page)).toHaveText(GOAL);
    await axeAfterAnimations(page);
    await page.getByRole("radio", { name: "Intense 50 XP" }).click();
    await axeAfterAnimations(page);
  });
});

test.describe("onboarding at 375 × 667 (criterion 13)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  async function expectStepFits(page: Page, primary: string) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    for (const radio of await page.getByRole("radio").all()) {
      await expect(radio).toBeInViewport({ ratio: 1 });
      const box = await radio.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }
    const button = page.getByRole("button", { name: primary });
    await expect(button).toBeInViewport({ ratio: 1 });
    const box = await button.boundingBox();
    // Pinned to the bottom: the button ends within the footer padding of the viewport edge.
    expect(667 - (box!.y + box!.height)).toBeLessThanOrEqual(48);
  }

  test("every option is visible, at least 48 px tall, primary button at the bottom", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(h1(page)).toHaveText(WELCOME);
    await expectStepFits(page, "Get started");
    await page.getByRole("button", { name: "Get started" }).click();
    // PLT-024 AC 13: the German card fits in full.
    await expect(page.getByRole("radio", { name: "German" })).toBeVisible();
    await expectStepFits(page, "Continue");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(h1(page)).toHaveText(GOAL);
    await expect(page.getByRole("radio")).toHaveCount(4);
    await expectStepFits(page, "Start learning");
  });
});
