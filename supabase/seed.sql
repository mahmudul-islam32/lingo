-- Local development seed (supabase db reset). NEVER run against a hosted project.
--
-- One fake learner with a profile, settings, hearts and two lesson results.
--   email:    learner@example.com
--   password: polyglow-local-dev   (local stack only; not a secret)
-- Course/unit/lesson ids are placeholders, not real course content.

-- Auth user (columns GoTrue needs to allow an email + password sign-in).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'learner@example.com',
  extensions.crypt('polyglow-local-dev', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', ''
);

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values (
  '11111111-1111-4111-8111-111111111112',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '{"sub": "11111111-1111-4111-8111-111111111111", "email": "learner@example.com", "email_verified": true}',
  'email',
  now(),
  now(),
  now()
);

insert into public.profiles (user_id, display_name, avatar_kind, joined_at, onboarded_at, updated_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'Dev Learner',
  'initials',
  '2026-11-01T09:00:00Z',
  '2026-11-01T09:02:00Z',
  '2026-11-01T09:02:00Z'
);

insert into public.settings (
  user_id, course_id, daily_goal_xp, sound_effects_enabled, speaking_exercises_enabled, updated_at
)
values (
  '11111111-1111-4111-8111-111111111111',
  'dev-course',
  20,
  true,
  true,
  '2026-11-01T09:02:00Z'
);

-- 4 of 5 hearts: one lost at 10:05, refill clock running since then.
insert into public.hearts_state (user_id, current, refill_started_at, updated_at)
values (
  '11111111-1111-4111-8111-111111111111',
  4,
  '2026-11-02T10:05:00Z',
  '2026-11-02T10:05:00Z'
);

insert into public.lesson_results (
  id, user_id, course_id, unit_id, lesson_id, started_at, completed_at, duration_ms,
  exercise_count, first_try_correct_count, mistake_count, skipped_count, accuracy,
  perfect, xp_base, xp_perfect_bonus, xp_earned, hearts_lost, local_date, time_zone
)
values
  -- Perfect lesson: 10 base + 5 bonus.
  (
    '22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111111',
    'dev-course', 'dev-unit-1', 'dev-lesson-1',
    '2026-11-01T09:03:00Z', '2026-11-01T09:07:30Z', 270000,
    10, 10, 0, 0, 1,
    true, 10, 5, 15, 0, '2026-11-01', 'Europe/Berlin'
  ),
  -- One mistake, one skipped speak exercise: 8 / (10 - 1).
  (
    '22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111111',
    'dev-course', 'dev-unit-1', 'dev-lesson-2',
    '2026-11-02T10:00:00Z', '2026-11-02T10:06:00Z', 360000,
    10, 8, 1, 1, 0.8888888888888888,
    false, 10, 0, 10, 1, '2026-11-02', 'Europe/Berlin'
  );
