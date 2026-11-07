import { expect, test } from "@playwright/test";

test("home page loads with the Learn tab and the app name in the title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Polyglow/);
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
});
