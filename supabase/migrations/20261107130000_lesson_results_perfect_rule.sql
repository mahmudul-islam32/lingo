-- CR-003: PD-012 perfect lesson = 0 mistakes AND at least 1 counted exercise.
--
-- LessonResultSchema now requires
--   perfect === (mistakeCount === 0 && exerciseCount - skippedCount >= 1),
-- so a lesson where every exercise was skipped is not perfect (and gets no bonus).
-- The only rows the old check allowed and the new one rejects are all-skipped
-- results marked perfect, which no client has produced (v0.2.0 is the first
-- release with a lesson player).

alter table public.lesson_results
  drop constraint lesson_results_perfect_check;

alter table public.lesson_results
  add constraint lesson_results_perfect_check
  check (perfect = (mistake_count = 0 and exercise_count - skipped_count >= 1));
