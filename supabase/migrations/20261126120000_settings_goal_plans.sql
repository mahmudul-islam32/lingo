-- CTO-018: one goal plan per course (ADR-018, amends ADR-015; PD-078).
--
-- Settings.goalPlans (src/contracts/user.ts) is an optional Record<Slug, GoalPlan>.
-- Stored as one nullable jsonb column (column name = camelToSnake of the contract field),
-- with a CHECK on every entry: slug key, { targetLevel, targetDate } value, as in ADR-015
-- §6. The legacy goal_plan column stays (read-only, like Settings.goalPlan) until
-- ADR-018's removal step after v0.6.0. Additive and nullable: existing rows and clients
-- stay valid, RLS unchanged, CONTRACTS_VERSION stays 1. No data migration on the server:
-- no client syncs settings before v0.6.0, and migrate_guest_to_account applies the
-- legacy rule below.

-- Shape check for goal_plans. A CHECK constraint can't hold a subquery, so it calls this
-- immutable helper. Keys: SlugSchema in src/contracts/common.ts; values: GoalPlanSchema.
create function public.is_valid_goal_plans(plans jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when plans is null then true
    when jsonb_typeof(plans) <> 'object' then false
    else not exists (
      select 1
      from jsonb_each(plans) as e(course_id, plan)
      where not (
        length(e.course_id) between 1 and 64
        and e.course_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and jsonb_typeof(e.plan) = 'object'
        -- CEFR_LEVELS in src/contracts/course.ts.
        and (e.plan ->> 'targetLevel') in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
        -- LocalDateSchema in src/contracts/common.ts (YYYY-MM-DD).
        and coalesce((e.plan ->> 'targetDate') ~ '^\d{4}-\d{2}-\d{2}$', false)
      )
    )
  end;
$$;

alter table public.settings
  add column goal_plans jsonb
    constraint settings_goal_plans_shape check (public.is_valid_goal_plans(goal_plans));

comment on column public.settings.goal_plans is
  'Settings.goalPlans {courseId: {targetLevel, targetDate}} (ADR-018). Null = no plans.';

comment on column public.settings.goal_plan is
  'Legacy Settings.goalPlan (ADR-015), read-only since ADR-018; superseded by goal_plans.';

-- migrate_guest_to_account: carry every course's goal plan, after applying the legacy
-- rule (ADR-018 §3). Body otherwise unchanged from 20261121120000; CREATE OR REPLACE
-- keeps the existing grants (authenticated only).

create or replace function public.migrate_guest_to_account(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_guest_id uuid;
  v_profile jsonb;
  v_settings jsonb;
  v_goal_plans jsonb;
  v_hearts jsonb;
  v_results jsonb;
  v_received integer;
  v_inserted integer;
  v_new_account boolean;
begin
  if v_user_id is null then
    raise exception 'migrate_guest_to_account: not authenticated' using errcode = '42501';
  end if;

  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'migrate_guest_to_account: payload must be an object' using errcode = '22023';
  end if;
  -- CONTRACTS_VERSION in src/contracts/config.ts.
  if (payload ->> 'schemaVersion') is distinct from '1' then
    raise exception 'migrate_guest_to_account: unsupported schemaVersion %', payload ->> 'schemaVersion'
      using errcode = '22023';
  end if;

  v_guest_id := (payload ->> 'guestId')::uuid;
  v_profile := payload -> 'profile';
  v_settings := payload -> 'settings';
  -- ADR-018 §3 (same rule as normalizeGoalPlans in src/contracts/user.ts): a legacy
  -- single goalPlan belongs to the record's courseId; an entry in goalPlans wins.
  v_goal_plans := nullif(v_settings -> 'goalPlans', 'null'::jsonb);
  if nullif(v_settings -> 'goalPlan', 'null'::jsonb) is not null then
    v_goal_plans := jsonb_build_object(v_settings ->> 'courseId', v_settings -> 'goalPlan')
      || coalesce(v_goal_plans, '{}'::jsonb);
  end if;
  v_hearts := payload -> 'hearts';
  v_results := payload -> 'lessonResults';

  if v_guest_id is null
    or jsonb_typeof(v_profile) is distinct from 'object'
    or jsonb_typeof(v_settings) is distinct from 'object'
    or jsonb_typeof(v_hearts) is distinct from 'object'
    or jsonb_typeof(v_results) is distinct from 'array' then
    raise exception 'migrate_guest_to_account: payload is missing guestId, profile, settings, hearts or lessonResults'
      using errcode = '22023';
  end if;

  v_received := jsonb_array_length(v_results);
  if v_received > 10000 then
    raise exception 'migrate_guest_to_account: too many lesson results (%)', v_received
      using errcode = '54000';
  end if;

  v_new_account := not exists (select 1 from public.profiles where user_id = v_user_id);

  -- Profile -----------------------------------------------------------------
  insert into public.profiles as p (
    user_id, display_name, avatar_kind, avatar_preset_id, joined_at, onboarded_at, updated_at
  )
  values (
    v_user_id,
    v_profile ->> 'displayName',
    v_profile -> 'avatar' ->> 'kind',
    v_profile -> 'avatar' ->> 'presetId',
    (v_profile ->> 'joinedAt')::timestamptz,
    (v_profile ->> 'onboardedAt')::timestamptz,
    (v_profile ->> 'updatedAt')::timestamptz
  )
  on conflict (user_id) do update set
    display_name = case when excluded.updated_at > p.updated_at then excluded.display_name else p.display_name end,
    avatar_kind = case when excluded.updated_at > p.updated_at then excluded.avatar_kind else p.avatar_kind end,
    avatar_preset_id = case when excluded.updated_at > p.updated_at then excluded.avatar_preset_id else p.avatar_preset_id end,
    onboarded_at = case when excluded.updated_at > p.updated_at then excluded.onboarded_at else p.onboarded_at end,
    updated_at = greatest(p.updated_at, excluded.updated_at),
    joined_at = least(p.joined_at, excluded.joined_at);

  -- Settings ----------------------------------------------------------------
  insert into public.settings as s (
    user_id, course_id, daily_goal_xp, sound_effects_enabled, speaking_exercises_enabled, start_level,
    goal_plan, goal_plans, updated_at
  )
  values (
    v_user_id,
    v_settings ->> 'courseId',
    (v_settings ->> 'dailyGoalXp')::integer,
    (v_settings ->> 'soundEffectsEnabled')::boolean,
    (v_settings ->> 'speakingExercisesEnabled')::boolean,
    v_settings ->> 'startLevel',
    -- The legacy goalPlan is migrated into goalPlans (ADR-018 §3), never stored again.
    null,
    v_goal_plans,
    (v_settings ->> 'updatedAt')::timestamptz
  )
  on conflict (user_id) do update set
    course_id = excluded.course_id,
    daily_goal_xp = excluded.daily_goal_xp,
    sound_effects_enabled = excluded.sound_effects_enabled,
    speaking_exercises_enabled = excluded.speaking_exercises_enabled,
    start_level = excluded.start_level,
    goal_plan = excluded.goal_plan,
    goal_plans = excluded.goal_plans,
    updated_at = excluded.updated_at
  where excluded.updated_at > s.updated_at;

  -- Hearts ------------------------------------------------------------------
  insert into public.hearts_state as h (user_id, current, refill_started_at, updated_at)
  values (
    v_user_id,
    (v_hearts ->> 'current')::integer,
    (v_hearts ->> 'refillStartedAt')::timestamptz,
    (v_hearts ->> 'updatedAt')::timestamptz
  )
  on conflict (user_id) do update set
    current = excluded.current,
    refill_started_at = excluded.refill_started_at,
    updated_at = excluded.updated_at
  where excluded.updated_at > h.updated_at;

  -- Lesson results (union by id) --------------------------------------------
  with inserted as (
    insert into public.lesson_results (
      id, user_id, course_id, unit_id, lesson_id, started_at, completed_at, duration_ms,
      exercise_count, first_try_correct_count, mistake_count, skipped_count, accuracy,
      perfect, xp_base, xp_perfect_bonus, xp_earned, hearts_lost, local_date, time_zone
    )
    select
      (r ->> 'id')::uuid,
      v_user_id,
      r ->> 'courseId',
      r ->> 'unitId',
      r ->> 'lessonId',
      (r ->> 'startedAt')::timestamptz,
      (r ->> 'completedAt')::timestamptz,
      (r ->> 'durationMs')::bigint,
      (r ->> 'exerciseCount')::integer,
      (r ->> 'firstTryCorrectCount')::integer,
      (r ->> 'mistakeCount')::integer,
      (r ->> 'skippedCount')::integer,
      (r ->> 'accuracy')::double precision,
      (r ->> 'perfect')::boolean,
      (r -> 'xp' ->> 'base')::integer,
      (r -> 'xp' ->> 'perfectBonus')::integer,
      (r ->> 'xpEarned')::integer,
      (r ->> 'heartsLost')::integer,
      (r ->> 'localDate')::date,
      r ->> 'timeZone'
    from jsonb_array_elements(v_results) as r
    on conflict (id) do nothing
    returning 1
  )
  select count(*)::integer into v_inserted from inserted;

  -- Audit -------------------------------------------------------------------
  insert into public.guest_migrations as g (
    guest_id, user_id, lesson_results_received, lesson_results_inserted
  )
  values (v_guest_id, v_user_id, v_received, v_inserted)
  on conflict (guest_id, user_id) do update set
    last_migrated_at = now(),
    attempt_count = g.attempt_count + 1,
    lesson_results_received = excluded.lesson_results_received,
    lesson_results_inserted = g.lesson_results_inserted + excluded.lesson_results_inserted;

  return jsonb_build_object(
    'newAccount', v_new_account,
    'lessonResultsReceived', v_received,
    'lessonResultsInserted', v_inserted,
    'lessonResultsDuplicate', v_received - v_inserted
  );
end;
$$;
