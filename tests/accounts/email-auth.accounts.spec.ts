import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "../e2e/axe";
import { PASSWORD, SERVICE_ROLE_KEY, createConfirmedUser, uniqueEmail } from "./local-supabase";
import { waitForAuthLink } from "./helpers/mail";
import { AUTH_STORAGE_KEY, requireLocalStack } from "./helpers/stack";

/**
 * PLT-010 criterion 12 against the LOCAL Supabase stack (confirmation on, as on hosted):
 * sign up through the UI, confirm with the mail, reload and stay signed in; log in with an
 * existing user; a wrong password shows the kind message. Plus criterion 13 at 375 × 667.
 */
requireLocalStack();
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

const hasSession = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key) !== null, AUTH_STORAGE_KEY);

async function expectFitsSmallPhone(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  for (const control of await page.locator("main input, main button, main a").all()) {
    if (!(await control.isVisible())) continue;
    const box = await control.boundingBox();
    expect(box!.height, await control.evaluate((el) => el.outerHTML)).toBeGreaterThanOrEqual(48);
  }
}

test("sign up, confirm by mail, reload: still signed in", async ({ page }) => {
  const email = uniqueEmail("plt010-signup");
  await page.goto("/sign-up");
  await expect(page.getByRole("heading", { level: 1, name: "Create your account" })).toBeVisible();
  await expectFitsSmallPhone(page);
  await expectNoSeriousA11yViolations(page);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  await expect(
    page.getByText(`Open the link we sent to ${email} to finish creating your account.`),
  ).toBeVisible();
  await expectNoSeriousA11yViolations(page);
  expect(await hasSession(page)).toBe(false);

  // The link opens /auth/callback?code=… in the same browser (PKCE verifier on the device).
  await page.goto(await waitForAuthLink(email, "signup"));
  await expect(page).not.toHaveURL(/\/auth\/callback/, { timeout: 15_000 });
  await expect.poll(() => hasSession(page)).toBe(true);

  await page.reload();
  expect(await hasSession(page)).toBe(true);
  // Signed in: the auth screens send the learner to Learn (ADR-020 §8).
  await page.goto("/log-in");
  await expect(page).not.toHaveURL(/\/log-in/);
});

test.describe("existing user", () => {
  test.skip(
    !SERVICE_ROLE_KEY && process.env.ACCOUNTS_REQUIRED !== "1",
    "SUPABASE_SERVICE_ROLE_KEY (local stack only) is not set",
  );

  test("log in, then a reload keeps the session", async ({ page }) => {
    const email = uniqueEmail("plt010-login");
    await createConfirmedUser(email);
    await page.goto("/log-in");
    await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
    await expectFitsSmallPhone(page);
    await expectNoSeriousA11yViolations(page);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).not.toHaveURL(/\/log-in/);
    await expect.poll(() => hasSession(page)).toBe(true);
    await page.reload();
    expect(await hasSession(page)).toBe(true);
  });

  test("a wrong password says the pair doesn't match", async ({ page }) => {
    const email = uniqueEmail("plt010-wrong");
    await createConfirmedUser(email);
    await page.goto("/log-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "That email and password don't match." }),
    ).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    expect(await hasSession(page)).toBe(false);
  });
});
