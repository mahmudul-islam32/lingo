# ADR-020: Accounts and sync engine

- **Status:** Accepted
- **Date:** 2026-11-28
- **Ticket:** CTO-025 (v0.6.0 part A); consumers PLT-010 … PLT-018. Builds on ADR-003 (schema,
  RLS, RPC), ADR-018 (goal plans), ADR-019 (outcomes) and ARCHITECTURE §4 and §6.
- **Decider:** cto (product rules: PD-085, PD-087)

## Context

The schema, RLS and `migrate_guest_to_account` exist. `src/lib/sync` is empty; guests already
enqueue every write in the Dexie `syncQueue`, which nothing drains yet. v0.6.0 adds accounts
(email and password, Google, password recovery), push and pull sync, and switching accounts
on one device. It must be built and accepted against a **local** Supabase before the owner's
hosted project exists (CTO-024), and the guest-only production build must not change.

## Decision

### 1. Supabase client and the accounts flag

- **Flag:** `ACCOUNTS_ENABLED = Boolean(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)`,
  evaluated at **build time** (Next inlines `NEXT_PUBLIC_*`).
- **When false (today's production):**
  - no auth UI anywhere (no "Sign in" row, no prompts, no `/auth/*` links);
  - the sync engine never starts;
  - **zero requests** to Supabase;
  - `@supabase/supabase-js` is not in any guest bundle.

  PLT-010 tests this: with the flag off, no request leaves for the Supabase host.

- **Client:** one browser client, `src/lib/supabase/client.ts`, owned by dev-platform.
  - It is created lazily through `import()` behind the flag, so the guest bundle doesn't
    include it.
  - Options: `auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true,
detectSessionInUrl: false }`. The callback route exchanges the code itself (§3).
  - The session lives in `localStorage`, as in ARCHITECTURE §6. There is no SSR auth and
    no server client.
- **Dependency:** PLT-010 adds the `@supabase/supabase-js` dependency (the cto reviews the
  `package.json` change).
- **No service-role key in the app, ever.** Only the public anon / publishable key is in
  `.env.example`.

### 2. Google flag

`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true"` **and** `ACCOUNTS_ENABLED` show the "Continue with
Google" button (PLT-011); anything else hides it. The provider itself is configured in the
Supabase project (and locally in `supabase/config.toml [auth.external.google]`).

### 3. `/auth/callback`

`src/app/auth/callback/page.tsx` is a client page. It handles every link that comes back from
Supabase Auth:

- **email confirmation:** `?code=…` is exchanged with `exchangeCodeForSession`, then the
  guest migration runs (§8);
- **password recovery:** `?code=…&type=recovery` goes to the "Set a new password" screen
  (PLT-012);
- **Google OAuth:** `?code=…`, handled as confirmation;
- **an error** (`?error=…` or a failed exchange) shows the `link_expired` copy with a way
  back.

After success it navigates with `router.replace(safeNextPath(next))`.

- `safeNextPath` (`src/contracts/auth.ts`) follows `next` only if it is a **same-origin
  path**: one leading `/`, not `//`, no backslash, scheme or control character, at most 512
  characters.
- Everything else falls back to `/`. This is the only redirect rule; no open redirect.

Redirect URLs allowed in the Supabase project: `<site>/auth/callback`, and locally
`http://localhost:3000/auth/callback` (already in `supabase/config.toml`).

### 4. Auth errors

The app maps Supabase Auth errors to `AuthErrorCode` (`src/contracts/auth.ts`) and shows one
message per code, never the server text.

| Supabase (`error_code` / status)                                    | `AuthErrorCode`       |
| ------------------------------------------------------------------- | --------------------- |
| `invalid_credentials`, `user_not_found`                             | `invalid_credentials` |
| `email_not_confirmed`                                               | `email_not_confirmed` |
| `user_already_exists`, `email_exists`                               | `email_taken`         |
| `weak_password`, `validation_failed` on password                    | `weak_password`       |
| `over_request_rate_limit`, `over_email_send_rate_limit`, 429        | `rate_limited`        |
| `provider_disabled`, `oauth_provider_not_supported`                 | `provider_disabled`   |
| `otp_expired`, `flow_state_expired`, `bad_code_verifier`            | `link_expired`        |
| `refresh_token_not_found`, `session_not_found`, 401 after a refresh | `session_expired`     |
| `fetch` failure / offline                                           | `network`             |
| anything else                                                       | `unknown` (logged)    |

The sign-up response never reveals whether an email exists beyond what Supabase returns.

### 5. Push (PLT-014)

**Scope**

- Runs only for an `account` identity whose `userId` equals the session user (§7).
- Guests never sync.

**Order**

1. Coalesced one-row records: the latest `settings`, `profile` and `hearts` record only
   (ARCHITECTURE §4.3).
2. Then `lesson_result` records by `createdAt` ascending, in batches of up to 100.

**Idempotency and conflicts**

- Lesson results: insert with `Prefer: resolution=ignore-duplicates` (`ON CONFLICT (id) DO
NOTHING`). A replayed id is a success.
- One-row tables: upsert with `Prefer: resolution=merge-duplicates`. The server's
  `skip_stale_update` trigger keeps the newer `updated_at`; ties apply. Settings stay
  whole-record LWW (ADR-018 §6).

**Results**

| Response                                                | Action                                                                                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2xx                                                     | delete the queue record                                                                                                                                                |
| network error, 5xx, 408, 429                            | `attemptCount++`, `nextAttemptAt = now + min(base·2^n, max)` with ±20 % jitter (`SYNC_CONFIG`); kept `pending`                                                         |
| 401                                                     | stop the round. supabase-js refreshes once; if the next round is still 401, status `error` with `session_expired`. The queue is kept and the user signs in again (§7). |
| other 4xx (check, RLS 42501, invalid input 22P02/23514) | if a batch fails, retry its records one by one to isolate the bad one; that record becomes `status: "rejected"`, kept and never retried (dev tools and logs)           |
| `attemptCount ≥ SYNC_CONFIG.maxAttempts`                | `rejected`                                                                                                                                                             |

**Column mapping.** Every payload is parsed with its contract schema before mapping. Column
names are `camelToSnake` of the fields (checked by `supabase-schema.test.ts`), with these
exceptions:

| Contract        | Table            | Notes                                                                                                                                                                                                                                  |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LessonResult`  | `lesson_results` | `xp.base` → `xp_base`, `xp.perfectBonus` → `xp_perfect_bonus`; `kind` → `kind` (missing → `'lesson'`); `exerciseOutcomes` → `exercise_outcomes` (jsonb, missing → `null`); `user_id` is set by the default `auth.uid()` and never sent |
| `Settings`      | `settings`       | `startLevel` → `start_level` (missing → `null`); `goalPlans` → `goal_plans` after `normalizeGoalPlans` (`{}` → `null`); the legacy `goalPlan` / `goal_plan` is **never sent** (CTO-021)                                                |
| `ProfileUpdate` | `profiles`       | `avatar` → `avatar_kind` + `avatar_preset_id`; `joined_at` is sent only on the first insert (the trigger keeps the earliest)                                                                                                           |
| `HeartsState`   | `hearts_state`   | `refillStartedAt` → `refill_started_at`                                                                                                                                                                                                |

### 6. Pull (PLT-015)

Pull runs after every push round, at sign-in and after the guest migration. The cursors live
in `SyncMeta.pullCursors` (`SyncPullCursorsSchema`) and are always **server** values.

**Lesson results**

- Cursor: `(created_at, id)` (`LessonResultCursor`).
- Query: `select … where created_at > c.createdAt or (created_at = c.createdAt and id > c.id)
order by created_at, id limit 1000`.
- If the page is full, `hasMore` is true and the next page is pulled at once.
- The id is part of the cursor because one guest migration inserts up to 10,000 rows with
  the same `created_at`.

**Profile, settings, hearts**

- Query: `select … where server_updated_at > cursor` (0 or 1 row each).

**Merge into Dexie**

- Every row is mapped back (§5 in reverse) and parsed with the contract schema. A row that
  fails is skipped and logged once; it never blocks the rest.
- Lesson results: `put` if the id is new. Never update or delete a local result.
- One-row facts: if a pending queue record for that kind exists and the local `updatedAt`
  is newer than the remote one, keep the local record (it will be pushed). Otherwise take
  the remote record; a tie takes the remote.
- Pulled settings are passed through `normalizeGoalPlans`.
- **Nothing local is ever deleted by a pull, and an unsynced local record is never
  overwritten.**
- After a merge, invalidate `["progress", *]`, `["settings"]`, `["profile"]` and
  `["hearts"]`.

### 7. One sync at a time

- **Lock:** `navigator.locks.request("polyglow-sync", { ifAvailable: true }, run)`. A tab
  that doesn't get the lock skips the round; the holder's results reach the other tabs
  through Dexie (`liveQuery`) and a `BroadcastChannel("polyglow-sync")` "synced" message.
- **Fallback** without Web Locks: a lease in `meta` (`syncLeaseUntil`, 30 s).
- **Session guard:** a round starts only if the session user equals `Identity.userId`.
  Otherwise the engine stops with status `error` and the app asks the user to log out
  first (§8). This prevents pushing one user's queue into another account.

### 8. Accounts on one device, and the settings merge on log-in

**Guest → account (PLT-013).** Runs after sign-up confirmation, log-in or Google:

1. Build `GuestMigrationPayload` from Dexie.
2. Call `migrate_guest_to_account`.
3. On success, in one Dexie transaction: rewrite `identity` to `{ kind: "account", userId }`,
   delete the guest's queue records (their content is in the payload), then pull (§6).
4. On failure nothing changes locally and the prompt can retry. The RPC is idempotent: a
   replay inserts no result twice (tested).

**Settings merge in the RPC** (criterion 2, PD-087; migration
`20261128120000_migrate_guest_settings_merge.sql`). Before this, a guest record newer than the
account's replaced the whole row, so a second device that onboarded today wiped the account's
goal plans and start level. An older guest record was dropped, losing its plans for other
courses. Now, for an existing account:

- `goal_plans`: **union by course id**; the newer record (by `updatedAt`) wins a course both
  have. A legacy single `goalPlan` counts for its record's `courseId` (ADR-018 §3).
- `start_level`: the newer record's, else the older record's. Never dropped to `null`.
- Every other field (course, daily goal, toggles) is newer-wins as before.
- `updated_at` is the greater of the two; the legacy `goal_plan` column is written `null`.

Profile, hearts and lesson results are unchanged (results are a union by id). Regular push
(§5) stays whole-record LWW, because a signed-in device has pulled the account's settings
before it edits them.

**Account → another account (PLT-017):** only after log-out. The auth screens are hidden while
signed in, and the session guard (§7) blocks a mismatched session.

**Log-out sequence (PLT-017):**

1. Run one sync round (timeout 10 s).
2. If records are still unsynced (pending or rejected), show their count and ask the user to
   confirm ("These changes are only on this device and will be lost").
3. `supabase.auth.signOut({ scope: "local" })`.
4. Delete the Dexie database.
5. Create a fresh guest (identity, profile, hearts; no settings, so onboarding shows).
6. Clear the TanStack Query cache and go to `/`.

### 9. Testing

**Database tests:** `supabase/tests/accounts.test.sql`, `npm run test:db`. Plain SQL with
`assert`s in one rolled-back transaction, covering:

- user A can't select or insert user B's rows in any table, or update them;
- `anon` has no privilege on any table;
- a replayed migration payload inserts no result, and a duplicate result id is ignored;
- a stale settings update is skipped;
- the settings merge in §8, for newer and older guests and a legacy plan.

It was verified in the cto's container on a plain Postgres with every migration and a stub
`auth` schema (the same grants as Supabase). It also fails as expected without the §8
migration.

**Accounts e2e:** the Playwright `accounts` project (`playwright.accounts.config.ts`,
`tests/accounts`, `npm run test:e2e:accounts`):

- sign-up returns no session (confirmation is on, as on hosted), the confirmation mail
  arrives in the local mail UI, and sign-in before confirming gives `email_not_confirmed`
  (criterion 8);
- two users through the REST API (own rows only, no cross writes) and anon gets nothing.

It has no web server; PLT-010 onward add their UI specs here. It skips with the reason when
the stack isn't running, and **fails** instead with `ACCOUNTS_REQUIRED=1`.

**Harness:** `docs/architecture/local-supabase.md` covers start, reset, stop, URLs, keys, the
mail UI and test users.

**CI:** the `accounts` job runs on every PR:

1. `supabase/setup-cli`, then `supabase start` in Docker (extras excluded);
2. export the local URL and keys, masked;
3. `npm run test:db`, then `npm run test:e2e:accounts` with `ACCOUNTS_REQUIRED=1`.

The agents' container has no Docker daemon, so CI is the place these run before every merge.
The default e2e projects need no Supabase and are unchanged.

### 10. Contracts

`src/contracts/auth.ts` adds `AuthErrorCodeSchema` and `safeNextPath`. `sync.ts` adds:

- `LessonResultCursorSchema`;
- `SyncPullCursorsSchema`;
- optional `SyncMeta.pullCursors`, so `meta` records stored before CTO-025 stay valid;
- `SyncPullResultSchema`.

The `GuestMigrationPayload` doc states the merge rule. Everything is additive and optional,
so **`CONTRACTS_VERSION` stays 1**.

## Consequences

- dev-platform can build PLT-010 … PLT-018 against `supabase start`.
- The production build stays guest-only, with zero Supabase requests, until the owner sets
  the two variables.
- Logging in on a second device no longer loses goal plans or the start level.
- Every PR runs the database and auth tests in CI, which makes CI slower (Docker images).
  The default e2e job is unaffected.
- Hosted Supabase (CTO-024) needs only the migrations, the redirect URLs and the provider
  settings; no app change.
