-- CTO-003: Row Level Security (ADR-003).
--
-- Rule: a signed-in user reads and writes only rows whose user_id = auth.uid().
-- `anon` (guests never talk to the server) gets no policy, so it sees nothing.
-- `(select auth.uid())` is evaluated once per statement instead of once per row.
-- Deletes are not exposed in MVP; rows disappear with the auth user (on delete cascade).

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.hearts_state enable row level security;
alter table public.lesson_results enable row level security;
alter table public.guest_migrations enable row level security;

-- Defence in depth on top of RLS: anon has no table privileges at all.
revoke all on table
  public.profiles, public.settings, public.hearts_state, public.lesson_results,
  public.guest_migrations
  from anon;

-- ---------------------------------------------------------------------------
-- profiles, settings, hearts_state: one row per user, upserted (LWW)
-- PostgREST upsert = INSERT ... ON CONFLICT DO UPDATE, which needs select,
-- insert and update policies.
-- ---------------------------------------------------------------------------

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy settings_select_own on public.settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy settings_insert_own on public.settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy settings_update_own on public.settings
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy hearts_state_select_own on public.hearts_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy hearts_state_insert_own on public.hearts_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy hearts_state_update_own on public.hearts_state
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- lesson_results: append-only. Select + insert only; no update/delete policy,
-- and the privileges are revoked too, so results are immutable for clients.
-- Push uses INSERT ... ON CONFLICT (id) DO NOTHING (upsert with ignoreDuplicates).
-- ---------------------------------------------------------------------------

revoke update, delete, truncate on table public.lesson_results from authenticated;

create policy lesson_results_select_own on public.lesson_results
  for select to authenticated using ((select auth.uid()) = user_id);
create policy lesson_results_insert_own on public.lesson_results
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- guest_migrations: read own rows; writes only through migrate_guest_to_account().
-- ---------------------------------------------------------------------------

revoke insert, update, delete, truncate on table public.guest_migrations from authenticated;

create policy guest_migrations_select_own on public.guest_migrations
  for select to authenticated using ((select auth.uid()) = user_id);
