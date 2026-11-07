# Polyglow architecture

- **Owner:** cto · **Status:** v1 (CTO-002) · **Last updated:** 2026-11-07
- Decisions: [ADR-001 scaffold](adr/ADR-001-scaffold.md), [ADR-002 contracts](adr/ADR-002-contracts.md),
  [ADR-003 Supabase](adr/ADR-003-supabase.md), [ADR-004 design tokens and UI primitives](adr/ADR-004-design-tokens-ui-primitives.md)
- Contract changes: [contract-requests.md](contract-requests.md)

Every agent reads this file before starting a ticket. If code and this document
disagree, the contracts in `/src/contracts` win, then this document, then the code.

## 1. System overview

Polyglow is one Next.js App Router app, shipped as an installable PWA. It is
**offline-first**: the browser holds the learner's data in IndexedDB (Dexie) and
works without the network. Supabase (Postgres + Auth) is the remote copy, used for
accounts and cross-device sync.

```
┌──────────────────────────── Browser (PWA) ────────────────────────────┐
│  React UI (src/app, src/features/*, src/components/ui)                │
│     │ hooks                                                           │
│     ▼                                                                 │
│  Zustand (ephemeral UI + lesson session)   TanStack Query (cache)     │
│                                                 │ queryFn / mutationFn│
│                                                 ▼                     │
│  Pure rules (checking, XP, streak, hearts)   Data layer (src/lib/*)   │
│                                              ├─ content  (bundled JSON)│
│                                              ├─ offline  (Dexie)       │
│                                              └─ sync ────────────┐    │
│  Service worker (Serwist): precache shell, content, audio        │    │
└──────────────────────────────────────────────────────────────────┼────┘
                                                                   │ HTTPS when online
                                                       ┌───────────▼──────────┐
                                                       │ Supabase             │
                                                       │ Auth · Postgres · RLS │
                                                       └──────────────────────┘
```

Key properties:

- **No server rendering of user data.** Pages are static shells; all user data is read
  client-side from Dexie. This keeps every screen working offline and lets the service
  worker serve the whole app from cache. Route handlers / server actions are not used
  for user data in MVP.
- **Content is static and bundled.** Course JSON is validated at test time and shipped
  with the build, so lessons work offline after the first load.
- **Pure core.** Answer checking and every gamification rule are pure functions with
  time passed in. They are unit-tested and run the same way online and offline.

## 2. Module boundaries

| Folder                         | Owner                                | Contains                                                                                                                                                                        |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/contracts`                | cto                                  | zod schemas, inferred types, config constants, text normalisation, API signatures                                                                                               |
| `src/app`                      | dev-platform                         | routes, layouts, providers (Query client, stores), PWA shell, manifest                                                                                                          |
| `src/features/lessons`         | dev-lessons                          | lesson player, exercise components, session store, `checking/` (CheckAnswer)                                                                                                    |
| `src/features/gamification`    | dev-gamification                     | `rules/` (xp, streak, hearts, daily goal, progress), results/hearts/streak UI                                                                                                   |
| `src/features/path`            | dev-gamification                     | skill path UI, `rules/` (ComputePathNodes)                                                                                                                                      |
| `src/features/auth`            | dev-platform                         | sign up / in / out, Google, reset, guest → account migration                                                                                                                    |
| `src/features/profile`         | dev-platform                         | profile and settings screens                                                                                                                                                    |
| `src/lib/offline`              | dev-platform                         | Dexie database, repositories (ProgressRepository, ProfileRepository)                                                                                                            |
| `src/lib/sync`                 | dev-platform                         | SyncEngine: queue drain, backoff, pull                                                                                                                                          |
| `src/lib/content` _(proposed)_ | dev-platform                         | ContentRepository: loads bundled course/lesson JSON                                                                                                                             |
| `src/lib/supabase`             | cto (schema) / dev-platform (client) | Supabase browser client, generated DB types                                                                                                                                     |
| `src/components/ui`            | shared                               | design tokens + primitives (CTO-004, ADR-004): Button, IconButton, Card, ProgressBar, Dialog/Modal, Toast, HeartIcon, XpBadge, Skeleton, Spinner, VisuallyHidden, icons, `cn()` |
| `content/**`                   | pm                                   | course JSON                                                                                                                                                                     |
| `public/audio/**` _(proposed)_ | pm                                   | pre-generated TTS audio                                                                                                                                                         |
| `supabase/**`                  | cto                                  | migrations, RLS, seed                                                                                                                                                           |

_(proposed)_ = not yet in the `CLAUDE.md` ownership table; the orchestrator should add it.

Rules:

1. **Everyone imports types from `@/contracts`** (the barrel), never from deep paths,
   and never redefines a contract type locally.
2. **Each feature exposes a public API** in `src/features/<name>/index.ts`. Other
   features import only from that barrel (`@/features/gamification`), never from
   internal files. Example: the lessons results screen calls
   `computeLessonXp` from `@/features/gamification`.
3. **Features never import Dexie or Supabase directly.** They call the repositories
   from `src/lib/*` (signatures in `src/contracts/api.ts`), usually through TanStack
   Query hooks the feature defines.
4. **Pure rules never read the clock or storage.** `now: Date` and `today: LocalDate`
   are parameters.
5. `src/components/ui` is presentational only: no stores, no data access.

## 3. Data flow: playing a lesson

1. Path screen: `ContentRepository.getCourse` + `ProgressRepository.listLessonResults` →
   `computePathNodes` → nodes (locked / available / in progress / completed).
2. Start: hearts are refilled lazily (`refillHearts(state, now)`); at 0 hearts the start
   button is disabled and shows `nextRefillAt`.
3. The lessons feature creates a `LessonSession` in its Zustand store: queue = exercise
   ids in content order, minus hidden ones (speak when unsupported/disabled).
4. "Check": `checkAnswer({ exercise, answer })` → `AnswerCheckResult`. An incorrect
   non-speak answer costs 1 heart: `loseHearts` + `ProgressRepository.saveHearts`
   **immediately** (so quitting does not undo the loss), and the exercise id is
   appended to the end of the queue.
5. Hearts reach 0 → status `out_of_hearts`, no result, no XP.
6. Queue empty → status `completed`. The lessons feature builds a `LessonResult`
   (XP from `computeLessonXp`, `localDate` from `toLocalDate(completedAt, deviceTz)`)
   and calls `ProgressRepository.saveLessonResult`, which writes the result **and** a
   `lesson_result` sync record in one Dexie transaction.
7. TanStack Query invalidates `["progress", courseId]`; results, home and path screens
   re-derive XP, streak and daily goal from the result set.
8. The sync engine pushes the queue when online (section 4).

Quit (confirmed) discards the session; nothing but already-lost hearts persists.

## 4. Offline-first strategy

### 4.1 Local database (Dexie, `src/lib/offline`)

One database `polyglow`, scoped to the current identity (one identity per device at a
time). Tables:

| Table           | Key                               | Contract          | Notes            |
| --------------- | --------------------------------- | ----------------- | ---------------- |
| `identity`      | `"current"`                       | `Identity`        | guest or account |
| `profile`       | `"current"`                       | `Profile`         |                  |
| `settings`      | `"current"`                       | `Settings`        |                  |
| `hearts`        | `"current"`                       | `HeartsState`     |                  |
| `lessonResults` | `id`, idx `localDate`, `lessonId` | `LessonResult`    | append-only      |
| `syncQueue`     | `id`, idx `status+nextAttemptAt`  | `SyncQueueRecord` |                  |
| `meta`          | `"sync"`                          | `SyncMeta`        |                  |

Every write is validated with the zod schema before it is stored, and every read of a
synced/remote record is parsed (never trusted). Dexie schema versions are bumped in
`src/lib/offline` with an upgrade function; `CONTRACTS_VERSION` is bumped only for
breaking changes to synced payloads.

### 4.2 Source of truth and derived state

- **Facts:** `LessonResult` (append-only), `HeartsState`, `Settings`, `Profile`.
- **Derived, never stored as authority:** total XP, completed lessons, streak, daily
  goal progress, path node states, XP events. They are computed by pure functions from
  the facts, on the client and (for queries/leaderboards later) on the server with the
  same rules.

This makes sync conflicts almost disappear: merging two devices is a set union of
lesson results, after which every aggregate is recomputed.

### 4.3 Sync queue (`src/lib/sync`)

- Each local fact change enqueues a `SyncQueueRecord` (`kind`: `lesson_result`,
  `settings`, `profile`, `hearts`). For settings/profile/hearts the engine coalesces
  pending records of the same kind (only the latest is sent).
- The engine runs on: app start, the `online` event, after each enqueue (debounced
  2 s), and every 60 s while visible. Only for `account` identities; guests never sync.
- Push order is `createdAt` ascending. Success or "already exists" → delete the
  record. Network/5xx → `attemptCount++`, `nextAttemptAt = now + min(base·2^n, max)`
  (`SYNC_CONFIG`). 4xx validation/RLS error → `status: "rejected"` (kept, never
  retried, surfaced in dev tools/logs).
- After a push, pull remote facts changed since `meta.lastPullAt` (results by
  `created_at`, others by the server-set `server_updated_at`; the cursor is a server
  timestamp, see ADR-003) and merge with the rules below.
- The offline indicator (US-PLT-16) reads `SyncEngine.status()` + `navigator.onLine`.

### 4.4 Conflict rules

| Fact           | Rule                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| `LessonResult` | Grow-only set keyed by client UUID. Server insert is `ON CONFLICT (id) DO NOTHING`. |
| `Settings`     | Last-write-wins on `updatedAt` (whole record).                                      |
| `Profile`      | Last-write-wins on `updatedAt` (editable fields only; `joinedAt` = earliest).       |
| `HeartsState`  | Last-write-wins on `updatedAt`, then lazily refilled at read time.                  |

Clock skew is tolerated: LWW only matters when the same user edits settings on two
devices within seconds, which is acceptable for MVP.

## 5. State management

| Kind of state                                                  | Tool                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| Ephemeral, client-only (lesson session, open modal, tile tray) | **Zustand**, one store per feature, not persisted               |
| Persisted user data (results, hearts, settings, profile)       | **Dexie** via repositories, read through **TanStack Query**     |
| Server-only data (none in MVP; leaderboards in Phase 2)        | TanStack Query against Supabase                                 |
| Content                                                        | TanStack Query over `ContentRepository` (`staleTime: Infinity`) |

- Query keys: `["content", courseId]`, `["lesson", courseId, lessonId]`,
  `["progress", courseId]`, `["hearts"]`, `["settings"]`, `["profile"]`,
  `["sync-status"]`. Mutations invalidate the matching keys; the sync engine
  invalidates `progress`/`settings`/`profile`/`hearts` after a pull.
- `networkMode: "always"` for Dexie-backed queries so they run offline.
- No global Redux-like store. Do not mirror Query data into Zustand.

## 6. Auth and guest mode

- **Guest (default).** First launch creates `Identity { kind: "guest", guestId }`
  (`crypto.randomUUID()`), a profile ("Learner", initials avatar) and default settings in
  Dexie. No network call is needed, so G1 (first lesson within 2 minutes) works even
  offline. Guests play with the same rules, hearts included (PD-003 Q3).
- **Accounts.** Supabase Auth with email + password, Google OAuth and password reset,
  using the browser client (`@supabase/supabase-js`, session persisted in
  localStorage). No SSR auth. Auth screens need a connection and say so when offline.
  A signed-in session keeps working offline; tokens refresh on reconnect.
- **Guest → account migration (US-PLT-05).** After sign-up or log-in on a device with
  guest data, `migrateGuestToAccount(GuestMigrationPayload)` calls a Supabase RPC
  (`migrate_guest_to_account`, ADR-003) in one transaction:
  - lesson results: inserted with `ON CONFLICT DO NOTHING` (union);
  - new account (no remote rows): guest profile, settings and hearts become the
    account's, `joinedAt` kept from the guest;
  - existing account: newer `updatedAt` wins per record;
  - on success the client rewrites `identity` to `account`, clears the guest queue
    and pulls. On failure nothing changes locally and the prompt can retry.
- **Log out** clears the Dexie database after a final sync attempt (warns if unsynced
  records remain), then starts a fresh guest.
- RLS: every user table is `user_id = auth.uid()`; content is not stored in Postgres in
  MVP. Tables, policies and the RPC: ADR-003, `/supabase`.

## 7. Gamification rules (PD-003): what, where, how

All constants come from `GAME_CONFIG` in `src/contracts/config.ts`. The function types
are in `src/contracts/api.ts`; implementations are owned by dev-gamification in
`src/features/gamification/rules/` (path rules in `src/features/path/rules/`).

| Rule           | Function                   | Definition                                                                                                                                                                                                       |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lesson XP      | `computeLessonXp`          | `base = xpPerLesson` (10) for every completed lesson incl. replays; `perfectBonus = perfectLessonBonusXp` (5) iff `mistakeCount === 0`.                                                                          |
| Perfect        | (in result)                | No incorrect attempt. Skipped speak exercises don't count as mistakes.                                                                                                                                           |
| Accuracy       | (in result)                | `firstTryCorrectCount / (exerciseCount − skippedCount)`; 1 if the denominator is 0.                                                                                                                              |
| XP events      | `deriveXpEvents`           | One `XpEvent` per non-zero breakdown line of a result.                                                                                                                                                           |
| Total XP       | `computeUserProgress`      | Sum of `xpEarned` over all results.                                                                                                                                                                              |
| Hearts         | `loseHearts`               | −`heartsLostPerMistake` (1) per incorrect non-speak answer, clamped at 0. If hearts were full, `refillStartedAt = now`.                                                                                          |
| Heart refill   | `refillHearts`             | `n = floor((now − refillStartedAt) / 4 h)`; `current = min(5, current + n)`; `refillStartedAt += n·4 h`, or `null` when full. Applied lazily on read.                                                            |
| Hearts view    | `viewHearts`               | `nextRefillAt = refillStartedAt + 4 h`; `fullAt = refillStartedAt + (5 − current)·4 h`; `canStartLesson = current > 0`.                                                                                          |
| Daily goal     | `computeDailyGoalProgress` | Sum `xpEarned` of results with `localDate === today`; `reached = earned ≥ goalXp` (10/20/30/50).                                                                                                                 |
| Streak         | `computeStreak`            | From distinct result `localDate`s: `current` = run of consecutive days ending today, or ending yesterday if nothing today yet; 0 otherwise. `longest` = longest run ever. `extendedToday` = today is in the set. |
| Path unlock    | `computePathNodes`         | Course order across units. Completed if a result exists; the first not-completed lesson is available (or `in_progress` if it is the active one); the rest are locked. Completed lessons stay replayable.         |
| Answer → heart | `checkAnswer`              | `heartCost = 1` only for `incorrect` non-speak outcomes.                                                                                                                                                         |

### Streak day boundary: device local timezone

- When a lesson completes, the client stores `localDate = toLocalDate(completedAt,
Intl.DateTimeFormat().resolvedOptions().timeZone)` (format `YYYY-MM-DD`) and the
  `timeZone` itself on the `LessonResult`.
- "Today" is the device's current local date. Streak and daily goal compare
  `localDate` strings only, never UTC instants.
- Consequences (accepted): travelling across timezones can make a day count twice or
  shorten a day; changing the device clock can game the streak. Both are tolerable for
  a habit app without leagues; Phase 2 leagues will use server-side rules.
- Day arithmetic (yesterday/consecutive) must use calendar math on `YYYY-MM-DD`
  (UTC-noon `Date` trick or plain date arithmetic), never `Date` in local time, to stay
  correct over DST changes.

## 8. Answer checking (dev-lessons, `src/features/lessons/checking/`)

Uses `normalizeAnswerText` / `tokenizeAnswer` / `foldDiacritics` from `@/contracts`, the
same functions the content schema uses to verify that answers are buildable.

| Type                  | Correct when                                                                                                                                              | `correctAnswer`     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `multiple_choice`     | `optionId === correctOptionId`                                                                                                                            | correct option text |
| `word_bank_translate` | `normalize(tiles.join(" "))` equals `normalize(a)` for any `a` in `answers` (diacritics matter)                                                           | `answers[0]`        |
| `listen`              | same as word bank                                                                                                                                         | `answers[0]`        |
| `match_pairs`         | every pair matched, each `learningPairId === knownPairId`. Mismatched taps get live feedback only and are not submitted, so match pairs never cost hearts | `null`              |
| `speak`               | `skipped` → outcome `skipped`; else any transcript, `foldDiacritics`-ed, equals `phrase` or an `acceptedTranscripts` entry, folded the same way           | `phrase`            |

## 9. Content

- Layout: `content/courses/<courseId>/course.json` (`CourseSchema`) and
  `content/courses/<courseId>/lessons/<lessonId>.json` (`LessonSchema`).
- Content schemas are strict (unknown keys fail). `src/contracts/__tests__/content.test.ts`
  validates every file in CI and checks cross-file rules: one lesson file per manifest
  entry, matching `courseId`/`unitId`, and (when `CONTENT_REQUIRE_AUDIO=1`, enabled
  once audio exists) that every audio path exists under `public/`.
- `src/lib/content` loads lessons with dynamic `import()` per lesson so each lesson is a
  separate chunk, precached by the service worker. Bump `course.version` on every
  content change.

## 10. PWA and service worker

- **Serwist** (`@serwist/next`) generates the service worker at build time.
  - Precache: app shell, route chunks, course + lesson chunks, icons, `manifest.webmanifest`.
  - Runtime: audio `/audio/**` CacheFirst (cache `audio-v<course.version>`, max 300
    entries); Supabase requests NetworkOnly (sync handles retries, not the SW).
  - Navigation fallback: `/offline` page for routes not precached.
  - Update flow: new SW waits; a toast offers "Update" (skipWaiting + reload). Never
    reload in the middle of a lesson.
- Web app manifest via `src/app/manifest.ts`: name Polyglow, `display: standalone`,
  theme colour from the brand palette, 192/512 and maskable icons.
- Unit 1 audio is warmed into the cache after the first lesson loads (idle callback),
  so the rest of the unit works offline (PRD G3).

## 11. Audio

- **Pre-generated TTS files** in `public/audio/<lang>/<slug>.mp3` (mono, 48 kbps,
  ≤ 50 KB each). Placeholder audio until the TTS licence is decided (PRD Q7). Slow
  playback uses a dedicated `slowSrc` if authored, else `playbackRate =
CONTENT_RULES.slowPlaybackRate` (0.7) with `preservesPitch`.
- One shared `HTMLAudioElement` per lesson, preloaded for the next exercise.
- Sound effects respect `settings.soundEffectsEnabled`; nothing autoplays before a user
  gesture.
- **Speech recognition (speak exercise)** uses `SpeechRecognition`/
  `webkitSpeechRecognition` with `lang = course.learningLanguage`, `maxAlternatives = 5`.
  Speak exercises are hidden when the API is missing, the mic permission is denied, or
  `speakingExercisesEnabled` is false. Always skippable, never costs a heart. Feature
  detection lives in `src/features/lessons`. Note: Chrome's recognition sends audio to
  a server and needs the network; offline it is treated as unsupported.

## 12. Testing strategy

| Layer                 | Tool                           | Expectation                                                                                        |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Contracts and content | Vitest                         | valid + invalid fixtures per schema; all `/content` JSON validated                                 |
| Pure rules            | Vitest                         | table-driven, 100 % branch coverage for checking, XP, streak (DST, gaps), hearts                   |
| Repositories / sync   | Vitest + `fake-indexeddb`      | queue, backoff, idempotency, conflict merge                                                        |
| Components            | Vitest + Testing Library       | role/label queries, keyboard interaction, no snapshot-only tests                                   |
| Flows                 | Playwright (Pixel 7 + desktop) | guest first lesson, wrong answer re-queue, out of hearts, offline lesson + sync, sign-up migration |
| Accessibility         | `@axe-core/playwright`         | no serious/critical violations on each screen (added with the first UI ticket)                     |

Supabase is never called in unit tests; repositories take a client that tests replace
with a fake. Time is injected (`now`) instead of using fake timers where possible.

## 13. Performance budget

Measured on a mobile profile (Lighthouse, Moto G-class, slow 4G). CI enforcement comes
with the PWA ticket; until then the cto checks it in review.

| Metric                                       | Budget                          |
| -------------------------------------------- | ------------------------------- |
| Lighthouse Performance / Accessibility / PWA | ≥ 90 / ≥ 95 / installable       |
| LCP                                          | ≤ 2.5 s                         |
| INP                                          | ≤ 200 ms                        |
| CLS                                          | ≤ 0.1                           |
| First-load JS per route (gzip)               | ≤ 170 KB                        |
| One lesson JSON chunk (gzip)                 | ≤ 15 KB                         |
| One audio clip                               | ≤ 50 KB                         |
| Total precache (shell + Unit 1 content)      | ≤ 3 MB, audio cached at runtime |
| Time from "Check" to feedback                | < 100 ms (pure, synchronous)    |

Rules of thumb: Framer Motion via `LazyMotion` + `m` components; respect
`prefers-reduced-motion`; no third-party scripts; images via `next/image`; no web
fonts until the brand font is self-hosted.

## 14. Analytics (PRD Q5)

Deferred to its own ticket. Default direction: first-party events (`lesson_started`,
`lesson_completed`, `signup`, …) queued through the same sync queue into a Supabase
table, no third-party trackers. A new `SyncQueueRecord` kind will be added via a
contract change when that ticket starts.

## 15. Contract change process

Devs never edit `/src/contracts`. They add an entry to
[contract-requests.md](contract-requests.md); the cto approves or rejects with
reasoning, makes the change on a `chore/` branch, lists every affected feature, and
bumps `CONTRACTS_VERSION` if a synced payload changes incompatibly.
