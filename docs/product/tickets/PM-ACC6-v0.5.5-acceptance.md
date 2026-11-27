# PM-ACC6: Release acceptance for v0.5.5 "Smart review" and the per-course goal plan
**Owner:** pm · **Date:** 2026-11-27 · **Branch:** `docs/pm-013-v055-acceptance` ·
**Lifecycle:** `ORCHESTRATOR.md` step 5 ("Accept") · **Decisions:** PD-065, PD-071 §2,
PD-078 … PD-082, PD-083, PD-084 · **Release branch:** `chore/release-v0.5.5` (not yet cut)

## Scope and method
- **Code:** `main` at `6bb29a4`, read file by file: CTO-018 (#114), CTO-019 (#115), LES-023
  (#116), GAM-014 (#117), PLT-028 (#118), GAM-015 (#119), PLT-029 (#120), CTO-020 (#123). I
  didn't run commands myself.
- **Run evidence (cto, production build of `6bb29a4`):** full e2e **164/164** across
  `mobile-chrome`, `desktop-chrome` and `pwa-prod`. `review.spec.ts` covers 375 px for
  LES-023 AC 13 and GAM-015 AC 14. PLT-028's CI axe failure was a fade-in timing issue
  (axe measured contrast mid-animation). It was fixed in the test by waiting for the dialog's
  animations to finish (`dialogSettled` in `goal-date-per-course.spec.ts`). **No axe rule
  was disabled** in the e2e helpers. Unit tests, typecheck, lint and build are reported green;
  I take the coverage figure for GAM-015 AC 6 from that run.
- **Supabase:** both migrations (`20261126120000_settings_goal_plans.sql`,
  `20261126130000_lesson_results_exercise_outcomes.sql`) were tested by the cto on a local
  Postgres. None was run against hosted Supabase, as the tickets require.
- **No screenshots** for this milestone. The verdicts rest on the code and on the RTL / e2e
  tests named below.
- **Verdicts:** PASS · PASS (note) · FAIL (becomes a `fix/` ticket; PD-083 says whether it
  blocks).

## Summary

| Ticket | Verdict | Notes |
|---|---|---|
| CTO-018 Goal plan per course (contract, migration) | **Accepted** (11 of 11 PASS) | `goalPlans` record + `goalPlanFor` / `normalizeGoalPlans` / `withGoalPlan`; lazy migration, no Dexie bump (ADR-018). `SettingsPatch.goalPlan` removal is a follow-up, **CTO-021** (not blocking, PD-083) |
| CTO-019 Outcomes, review kind, review contracts | **Accepted** (14 of 14 PASS) | Outcomes embedded in `LessonResult` (ADR-019 §2); reserved `review` ids |
| GAM-014 `useGoalPlan({ courseId })` per course | **Accepted** (7 of 7 PASS) | — |
| GAM-015 Selection rule, review progress rules, Review card | **Accepted** (15 of 15 PASS) | AC 14 "first lesson card above the fold" follows from the layout and is not asserted by a test (note) |
| LES-023 Outcomes in every result, review player, review results | **Accepted** (14 of 14 PASS) | — |
| PLT-028 Profile / results use the course's own plan; switch e2e | **Accepted** (14 of 14 PASS) | CI axe fix was a test wait, not a disabled rule |
| PLT-029 `/review` route, storage, e2e | **Accepted** (16 of 17 PASS) | AC 10 **FAIL**: the error state says "Back to Learn" but goes to `/practice`; the ticket says "Back" → **FIX-015** (P2, **not blocking**, PD-083) |
| CTO-020 Exercise-id uniqueness documented as a review guarantee | **Accepted** (4 of 4 PASS) | Ticket file written after the merge (`CTO-020.md`) |

**Release recommendation for the cto: v0.5.5 is ready for release.** Every ticket is
accepted. The cto can run the release checklist (`chore/release-v0.5.5`). The two follow-ups
are not blocking (PD-083):
- **FIX-015** (dev-lessons + one line by dev-platform, P2): the error state on `/review`
  says "Back" instead of "Back to Learn". It is rare (only when the review queue or every
  lesson fails to load), the button leads somewhere sensible (Practice), and nothing is lost.
  Ship it in the next milestone.
- **CTO-021** (cto, P1, planned): remove the deprecated `SettingsPatch.goalPlan` write path
  (ADR-018 §5: "right after PLT-028 merges"). No feature writes it any more, so learners
  can't notice it. It **must** be merged before PLT-010 / PLT-014 start, so v0.6.0 never
  syncs a legacy write.

Suggested CHANGELOG lines (cto's wording wins): "Practice has a Review card: exercises you
answered come back on a 1-3-7-14-30-day schedule, free and at 0 hearts too; each course
keeps its own goal date." Review history starts empty for existing learners (PD-080), so the
release note should say that review fills as they finish lessons.

---

## CTO-018: A goal plan per course

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `user.ts`: `GoalPlansSchema = z.record(SlugSchema, GoalPlanSchema)`, `Settings.goalPlans` optional. `goal-plans.test.ts` "changing one course's plan leaves the other unchanged". |
| 2 | PASS | `SettingsPatch.goalPlanUpdate: { courseId, goalPlan \| null }`; `withGoalPlan` sets or removes one key. Test "set A → set B → clear A leaves only B". |
| 3 | PASS | `goalPlanFor` gives a legacy `goalPlan` to the record's `courseId` only; `normalizeGoalPlans` moves it there, existing entry wins, idempotent, no input mutation (5 tests). `courseId` is required in `SettingsSchema`, so the "else `DEFAULT_COURSE_ID`" branch can't happen (ADR-018 §2). No Dexie bump (lazy migration, ADR-018 §3). |
| 4 | PASS | Legacy `goalPlan` kept as `@deprecated`, read-only, until the first release after v0.6.0 sync is live (ADR-018 §5). Test "a settings record queued by v0.5.4 (single goalPlan) still parses". `SettingsPatch.goalPlan` is still in the type; the ADR schedules its removal right after PLT-028, which is now merged → **CTO-021** (not a FAIL: the ADR says which and for how long, as asked). |
| 5 | PASS | `ComputeGoalPlan` unchanged apart from the doc comment ("this course's plan: `goalPlanFor(settings, course.id)`"); `GoalPlanStatus` unchanged. |
| 6 | PASS | `20261126120000_settings_goal_plans.sql`: nullable `goal_plans jsonb`, CHECK through the immutable `is_valid_goal_plans` (slug keys, ADR-015 plan shape), RLS unchanged; `migrate_guest_to_account` merges the legacy plan into `goal_plans`. Local Postgres only. |
| 7 | PASS | `ADR-018-goal-plan-per-course.md`: shape, migration rule, clear = remove the key, consumer changes, and §6 **keeps whole-record LWW** for v0.6.0 (PLT-014 inherits it). |
| 8 | PASS | cto run on `6bb29a4`. |
| 9 | PASS | Test "accepts one plan per course id, including unknown, hidden or level-less courses"; keys validated as slugs. |
| 10 | PASS | `CONTRACTS_VERSION` stays `1` (test). |
| 11 | PASS | `goalPlanFor(settings, courseId)` exported from the contracts; tests for the new shape, the old plan on the active course, the old plan for another course → `null`, and inherited keys such as `"constructor"`. |

## CTO-019: Per-exercise outcomes and the review contracts

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `ExerciseOutcome { lessonId, exerciseId, exerciseType, outcome }` in `lesson-session.ts`; rule in ADR-019 §1 (`skipped` → `correct` first try → else `incorrect`). No per-outcome timestamp (date = result `localDate`). |
| 2 | PASS | Refinement: in a review result no outcome may use the reserved id. Test "rejects a review outcome that points to the review itself". |
| 3 | PASS | Embedded in `LessonResult`, so one transaction, one sync record and one idempotency key by construction (ADR-019 §2); double-save test in `src/lib/offline/__tests__/exercise-outcomes.test.ts` (PLT-029 AC 1). |
| 4 | PASS | The ADR picks the recommended embedded array: no new table, index or sync kind. |
| 5 | PASS | Fixture tests: more outcomes than `exerciseCount`, duplicate `(lessonId, exerciseId)`, `correct` ≠ `firstTryCorrectCount`, `skipped` ≠ `skippedCount`, an outcome from another lesson in a lesson result. ADR-019 §1 shows both equalities hold without exception. |
| 6 | PASS | Tests "a result stored by v0.5.4 (no kind, no outcomes) still parses as a lesson" and "CONTRACTS_VERSION stays 1 and queued v0.5.4 lesson_result records still parse". |
| 7 | PASS | `kind?: "lesson" \| "review"` (missing = lesson), `lessonResultKind` / `isReviewResult`; review results use `unitId = lessonId = REVIEW_SESSION_ID`, which `CourseSchema` rejects for any unit or lesson (test). |
| 8 | PASS | Consumer rule documented on `ComputeUserProgress` (ADR-019 §3). |
| 9 | PASS | `review.ts`: `ReviewItemSchema` (reviewable types only), `ReviewCandidateSchema`, `ReviewSelectionSchema`; `SelectReviewItems` in `api.ts` with the GAM-015 rule and worked example in its doc comment. |
| 10 | PASS | `reviewSessionSize: 10`, `reviewIntervalsDays: [1, 3, 7, 14, 30]` validated by `GameConfigSchema`; `REVIEW_EXERCISE_TYPES` = every type except `speak`, `task`, `explain` (test). |
| 11 | PASS | Test "review reuses the lesson XP and hearts values (no new constant)". |
| 12 | PASS | `20261126130000_lesson_results_exercise_outcomes.sql`: `kind` with CHECK and default, `exercise_outcomes jsonb`, review-id CHECK, outcomes CHECK via `is_valid_exercise_outcomes`; RPC carries both. Local Postgres only (15 CHECK cases). |
| 13 | PASS | `ADR-019-smart-review-outcomes.md`: shape, outcome rule, review rule, item type, config, storage cost (~1.1 KB per result), consumer changes. |
| 14 | PASS | cto run on `6bb29a4`. |

## GAM-014: `useGoalPlan` reads the plan of its course

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `use-goal-plan.ts`: `courseId = options.courseId ?? active course`; returns `undefined` / `null` / status as before. Test "AC1: without courseId it uses the active course". |
| 2 | PASS | Tests "AC2: a plan on en-de only gives en-de its status and telc null" and "with plans on both courses each hook returns its own target and counts". |
| 3 | PASS | Tests "AC3: a migrated v0.5.4 record gives its single plan to the active course only" and "a goalPlans entry wins over a legacy plan". |
| 4 | PASS | Test "AC4: set, change, clear and a result of one course update only that course" (query invalidation). |
| 5 | PASS | Grep on `src/features`: the only reader of a stored plan is `goalPlanFor` in the hook; the rule and copy receive the plan as an argument. |
| 6 | PASS | `GoalPlanCard`, `goal-plan.ts` and copy unchanged; GAM-013 tests still run (fixtures through a `settings()` helper). |
| 7 | PASS | Read errors are logged once and give `null` (existing test "a read error returns null and is logged"); the plan is read only through `goalPlanFor`. |

## GAM-015: Selection rule, review progress rules, Practice "Review" card

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `rules/review.ts` `reviewSchedule`: active course only, lesson in the manifest, `isReviewExerciseType`, `skipped` ignored. Tests G / H / I of the worked example. |
| 2 | PASS | `correctRun` counted over results in `completedAt` order (stable for equal instants); `reviewIntervalDays` caps at the last interval; due when `dueDate ≤ today`. Tests "a wrong answer after a correct run resets the run", "skipped outcomes neither break nor extend a run". |
| 3 | PASS | `compareEntries`: due, `correctRun`, `dueDate`, lesson order, position, id; one candidate per `exerciseId`. Tests for every tie-breaker and for the dedupe. |
| 4 | PASS | Returns `{ candidates, dueCount, eligibleCount }`. |
| 5 | PASS | Test "orders A, B, D, E, C, F with dueCount 4 and eligibleCount 6", plus each run and due date, and independence from input order. |
| 6 | PASS | Tests "ignores other courses' results" and "counts review results' outcomes against their source lessons". 100 % branch coverage taken from the cto run. |
| 7 | PASS | `completedLessonIdsOf` and `computeUserProgress` skip `isReviewResult`; `buildPracticeList` skips them too; `useGoalPlan` uses `completedLessonIdsOf`. Tests: "0 completed lessons and 1 review result: no completed lesson, its XP in today's total", the streak test, the practice-list test, and `use-goal-plan-review.test.tsx` (lessons left stays 60). |
| 8 | PASS | `useReviewQueue` exported from `@/features/gamification`; `loading` / `error` / `success`; reads `["progress", courseId]`, the manifest and `useLocalToday`; a read error is logged once. `use-review-queue.test.tsx`. |
| 9 | PASS | `PracticeScreen` renders `ReviewCard` after the header and intro, before the list, for every course. RTL "sits under the intro and above the lesson list". |
| 10 | PASS | `ReviewCardView`: skeleton the card's height (`h-42` = `min-h-42`, text only visually hidden); no history / due (singular and plural) / caught up copy exactly as the ticket; `null` on error. RTL per state. |
| 11 | PASS | Both links `href="/review"`; RTL "is offered at 0 hearts and after any number of reviews today (no cap)". |
| 12 | PASS | `REVIEW_BANNED_WORDS` equals the ticket's list; RTL checks every state, whole words, case insensitive. |
| 13 | PASS | `section` named by the "Review" heading (loading: `aria-label="Review"`); count line is a plain `<p>`; links named by their visible text; Tab + Enter test; axe per state. |
| 14 | PASS (note) | `PRIMARY_LINK` is `min-h-14`, `SOFT_LINK` `min-h-12`; `break-words`; v2 tokens. `review.spec.ts` checks the card's box within 375 px and no horizontal scroll in the due state at 375 × 667. "First lesson card starts above the fold" is not asserted: from the layout (top bar, title, intro, a ~180 px card, 24 px gaps) the list starts at about 400 px of 667, so it holds. A test for it can join PLT-023 (v1.0.0). |
| 15 | PASS | `ReviewCard.test.tsx` covers 8–13 per state; existing Practice tests run with the card added. |

## LES-023: Review in the player, outcomes in every result, review results

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `outcomes.test.ts`: wrong-then-right → `incorrect`, a match-pairs mismatch → `incorrect`, a listen skipped for missing audio → `skipped`, a hidden speak → none; counts match and the result parses. |
| 2 | PASS | Tests "a quit session is not completed, so it has no summary or result" and the out-of-hearts case. |
| 3 | PASS | `ReviewPlayer` + `buildReviewLesson`: items in the given order, one course, up to `reviewSessionSize`; re-queue at the end (RTL "a wrong answer is re-queued at the end"). Prop shape: a review "lesson" plus a source map (`review.sourceLessonIds`), as ADR-019 allows. |
| 4 | PASS | RTL: outcomes `[u1-l1 rv-mc, u2-l3 rv-wb, u1-l1 rv-mp]`, `isReviewResult` true; `outcomes.test.ts` "is marked as a review with the reserved ids". |
| 5 | PASS | `practice` is always on; RTL at 0 hearts: Practice badge, no heart lost on a wrong answer, a heart gained per correct Check, no out-of-hearts screen. |
| 6 | PASS | `buildReviewLesson` sets no `tip` (test); RTL: no "Start" tip button, `lang="es"` on options, the exercise's own explanation in the feedback panel. |
| 7 | PASS | `main` named "Review" (RTL and e2e `getByRole("main", { name: "Review" })`); progress "Exercise 1 of 3". |
| 8 | PASS | RTL: "Quit review" → "Quit this review?" dialog, Keep learning / Escape / Quit; nothing produced. |
| 9 | PASS | RTL "AC 9: sound effects follow soundEffectsEnabled". |
| 10 | PASS | `ResultsScreen` review mode by `isReviewResult`: "Review complete!", the same tiles, streak and goal rows, `goalPlan` forced to `undefined` (RTL "no goal-date row" with an on-track plan passed in). |
| 11 | PASS | "Continue" + "Review more" (no "Practice again"); save once, save error with "Try again" (RTL). |
| 12 | PASS | RTL "a 10-item review plays with the keyboard only"; heading focus on results; axe in the player, in feedback and on the results. |
| 13 | PASS (note) | `review.spec.ts` at 375 × 667: the review player and the review results with Continue, no horizontal scroll (cto run). The e2e plays German Lesson 1's types; `cloze`, `choice` and `listening` render through the same components as in lessons, already fitted in LES-021 / TELC-001. |
| 14 | PASS | Fixture of 3 items from 2 lessons (`multiple_choice`, `word_bank_translate`, `match_pairs`) in `ReviewPlayer.test.tsx`; existing player and results tests run unchanged. |

## PLT-028: Profile and results use the course's own plan

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `GoalDateRow` reads `goalPlanFor(settings, courseId)`. RTL "the row shows the active course's plan only", "each course shows its own plan"; FIX-014 absence on courses without levels unchanged. |
| 2 | PASS | RTL "the dialog preselects and previews with the active course's plan and levels" (telc B1). |
| 3 | PASS | `update.mutateAsync({ goalPlanUpdate: { courseId, goalPlan } })`; `repositories.ts` normalizes the stored record, spreads the patch, then `withGoalPlan` (ADR-018 §4). RTL reads settings after the save: the German plan is unchanged. |
| 4 | PASS | RTL "Remove clears only the active course's plan": toast, "Not set", the German plan stays. |
| 5 | PASS | Both RTL tests assert `dailyGoalXp` unchanged; the PLT-027 save-failure test still runs. |
| 6 | PASS | `LearnScreen` `useGoalPlan({ courseId })`; RTL "PLT-028 AC 6: Learn shows the active course's plan, not another course's". |
| 7 | PASS | `LessonScreen` passes `useGoalPlan({ courseId })` with no active-course guard; RTL "shows the plan of the lesson's course even when another course is active". |
| 8 | PASS | `set-course.test.tsx` "useSetCourse and goal plans (PLT-028 AC 8)": switching keeps both plans; `lib/offline/__tests__/goal-plans.test.ts` covers a switch with a stored v0.5.4 record. |
| 9 | PASS | Dexie and bundled content only; no fetch added. |
| 10 | PASS | RTL with two courses for 1–5 and 7; PLT-027 and FIX-014 tests still run with fixtures in the new shape. |
| 11 | PASS | RTL axe with the dialog open on `en-de` and on telc B1; the e2e runs axe in the dialog on both courses after the open animation (the CI fix waits, no rule disabled). |
| 12 | PASS | e2e checks no horizontal scroll with the dialog open on both courses at 375 × 667. |
| 13 | PASS | `goal-date-per-course.spec.ts`: the exact sequence of the criterion, keyboard only, fixed clock 2026-11-21. |
| 14 | PASS | cto run on `6bb29a4`, 164/164. |

## PLT-029: `/review` route, storage, e2e

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `exercise-outcomes.test.ts` with Dexie (fake-indexeddb) and the memory fallback: one record, one queue entry, a double save is a no-op. |
| 2 | PASS | Read back through `listLessonResults` after a reload; v0.5.4 rows still load; a corrupt row is skipped and reported. |
| 3 | PASS | No table, no index, no Dexie version bump. |
| 4 | PASS | Unit test on the built guest-migration payload and the queue record (contract test too). |
| 5 | PASS | `ReviewScreen` lives outside `(tabs)` (no bottom nav); `loadReviewItems` walks candidates in order, loads each lesson once, stops at `reviewSessionSize`, skips missing lessons / exercises (`load-review-items.test.ts`). |
| 6 | PASS | `ReviewPlayer` → `ResultsScreen` review mode; Continue → `/practice`; "Review more" re-reads the queue after the save and remounts the player with a new `key` (RTL). |
| 7 | PASS | No path-lock check in `ReviewScreen`; RTL plays a review at 0 hearts. |
| 8 | PASS | Empty state: Lumi, "Nothing to review yet." + the text, "Go to Practice" link. RTL for an empty queue and for candidates whose lessons are all gone; e2e for a new learner. |
| 9 | PASS | `LessonPlayerSkeleton` while the queue, course or items load (RTL). |
| 10 | **FAIL** → **FIX-015** (not blocking, PD-083) | Behaviour is right: a failed queue read, or every candidate lesson failing with a non-content error, shows `LessonPlayerError`; "Try again" re-reads; the second button goes to `/practice` (RTL). **But the button says "Back to Learn"** (`PlayerError.tsx` line 41), and the ticket asks for "Back". A learner is told "Learn" and lands on Practice. The RTL test matches `/^Back/`, so it doesn't catch the label. The same label shows in `ReviewPlayer`'s own error state (no playable item), whose `onQuit` also goes to Practice. |
| 11 | PASS | e2e "offline: an opened review plays and saves on the device": goes offline after the review starts, finishes, "Review saved.", IndexedDB holds a `lesson` and a `review` result. Lessons that fail offline are skipped by `loadReviewItems`. |
| 12 | PASS | `onSaved` → `invalidateProgress(courseId)`; RTL asserts the `["progress", DE]` invalidation. |
| 13 | PASS | Empty and error states have an `h1` that takes focus and focusable actions; RTL axe on empty and error; e2e axe on the empty state and in the player. |
| 14 | PASS | e2e: empty state at 375 × 667, no horizontal scroll, "Go to Practice" ≥ 48 px. Error-state buttons are `Button size="lg"` (the lesson error state already passed this in LES-021). |
| 15 | PASS | `ReviewScreen.test.tsx` covers 5–10 and 12 with mocked queue and fixture content. |
| 16 | PASS | `review.spec.ts`: onboard German, Lesson 1 with one wrong answer, Practice card "due" with a count ≥ 1, "Start review", play to "Review complete!" with XP, Continue → Practice, Lesson 1 listed once; second test: a new learner → empty state. Keyboard only, fixed clock. |
| 17 | PASS | cto run on `6bb29a4`, 164/164. |

## CTO-020: Exercise-id uniqueness documented as a review guarantee

Criteria are in `CTO-020.md` (written after the merge, as for FIX-001).

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `content.test.ts` "exercise ids are unique across all lessons of all courses (CTO-008)" reads every lesson file of every course dir (incl. telc B1 and Einbürgerungstest) and lists any repeated id with its lessons; it guards against reading zero files. |
| 2 | PASS | The guarantee is written where review relies on it: `course.ts` (`exerciseBase.id`), `review.ts` (`ReviewSelectionSchema.candidates`), `api.ts` (`SelectReviewItems` §4) and ADR-019 §5. |
| 3 | PASS | ADR-019 §5 explains the consequences: a session may key by id (LES-023), the dedupe never drops an eligible exercise, and the counts match the playable candidates; `ReviewSelectionSchema` keeps `≤` so the rule stays total on invalid content. |
| 4 | PASS | cto run on `6bb29a4`. |

## Product checks beyond the criteria

| Check | Result |
|---|---|
| Copy rules (PD-035, PD-079 §8) | PASS: "ready for review", "all caught up", "Nothing to review yet." No "weak", "mistakes", exam or pass words in the card, route or results. |
| Free, no cap, at 0 hearts (PD-065, PD-071 §2, PD-072) | PASS: no gating anywhere; RTL and e2e at 0 hearts. |
| Review never completes a lesson (PD-079 §6) | PASS: path, Practice list and goal-plan count skip review results; e2e lists Lesson 1 once. |
| Empty history for existing learners (PD-080) | PASS: the card shows the "no history" line until a lesson is finished after the update. |
| Exam courses with review (PD-081) | PASS: `choice` / `listening` are reviewable; review works on telc B1 and Einbürgerungstest like any other course. |
| Goal date belongs to the course you are on (PD-078) | PASS: e2e switch sequence; plans for courses without levels are kept and not shown (CTO-018 AC 9). |
| Exam names and licences in the exam courses (MKT-002) | Not a v0.5.5 criterion. Decided in **PD-084**: hidden at public launch unless the owner clears A7 and A8 first; planned ticket **PLT-030** (v1.0.0). |

## FAIL tickets raised
- **FIX-015** (dev-lessons, one line by dev-platform, P2, **not blocking**, PD-083): the error
  state on `/review` (and in `ReviewPlayer`) says "Back", not "Back to Learn".

## Follow-up tickets raised
- **CTO-021** (cto, P1, planned, before PLT-010 / PLT-014): remove the deprecated
  `SettingsPatch.goalPlan` and its doc comment (ADR-018 §5). Not blocking v0.5.5.
- **PLT-030** (planned, v1.0.0 launch gate): hide telc B1 Exam Prep and Einbürgerungstest at
  public launch unless the owner has cleared them (PD-084).
- PLT-023 (v1.0.0) input: assert that the first Practice lesson card starts above the fold
  with the Review card in the "due" state (GAM-015 AC 14 note).

## Review
PM acceptance complete on 2026-11-27. **All eight tickets accepted; v0.5.5 is ready for
release.** FIX-015 and CTO-021 are follow-ups, not release gates (PD-083).

PM-VERDICT: ACCEPTED
