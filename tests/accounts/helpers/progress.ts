/**
 * Accounts e2e helpers (PLT-013 …): what the learner sees of their progress, the stored
 * session, the server rows of the signed-in user, and lesson-result fixtures.
 */
import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { GERMAN_LESSONS } from "../../e2e/helpers/course";
import { authFetch } from "../local-supabase";
import { AUTH_STORAGE_KEY } from "./stack";

/** Everything PLT-013 criterion 7 / PLT-015 criterion 5 compare, as shown on screen. */
export interface ProgressView {
  header: string;
  dailyGoal: string;
  completedNodes: string[];
  upNext: string | null;
  review: string;
  stats: string;
  settings: string;
}

export async function progressView(page: Page): Promise<ProgressView> {
  await page.goto("/");
  await expect(page.getByTestId("learn")).toBeVisible();
  await expect(page.getByRole("img", { name: /^Total XP: \d+/ })).toBeVisible();
  const header = (await page.getByTestId("learn-header").innerText()).replace(/\s+/g, " ");
  const dailyGoal = (
    await page
      .getByText(/^\d+ \/ \d+ XP$/)
      .first()
      .innerText()
  ).trim();
  const completedNodes = await page
    .getByRole("link", { name: /, completed(?:\.|$)/ })
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label") ?? el.textContent ?? ""));
  const next = page.getByRole("link", { name: /, up next(?:\.|$)/ });
  const upNext = (await next.count()) > 0 ? await next.first().getAttribute("href") : null;

  await page.goto("/practice");
  const reviewCard = page.getByTestId("review-card");
  await expect(reviewCard).toBeVisible();
  const review = (await reviewCard.innerText()).replace(/\s+/g, " ");

  await page.goto("/profile");
  await expect(page.getByTestId("profile-stats")).toBeVisible();
  const stats = (await page.getByTestId("profile-stats").innerText()).replace(/\s+/g, " ");
  const settings = (await page.locator("#settings").innerText()).replace(/\s+/g, " ");
  return { header, dailyGoal, completedNodes, upNext, review, stats, settings };
}

/** The signed-in user's access token from the app's stored session, or `null`. */
export async function accessToken(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as {
      access_token?: string;
      currentSession?: { access_token?: string };
    };
    return value.access_token ?? value.currentSession?.access_token ?? null;
  }, AUTH_STORAGE_KEY);
}

export async function serverRows<T = Record<string, unknown>>(
  token: string,
  table: string,
  select = "*",
): Promise<T[]> {
  const res = await authFetch(`/rest/v1/${table}?select=${encodeURIComponent(select)}`, { token });
  expect(res.ok, `${table}: ${res.status}`).toBe(true);
  return (await res.json()) as T[];
}

/** A valid `LessonResult` of a German lesson (index in path order), 10 XP, not perfect. */
export function germanResult(
  index: number,
  completedAt: string,
  xp: { base: number; bonus: number } = { base: 10, bonus: 0 },
) {
  const lesson = GERMAN_LESSONS[index]!;
  const perfect = xp.bonus > 0;
  const completed = new Date(completedAt);
  return {
    id: randomUUID(),
    courseId: "en-de",
    unitId: lesson.unit.id,
    lessonId: lesson.id,
    startedAt: new Date(completed.getTime() - 120_000).toISOString(),
    completedAt: completed.toISOString(),
    durationMs: 120_000,
    exerciseCount: 4,
    firstTryCorrectCount: perfect ? 4 : 3,
    mistakeCount: perfect ? 0 : 1,
    skippedCount: 0,
    accuracy: perfect ? 1 : 0.75,
    perfect,
    xp: { base: xp.base, perfectBonus: xp.bonus },
    xpEarned: xp.base + xp.bonus,
    heartsLost: perfect ? 0 : 1,
    localDate: completed.toISOString().slice(0, 10),
    timeZone: "UTC",
    kind: "lesson" as const,
  };
}

export type ResultFixture = ReturnType<typeof germanResult>;

/** The `lesson_results` row of a fixture (ADR-020 §5 mapping). */
export function resultRow(r: ResultFixture) {
  return {
    id: r.id,
    course_id: r.courseId,
    unit_id: r.unitId,
    lesson_id: r.lessonId,
    started_at: r.startedAt,
    completed_at: r.completedAt,
    duration_ms: r.durationMs,
    exercise_count: r.exerciseCount,
    first_try_correct_count: r.firstTryCorrectCount,
    mistake_count: r.mistakeCount,
    skipped_count: r.skippedCount,
    accuracy: r.accuracy,
    perfect: r.perfect,
    xp_base: r.xp.base,
    xp_perfect_bonus: r.xp.perfectBonus,
    xp_earned: r.xpEarned,
    hearts_lost: r.heartsLost,
    local_date: r.localDate,
    time_zone: r.timeZone,
    kind: r.kind,
  };
}

/** Inserts results straight into the user's `lesson_results` (REST, own rows only). */
export async function insertServerResults(token: string, results: ResultFixture[]) {
  const res = await authFetch("/rest/v1/lesson_results", {
    method: "POST",
    token,
    headers: { prefer: "return=minimal" },
    body: JSON.stringify(results.map(resultRow)),
  });
  expect(res.status, await res.clone().text()).toBe(201);
}

/** Puts results on the device (IndexedDB `lessonResults`), as if played there; reloads. */
export async function seedDeviceResults(page: Page, results: ResultFixture[]) {
  await page.evaluate(
    (rows) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("lessonResults", "readwrite");
          for (const row of rows) tx.objectStore("lessonResults").put(row);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    results,
  );
  await page.reload();
}

/** Patches the stored settings (e.g. start level and goal plans) and reloads. */
export async function patchDeviceSettings(page: Page, patch: Record<string, unknown>) {
  await page.evaluate(
    (p) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");
          const read = store.get("current");
          read.onsuccess = () => {
            store.put({ ...read.result, ...p, updatedAt: new Date().toISOString() }, "current");
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    patch,
  );
  await page.reload();
}

/** Signs up through the UI and confirms with the mail link (confirmation is on, PD-087). */
export async function signUpAndConfirm(
  page: Page,
  email: string,
  password: string,
  waitForLink: (email: string) => Promise<string>,
): Promise<void> {
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  await page.goto(await waitForLink(email));
}

/** Logs in through the UI. */
export async function logIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/log-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** The device's sync queue records (IndexedDB `syncQueue`). */
export async function deviceQueue(
  page: Page,
): Promise<{ id: string; kind: string; status: string }[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const all = db.transaction("syncQueue").objectStore("syncQueue").getAll();
          all.onsuccess = () => {
            db.close();
            resolve(all.result as { id: string; kind: string; status: string }[]);
          };
          all.onerror = () => reject(all.error);
        };
      }),
  );
}

/** Puts a queue record back (e.g. a result whose response was lost) and reloads. */
export async function requeueResults(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open("polyglow");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction(["lessonResults", "syncQueue"], "readwrite");
          const read = tx.objectStore("lessonResults").getAll();
          let n = 0;
          read.onsuccess = () => {
            const now = new Date().toISOString();
            for (const payload of read.result as { id: string }[]) {
              n += 1;
              tx.objectStore("syncQueue").put({
                id: payload.id,
                schemaVersion: 1,
                status: "pending",
                createdAt: now,
                attemptCount: 0,
                nextAttemptAt: now,
                lastError: null,
                kind: "lesson_result",
                payload,
              });
            }
          };
          tx.oncomplete = () => {
            db.close();
            resolve(n);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
}

/** A fresh device logs in (nothing to migrate), then onboards as the account. */
export async function freshAccountDevice(page: Page, email: string, password: string) {
  await logIn(page, email, password);
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });
}

/** Total XP on Learn's header. */
export async function learnTotalXp(page: Page): Promise<number> {
  await page.goto("/");
  const img = page.getByRole("img", { name: /^Total XP: \d+/ });
  await expect(img).toBeVisible();
  return Number((await img.getAttribute("aria-label"))!.match(/\d+/)![0]);
}
