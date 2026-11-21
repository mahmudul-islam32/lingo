import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";
import {
  GERMAN_LAST_FIRST_LEVEL_LESSON,
  GERMAN_LESSON_1,
  germanLesson1,
  lessonUrl,
  nodeNamePattern,
  playLesson,
} from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/** The skill path's last node for a new learner: the last A1 lesson (GAM-010 collapses A2). */
const lastNodeOf = (page: Page) =>
  page.getByRole("button", { name: nodeNamePattern(GERMAN_LAST_FIRST_LEVEL_LESSON, "locked") });

const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });
/** PLT-026, PD-066 §4: the 4-tab bottom nav, in order. */
const TABS = ["Learn", "Practice", "Leagues", "Profile"] as const;
type TabName = (typeof TABS)[number];
const tab = (page: Page, name: TabName) => nav(page).getByRole("link", { name });
const TAB_PATHS: Record<TabName, RegExp> = {
  Learn: /\/$/,
  Practice: /\/practice$/,
  Leagues: /\/leagues$/,
  Profile: /\/profile$/,
};

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("app shell navigation", () => {
  // The tabs need a finished onboarding (PLT-004); otherwise they redirect to /onboarding.
  test.beforeEach(async ({ page }) => completeOnboarding(page));

  // Criterion 17: open /, switch to Profile and back to Learn with the bottom navigation.
  test("switches between Learn and Profile with the bottom nav", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Learn · Polyglow");
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await expect(tab(page, "Learn")).toHaveAttribute("aria-current", "page");
    await expect(tab(page, "Profile")).not.toHaveAttribute("aria-current", "page");

    // Client-side navigation: a marker on window survives only without a full reload.
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));

    await tab(page, "Profile").click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { level: 1, name: "Profile" })).toBeVisible();
    await expect(page).toHaveTitle("Profile · Polyglow");
    await expect(tab(page, "Profile")).toHaveAttribute("aria-current", "page");
    await expect(tab(page, "Learn")).not.toHaveAttribute("aria-current", "page");

    await tab(page, "Learn").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
    await expect(tab(page, "Learn")).toHaveAttribute("aria-current", "page");
    await expect(tab(page, "Profile")).not.toHaveAttribute("aria-current", "page");

    expect(
      await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload),
    ).toBe(true);
  });

  test("keyboard: skip link first, tabs reachable with Tab and opened with Enter", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to links by default");
    await page.goto("/");
    await expect(lastNodeOf(page)).toBeVisible();
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();

    await page.goto("/");
    // PLT-009: the top bar (hearts) and the skill path come before the bottom nav.
    const hearts = page.getByRole("button", { name: /^Hearts: / });
    const lastNode = lastNodeOf(page);
    await expect(lastNode).toBeVisible();
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab");
    await expect(hearts).toBeFocused();
    await page.keyboard.press("Tab");
    // PLT-027: without a goal date, the "Set a goal date" link is the next Tab stop.
    await expect(page.getByRole("link", { name: "Set a goal date" })).toBeFocused();
    await page.keyboard.press("Tab");
    // GAM-010 puts the current level's expand/collapse button (A1) before the first
    // lesson; Tab past it when it is there.
    const levelToggle = page.getByRole("button", { name: /\bA1\b/ });
    if (
      (await levelToggle.count()) > 0 &&
      (await levelToggle.first().evaluate((el) => el === document.activeElement))
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(
      page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "up next") }),
    ).toBeFocused();
    await lastNode.focus();
    // After the last A1 lesson the next Tab stop is the bottom nav, unless GAM-010's
    // "Coming soon" levels add their own controls in between.
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      if (await tab(page, "Learn").evaluate((el) => el === document.activeElement)) break;
    }
    await expect(tab(page, "Learn")).toBeFocused();
    for (const name of TABS.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(tab(page, name)).toBeFocused();
    }
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/profile$/);
    await expect(tab(page, "Profile")).toHaveAttribute("aria-current", "page");
  });

  // PLT-026 AC 19: move through all 4 tabs with the keyboard only (Tab + Enter).
  test("keyboard: opens Learn, Practice, Leagues and Profile with Tab and Enter", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to links by default");
    await page.goto("/profile");
    await expect(page.getByRole("heading", { level: 1, name: "Profile" })).toBeAttached();
    for (const name of TABS) {
      await tab(page, name).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(TAB_PATHS[name]);
      await expect(page.getByRole("heading", { level: 1, name })).toBeAttached();
      await expect(tab(page, name)).toHaveAttribute("aria-current", "page");
      for (const other of TABS.filter((t) => t !== name)) {
        await expect(tab(page, other)).not.toHaveAttribute("aria-current", "page");
      }
      // Tab order inside the nav: the next tab follows the focused one.
      const index = TABS.indexOf(name);
      if (index < TABS.length - 1) {
        await tab(page, name).focus();
        await page.keyboard.press("Tab");
        await expect(tab(page, TABS[index + 1]!)).toBeFocused();
      }
    }
  });

  for (const path of ["/", "/practice", "/leagues", "/profile"]) {
    test(`${path} has one main, one h1 and shows the bottom nav`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(nav(page)).toBeVisible();
    });
  }

  test("unknown path shows the 404 page without the bottom nav", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
    await expect(nav(page)).toHaveCount(0);
    await page.getByRole("link", { name: "Back to Learn" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  });
});

test.describe("app shell for a new visitor", () => {
  test("onboarding has no bottom nav", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(nav(page)).toHaveCount(0);
  });
});

test.describe("app shell at 375 × 667", () => {
  test.use({ viewport: { width: 375, height: 667 } });
  // /onboarding at 375 px is covered by onboarding.spec.ts.
  test.beforeEach(async ({ page }) => completeOnboarding(page));

  for (const path of ["/", "/practice", "/leagues", "/profile", "/this-page-does-not-exist"]) {
    test(`${path}: no horizontal scrolling`, async ({ page }) => {
      await page.goto(path);
      await expectNoHorizontalScroll(page);
    });
  }

  test("tabs are at least 48 × 48 px and the nav doesn't cover the last content", async ({
    page,
  }) => {
    await page.goto("/");
    for (const name of TABS) {
      const box = await tab(page, name).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
    }
    // Wait for the skill path (PLT-009) so the page has its final height, then scroll to
    // the bottom; the last path node must end above the nav.
    const lastNode = lastNodeOf(page);
    await expect(lastNode).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const navBox = await nav(page).boundingBox();
    const lastBox = await lastNode.boundingBox();
    expect(navBox && lastBox).toBeTruthy();
    expect(lastBox!.y + lastBox!.height).toBeLessThanOrEqual(navBox!.y);
  });
});

test.describe("Profile after a lesson at 375 px (PLT-026 AC 19)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("shows real stats and today's bar > 0; the nav doesn't cover the last row", async ({
    page,
  }) => {
    test.slow(); // onboarding + a full lesson, keyboard only
    await completeOnboarding(page);
    await page.goto(`/lesson/${GERMAN_LESSON_1.id}`);
    await expect(page).toHaveURL(lessonUrl(GERMAN_LESSON_1.id));
    await playLesson(page, germanLesson1(), { keyboard: true });
    // Back to Learn with the results' Continue, then the Profile tab: no reload, and the
    // result is saved (lesson 1 shows as completed) before Profile reads it.
    await page.getByRole("button", { name: "Continue" }).press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("link", { name: nodeNamePattern(GERMAN_LESSON_1, "completed") }),
    ).toBeVisible();
    await tab(page, "Profile").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/profile$/);
    const stats = page.getByTestId("profile-stats");
    await expect(stats.getByRole("listitem")).toHaveCount(4);
    await expect(stats.getByRole("listitem").filter({ hasText: "Day streak" })).toContainText("1");
    await expect(stats.getByRole("listitem").filter({ hasText: "Lessons done" })).toContainText(
      "1",
    );
    await expect(stats.getByRole("listitem").filter({ hasText: "Start level" })).toContainText(
      "A1",
    );
    const totalXp = stats.getByRole("listitem").filter({ hasText: "Total XP" });
    await expect(totalXp).toHaveText(/^Total XP[1-9]\d*$/);
    const today = page.locator('[data-testid="weekly-xp-bar"][data-today]');
    await expect(today).toHaveCount(1);
    expect(Number(await today.getAttribute("data-xp"))).toBeGreaterThan(0);
    await expect(page.getByTestId("weekly-xp-goal")).toHaveText("Goal 20 XP / day");
    await expect(page.getByText(/^Learning German/)).toBeVisible();
    // The nav has a "Leagues" tab; Profile itself shows no league, words or achievements.
    await expect(page.getByRole("main").getByText(/league|achievement|words learned/i)).toHaveCount(
      0,
    );

    await expectNoHorizontalScroll(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const navBox = await nav(page).boundingBox();
    const lastRow = await page.getByRole("button", { name: "Change start level" }).boundingBox();
    expect(lastRow!.y + lastRow!.height).toBeLessThanOrEqual(navBox!.y);
  });
});

test.describe("accessibility (axe)", () => {
  test.beforeEach(async ({ page }) => completeOnboarding(page));
  for (const path of ["/", "/practice", "/leagues", "/profile", "/this-page-does-not-exist"]) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoSeriousA11yViolations(page);
    });
  }
});
