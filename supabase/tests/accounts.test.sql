-- CTO-025 database tests (ADR-020 §9): RLS isolation, anon, idempotent guest migration,
-- duplicate result ids, stale settings updates, and the settings merge on log-in (§8).
--
-- Plain SQL, no extension: every check is an `assert` in a DO block, so the first failure
-- aborts with its message. Runs in one transaction that is rolled back, so the database
-- is left as it was. Run against the LOCAL stack only (never hosted):
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--     -v ON_ERROR_STOP=1 -f supabase/tests/accounts.test.sql
-- (`npm run test:db`). CI runs it in the `accounts` job after `supabase start`.

\set ON_ERROR_STOP on
begin;

-- Two users. auth.uid() reads the JWT `sub` claim; both spellings are set (old/new GoTrue).
insert into auth.users (id) values
  ('a0000000-0000-4000-8000-00000000000a'),
  ('b0000000-0000-4000-8000-00000000000b');

create function pg_temp.act_as(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end;
$$;

create function pg_temp.payload(guest uuid, settings jsonb, results jsonb) returns jsonb
language sql as $$
  select jsonb_build_object(
    'schemaVersion', 1,
    'guestId', guest,
    'profile', jsonb_build_object('displayName', 'Sam', 'avatar', jsonb_build_object('kind', 'initials'),
      'joinedAt', '2026-11-01T00:00:00Z', 'onboardedAt', null, 'updatedAt', '2026-11-01T00:00:00Z'),
    'settings', settings,
    'hearts', jsonb_build_object('current', 5, 'refillStartedAt', null, 'updatedAt', '2026-11-01T00:00:00Z'),
    'lessonResults', results)
$$;

create function pg_temp.settings(course text, goal int, extra jsonb, updated text) returns jsonb
language sql as $$
  select jsonb_build_object('courseId', course, 'dailyGoalXp', goal, 'soundEffectsEnabled', true,
    'speakingExercisesEnabled', true, 'updatedAt', updated) || extra
$$;

create function pg_temp.result(id uuid) returns jsonb language sql as $$
  select jsonb_build_object('id', id, 'courseId', 'en-de', 'unitId', 'de-a1-u01', 'lessonId', 'de-a1-u01-l1',
    'startedAt', '2026-11-20T10:00:00Z', 'completedAt', '2026-11-20T10:05:00Z', 'durationMs', 300000,
    'exerciseCount', 2, 'firstTryCorrectCount', 2, 'mistakeCount', 0, 'skippedCount', 0, 'accuracy', 1,
    'perfect', true, 'xp', jsonb_build_object('base', 10, 'perfectBonus', 5), 'xpEarned', 15,
    'heartsLost', 0, 'localDate', '2026-11-20', 'timeZone', 'Europe/Berlin')
$$;

-- 1. User A signs in on device 1: German A2 plan, start level A2, one lesson result. ------
select pg_temp.act_as('a0000000-0000-4000-8000-00000000000a');
select public.migrate_guest_to_account(pg_temp.payload(
  'c0000000-0000-4000-8000-000000000001',
  pg_temp.settings('en-de', 20,
    '{"startLevel":"A2","goalPlans":{"en-de":{"targetLevel":"A2","targetDate":"2027-03-12"}}}',
    '2026-11-20T00:00:00Z'),
  jsonb_build_array(pg_temp.result('d0000000-0000-4000-8000-000000000001'))));
reset role;

-- User B's data, written directly (as the table owner; RLS does not apply).
insert into public.settings (user_id, course_id, daily_goal_xp, sound_effects_enabled,
  speaking_exercises_enabled, updated_at)
values ('b0000000-0000-4000-8000-00000000000b', 'en-de', 10, true, true, '2026-11-20T00:00:00Z');
insert into public.hearts_state (user_id, current, refill_started_at, updated_at)
values ('b0000000-0000-4000-8000-00000000000b', 5, null, '2026-11-20T00:00:00Z');

-- 2. RLS: A sees only A's rows in every table and can't write B's. ----------------------
select pg_temp.act_as('a0000000-0000-4000-8000-00000000000a');
do $$
begin
  assert (select count(*) from public.settings) = 1, 'A must see exactly 1 settings row';
  assert (select count(*) from public.settings where user_id = 'b0000000-0000-4000-8000-00000000000b') = 0,
    'A must not see B''s settings';
  assert (select count(*) from public.hearts_state where user_id = 'b0000000-0000-4000-8000-00000000000b') = 0,
    'A must not see B''s hearts';
  assert (select count(*) from public.profiles where user_id <> 'a0000000-0000-4000-8000-00000000000a') = 0,
    'A must not see other profiles';
  assert (select count(*) from public.lesson_results where user_id <> 'a0000000-0000-4000-8000-00000000000a') = 0,
    'A must not see other lesson results';
  assert (select count(*) from public.guest_migrations where user_id <> 'a0000000-0000-4000-8000-00000000000a') = 0,
    'A must not see other guest migrations';
end;
$$;
do $$
begin
  begin
    insert into public.hearts_state (user_id, current, refill_started_at, updated_at)
    values ('b0000000-0000-4000-8000-00000000000b', 1, now(), now());
    raise exception 'A could insert a row for B';
  exception when insufficient_privilege or unique_violation or check_violation then null;
  end;
  begin
    insert into public.lesson_results (id, user_id, course_id, unit_id, lesson_id, started_at,
      completed_at, duration_ms, exercise_count, first_try_correct_count, mistake_count,
      skipped_count, accuracy, perfect, xp_base, xp_perfect_bonus, xp_earned, hearts_lost,
      local_date, time_zone)
    values ('d0000000-0000-4000-8000-0000000000b1', 'b0000000-0000-4000-8000-00000000000b', 'en-de',
      'u1', 'l1', now(), now(), 0, 1, 1, 0, 0, 1, true, 10, 5, 15, 0, current_date, 'UTC');
    raise exception 'A could insert a lesson result for B';
  exception when insufficient_privilege then null;
  end;
  update public.settings set daily_goal_xp = 50 where user_id = 'b0000000-0000-4000-8000-00000000000b';
  assert not found, 'A could update B''s settings';
end;
$$;
reset role;

-- 3. anon sees nothing (no privileges at all). -----------------------------------------
set local role anon;
do $$
declare t text;
begin
  foreach t in array array['profiles', 'settings', 'hearts_state', 'lesson_results', 'guest_migrations'] loop
    begin
      execute format('select count(*) from public.%I', t);
      raise exception 'anon can read public.%', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
end;
$$;
reset role;

-- 4. Replaying the same migration payload inserts no extra lesson result. ---------------
select pg_temp.act_as('a0000000-0000-4000-8000-00000000000a');
do $$
declare r jsonb;
begin
  r := public.migrate_guest_to_account(pg_temp.payload(
    'c0000000-0000-4000-8000-000000000001',
    pg_temp.settings('en-de', 20,
      '{"startLevel":"A2","goalPlans":{"en-de":{"targetLevel":"A2","targetDate":"2027-03-12"}}}',
      '2026-11-20T00:00:00Z'),
    jsonb_build_array(pg_temp.result('d0000000-0000-4000-8000-000000000001'))));
  assert (r ->> 'lessonResultsInserted')::int = 0, 'replay inserted a lesson result';
  assert (r ->> 'lessonResultsDuplicate')::int = 1, 'replay did not report the duplicate';
  assert (select count(*) from public.lesson_results) = 1, 'replay changed the result count';
end;
$$;

-- 5. A pushed duplicate result id is ignored (push = insert on conflict do nothing). ---
insert into public.lesson_results (id, course_id, unit_id, lesson_id, started_at, completed_at,
  duration_ms, exercise_count, first_try_correct_count, mistake_count, skipped_count, accuracy,
  perfect, xp_base, xp_perfect_bonus, xp_earned, hearts_lost, local_date, time_zone)
values ('d0000000-0000-4000-8000-000000000001', 'en-de', 'de-a1-u01', 'de-a1-u01-l1',
  '2026-11-20T10:00:00Z', '2026-11-20T10:05:00Z', 1, 2, 0, 2, 0, 0, false, 10, 0, 10, 0,
  '2026-11-20', 'UTC')
on conflict (id) do nothing;
do $$
begin
  assert (select count(*) from public.lesson_results) = 1, 'duplicate id added a row';
  assert (select xp_earned from public.lesson_results) = 15, 'duplicate id overwrote the result';
end;
$$;

-- 6. A stale settings update (older updatedAt) is skipped; a newer one applies. ---------
update public.settings set daily_goal_xp = 50, updated_at = '2026-11-19T00:00:00Z';
do $$
begin
  assert (select daily_goal_xp from public.settings) = 20, 'stale settings update was applied';
end;
$$;
reset role;

-- 7. Log-in on a second device merges settings (ADR-020 §8, PD-087). --------------------
select pg_temp.act_as('a0000000-0000-4000-8000-00000000000a');
-- Newer guest with only a telc plan and no start level: German plan and A2 are kept.
select public.migrate_guest_to_account(pg_temp.payload(
  'c0000000-0000-4000-8000-000000000002',
  pg_temp.settings('telc-b1-en-de', 30,
    '{"goalPlans":{"telc-b1-en-de":{"targetLevel":"B1","targetDate":"2027-06-30"}}}',
    '2026-11-25T00:00:00Z'),
  '[]'));
do $$
declare s public.settings;
begin
  select * into s from public.settings;
  assert s.daily_goal_xp = 30 and s.course_id = 'telc-b1-en-de', 'newer scalars must win';
  assert s.start_level = 'A2', 'start level was dropped';
  assert s.goal_plans -> 'en-de' ->> 'targetLevel' = 'A2', 'the account''s German plan was lost';
  assert s.goal_plans -> 'telc-b1-en-de' ->> 'targetLevel' = 'B1', 'the guest''s telc plan was lost';
  assert s.goal_plan is null, 'the legacy goal_plan column must stay empty';
end;
$$;
-- Older guest with a conflicting German plan and a plan for a new course: the account's
-- (newer) German plan stays, the new course's plan is added, scalars stay.
select public.migrate_guest_to_account(pg_temp.payload(
  'c0000000-0000-4000-8000-000000000003',
  pg_temp.settings('en-de', 10,
    '{"startLevel":"B1","goalPlans":{"en-de":{"targetLevel":"A1","targetDate":"2027-01-01"},"en-es":{"targetLevel":"A1","targetDate":"2027-02-02"}}}',
    '2026-11-10T00:00:00Z'),
  '[]'));
do $$
declare s public.settings;
begin
  select * into s from public.settings;
  assert s.daily_goal_xp = 30 and s.start_level = 'A2', 'an older guest must not win scalars';
  assert s.goal_plans -> 'en-de' ->> 'targetLevel' = 'A2', 'an older guest overwrote a shared key';
  assert s.goal_plans ? 'en-es', 'an older guest''s plan for another course was lost';
  assert s.goal_plans ? 'telc-b1-en-de', 'an existing plan was lost';
end;
$$;
-- Newer guest from v0.5.4 with a legacy single goalPlan: it counts for its courseId.
select public.migrate_guest_to_account(pg_temp.payload(
  'c0000000-0000-4000-8000-000000000004',
  pg_temp.settings('en-de', 20,
    '{"goalPlan":{"targetLevel":"B1","targetDate":"2027-09-09"}}', '2026-11-27T00:00:00Z'),
  '[]'));
do $$
declare s public.settings;
begin
  select * into s from public.settings;
  assert s.goal_plans -> 'en-de' ->> 'targetLevel' = 'B1', 'a newer legacy plan must win its course';
  assert s.goal_plans ? 'en-es' and s.goal_plans ? 'telc-b1-en-de', 'other plans were lost';
  assert s.updated_at = '2026-11-27T00:00:00Z', 'updated_at must be the newer record''s';
end;
$$;
reset role;

rollback;
\echo 'accounts.test.sql: all checks passed'
