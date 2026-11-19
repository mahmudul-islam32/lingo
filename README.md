# Polyglow

**Learn German in five minutes a day.** Polyglow is a mobile-first, installable
language-learning app (PWA) with short game-like lessons, XP, streaks, hearts and a
skill path. Our guide is **Lumi**, a small paper lantern whose glow grows with your streak.

> Built by an autonomous team of AI agents (product, tech lead and three developers)
> that plans, builds, reviews and merges every night. This README is refreshed by the
> nightly run: screenshots and recordings are captured from the real app on `main`.

**Last updated:** 2026-11-19 · **Version:** 0.5.0 · **Course:** English → German, A1 and A2
complete (26 units, 130 lessons)

---

## What you can do today (on `main`)

### First launch: onboarding

Pick German and a daily goal. No account needed: progress is saved on the device.

<p>
  <img src="docs/media/onboarding.gif" width="270" alt="Recording: onboarding from the welcome screen to the skill path" />
</p>

| Welcome                                                                                                  | Choose a course                                                                                       | Choose a daily goal                                                                                            |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <img src="docs/media/onboarding-1-welcome.png" width="240" alt="Welcome screen with Lumi the lantern" /> | <img src="docs/media/onboarding-2-course.png" width="240" alt="Course picker with German selected" /> | <img src="docs/media/onboarding-3-goal.png" width="240" alt="Daily goal picker with Regular 20 XP selected" /> |

[▶ Watch in full quality (MP4)](docs/media/onboarding.mp4)

### Play a German lesson

Every lesson opens with a short tip, then 10–12 exercises: multiple choice, match pairs,
word-bank translation in both directions and listening. Wrong answers come back at the end
of the lesson; the results screen shows XP, accuracy, time, your streak and the daily goal.

<p>
  <img src="docs/media/lesson.gif" width="270" alt="Recording: playing German Lesson 1 from the tip card to the results" />
</p>

| Tip                                                                                  | Multiple choice                                                                                                  | Not quite                                                                                                | Match pairs                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| <img src="docs/media/lesson-tip.png" width="200" alt="Tip card before the lesson" /> | <img src="docs/media/lesson-choice.png" width="200" alt="Multiple-choice exercise with Guten Morgen selected" /> | <img src="docs/media/lesson-feedback-incorrect.png" width="200" alt="Incorrect-answer feedback panel" /> | <img src="docs/media/lesson-match-pairs.png" width="200" alt="Match-pairs exercise in progress" /> |

| Word bank                                                                                      | Listen                                                                                           | That's right!                                                                                        | Lesson complete                                                                                                             |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/media/lesson-word-bank.png" width="200" alt="Word-bank translation exercise" /> | <img src="docs/media/lesson-listen.png" width="200" alt="Listen exercise with audio fallback" /> | <img src="docs/media/lesson-feedback-correct.png" width="200" alt="Correct-answer feedback panel" /> | <img src="docs/media/lesson-results.png" width="200" alt="Results screen with XP, accuracy, time, streak and daily goal" /> |

[▶ Full lesson (MP4)](docs/media/lesson.mp4)

_Listening exercises show "Audio isn't available" with a Skip button until recorded German
audio is added (waiting on a text-to-speech licence decision); skipping costs no heart._

### Skill path, top bar and navigation

The Learn tab is a skill path grouped by CEFR level and unit: finish a lesson to unlock the
next. The top bar shows your streak, XP and hearts. The app is an installable PWA that works
offline.

| Skill path                                                                  | After Lesson 1                                                                                  | Profile                                                                        | Offline                                                                      | Page not found                                                    |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| <img src="docs/media/learn.png" width="170" alt="Skill path with Unit 1" /> | <img src="docs/media/learn-lessons.png" width="170" alt="Skill path with Lesson 1 completed" /> | <img src="docs/media/profile.png" width="170" alt="Profile tab placeholder" /> | <img src="docs/media/offline-banner.png" width="170" alt="Offline banner" /> | <img src="docs/media/not-found.png" width="170" alt="404 page" /> |

<p>
  <img src="docs/media/tabs.gif" width="220" alt="Recording: switching between Learn and Profile" />
  &nbsp;&nbsp;
  <img src="docs/media/offline.gif" width="220" alt="Recording: going offline and back online" />
</p>

[▶ Tabs (MP4)](docs/media/tabs.mp4) · [▶ Offline (MP4)](docs/media/offline.mp4)

### Start where you are, earn hearts by practising

- **Choose your starting level:** onboarding asks "Where do you want to start?" (A1 Beginner
  or A2 Elementary). A2 starters go straight to A2 Unit 1; A1 lessons stay open. A locked level
  on the path has a "Start here" button, and Profile lets you change the starting level.
- **Earn hearts:** every correct answer gives back a heart (up to 5). With no hearts left,
  replay any finished lesson as **Practice**: it never costs hearts and earns them back.

### The German course

- **A1 (complete):** 12 units, 60 original lessons and about 700 exercises, from greetings to
  appointments, shopping, the doctor and registering an address, ending in an A1 checkpoint.
- **A2 (complete):** 14 units and 70 lessons: weather, the past, holidays, celebrations,
  errands, clothes, health, phone calls, home and neighbours, train and hotel, work, letters
  and offices, media and comparisons, plans for the future, ending in an A2 checkpoint. Every
  lesson opens with a grammar tip.
- **Listening:** listen exercises speak German with the device's German voice (normal and
  0.7× slow) until recorded audio is added.
- All content is original and written to our own content standard (umlauts and ß are
  real letters, both `du` and `Sie` are taught, answers accept every natural word order).

---

## Coming next

- **Fill-the-gap (cloze) exercises:** built and merged (v0.5.1); they appear once the first
  cloze content lands.
- **German B1** (v1.1.0): planned in full: 16 units, about 80 lessons (polite requests, life
  stories, work, renting, the doctor, complaints, authorities, news, opinions). Writing has started.
- **Accounts and sync** (v0.6.0): resumes once a hosted database is set up.

---

## Roadmap

| Version | Goal                                                   | Status                   |
| ------- | ------------------------------------------------------ | ------------------------ |
| v0.1.0  | MVP foundation: app shell, PWA, guest mode, onboarding | released                 |
| v0.2.0  | First playable lesson: lesson engine, 4 exercise types | released                 |
| v0.3.x  | German A1: 60 lessons, CEFR skill path, tip cards      | released in v0.5.0       |
| v0.5.0  | German A2: 70 lessons, A2 checkpoint, German voice     | released                 |
| v0.5.1  | Fill-the-gap (cloze) exercise                          | built, awaiting content  |
| v0.5.2  | Start level choice, hearts earned by correct answers   | merged                   |
| v0.6.0  | Accounts and sync (Supabase), profile and settings     | paused (needs hosting)   |
| v1.0.0  | Launch polish: audio, speaking, native review          | planned                  |
| v1.1.0  | German B1 (then B2, C1)                                | planned, writing started |

Details: [`docs/product/ROADMAP.md`](docs/product/ROADMAP.md) · Live status:
[`docs/STATUS.md`](docs/STATUS.md)

## Tech stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · Serwist (service
worker) · Dexie (IndexedDB) · TanStack Query · Zustand · Supabase · Zod · Vitest + React
Testing Library · Playwright

## Run it locally

```bash
npm ci
npm run dev          # http://localhost:3000
npm run test         # unit tests
npm run build        # production build (webpack, emits the service worker)
npm run test:e2e     # Playwright end-to-end tests
```

## Updating the screenshots and recordings

```bash
npm run build && npx next start -p 3200 &
BASE_URL=http://localhost:3200 node scripts/readme-media/capture.mjs   # PNGs + recordings
scripts/readme-media/encode.sh                                         # → GIF + MP4
```

Set `CHROMIUM_PATH` to use a specific Chromium, `ONLY=onboarding,lesson` to capture
selected flows, and `MEDIA_DIR=docs/media/preview` to capture an unmerged branch. The lesson
flow plays German Lesson 1 using the answers in its content file. New screens are added as a
flow in `scripts/readme-media/capture.mjs`.

## Project docs

- Product: [PRD](docs/product/PRD.md), [German market analysis](docs/product/market-analysis-german.md),
  [German curriculum](docs/product/curriculum-german.md), [decisions](docs/product/decisions.md),
  [tickets](docs/product/tickets)
- Architecture: [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md),
  [ADRs](docs/architecture/adr)
- How the agent team works: [CLAUDE.md](CLAUDE.md), [ORCHESTRATOR.md](ORCHESTRATOR.md)
