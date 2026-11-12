# Product Requirements Document — MVP

**App name:** Polyglow (decided, see PD-001 in `decisions.md`)
**Mascot:** Lumi, the paper lantern
**Status:** Draft v1.1 (German pivot, see §3) · **Owner:** pm · **Last updated:** 2026-11-12

---

## 1. Vision

Make learning a language a daily habit that takes five minutes, works on any phone
without an app store, and keeps working on a train with no signal.

Polyglow is a mobile-first Progressive Web App with short, game-like lessons. Learners
move along a skill path, earn XP, keep a daily streak and protect a small stock of hearts.
Everything about the brand, mascot, art, sound and course content is our own.

## 2. Target users

| Persona | Description | What they need |
|---|---|---|
| **Casual beginner** (primary) | Adult, 18–45, English speaker, zero to little Spanish. Wants to learn for travel, family or personal interest. Uses a phone in short gaps (commute, queue, before bed). | Lessons under 5 minutes, clear progress, gentle reminders to come back. |
| **Returning learner** (secondary) | Studied Spanish at school years ago and forgot most of it. | Quick wins and a way to keep a habit going. |
| **Try-before-commit visitor** | Arrives from a shared link and doesn't want to make an account yet. | Start a lesson in under 30 seconds as a guest, keep the progress when signing up later. |

German track personas (PD-031): skilled workers and nurses preparing to move, spouses who
need A1, international students, expats in Germany, then hobby and heritage learners
(`market-analysis-german.md` §2). The personas above apply with "German" for "Spanish".

Out of scope for MVP: children under 13 (would bring COPPA/GDPR-K obligations), teachers
and classrooms, advanced learners.

## 3. First course — language pair

> **Changed 2026-11-12 (PD-030, PD-031):** the primary course is now **English speakers
> learning German (`en-de`)**, organised by CEFR level from A1 to C1. See
> `market-analysis-german.md` for the market and personas (skilled workers, nurses, spouses,
> students, expats, hobby and heritage learners) and `curriculum-german.md` for the
> curriculum. The Spanish course below is kept but hidden from onboarding. The text below
> is the original MVP rationale and stays as history. Where this PRD says "Spanish", read
> "the active course".

**Original MVP course: English speakers learning Spanish (`en` → `es`).**

Why:
- Spanish is the language English speakers most often choose to learn, so it gives the
  biggest pool of early users.
- It uses the Latin alphabet with only a few diacritics (á, é, í, ó, ú, ñ, ü), so the word
  bank, typing and matching UIs stay simple. No right-to-left text or IME edge cases.
- Pronunciation maps closely to spelling, which fits the listening exercise and the
  optional speaking exercise.
- Good TTS voices are available for pre-generating audio.

Variant: neutral Latin American Spanish (ustedes, no vosotros) in all MVP content.
Regional notes are Phase 2+.

## 4. Goals

### Product goals (MVP)
- **G1.** A new visitor finishes their first lesson within 2 minutes of landing, with no
  account.
- **G2.** Learners come back the next day, driven by streaks, the daily goal and visible
  progress on the path.
- **G3.** Lessons that are already downloaded can be played offline. Progress syncs when
  the device is back online.
- **G4.** Ship a small, solid, accessible foundation that Phase 2 features (leagues,
  more courses, reminders) can build on.

### Business / team goals
- Validate the core habit loop (lesson → XP → streak → return) before investing in more
  content or social features.
- Build a content pipeline (JSON validated against `/src/contracts`) that scales to more
  units and languages.

## 5. Success metrics

Measured from MVP launch, on a rolling 28-day window. MVP needs basic event tracking
(lesson_started, lesson_completed, signup, etc.); the analytics vendor is a CTO decision.

| Metric | Definition | MVP target |
|---|---|---|
| Time to first lesson | Median time from first page load to first exercise shown | ≤ 45 s |
| First-lesson completion | % of users who start lesson 1 and reach its results screen | ≥ 70 % |
| Guest → account conversion | % of guests who finish ≥ 1 lesson and then create an account within 7 days | ≥ 25 % |
| D1 retention | % of new learners who finish ≥ 1 lesson on the day after their first day | ≥ 30 % |
| D7 retention | Same, on day 7 | ≥ 12 % |
| Daily goal hit rate | % of active learner-days on which the daily XP goal is reached | ≥ 50 % |
| Unit 1 completion | % of learners who finish all lessons in Unit 1 within 14 days | ≥ 20 % |
| Offline reliability | % of lessons completed offline that sync without data loss | ≥ 99 % |
| Quality: performance | Lighthouse PWA installable check passes; Performance ≥ 90 on mobile | Pass |
| Quality: accessibility | Lighthouse Accessibility ≥ 95; all lesson flows keyboard-completable | Pass |

## 6. Scope

### 6.1 MVP (Phase 1)

**Content**
- 1 course (English → Spanish), 1 unit, **5 lessons**, each about 10–12 exercises.
- All sentences, vocabulary choices and lesson themes are original, written by pm in
  `/content/` and validated against the contracts schema.
- Pre-generated TTS audio for every Spanish sentence and word used in listening
  exercises.

**Exercise types**
| # | Type | Description | Notes |
|---|---|---|---|
| 1 | Multiple choice | Prompt plus 3–4 options, pick one | Text options. Image options are Phase 2. |
| 2 | Translate (word bank) | Build the translation by tapping word tiles | Both directions (es→en and en→es). |
| 3 | Match pairs | Match 5 Spanish words to English translations | Keyboard-operable. |
| 4 | Listen | Play audio, then build what you heard with word tiles | Normal and slow playback. Pre-generated audio. |
| 5 | Speak (optional) | Read a short phrase aloud. Web Speech API checks it | Only shown where speech recognition is supported and the mic is allowed. Always skippable ("Can't speak now"). Never costs a heart. Hidden in unsupported browsers. |

**Lesson flow**
- Progress bar, "Check" button, correct/incorrect feedback panel showing the right
  answer, "Continue".
- Wrong answers are queued again at the end of the lesson (must be answered correctly
  to finish).
- Results screen: XP earned, accuracy %, time taken, streak status, daily goal
  progress.
- Quit confirmation dialog. Progress in an unfinished lesson is not saved.

**Gamification and path**
- **Skill path:** a vertical path of 5 lesson nodes in Unit 1, with states locked,
  available, in progress and completed. Lessons unlock in order.
- **XP:** fixed XP per lesson completed (default 10), plus a bonus for a perfect lesson
  (default +5). Exact values come from contracts/config.
- **Daily goal:** chosen at onboarding (for example 10 / 20 / 30 / 50 XP per day).
  Progress ring on the home screen. Can be changed in settings.
- **Streak:** goes up by 1 on each calendar day (learner's local timezone) on which at
  least one lesson is completed. Resets to 0 if a day is missed. Streak freezes are
  Phase 2.
- **Hearts:** 5 maximum. A wrong answer costs 1 heart. At 0 hearts the learner can't
  start a new lesson; a lesson already in progress ends with an "out of hearts" screen.
  1 heart refills every 4 hours, up to 5. No purchase or ads in MVP. A "practice to earn
  hearts" mode is Phase 2.

**Platform**
- **Auth:** email + password sign-up and log-in, Google sign-in (Supabase Auth),
  password reset by email, log out.
- **Guest mode:** start without an account. Progress is stored on the device. When the
  guest signs up, their progress (XP, streak, completed lessons, daily goal) moves to the
  new account. A prompt to save progress appears after the first completed lesson.
- **Onboarding:** pick the course (only Spanish is available, but the screen exists for
  later), pick a daily goal, then go straight into lesson 1.
- **Profile:** display name, avatar (initials or a preset original avatar), total XP,
  current streak, longest streak, lessons completed, join date. Settings: daily goal,
  sound effects on/off, speaking exercises on/off, log out.
- **PWA:** installable (manifest, icons, splash), service worker, offline app shell.
- **Offline:** Unit 1 lessons and their audio are cached after first load. Lessons
  finished offline are queued and synced on reconnect. A clear offline indicator is
  shown. Auth and sign-up need a connection.
- **Accessibility:** keyboard navigation for every exercise, ARIA labels, WCAG AA
  contrast, `prefers-reduced-motion` respected, works at 375 px width.
- **Localization:** UI in English only. Spanish only as course content.

### 6.2 Phase 2

- **Leagues and leaderboards:** weekly XP leagues with promotion and demotion (Supabase
  Realtime). Deferred because they need a meaningful number of concurrent users to feel
  alive, and they add moderation, fairness and anti-cheat work. The habit loop has to be
  validated first.
- Streak freeze and streak repair.
- Practice / review mode (spaced repetition of weak words), which also earns hearts back.
- Units 2–5 of the Spanish course, unit checkpoints and "jump ahead" tests.
- Push notifications and daily reminders (Web Push).
- Image-based multiple choice, typed translation with diacritic tolerance, tap-to-hear
  on word tiles.
- Achievements and badges.
- Friends: follow, see friends' streaks.
- Mascot animations and reactions throughout the lesson flow (static mascot only in
  MVP).
- Apple sign-in.

### 6.3 Phase 3

- Additional courses (for example English → French, Spanish → English).
- Stories and dialogue lessons, listening comprehension passages.
- Pronunciation scoring beyond simple recognition.
- Subscription (ad-free, unlimited hearts, offline download of full courses).
- Native app wrappers (only if PWA limits block growth).
- Localized UI (Spanish, Portuguese, etc.).
- Teacher and classroom tools.

## 7. Non-goals (MVP)

- No monetization: no ads, purchases or subscriptions.
- No social features: no leagues, friends, chat or sharing beyond a plain link.
- No AI-generated lesson content at runtime. All content is authored and reviewed.
- No native iOS or Android apps, and no app-store distribution.
- No more than one course or one unit.
- No grammar explanations beyond a short "tip" line per lesson.
- No user-generated content.
- No use of any third-party language app's name, mascot, artwork, colours-as-brand,
  sounds, fonts or course content. All brand and content assets are original.

## 8. Key UX principles

1. **Five minutes or less.** Every lesson fits in a short break.
2. **Always forward.** After any action there is one obvious next button.
3. **Kind feedback.** Wrong answers show the correct answer right away, with no shaming
   copy.
4. **Offline is normal.** The learner should never lose a finished lesson.
5. **Accessible by default.** Keyboard, screen reader and reduced motion are supported
   from day one, not added later.

## 9. Assumptions and open questions

| # | Question | Default assumption | Decide by |
|---|---|---|---|
| Q1 | App name and mascot | **Decided (PD-001):** Polyglow, mascot Lumi, palette midnight indigo + amber/gold. Trademark/domain/handle check waiting on owner (non-blocking) | Decided 2026-11-07 |
| Q2 | XP values, heart refill interval, daily goal options | **Default set (PD-003):** 10 XP / +5 perfect; 1 heart per 4 h; 10/20/30/50 | CTO puts them in contracts/config; pm can tune |
| Q3 | Do guests lose hearts? | **Default set (PD-003):** Yes, same rules as signed-in users | pm |
| Q4 | Streak day boundary | Learner's device local timezone, stored with each completion | CTO |
| Q5 | Analytics vendor | Privacy-friendly, no third-party ad trackers | CTO |
| Q6 | Minimum age / consent copy | 13+, simple terms and privacy page (placeholder copy until decided) | Owner (legal), non-blocking |
| Q7 | TTS provider for pre-generated audio | Any provider whose licence allows commercial redistribution of the output (placeholder/mock audio until decided) | CTO + owner (licence), non-blocking |

## 10. Dependencies

- `/src/contracts` (CTO-002) must define the course, unit, lesson, exercise, progress and
  user schemas before content and feature tickets start.
- Supabase project and schema (CTO-003).
- Shared UI primitives (CTO-004).
