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

Built and merged for v0.3.0 (Gamification loop), but not yet mounted on the app's
screens. PLT-009 wires them into Learn and the lesson route.

### Added

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
