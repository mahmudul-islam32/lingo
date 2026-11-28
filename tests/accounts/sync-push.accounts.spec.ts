import { expect, test } from "@playwright/test";
import { GERMAN_LESSONS, playLesson, readLesson } from "../e2e/helpers/course";
import { waitForServiceWorker } from "../e2e/helpers/service-worker";
import { completeOnboarding } from "../e2e/onboarding-helpers";
import { PASSWORD, uniqueEmail } from "./local-supabase";
import { createUserByMail } from "./helpers/mail";
import {
  accessToken,
  deviceQueue,
  freshAccountDevice,
  learnTotalXp,
  requeueResults,
  serverRows,
} from "./helpers/progress";
import { requireLocalStack } from "./helpers/stack";

/**
 * PLT-014 against the LOCAL Supabase stack: lessons finished offline upload by themselves
 * within 10 s of reconnecting (criterion 8), and a replayed push never doubles XP
 * (criterion 6), on the server and on the device after a reload.
 */
requireLocalStack();
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

const lesson = (i: number) => readLesson("en-de", GERMAN_LESSONS[i]!.id);

test("offline → online: 3 lessons reach lesson_results within 10 s, queue empty, no double XP", async ({
  page,
  context,
}) => {
  const email = uniqueEmail("plt014-push");
  await createUserByMail(email, PASSWORD);
  await page.goto("/");
  await freshAccountDevice(page, email, PASSWORD);
  await completeOnboarding(page);
  await waitForServiceWorker(page);
  const token = (await accessToken(page))!;
  // Onboarding's settings and profile reach the account.
  await expect.poll(async () => (await serverRows(token, "settings", "user_id")).length).toBe(1);

  await context.setOffline(true);
  for (const i of [0, 1, 2]) {
    await page.goto(`/lesson/${GERMAN_LESSONS[i]!.id}`);
    await playLesson(page, lesson(i));
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Learn" })).toBeVisible();
  }
  expect((await deviceQueue(page)).filter((r) => r.kind === "lesson_result")).toHaveLength(3);
  expect(await serverRows(token, "lesson_results", "id")).toHaveLength(0);

  await context.setOffline(false);
  await expect
    .poll(async () => (await serverRows(token, "lesson_results", "id")).length, { timeout: 10_000 })
    .toBe(3);
  await expect.poll(async () => (await deviceQueue(page)).length, { timeout: 10_000 }).toBe(0);

  // Criterion 6: the same results pushed again (a lost response) leave one row each.
  const local = await learnTotalXp(page);
  expect(await requeueResults(page)).toBe(3);
  await page.reload();
  await expect.poll(async () => (await deviceQueue(page)).length, { timeout: 10_000 }).toBe(0);
  const rows = await serverRows<{ xp_earned: number }>(token, "lesson_results", "xp_earned");
  expect(rows).toHaveLength(3);
  const serverXp = rows.reduce((sum, r) => sum + r.xp_earned, 0);
  expect(serverXp).toBe(local);
  await page.reload();
  expect(await learnTotalXp(page)).toBe(serverXp);

  // Two tabs on one device push once (ADR-020 §7).
  const second = await context.newPage();
  await second.goto("/");
  await requeueResults(page);
  await Promise.all([page.reload(), second.reload()]);
  await expect.poll(async () => (await deviceQueue(page)).length, { timeout: 10_000 }).toBe(0);
  expect(await serverRows(token, "lesson_results", "id")).toHaveLength(3);
});
