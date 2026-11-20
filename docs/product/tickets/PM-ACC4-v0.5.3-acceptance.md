# PM-ACC4: Release acceptance for v0.5.3 "Redesign"
**Owner:** pm · **Date:** 2026-11-20 · **Branch:** `docs/pm-acc4-v0.5.3-acceptance` ·
**Lifecycle:** `ORCHESTRATOR.md` step 5 ("Accept") · **Decisions:** PD-067, PD-068, PD-069,
PD-070 · **Release PR:** #94

## Scope and method
- **Code:** `main` at `053a37b`, read in this worktree (CTO-016, PLT-026, GAM-012, LES-021 and
  the review fixes FIX-008, FIX-009, FIX-010).
- **Run evidence (cto, on `053a37b`):** `npm run typecheck`, `lint`, 2093 unit tests and
  `build` pass; the full e2e suite is **142/142** on a production build (projects
  mobile-chrome, desktop-chrome, pwa-prod), including the axe AA checks
  (`expectNoSeriousA11yViolations`). I didn't run commands myself.
- **Visual evidence (390 px), compared with `docs/design/v2/screen-1..8.png`:**
  - `redesign-v2.png`: Learn, MC lesson, results (before FIX-010), Profile
  - `les-sheet.png`: MC selected, word bank, incorrect sheet, results (before FIX-010)
  - `shots/final-A1.png`, `shots/final-A2.png`: Learn path after FIX-009
  - `results-390.png`: results after FIX-010
  - (all under the orchestrator's session scratchpad, not in the repo)
- **Not seen as a screenshot:** onboarding (screen 1), Practice, Leagues, 404, install card,
  offline banner, listen, match pairs, cloze, correct sheet, tip card, out-of-hearts. For these
  the verdict rests on the code and on the RTL / e2e tests named below.
- **Verdicts:** PASS · PASS (deviation accepted, PD-0xx) · FAIL (becomes a `fix/` ticket).

## Summary

| Ticket | Verdict | Notes |
|---|---|---|
| CTO-016 Design system v2 | **Accepted** (15 of 16 PASS) | AC 1 FAIL: `docs/design/v2/README.md` missing → **FIX-011** (cto, P2, not blocking, PD-070) |
| PLT-026 Onboarding, shell, nav, Profile | **Accepted** (20 of 20) | Daily goal row and no Sounds / Speaking rows accepted (PD-069, PD-067) |
| GAM-012 Path, Practice, Leagues, hearts dialog | **Accepted** (18 of 18) | Own weekly XP on Leagues accepted (PD-068); node titles under nodes (PD-067) |
| LES-021 Lesson player | **Accepted** (20 of 20) | "Quit lesson", "Continue", slow-button name kept (PD-067) |
| FIX-008 Practice test clock | **Accepted** | Ticket file written |
| FIX-009 Path header vs. top bar | **Accepted** | Ticket file written; verified on `final-A1/A2.png` |
| FIX-010 Results streak once, gold goal bar, audio timeout | **Accepted** | Ticket file written; verified on `results-390.png` |

**Release recommendation for the cto: release v0.5.3 now (PR #94).** All four milestone
tickets and the three review fixes are accepted. The only FAIL, CTO-016 AC 1, is a missing
reference README with no effect on users or on the code (PD-070). It moves to FIX-011 and
does not block the release.

---

## CTO-016: Design system v2

| # | Verdict | Evidence |
|---|---|---|
| 1 | **FAIL** | `docs/design/v2/` has `BRIEF.md`, `screen-1..8.png` and `screen-1..8.html`, and the brief says "parla" and its logo are NOT used. But there is **no `README.md`** mapping each screen to its ticket. The brief's "Screens in the design → our screens" list maps screens to app screens, not to tickets. → **FIX-011** (PD-070). |
| 2 | PASS | `src/components/ui/tokens.css` (single `@theme static`); every brief colour has a token, names documented in `docs/architecture/adr/ADR-014-design-system-v2.md` §1. |
| 3 | PASS | `rounded-card` / `rounded-control` 16 px, `rounded-chip` 12 px, nodes and avatars round (ADR-014 §1, `final-A1.png`). |
| 4 | PASS | `shadow-3d-card`, `-primary`, `-node`, `-node-locked` with solid offsets and no blur (ADR-014 §1). Coral is `#F05E3C`, not `#F2613F`, to reach 3:1 on canvas. That deviation is documented and checked in `tokens.test.ts`, and I accept it. |
| 5 | PASS | One light theme, `color-scheme: light`, no `[data-theme]` override, theme toggle removed (ADR-014 §1, §5). No `prefers-color-scheme` styles in `src`. Canvas background on every screenshot. |
| 6 | PASS | `src/app/layout.tsx` loads `Bricolage_Grotesque` and `DM_Sans` from `next/font/google`, which self-hosts them under `/_next/static/media` (ADR-014 §3). The pwa-prod e2e runs offline on the production build. Headings and numbers render in Bricolage on all screenshots. |
| 7 | PASS | Button primary / secondary / danger / success / ghost (plus `soft`), pressed `translate-y-0.5` + `-pressed` shadow, disabled flat grey (ADR-014 §4; the Check bar on `redesign-v2.png`); `v2-primitives.test.tsx` "Button v2 styles". The existing call sites still compile (typecheck green). |
| 8 | PASS | Card default / raised / accent / flat / tint / warm; OptionCard selected ring + check (`les-sheet.png` panel 1). |
| 9 | PASS | ProgressBar with indigo fill on the track; `role="progressbar"` (`v2-primitives.test.tsx` "XpBadge and ProgressBar v2"; lesson header on `les-sheet.png`). |
| 10 | PASS | `StatTile` layouts `header` (results tiles) and `inline` (Profile tiles); tones gold / indigo / green (`StatTile.tsx`, screenshots). |
| 11 | PASS | `Chip` with tones; the "DE" course chip on `final-A1.png`. |
| 12 | PASS | `OptionCard` `row` / `tile` layouts with number or code badge. It sets `aria-checked` for `role="radio"` (ADR-014 §4, `v2-primitives.test.tsx`). |
| 13 | PASS | Unit tests in `src/components/ui/__tests__/v2-primitives.test.tsx` (Chip, StatTile, OptionCard, NavTab, Button, ProgressBar). Each component has TSDoc usage notes, and ADR-014 §4 lists them. Note: there is no story file or README per component; I accept TSDoc + ADR as the "short usage note". |
| 14 | PASS | `tokens.test.ts` checks text pairs at 4.5:1 and UI parts at 3:1. The failing pairs (white on coral, gold as text) are documented with their allowed use and a passing alternative (`accent-fg`, `xp` `#8A6200`) in ADR-014 §2. |
| 15 | PASS | 375 px no-scroll checks and axe in e2e (142/142); Button `md` 52 px / `lg` 56 px; `focus-ring` utility (3 px indigo outline). |
| 16 | PASS | cto run on `053a37b`: typecheck, lint, 2093 tests, build, e2e 142/142. |

## PLT-026: Onboarding, app shell, 4-tab nav, Profile, platform states

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `src/app/onboarding/steps/Welcome.tsx`: Lumi + Polyglow wordmark, never "parla". Code only, no screenshot. |
| 2 | PASS | `CourseStep.tsx`: eyebrow "I want to learn" (uppercase via the `eyebrow` style), one OptionCard per available course with a code badge. Code only. |
| 3 | PASS | `LevelStep.tsx` and `GoalStep.tsx` use OptionCards in the same `StepLayout`. |
| 4 | PASS | `StepLayout` has a full-width primary Button. No dead links were added. |
| 5 | PASS | Onboarding e2e (`completeOnboarding` used across the suite) and existing RTL tests unchanged and green. |
| 6 | PASS | `src/app/_shell/BottomNav.tsx` + `nav-items`: Learn, Practice, Leagues, Profile with icons. Active tab is indigo with an indicator bar, inactive tabs muted (`final-A1.png`). `shell.spec.ts` asserts the order. |
| 7 | PASS | Routes `src/app/(tabs)/page.tsx`, `practice/page.tsx`, `leagues/page.tsx`, `profile/page.tsx`. |
| 8 | PASS | `<nav aria-label="Main">`, `aria-current="page"` via `NavTab`. `shell.spec.ts` (AC 19) tabs through all 4 tabs. The nav is absent on the lesson screens (`les-sheet.png`). |
| 9 | PASS | Canvas background, theme toggle removed (ADR-014 follow-ups, CTO-016 AC 5). |
| 10 | PASS | `redesign-v2.png` panel 4: guest shows Lumi in the indigo circle, "Guest", "Learning German · Joined November 2026" (`ProfileScreen.tsx`: `profileSubtitle`, `joinedLabel`). |
| 11 | PASS | Tiles Day streak 1, Total XP 15, Lessons done 1, Start level A1 from `useUserProgress` / settings. No league, words learned or achievements. |
| 12 | PASS | "XP this week" with 7 bars M–S, today (F) in coral, empty tracks, dashed line "Goal 20 XP / day". The text alternative is "<Day>, <n> XP" (`weekly-xp.ts`). |
| 13 | PASS | `WEEKLY_XP_EMPTY` = "No XP yet this week. Start a lesson to fill your chart." The chart still renders. |
| 14 | PASS | `SettingsRow` (label left, value + "Change" right): Daily goal "Regular · 20 XP", Start level. The Daily goal row is new; accepted in **PD-069**. No Sounds / Speaking rows, because no feature reads those settings (**PD-067**). |
| 15 | PASS | `InstallCard.tsx` and `not-found.tsx` use Card / Lumi / Button; `OfflineBanner.tsx` uses v2 tokens; copy unchanged. `offline-banner.spec.ts` with axe (FIX-007). Code only. |
| 16 | PASS | axe in `shell.spec.ts`, onboarding, Profile and offline specs, 142/142. |
| 17 | PASS | 375 px no-scroll checks in e2e. On `redesign-v2.png` the nav does not cover the content. |
| 18 | PASS | `ProfileScreen.test.tsx`, `StartLevelRow.test.tsx`, weekly-xp and nav tests. |
| 19 | PASS | `shell.spec.ts`: keyboard tab walk (line 121) and "Profile after a lesson at 375 px" (line 213). |
| 20 | PASS | cto run on `053a37b`. |

## GAM-012: Learn path, Practice tab, Leagues tab, hearts dialog

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS | `final-A1.png`: coral "DE" chip, flame + count, gold bolt "0 XP", rose heart 5. Accessible labels are covered by the path RTL tests and axe. |
| 2 | PASS | Indigo banner "LEVEL A1 · UNIT 1" / "LEVEL A2 · UNIT 1" with the title in white Bricolage (`final-A1.png`, `final-A2.png`). |
| 3 | PASS | Coral current node with white star, soft halo and the "Start · Lesson 1" pill above it; grey locked node with lock and grey edge. Done nodes (indigo + check) are covered by the RTL node-state tests; no screenshot shows one. Titles under the nodes kept (**PD-067**). |
| 4 | PASS | `nodeAccessibleName` ("Lesson 2: Nice to Meet You, up next. Start"; with the unit first when needed). Behaviour tests unchanged and green. |
| 5 | PASS | Level header card "0 OF 60 LESSONS COMPLETED / A1 · Beginner" in the new style (`final-A1.png`). `start-level.spec.ts` passes. |
| 6 | PASS | `src/features/path/practice/PracticeScreen.tsx`: completed lessons grouped by unit, most recent first, with a "Practise" link. |
| 7 | PASS | `PRACTICE_INTRO_TEXT` copy exact; the e2e sees "Hearts: 0 of 5" on Practice. |
| 8 | PASS | `practice-leagues.spec.ts` AC 17: at 0 hearts the lesson opens and shows `practice-badge`. Not-completed lessons are excluded (RTL). |
| 9 | PASS | `practice-leagues.spec.ts` AC 9: empty text, "Go to Learn" → `/`. |
| 10 | PASS (deviation, **PD-068**) | Lumi, "Leagues arrive with accounts", "Weekly leagues start when sign-in and sync launch." No names, ranks or tiers. The shield graphic is decorative and `aria-hidden`, with no tier name. The one number is the learner's own "Your XP this week" from saved results. The criterion said "no numbers"; PD-068 accepts this real number. |
| 11 | PASS | e2e: 0 list items, 0 links, 0 buttons inside `leagues`. `LeaguesScreen.tsx` reads only the learner's own results; no leaderboard data in the code path. |
| 12 | PASS | Hearts dialog restyled, copy "Practise a finished lesson to earn hearts." unchanged (`path/components/copy.ts`). The optional "Go to Practice" link was not added, which the criterion allows. |
| 13 | PASS | axe in `practice-leagues.spec.ts` (both Practice states, Leagues) and in the path / hearts specs, 142/142. The pill text is indigo on white; the coral node carries only an icon. |
| 14 | PASS | No-scroll checks; Practise link ≥ 48 px asserted; nodes about 84 px at 390 px (`final-A1.png`). |
| 15 | PASS | Keyboard path tests (`gamification-loop.spec.ts`), Practice opened with Enter in e2e, Dialog focus trap tests. |
| 16 | PASS | `PracticeScreen.test.tsx` (with the FIX-008 clock), `LeaguesScreen.test.tsx`, path node-state tests. |
| 17 | PASS | `practice-leagues.spec.ts` AC 17. |
| 18 | PASS | cto run on `053a37b`. |

## LES-021: Lesson player, exercises, feedback, results

| # | Verdict | Evidence |
|---|---|---|
| 1 | PASS (deviation, **PD-067**) | X at left, indigo ProgressBar, hearts with count at right (`les-sheet.png`). The accessible name stays **"Quit lesson"**, not "Close lesson": that is the existing name, and the "no copy change" rule plus many tests rely on it. |
| 2 | PASS | "MULTIPLE CHOICE" eyebrow, Bricolage prompt, numbered OptionCards in a 2-column grid with indigo ring on selection (`les-sheet.png`). `redesign-v2.test.tsx` asserts `grid-cols-2` and "number keys select, and the selected tile gets the indigo ring". |
| 3 | PASS | Prompt speech bubble, answer line, white 3D chips, grey placeholder for a placed tile (`les-sheet.png` panel 2). The indigo speaker button shows **only when the prompt is in the learning language** (`speaker.available` in `WordBankTranslateExercise.tsx`). An English prompt read by a German voice would be wrong, so I accept this (PD-067). |
| 4 | PASS (deviation, **PD-067**) | `ListenExercise.tsx`: 96 px (`size-24`) indigo "Play audio" button and a smaller "0.7×" button. Its accessible name is "Slow 0.7× speed" so that it contains the visible text (WCAG 2.5.3), not "Play slowly". Fallbacks unchanged; FIX-010 adds a 3 s load timeout before falling back to speech. |
| 5 | PASS | Match pairs restyled; RTL + existing e2e green. Code only. |
| 6 | PASS | Cloze restyled with OptionCards; RTL green. Code only. |
| 7 | PASS | Grey flat Check bar when disabled, indigo 3D when enabled (`les-sheet.png` panels 1–2, `redesign-v2.png`). |
| 8 | PASS (deviation, **PD-067**) | Red-tint sheet, X icon, "Not quite", "CORRECT ANSWER:" eyebrow, answer, red 3D button (`les-sheet.png` panel 3). The button says **"Continue"** (the existing copy), not the design's "Got it". The ticket's no-copy-change rule wins. |
| 9 | PASS | Green sheet by result (RTL "sheet colours by result"). Code only. |
| 10 | PASS | `aria-live` and focus on the sheet button (existing tests green). |
| 11 | PASS | Tip card and `OutOfHeartsScreen.tsx` restyled, PD-065 copy unchanged. Code only. |
| 12 | PASS | Lumi in a light indigo circle with confetti, "Lesson complete!" (`results-390.png`). |
| 13 | PASS | TOTAL XP gold (dark text on gold), TIME indigo "0:06", ACCURACY green "100 %" (`results-390.png`); `lessons-results.spec.ts`. |
| 14 | PASS | Coral banner "1-day streak!" / "Streak started!". After FIX-010 "Streak started!" appears once, not also in the pill (`results-390.png` vs. the earlier `redesign-v2.png`). |
| 15 | PASS | Indigo full-width Continue; no "Review my mistakes". "Practice again" is the existing LES-020 action. |
| 16 | PASS | axe across the lesson specs, 142/142. The gold header uses `on-xp-gold` dark text, and XP numbers use `xp` `#8A6200`. |
| 17 | PASS | 375 px no-scroll checks in the lesson e2e; Button `lg` 56 px. |
| 18 | PASS | Existing keyboard lesson e2e and RTL tests green. |
| 19 | PASS | `src/features/lessons/redesign-v2.test.tsx` (grid with numbers, slow button, sheet colours, three tiles); lesson e2e at 375 px. |
| 20 | PASS | cto run on `053a37b`. |

## Review fixes (raised in code review, ticket files written now)

| Ticket | Verdict | Evidence |
|---|---|---|
| FIX-008 | **Accepted** | `PracticeScreen.test.tsx` freezes `Date` at `NOW` (`vi.useFakeTimers({ toFake: ["Date"] })`), timers stay real. Suite green. |
| FIX-009 | **Accepted** | `scroll-to-center.ts` (`stickyInsets`, `centredScrollTop`, header guard), `SkillPathView.tsx` passes `[data-path-header]`. Unit tests in `scroll-to-center.test.ts` and `SkillPathLevels.test.tsx`; e2e in `gamification-loop.spec.ts` and `start-level.spec.ts`. `final-A1/A2.png`: the level header card sits fully below the top bar. |
| FIX-010 | **Accepted** | `celebrationPillText` gives the pill only the perfect-lesson line, and the live region is emptied after it is announced (`ResultsScreen.tsx`, `ResultsScreen.streak-goal.test.tsx`). The goal bar uses an `xp-gold` fill with an `xp` edge, 3:1 checked in `goal-bar.test.ts`. `AUDIO_LOAD_TIMEOUT_MS = 3000` in `audio-player.ts` (`audio-player.test.ts`). `results-390.png` shows the change. |

## Deliberate deviations (judged)

| Deviation | Decision |
|---|---|
| Close button keeps the name "Quit lesson" | Accepted, PD-067 |
| Feedback button says "Continue", not "Got it" | Accepted, PD-067 |
| Node titles kept under the path nodes | Accepted, PD-067 (clearer than the design's bare nodes and the titles were there before) |
| Leagues shows the learner's own weekly XP | Accepted, PD-068 (real data, no other people) |
| No Sounds / Speaking settings rows | Accepted, PD-067 (no feature reads them, so the rows would do nothing) |
| New Daily goal settings row | Accepted, PD-069 |
| No achievements, no "Review my mistakes" | Accepted, already PD-066 §7 and LES-021 out of scope |

## FAIL tickets raised
- **FIX-011** (cto, P2, not blocking): `docs/design/v2/README.md` mapping screens to tickets
  (CTO-016 AC 1).

## Review
_(PM acceptance complete. v0.5.3 ready for release.)_
