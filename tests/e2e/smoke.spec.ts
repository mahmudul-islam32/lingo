import { expect, test } from "@playwright/test";

test("home page loads and shows the app name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Polyglow/);
  await expect(page.getByRole("heading", { level: 1, name: "Polyglow" })).toBeVisible();
});
