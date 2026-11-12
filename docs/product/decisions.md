# Product Decision Log

**Owner:** pm · Product decisions are final under the autonomous process in
`ORCHESTRATOR.md` (no owner sign-off needed). Technical decisions live as ADRs in
`docs/architecture/adr/`.

Each entry: ID, date, decision, rationale, alternatives considered, reversibility.

---

## Waiting on owner (non-blocking)

These legal items need the owner. They do **not** block development: we proceed with
mocks or placeholders and swap in the final answer when it arrives.

| Item | Placeholder until decided | Related |
|---|---|---|
| Trademark, domain and social-handle check for "Polyglow" | Use "Polyglow" as the working name; no paid domain or handle registration | PD-001 |
| PRD Q6: minimum age / consent copy | 13+ assumption; placeholder terms and privacy page marked "draft" | PRD §9 |
| PRD Q7: TTS licence for pre-generated audio | Placeholder/mock audio files (or locally generated dev-only audio) not shipped to production | PRD §9 |
| Hosted Supabase project: project URL and anon key, Google OAuth client (id/secret), SMTP sender for auth emails, production site URL and redirect URLs (`/auth/callback`, `/reset-password`), email confirmation setting matching PD-023 | v0.4.0 is built and tested against the in-memory **demo backend** and the local Supabase CLI stack. Production builds without credentials run in `off` mode (guest only, no account entry points). Going live = setting env vars, no code change | PD-022 |

---

## PD-001: App name Polyglow, mascot Lumi, brand palette

- **Date:** 2026-11-07
- **Decision:** The app is named **Polyglow**. The mascot is **Lumi**, a small round
  paper lantern whose glow reflects the learner's streak and progress. Brand palette:
  **midnight indigo + amber/gold**, with a warm off-white background. Functional
  correct/incorrect lesson colours are chosen separately for WCAG AA contrast and are not
  brand colours. MVP uses static mascot poses only (idle, happy, dim/ember, celebrating).
- **Rationale:** Name and mascot tell one story ("learning makes you glow") and tie
  directly to the streak and daily-goal mechanics. Not an animal or bird, and no
  green-led palette, so it is clearly distinct from existing language apps. The name is
  not Spanish-specific, so it works for future courses. Recommended option in
  `branding-proposals.md`.
- **Alternatives considered:** Names "Wordsprout" (pulls visuals toward green, longer)
  and "Tandu" (invented, but says nothing about language learning). Mascot "Mo, the
  hermit crab" (fun, but less tied to the name and in a crowded animal-mascot space).
- **Reversibility:** Medium. The name is a working name until the owner's trademark,
  domain and handle check (see "Waiting on owner"). Keep the name in a single config or
  copy constant so a rename is a small change; avoid ordering printed or paid brand
  assets until the check is done. Mascot and palette are easy to revise before launch.

## PD-002: MVP scope

- **Date:** 2026-11-07
- **Decision:**
  - One course: English speakers learning Spanish (`en` → `es`), **neutral Latin American
    Spanish** (ustedes, no vosotros).
  - **1 unit × 5 lessons**, about 10–12 exercises each, all original content.
  - Exercise types as in PRD §6.1: multiple choice, translate (word bank), match pairs,
    listen, and speak (optional, always skippable, never costs a heart, hidden where
    unsupported).
  - Lesson flow, XP, daily goal, streak, hearts, guest mode, auth, profile, PWA and
    basic offline as in PRD §6.1.
  - **Leagues and leaderboards are Phase 2.**
- **Rationale:** Spanish has the largest pool of English-speaking learners and a simple
  script, keeping exercise UIs simple. One unit is enough to validate the core habit loop
  (lesson → XP → streak → return) before investing in more content. Leagues need a
  meaningful number of concurrent users plus moderation and anti-cheat work, so they
  wait until the loop is proven.
- **Alternatives considered:** Starting with French or another language (smaller
  audience); Peninsular Spanish (vosotros, less useful for most US learners); shipping
  2–3 units (more content work before any validation); including leagues in MVP (high
  effort, weak with few users).
- **Reversibility:** High. Scope can grow milestone by milestone through the roadmap;
  content is data in `/content/` and new units or courses are additive.

## PD-003: Defaults for PRD Q2 (game values) and Q3 (guest hearts)

- **Date:** 2026-11-07
- **Decision:**
  - **Q2:** 10 XP per completed lesson, +5 XP bonus for a perfect lesson (no wrong
    answers); 5 hearts maximum, 1 heart refills every 4 hours; daily goal options
    10 / 20 / 30 / 50 XP per day. Values live in contracts/config (CTO), not hard-coded
    in features, so the pm can tune them.
  - **Q3:** Guests lose hearts under the same rules as signed-in users.
- **Rationale:** Simple round numbers are easy to explain on the results screen and to
  test. A 4-hour refill lets a learner do a few lessons per day without monetization.
  Same rules for guests keep one code path and mean converting to an account never
  changes how the game feels.
- **Alternatives considered:** Variable XP by exercise count or accuracy (harder to
  explain, deferred); unlimited hearts for guests (would make sign-up feel like a
  penalty and adds a separate code path); 30-minute refills (removes the hearts
  mechanic's meaning).
- **Reversibility:** High. Config values can be changed at any time; revisit after the
  first retention and daily-goal-hit-rate data.

## PD-004: Roadmap milestones and early-start rule

- **Date:** 2026-11-07
- **Decision:** `ROADMAP.md` defines milestones after the Phase 1 architecture tickets
  (CTO-002..004): **v0.1.0** MVP foundation, **v0.2.0** first playable lesson, **v0.3.0**
  gamification loop, **v0.4.0** accounts and sync, **v1.0.0** launch polish, then Phase 2
  placeholders. Tickets are written one or two milestones ahead (v0.1.0 and v0.2.0 now).
  A ticket from the next milestone may be **started early** when its dependencies are
  merged (e.g. LES-001, LES-004..006, GAM-002 during v0.1.0), but it still ships in its own
  milestone's release. Analytics events (PLT-019) land in v1.0.0, before launch, because
  the success metrics are measured from launch.
- **Rationale:** v0.1.0 is mostly platform work; early start keeps dev-lessons and
  dev-gamification busy without blurring what each release contains. Guest play before
  accounts serves G1 (first lesson within 2 minutes, no account).
- **Alternatives considered:** auth in v0.1.0 (delays the first playable lesson, the
  thing we most need to validate); one big MVP milestone (no intermediate releases).
- **Reversibility:** High. Tickets can move between milestones.

## PD-005: MVP bottom navigation is Learn + Profile only

- **Date:** 2026-11-07
- **Decision:** The bottom navigation has two tabs, Learn and Profile. No Leaderboard tab
  until leagues ship (Phase 2).
- **Rationale:** An empty or "coming soon" tab is a dead end and breaks the "always
  forward" principle. Leagues are Phase 2 (PD-002).
- **Alternatives considered:** a disabled Leaderboard tab as a teaser.
- **Reversibility:** High. Adding a tab later is small.

## PD-006: Speak exercise and lesson tip move to v1.0.0

- **Date:** 2026-11-07
- **Decision:** v0.2.0 "all MVP exercise types" means multiple choice, translate (word
  bank), match pairs and listen. The Speak exercise (P2, optional, browser-dependent) is
  LES-011 and the tip card (P2) is LES-013, both in v1.0.0. Either may slip to Phase 2
  without blocking the launch. The lesson player skips unsupported types, so content can
  contain speak exercises before the component exists.
- **Rationale:** Speak is optional in the PRD, works only in some browsers and needs
  microphone permission flows; it shouldn't hold back the first playable lesson.
- **Alternatives considered:** Speak in v0.2.0 (larger milestone, more risk).
- **Reversibility:** High.

## PD-007: Listen exercise audio fallback

- **Date:** 2026-11-07
- **Decision:** Listen exercises play the pre-generated audio file. If it is missing or
  fails, they use the browser's speech synthesis with a Spanish voice. If no Spanish voice
  exists, the learner sees "Audio isn't available right now." and can skip; a skipped
  exercise is not wrong, not re-queued and not counted in accuracy or the perfect bonus.
- **Rationale:** The TTS licence is waiting on the owner (PRD Q7). This lets us ship and
  test listening now without shipping unlicensed audio, and nobody loses hearts because of
  missing audio.
- **Alternatives considered:** hide listen exercises until audio exists (removes a P0
  exercise type); dev-only audio (doesn't work for real users).
- **Reversibility:** High. Once licensed audio exists, the fallback just stops being used.

## PD-008: XP calculation ships in v0.2.0; replays earn full XP

- **Date:** 2026-11-07
- **Decision:** The pure `calculateXp` (GAM-002) is part of v0.2.0 so the results screen
  shows real XP. Storing totals and today's XP stays in v0.3.0. Replaying a completed
  lesson earns the same XP as the first time (base + perfect bonus).
- **Rationale:** A results screen without XP would test poorly and later need rework.
  Replays earning XP supports US-GAM-14 and lets learners reach their daily goal with only
  5 lessons of content.
- **Alternatives considered:** reduced XP for replays (more rules to explain; revisit if
  daily-goal data shows farming).
- **Reversibility:** High (config/logic change).

## PD-009: Temporary lesson list in v0.2.0, all lessons unlocked

- **Date:** 2026-11-07
- **Decision:** In v0.2.0, Learn shows a simple list of the 5 Unit 1 lessons, all
  playable. The skill path with locked/available states and in-order unlocking (GAM-008)
  replaces it in v0.3.0.
- **Rationale:** Keeps v0.2.0 focused on the lesson engine and lets us test every lesson.
- **Alternatives considered:** building the path in v0.2.0 (couples two milestones).
- **Reversibility:** High.

## PD-010: Answer matching rules

- **Date:** 2026-11-07
- **Decision:** Answers are compared ignoring case, extra whitespace and punctuation
  (including `¡ ¿`). Accents and `ñ` are significant. Any accepted answer listed in the
  content counts. No typo tolerance in MVP.
- **Rationale:** MVP answers are built from tiles, so accents are always typed correctly
  by the tiles themselves; ignoring them would only hide content bugs. Ignoring
  punctuation avoids unfair failures.
- **Alternatives considered:** accent-insensitive matching (revisit in Phase 2 with typed
  answers).
- **Reversibility:** High (pure function).

## PD-011: No "I already have an account" in onboarding until v0.4.0

- **Date:** 2026-11-07
- **Decision:** Onboarding has no log-in entry point until accounts exist (PLT-018,
  v0.4.0).
- **Rationale:** A link to a feature that doesn't exist yet is a dead end.
- **Alternatives considered:** a disabled link with "coming soon".
- **Reversibility:** High.

## PD-012: Lesson scoring rules

- **Date:** 2026-11-07
- **Decision:**
  - A wrong answer re-queues the exercise at the end of the lesson; it comes back until
    answered correctly. The progress bar advances only on correct answers.
  - **Mistakes** = number of wrong "Check" results, plus 1 for each match-pairs exercise
    with at least one mismatch.
  - **Accuracy** = exercises correct on the first try ÷ counted exercises, rounded to a
    whole percent. Match pairs count as first-try correct only with zero mismatches.
    Skipped and unsupported exercises are not counted.
  - **Perfect lesson** = 0 mistakes and at least 1 counted exercise.
  - Match pairs are never re-queued, and from v0.3.0 cost **at most 1 heart** per
    exercise, however many mismatches.
- **Rationale:** Simple rules that the results screen can explain; capping match-pairs
  heart loss avoids losing several hearts to one quick mis-tap.
- **Alternatives considered:** a heart per mismatch (too punishing); re-queueing match
  pairs (repetitive).
- **Reversibility:** High.

## PD-013: Numbers 1–3 are taught in "At the Café"

- **Date:** 2026-11-07
- **Decision:** Lesson 3 "At the Café" introduces `un / uno`, `dos`, `tres` (ordering one,
  two or three items). Lesson 4 "Count It" introduces `cuatro`…`diez` and `¿cuántos?`, and
  reviews 1–3, so the unit still covers numbers 1 to 10. Every lesson introduces 8 new
  items (CON-001 Vocabulary appendix).
- **Rationale:** 10 numbers plus "how many" is 11 new words in one lesson, above
  CON-001's limit of 5–8 new items per lesson. Ordering at a café is a natural first use
  of small numbers, and spreading them makes "Count It" a review-and-extend lesson.
- **Alternatives considered:** numbers 1–5 only in "Count It" (leaves 6–10 for Unit 2,
  breaking the PRD theme "numbers 1 to 10"); raising the per-lesson limit (longer, harder
  lesson for beginners).
- **Reversibility:** High (content only; exercise ids stay stable).

## PD-014: Slow audio plays at 0.7×

- **Date:** 2026-11-07
- **Decision:** The listen exercise's "Slow" button plays at **0.7×**, the value already in
  `CONTENT_RULES.slowPlaybackRate`. The same constant is the speech-synthesis rate for
  "Slow". LES-007 criterion 4 and its UX badge now say 0.7×; the planned contract change
  to 0.75 is **not** needed.
- **Rationale:** 0.7× is clearly slower for beginners while staying natural with
  `preservesPitch`, it matches the speech-synthesis fallback rate LES-007 criterion 6
  already used, and it avoids a contract change. One value in one place.
- **Alternatives considered:** 0.75× (barely distinguishable from normal on short
  phrases); 0.5× (sounds distorted).
- **Reversibility:** High (one constant, via a contract request).

## PD-015: Dark-first theme is the product default; light is available

- **Date:** 2026-11-07
- **Decision:** Polyglow ships with the **dark** theme (midnight indigo canvas, warm
  off-white text, amber accents) as the default, as in ADR-004. The **light** theme (warm
  off-white canvas) stays fully supported by the tokens and becomes a learner choice in
  Settings ("Appearance: Dark / Light", PLT-017, v0.4.0). MVP does not follow the OS
  colour-scheme setting automatically. Every ticket's contrast criteria apply to both
  themes. UX notes in earlier tickets that say "warm off-white background" or "white
  cards" mean the semantic `canvas` / `surface` tokens, not a fixed light theme; PLT-001's
  "Dark mode" out-of-scope line is superseded.
- **Rationale:** the lantern-and-glow identity (PD-001) reads best on midnight indigo,
  and the tokens already pass AA in both themes (tested in CI), so offering light costs
  only a setting.
- **Alternatives considered:** light by default (closer to the first UX notes, weaker
  brand); following `prefers-color-scheme` (fine later, but makes screenshots and QA
  depend on device settings during MVP).
- **Reversibility:** High (one attribute in the root layout).

## PD-016: Lumi is a shared mascot component

- **Date:** 2026-11-07
- **Decision:** Lumi lives in `src/components/ui/` (`Lumi.tsx`, `lumi-poses.tsx`) and is
  imported as `import { Lumi } from "@/components/ui"` by every feature, as the cto placed
  it in the GAM-001 review. It stays purely presentational (pose, size, label). Logic that
  chooses a pose (e.g. streak → pose, GAM-009) lives in the feature that owns the rule,
  mainly `src/features/gamification`. New poses or artwork changes are still
  dev-gamification work and need pm review for originality and brand fit.
- **Rationale:** platform (onboarding, offline, empty states), lessons (results,
  out of hearts) and gamification all show Lumi; a shared primitive avoids every feature
  importing another feature's internals.
- **Alternatives considered:** keeping Lumi in the gamification feature (forces lessons
  and platform to depend on gamification for an image).
- **Reversibility:** High.

## PD-017: v0.3.0 builds on the GAM-002 rules; PLT-009 composes the screens

- **Date:** 2026-11-07
- **Decision:**
  - GAM-002 already shipped the pure streak, hearts and daily-goal rules with DST and
    timezone tests. v0.3.0 does not rebuild them: **GAM-004** becomes "Streak status and
    `useStreak` hook" (`none` / `extended` / `at_risk` / `broken`, shared by the top bar,
    Lumi and the results screen) and **GAM-005** becomes "Hearts state, lose-hearts
    mutation and hearts meter".
  - A new small ticket **PLT-009** (dev-platform) mounts the gamification, path and
    lessons components in the Learn and lesson routes, removes the temporary list, guards
    locked deep links and adds the loop e2e tests. Feature tickets export components and
    never edit `src/app`.
- **Rationale:** avoids duplicate work, and keeps every agent in its own folder
  (CLAUDE.md "Stay in your lane") while the screens still get integrated and tested.
- **Alternatives considered:** letting dev-gamification edit the Learn route (breaks
  ownership); folding the mounting into GAM-008 (same problem).
- **Reversibility:** High.

## PD-018: Hearts and path edge cases

- **Date:** 2026-11-07
- **Decision:**
  - When the last heart is lost, the learner first sees the feedback with the correct
    answer, then the out-of-hearts screen. This applies even when it happens on the last
    exercise of the lesson (out of hearts wins over completed): no result, no XP, no
    streak (matches the LES-002 reducer).
  - A heart that refills while a lesson is running is not added to that lesson; it shows
    on Learn afterwards.
  - A lesson that can't start because of 0 hearts, whether from the path or a URL, shows
    when the next heart arrives and nothing else (no practice-mode or purchase promises).
  - Opening a locked lesson's URL redirects to Learn.
  - The `in_progress` path state is implemented and tested, but in MVP no node shows it
    on Learn: lessons are full-screen and unfinished lessons are not saved (PRD non-goal).
    It becomes visible if "resume lesson" is ever added.
- **Rationale:** consistent, simple rules that the screens can explain; no dead ends;
  the in-lesson counter stays predictable.
- **Alternatives considered:** completing the lesson when the last heart goes on the
  final exercise (rewards the mistake and contradicts "hearts create stakes"); adding
  refilled hearts mid-lesson (confusing jumps in the header).
- **Reversibility:** High.

## PD-019: MVP multiple-choice prompts are in the known language, options in the learning language

- **Date:** 2026-11-08
- **Decision:** In MVP every `multiple_choice` exercise has its prompt in the known
  language (English, "Which one means '<word>'?") and all options in the learning
  language (Spanish). Spanish → English recognition is practised with
  `word_bank_translate` `to_known`, `match_pairs` and `listen`, never with a reversed
  multiple choice. CON-002 rewrote the 7 Unit 1 exercises that broke this rule; future
  content (CON-004, Phase 2 units) follows it and the pm checks it in content review.
- **Rationale:** the contract has no per-exercise or per-option language field, so
  LES-004 marks the prompt `lang={knownLanguage}` and the options
  `lang={learningLanguage}`. Mixed directions made screen readers pronounce words in the
  wrong language (accessibility, PRD quality bar). One fixed direction needs no contract
  change, keeps the UI simple, and the reverse direction is already covered by other
  exercise types.
- **Alternatives considered:** a `direction` field on multiple choice (contract change,
  more UI states, not needed for Unit 1); per-option `lang` (more authoring work, easy to
  get wrong).
- **Reversibility:** High. If a later unit needs English options, raise a contract
  request for a `direction` field; existing content stays valid.

## PD-020: v0.1.0 / v0.2.0 acceptance outcomes

- **Date:** 2026-11-08
- **Decision** (the multiple-choice direction rule is PD-019, logged with CON-002):
  - **Vocabulary rule (CON-001 criterion 4):** proper nouns (people's and country names),
    regular plurals of taught nouns, and words that appeared inside a taught phrase ("y"
    from "¿y tú?") count as allowed. They are not new vocabulary.
  - **Results screen wiring:** PLT-008 mounts the merged LES-008 `ResultsScreen` in the
    lesson route. LES-008's e2e (criterion 12) is enabled after PLT-007 and PLT-008 merge.
    Until then LES-008 is "accepted with 1 deferred criterion".
  - **Manifest background colour:** stays warm off-white for v0.1.0, as PLT-002 criterion 1
    says. We revisit it with the appearance setting (PLT-017).
  - **Unverifiable manual checks** (PLT-002 criterion 8, DevTools installability) are
    accepted on code evidence. The cto records the manual check in the release PR.
- **Rationale:** each remaining step has one owner, content review uses one clear rule, and
  no release waits on checks agents can't run.
- **Alternatives considered:** adding ResultsScreen wiring to PLT-007 instead (PLT-008
  already needs it for its criterion 6); failing PLT-002 criterion 8 until a human runs
  DevTools (it would block the release for a check that only happens at release time).
- **Reversibility:** High.

## PD-021: Release acceptance answers (celebration copy, hearts read errors, schema bump)

- **Date:** 2026-11-12
- **Decision:**
  1. **LES-010 streak copy.** When a lesson extends the streak and the new streak is 1
     day (first lesson ever, **or** the first lesson after a broken streak), the row says
     "Streak started!" and "1 day". From 2 days on it says "Streak extended!". When that
     same lesson also newly reaches the daily goal, the single banner says **"Streak
     started and daily goal reached!"** (or "Streak extended and daily goal reached!" from
     day 2). This amends LES-010 criteria 4 and 6, which only named the first-ever case
     and the "extended" wording. The merged `celebrationText` already does this.
  2. **Hearts read error = full hearts, everywhere.** If the stored hearts can't be read,
     every consumer treats the learner as having full hearts. That was already the rule
     for GAM-005 and LES-009 criterion 16. It now also applies to GAM-003's
     `useProgressInputs` / `useUserProgress`: a hearts failure alone no longer makes
     `status: "error"`. The hook returns `success` with `hearts = createFullHearts(now)`
     and logs a warning. `status: "error"` stays for a **results** read failure (GAM-003
     criterion 11), where callers already have fallbacks. Recorded as new GAM-003
     criterion 15, for dev-gamification in v0.3.0.
  3. **PLT-008 criterion 9 (Dexie version bump) amended.** Bump the Dexie version only
     when the stores change. PLT-003's v1 schema already had `lessonResults` and
     `syncQueue` with the needed indexes, so no migration is needed. What the criterion
     protects is that no PLT-003 guest profile is lost, and a unit test covers that.
- **Rationale:**
  1. "Streak extended!" on day 1 reads as wrong to a learner who just lost a streak or has
     never had one. One combined banner keeps the screen within 375 × 667 (LES-010
     criterion 12).
  2. Hearts are a side input to progress. If a hearts read error turned into
     `status: "error"`, it would blank the learner's XP, streak and daily goal in the top
     bar, on the path and on the results screen (LES-010 criterion 10 would show "–" for
     the streak) because of an unrelated storage hiccup. "No dead ends" (PD-018) and one
     rule for every consumer is simpler and kinder. The risk is that a learner plays with
     hearts they don't have, which is acceptable for a rare storage failure on a guest
     device.
  3. A no-op `version(2)` adds a migration path to test and gives the learner nothing.
- **Alternatives considered:** separate error states per consumer for hearts (more UI
  states, inconsistent); "Streak extended!" for every extension (inaccurate on day 1);
  two banners when both events happen (too tall at 375 px); requiring the no-op Dexie
  bump (process over outcome).
- **Reversibility:** High. All three are copy or hook-level choices, with no contract or
  data change.

## PD-022: Accounts are built against a demo backend; a hosted Supabase project is a config switch

- **Date:** 2026-11-12
- **Decision:**
  - There is no hosted Supabase project yet (waiting on the owner). v0.4.0 is built so
    that nothing waits for it. The app reaches the backend only through a **backend
    gateway** interface (auth + data + the migrate RPC, defined by the cto, CTO-007), with
    three modes picked from public env vars (PLT-010 criterion 1):
    - **`supabase`**: the real supabase-js client, when the URL and anon key are set.
    - **`demo`**: an in-memory fake that follows ADR-003's rules (insert-or-ignore
      results, stale-update skip, earliest `joined_at`, server cursor, per-user
      isolation, guest-migration merge), kept in `localStorage` so it survives reloads.
      Used for unit tests, e2e, local dev and preview builds, when
      `NEXT_PUBLIC_DEMO_BACKEND=1`.
    - **`off`**: no backend. Guest only, exactly the v0.3.0 behaviour, with no "Create
      account" or "Log in" anywhere.
  - Demo mode is labelled on every auth screen ("Demo mode: accounts are stored on this
    device only.").
  - **Production builds without credentials ship in `off` mode.** Real learners never
    create a demo account that can't sync. v0.4.0 can be released and accepted on demo
    mode. Turning accounts on for real users only means setting the env vars and
    re-running the e2e suite against the hosted project (a release-checklist item, not a
    ticket).
  - The shared behaviour suites (PLT-010 criterion 19, PLT-014 criterion 16) also run
    against a local `supabase start` stack when its env vars are present. This keeps
    the demo backend honest.
- **Rationale:** "The team never waits for the owner" (CLAUDE.md rule 9). A gateway with
  a fake is also what ARCHITECTURE §12 asks for ("Supabase is never called in unit
  tests"). Hiding accounts in `off` mode avoids a fake account system in front of real
  users, which would break the promise "your progress is safe".
- **Alternatives considered:** waiting for the hosted project (blocks the milestone);
  shipping the demo backend to production (accounts that don't work across devices);
  mocking supabase-js at the HTTP level with MSW (couples tests to PostgREST details and
  doesn't help e2e or previews); a hosted free-tier project created by an agent (needs
  owner credentials and billing ownership).
- **Reversibility:** High. The mode is configuration. The demo backend stays useful for
  tests after the hosted project exists.

## PD-023: v0.4.0 scope and ticket shape

- **Date:** 2026-11-12
- **Decision:**
  - **Auth methods:** email + password and Google, as the PRD says (§6.1). No magic link
    in MVP (Phase 2 candidate). Passwords are 8–72 characters (matches
    `minimum_password_length` in `supabase/config.toml`).
  - **No email confirmation before use** in MVP: sign-up signs the learner in at once.
    The hosted project must set confirmations off to match. Revisit with the draft terms
    and privacy pages (PLT-020, v1.0.0) before launch.
  - Log-in and reset errors never reveal whether an email has an account. Sign-up does
    say "already exists" (the learner needs that to recover).
  - **PLT-010** is retitled "Backend gateway, demo backend, email sign-up and log-in,
    session". The full **log out** (final sync, unsynced warning, data wipe) moves to
    **PLT-017** with the rest of the account section. The gateway's `signOut` stays in
    PLT-010.
  - **PLT-015** is retitled "Sync status in the offline indicator, reconnect flow and
    Unit 1 audio warm-up", because Unit 1 lessons are already precached (PLT-007
    criterion 7).
  - **PLT-016** also moves identity/profile/settings reads from Zustand to TanStack Query
    (ARCHITECTURE §5 deviation retired).
  - **CTO-007** (cto, proposed ID) defines the gateway interfaces, the env vars in
    `.env.example`, and the CI env for demo mode before PLT-010 starts.
- **Rationale:** each ticket fits one focused session, and every ticket can be tested
  without a hosted project. Moving log out next to the account section keeps all the
  "data leaves the device" rules in one place. Magic links need deep-link handling in an
  installed PWA, which is more risk than value for MVP.
- **Alternatives considered:** magic link as the only email method (PWA deep-link
  issues, the PRD says password); required email confirmation (adds a step between the
  first lesson and a saved account, which hurts the ≥ 25 % conversion metric); a separate
  log-out ticket (no reserved ID; it belongs with Settings).
- **Reversibility:** High. Confirmation and magic link are configuration plus a screen.

## PD-024: Guest → account handover always merges, never asks

- **Date:** 2026-11-12
- **Decision:**
  - Every sign-in path (email, Google, password reset) runs the same handover (PLT-013).
    A guest who finished onboarding is migrated with `migrate_guest_to_account`, whether
    the account is new or already exists. Lesson results are unioned. Profile, settings
    and hearts follow "newer `updatedAt` wins", and the join date is the earliest.
  - A guest who never finished onboarding has nothing worth migrating (and no valid
    `Settings` for the payload). The device simply adopts the account and pulls
    (PLT-018).
  - Guest data is deleted only after the server confirmed the migration. A failed
    handover leaves the learner signed in on a guest device, and it retries on the next
    start or reconnect.
  - The profile keeps the guest's name and initials avatar. We don't import the Google
    name or photo.
- **Rationale:** a union never loses a finished lesson (PRD principle "offline is
  normal: never lose a finished lesson"). Asking "keep this device's or the account's
  progress?" is a hard question for a beginner and can only lose data. Not importing
  Google profile data keeps the privacy story simple.
- **Alternatives considered:** a choice dialog on conflict; migrating only into new
  accounts (an existing user's lessons finished as a guest would be lost); importing the
  Google name (personal data we don't need yet).
- **Reversibility:** Medium. Merged data can't be un-merged, but the rule only adds.

## PD-025: When the "Save your progress" prompt appears

- **Date:** 2026-11-12
- **Decision:** the prompt shows on Learn after a guest returns from a completed lesson,
  at most once per local day and at most 3 times in total. It only shows when accounts
  are enabled and the device is online. "Not now", Escape and close all count as a
  dismissal. A permanent, non-interrupting card on Profile and the Settings account
  section offer the same choice at any time.
- **Rationale:** the PRD asks for the prompt "after the first completed lesson" (US-PLT-04)
  and targets ≥ 25 % conversion within 7 days. Up to three asks on different days covers
  that window without nagging. It is shown on Learn, not on the results screen, so the
  celebration (LES-010) isn't interrupted and dev-lessons' screen doesn't change. Offline
  it would lead straight to a disabled form.
- **Alternatives considered:** after every lesson (nagging); only once (low conversion);
  inside the results screen (competes with the streak and goal celebration).
- **Reversibility:** High. The counters and limits are constants. Tune them with
  PLT-019 analytics.

## PD-026: Settings in v0.4.0: daily goal, appearance, account

- **Date:** 2026-11-12
- **Decision:** `/settings` opens from a gear on Profile (the bottom navigation stays
  Learn + Profile, PD-005). In v0.4.0 it holds: daily goal, appearance (dark/light),
  account (email + log out, or create account / log in for guests). The **sound effects**
  and **speaking exercises** toggles ship with the features they control (LES-012 and
  LES-011, v1.0.0). The stored `Settings` fields already exist, so no contract change is
  needed. **Editing the name and avatar** (US-PLT-11, P2) is a new ticket **PLT-024** in
  v1.0.0, which may slip to Phase 2.
- **Rationale:** a switch that changes nothing is a broken promise ("always forward", no
  dead ends). Name editing is P2 and needs preset avatar artwork that doesn't exist yet.
- **Alternatives considered:** showing all PRD toggles now (two of them inert until
  v1.0.0); settings as a section inside Profile (a long page at 375 px, mixes stats and
  controls).
- **Reversibility:** High.

## PD-027: Appearance is a device preference

- **Date:** 2026-11-12
- **Decision:** the Dark / Light choice (PD-015) is stored on the device
  (`localStorage`). It is applied before the first paint, works for guests and offline,
  isn't synced, and is kept on log out. The manifest background colour stays as decided
  in PD-020.
- **Rationale:** `Settings` has no theme field. Syncing it would need a contract change,
  a Supabase migration and a `CONTRACTS_VERSION` discussion for a cosmetic value.
  Different devices can reasonably have different themes (e.g. phone dark, laptop light).
- **Alternatives considered:** adding `appearance` to `Settings` (contract + migration
  work for little value); following `prefers-color-scheme` (rejected in PD-015 for MVP).
- **Reversibility:** High. It can move into `Settings` later with a contract request.

## PD-028: Log-out rules

- **Date:** 2026-11-12
- **Decision:** log out makes one sync attempt first (up to 10 s). If lesson results are
  still unsynced, a dialog names how many and lets the learner stay logged in (default)
  or log out anyway. Logging out deletes every piece of learner data on the device and
  starts a fresh guest at the onboarding welcome screen. Device preferences (theme,
  install-prompt dismissal) stay. Log out works offline.
- **Rationale:** US-PLT-09 is about shared devices: the next person must not see the
  previous learner's data. A warning with a count makes the only way to lose data an
  informed choice.
- **Alternatives considered:** keeping the data as a guest after log out (leaks the
  account's progress on a shared device); blocking log out while offline (traps a
  learner on a shared device).
- **Reversibility:** High.

## PD-029: A daily goal change applies to today immediately

- **Date:** 2026-11-12
- **Decision:** changing the daily goal in Settings takes effect for the current local
  day at once. The goal ring and the results screen recompute "reached" with the new
  goal, so it can become reached or not reached. The XP earned and the streak never
  change, because the streak depends only on completed lessons (PRD §6.1).
- **Rationale:** the goal is derived state (ARCHITECTURE §4.2). Storing the goal per day
  would add a new synced fact for an edge case. Lowering the goal to "reach" it is
  harmless: the streak doesn't depend on it.
- **Alternatives considered:** applying the change from tomorrow (needs a per-day goal
  history); freezing "reached" once reached today (more state, inconsistent with the
  ring).
- **Reversibility:** High.
