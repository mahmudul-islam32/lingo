# PM-ACC5: Release acceptance for v0.5.4 "Goal date"
**Owner:** pm · **Date:** 2026-11-25 · **Branch:** `docs/pm-011-v054-acceptance` ·
**Lifecycle:** `ORCHESTRATOR.md` step 5 ("Accept") · **Decisions:** PD-071 §1, PD-077,
PD-078 · **Release branch:** `chore/release-v0.5.4` (not merged)

## Scope and method
- **Code:** `main` at `daffaa8` (CTO-017 #101, GAM-013 #102, PLT-027 #103, LES-022 #108),
  read file by file. I didn't run commands myself.
- **Run evidence (cto, production build):** full e2e **152/152**. The cto also reports that
  the goal row shows only for the active course, that courses without levels
  (Einbürgerungstest, en-es) get no row, and that the goal-date e2e now runs and asserts
  that the row is visible. Unit tests, typecheck, lint and build are reported green; I take
  coverage figures (GAM-013 AC 7) from that run.
- **Courses on `main`:** `en-de` (A1, A2), `telc-b1-en-de` (A1, A2, B1), `einbuergerung-en-de`
  (no levels) and `en-es` (no levels, hidden). The tickets were written when only `en-de` and
  `en-es` existed. The two exam courses arrived in the same milestone (TELC-001, PD-073), so I
  also checked the goal date on them.
- **No screenshots** for this milestone. The verdicts rest on the code and on the RTL / e2e
  tests named below.
- **Verdicts:** PASS · PASS (deviation accepted) · FAIL (becomes a `fix/` ticket).

## Summary

| Ticket | Verdict | Notes |
|---|---|---|
| CTO-017 Goal-plan contract | **Accepted** (9 of 9 PASS) | `goalPlan` nullable + optional; clearing uses `null` (ADR-015) |
| GAM-013 Rule, hook, Learn card | **Accepted** (17 of 17 PASS) | Edit links use `href` instead of an `onEditGoalDate` callback (equivalent, accepted) |
| PLT-027 Profile row and dialog, Learn and results wiring | **Rejected** (17 of 18 PASS) | AC 10 FAIL: on Einbürgerungstest and en-es, Learn shows "Set a goal date", which opens nothing → **FIX-014** (dev-platform, P1, **blocks the release**, PD-077) |
| LES-022 Results goal-date row | **Accepted** (9 of 9 PASS) | — |

**Release recommendation for the cto: do not release v0.5.4 yet.** Ship it once FIX-014 is
merged and accepted. The fix is small: don't mount the card on courses without levels, plus
tests. The draft v0.5.4 CHANGELOG already says "courses without levels show no goal", and
today that isn't true on Learn.

**Follow-up from the cto (goal date is one global setting):** decided in **PD-078**. The goal
plan becomes **per course** in v0.5.5, ticket **CTO-018**, and it must ship before the v0.6.0
settings sync. It doesn't block v0.5.4.

---

## CTO-017: Contract for the goal date

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `src/contracts/user.ts`: `GoalPlanSchema = { targetLevel: CefrLevelSchema, targetDate: LocalDateSchema }`, `SettingsSchema.goalPlan = GoalPlanSchema.nullable().optional()`. `goal-plan.test.ts`: "keeps settings stored before CTO-017 valid". No Dexie bump (ADR-015 Compatibility). |
| 2 | PASS | `SettingsPatch` in `api.ts` picks `goalPlan`. `goal-plan.test.ts` "set → clear through the settings patch leaves goalPlan null". The ADR chose `null` as the clear value (§1). |
| 3 | PASS | Test accepts `{A2, 2027-03-12}` and rejects `D1`, a lowercase level, `12/03/2027`, a date-time string, an impossible date, a missing `targetDate` and a missing `targetLevel`. |
| 4 | PASS | `config.ts`: `goalPlanMaxDays: 730`, validated as a positive integer (tested). |
| 5 | PASS | `gamification.ts`: `GoalPlanStateSchema` has the 5 statuses. `GoalPlanStatusSchema` has the ticket's fields plus invariant checks (numbers `null` exactly for `reached` / `date-passed`). |
| 6 | PASS | `api.ts` `ComputeGoalPlan`: one input object (course, completed ids, `startLevel`, `goalPlan`, `today`, `dailyGoalXp`) → `GoalPlanStatus \| null`. The doc comment states the PD-071 §1.3 rule and the worked example. |
| 7 | PASS | Migration `20261121120000_settings_goal_plan.sql`: nullable `settings.goal_plan jsonb` with a CHECK; RLS unchanged; guest migration carries it (ADR-015 §6). Not run against hosted Supabase. |
| 8 | PASS | `docs/architecture/adr/ADR-015-goal-date.md`: field, clear semantics, status names, and why the status is computed on the device (§5). |
| 9 | PASS | cto run on `daffaa8`. |

## GAM-013: Goal date rule, hook and Learn card

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `rules/goal-plan.ts` returns `null` for no plan or for a target level without content. Tests: missing / `null` plan, target B1 on `en-de`, and `en-es` (no levels). |
| 2 | PASS | `levelsWithContent` + start index with first-level fallback; target before start → target level only. Tests: missing / unknown start level, start A2, start A2 target A1, checkpoints, unknown ids. |
| 3 | PASS | `localDateToDayNumber` difference. Tests cover tomorrow = 1, EU and US DST, a leap day and the year end. |
| 4 | PASS | `ceil`, `× xpPerLesson`, `suggestDailyGoalXp` (smallest option ≥ required, else the largest). Tests: rounding 130/44 → 3, the threshold edges, and `suggestDailyGoalXp`. |
| 5 | PASS | Order `reached` > `date-passed` > `on-track` > `raise-goal` > `tight`; numbers `null` for the first two. Every result is also checked against `GoalPlanStatusSchema`. |
| 6 | PASS | All worked examples are tests, on the real `en-de` course (A1 = 60, A2 = 70 asserted): 130 / 111 / 2 / 20 on-track; 10 XP → raise-goal; 2026-12-01 → 10 / 13 / 50 tight; all done → reached; 2027-03-12 → date-passed; start A2 → 70; start A2, target A1 → A1 only. |
| 7 | PASS | The rule is a pure function with no I/O; there is a no-mutation test with frozen inputs. The 100 % branch figure comes from the cto run (I didn't read the coverage report). |
| 8 | PASS | `hooks/use-goal-plan.ts` reads `["settings"]`, `["progress", courseId]`, bundled content and `useLocalToday`; local only. `use-goal-plan.test.tsx` covers guest / offline, updates without a reload after a result, a goal change and a plan change, and "a read error returns null and is logged". It returns `undefined` while loading, which matches the UX note "render nothing". |
| 9 | PASS | `goal-plan-copy.ts` title "Goal: finish <level> by <date>", `en-GB` `day numeric, month short, year numeric` with `timeZone: "UTC"` so no zone shifts the date. RTL "AC9". |
| 10 | PASS | Counts with singular forms; on-track / raise-goal (primary "Use <n> XP a day") / tight (secondary "Use 50 XP a day" + "Change date") copy exact. RTL "AC10". |
| 11 | PASS | reached "You've finished <level>. Well done!" + "Set a new goal date"; date-passed copy + "Change date"; no counts. RTL "AC11". |
| 12 | PASS (deviation accepted) | "Use <n> XP a day" calls `onUseSuggestedGoal(n)` once (RTL). The edit links are `next/link` to `/profile?edit=goal-date`. `onEditGoalDate` is optional and replaces the navigation when it is given. Learn doesn't pass it, so the link navigates. The learner sees the same result and the card still never changes settings. |
| 13 | PASS | `null` → "Have a date in mind?" + link "Set a goal date", no card chrome. RTL "AC13". (On courses without levels this link has nowhere to go; that is a mounting issue, see PLT-027 AC 10.) |
| 14 | PASS | `GOAL_PLAN_BANNED_WORDS` is exactly the ticket's list. The RTL test checks every status's rendered text, and "later" is allowed. |
| 15 | PASS | `Card as="section"` `aria-labelledby` "Goal date" (the e2e finds `getByRole("region", { name: "Goal date" })`); polite atomic live region on the status line; Space added to links; axe per status (RTL). |
| 16 | PASS | Links `min-h-12`, Button v2 sizes, `break-words`, v2 tokens. The e2e checks for no horizontal scroll on Learn at 375 × 667. |
| 17 | PASS | `GoalPlanCard.test.tsx` covers AC 9–15 for the 5 statuses, `null` and loading. |

## PLT-027: Goal date in Profile, Learn card mount, results wiring

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `GoalDateRow.tsx` under "Daily goal": "Finish A2 by 12 Mar 2027" / "Not set", "Set" / "Change", names "Set goal date" / "Change goal date". RTL "1". |
| 2 | PASS | Dialog "Your goal date"; level radios from `goalLevelOptions` (levels with content at or after the start level; A2 preselected; with start A2 only A2); `<input type="date">` labelled "By when?", `min` tomorrow, `max` +730. RTL "2", e2e. |
| 3 | PASS | `goalPlanPreview` from the same `computeGoalPlan` with the unsaved values; reached and tight lines. RTL "3"; e2e asserts "130 lessons left · about 2 lessons a day. Suggested daily goal: 20 XP." |
| 4 | PASS | "Pick a date." / "Pick a date after today." / "Pick a date within 2 years."; `aria-invalid`, `aria-describedby`, focus moves to the field. RTL "4"; the e2e asserts focus and the empty-date message. |
| 5 | PASS | `updateSettings({ goalPlan })`, close, toast "Goal date saved.", focus back on "Change goal date", daily goal unchanged (the e2e asserts "Casual · 10 XP" after saving). |
| 6 | PASS | "Remove goal date" shows only with a saved plan; `goalPlan: null`; toast "Goal date removed."; row "Not set". RTL "6", e2e. |
| 7 | PASS | Cancel, Escape and the close button discard the values; focus returns to the row's button (`returnFocusRef`). RTL `it.each` (line 219). |
| 8 | PASS | A failed write keeps the dialog and its values and shows "We couldn't save your goal date. Try again." (`role="alert"`). RTL "8". |
| 9 | PASS | Deep link: the row scrolls into view, the dialog opens once, and closing calls `history.replaceState`. RTL "9", e2e. |
| 10 | **FAIL** | On `en-de` and `telc-b1-en-de`: PASS. `LearnScreen.tsx` mounts `GoalPlanCard` under the ring and above the caption and path, and the links go to `/profile?edit=goal-date`. **On `einbuergerung-en-de` (available) and `en-es` (hidden):** `useGoalPlan` returns `null` (no levels), so Learn shows "Have a date in mind? **Set a goal date**". That link opens Profile, where `GoalDateRow` renders nothing (`options.length === 0`) and the deep-link effect never opens a dialog. Every Einbürgerungstest learner gets a dead link on Learn. No test covers Learn on a course without levels (`page.test.tsx` mocks `useGoalPlan` to `null`; `exam-courses.spec.ts` doesn't look at the goal date). The draft v0.5.4 CHANGELOG says "courses without levels show no goal". → **FIX-014**. |
| 11 | PASS | `use-goal-plan-actions.ts`: `useUpdateSettings({ dailyGoalXp })`, toast "Daily goal set to <xp> XP.", error toast on failure. RTL "11"; the e2e asserts the toast, "On track." and the Profile row "Regular · 20 XP". |
| 12 | PASS | Without a plan, Learn only adds GAM-013's link; existing Learn / Profile tests are green (152/152). The wording of this criterion is met. The defect on courses without levels is recorded under AC 10. |
| 13 | PASS | `LessonScreen.tsx` passes `useGoalPlan({ courseId })`, which re-derives after `handleSaved` invalidates progress. Only for the active course, `null` otherwise. `lessons-results.spec.ts` "LES-022 AC 8" asserts that `goal-date-row` is visible with "Goal: A2 by … lessons left". |
| 14 | PASS | No goal-date step in onboarding (the e2e onboards with `completeOnboarding` unchanged). |
| 15 | PASS | Only Dexie, the bundled content and the settings mutation; no fetch was added. |
| 16 | PASS | `GoalDateRow.test.tsx` covers 1–9 (incl. validation, focus return, remove, save failure, the query parameter) and axe with the dialog open; `use-goal-plan-actions.test.tsx` covers 11. |
| 17 | PASS | The e2e checks for no horizontal scroll with the dialog open and on Learn at 375 × 667. The dialog has `max-h-[calc(100dvh-2rem)] overflow-y-auto`. The date input and buttons are `min-h-12`. |
| 18 | PASS | `goal-date.spec.ts`, 375 px, keyboard only (focus + Enter), fixed clock 2026-11-21: set A2 by 2027-03-12, see "Goal: finish A2 by 12 Mar 2027" and "130 lessons left · 111 days to go", "Use 20 XP a day" → "On track.", remove → "Set a goal date". Runs in the 152/152 suite. |

## LES-022: Results screen goal-date row

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `ResultsScreen` optional `goalPlan` prop. RTL "criterion 1": without the prop, with `null` and with date-passed the screen is unchanged. |
| 2 | PASS | `goal-date-row.ts`: "Goal: <level> by <date>" + "<n> lessons left" / "1 lesson left", `formatGoalDate`. RTL "criterion 2"; e2e regex `^Goal: A2 by .+ lessons? left$`. |
| 3 | PASS | reached: "Goal reached: you've finished <level>!", success style, decorative check icon. RTL "criterion 3". |
| 4 | PASS | `date-passed` → `null` (no row). RTL. |
| 5 | PASS | Banned words checked over every status (RTL `it.each(STATES)`). |
| 6 | PASS | The row is rendered inside `ResultsGamificationRows` with the streak and daily-goal rows and appears with them; no animation with or without reduced motion (RTL "criterion 6"). |
| 7 | PASS | It is the sixth list item of "Lesson stats", after "Daily goal", with no focusable element; the heading still takes focus first (e2e). RTL `it.each` (criterion 7). |
| 8 | PASS | `lessons-results.spec.ts` "LES-022 AC 8": 6 rows, `goal-date-row` and Continue fully in the viewport, no document scroll, axe. Compact spacing below 740 px (`compact`). |
| 9 | PASS | `ResultsScreen.goal-date.test.tsx` covers 1–7 for the 5 statuses and the absent prop, with axe. |

## Product checks beyond the criteria

| Check | Result |
|---|---|
| Copy rules (PD-035, PD-071 §1.4) | PASS: card, dialog and row avoid the banned words; no exam names in the goal-date copy. |
| Suggest, never auto-change (PD-071 §1.2) | PASS: saving a plan keeps the daily goal (e2e); only "Use <n> XP a day" changes it. |
| Not in onboarding (PD-071 §1.5) | PASS. |
| Free (PD-072) | PASS: no gating. |
| Courses without levels | **FAIL on Learn** (PLT-027 AC 10 → FIX-014). Profile and results PASS (no row). |
| Global plan with the course switch (TELC-001) | Works as specified (CTO-017 defines one plan), but it can mislead: an "A2" plan made on German counts telc B1's A1 / A2 lessons after a switch, and a telc "B1" plan shows "Finish B1 by …" in Profile while German's Learn shows "Set a goal date". Not a FAIL against v0.5.4's criteria. Decided in **PD-078**: per-course plans in v0.5.5 (CTO-018). |

## FAIL tickets raised
- **FIX-014** (dev-platform, P1, **blocks the v0.5.4 release**): no goal-date card or link on
  Learn for courses without levels, with tests.

## Follow-up tickets raised
- **CTO-018** (cto, P1, v0.5.5, before v0.6.0 sync): a goal plan per course (PD-078).
  GAM-014 and PLT-028 are reserved for the hook and the UI changes and are written once
  CTO-018 is merged.

## Review
_(PM acceptance complete. v0.5.4 is ready for release once FIX-014 is accepted; the pm
re-checks only FIX-014.)_
