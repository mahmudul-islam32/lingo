-- CTO-003: initial schema (ADR-003).
--
-- Mirrors the synced facts in src/contracts (CONTRACTS_VERSION 1):
--   profiles        <- Profile          (user.ts)          one row per user, LWW
--   settings        <- Settings         (user.ts)          one row per user, LWW
--   hearts_state    <- HeartsState      (gamification.ts)  one row per user, LWW
--   lesson_results  <- LessonResult     (lesson-session.ts) append-only, idempotent by id
--   guest_migrations                    audit of guest -> account merges (sync metadata)
--
-- Column conventions:
--   user_id            = auth.users.id, defaults to auth.uid() so clients never send it
--   updated_at         = the CLIENT's `updatedAt` (last-write-wins conflict key)
--   server_updated_at  = set by trigger on every write; the pull cursor (no client clock skew)
--   created_at         = server insert time; the pull cursor for lesson_results
--
-- Derived values (total XP, streak, daily goal, path) are never stored (ADR-002).
-- Content is bundled JSON and not stored in Postgres in MVP.

-- ---------------------------------------------------------------------------
-- Domains shared by several tables (same rules as the zod schemas)
-- ---------------------------------------------------------------------------

-- SlugSchema: lowercase kebab-case, 1..64 chars.
create domain public.slug as text
  check (char_length(value) between 1 and 64 and value ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- ---------------------------------------------------------------------------
-- Trigger functions
-- ---------------------------------------------------------------------------

-- Keeps server_updated_at current on every insert/update (pull cursor).
create function public.set_server_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.server_updated_at := now();
  return new;
end;
$$;

-- Last-write-wins guard: an update carrying an older client `updated_at` than the
-- stored row is silently skipped, so a plain PostgREST upsert can never overwrite
-- newer data with a stale offline edit. Ties are applied (idempotent replays).
create function public.skip_stale_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end;
$$;

-- user_id and created_at never change once a row exists.
create function public.keep_row_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

-- profiles.joined_at is the earliest join date ever seen (ARCHITECTURE 4.4).
create function public.keep_earliest_joined_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.joined_at := least(old.joined_at, new.joined_at);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles <- Profile
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- DisplayNameSchema: trimmed, 1..30 chars.
  display_name text not null
    check (display_name = btrim(display_name) and char_length(display_name) between 1 and 30),
  -- AvatarSchema: { kind: "initials" } | { kind: "preset", presetId }.
  avatar_kind text not null default 'initials' check (avatar_kind in ('initials', 'preset')),
  avatar_preset_id public.slug,
  joined_at timestamptz not null,
  onboarded_at timestamptz,
  updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  constraint profiles_avatar_preset_check
    check ((avatar_kind = 'preset') = (avatar_preset_id is not null))
);

comment on table public.profiles is 'Profile contract (src/contracts/user.ts). LWW by updated_at.';
comment on column public.profiles.updated_at is 'Client updatedAt, last-write-wins key.';
comment on column public.profiles.server_updated_at is 'Server write time, pull cursor.';

-- ---------------------------------------------------------------------------
-- settings <- Settings
-- ---------------------------------------------------------------------------

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  course_id public.slug not null,
  -- DAILY_GOAL_OPTIONS in src/contracts/config.ts.
  daily_goal_xp integer not null check (daily_goal_xp in (10, 20, 30, 50)),
  sound_effects_enabled boolean not null default true,
  speaking_exercises_enabled boolean not null default true,
  updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now()
);

comment on table public.settings is 'Settings contract (src/contracts/user.ts). LWW by updated_at.';

-- ---------------------------------------------------------------------------
-- hearts_state <- HeartsState
-- ---------------------------------------------------------------------------

create table public.hearts_state (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- GAME_CONFIG.maxHearts = 5.
  current integer not null check (current between 0 and 5),
  refill_started_at timestamptz,
  updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  -- refillStartedAt is null exactly when hearts are full.
  constraint hearts_state_refill_check check ((current = 5) = (refill_started_at is null))
);

comment on table public.hearts_state is
  'HeartsState contract (src/contracts/gamification.ts). Stored, refilled lazily at read time. LWW by updated_at.';

-- ---------------------------------------------------------------------------
-- lesson_results <- LessonResult (append-only, immutable)
-- ---------------------------------------------------------------------------

create table public.lesson_results (
  -- Client-generated UUID; the idempotency key. Insert with ON CONFLICT (id) DO NOTHING.
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id public.slug not null,
  unit_id public.slug not null,
  lesson_id public.slug not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_ms bigint not null check (duration_ms >= 0),
  exercise_count integer not null check (exercise_count > 0),
  first_try_correct_count integer not null check (first_try_correct_count >= 0),
  mistake_count integer not null check (mistake_count >= 0),
  skipped_count integer not null check (skipped_count >= 0),
  accuracy double precision not null check (accuracy between 0 and 1),
  perfect boolean not null,
  xp_base integer not null check (xp_base >= 0),
  xp_perfect_bonus integer not null check (xp_perfect_bonus >= 0),
  xp_earned integer not null check (xp_earned >= 0),
  hearts_lost integer not null check (hearts_lost >= 0),
  local_date date not null,
  time_zone text not null check (char_length(time_zone) between 1 and 64),
  created_at timestamptz not null default now(),
  -- Same refinements as LessonResultSchema.
  constraint lesson_results_time_order_check check (completed_at >= started_at),
  constraint lesson_results_counts_check
    check (first_try_correct_count + skipped_count <= exercise_count),
  constraint lesson_results_perfect_check check (perfect = (mistake_count = 0)),
  constraint lesson_results_bonus_check check (perfect or xp_perfect_bonus = 0),
  constraint lesson_results_xp_sum_check check (xp_earned = xp_base + xp_perfect_bonus),
  constraint lesson_results_hearts_check check (hearts_lost <= mistake_count)
);

comment on table public.lesson_results is
  'LessonResult contract (src/contracts/lesson-session.ts). Append-only grow-only set keyed by client id.';
comment on column public.lesson_results.created_at is 'Server insert time, pull cursor.';

-- Pull: "results created since lastPullAt" for the current user.
create index lesson_results_user_created_idx on public.lesson_results (user_id, created_at);
-- Derivations per course (streak, daily goal, completed lessons) and future leaderboards.
create index lesson_results_user_course_date_idx
  on public.lesson_results (user_id, course_id, local_date);

-- ---------------------------------------------------------------------------
-- guest_migrations: one row per (guest, account) merge, written only by
-- migrate_guest_to_account(). Lets support/debugging see what was merged and
-- makes retries observable. Clients may read their own rows.
-- ---------------------------------------------------------------------------

create table public.guest_migrations (
  guest_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_migrated_at timestamptz not null default now(),
  last_migrated_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count >= 1),
  lesson_results_received integer not null default 0 check (lesson_results_received >= 0),
  lesson_results_inserted integer not null default 0 check (lesson_results_inserted >= 0),
  primary key (guest_id, user_id)
);

create index guest_migrations_user_idx on public.guest_migrations (user_id);

comment on table public.guest_migrations is
  'Audit of guest -> account merges (GuestMigrationPayload, src/contracts/sync.ts). Written by RPC only.';

-- ---------------------------------------------------------------------------
-- Triggers (same-event triggers fire in name order; the result does not depend on it)
-- ---------------------------------------------------------------------------

create trigger profiles_skip_stale before update on public.profiles
  for each row execute function public.skip_stale_update();
create trigger profiles_keep_identity before update on public.profiles
  for each row execute function public.keep_row_identity();
create trigger profiles_keep_joined_at before update on public.profiles
  for each row execute function public.keep_earliest_joined_at();
create trigger profiles_server_updated_at before insert or update on public.profiles
  for each row execute function public.set_server_updated_at();

create trigger settings_skip_stale before update on public.settings
  for each row execute function public.skip_stale_update();
create trigger settings_keep_identity before update on public.settings
  for each row execute function public.keep_row_identity();
create trigger settings_server_updated_at before insert or update on public.settings
  for each row execute function public.set_server_updated_at();

create trigger hearts_state_skip_stale before update on public.hearts_state
  for each row execute function public.skip_stale_update();
create trigger hearts_state_keep_identity before update on public.hearts_state
  for each row execute function public.keep_row_identity();
create trigger hearts_state_server_updated_at before insert or update on public.hearts_state
  for each row execute function public.set_server_updated_at();
