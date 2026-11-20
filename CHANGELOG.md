# Changelog

All notable changes to Polyglow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**How the first two releases were tagged (ADR-007).** v0.1.0 and v0.2.0 were accepted
on the same day, after `main` already held all of v0.2.0 and part of v0.3.0. So
`v0.1.0` is tagged on the PLT-005 merge commit `407e4a1` (#42), the first commit on
`main` that contains every v0.1.0 ticket, and `v0.2.0` is tagged on the release merge
commit. Each section below lists the tickets of its milestone. Groundwork for later
milestones that was already on `main` at tag time (for example the lesson player in the
`v0.1.0` tag) is not reachable from the app's screens in that release and is listed in
the release where it becomes user-facing.

## [Unreleased]

## [0.5.3] - 2026-11-20

Redesign: every screen follows the owner's new visual design (PD-066). Polyglow and Lumi
stay; the look is new: a light theme, Bricolage Grotesque and DM Sans, an indigo and coral
palette with gold XP, and "3D" cards and buttons. The bottom navigation has four tabs:
Learn, Practice, Leagues and Profile. Behaviour is unchanged.

### Added

- Practice tab: a list of the lessons you have finished, to replay for free; correct
  answers earn hearts [GAM-012] (#88) [PLT-026] (#90)
- Leagues tab with an honest "Leagues arrive with accounts" state and your own XP this
  week, without invented names or ranks [GAM-012] (#88) [PLT-026] (#90)
- Profile: real stats (day streak, total XP, lessons done, start level), an "XP this
  week" chart with the daily-goal line, and a Daily goal setting [PLT-026] (#90)
- Design references in `docs/design/v2` and ADR-014 [CTO-016] (#87); product decision
  PD-066 and the v0.5.3 tickets [PM-009] (#86)

### Changed

- Design system v2: light theme only (dark mode dropped for now), new colour, radius and
  3D shadow tokens, self-hosted Bricolage Grotesque and DM Sans, restyled shared
  components and new Chip, StatTile, OptionCard and NavTab [CTO-016] (#87)
- Learn path: course chip, streak, XP and hearts top bar, indigo unit banners and big
  round path nodes [GAM-012] (#88)
- Onboarding, app shell, offline and error screens, app icons and manifest colours
  [PLT-026] (#90)
- Lesson player, exercises, feedback sheets, tip card, out-of-hearts screen and results
  [LES-021] (#91)

### Fixed

- Practice screen test no longer depends on the day it runs [FIX-008] (#89)
- The level header is no longer left under the top bar after Learn scrolls to the next
  lesson [FIX-009] (#92)
- Results show "Streak started!" once, the daily-goal bar is gold, and a stalled audio
  clip falls back to speech after 3 s [FIX-010] (#93)
- e2e: lesson helpers wait for a listen exercise's audio to settle before answering
  (#91)

### Documentation

- Design v2 reference README mapping each screen to its ticket [FIX-011] (#96); v0.5.3
  acceptance and PD-067 … PD-070 [PM-ACC4] (#95)

## [0.5.2] - 2026-11-19

Choose where to start and earn hearts back: a guest can start the German course at A1 or
A2, and every correct answer gives back a heart, so running out of hearts no longer stops
practice. This release also ships the fill-the-gap (cloze) exercise.

**Why 0.5.1 has no release of its own.** Milestone v0.5.1 (the cloze exercise contract and
component, CTO-009 and LES-015) was merged on `main` but not released separately. It ships
in 0.5.2 together with the start-level and earn-hearts work.

### Added

- Cloze (fill-the-gap) exercise contract and component, milestone v0.5.1
  [CTO-009] (#71) [LES-015] (#72)
- Choosing a starting level (A1 Beginner or A2 Elementary) in onboarding, in Profile and
  with "Start here" on a locked level of the path [CTO-015] (#80) [GAM-011] (#81)
  [PLT-025] (#82)
- Hearts earned by correct answers (up to 5), and free practice of finished lessons that
  never costs hearts [LES-020] (#83)
- German B1 product plan and B1 tech plan with ADR stubs [CON-DE-B1-PLAN] (#73)
  [CTO-010] (#77)

### Fixed

- Lumi shows the ember state on lesson error and audio-unavailable screens [FIX-005] (#70)
- Stable path e2e test and one hearts warning per failed read [FIX-006] (#76)
- Offline banner accessibility check waits for the banner to settle [FIX-007] (#78)

## [0.5.0] - 2026-11-16

German A1 and A2 in one release: a guest picks German at onboarding, works through the
skill path from A1 Unit 1 to the A2 checkpoint (130 original lessons), and keeps XP,
streak, daily goal and hearts on the device. Existing Spanish guests keep their course.

**Why v0.3.0 to v0.3.3 have no tags of their own (PD-054, same approach as ADR-007).**
The milestones v0.3.0 (Gamification loop), v0.3.1 to v0.3.3 (German A1) and v0.5.0
(German A2) were accepted one after another, but the last fixes for v0.3.x (LES-014, #55
and FIX-003, #67) were merged after the A2 units (#60 to #63). No commit on `main` holds
the v0.3.x milestones without A2, so they ship together as v0.5.0 from one release commit.
The blocks below list the tickets of each milestone. Version `0.4.0` is not used; the
accounts and sync milestone is renumbered v0.6.0.

### Added: v0.3.0, Gamification loop

- User progress from saved results: total XP, today's XP and local "today"
  (`computeUserProgress`, `useUserProgress`) [GAM-003] (#32, #41)
- Path rules and skill path screen: node states, unlock in order, 0-hearts gate
  [GAM-008] (#32, #34)
- Streak status and `useStreak` hook [GAM-004] (#41)
- Daily goal progress ring [GAM-006] (#41)
- Hearts state, lose-hearts mutation and hearts meter [GAM-005] (#38)
- Top bar with streak, total XP and hearts; Lumi glows or dims with the streak
  [GAM-007] [GAM-009] (#43)
- Streak and daily-goal rows with a celebration on the results screen [LES-010] (#44)
- Hearts in the lesson player and an "out of hearts" screen [LES-009] (#45)
- Learn shows the skill path, top bar, streak and daily goal; locked lessons can't be
  opened by URL [PLT-009] (#49)

### Added: v0.3.1 to v0.3.3, German A1

- German course support: CEFR level layer, course registry with `en-de` as the default,
  German answer normalisation and speech locale [CTO-008] (#52)
- German in onboarding and Learn: German is the only course offered and is preselected;
  Learn shows "German · A1"; Spanish guests keep Spanish [PLT-024] (#56)
- Skill path with CEFR levels: collapsible level headers, unit headers, lessons numbered
  within their unit, "Coming soon" levels [GAM-010] (#57)
- German in the lesson player: de-DE speech fallback, tiles in their authored case, long
  compounds wrap at 375 px [LES-014] (#55)
- German A1: 12 units and 60 original lessons, including the A1 checkpoint
  [CON-DE-A1-01..12] (#53)
- German A1 QA pass: cross-unit consistency, word-order alternatives and more natural
  sentences (course version 5) [CON-DE-A1-QA] (#54)

### Added: v0.5.0, German A2

- German A2: 14 units and 70 original lessons, including the A2 checkpoint
  [CON-DE-A2-01..14] (#60, #61, #62, #63)
- German A2 QA pass: answer fairness, grammar coverage and appendices (course version 16)
  [CON-DE-A2-QA] (#64)
- Lessons open on a tip card with a "Start" button [LES-013] (#58)

### Fixed

- Skill path node names contain their visible text and keep the Tab order (WCAG 2.5.3)
  [FIX-002] (#50)
- A failed hearts read counts as full hearts, so XP, streak, goal and path progress stay
  visible [FIX-003] (#67)
- A1 release-candidate playthrough at 375 × 667 with the German voice: all 20 lessons
  played without a wrong answer, de-DE voice and 0.7 slow speed, the 9 changed listen
  transcripts match, the no-voice fallback works [FIX-004] (#68)

## [0.2.0] - 2026-11-12

First playable lesson: a guest goes from onboarding into Lesson 1, plays a full lesson
and sees a results screen. Results are saved on the device.

### Added

- Unit 1 of the English → Spanish course: 5 original lessons [CON-001] (#15)
- Answer checking for every exercise type (`checkAnswer`) [LES-001] (#11)
- XP calculation (`calculateXp`), shipped with the pure streak, hearts and daily-goal
  rules used by v0.3.0 [GAM-002] (#13)
- Lesson player: progress bar, quit dialog and re-queued mistakes, with a
  correct / incorrect feedback panel [LES-002] [LES-003] (#21)
- Multiple-choice and match-pairs exercises [LES-004] [LES-006] (#25)
- Word-bank translate and listen exercises, with normal and slow audio
  [LES-005] [LES-007] (#27)
- Lesson results screen [LES-008] (#29)
- Course loading, the `/lesson/[lessonId]` route and a temporary lesson list on Learn
  [PLT-007] (#46)
- Lesson results saved on the device, and the results screen mounted after a lesson
  [PLT-008] (#46)
- End-to-end test that plays a full Unit 1 lesson through the real exercise registry
  [LES-INT] (#31)

### Fixed

- Multiple-choice prompts are in English with options in Spanish (course version 2)
  [CON-002] (#36)
- Pressing Enter on a selected multiple-choice option checks the answer [FIX-001] (#37)

## [0.1.0] - 2026-11-12

MVP foundation: a new visitor can open Polyglow, install it, finish onboarding as a guest
and move around an accessible, branded app shell that still loads offline.

### Added

- App shell, routing and bottom navigation [PLT-001] (#20)
- Installable PWA: web app manifest, icons, service worker and offline shell [PLT-002]
  (#28)
- Offline indicator and `useOnlineStatus` hook [PLT-006] (#28)
- Guest mode with an on-device learner profile [PLT-003] (#17)
- Onboarding: choose a course and a daily goal [PLT-004] (#26, restored in #33)
- "Install Polyglow" card and an app-update toast with Refresh [PLT-005] (#42)
- Lumi, the paper-lantern mascot, in 4 poses [GAM-001] (#19)
- Polyglow name and Lumi mascot [BRAND-001] (#3)

### Technical

- Next.js, TypeScript, Tailwind, ESLint, Prettier, Vitest, Playwright and CI
  [CTO-001] (#4); coverage and an e2e CI job [CTO-005] (#22)
- Architecture document and zod contracts for every domain [CTO-002] (#8), with
  contract changes CR-001 (#12), CR-002 (#18) and CR-003 (#23)
- Supabase schema, Row Level Security, guest migration RPC and seed [CTO-003] (#9)
- Design tokens and shared UI primitives (Button, Card, ProgressBar, Modal, Toast)
  [CTO-004] (#14)
- TanStack Query client and provider [CTO-006] (#30)

### Fixed

- Onboarding and product-doc changes accidentally reverted by #27 restored
  [PLT-004] (#33)

[Unreleased]: https://github.com/mahmudul-islam32/lingo/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/mahmudul-islam32/lingo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mahmudul-islam32/lingo/releases/tag/v0.1.0
