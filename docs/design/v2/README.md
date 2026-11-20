# Design v2 references (owner design, 2026-11-19)

Verbatim references for the v0.5.3 "Redesign" milestone (PD-066). The owner's brief is in
[`BRIEF.md`](BRIEF.md). Each screen comes as a render (`screen-N.png`, 390 × 874) and as
extracted markup with the exact inline styles (`screen-N.html`). Tokens, fonts and shared
components are described in
[ADR-014 Design system v2](../../architecture/adr/ADR-014-design-system-v2.md).

**Brand:** the design's name "parla" and its speech-bubble logo are **not used** (PD-066 §8).
The app is **Polyglow** and the mascot is **Lumi** (PD-001). The `<title>` of the HTML files
still says "Parla" because the files are kept exactly as the owner delivered them.

## Screens and tickets

| # | Reference | Our screen | Ticket (owner) | Main code |
|---|---|---|---|---|
| 1 | [screen-1](screen-1.png) Welcome and pick a language | Onboarding: welcome, course picker, level and goal steps | PLT-026 (dev-platform) | `src/app/onboarding/steps/*`, `src/app/_shell/RadioCardGroup.tsx` |
| 2 | [screen-2](screen-2.png) Home, learning path | Learn tab: top bar, unit banners, path nodes, 4-tab nav | GAM-012 (dev-gamification); nav in PLT-026 | `src/features/path/components/SkillPathView.tsx`, `PathNode.tsx`, `src/features/gamification/components/GamificationTopBar.tsx`, `src/app/_shell/BottomNav.tsx` |
| 3 | [screen-3](screen-3.png) Lesson, multiple choice | Lesson header, 2 × 2 option tiles, Check bar | LES-021 (dev-lessons) | `src/features/lessons/exercises/multiple-choice/*`, `src/features/lessons/player/*` |
| 4 | [screen-4](screen-4.png) Lesson, build the sentence | Word bank / translate with speaker and prompt bubble | LES-021 (dev-lessons) | `src/features/lessons/exercises/word-bank*/*` |
| 5 | [screen-5](screen-5.png) Answer feedback (incorrect) | Feedback sheets (incorrect and correct), listen exercise | LES-021 (dev-lessons) | `src/features/lessons/feedback/FeedbackPanel.tsx`, `src/features/lessons/exercises/listen/*` |
| 6 | [screen-6](screen-6.png) Lesson complete | Results: Lumi, stat tiles, streak banner, daily goal | LES-021 (dev-lessons); polish FIX-010 | `src/features/lessons/results/*` |
| 7 | [screen-7](screen-7.png) Leagues | Leagues tab: "Leagues arrive with accounts" and the learner's own weekly XP | GAM-012 (dev-gamification); route in PLT-026 | `src/features/gamification/leagues/*`, `src/app/(tabs)/leagues/page.tsx` |
| 8 | [screen-8](screen-8.png) Profile and progress | Profile: header, stats, "XP this week" chart, settings rows | PLT-026 (dev-platform) | `src/features/profile/**`, `src/app/(tabs)/profile/*` |
| – | (nav tab in screen 2) Practice | Practice tab: list of finished lessons | GAM-012 (dev-gamification); route in PLT-026 | `src/features/path/practice/*`, `src/app/(tabs)/practice/page.tsx` |
| – | Tokens, fonts, shared components | `tokens.css`, Button, Card, ProgressBar, StatTile, Chip, OptionCard, NavTab … | CTO-016 (cto), ADR-014 | `src/components/ui/**`, `src/app/layout.tsx` |

Follow-up polish: FIX-009 (the level header no longer ends up under the top bar on Learn)
and FIX-010 (results, goal bar, audio timeout).

## Accepted deviations from the design

| What | Decision |
|---|---|
| Light theme only; no achievements, league tier, words learned or invented data | PD-066 |
| The design's names and copy are not used where ours differ ("Quit lesson", "Continue" instead of "Got it", "Slow 0.7× speed"); lesson titles stay under the path nodes; the word-bank speaker shows only for learning-language prompts; no Sounds / Speaking rows | PD-067 |
| Leagues shows the learner's own weekly XP (no other people) | PD-068 |
| Profile has a "Daily goal" settings row | PD-069 |
| Coral is `#F05E3C` instead of `#F2613F` (3:1 on the canvas); `border-strong` stays a 3:1 outline; XP text is dark gold `#8A6200` | ADR-014 §2 |
