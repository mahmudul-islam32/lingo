-- CTO-019: per-exercise outcomes and the review kind on lesson results (ADR-019; PD-079,
-- PD-080, PD-081).
--
-- LessonResult.kind ("lesson" | "review", missing = "lesson") and
-- LessonResult.exerciseOutcomes (optional array of {lessonId, exerciseId, exerciseType,
-- outcome}) in src/contracts/lesson-session.ts. Embedded in the result row, like the
-- contract embeds them in the result (ADR-019 §2): no child table, no new RLS, and the
-- append-only insert policy of lesson_results covers them. Additive: existing rows get
-- kind 'lesson' and null outcomes; CONTRACTS_VERSION stays 1.

-- Shape and count check for exercise_outcomes, the same refinements as LessonResultSchema
-- (ADR-019 §2). A CHECK can't hold a subquery, so it calls this immutable helper.
create function public.is_valid_exercise_outcomes(
  outcomes jsonb,
  kind text,
  lesson_id text,
  exercise_count integer,
  first_try_correct_count integer,
  skipped_count integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when outcomes is null then kind is distinct from 'review'
    when jsonb_typeof(outcomes) <> 'array' then false
    when jsonb_array_length(outcomes) > exercise_count then false
    when kind = 'review' and jsonb_array_length(outcomes) = 0 then false
    -- Every element: slug ids, a known exercise type and outcome. EXERCISE_TYPES in
    -- src/contracts/course.ts, EXERCISE_OUTCOMES in src/contracts/lesson-session.ts.
    when exists (
      select 1
      from jsonb_array_elements(outcomes) as e(o)
      where not (
        jsonb_typeof(e.o) = 'object'
        and coalesce(e.o ->> 'lessonId' ~ '^[a-z0-9]+(-[a-z0-9]+)*$', false)
        and length(e.o ->> 'lessonId') <= 64
        and coalesce(e.o ->> 'exerciseId' ~ '^[a-z0-9]+(-[a-z0-9]+)*$', false)
        and length(e.o ->> 'exerciseId') <= 64
        and (e.o ->> 'exerciseType') in (
          'multiple_choice', 'word_bank_translate', 'match_pairs', 'listen', 'speak',
          'cloze', 'choice', 'listening', 'task', 'explain'
        )
        and (e.o ->> 'outcome') in ('correct', 'incorrect', 'skipped')
        -- A lesson result's outcomes belong to its lesson; a review's to source lessons.
        and case
          when kind = 'review' then (e.o ->> 'lessonId') <> 'review'
          else (e.o ->> 'lessonId') = lesson_id
        end
      )
    ) then false
    else (
      select count(*) filter (where e.o ->> 'outcome' = 'correct') = first_try_correct_count
        and count(*) filter (where e.o ->> 'outcome' = 'skipped') = skipped_count
        and count(distinct (e.o ->> 'lessonId', e.o ->> 'exerciseId')) = count(*)
      from jsonb_array_elements(outcomes) as e(o)
    )
  end;
$$;

alter table public.lesson_results
  add column kind text not null default 'lesson'
    constraint lesson_results_kind_check check (kind in ('lesson', 'review'));

alter table public.lesson_results
  add column exercise_outcomes jsonb;

-- REVIEW_SESSION_ID in src/contracts/course.ts: reserved for review results only.
alter table public.lesson_results
  add constraint lesson_results_review_ids_check check (
    (kind = 'review') = (lesson_id = 'review') and (kind = 'review') = (unit_id = 'review')
  ),
  add constraint lesson_results_exercise_outcomes_check check (
    public.is_valid_exercise_outcomes(
      exercise_outcomes, kind, lesson_id, exercise_count, first_try_correct_count, skipped_count
    )
  );

comment on column public.lesson_results.kind is
  'LessonResult.kind (ADR-019): lesson or review. Review results never complete a lesson.';
comment on column public.lesson_results.exercise_outcomes is
  'LessonResult.exerciseOutcomes (ADR-019): one {lessonId, exerciseId, exerciseType, outcome} per presented exercise; null before CTO-019.';

-- migrate_guest_to_account: carry kind and exerciseOutcomes with every lesson result. Body
-- otherwise unchanged from 20261126120000; CREATE OR REPLACE keeps the existing grants
-- (authenticated only).

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
      perfect, xp_base, xp_perfect_bonus, xp_earned, hearts_lost, local_date, time_zone,
      kind, exercise_outcomes
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
      r ->> 'timeZone',
      coalesce(r ->> 'kind', 'lesson'),
      nullif(r -> 'exerciseOutcomes', 'null'::jsonb)
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
