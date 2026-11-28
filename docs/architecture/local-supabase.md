# Local Supabase harness (CTO-025, ADR-020 §9)

Everything here runs against a **local** Supabase stack in Docker. Nothing touches the
hosted project (CTO-024), and no hosted key is ever needed.

## Prerequisites

- Docker running, and the [Supabase CLI](https://supabase.com/docs/guides/local-development)
  (`npx supabase` works too).
- `psql` for the database tests (`postgresql-client`).

## Start, reset, stop

| Task                                                          | Command                                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Start (applies `supabase/migrations` and `supabase/seed.sql`) | `supabase start`                                                                                    |
| Start without the extras the tests don't need                 | `supabase start -x studio,imgproxy,edge-runtime,logflare,vector,realtime,storage-api,postgres-meta` |
| Show URLs and keys again                                      | `supabase status`                                                                                   |
| Re-apply every migration from scratch (wipes local data)      | `supabase db reset`                                                                                 |
| Stop (keeps data) / stop and wipe                             | `supabase stop` / `supabase stop --no-backup`                                                       |

## Where things are

| What                                                                          | Where                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| API (Auth, REST, RPC)                                                         | `http://127.0.0.1:54321`, shown as "API URL"                |
| Anon / publishable key                                                        | `supabase status`, shown as "anon key" or "Publishable key" |
| Database                                                                      | `postgresql://postgres:postgres@127.0.0.1:54322/postgres`   |
| Mail UI (Mailpit, or Inbucket on older CLIs): confirmation and recovery mails | `http://127.0.0.1:54324`                                    |
| Studio (only if not excluded)                                                 | `http://127.0.0.1:54323`                                    |

Email confirmation is **on** locally, as on hosted (`supabase/config.toml`, PD-087). After
a sign-up, open the mail UI and click the link to confirm.

## Running the app against the local stack

Put the local values in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>
```

Without these two variables the app is guest-only and makes no request to Supabase
(ADR-020 §1).

## Tests

| Command                     | What                                                                                                                                                                                                                                                                                  | Needs                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `npm run test:db`           | `supabase/tests/accounts.test.sql`: RLS isolation between two users, `anon` sees nothing, replayed guest migration and duplicate result ids insert nothing, stale settings updates are skipped, and settings merge on log-in (ADR-020 §8). Runs in a transaction that is rolled back. | the local database (`SUPABASE_DB_URL` overrides the default URL)            |
| `npm run test:e2e:accounts` | Playwright `accounts` project (`tests/accounts`): sign-up sends a confirmation mail and can't sign in before confirming; two users through the REST API; anon gets nothing.                                                                                                           | `SUPABASE_ANON_KEY`, plus `SUPABASE_SERVICE_ROLE_KEY` for the two-user test |
| `npm run test:e2e`          | the default e2e projects                                                                                                                                                                                                                                                              | **no** Supabase                                                             |

The `accounts` specs **skip with the reason** when the stack isn't running, or fail
instead when `ACCOUNTS_REQUIRED=1` (CI).

**Test users** are created only on the local stack:

- through sign-up (confirmation mail in the mail UI), or
- with the admin API and the local `service_role` key from `supabase status`, exported as
  `SUPABASE_SERVICE_ROLE_KEY` for the test run only. That key is the local stack's demo key.

  Never put a hosted service-role key anywhere in this repo, `.env.local`, chat, issues or
  CI logs.

```
export SUPABASE_ANON_KEY=<anon key> SUPABASE_SERVICE_ROLE_KEY=<local service_role key>
npm run test:db && npm run test:e2e:accounts
```

## CI

The `accounts` job in `.github/workflows/ci.yml` runs on every pull request:

1. `supabase start` in Docker;
2. export the local URL and keys (masked);
3. `npm run test:db`, then `npm run test:e2e:accounts` with `ACCOUNTS_REQUIRED=1`.

The agents' own container has no Docker daemon, so CI is where these run before a merge.
