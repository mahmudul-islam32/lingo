# PM-ACC3: Release acceptance for v0.3.0, v0.3.1, v0.3.2, v0.3.3 and v0.5.0 (German track)
**Owner:** pm · **Date:** 2026-11-15 · **Branch:** `docs/pm-acc3-german-release-acceptance` ·
**Lifecycle:** `ORCHESTRATOR.md` step 5 ("Accept") · **Decisions:** PD-053, PD-054, PD-055

## Scope and method
- **Code and content:** `main` as checked out in this worktree. After CTO-008 (#52), A1 Units
  1–12 (#53), A1 QA (#54), PLT-024 (#56), GAM-010 (#57), LES-013 (#58), A2 plan (#59) and A2
  Units 1–14 (#60–#63). `package.json` is still `0.2.0`, and `CHANGELOG.md` has v0.3.0 work
  under `[Unreleased]`.
- **Pending, not on `main`:** LES-014 (PR #55) and the A2 QA pass (branch
  `docs/con-de-a2-qa`, report read from `/home/user/lingo-de2-qa`, read only).
- **LES-014 branch files:** not available to me. `/home/user/lingo-de2-b1` is checked out on
  `docs/con-de-a2-units-01-04`, not on the LES-014 branch, and its lessons feature matches
  `main` (`use-audio-playback.ts` still calls `findVoice(lang)`, with no `speechLocale`). So
  every LES-014 criterion below is **pending #55** and was not verified on its branch.
- **Run evidence:** I didn't run commands. Unit, RTL and e2e evidence means the tests exist
  in the files named, plus the green CI that the cto needs before merging. Browser evidence:
  - The orchestrator's scripted playthrough today: German onboarding, then A1 Lesson 1 with
    the tip card, every exercise type, results and the skill path at 390 × 844.
  - 16 A2 lessons, one per unit plus U14 L2 and the A2 checkpoint, at 375 × 667 with 0 issues
    (CON-DE-A2-QA criterion 11).
  - README media in `/home/user/lingo-status/docs/media` (I can't view them; listed by name):
    `onboarding-1-welcome.png`, `onboarding-2-course.png`, `onboarding-3-goal.png`,
    `learn.png`, `learn-lessons.png`, `lesson-tip.png`, `lesson-choice.png`,
    `lesson-word-bank.png`, `lesson-match-pairs.png`, `lesson-listen.png`,
    `lesson-feedback-correct.png`, `lesson-feedback-incorrect.png`, `lesson-results.png`,
    `profile.png`, `offline-banner.png`, `back-online.png`, `not-found.png`, plus
    `onboarding`, `lesson`, `tabs` and `offline` as `.mp4` / `.gif`.
- **Verdicts:** PASS · FAIL (becomes a `fix/` ticket) · PASS pending #55 · PASS pending merge
  of `docs/con-de-a2-qa`.

## Summary

| Milestone | Verdict | Blocking items |
|---|---|---|
| v0.3.0 Gamification loop | **Not ready.** 9 of 10 tickets accepted | GAM-003 criterion 15 FAIL → **FIX-003** |
| v0.3.1 German A1 part 1 | **Not ready.** 7 of 8 accepted | LES-014 pending #55 |
| v0.3.2 German A1 part 2 | **Accepted** (all 4) | none of its own; release order (PD-054) |
| v0.3.3 German A1 part 3 + QA | **Not ready.** 4 of 5 accepted | CON-DE-A1-QA criterion 7 FAIL → **FIX-004** (needs #55) |
| v0.5.0 German A2 | **Not ready.** 15 of 16 required tickets accepted | CON-DE-A2-QA pending merge of `docs/con-de-a2-qa` (criterion 11 voice part pending #55) |

CTO-009 and LES-015 (cloze) haven't started (no `cloze` in `src/`). They are non-blocking
(PD-049) and move to v0.5.1 (ROADMAP).

New tickets: **FIX-003** (dev-gamification, P0), **FIX-004** (pm with the orchestrator's
browser run, P0 release gate), **FIX-005** (dev-lessons, P2, not blocking).

Observation: the code and tests refer to a **FIX-002** (path accessible names that contain the
visible text, WCAG 2.5.3, and scrolling by position instead of `scrollIntoView`). There is no
ticket file for it. I checked its effect: the PLT-009 known issues are gone (no
`SKILL_PATH_KNOWN_ISSUES` or `label-content-name-mismatch` skip left in `tests/e2e`). New fix
tickets therefore start at FIX-003. The cto should list FIX-002 in the changelog.

---

## v0.3.0: Gamification loop

### GAM-003: XP totals and today's XP — **FAIL (criterion 15)**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `rules/progress.ts` `computeUserProgress`, exported via `@/features/gamification`. `progress.test.ts` parses outputs with `UserProgressSchema` |
| 2–7 | PASS | `progress.test.ts` table (merged #32, cto status note). Reuses `computeStreak`, `computeDailyGoalProgress`, `refillHearts` |
| 8 | PASS | `hooks/use-local-today.ts`. Tests "changes at a simulated local midnight while open", "updates on visibilitychange after the device slept past midnight", 25 h DST case |
| 9 | PASS | `use-user-progress.ts` reads through `data/queries.ts` (`getLocalSession`, `queryKeys`). Tests "re-derives when ['progress', courseId] / ['hearts'] is invalidated" |
| 10 | PASS | Test "uses the default goal before onboarding saved one (AC10)" |
| 11 | PASS | Test "returns status 'error' without throwing when results can't be read (AC11)" |
| 12 | PASS | `progress.test.ts` (cto: done in #32) |
| 13 | PASS | `use-user-progress.test.tsx` loading → success and error. `use-local-today.test.tsx` midnight and visibility |
| 14 | PASS | 100 % branches reported by the cto in #32 (CI coverage) |
| 15 (PD-021) | **FAIL** | `useProgressInputs` still returns `status: "error"` when `hearts.isError` (`if (results.isError \|\| hearts.isError)`). The test "returns status 'error' when hearts can't be read" asserts the old behaviour. There's no "hearts fail, results OK → success with full hearts" test. Visible effect: if hearts storage fails, the top bar shows "–" for streak and XP, the goal ring shows "Daily goal unavailable", the **path shows only Lesson 1 available, so completed progress looks lost**, and the results Streak row shows "–". → **FIX-003** |

### GAM-004: Streak status and `useStreak` — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `rules/streak-status.ts` `getStreakStatus`, with the rule order as specified. `streak-status.test.ts` "getStreakStatus (GAM-004 AC1)" |
| 2 | PASS | `didExtendStreak` compares `extendedToday` only. Test "didExtendStreak (GAM-004 AC2)" |
| 3 | PASS | `formatStreakDays`. Test with 0, 1 and 2 |
| 4 | PASS | `hooks/use-streak.ts` is built on `useUserProgress` and does no read of its own |
| 5, 8 | PASS | `use-streak.test.tsx` runs across midnight in `Europe/Berlin` and `America/Los_Angeles` |
| 6 | PASS | `streak.test.ts` unchanged (cto review) |
| 7, 9 | PASS | `streak-status.test.ts` cases. Branch coverage in CI |

### GAM-005: Hearts state, mutation and meter — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `hooks/use-hearts.ts` → `{ status, view }` from `viewHearts(stored, now)` via `heartsQuery()` |
| 2 | PASS | One `setTimeout` to `nextRefillAt`, re-armed, with no interval. Test "raises current at nextRefillAt while mounted, with exactly one re-render" |
| 3 | PASS | `useOnPageVisible(refresh)`. Test "recomputes at the current time when the page becomes visible again" |
| 4–8 | PASS | `hooks/use-lose-hearts.ts`: synchronous `setQueryData`, a module-level write chain, `cost 0` → no write, no rollback on failure. Tests "updates the cache synchronously…", "applies two rapid calls (5 -> 3)…", "does not write anything for a cost of 0", "never goes below 0", "keeps the loss in memory and rejects when the save fails", "a mounted meter shows the loss before the save finishes" |
| 9, 10 | PASS | `rules/hearts-format.ts` (59 min 1 s → "1 h", never "0 min"). Table in `hearts-format.test.ts` |
| 11, 12 | PASS | `components/HeartsMeter.tsx` `role="img"` "Hearts: N of max", `text-fg`, `HeartIcon filled={current > 0}`. Tests at 5 and 0, plus "uses theme tokens only" |
| 13 | PASS | Tests listed above |
| UX error | PASS | Read error → full-hearts view and `console.warn` (test "falls back to full hearts (status error) and warns…") |

### GAM-006: Daily goal ring — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1–6 | PASS | `components/DailyGoalRing.tsx` and `rules/daily-goal-format.ts`: "E / G XP", the real value above the goal, `role="progressbar"` with min, max (goal), now (capped) and valuetext ("15 of 20 XP today" / "Daily goal reached: 25 XP today"), a "Daily goal" label, check icon + "Goal reached!", "N XP to go" |
| 7, 8 | PASS | Reads `useUserProgress` (invalidation and `useLocalToday`). e2e `gamification-loop.spec.ts` shows "15 / 20 XP" on Learn after the lesson |
| 9 | PASS | The goal comes from settings via GAM-003 and is never a literal |
| 10, 11 | PASS | Circle skeleton `size-20`. Error text "Daily goal unavailable right now." |
| 12 | PASS | `duration-500 motion-reduce:transition-none` |
| 13 | PASS | 80 px ring. `ring-contrast.test.ts`. PLT-009 e2e at 375 × 667 has no horizontal scroll |
| 14 | PASS | `DailyGoalRing.test.tsx` |

### GAM-007: Top bar — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1–5 | PASS | `components/GamificationTopBar.tsx`: streak, XP, hearts in a `<ul>`. Own `StreakFlameIcon` lit only on `extended`. Names from `streakAccessibleName` ("Streak: N days, done for today / do a lesson today to keep it"). "Total XP: N" |
| 6, 7 | PASS | Hearts `<button aria-haspopup="dialog">` → `HeartsDialog` titled "Hearts" with refill/full text or `HEARTS_FULL_TEXT`, the rule line, "Got it" and `returnFocusRef`. `useMinuteClock(open)` |
| 8 | PASS | Query-driven. e2e loop: streak 1 and Total XP 15 after Continue |
| 9 | PASS | `<section aria-label="Your progress">` with no heading, 3 `<li>` |
| 10, 11 | PASS | Three skeleton pills of fixed width and height. "–" with "Streak unavailable" / "XP unavailable". Hearts fall back to full |
| 12 | PASS | `min-h-11` (44 px) button with `focus-visible:focus-ring`. PLT-009 e2e at 375 × 667 |
| 13, 14 | PASS | Tokens only. `GamificationTopBar.test.tsx` |

### GAM-008: Skill path — **ACCEPTED** (criterion 6 names extended by FIX-002)
| # | Verdict | Evidence |
|---|---|---|
| 1–3 | PASS | `src/features/path/rules/compute-path-nodes.ts` with tests (100 % branches, #32) |
| 4 | PASS | `SkillPath` container in `components/SkillPath.tsx`. "SkillPathView: structure (AC4)" tests |
| 5 | PASS | `copy.ts` `STATE_TEXT` + icons. "states and accessible names (AC5, AC6)" |
| 6 | PASS (amended) | Names start "Lesson N: <title>, completed / up next / locked / in progress" and add the visible action (". Start again") per FIX-002 (WCAG 2.5.3). The required text is kept as the prefix, so I accept the extension |
| 7, 8 | PASS | "activation (AC7, AC8)" tests. Locked toast "Finish Lesson N to unlock this one." |
| 9, 10 | PASS | "0-hearts gate (AC9, AC10)". `SkillPath.test.tsx` "0 stored hearts: the gate closes and the dialog shows formatHeartRefill text" |
| 11 | PASS | Scrolls by position (FIX-002), smooth or instant under reduced motion. Tests in `SkillPathView.test.tsx` and `scroll-to-center.test.ts` |
| 12 | PASS | "updates nodes after a lesson without a reload (AC12)". e2e loop: Lesson 1 completed, Lesson 2 up next |
| 13–15 | PASS | `SkillPathSkeleton` "Loading your path", `SkillPathError` + "Try again", results-error fallback, empty unit text with Lumi idle |
| 16, 17 | PASS | "node discs are at least 64 px and tap targets at least 48 px (AC16)", "uses no colour literals (AC17)". PLT-009 e2e |
| 18 | PASS | `SkillPath.test.tsx` and `SkillPathView.test.tsx` |
| Note | — | The results-error fallback is also triggered by a hearts read error today. FIX-003 removes that |

### GAM-009: Lumi reflects the streak — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `rules/lumi-pose.ts`. `lumi-pose.test.ts` |
| 2 | PASS | `components/StreakLumi.tsx` (`Lumi size="md"`) with `streakMessage` copy that matches the criterion ("1-day streak" via `formatStreakAdjective`) |
| 3–5 | PASS | Lumi is decorative. Plain `<p>`, not a live region. Follows `useStreak`. Only the GAM-001 poses |
| 6, 7 | PASS | Loading: idle + skeleton in the same `min-h-12` box. Error: idle, no message |
| 8, 9 | PASS | `line-clamp-2`, `text-fg`. PLT-009 e2e at 375 × 667 |
| 10 | PASS | `StreakLumi.test.tsx`, `streak-message.test.ts` |

### LES-009: Hearts in the lesson player — **ACCEPTED**
Criteria 1–18: **PASS** as in the dev's table in `LES-009.md` (the tests named there are in
`src/features/lessons/hearts/__tests__/HeartsLessonPlayer.test.tsx` and
`LessonHeartsMeter.test.tsx`). Criterion 17's real-layout part is covered by PLT-009's e2e at
375 × 667 and the out-of-hearts e2e (`gamification-loop.spec.ts`).
The PM-note polish from 2026-11-08 isn't done: `player/PlayerError.tsx` still renders
`EmberPlaceholder`, and the listen "Audio isn't available right now." state has no Lumi. That
note was polish, not a criterion, so it doesn't block. → **FIX-005** (P2).

### LES-010: Results screen streak and goal rows — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1–3, 9 | PASS | `ResultsScreen.streak-goal.test.tsx` "AC1, AC3, AC9: both rows are in the stats list at once, after the three stats" |
| 2 | PASS | `results/lesson-impact.ts` uses only `computeUserProgress`, `didExtendStreak`, `formatStreakDays` and `computeDailyGoalProgress` from `@/features/gamification` |
| 4–8 | PASS (amended by PD-021) | `celebrationText` gives "Streak started/extended and daily goal reached!". Tests for AC4–AC8, including reduced motion and a sparkle of at most 1,000 ms |
| 10, 11 | PASS | Tests "earlier results unreadable…" and "save error: rows and banner still show…" |
| 12, 13 | PASS | `lessons-results.spec.ts` (whole screen visible at 375 × 667). Tokens only |
| 14 | PASS | Tests listed above |
| 15 | PASS | `tests/e2e/lessons-results.spec.ts` asserts "Streak started!", "1 day" and "15 / 20 XP" (no `fixme` left in `tests/e2e`) |

### PLT-009: Mount the loop — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `src/app/(tabs)/_learn/LearnScreen.tsx`. RTL `page.test.tsx`. Playthrough at 390 × 844 shows the skill path |
| 2 | PASS | `LessonList` and `useCompletedLessonIds` deleted (dev note 2) |
| 3 | PASS | `LessonScreen` renders `HeartsLessonPlayer`. The results flow is unchanged |
| 4 | PASS | Locked deep link → toast through `flash-toast.ts` + `router.replace("/")`. e2e locked-link test |
| 5, 6 | PASS | e2e loop (`gamification-loop.spec.ts`) |
| 7 | PASS | `lesson-offline.pwa.spec.ts` reloads Learn offline |
| 8 | PASS | axe in `gamification-loop.spec.ts` (Learn new, mid-unit, 0 hearts, out-of-hearts). The known path issue the dev listed is fixed (FIX-002) and its skip removed |
| 9 | PASS | e2e at 375 × 667: sticky top bar, last node above the bottom nav |
| 10 | PASS | `gamification-loop.spec.ts`: loop, out of hearts, locked link. Since PLT-024 it plays German content read from the course files, which still meets the intent (CON-001 is hidden, PD-030) |
| 11 | PASS | RTL: no page-level spinner |

**v0.3.0 verdict: not ready.** Accepted once FIX-003 is merged and passes its criteria.

---

## v0.3.1: German A1, part 1

### CTO-008: German course support — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1–6 | PASS | `course.levels` and `unit.level` (ADR-008, `docs/architecture/adr/ADR-008-german-course-cefr-levels.md`). `flattenCourseLessons` and `groupUnitsByLevel` in `src/contracts/course.ts`. Tests in `src/contracts/__tests__/course.test.ts`. `en-es` unchanged |
| 7–9 | PASS | `COURSE_REGISTRY` (`en-de` available, `en-es` hidden) in `src/lib/content/bundled-content.ts`. `listAvailableCourses()` returns `["en-de"]`. `DEFAULT_COURSE_ID = "en-de"` (`constants.ts`). Tests in `content-repository.test.ts` |
| 10–12 | PASS | Cross-course id tests. `bundledCourseIdOfLesson` (`static-params.ts`). `__fixtures__/german-fixture-course.ts` |
| 13–18 | PASS | Normalisation tests (`schön`, `Straße`, `Grüße`, `ÄPFEL`, `geht’s`, `U-Bahn`) in `src/contracts/__tests__/config-text.test.ts`. `ß → ss` for speech only, documented |
| 19, 20 | PASS | `speechLocale` (`src/contracts/language.ts`). The audio path test is in the contract tests |
| 21 | PASS | Finding recorded: `multiple_choice.audio` and `word_bank_translate.audio` aren't rendered. PM answer in **PD-055** |
| 22, 23 | PASS | ADR-008 + ARCHITECTURE. `CONTRACTS_VERSION` stays 1. CI green on #52 |

### PLT-024: German in onboarding and Learn — **ACCEPTED**
Criteria 1–14: **PASS**, with the evidence in the dev's implementation notes in `PLT-024.md`:
- `tests/e2e/german-course.spec.ts`: keyboard-only onboarding to the first German lesson and
  Learn. The seeded Spanish guest keeps their path, XP and streak, also after a reload. axe on
  the Course step and Learn.
- `onboarding.spec.ts`.
- RTL for `effectiveCourseId`, `welcomeHeading` with the `en-es` default, `learnCourseId` and
  `CourseCaption`.

Also confirmed by today's playthrough: German onboarding leads into A1 Lesson 1 (390 × 844).
Media: `onboarding-1-welcome.png`, `onboarding-2-course.png`, `learn.png`.

### GAM-010: Path with CEFR levels — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1, 2 | PASS | `src/features/path/rules/path-sections.ts`. Tests in `path-sections.test.ts`, `compute-path-nodes.test.ts` |
| 3, 4 | PASS | `SkillPathLevels.test.tsx` "level and unit headers (GAM-010 AC3, AC4)". `h2` / `h3` hierarchy test |
| 5 | PASS | "lesson numbering, names and toast (GAM-010 AC5)" |
| 6, 7 | PASS | "expand and collapse (GAM-010 AC6, AC7)", including the 5 × 18 × 5 DOM check |
| 8 | PASS | "scroll to the next lesson on open (GAM-010 AC8, FIX-002)" |
| 9 | PASS | "finishing a level without a reload (GAM-010 AC9)" |
| 10–12 | PASS | "GAM-008 rules on a course with levels (AC10, AC12, AC13)". "courses without levels (en-es) keep the GAM-008 layout" |
| 13 | PASS | axe on Learn in `german-course.spec.ts` and `shell.spec.ts`. Now that A2 has content, Learn shows A1 expanded and A2 collapsed (with its button) on the same page |
| 14 | PASS | Tests above |

### LES-014: German in the lesson player — **PASS pending #55** (not verified on the branch)
| # | Verdict | Evidence / state on `main` |
|---|---|---|
| 1 | PASS pending #55 | On `main`, `use-audio-playback.ts` calls `audio.speech.findVoice(lang)` with `lang = "de"`. That picks any `de-*` voice and never a Spanish or English one, but it doesn't prefer `de-DE` and doesn't use `speechLocale`. No German voice-list tests on `main` |
| 2 | PASS pending #55 | Spanish fallback tests exist on `main` (`ListenExercise.test.tsx`, `speech-fallback.test.ts`) |
| 3 | PASS pending #55 | |
| 4, 5 | PASS pending #55 | `main` renders tiles as authored (no lower-casing in `src/features/lessons`). The playthrough showed German tiles and feedback |
| 6 | PASS pending #55 | PLT-024 RTL already shows German options in `lang="de"`. #55 adds the German-fixture tests for every type |
| 7 | PASS pending #55 | `main` has `break-words` on word-bank tiles, MC options and feedback, and `hyphens-auto` on match pairs. The A2 run at 375 × 667 found no sideways scrolling. The 25-character tile, 80-character option and 40-character pair check belongs to #55 |
| 8 | PASS pending #55 | Screenshot in the PR |
| 9 | PASS pending #55 | |

### CON-DE-A1-01 … 04 — **ACCEPTED**
| Ticket | Criteria | Verdict | Evidence |
|---|---|---|---|
| CON-DE-A1-01 "Hello!" | 1–7 | PASS | `content/courses/en-de/course.json` has id `en-de`, `de` / `en`, five levels with the exact titles in the CTO-008 shape (`version` is now 15 after later units, as expected). 5 lesson files with the ids and titles of criterion 2. PM self-review (CDS-1…13, criteria 4–7: 14 du/Sie items, L1 ex02 / ex06 time-of-day prompts, L5 scenario 10/12). Re-checked by CON-DE-A1-QA. Schema test green (CI #53, #54). Playthrough of Lesson 1 with its tip |
| CON-DE-A1-02 "Where Are You From?" | 1–6 | PASS | Self-review. CON-DE-A1-QA fixes #1–9 (PD-043 fronted orders now accepted). 0 `sie / Sie` tile pairs (QA criterion 5) |
| CON-DE-A1-03 "Numbers and Letters" | 1–6 | PASS | Self-review. QA fixes #10–13 (`eine` before U4 removed). Number words only (QA criterion 5). The letter-name audio of L5 is checked in FIX-004 (it needs the German voice) |
| CON-DE-A1-04 "At the Bakery" | 1–6 | PASS | Self-review. QA criterion 3 (gender: 8 MC). No `einen` / `den` in U4 (QA criterion 1) |

**v0.3.1 verdict: not ready.** Accepted once #55 is merged and the pm re-checks LES-014
criteria 1–9 on `main`.

---

## v0.3.2: German A1, part 2 — **ACCEPTED**

| Ticket | Criteria | Verdict | Evidence |
|---|---|---|---|
| CON-DE-A1-05 "At the Supermarket" | 1–7 | PASS | Self-review. QA fixes #14–18. Coverage map: accusative 9+, `kein / nicht` / `doch`, 5 plural patterns |
| CON-DE-A1-06 "Family and Friends" | 1–7 | PASS | Self-review. QA fixes #19–20. Possessives 8+ |
| CON-DE-A1-07 "My Day" | 1–6 | PASS | Self-review. Times in words (QA criterion 5). Separable verbs 11+ |
| CON-DE-A1-08 "Free Time" | 1–6 | PASS | Self-review. QA fixes #21–25 (PD-040: `ins Kino` chunk, `in den Park` removed). `können` 6+ |

Every lesson file is present (5 per unit, 60 A1 files in total), with one loader line each in
`bundled-content.ts`. Schema test green on #53 / #54.

**v0.3.2 verdict: accepted.** It can't be tagged on its own because of the release order (PD-054).

---

## v0.3.3: German A1, part 3 + QA

| Ticket | Criteria | Verdict | Evidence |
|---|---|---|---|
| CON-DE-A1-09 "By Bus and Train" | 1–7 | PASS | Self-review. `U-Bahn` is one tile (QA criterion 5). PD-042 `Gleis` |
| CON-DE-A1-10 "The New Flat" | 1–6 | PASS | Self-review. QA fixes #29–30. `es gibt` 10 |
| CON-DE-A1-11 "At the Doctor's" | 1–7 | PASS | Self-review. QA fixes #31–32. No medical advice (CDS-11) |
| CON-DE-A1-12 "Offices and Work" | 1–8 | PASS | `de-a1-u12-l2-dates.json` has the `am dreiten Mai` distractor. The checkpoint `de-a1-u12-l5-a1-checkpoint.json` has 12 exercises (ex01–ex12) and its tip starts "This lesson reviews all of A1." `course.json` A1 = 12 units / 60 lessons. QA fixes #33–38 |

### CON-DE-A1-QA — **FAIL (criterion 7)**
| # | Verdict | Evidence |
|---|---|---|
| 1–6 | PASS | QA report tables (0 open after 38 fixes; 375 entries; coverage map; PD-043, PD-044) |
| 7 | **FAIL** | Still open in the report. Today's browser evidence covers A1 **Lesson 1 only** (390 × 844), not "at least 1 lesson per unit (12) at 375 × 667 with the German speech fallback". The U3 L5 letter tiles and the 9 listens with new transcripts haven't been heard. That needs the de-DE fallback from #55. Note: `public/audio` has no files, so every listen uses speech synthesis today, and no stale recording can contradict a new transcript. → **FIX-004** |
| 8 | PASS | "Needs native review" list kept. Non-blocking until v1.0.0 (PD-038) |
| 9 | PASS | Ids unchanged. `version` 4 → 5 at the time (now 15) |
| 10 | PASS | Was "pending the orchestrator's test run". #54 was merged with green CI, and A2 QA reports `npm run test` 329 passed on a later base |

**v0.3.3 verdict: not ready.** Accepted once FIX-004 passes (after #55).

---

## v0.5.0: German A2

### CON-DE-A2-01 … 14 — **ACCEPTED** (content as on `main`; QA edits pending merge)
Every unit ticket has 8 criteria: 1 = unit id, title, description and lesson order. 2 = CDS-1…19.
3–8 = unit-specific.

| Ticket | Criteria | Verdict | Evidence |
|---|---|---|---|
| CON-DE-A2-01 Weather and Seasons | 1–8 | PASS | Self-review. QA criterion 4 (`im` + month, U1 L2–L3). No `werden` before U14 (QA criterion 5 script) |
| CON-DE-A2-02 How Was Your Weekend? | 1–8 | PASS | Self-review. CDS-19 English tense (criterion 8). QA #1 |
| CON-DE-A2-03 Holiday Stories | 1–8 | PASS | Self-review. Coverage map: Perfekt with `sein` 16 |
| CON-DE-A2-04 Gifts and Celebrations | 1–8 | PASS | Self-review. No religious holidays or alcohol (grep `Bier`, `Wein`, `Sekt`, `Weihnachten`, `Ostern`, `Ramadan` → 0 hits in `content/courses/en-de/lessons`). CDS-17 case-only pairs: 0 (script) |
| CON-DE-A2-05 Errands in Town | 1–8 | PASS | Self-review. QA #2–6. No bank names (brand grep 0). Hundreds in to_learning word banks (U5 L3 ex04, ex11) |
| CON-DE-A2-06 Clothes and Shopping | 1–8 | PASS | Self-review. Adjective endings 16 |
| CON-DE-A2-07 Health and Sport | 1–8 | PASS | Self-review. `Bei welcher Krankenkasse sind Sie?` U7 L4 ex08, ex11. QA #7–9 |
| CON-DE-A2-08 Appointments and Phone Calls | 1–8 | PASS | Self-review. No `Dr.` (grep 0). QA #10–13 |
| CON-DE-A2-09 At Home and the Neighbours | 1–8 | PASS | Self-review. Two-way prepositions 44. Productive `ins / in den / in die` U9 L3 |
| CON-DE-A2-10 Train and Hotel | 1–8 | PASS | Self-review. `auf / von Gleis`, `Bahnsteig` U10 L1. No operators (grep `Deutsche Bahn`, `ICE` → 0). QA #14–15. U10 L1 played in the A2 run |
| CON-DE-A2-11 Work and Job Search | 1–8 | PASS | Self-review. `dass` 9 word banks. No visa or permit claims (QA criterion 10) |
| CON-DE-A2-12 Offices and Letters | 1–8 | PASS | Self-review. `sich anmelden` U12 L2 ex02, ex03. QA #16–19 |
| CON-DE-A2-13 Media and Comparisons | 1–8 | PASS | Self-review. No brands (grep 0). QA #20–22 |
| CON-DE-A2-14 Plans and the Future | 1–8 | PASS | `de-a2-u14-l5-a2-checkpoint.json` has exactly 14 exercises (ex01–ex14), tip "This lesson reviews all of A2. …". `course.json` A2 = 14 units, 70 ids. 70 `de-a2-*` lesson files with loader lines. The checkpoint was played in the A2 run. QA #23–28 |

All 130 German lessons have a `tip` (count of `"tip"` in `content/courses/en-de/lessons`), so
LES-013 shows a card before every German lesson.

### CON-DE-A2-QA — **PASS pending merge of `docs/con-de-a2-qa`**
| # | Verdict | Evidence (report in `/home/user/lingo-de2-qa/docs/product/tickets/CON-DE-A2-QA.md`) |
|---|---|---|
| 1 | PASS pending merge | 0 open. 3 appendix additions (`lange`, `sagen`, `kommen`). The mechanical lexical scan is recommended, not blocking (accepted by the pm, see below) |
| 2 | PASS pending merge | 462 entries. Every lesson is within CDS-3 |
| 3 | PASS pending merge | 4 gaps fixed (`sollen`; `deshalb / trotzdem / ob`; `Gleis / Bahnsteig / Verspätung`) |
| 4 | PASS pending merge | Every deferred A1 item is placed. The A1 native-review items 4–6 are marked on the branch |
| 5, 7 | PASS pending merge | Orchestrator scripts: 0 findings |
| 6 | PASS pending merge | Word-order rule (**PD-053**, logged here). 1,836 answers buildable. The full permutation script is recommended, not blocking |
| 8–10 | PASS pending merge | As in the report |
| 11 | PASS (content and tips); voice part pending #55 | A2 run at 375 × 667: 16 lessons, 0 issues, every tip shown and fitting. Listens showed the fallback / Skip, so the German voice itself is checked with FIX-004 after #55 |
| 12 | PASS pending merge | Consolidated native-review list (non-blocking until v1.0.0) |
| 13 | PASS pending merge | Ids unchanged. `version` 15 → 16. 329 tests passed (orchestrator) |

The two scripted follow-ups the QA report recommends (a lexical token scan and a full word-bank
permutation check) are **not blocking for v0.5.0**. The hand checks plus the 1,836-answer
buildability script are enough for a pre-launch release. The two scripts become part of
CON-DE-NR (native review, blocking v1.0.0) as preparation for the reviewer.

### LES-013: Lesson tip card — **ACCEPTED**
| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `src/features/lessons/tip/TipCard.tsx` (Lumi idle, heading "Tip", text, "Start" in `TipStartBar`). Test "AC1, AC5: a real German A1 tip is shown before exercise 1 with Lumi and Start". Playthrough and `lesson-tip.png` |
| 2 | PASS | Tests "AC2: Start shows exercise 1; the card doesn't move progress…" and "…costs no hearts and isn't counted in accuracy or the lesson time" |
| 3 | PASS | "AC3: a lesson without a tip starts directly with exercise 1" |
| 4 | PASS | "AC4: a 280-character tip scrolls inside the lesson area; Start stays in the sticky bar". A2 run at 375 × 667: every tip fit |
| 5 | PASS | `lang={knownLanguage}` on the tip text |
| 6 | PASS | "AC6: focus starts on Start, the tip describes it…", Enter and Space tests |
| 7 | PASS | "AC7: the quit dialog opens from the tip card…" |
| 8 | PASS | RTL plus "AC8: no serious or critical axe violations on the tip card" |

The ticket lists LES-014 as a dependency, but the card doesn't need any LES-014 behaviour, so I
accept it now.

### CTO-009, LES-015 (cloze) — not started, non-blocking
They move to **v0.5.1** together with the A2 cloze content follow-up (ROADMAP, PD-049).

**v0.5.0 verdict: not ready.** What blocks it:
1. Merge `docs/con-de-a2-qa` (A2 QA edits, course `version` 16).
2. #55 merged and LES-014 re-checked, because A2 QA criterion 11 needs the German voice and
   LES-013 lists it.

Under the release plan (PD-054), v0.5.0 also carries v0.3.0–v0.3.3, so FIX-003 and FIX-004
block the release as well.

---

## Release recommendation for the cto (PD-054)
No commit on `main` holds v0.3.0–v0.3.3 without A2 content: #55 and FIX-003 will merge after
A2 Units 1–14 (#60–#63). Any v0.3.x tag would therefore ship 70 A2 lessons on the path under a
"German A1" label. Back-to-back v0.3.x tags on one commit would also be identical builds with
misleading notes. So:

1. Merge **#55** (LES-014). The pm re-checks LES-014 criteria 1–9 on `main` (short addendum to
   this file).
2. Merge **FIX-003** (dev-gamification).
3. Merge **`docs/con-de-a2-qa`** and this branch (in either order; PD-053 is logged here).
4. Run **FIX-004** on the release-candidate build (pm checks the orchestrator's browser run).
   Any finding becomes a new `fix/` ticket and stops the release.
5. Cut **one combined release, v0.5.0**, from the release commit. Its `CHANGELOG.md` entry has
   one block per milestone (v0.3.0 Gamification loop; v0.3.1–v0.3.3 German A1; v0.5.0 German
   A2), with a note in the style of ADR-007 saying that v0.3.0–v0.3.3 were accepted but never
   tagged on their own. Also list FIX-002 and FIX-003 under Fixed, and mention that Spanish is
   hidden (PD-030).
6. Release checklist as usual: CI green on the release commit (incl. e2e and `pwa-prod`),
   version bump `0.2.0 → 0.5.0`, changelog.
7. **Version numbering after this:** the accounts and sync milestone (formerly v0.4.0)
   becomes **v0.6.0**, so tags keep going up. The `v0.4.0` number is not used.

---

## Re-check log
_(pm adds the LES-014 re-check after #55, FIX-003 and FIX-004 results here)_
