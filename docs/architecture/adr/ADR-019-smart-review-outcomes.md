# ADR-019: Smart review — per-exercise outcomes, review results and the review contracts

- **Status:** Accepted
- **Date:** 2026-11-26
- **Ticket:** CTO-019; consumers GAM-015, LES-023, PLT-029 (milestone v0.5.5 "Smart
  review"). Based on ADR-018 (same contract files).
- **Decider:** cto (product rules: PD-065, PD-071 §2, PD-079, PD-080, PD-081)

## Context

A finished session is saved as one `LessonResult` holding counts only. The per-exercise
`ExerciseAttempt`s live in the in-memory `LessonSession` and are dropped after the results
screen. Smart review needs to know, for every answered exercise, which course, lesson and
exercise it was, whether it was right the first time, and when. Three tickets build on
that: the selection rule and Practice card (GAM-015), the player in review mode (LES-023),
and the `/review` route with saving (PLT-029). All three need one stored shape and one
signature.

## Decision

### 1. Outcome rule

`ExerciseOutcome { lessonId, exerciseId, exerciseType, outcome }` (strict object). There
is one per **presented** exercise (hidden exercises have none), in order of first
presentation. `outcome` is derived from all of the exercise's attempts in the session, and
the first matching case wins:

1. `skipped`: it has a `skipped` attempt (listen without audio, "Can't speak now");
2. `correct`: its first attempt was `correct` with `mistake: false` (match pairs: no
   mismatch);
3. `incorrect`: anything else. `AnswerCheckResultSchema` guarantees that an incorrect
   answer is always a mistake, so this means at least one attempt had `mistake: true`. A
   correct retry later doesn't change it.

The rule is total, and it matches `sessionStats` exactly. The number of `correct` outcomes
equals `firstTryCorrectCount` and the number of `skipped` outcomes equals `skippedCount`
(an exercise with a skipped attempt is never first-try correct). Neither equality has an
exception, so both are refinements. Ungraded types (`task`, `explain`) are always
`correct`; they are stored but never reviewed.

There is **no per-outcome timestamp**. The date used for scheduling is the result's
`localDate`, and the order within a date is the result's `completedAt`. That is all
GAM-015 needs, and it keeps each outcome at about 90 bytes.

### 2. Shape: embedded in `LessonResult`

`LessonResult.exerciseOutcomes?: ExerciseOutcome[]`. This is the option PD-079 recommends.

Advantages:

- No new Dexie table, index, sync kind or repository method.
- Atomicity (criterion 3) holds by construction: the outcomes are inside the record that
  `saveLessonResult` already writes in one transaction with one sync record, under the
  same idempotency key `LessonResult.id`. Saving the same result twice is already a no-op.

Refinements (zod, mirrored by a CHECK on the server):

- at most `exerciseCount` outcomes;
- at most one outcome per `(lessonId, exerciseId)`;
- the `correct` and `skipped` counts match their counters (§1);
- in a lesson result, every outcome's `lessonId` equals the result's `lessonId`;
- in a review result, no outcome's `lessonId` is the reserved id (§3), so each outcome
  points to its **source** lesson (criterion 2).

Compatibility:

- The field is optional. Results stored or queued before CTO-019 have no outcomes and
  still parse and count for XP, streak, daily goal and path (PD-080: review history starts
  empty).
- `CONTRACTS_VERSION` stays `1`: queued `lesson_result` records with `schemaVersion: 1`
  parse unchanged (tested).

### 3. Review results

`LessonResult.kind?: "lesson" | "review"`. A missing kind means `"lesson"`. Read it with
`lessonResultKind(result)` or `isReviewResult(result)`.

- A review result has `unitId = lessonId = REVIEW_SESSION_ID` (`"review"`) and at least
  one outcome.
- The reserved id is rejected on any other result.
- `CourseSchema` rejects a unit or lesson with that id.

So no review result can ever look like a course lesson, even to code that ignores `kind`.
The review's `LessonSession` uses the same reserved ids.

Consumer rule (criterion 8, documented on `ComputeUserProgress` in `api.ts`): a review
result counts for total XP, today's XP, the daily goal and the streak. It **never** adds
to `completedLessonIds`, the path, the Practice list or the goal-plan count.

Review results are scored like a lesson:

- `xpPerLesson` plus `perfectLessonBonusXp` when perfect;
- hearts as for practice: `practiceCostsHearts` (false) and `heartsGainedPerCorrectAnswer`.

There is no new XP constant (PD-079).

### 4. Config

- `GAME_CONFIG.reviewSessionSize = 10`.
- `GAME_CONFIG.reviewIntervalsDays = [1, 3, 7, 14, 30]`.
- `GameConfigSchema` validates both: the size is a positive integer, and the intervals are
  a non-empty, strictly increasing list of positive integers.
- `REVIEW_EXERCISE_TYPES` (in `course.ts`, next to `UNGRADED_EXERCISE_TYPES`) lists
  `multiple_choice`, `word_bank_translate`, `match_pairs`, `listen`, `cloze`, `choice` and
  `listening`. It excludes `speak` (needs a microphone and is often hidden) and the
  ungraded `task` and `explain` (PD-081). `isReviewExerciseType` is the type guard.

### 5. Review item and selection

- `ReviewItem { courseId, unitId, lessonId, exercise }`, in `review.ts`. The exercise
  type must be reviewable. The player plays `exercise`, and the outcome gets `lessonId`.
- `SelectReviewItems({ course, results, today }) → ReviewSelection { candidates:
{ lessonId, exerciseId }[], dueCount, eligibleCount }`.
- The schema checks `dueCount ≤ eligibleCount`, that there are no more candidates than
  eligible exercises, and that there is one candidate per `exerciseId`.
- **Exercise ids are unique across all courses** (CTO-020). The content test
  `exercise ids are unique across all lessons of all courses` (CTO-008) enforces it on
  every `npm run test`. So `(lessonId, exerciseId)` pairs and exercise ids are 1:1: a
  review session may key by exercise id (LES-023), the dedupe per `exerciseId` never drops
  an eligible exercise, and `dueCount` / `eligibleCount` (counted by pair, GAM-015) match the
  playable candidates. `ReviewSelectionSchema` keeps `≤` rather than `=` so the rule stays
  total on invalid content.
- The full rule (eligibility, `correctRun`, intervals, due dates, order, the worked
  example) is written in the doc comment exactly as in GAM-015 criteria 1–6. The schedule
  is never stored: it is derived from results on the device, so there is no server
  schedule and no sync of one.

### 6. Backend

Migration `20261126130000_lesson_results_exercise_outcomes.sql`:

- `lesson_results.kind text not null default 'lesson'` with a CHECK for the two values.
  Existing rows become `lesson`.
- `lesson_results.exercise_outcomes jsonb` (nullable), embedded like the contract (no
  child table).
- `lesson_results_review_ids_check`: the reserved ids belong to review rows and only to
  them.
- `lesson_results_exercise_outcomes_check` calls the immutable helper
  `public.is_valid_exercise_outcomes(...)` (pinned `search_path`). It enforces the element
  shape and every §2 refinement, and requires outcomes on review rows.
- RLS: unchanged. The append-only owner insert policy of `lesson_results` covers the new
  columns.
- `migrate_guest_to_account` carries `kind` (default `lesson`) and `exerciseOutcomes` with
  every result.
- Tested on a local Postgres with all migrations: 15 CHECK cases, and the RPC with a
  v0.5.4 result and a review result. Not run against hosted Supabase.

### 7. Storage cost

About 12 outcomes per result at about 90 bytes is about 1.1 KB more per result in
IndexedDB and in the row. 1,000 sessions come to about 1 MB. Nothing to optimize.

## Consumer changes

- **GAM-015 (dev-gamification):**
  - `selectReviewItems` implements `SelectReviewItems`.
  - `computeUserProgress`, `computePathNodes`, `buildPracticeList` and the goal-plan count
    skip review results for completion (`isReviewResult`).
  - The Practice Review card reads `ReviewSelection`.
- **LES-023 (dev-lessons):**
  - `toLessonResult` fills `exerciseOutcomes` for every finished session with the §1 rule,
    and sets `kind: "review"` and the reserved ids for a review.
  - The player plays `ReviewItem[]`, and each outcome takes its item's `lessonId`.
- **PLT-029 (dev-platform):**
  - `/review` loads `ReviewItem`s for the first `reviewSessionSize` candidates.
  - Saving uses the existing `saveLessonResult`, with a test that a double save stores the
    outcomes once.
  - The guest migration payload and the sync queue carry the new fields unchanged.

## Consequences

- Every finished session from v0.5.5 on feeds review. Older history can't be backfilled.
- Results get larger, but there is no new table, sync kind or Dexie version.
- Review results are distinguishable everywhere by `kind` and by the reserved ids.
