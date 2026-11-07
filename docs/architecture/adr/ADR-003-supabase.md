# ADR-003: Supabase schema, Row Level Security and guest migration

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** CTO-003
- **Decider:** cto

## Context

The app is offline-first (ARCHITECTURE §4): Dexie on the device is the source of truth
and Supabase is the remote copy for accounts and cross-device sync. Guests never talk
to the server; when they sign up, their device data is merged into the account
(US-PLT-05, `GuestMigrationPayload` in `src/contracts/sync.ts`). The schema must store
exactly the synced facts from the contracts, make every write idempotent or
last-write-wins, and make it impossible for one user to read or change another
user's rows. There is no hosted Supabase project yet, so everything has to work with
the local CLI stack and be verifiable without network access.

## Decisions

### 1. Layout of `/supabase`

| Path                                                     | Purpose                                                   |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `config.toml`                                            | Local CLI stack (`supabase start`); no project linked yet |
| `migrations/20261107120000_initial_schema.sql`           | domain, tables, indexes, triggers                         |
| `migrations/20261107120100_row_level_security.sql`       | RLS, policies, privilege revokes                          |
| `migrations/20261107120200_migrate_guest_to_account.sql` | the guest migration RPC                                   |
| `seed.sql`                                               | one fake local learner (`learner@example.com`)            |

Migrations are forward-only and timestamped (`YYYYMMDDHHMMSS_name.sql`); a change is
always a new file, never an edit of a merged one. The Google provider in
`config.toml` reads `env(SUPABASE_AUTH_GOOGLE_CLIENT_ID/SECRET)`; no secret is
committed.

### 2. Tables (only facts, never derived values)

| Table              | Contract                                | Key                   | Write rule                           |
| ------------------ | --------------------------------------- | --------------------- | ------------------------------------ |
| `profiles`         | `Profile` (`user.ts`)                   | `user_id`             | upsert, LWW on `updated_at`          |
| `settings`         | `Settings` (`user.ts`)                  | `user_id`             | upsert, LWW on `updated_at`          |
| `hearts_state`     | `HeartsState` (`gamification.ts`)       | `user_id`             | upsert, LWW on `updated_at`          |
| `lesson_results`   | `LessonResult` (`lesson-session.ts`)    | `id` (client UUID)    | insert `ON CONFLICT (id) DO NOTHING` |
| `guest_migrations` | audit of `GuestMigrationPayload` merges | `(guest_id, user_id)` | written only by the RPC              |

Column conventions:

- Columns are the contract fields in `snake_case`. Nested values are flattened:
  `avatar` → `avatar_kind` + `avatar_preset_id`, `xp` → `xp_base` + `xp_perfect_bonus`.
  `Profile.id` maps to `profiles.user_id` (= `auth.users.id`).
- `user_id` defaults to `auth.uid()` and references `auth.users` with
  `on delete cascade`, so clients never send it and deleting an auth user deletes
  their data.
- `updated_at` is the **client's** `updatedAt` (the LWW key), not a server clock.
- `server_updated_at` (trigger `set_server_updated_at`) and `created_at` are server
  times, used only as pull cursors so the client's clock never decides what it pulls.
- The zod refinements are mirrored as `CHECK` constraints (slug domain, display name
  1–30 trimmed, daily goal in 10/20/30/50, hearts 0–5 with
  `refill_started_at is null` iff full, the `LessonResult` count/XP/perfect rules).
  The server rejects what the client schema would reject; these are the "4xx
  validation" errors that mark a sync record `rejected`.
- Not stored: total XP, streak, daily goal progress, path state, XP events (ADR-002:
  derived from results), the lesson session, course content, `Identity`, `SyncMeta`.
  The per-device sync bookkeeping stays in Dexie; the only server-side sync metadata
  is `guest_migrations`.

Indexes: `lesson_results (user_id, created_at)` for the pull, and
`lesson_results (user_id, course_id, local_date)` for per-course derivations and the
Phase 2 leaderboards. Single-row tables are served by their primary key.

### 3. Triggers that make plain upserts safe

- `skip_stale_update` (profiles, settings, hearts_state): an `UPDATE` whose
  `updated_at` is older than the stored one is silently skipped (`return null`).
  A stale offline edit replayed late can never overwrite newer data, even through a
  plain PostgREST upsert. Ties are applied, so replays are harmless.
- `keep_row_identity`: `user_id` and `created_at` never change on update.
- `keep_earliest_joined_at` (profiles): `joined_at` only ever moves earlier
  (ARCHITECTURE §4.4).

All functions use `set search_path = ''` and fully qualified names.

### 4. Row Level Security

RLS is enabled on **every** table; a Vitest test parses the migrations and fails if a
table lacks `enable row level security` or a policy is not scoped to
`(select auth.uid()) = user_id` (`src/contracts/__tests__/supabase-schema.test.ts`).

| Table                                  | `authenticated`                                 | `anon`  |
| -------------------------------------- | ----------------------------------------------- | ------- |
| `profiles`, `settings`, `hearts_state` | select / insert / update own rows               | nothing |
| `lesson_results`                       | select / insert own rows; update+delete revoked | nothing |
| `guest_migrations`                     | select own rows; writes revoked                 | nothing |

- Policies use `(select auth.uid())` so the function runs once per statement.
- `anon` has all table privileges revoked in addition to having no policy.
- No delete policies in MVP; account deletion (later) deletes the auth user and the
  cascade removes the rows.
- Content is not in Postgres in MVP, so there are no public read policies at all.

### 5. RPC `migrate_guest_to_account(payload jsonb) returns jsonb`

Implements `MigrateGuestToAccount` (`api.ts`) and the `GuestMigrationPayload` rules,
in one transaction:

1. Requires `auth.uid()`; otherwise raises `42501`. The target user is always
   `auth.uid()`: no user id is read from the payload, and `profile.id` (the guest id)
   is ignored.
2. Checks `schemaVersion = 1` (`CONTRACTS_VERSION`) and the payload shape (`22023`),
   and caps `lessonResults` at 10 000 entries (`54000`).
3. Lesson results: inserted with `ON CONFLICT (id) DO NOTHING` (set union; duplicates
   inside the payload are fine).
4. Profile, settings, hearts: inserted when the account has no row yet (a new account
   adopts the guest's data, including `joinedAt`); otherwise the record with the newer
   `updatedAt` wins. `joined_at` becomes the earlier of the two.
5. Upserts a `guest_migrations` audit row (attempts, received, inserted).
6. Returns `{ newAccount, lessonResultsReceived, lessonResultsInserted,
lessonResultsDuplicate }`. The contract type returns `void`; the client may log it.

Any error (bad payload, failed `CHECK`) rolls back everything, so the client keeps its
guest data and can retry; a replay of the same payload is idempotent. The function is
`SECURITY DEFINER` (bypasses RLS) with `set search_path = ''`; `execute` is revoked
from `public` and `anon` and granted to `authenticated` only.

### 6. How sync maps to tables

| `SyncQueueRecord.kind` | Push                                                                                                                                  | Pull (since `SyncMeta.lastPullAt`)                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `lesson_result`        | `insert … on conflict (id) do nothing` (supabase-js `upsert`, `ignoreDuplicates: true`); 0 rows returned = duplicate → `duplicateIds` | `lesson_results` where `created_at > cursor`      |
| `settings`             | `upsert` on `user_id`; a stale write is skipped by the trigger                                                                        | `settings` where `server_updated_at > cursor`     |
| `profile`              | `upsert` of `ProfileUpdate` columns (`display_name`, `avatar_*`, `onboarded_at`, `updated_at`); first write also needs `joined_at`    | `profiles` where `server_updated_at > cursor`     |
| `hearts`               | `upsert` on `user_id`; stale write skipped                                                                                            | `hearts_state` where `server_updated_at > cursor` |

- The pull cursor is the **server** timestamp of the newest pulled row, stored in
  `SyncMeta.lastPullAt` (not the device clock), so device clock skew cannot skip rows.
- After a pull, the client applies the same LWW rule locally (newer `updatedAt` wins)
  and unions results by id, then re-derives aggregates.
- Error mapping for the engine: Postgres `23xxx`/`22xxx` (constraint/format) and
  `42501` (RLS) → `rejected`; network and `5xx` → retry with backoff (`SYNC_CONFIG`).
- Mapping rows ↔ contracts (snake_case ↔ camelCase, flattening) lives in
  `src/lib/sync` and every pulled row is parsed with the zod schema. Generated DB types
  go in `src/lib/supabase` once the project exists (`supabase gen types`).

## Consequences

- Plain supabase-js calls are enough for sync; the only RPC is the guest migration.
- Server and client enforce the same invariants; a contract change that touches a
  synced shape now also needs a migration, and the schema test flags a missing column.
- The `supabase-js` dependency, the browser client and generated types arrive with the
  first sync/auth ticket (v0.4.0). Until a hosted project exists, the SQL is verified by
  the static Vitest test; it was also applied to a local Postgres 16 with a stubbed
  `auth` schema to exercise RLS, LWW, idempotency and the RPC.
- Leaderboards (Phase 2) will need a read path across users; that will be a separate,
  explicitly reviewed view or RPC, never a relaxed table policy.

## Alternatives considered

- **Server-generated `updated_at` via trigger as the LWW key.** Rejected: an edit made
  offline and synced hours later would win over a newer edit from another device.
- **Write RPCs for every kind.** Rejected for MVP: more SQL to maintain; the LWW
  trigger gives the same safety for plain upserts.
- **JSONB blob per user.** Rejected: no constraints, no indexes, harder leaderboards.
- **Auto-creating profile rows on sign-up (`auth.users` trigger).** Rejected: the
  guest migration needs "no row yet" to mean "new account adopts guest data".
