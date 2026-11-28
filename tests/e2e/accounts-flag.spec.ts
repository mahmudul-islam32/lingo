import { expect, test, type Page, type Request } from "@playwright/test";
import { germanLesson1, playLesson } from "./helpers/course";
import { completeOnboarding } from "./onboarding-helpers";

/**
 * PLT-010 criterion 1 (ADR-020 §1): the default e2e build has no Supabase variables, so
 * accounts are off. No sign-up or log-in entry anywhere, `/sign-up`, `/log-in` and
 * `/auth/callback` go to Learn, and nothing is ever sent to a Supabase host while a guest
 * onboards, plays a lesson and opens every tab.
 */
const SUPABASE_REQUEST = /supabase\.co|:54321\/|\/(?:auth|rest|realtime|storage|functions)\/v1\//;

function recordSupabaseRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (request: Request) => {
    if (SUPABASE_REQUEST.test(request.url())) seen.push(request.url());
  });
  return seen;
}

async function expectNoAuthEntry(page: Page) {
  await expect(
    page.getByRole("link", { name: /log in|sign up|create account|save your progress/i }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /log in|create account/i })).toHaveCount(0);
}

test("accounts disabled: no auth UI, auth routes go to Learn, zero Supabase requests", async ({
  page,
}) => {
  const supabase = recordSupabaseRequests(page);

  for (const path of ["/sign-up", "/log-in", "/auth/callback?code=x"]) {
    await page.goto(path);
    // Learn's gate sends a new guest on to onboarding.
    await expect(page).toHaveURL(/\/(onboarding)?$/);
    await expect(
      page.getByRole("heading", { name: /create your account|welcome back/i }),
    ).toHaveCount(0);
  }

  await completeOnboarding(page);
  await expectNoAuthEntry(page);
  await page.goto(`/lesson/${germanLesson1().id}`);
  await playLesson(page, germanLesson1());
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const tab of ["/practice", "/profile", "/"]) {
    await page.goto(tab);
    await expect(page.getByRole("main")).toBeVisible();
    await expectNoAuthEntry(page);
  }

  for (const path of ["/sign-up", "/log-in"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  }
  expect(supabase).toEqual([]);
});
