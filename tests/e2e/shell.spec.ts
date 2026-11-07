import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./axe";

const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });
const tab = (page: Page, name: "Learn" | "Profile") => nav(page).getByRole("link", { name });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("app shell navigation", () => {
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
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();

    await page.goto("/");
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab");
    await expect(tab(page, "Learn")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(tab(page, "Profile")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/profile$/);
    await expect(tab(page, "Profile")).toHaveAttribute("aria-current", "page");
  });

  for (const path of ["/", "/profile"]) {
    test(`${path} has one main, one h1 and shows the bottom nav`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(nav(page)).toBeVisible();
    });
  }

  test("onboarding placeholder has no bottom nav", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(nav(page)).toHaveCount(0);
  });

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

test.describe("app shell at 375 × 667", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const path of ["/", "/profile", "/onboarding", "/this-page-does-not-exist"]) {
    test(`${path}: no horizontal scrolling`, async ({ page }) => {
      await page.goto(path);
      await expectNoHorizontalScroll(page);
    });
  }

  test("tabs are at least 44 × 44 px and the nav doesn't cover the last content", async ({
    page,
  }) => {
    await page.goto("/");
    for (const name of ["Learn", "Profile"] as const) {
      const box = await tab(page, name).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    // Scroll to the bottom; the last element in <main> must end above the nav.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const navBox = await nav(page).boundingBox();
    const lastBox = await page.locator("main > * > *:last-child").last().boundingBox();
    expect(navBox && lastBox).toBeTruthy();
    expect(lastBox!.y + lastBox!.height).toBeLessThanOrEqual(navBox!.y);
  });
});

test.describe("accessibility (axe)", () => {
  for (const path of ["/", "/profile", "/this-page-does-not-exist"]) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoSeriousA11yViolations(page);
    });
  }
});
