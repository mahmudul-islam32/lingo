import { expect, test } from "@playwright/test";
import {
  PASSWORD,
  SERVICE_ROLE_KEY,
  authFetch,
  createConfirmedUser,
  localStackProblem,
  mailsTo,
  signIn,
  uniqueEmail,
} from "./local-supabase";

/**
 * CTO-025 (ADR-020 §9): auth and the REST API against the LOCAL Supabase stack.
 * Skips with the reason when the stack isn't running.
 */
test.beforeAll(async () => {
  const problem = await localStackProblem();
  // CI sets ACCOUNTS_REQUIRED=1: there a missing stack is a failure, not a skip.
  if (problem !== null && process.env.ACCOUNTS_REQUIRED === "1") throw new Error(problem);
  test.skip(problem !== null, problem ?? "");
});

test("sign-up asks to confirm the email and sends the mail (criterion 8)", async () => {
  const email = uniqueEmail("signup");
  const res = await authFetch("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expect(res.ok, await res.clone().text()).toBe(true);
  const body = (await res.json()) as { access_token?: string; session?: unknown };
  // Email confirmation is on (supabase/config.toml, as on hosted): no session yet.
  expect(body.access_token).toBeUndefined();

  await expect
    .poll(async () => (await mailsTo(email)).length, { timeout: 15_000 })
    .toBeGreaterThan(0);

  const early = await authFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expect(early.status).toBe(400);
  expect(((await early.json()) as { error_code?: string }).error_code).toBe("email_not_confirmed");
});

test.describe("REST API with two users (criterion 6)", () => {
  test.skip(
    !SERVICE_ROLE_KEY && process.env.ACCOUNTS_REQUIRED !== "1",
    "SUPABASE_SERVICE_ROLE_KEY (local stack only) is not set",
  );

  test("a user reads and writes only their own rows; anon reads nothing", async () => {
    const a = uniqueEmail("a");
    const b = uniqueEmail("b");
    const aId = await createConfirmedUser(a);
    await createConfirmedUser(b);
    const tokenA = await signIn(a);
    const tokenB = await signIn(b);

    const row = {
      user_id: aId,
      course_id: "en-de",
      daily_goal_xp: 20,
      sound_effects_enabled: true,
      speaking_exercises_enabled: true,
      goal_plans: { "en-de": { targetLevel: "A2", targetDate: "2027-03-12" } },
      updated_at: "2026-11-28T00:00:00Z",
    };
    const write = await authFetch("/rest/v1/settings", {
      method: "POST",
      token: tokenA,
      headers: { prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
    expect(write.status, await write.clone().text()).toBe(201);

    const own = await authFetch("/rest/v1/settings?select=user_id,goal_plans", { token: tokenA });
    expect(await own.json()).toEqual([{ user_id: aId, goal_plans: row.goal_plans }]);

    const other = await authFetch("/rest/v1/settings?select=user_id", { token: tokenB });
    expect(await other.json()).toEqual([]);

    const forB = await authFetch("/rest/v1/settings", {
      method: "POST",
      token: tokenB,
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ ...row, daily_goal_xp: 50 }),
    });
    expect(forB.ok).toBe(false);

    for (const table of ["profiles", "settings", "hearts_state", "lesson_results"]) {
      const anon = await authFetch(`/rest/v1/${table}?select=*`);
      expect(anon.ok, `anon can read ${table}`).toBe(false);
    }
  });
});
