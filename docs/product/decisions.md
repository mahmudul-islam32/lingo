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
| Native-speaker review of German content (A1 and A2) | pm self-review against CDS-1…13 (A2: CDS-1…19); "needs native review" lists kept in CON-DE-A1-QA and CON-DE-A2-QA | PD-038, PD-047 |
| Legal check of mentioning exam names in marketing | No exam brand names in the app or store copy | PD-035 |
| Hosted Supabase project and a public URL / domain | Guest mode only; v0.6.0 and everything that needs a server or a public link waits | PD-054, PD-071 |
| Whether to charge at all; payment provider, legal set-up (Impressum, privacy, terms, withdrawal, cancel button), VAT, price approval | Free, no ads, no payments; no paywall, entitlement or price in the app | PD-072 |

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

_PD-022 to PD-029 are not used: the German track starts at PD-030 so its decisions stay
together._

## PD-030: Pivot: German is the primary course; Spanish is kept but hidden

- **Date:** 2026-11-12
- **Decision:**
  1. On the owner's direction, **English → German (course id `en-de`)** is Polyglow's
     primary course and the current top priority. We build German from **A1 to C1**,
     starting with A1 (`curriculum-german.md`, `market-analysis-german.md`).
  2. **CEFR levels are the top of the path hierarchy:** Course → Level (A1, A2, B1, B2, C1)
     → Unit → Lesson. Levels without content yet are shown as "Coming soon" (GAM-010). The
     cto chooses the contract shape (CTO-008).
  3. **The Spanish course (`en-es`) is kept, not deleted.** It is **hidden** from onboarding:
     the course step lists only available courses (German), followed by the existing
     "More languages coming soon" line. Spanish isn't mentioned by name. Content files,
     tests and lesson routes for `en-es` stay. A guest whose settings already say `en-es`
     keeps playing Spanish with all their progress (PLT-024). No Spanish units are added
     until the German track reaches its milestones (Spanish units 2–5 move from Phase 2 to
     "later").
  4. **`en-de` becomes the default course** (`DEFAULT_COURSE_ID`, CTO-008).
  5. PRD personas and §3 now refer to German (PRD updated with a pointer to this entry).
- **Rationale:** the owner changed direction. German has a large, motivated, often
  deadline-driven adult audience (visas, jobs, study) for whom CEFR levels are the product,
  so a level-based path fits better than a flat list of units. Keeping Spanish costs nothing,
  protects existing test users' progress and keeps a second course in the codebase, which
  keeps the multi-course code honest. Deleting it would throw away accepted work (CON-001,
  CON-002).
- **Alternatives considered:** delete Spanish (irreversible, breaks existing guests); show
  Spanish as a selectable second course (splits attention and QA, invites "why so little
  content?"); a disabled "Spanish: coming later" card (a dead end in onboarding, PD-005
  reasoning); levels as plain unit titles without a level layer (can't show "Coming soon"
  levels or level progress).
- **Reversibility:** High. Unhiding Spanish is a registry flag; content is additive.

## PD-031: Launch market and first known language: English → German

- **Date:** 2026-11-12
- **Decision:** The first German course is **for English speakers (`en-de`)**. The launch
  market is English-speaking adults moving to or newly arrived in Germany (first India and
  other English-proficient source countries, and expats inside Germany), with US/UK hobby
  and heritage learners second (`market-analysis-german.md` §8). Recommended Phase 2 known
  languages, in order: **Ukrainian (`uk-de`), Arabic (`ar-de`, needs RTL), Turkish
  (`tr-de`), Spanish (`es-de`)**. Each needs UI localisation first.
- **Rationale:** English is the shared language of the most addressable digital,
  pre-arrival segments, and the UI is English only. One known language keeps the content
  pipeline simple while we scale to C1. The largest in-country groups are best served in
  their own language, which needs localisation work we haven't done.
- **Alternatives considered:** Ukrainian or Arabic first (bigger in-country need, but needs
  UI localisation, and RTL for Arabic, before any lesson ships); several known languages at
  once (multiplies content work).
- **Reversibility:** Medium. Adding known languages is additive. The order of Phase 2
  languages is revisited with post-launch data.

## PD-032: German variant and register

- **Date:** 2026-11-12
- **Decision:** Content uses **standard German as used in Germany** (`de-DE`), current
  official spelling with `ß`. Both **`du` and `Sie` are taught from Unit 1**: `Sie` in
  service and official scenarios (bakery staff, doctor, registration office, landlord),
  `du` among classmates, friends and family. English prompts mark the register where it
  matters ("(formal)", "(to a friend)"). Austrian and Swiss words and variants are not
  taught at A1. Notes for them are a Phase 2 idea, and C1 includes awareness of the variants.
- **Rationale:** most of our target learners move to Germany, and exams accept standard
  German. Learners need `Sie` from day one for appointments and offices, and `du` socially.
- **Alternatives considered:** `du` only at A1 (easier, but leaves learners unprepared for
  offices and doctors); a pluricentric mix (confusing for beginners).
- **Reversibility:** High (content).

## PD-033: German answer matching: umlauts and ß count, case doesn't

- **Date:** 2026-11-12
- **Decision:**
  1. **`ä ö ü ß` are significant** in tile and listen answers: `schon ≠ schön`, `Straße ≠
     Strasse`. No `ss → ß` or `ae → ä` folding in the shared normalisation. Tiles always
     carry the correct spelling, so learners can't get it wrong by typing.
  2. **Capitalisation stays ignored** (PD-010 unchanged). Noun capitalisation is taught
     through tiles shown in their authored case (nouns capitalised) and the canonical answer
     in the feedback panel. Consequence: content never offers `sie` and `Sie` in the same
     tile set (PD-037).
  3. **Typed answers (Phase 2):** `ss` is accepted for `ß` and `ae / oe / ue` for `ä / ö /
     ü`, as correct with a spelling note ("In German this is written 'Straße'"). A lowercase
     noun is accepted with a note. These rules apply only to typed answers and need a
     checker change at that time.
  4. **Speech** (LES-011) stays diacritic-insensitive (`foldDiacritics`), as now.
- **Rationale:** the normalisation is shared by schema validation and answer checking, so
  folding `ß` there would let content bugs through and change the meaning of minimal pairs.
  Case-sensitive tile matching would add no learning value (tiles fix the case) and would
  fail learners on sentence-initial words. Lenient typed input respects learners without a
  German keyboard and Swiss usage (`ss`).
- **Alternatives considered:** case-sensitive matching for German (fails on sentence starts,
  needs a per-course rule); accepting `ss` for `ß` everywhere (hides content bugs).
- **Reversibility:** High (pure function, Phase 2 rules not built yet).

## PD-034: German audio voice and fallback

- **Date:** 2026-11-12
- **Decision:** German audio uses a **`de-DE`** voice. Pre-generated audio paths are
  `/audio/de/<level>/<unit>/<exercise-id>.mp3` (e.g. `/audio/de/a1/u01/de-a1-u01-l1-ex05.mp3`).
  When a file is missing or fails, the speech-synthesis fallback picks a `de-DE` voice, then
  any `de-*` voice, and otherwise shows the PD-007 "Audio isn't available right now." skip.
  Slow playback stays at 0.7× (PD-014). The speech locale comes from the course (CTO-008),
  not from code that assumes Spanish. Later, dialogues may use two distinct voices.
- **Rationale:** the TTS licence is still waiting on the owner (PRD Q7); this keeps German
  listening exercises playable now without unlicensed audio.
- **Alternatives considered:** hide listen exercises in German until audio exists (removes a
  core skill from the exam-oriented course).
- **Reversibility:** High.

## PD-035: Exam alignment and claims

- **Date:** 2026-11-12
- **Decision:** The path is **CEFR-aligned**. Each level has can-do goals and ends with a
  checkpoint. In-app and store copy says "CEFR A1" and describes what learners can do. It
  **never names exam brands, never claims certification or guaranteed exam success, and
  never states visa or legal requirements**. Exam names appear only in internal documents
  (market analysis). No exam task, sample paper, rating scale or word-list wording is
  copied, paraphrased or imitated. The legal check on mentioning exam names in marketing is
  an owner item (non-blocking).
- **Rationale:** exam names are trademarks, legal requirements change often, and an
  overstated claim would damage trust. Can-do wording is honest and still motivating.
- **Alternatives considered:** "Exam prep for <exam>" positioning (legal risk, narrows the
  brand).
- **Reversibility:** Medium (marketing copy can change after the legal check).

## PD-036: German release plan; v0.4.0 paused until A1 ships

- **Date:** 2026-11-12
- **Decision:**
  - German A1 ships in three milestones: **v0.3.1** (course support + A1 units 1–4),
    **v0.3.2** (units 5–8), **v0.3.3** (units 9–12 + A1 QA = "German A1 complete").
  - **v0.4.0 (accounts and sync) is paused until v0.3.3 ships.** v0.3.0 (gamification loop)
    continues: German needs the path, hearts and XP.
  - After A1: v0.4.0 resumes in parallel with **v0.5.0 German A2**. **v1.0.0** (launch polish)
    launches with **A1 + A2**. **B1, B2 and C1** follow as **v1.1.0, v1.2.0, v1.3.0**, each
    with the Phase 2 exercise types it needs (curriculum §6).
- **Rationale:** the owner asked for German lessons first. Splitting A1 into three releases
  gives a playable German course early (units 1–4) and lets dev work (CTO-008, PLT-024,
  GAM-010, LES-014) land in the first slice. A1 + A2 is enough for a public launch for the
  visa, spouse and pre-arrival segments. B1+ needs new exercise types, which would delay the
  launch by months.
- **Alternatives considered:** one A1 milestone (no playable German for a long time);
  launching only after C1 (very late feedback on the habit loop); continuing v0.4.0 in
  parallel now (splits dev-platform between accounts and the German course wiring).
- **Reversibility:** High (roadmap order).

## PD-037: German content conventions

- **Date:** 2026-11-12
- **Decision:** All German content follows the **German content standard CDS-1…13** in
  `curriculum-german.md` §7. The key points:
  - Ids: unit `de-a1-uNN`, lesson `de-a1-uNN-lN-<slug>`, exercise `de-a1-uNN-lN-exNN`.
    Lesson ids are unique across all courses.
  - 5 lessons per unit. Lessons 1–4 introduce 5–8 items, lesson 5 is a scenario with 2–6.
  - Every noun is taught with its article. Plurals are taught with `die`. Tiles keep authored
    case. `sie` and `Sie` never share a tile set. No capital `ẞ`. Numbers in tiles are
    written as words.
  - Unit and lesson titles are in English (UI language and language tagging, PD-019).
  - Person and job nouns accept both forms. A1 uses paired forms, no gender symbols.
  - The PD-020 vocabulary rule also allows forms of taught verbs whose pattern has been
    taught (e.g. `wir kommen` once regular endings are taught in Unit 2).
- **Rationale:** consistent rules make 390 lessons reviewable and keep the answer checker
  fair (PD-033).
- **Alternatives considered:** German unit titles (screen readers would read them with an
  English voice); gender star forms (harder for beginners, still debated in standard usage).
- **Reversibility:** High.

## PD-038: A1 scope and quality bar

- **Date:** 2026-11-12
- **Decision:** A1 = **12 units × 5 lessons = 60 lessons, ~400 new items**, 10–12
  exercises per lesson. One `CON-DE-A1-NN` ticket per unit plus `CON-DE-A1-QA`. Before A1 is
  "complete" (v0.3.3), CON-DE-A1-QA checks vocabulary progression, grammar coverage and
  answer alternatives across all 60 lessons. A **native-speaker review** is requested from
  the owner (non-blocking). Until it happens, the pm self-reviews against CDS-1…13 and keeps
  a "needs native review" list in CON-DE-A1-QA. Native review becomes **blocking for the
  v1.0.0 public launch**.
- **Rationale:** 12 units cover the A1 can-do goals and the everyday scenarios (registration
  office, bakery, supermarket, doctor, flat, train, work) and stay small enough to ship in
  three slices. Wrong German would undermine the product's credibility at launch.
- **Alternatives considered:** 8 units (misses doctor, flat or offices); 15 units (more
  content before any release).
- **Reversibility:** High.

## PD-039: `im` + month is taught in early A2, not in A1

- **Date:** 2026-11-12
- **Decision:** A1 does not teach `im` + month (`im Mai`). A1 dates use only `am` + ordinal +
  month (`am dritten Mai`) and `ab` / `bis` + month (`ab Juni`), which Unit 12 already
  teaches. `im` + month and seasons (`im Sommer`) go into the **first A2 unit** (v0.5.0),
  together with `in` + dative, where `im` = `in dem` can be explained. A1 content must not
  use `im` anywhere (CON-DE-A1-QA check: 0 uses).
- **Rationale:** `im` is a dative contraction. Teaching it as a loose chunk in the last A1
  unit would add an item that can't be recycled before the checkpoint. `ab` / `bis` / `am`
  already cover the A1 can-do ("say my date of birth", "say when something starts").
- **Alternatives considered:** add `im Mai` to the U12 L1 appendix (8 items, but no later
  lesson to recycle it and no grammar explanation possible yet).
- **Reversibility:** High (content).

## PD-040: `ins Kino` is taught as a fixed chunk in Unit 8; no other `in` + accusative in A1

- **Date:** 2026-11-12
- **Decision:** `ins Kino (gehen)` is taught in Unit 8 lesson 5 as part of the `das Kino`
  entry ("the cinema / to the cinema"), like `aus der Schweiz` (U2) and `mit dem Bus` (U9).
  It doesn't add to the item count. `in den Park` (U8 L3 ex10, L5 ex04) is removed, because
  `in` + accusative for direction is a two-way preposition (A2, see CON-DE-A1-10 out of
  scope). The weekend-plan scenario now uses `Wir können ins Kino gehen.`
- **Rationale:** "go to the cinema" is the most natural weekend plan and the scenario
  needs a destination. A single fixed chunk is learnable without case grammar; a productive
  `in den / ins / in die` pattern is not.
- **Alternatives considered:** keep `in den Park` (teaches a pattern we can't explain yet);
  no destination at all (`Wir können am Samstag gehen.`, unnatural).
- **Reversibility:** High.

## PD-041: `achthundert` is an allowed extra; hundreds are taught in A2

- **Date:** 2026-11-12
- **Decision:** `achthundert` (U10 L5 ex09, the invented rent) stays as an **allowed extra**:
  a compound of two taught words (`acht`, `hundert`, U3) built the way learners already know
  from `-zehn` / `-zig`. In A1, hundreds (`zweihundert` … `neunhundert`) appear only for
  **recognition** (listen or multiple choice), never as a word the learner must produce in a
  `to_learning` word bank, and never more than one per lesson. Numbers 100–1000 and beyond
  are taught systematically in A2 (prices, rents, years).
- **Rationale:** a realistic rent needs hundreds, and the compound is transparent. Teaching
  all hundreds in Unit 3 would break its "numbers 0–100" scope; inventing a rent of
  `neunzig Euro` would be unrealistic.
- **Alternatives considered:** add hundreds to U3 L4 (out of scope there); avoid rents in
  numbers (weakens the viewing scenario's rent question).
- **Reversibility:** High.

## PD-042: Platform wording: `das Gleis` = "the platform"; no preposition with Gleis in A1

- **Date:** 2026-11-12
- **Decision:** `das Gleis` is glossed **"the platform"** on the English side (the word
  English-speaking travellers look for), and "track" is accepted wherever a `to_known`
  answer could use it. German content uses `Gleis` + number **without article and without
  preposition** (`Ist das Gleis fünf?`, where `das` = "that"). `auf Gleis fünf` / `von Gleis
  fünf`, `der Bahnsteig` and delay minutes (`zehn Minuten Verspätung`) are A2 (dative,
  plural of `Minute`). Announcements in A1 stay one or two short sentences (`Der Zug nach
  Leipzig hat leider Verspätung.`).
- **Rationale:** German stations sign and announce `Gleis`, not `Bahnsteig`, so learners must
  recognise `Gleis` first. "Platform" is what an English speaker means. Avoiding the
  preposition keeps A1 free of the dative.
- **Alternatives considered:** gloss as "track" (literal, but confusing to learners); teach
  `der Bahnsteig` too (rarely heard in announcements).
- **Reversibility:** High.

## PD-043: Word-order alternatives in A1 word banks

- **Date:** 2026-11-12
- **Decision:** For every `to_learning` word bank, the accepted answers include:
  1. the canonical order;
  2. every V2 order that fronts a time, place or prepositional phrase (`In Hamburg wohne
     ich.`, `Am Montag arbeite ich.`);
  3. object-first orders when the object is one short noun phrase (`Den Käse kaufe ich.`,
     `Fußball spiele ich.`).
  Not accepted: split constituents (`Englisch sprichst du ein bisschen.`), more than one
  fronted element, and orders that break V2. Translations keep the prompt's sentence order
  for two-sentence answers (U1 policy). Listen exercises accept only the transcript.
  When an odd or marked order can be made unbuildable by changing a distractor tile without
  weakening the exercise, the tile set is changed instead of accepting it. When it can't,
  a grammatical order is accepted and, if a native speaker might reject it, it goes on the
  "needs native review" list in CON-DE-A1-QA.
- **Rationale:** the units were written in parallel and treated fronted phrases
  differently (Unit 2 rejected `In Hamburg wohne ich.`, Units 9 and 12 accepted the same
  pattern). One rule keeps the checker fair (CDS-4, CDS-5) and predictable for learners.
- **Alternatives considered:** canonical order only (fails learners on correct German); all
  permutations (impossible to review, accepts odd German).
- **Reversibility:** High.

## PD-044: Multiple-choice prompt punctuation (CDS-7 clarification)

- **Date:** 2026-11-12
- **Decision:** MC prompts follow "Which one means '…'?" / "Which sentence means '…'?". A
  register or speaker note goes **inside** the quotes at the end, in parentheses:
  "Which sentence means 'Where are you going? (to a friend)'?". When the quoted English
  already ends in `?` or `!` and has no note, no extra `?` is added after the quote
  ("Which sentence means 'Is it far?'"). Short glosses of a single word may stay outside
  ("Which one means 'right' (direction)?").
- **Rationale:** the parallel units used three different patterns. Screen readers read the
  prompt as one sentence, so one consistent pattern is easier to follow.
- **Alternatives considered:** always add the closing `?` ("'Is it far?'?", reads badly).
- **Reversibility:** High.

## PD-045: A2 structure and grammar order (14 units)

- **Date:** 2026-11-13
- **Decision:** German A2 has **14 units × 5 lessons = 70 lessons** (`curriculum-german.md`
  §4b), in this order: U1 Weather and Seasons (`im` + month, `aber / oder / denn`) · U2 How
  Was Your Weekend? (`war / hatte`, Perfekt with `haben`) · U3 Holiday Stories (Perfekt with
  `sein`, accusative pronouns and prepositions) · U4 Gifts and Celebrations (dative articles,
  pronouns, dative verbs) · U5 Errands in Town (dative prepositions, hundreds and years) ·
  U6 Clothes and Shopping (basic adjective endings) · U7 Health and Sport (reflexive verbs,
  `du / ihr` imperative, `sollen`) · U8 Appointments and Phone Calls (past modals, `weil`,
  minutes) · U9 At Home and the Neighbours (two-way prepositions) · U10 Train and Hotel
  (`auf / von Gleis`, `Bahnsteig`, delay minutes) · U11 Work and Job Search (`dass`) · U12
  Offices and Letters (`wenn`, `deshalb / trotzdem`, `ob`) · U13 Media and Comparisons
  (comparative, superlative) · U14 Plans and the Future (`werden`) with the **A2 checkpoint**
  as U14 L5. The A1 deferrals land as follows: PD-039 → U1, PD-041 → U5 L3, PD-042 → U8 L2
  and U10 L1–L2, PD-040 → U9 L3. Three A1 native-review items are resolved in A2 (`nach
  links / rechts` U5, `Bei welcher Krankenkasse …?` U7, `sich anmelden` U12).
- **Rationale:** the past tense is needed in almost every later scenario, so it comes first.
  The dative is split into two units so pronouns and verbs settle before prepositions.
  Adjective endings come after both cases are known, and two-way prepositions come after
  both cases have been practised, then get applied at once in travel. The three subordinate
  clauses are spread over U8, U11 and U12 so each is recycled before the next one. Every
  scenario the owner asked for has a unit (work, phone calls, clothes, celebrations,
  travel / hotel, weather, health and sport, flat and neighbours, offices and letters,
  media), plus bank and post.
- **Alternatives considered:** 12 units (would drop bank / post or media, or overload units
  with two grammar points); dative in one unit (too much for 5 lessons); all subordinate
  clauses in one unit (no recycling before the checkpoint); adjective endings in B1 only
  (A2 learners meet them in every shop and ad).
- **Reversibility:** High (content order; ids are assigned per unit).

## PD-046: A2 size target is ~460 appendix entries, not ~600

- **Date:** 2026-11-13
- **Decision:** A2's target is **~460 appendix entries** (planned: 459), which gives well over
  600 word forms once regular participles, comparatives, adjective endings and numbers are
  counted. The CDS-3 per-lesson ranges stay the same as A1 (L1–L4: 5–8 items, L5: 2–6).
  The curriculum table now reads "~460 appendix entries, ~600+ word forms".
- **Rationale:** ~600 entries would need ~43 per unit and break the per-lesson ranges that
  keep lessons short (A1 came out at 375 entries for a ~400 target). A2 adds a lot of
  grammar, and grammar patterns multiply forms without adding entries. Recycling beats
  breadth for retention (PRD G2).
- **Alternatives considered:** widen CDS-3 to 6–10 items per lesson (longer, harder
  lessons); add 2 more units (later launch for little gain).
- **Reversibility:** High. B1 can pick up vocabulary breadth with reading passages.

## PD-047: A2 content standard additions (CDS-14 … CDS-19) and a 14-exercise checkpoint

- **Date:** 2026-11-13
- **Decision:** A2 content follows CDS-1 … CDS-13 plus the new A2 rules in
  `curriculum-german.md` §7: CDS-14 grammar drill (≥ 4 exercises per pattern lesson, 1 MC
  with typical-error distractors), CDS-15 tips up to **200 characters** with one German
  example (A1's 120 stays for A1), CDS-16 extended allowed extras (regular participles,
  case forms, endings, comparatives, numbers once their pattern is taught), CDS-17 case-only
  tile pairs (`ihnen / Ihnen`, `ihr / Ihr` never in one set), CDS-18 number words over 24
  characters only as MC options, CDS-19 tense and clause mapping (PD-048). CDS-1, 9 and 12
  are generalised to any level (`/audio/de/a2/uNN/…`, `de-a2-uNN-lN-exNN`). The **A2
  checkpoint has 14 exercises**, one per unit (CDS-2's 10–12 doesn't apply to it; the type
  mix does).
- **Rationale:** A2 grammar needs a slightly longer tip to state a rule with an example (the
  contract already allows 280). A checkpoint that reviews every unit needs one exercise per
  unit, and the contract allows up to 20. The other rules make parallel writing reviewable.
- **Alternatives considered:** keep 120-character tips (no room for a rule and an example);
  a 12-exercise checkpoint that merges units (some units go unreviewed).
- **Reversibility:** High.

## PD-048: Tense and clause rules for answers in A2

- **Date:** 2026-11-13
- **Decision:** (CDS-19) English simple past and present perfect both map to the German
  **Perfekt**, except `sein`, `haben` and modals, which use the **Präteritum**. No
  Präteritum of other verbs appears in A2 tiles. `to_known` answers accept only natural
  English ("I played … yesterday", not "I have played … yesterday"). English "will" →
  German present + time word before U14; from U14 `werden`, with the present also accepted
  when there's a time word and the tiles allow it. In subordinate clauses, main clause first
  is canonical; for `weil` and `wenn` the clause-first order is also accepted; `dass` and
  `ob` clauses stay after the main clause; PD-043 applies inside each clause; `weil` + V2
  (spoken German) is never accepted. Before U9, `in / an / auf` + article appear only in
  listed chunks.
- **Rationale:** these are the choices where parallel writers would otherwise disagree
  (the A1 lesson from PD-043). They follow how standard German is spoken and written and
  keep the checker predictable.
- **Alternatives considered:** accept Präteritum of all verbs (learners can't build it; it
  is B1 narration); accept `weil` + V2 (common in speech, but wrong in writing and on
  exams); `werden` for every "will" (unnatural German).
- **Reversibility:** High.

## PD-049: A2 ships with the four current exercise types; one `cloze` type is proposed

- **Date:** 2026-11-13
- **Decision:**
  1. **A2 needs no new exercise type to ship.** Gender, case, adjective endings and two-way
     prepositions are drilled with full-sentence MCs whose options differ only in the
     article or ending, word banks with competing ending / article tiles, and paired Wo? /
     Wohin? MCs (curriculum §5). v0.5.0 is not blocked by any engine work.
  2. We propose **one generic `cloze` type** (1–2 gaps, 2–4 options per gap): contract
     **CTO-009** and component **LES-015**, both **P1**, in v0.5.0 but **non-blocking**. A
     **gender-choice** drill is a one-gap cloze (`___ Tisch` → `der / die / das`), so no
     separate type is built. When LES-015 has shipped in a release, a follow-up content
     ticket adds 1–2 cloze exercises to the A2 lessons that drill endings and prepositions
     (U4, U6, U9, U10) with new exercise ids; existing ids are not touched.
  3. **Not needed for A2:** reverse-direction MC (PD-019 stays), sentence-order with clause
     tiles (word tiles are enough), a grammar note card with tables (the tip covers A2,
     PD-050), typed answers (B1).
  4. The ROADMAP's earlier v0.5.0 tech list ("gender-choice exercise, reverse MC, grammar
     note card") is replaced by CTO-009, LES-015 and LES-013.
- **Rationale:** content can't wait for engine work: the writers start now. The MC
  technique works and was already used for A1 accusatives. A cloze gives a faster, more
  focused drill for endings, and B1 needs it anyway (curriculum §6); one flexible type is
  cheaper than separate gender-choice and case-choice types.
- **Alternatives considered:** block A2 on cloze (delays v0.5.0 and the v1.0.0 launch); a
  separate gender-choice type (duplicates cloze); build nothing until B1 (A2 endings are
  where learners stall, market analysis risk table).
- **Reversibility:** High. The content follow-up is additive.

## PD-050: Lesson tip card (LES-013) moves into v0.5.0

- **Date:** 2026-11-13
- **Decision:** LES-013 (tip card, previously P2 in v1.0.0) moves to **v0.5.0 as P1**. The
  lesson player doesn't show `tip` today (checked in `src/features/lessons`: no rendering of
  the field), and A2 relies on tips to state each grammar rule (CDS-15).
- **Rationale:** the tip is our only grammar explanation until a note card exists. Without
  it, A2 learners meet the dative or adjective endings with no rule at all.
- **Alternatives considered:** put rules in MC prompts (prompts would exceed 80
  characters); wait for v1.0.0 (A2 would ship without any explanation).
- **Reversibility:** High.

## PD-051: Safe topics in A2 scenarios

- **Date:** 2026-11-13
- **Decision:** Extending CDS-11 and PD-035 for A2's real-life scenarios: no statements of
  law or rules (sick notes, quiet hours, tenancy and utility costs, contracts, minimum wage,
  passenger rights, customs, banking fees, deadlines, fines); no medical diagnoses, doses or
  treatment advice; no religious holidays; no alcohol; no brands (devices, apps, banks,
  train operators, hotels, stores, media); job interviews don't evaluate age, religion,
  health, family plans or origin. House rules are a building's own rules.
- **Rationale:** these are the A2 scenarios where content could drift into advice or claims
  that are wrong, change over time, or exclude learners.
- **Alternatives considered:** a "Life in Germany" fact layer (B1 orientation topics, needs
  legal review first).
- **Reversibility:** High.

## PD-052: Parallel writing of A2: appendices are the contract

- **Date:** 2026-11-13
- **Decision:** A2 is written by **4 writers in parallel per wave** (ROADMAP v0.5.0). A
  unit ticket depends on the **appendices** of earlier units, not on their lesson files, so
  units in the same wave can be written at the same time. A writer may use A1, earlier A2
  appendices and earlier lessons of the own unit only. If a writer needs a word that isn't
  in any appendix, they either rewrite the sentence or note the request in their ticket's
  self-review; they never add it silently. CON-DE-A2-QA moves every accepted addition into
  an appendix. Each writer hands the unit fragment for `course.json` to the orchestrator
  (as in A1); units are merged in unit order.
- **Rationale:** sequential writing of 14 units would take too long; fixed appendices make
  parallel writing safe and the QA check mechanical.
- **Alternatives considered:** one writer in sequence (slow); free writing then QA
  (many cross-unit vocabulary conflicts, as A1 QA showed).
- **Reversibility:** High.

## PD-053: Word-order acceptance rule for A2 word banks (extends PD-043)

- **Date:** 2026-11-15
- **Decision:** Applied in CON-DE-A2-QA to all 14 A2 units. For `to_learning` word banks
  (and the matching `to_known` English), on top of PD-043:
  1. **Fronting:** PD-043's fronted time, place and prepositional phrases and short-object
     fronting, plus a fronted predicative adjective, manner or frequency adverb or bare
     infinitive (`Müde fühlt er sich.`, `Immer übe ich abends.`), are **accepted when the
     tiles can't block them**. Each one goes on the "needs native review" list. When a
     distractor change can make a marked order unbuildable without weakening the exercise,
     the tiles change instead (PD-043).
  2. **Middle-field adverbials may swap order:** time, place, direction, company, `seit` /
     `vor` phrases and `trotzdem` are accepted in either buildable order (`Ich arbeite seit
     einem Jahr bei der Bank.` / `… bei der Bank seit einem Jahr.`).
  3. **Pronoun and object order stays fixed:** pronoun before noun (a reflexive pronoun
     right after the finite verb or subject), dative noun before indefinite accusative noun,
     noun object before a directional complement. Other orders are rejected (`Ich schenke
     Blumen meiner Mutter.`, `Ich habe im März mich verletzt.`).
  4. **`dass`-less and "…, glaube ich" orders are accepted** with `glauben / denken / finden
     / hoffen` when the tiles allow them, with PD-043 inside each clause. `Dass …, glaube
     ich.` is never accepted (CDS-19.4). In `to_known`, "X, I think." is accepted the same way.
  5. Still rejected: echo questions, two clauses or sentences in reversed order, and `weil`
     + V2 (PD-048).
- **Rationale:** the four parallel writers (PD-052) treated marked orders differently (U4,
  U5, U7, U8, U10, U12, U14), and 20 of the 28 QA changes aligned them. Learners shouldn't
  lose a heart for correct German, but the checker must stay predictable and the content
  reviewable. Fixed pronoun and object order is a core A2 rule, so relaxing it would teach
  errors.
- **Alternatives considered:** canonical order only (fails correct German); accept every
  buildable order (accepts wrong pronoun and case order); decide per writer (inconsistent,
  the A1 problem again).
- **Reversibility:** High. Answer lists can be narrowed after the native review (CON-DE-NR).

## PD-054: Release plan for the German track: one combined v0.5.0 release

- **Date:** 2026-11-15
- **Decision:** Acceptance in `tickets/PM-ACC3-german-release-acceptance.md`.
  1. v0.3.0, v0.3.1, v0.3.2 and v0.3.3 are **not tagged separately**. The cto cuts **one
     combined release, v0.5.0**, from a single release commit once these are on `main`:
     LES-014 (#55, re-checked by the pm), FIX-003, the A2 QA branch `docs/con-de-a2-qa`,
     and a passing FIX-004 playthrough.
  2. The `CHANGELOG.md` entry for 0.5.0 lists the tickets in one block per milestone
     (Gamification loop; German A1; German A2), with an ADR-007-style note that v0.3.0–v0.3.3
     were accepted but not tagged on their own.
  3. Version numbers keep going up. The accounts and sync milestone (formerly v0.4.0) is
     renumbered **v0.6.0** and resumes now. The `v0.4.0` number is not used.
  4. CTO-009 and LES-015 (cloze) move to **v0.5.1** with the A2 cloze content follow-up.
     They don't block v0.5.0 (PD-049).
  5. German B1 planning (v1.1.0) starts now, in parallel with v0.6.0 and v1.0.0.
- **Rationale:** #55 and FIX-003 land after the A2 units (#60–#63), so no `main` commit holds
  the v0.3.x milestones without 70 playable A2 lessons. A v0.3.x tag would ship A2 under an
  A1 label, and back-to-back tags on one commit would be identical builds. One release with
  honest notes is simpler and still traceable. The v0.1.0 / v0.2.0 approach (tag the earliest
  commit that contains the milestone, ADR-007) doesn't work here because that commit doesn't
  exist. Releasing A2 before accounts follows PD-036 (A1 + A2 at launch). Guests can play all
  of it now.
- **Alternatives considered:** back-to-back v0.3.0 … v0.3.3 + v0.5.0 tags on one commit
  (five identical builds); a release branch from the #58 commit with #55 and FIX-003
  cherry-picked (extra process, tags off `main`); holding A2 until accounts ship as v0.4.0
  (delays content for no product reason); keeping the accounts milestone as v0.4.0 after
  v0.5.0 (version numbers would go backwards).
- **Reversibility:** Medium. Once v0.5.0 is tagged, the numbering is fixed. Until then the
  cto may tag differently if CI history allows it.

## PD-055: Prompt audio on multiple choice and word banks waits for v1.0.0

- **Date:** 2026-11-15
- **Decision:** Answer to the CTO-008 criterion 21 finding: `multiple_choice.audio` and
  `word_bank_translate.audio` are in the contract but not rendered. Until a LES ticket
  renders them, German content puts listening only in `listen` exercises, and any `audio`
  field on other types is treated as unused. A ticket **LES-016 "Play prompt audio on
  multiple choice and to_known word banks"** is planned for v1.0.0, together with the TTS
  audio pipeline (CON-DE-SPK).
- **Rationale:** A1 and A2 already have 2–3 listens per lesson, which is enough listening
  practice for now. Prompt audio without real recordings would just mean more speech
  synthesis, so it is worth more once the audio pipeline exists.
- **Alternatives considered:** build it now (dev-lessons is busy with LES-014, FIX-005 and
  LES-015); drop the fields from the contract (B1 announcements need them).
- **Reversibility:** High.

## PD-056: B1 structure and grammar order (16 units)

- **Date:** 2026-11-16
- **Decision:** German B1 has **16 units × 5 lessons = 80 lessons** (`curriculum-german.md`
  §4c, ticket CON-DE-B1-PLAN), in this order: U1 Could You Help Me? (polite Konjunktiv II
  chunks, indirect W-questions) · U2 Life Stories (Präteritum, `als / wenn`) · U3 People
  Around Me (relative clauses nom. / acc.) · U4 Everyday Work (verbs with prepositions,
  `wo- / da-` compounds) · U5 Learning for Life (zu-infinitive, `um … zu`) · U6 Renting a
  Flat (dative and prepositional relative clauses, dative adjective endings) · U7 Doctors and
  Hospitals (n-declension, dative reflexive pronouns) · U8 Orders and Complaints (`obwohl`,
  `damit`) · U9 Environment and the City (passive present, `lassen`) · U10 If I Had More Time
  (Konjunktiv II in full, `sollte`) · U11 Letters from the Authorities (genitive, `wegen /
  trotz / während`) · U12 News and Reports (`wurde`, passive Präteritum, Plusquamperfekt,
  `nachdem / bevor`) · U13 Food and Markets (adjective endings without article and in the
  genitive, attributive comparison) · U14 Living Together (two-part connectors) · U15
  Discussing and Deciding (`während / seitdem / bis`, `einerseits … andererseits`) · U16 Next
  Steps (`ohne / statt … zu`, Futur I with `wohl`) with the **B1 checkpoint** as U16 L5. Every
  later unit has written **recycling duties** (coverage map, CDS-25).
- **Rationale:** the polite chunks and the Präteritum are needed in almost every later
  scenario, so they come first. Each case-heavy point waits until its base is recycled
  (dative relatives and endings after A2's dative and U3's relatives; the full adjective
  system after the genitive). `da-` compounds come before the zu-infinitive so `darauf, … zu`
  can be recycled. The passive is split so the Präteritum form arrives with news texts. The
  themes cover the integration-course topics in the market analysis (work, housing, offices,
  health, shopping, environment, media, education, living together, opinions) with our own
  scenarios.
- **Alternatives considered:** 14 units (would merge housing and complaints or drop the
  environment unit, and put two major grammar points into several units); Präteritum later
  (stories and news would have to avoid it); passive in one unit (too much for 5 lessons);
  Konjunktiv II only in U10 (U1–U9 service scenarios would sound blunt).
- **Reversibility:** High (content order; ids are assigned per unit, nothing is written yet).

## PD-057: B1 size target is ~510 appendix entries, not ~1,000

- **Date:** 2026-11-16
- **Decision:** B1's target is **~510 appendix entries** (planned: 508, per lesson in the
  unit tickets), ~800 word forms with Präteritum, Konjunktiv II, zu-infinitive, passive, case
  and ending forms. The CDS-3 per-lesson ranges stay (L1–L4: 5–8 items, L5: 2–6, checkpoint
  2). Up to ~150 more **receptive** words come later with reading passages (CON-DE-B1-RDG,
  tech item B1-T3). Curriculum §2 now says this.
- **Rationale:** the "~1,000" figure counted receptive vocabulary, which the tile types can't
  teach fairly. Reaching 1,000 productive entries would need ~12 items per lesson, which
  breaks the short-lesson format and PD-046's reasoning (A2 planned 459 and landed at 462).
  B1 adds a lot of grammar, and grammar multiplies forms without adding entries.
- **Alternatives considered:** widen CDS-3 to 8–12 items (long, hard lessons; more answer
  fairness risk); add 6 units (later release for little retention gain).
- **Reversibility:** High.

## PD-058: B1 content standard additions (CDS-20 … CDS-28) and a 16-exercise checkpoint

- **Date:** 2026-11-16
- **Decision:** B1 content follows CDS-1 … CDS-19 plus the B1 rules in `curriculum-german.md`
  §7: CDS-20 longer prompts (≤ 110 characters, ≤ 14 answer tiles, ≤ 2 clauses), CDS-21 tips
  up to **240 characters** with one-line tables, CDS-22 B1 allowed extras (Präteritum,
  Konjunktiv II, relative pronouns, zu-infinitives, passive, genitive, endings,
  n-declension, once each pattern is taught), CDS-23 tense and form mapping and CDS-24 word
  order (PD-059), CDS-25 recycling duties, CDS-26 safe topics (PD-061), CDS-27 glosses for
  new meanings, CDS-28 a **16-exercise B1 checkpoint**, one per unit. CDS-20 and CDS-21 fall
  back to A2's 80 / 200 characters if the tech check B1-T5 fails at 375 × 667.
- **Rationale:** B1 sentences have two clauses, so 80 characters is too short for many
  English prompts (the contract allows 280). A B1 rule often needs a small table, which fits
  in 240 characters. Every rule here works with today's types, so no rule waits for tech.
- **Alternatives considered:** keep A2's limits (two-clause sentences would be cut into
  unnatural pieces); 280-character tips (too long to read on a phone before every lesson).
- **Reversibility:** High.

## PD-059: Tense, form and word-order rules for B1 answers; PD-053 from the start

- **Date:** 2026-11-16
- **Decision:** (CDS-23, CDS-24) The A2 QA aligned 20 exercises after writing because four
  writers treated marked orders differently. For B1 the rules are fixed **before** writing:
  1. PD-043 and PD-053 apply to every B1 word bank from the first lesson.
  2. Past: Perfekt in dialogue, Präteritum in narration; a tile set builds one past tense
     (both accepted if both are buildable); an MC never marks the other tense as wrong.
  3. Clause-first is accepted for the adverbial conjunctions (`weil, wenn, als, obwohl,
     damit, nachdem, bevor, während, seitdem, bis`) and `um / ohne / statt … zu`; never for
     `dass`, `ob`, indirect questions, relative clauses or other zu-infinitives.
  4. Relative clauses right after the noun or after the final verb part only.
  5. Genitive and `von` + dative both accepted when buildable; `wegen` + dative never.
  6. No double infinitive in B1; at most 20 accepted answers, and sentences with more than
     12 valid orders are shortened, never under-listed.
- **Rationale:** a fixed rule is cheaper than a QA rewrite, and learners shouldn't lose a
  heart for correct German. Leaving the other past tense unmarked follows real usage (both
  are correct; the register differs).
- **Alternatives considered:** canonical order only (fails correct German); let QA decide
  again (the A2 cost).
- **Reversibility:** High. Answer lists can be narrowed after a native review.

## PD-060: B1 is written with today's four types; the tech needs list has no writing blocker

- **Date:** 2026-11-16
- **Decision:** All 16 B1 units are written with multiple choice, word bank, match pairs and
  listen. The tech needs for the cto (curriculum §4c) are: B1-T1 cloze (CTO-009 / LES-015,
  v0.5.1; not blocking), B1-T2 typed answers with PD-033 leniency (not blocking), B1-T3
  reading passage with reverse-direction options (not blocking; recommended for v1.1.0,
  otherwise v1.1.1), B1-T4 grammar note card with tables (not blocking), B1-T5 a 375 × 667
  fit check for 240-character tips and 110-character prompts (blocking **only** CDS-20 /
  CDS-21; fallback to A2 limits), B1-T6 offline caching for 210 lessons, B1-T7 prompt audio
  (LES-016). Each new type gets a follow-up content ticket that adds exercises with new ids
  (CON-DE-B1-CLZ, CON-DE-B1-TYP, CON-DE-B1-RDG, all planned). The cto assigns ticket IDs.
- **Rationale:** the PD-049 approach worked for A2: content never waited for the engine, and
  the additive follow-up keeps exercise ids stable. Letters and news can be read sentence by
  sentence in `to_known` word banks until passages exist.
- **Alternatives considered:** make reading passages a v1.1.0 release blocker (the B1 units
  would wait on a new contract and component); write B1 only after all types exist (months
  of idle content capacity).
- **Reversibility:** High.

## PD-061: Safe topics in B1 scenarios

- **Date:** 2026-11-16
- **Decision:** CDS-26 extends CDS-8, CDS-11, PD-035 and PD-051 to B1's themes (offices,
  housing, health system, consumer rights, news, environment, living together, opinions):
  invented letters and news only; no real events, people, parties, elections; no migration,
  residence, citizenship or benefit rules; no deadlines, fees, fines, tenancy or insurance
  rules stated as facts; no diagnoses or doses; environment as personal action without
  statistics; mild local news only; no religion, alcohol or brands. Discussion topics in U15
  are everyday choices (working from home, city or countryside, bikes in the courtyard), not
  political issues.
- **Rationale:** B1's themes are exactly where content could drift into legal or political
  claims that are wrong, change over time, or exclude learners.
- **Alternatives considered:** a fact-checked "Life in Germany" layer (needs legal review;
  Phase 3 idea).
- **Reversibility:** High.

## PD-062: Parallel writing of B1 in 4 waves, gap words planned, scripted checks per wave

- **Date:** 2026-11-16
- **Decision:**
  1. B1 is written by **4 writers per wave** (PD-052 rules unchanged): wave 1 U1–U4, wave 2
     U5–U8, wave 3 U9–U12, wave 4 U13–U16, wave 5 CON-DE-B1-QA. The appendices in the unit
     tickets are fixed; a writer uses A1, A2, earlier B1 appendices and earlier lessons of the
     own unit only.
  2. **Gap words:** 48 high-frequency words that A1 and A2 never taught (`verstehen`,
     `fragen`, `kennen`, `bekommen`, `man`, `nur`, `alle`, `jeder`, `die Arbeit`, …) are
     planned into U1–U4 appendices. Each ticket also has a "not yet taught" list of tempting
     words from later units.
  3. **Scripted checks after each wave**, not only at the end (the A2 QA left them as
     follow-ups): the orchestrator runs the lexical token scan against the appendices, the
     word-bank permutation check, the buildability check and the CDS length / case-pair /
     digit / ordering checks on the wave's lessons. The pm settles vocabulary requests and
     amends appendices before the next wave starts.
  4. Writers hand unit fragments to the orchestrator; units are inserted into `course.json`
     in unit order under a new `B1` level.
- **Rationale:** sequential writing of 80 lessons would take too long. The A2 QA showed the
  remaining risks: words used before their appendix, per-writer word-order rules, and
  recycling gaps. Gap words, PD-059 and recycling duties remove them by plan, and early
  scripts catch the rest per wave.
- **Alternatives considered:** one writer (slow); 8 writers per wave (more cross-unit
  conflicts; wave 2 would depend on unchecked wave 1 work).
- **Reversibility:** High.

## PD-063: B1 writing starts after the plan; B1 merges into `main` only after v1.0.0

- **Date:** 2026-11-16
- **Decision:** This revises the ROADMAP's v1.1.0 note ("B1 writing starts after v1.0.0's
  native review").
  1. **Writing** may start as soon as CON-DE-B1-PLAN is merged and the B1-T5 check is done.
     It no longer waits for CON-DE-NR.
  2. **Merging is unchanged:** no B1 lesson file or `course.json` B1 unit reaches `main`
     before **v1.0.0 is tagged**. Unit PRs stay open (lesson files are new files, so they
     don't conflict). The QA wave builds a combined preview branch (`docs/con-de-b1-qa`).
  3. **Native-review delta:** after CON-DE-NR, the pm lists every A1 / A2 item that the
     review renamed, removed or re-glossed, checks it against the B1 appendices and lessons
     (search), and fixes the B1 files before their PRs merge (CON-DE-B1-QA criterion 13).
  4. A **native-speaker review of B1** (CON-DE-B1-NR, planned) is **blocking for the v1.1.0
     release**, as PD-038 made it for A1 + A2 at v1.0.0 (CON-DE-B1-QA criterion 14).
- **Rationale:** keeping B1 out of `main` keeps the launch build exactly A1 + A2 (PD-036)
  and keeps B1 out of the launch QA and native review scope. Waiting for CON-DE-NR to
  *start* writing would leave content capacity idle for the whole launch period. The review
  changes wording, not the grammar order, so a delta pass is enough.
- **Alternatives considered:** merge B1 into `main` behind a hidden level (needs a feature
  flag in the course registry: new tech for a temporary need); keep the old rule (B1 ships
  months later); merge B1 before v1.0.0 and launch with it (untested and unreviewed content
  at launch).
- **Reversibility:** High.

## PD-064: Learners choose a start level (onboarding, path "Start here", Profile)

- **Date:** 2026-11-18
- **Reason:** owner request of 2026-11-18: a learner can start at a later level, e.g. A2,
  if they want to skip A1. Design agreed by the orchestrator with the cto (ADR-013, contract
  CTO-015). Milestone **v0.5.2 "Start level and earn hearts"** (GAM-011, LES-020, PLT-025).
- **Decision:**
  1. **Onboarding** gets a step **"Where do you want to start?"** after the language step and
     before the daily goal. It lists the course's levels **that have content** (today
     "A1 · Beginner", preselected, and "A2 · Elementary"; B1 appears only once its lessons are
     in the course). A course with one level skips the step. The choice is saved as
     `settings.startLevel`. A missing or unknown value means the course's first level, so
     every existing learner keeps today's path unchanged.
  2. **Path:** every lesson of a level **before** the start level stays **playable**. It is
     not marked completed, earns no XP for being skipped, and earns XP as normal when played.
     The first not-completed lesson of the start level is **"up next"**; lessons after it
     follow the normal in-order rule (GAM-008). If the whole start level is completed, the
     normal rule continues into the next level.
  3. Each **locked level header** on the path offers **"Start here"**, which sets the start
     level to that level at once (no confirmation; it is reversible in Profile and nothing is
     lost).
  4. **Profile** shows the start level and lets the learner change it.
  5. **Lowering** the start level applies the normal rule from the new level: earlier
     lessons that are not completed lock again. Completed lessons always stay completed and
     playable, and XP, streak and results never change.
  6. The lesson route uses the same rule: a playable earlier-level lesson opens from a URL; a
     locked one still redirects to Learn (PD-018).
- **Rationale:** learners who studied before (US-DE-02's visa, job or study goals) drop off
  when they must redo 60 A1 lessons to reach A2, which hurts activation and D7 retention
  (PRD goals). Keeping earlier levels open lets them fill gaps without a separate review mode.
  Not marking skipped lessons completed keeps "lessons completed", XP and the profile honest.
- **Alternatives considered:**
  - **Placement test** (adaptive quiz that decides the level): more accurate for unsure
    learners, but needs new exercise selection and scoring logic and its own content, and
    would take several sessions to build. A self-chosen level is enough for learners who know
    they finished A1; a placement test stays a Phase 2 idea that can set the same
    `startLevel`.
  - Marking skipped lessons completed (inflates lessons completed and would raise questions
    about XP).
  - Unlocking every lesson in the course (removes the path's guidance).
- **Effect on balance:** skipping a level gives no XP, streak or league advantage; it only
  changes which lesson is up next. A learner who starts too high can lower the level in
  Profile or simply play the open earlier lessons.
- **Reversibility:** High (one setting; removing the step leaves stored values harmless).

## PD-065: Correct answers earn hearts; practising a finished lesson is free

- **Date:** 2026-11-18
- **Reason:** owner request of 2026-11-18: correct answers earn hearts, so a learner who
  practises doesn't have to wait for a refill. Design agreed by the orchestrator with the cto
  (ADR-013, contract CTO-015). Milestone v0.5.2 (GAM-011, LES-020, PLT-025).
- **Decision:**
  1. **Each correct Check restores 1 heart**, up to the maximum of **5**. A re-queued
     exercise answered correctly later also earns 1. A match-pairs exercise earns 1 when it
     completes with no mismatch; with mismatches it costs 1 as today (PD-012) and earns
     nothing. **Speak exercises never change hearts** (no loss, no gain), and skipped
     exercises earn nothing. At 5 hearts a correct answer changes nothing.
  2. Earned hearts show **at once** in the lesson header. This revises PD-018 only for earned
     hearts: a heart from the timed refill during a lesson is still not added to that lesson.
  3. **Practice:** replaying a lesson that was already completed when it started costs **no
     hearts** (wrong answers are still re-queued and counted as mistakes) and **can start at
     0 hearts**. Correct answers in practice still earn hearts. XP for a replay stays full
     (PD-008). A lesson that is playable but not completed (for example a skipped
     earlier-level lesson, PD-064) is not practice: it needs at least 1 heart and costs
     hearts as normal.
  4. The **out-of-hearts screens** (path dialog and lesson screen) say **"Practise a finished
     lesson to earn hearts."** when the learner has at least one completed lesson. This
     replaces PD-018's rule that the 0-hearts screens show nothing but the refill time.
  5. The **4-hour refill still runs**. An earned heart does not move the next refill time;
     at 5 hearts the refill timer stops as today.
- **Rationale:** hearts should create stakes on **new** material, not lock out a learner who
  wants to keep practising. Rewarding correct answers turns the out-of-hearts dead end into a
  path back and supports daily-goal completion and streaks (PRD success metrics) and
  US-GAM-14.
- **Alternatives considered:**
  - **1 heart per 3 correct answers:** slower recovery and closer to today's stakes, but it
    needs a hidden counter that is hard to show on screen ("2 of 3") and would reset between
    lessons. The owner asked for practice to replace waiting, and a 1:1 rule fits in one
    sentence.
  - A separate practice mode with its own exercises (new content and logic; Phase 2 idea).
  - Removing hearts (loses the accuracy stake on new lessons).
- **Effect on balance:** in a new lesson, a learner who gets at least half of the Checks
  right ends with about as many hearts as at the start, so only frequent mistakes end a
  lesson early; a run of wrong answers still does (5 wrong in a row from 5 hearts ends the
  lesson). A learner at 0 hearts gets back to 5 with about 5 correct answers in a free
  practice lesson (a few minutes), which also earns replay XP. Hearts become a pacing signal
  on new lessons rather than a time gate. If later data shows new lessons almost never end
  out of hearts, the fallback is the 1-per-3 rule (one constant, via a contract request).
- **Reversibility:** High (one rule constant and a practice flag).

## PD-066: Visual redesign v2 (owner design)

- **Date:** 2026-11-19
- **Reason:** the owner delivered a new visual design on 2026-11-19 (8 phone screens, brief and
  renders in `design-ref`; copied into `docs/design/v2/` by CTO-016) and asked for every screen
  to match it while keeping the name Polyglow and the mascot Lumi. Milestone **v0.5.3
  "Redesign"** (CTO-016, PLT-026, GAM-012, LES-021).
- **Decision:**
  1. **Light theme only**, as in the design (canvas `#F6F7FB`, white surfaces). **Dark mode
     is dropped for now**: the theme toggle and dark styles are removed; a dark palette for v2
     is a later idea once the light look is stable.
  2. **Fonts:** Bricolage Grotesque (700/800) for headings and numbers, DM Sans (400/500/700)
     for body and UI. Both are OFL Google Fonts, self-hosted at build via `next/font/google`
     (no runtime call to Google, works offline).
  3. **Palette:** primary indigo `#4338CA` (3D edge `#312E81`), accent coral `#F2613F`
     (current node, streak), XP gold `#F5B400`, success green `#15803D`, error red `#B91C1C`,
     hearts `#F43F5E`; ink `#1B1D2A`. "3D" depth is a solid bottom shadow, never blur. Full
     token list in the brief; tokens live in the CTO-016 design system.
  4. **Navigation:** a **4-tab bottom nav: Learn, Practice, Leagues, Profile**.
  5. **Practice** is a **real list of the learner's finished lessons** to practise. Opening one
     starts the existing practice replay: free, allowed at 0 hearts, correct answers earn
     hearts (PD-065). With no finished lesson it shows an empty state pointing to Learn.
  6. **Leagues** shows an honest **"Leagues arrive with accounts"** state in the design style
     (accounts are v0.6.0). **No fake leaderboard**, names, ranks or league tier.
  7. **Profile** shows **only real stats**: day streak, total XP, lessons done, start level,
     and an "XP this week" bar chart built from saved lesson results with the daily-goal line.
     The design's "Current league", "Words learned" and **Achievements** are left out until
     those features exist.
  8. The design's brand name **"parla"** and its speech-bubble logo are **not used**. The app
     stays **Polyglow** and the mascot stays **Lumi** (PD-001); Lumi may replace the trophy on
     the results screen.
  9. **No behaviour change:** the redesign changes the look only. Copy, flows, rules and
     existing tests stay; new nav tabs reuse existing logic (practice flag, saved results).
- **Rationale:** the owner owns the visual direction, and a consistent, more polished look
  helps activation and D1/D7 retention (PRD success metrics). Keeping behaviour fixed lets the
  team ship the redesign in one short milestone with low risk: existing unit and e2e tests act
  as the safety net. Showing only real data keeps the product honest (PD-018 spirit) and avoids
  screens that promise features we don't have.
- **Alternatives considered:**
  - **Keep dark mode and design a dark v2 palette now:** doubles the visual QA and contrast
    checks, and the owner's design has no dark screens to follow. Deferred.
  - **Keep the current fonts (system / previous stack):** cheaper, but the type is a large
    part of the design's character; both fonts are free and self-hosted.
  - **Ship the design's Leagues and Achievements with placeholder data:** matches the
    renders more closely but shows invented data, which breaks trust. Rejected.
  - **Hide the Leagues tab until v0.6.0 (3 tabs):** simpler, but the owner's nav has 4 tabs
    and the honest state tells learners what is coming. Rejected.
  - **Adopt "parla" as the name:** rejected; the owner asked to keep Polyglow and Lumi.
  - **Redesign screen by screen across several milestones:** a mixed look for weeks; one
    milestone with a shared design system first (CTO-016) is cleaner.
- **Effect on balance:** none (no rule changes).
- **Reversibility:** Medium (styling and tokens only; old styles remain in git history).

## PD-067: Redesign v2 keeps existing names, copy and path titles where the design differs

- **Date:** 2026-11-20 (PM-ACC4)
- **Reason:** in v0.5.3 acceptance, some places differ on purpose from the owner's design
  and from the wording of LES-021 / GAM-012 / PLT-026.
- **Decision:** accepted as shipped:
  1. The lesson close button keeps the accessible name **"Quit lesson"** (LES-021 AC 1 said
     "Close lesson").
  2. The feedback sheet button says **"Continue"**, not the design's "Got it" (LES-021 AC 8).
  3. The slow-audio button's accessible name is **"Slow 0.7× speed"**, so that it contains
     its visible text (WCAG 2.5.3), not "Play slowly" (LES-021 AC 4).
  4. The word-bank speaker button shows **only when the prompt is in the learning
     language**. An English prompt read by a German voice would be wrong.
  5. **Lesson titles stay under the path nodes** ("Unit 1 · Lesson 1", title, state). The
     design shows bare nodes.
  6. **No Sounds / Speaking settings rows:** no feature reads those settings, so the rows
     would do nothing.
  7. No achievements and no "Review my mistakes" (already PD-066 §7, LES-021 out of scope).
- **Rationale:** PD-066 §9 says no copy or behaviour change, and that rule wins over the
  ticket wording (items 1-3). It also keeps the existing tests valid as the safety net.
  Titles under nodes help a learner see what is next, and screen readers already read them.
  Settings that do nothing break trust (PD-018 spirit).
- **Alternatives considered:** rename to match the design (copy churn, many test edits, no
  learner benefit); hide the titles (less clear); ship placeholder Sounds / Speaking rows
  (dead controls). Rejected.
- **Reversibility:** High (copy and layout only).

## PD-068: The Leagues tab may show the learner's own weekly XP

- **Date:** 2026-11-20 (PM-ACC4)
- **Reason:** GAM-012 AC 10 said "no names, ranks, tiers or numbers". The shipped screen
  also shows a "Your XP this week" tile from saved lesson results.
- **Decision:** accepted, and GAM-012 AC 10 is amended to "no other people, names, ranks,
  tiers or invented numbers". The learner's own weekly XP (Mon-Sun, from saved results, the
  same week as Profile's chart) is allowed. The decorative shields stay without tier names.
- **Rationale:** the number is real and about the learner only, so the screen stays honest
  (PD-066 §6). It also shows the number that will count in leagues once accounts launch
  (v0.6.0), which supports the weekly habit.
- **Alternatives considered:** remove the tile (an empty screen with no useful info).
  Rejected.
- **Reversibility:** High.

## PD-069: Profile gets a "Daily goal" settings row

- **Date:** 2026-11-20 (PM-ACC4)
- **Reason:** PLT-026 AC 14 listed "daily goal" among the settings rows, but before v0.5.3
  the daily goal could only be chosen at onboarding. Adding "Change" is a small new
  capability inside a "no behaviour change" milestone.
- **Decision:** accepted. The row shows the goal ("Regular · 20 XP"). "Change" opens a
  dialog with the same options as the onboarding goal step and saves through the existing
  settings update. The goal ring and the weekly chart's goal line update at once. No
  contract change and no new rule.
- **Rationale:** learners need a way to change a goal they picked on day one. A goal that
  is too high is a churn risk for D7 retention (PRD metrics). The row reuses existing
  pieces, and tests cover it.
- **Alternatives considered:** remove the row until a later milestone (it works and is
  tested now, so removing it would be wasted work). Rejected.
- **Reversibility:** High.

## PD-070: v0.5.3 is released with the design README as a follow-up

- **Date:** 2026-11-20 (PM-ACC4)
- **Reason:** CTO-016 AC 1 FAILs: `docs/design/v2/README.md` (screen → ticket map) is
  missing. Every other criterion of the four v0.5.3 tickets and FIX-008 … FIX-010 passes.
- **Decision:** CTO-016 is accepted with AC 1 moved to **FIX-011** (cto, P2). v0.5.3 is
  **ready for release** (PR #94).
- **Rationale:** the README is a reference document for the team. It has no effect on users,
  code or tests, and the mapping is already in each ticket's "References" line and in
  `BRIEF.md`. Holding the release for it would delay the redesign with nothing gained.
- **Reversibility:** n/a (process decision).

## PD-071: Marketing proposals review 2026-11-21

- **Date:** 2026-11-21
- **Reason:** marketing (MKT-001) delivered `docs/marketing/` (market research, personas,
  positioning, feature proposals, pricing). Per `ORCHESTRATOR.md` (Plan step), marketing
  proposes and the pm decides. Constraints: brand and IP rules (CLAUDE.md, PD-001), no
  accounts, server push or payments before v0.6.0, which needs the owner's hosted Supabase;
  B1 merges only after v1.0.0 (PD-063); no exam names or pass promises (PD-035).
- **Decision** (proposal numbers from `feature-proposals.md`):

  | # | Proposal | Decision | Milestone / trigger |
  |---|---|---|---|
  | 1 | Goal date | **Accept** (free, see §1 below) | **v0.5.4 "Goal date"**: CTO-017, GAM-013, PLT-027, LES-022 |
  | 2 | Accounts, sync, public URL | **Accept** (already planned) | v0.6.0 stays the top engineering priority the day the owner provides hosted Supabase; the public URL is an owner item. Email **and** Google stay in scope (PRD §6.1). Cookieless, consent-based analytics: the cto writes a technical note before PLT-019 (v1.0.0) |
  | 3 | Recorded German audio | **Accept** (already planned) | v1.0.0 TTS pipeline (CTO-(tbd)); **gated on the owner's TTS licence** (PRD Q7). Copy never says "native" unless human-recorded |
  | 4 | Smart review in Practice | **Accept** | **v0.5.5 "Smart review"** (planned; needs per-exercise results stored locally, so a contract ticket first). Free, no daily session cap (§2) |
  | 5 | "Life in Germany" topics | **Accept in-app index; defer landing pages** | Topic index → **v0.5.6 "Life in Germany topics"** (planned; pm maps topics to lessons, topics respect path locks, PD-064). Public landing pages → v1.0.0, trigger: public URL and domain exist |
  | 6 | Shareable level and streak card | **Defer** | v1.0.0 (planned). Reason: the card's main value is the app URL, which doesn't exist yet. Trigger: public URL. Wording "I finished the A1 path on Polyglow", never "certified" (PD-035); no personal data on the image except what the learner adds |
  | 7 | Reminders and streak freeze | **Accept, after accounts** | **v0.7.0 "Habit protection"** (planned, after v0.6.0, doesn't block v1.0.0). Web Push needs a server and consent copy (cto note; iOS only for installed apps). The streak freeze lands in the same milestone so its inventory syncs from day one. 1 free freeze a week |
  | 8 | Mock level checkpoint (timed, can-do report) | **Defer** | Phase 2. Reasons: a timer works against "kind feedback" (PRD §8.3) and pulls toward exam framing (PD-035); the checkpoints don't have enough items for a repeatable mock; its value is mainly as a paid feature and there are no payments (PD-072). Trigger: B1 merged **and** a go decision on paid plans. An untimed can-do summary on checkpoint results may come earlier as its own idea |
  | 9 | Typed answers, then speaking | **Accept** (already planned) | Speak: LES-011 + CON-DE-SPK in v1.0.0. Typed answers with `ss` / umlaut handling (PD-033): B1-T2 in v1.1.0. No change |
  | 10 | Teacher / cohort view (B2B) | **Defer** | Phase 3. Needs accounts, roles, learner consent and a data-processing agreement (owner / legal). Trigger: v0.6.0 released **and** an organisation asks for a pilot **and** the owner has the legal set-up |
  | — | Ukrainian / Arabic / Turkish UI | Keep as planned | Phase 3 (PD-031) |
  | — | Leagues | Keep as planned | Phase 2, after v0.6.0 and enough active learners |
  | — | AI conversation partner | **Reject for now** | PRD §7: no AI-generated content at runtime; accuracy and cost risks. Revisit after B1 |
  | — | B1 as the reason to pay | Noted | B1 stays v1.1.0 and merges after v1.0.0 (PD-063); the gating question is in PD-072 |
  | — | Plus interest-test card (`pricing.md` §7) | **Defer** | It advertises a plan we haven't committed to, and a device-only click count can't be read without analytics. Trigger: PLT-019 analytics live **and** the owner says charging is on the table |

  **§1 Goal date, product rules** (tickets CTO-017, GAM-013, PLT-027, LES-022):
  1. The learner picks a **target level** (a level with content, at or after the start level)
     and a **date** (after today, within 730 days) in **Profile**. Learn has a card (or, with
     no plan, one text link) and the results screen has one row.
  2. **Suggest, never auto-change:** the app shows a suggested daily goal and a one-tap "Use
     <n> XP a day". The daily goal only changes when the learner taps it.
  3. **Rule:** lessons left = not-completed lessons (checkpoints included) from the start
     level through the target level; days left = target date − today (the date itself isn't
     a study day); lessons a day = ceil(lessons left / days left); suggested goal = the
     smallest daily-goal option ≥ lessons a day × XP per lesson, else the largest. Statuses:
     reached, date-passed, on-track (current goal is enough), raise-goal, tight (more than
     the largest option). The plan is based on the daily goal, not on past pace, so it never
     judges the learner's history.
  4. **Kind copy:** "On track", "Aim for about …", "This date is tight", "Your goal date has
     come". Never "behind", "late", "failed", "exam", "test" or "pass"; no exam names
     (PD-035).
  5. **Not in onboarding** for now: an extra step costs time to first lesson (G1, ≤ 45 s).
     Revisit when PLT-019 analytics can show whether Profile-only discovery is too low.
  6. No weekly plan, reminders or history-based pace in v0.5.4. All of goal date is free
     (PD-072).

  **§2 Smart review is free without a cap.** Marketing suggested "1 session a day free,
  unlimited in Plus". Rejected: "practice is never locked" is a positioning pillar and a
  retention driver (PD-065); paid plans must add new things, not ration practice (PD-072).
- **Rationale:** goal date scores highest of the items that need no backend, serves the
  deadline learners (Priya, Amara; US-DE-07) and the daily-goal-hit-rate and D7 metrics, and
  is a small local calculation on data we already have. Smart review and the topic index are
  also local and support retention and the "German for real life" pillar. Everything that
  needs a server, a public URL, a licence or payments waits for its owner trigger instead of
  being built against mocks that would ship nothing.
- **Alternatives considered:** schedule v0.6.0 before goal date (it is blocked on the owner,
  so the team would be idle); goal date in onboarding (slower first lesson); auto-adjusting
  the daily goal (takes control from the learner and can silently set a goal too high, a D7
  risk); a mock checkpoint now (exam framing, no payments to justify it).
- **Reversibility:** High. Each item is a ticket or a planned milestone; the goal plan is one
  optional setting.

## PD-072: Pricing position (on `docs/marketing/pricing.md`)

- **Date:** 2026-11-21
- **Decision:**
  1. **Polyglow stays free, with no ads and no payments.** PRD §7 (no monetisation) stands
     through v1.0.0. The product **does not commit to charging**: whether to charge, the
     payment provider, legal set-up (Impressum, privacy, terms, withdrawal rules, the
     cancellation button), VAT and prices are **owner items** (see "Waiting on owner").
  2. **Free-tier promise, agreed as a product rule: nothing that is free becomes paid.** That
     covers everything on `main` today (all A1 and A2 lessons, checkpoints and tips; hearts
     that refill and are earned back; unlimited Practice; offline and install; no ads) and
     everything we ship free before a paid plan exists, including accounts and sync (v0.6.0),
     goal date (v0.5.4), smart review (v0.5.5), the topic index (v0.5.6) and one streak
     freeze a week (v0.7.0). A future paid plan may only **add** things; free hearts, practice
     and existing content are never made stricter to push upgrades. Public copy keeps "Free"
     and doesn't say "free forever" or publish this promise until the owner approves it.
  3. **B1 gating is open.** B1 is planned as free. If the owner wants B1 in a paid plan, that
     must be decided **before B1 merges** (after v1.0.0, PD-063); otherwise B1 ships free and
     rule 2 applies to it.
  4. Marketing's model (Plus €5.99 / €39.99, Goal Pass €14.99, regional prices, B2B seats
     about €3) is recorded as a **hypothesis**, not approved. No entitlement contract,
     paywall, price, trial or "Plus" copy is ticketed or shown in the app. The no-charge
     interest test is deferred (PD-071).
  5. If the owner decides to charge, the pm then writes a pricing milestone after v0.6.0 in
     the order of `pricing.md` §5 (accounts → entitlements contract → merchant-of-record
     integration → plan and cancel screens → renewal reminders → a Plus feature with real
     value on day one).
- **Rationale:** charging needs accounts, legal terms and a VAT set-up the team can't
  provide, and promising "free" for what exists protects trust, which is our main advantage
  over energy-limited free tiers (positioning pillar 3).
- **Alternatives considered:** adopt marketing's prices now (owner and legal items, nothing
  to sell yet); ship an interest-test card now (promotes an uncommitted plan, can't be
  measured); keep "free" undefined (marketing and future tickets need a clear line).
- **Reversibility:** Rules 1, 3, 4 are high. Rule 2 is deliberately hard to reverse; changing
  it needs a new PD and the owner's approval.

## PD-073: telc B1 Exam Prep and Einbürgerungstest courses

- **Date:** 2026-11-21 (TELC-001, owner request)
- **Reason:** the owner asked for all the content of their telc B1 web app (exam prep and
  naturalization test) in Polyglow, with lesson structure left to the team.
- **Decision:** two new available courses next to German:
  - **telc B1 Exam Prep** (`telc-b1-en-de`): exam overview → vocabulary by theme → grammar
    (theory, quiz, sentence building) → Reading, Sprachbausteine, Listening (each part
    with strategy and practice) → Writing (29 letters, building blocks, writing coach) →
    Speaking (Teil 1–3 with Redemittel and every topic/case as a task) → mock exam.
  - **Einbürgerungstest** (`einbuergerung-en-de`): one unit per topic block (overview
    card, then the questions with full English/German explanations), then 10 fixed mock
    tests of 33 questions (30 general + 3 NRW) that use every question.
  - Learners pick one at onboarding and can switch any time in Profile → Course.
- **Rationale:** the exam courses have different goals and pacing from the general course.
  Separate paths keep each one clear.
- **Reversibility:** High (registry visibility can hide a course).

## PD-074: Sound effects in lessons and a Profile "Sound effects" row

- **Date:** 2026-11-22 (LES-012, owner request)
- **Reason:** the owner asked for correct / wrong answer sounds so lessons feel like a game.
  LES-012 was planned for v1.0.0; PD-067 §6 left out a Sounds row because nothing read
  `Settings.soundEffectsEnabled`.
- **Decision:** LES-012 is pulled forward. Lessons play a correct chime, a soft wrong tone and
  a completion fanfare, synthesised with the Web Audio API (our own sounds, no files). The
  existing setting (default on) controls them, and Profile → Settings gets a "Sound effects"
  On / Off row. This replaces PD-067 §6 for sound; the Speaking row stays out until a
  feature reads `speakingExercisesEnabled`.
- **Rationale:** sound feedback is part of the game feel; the setting already exists and now
  has a reader, so the row is no longer a dead control.
- **Alternatives considered:** recorded audio files (need licensing, offline caching and
  bigger downloads); sounds without a setting (no way to mute in a quiet place). Rejected.
- **Reversibility:** High (default the setting off, or remove the row and the player calls).

## PD-075: Einbürgerungstest state questions for Niedersachsen instead of NRW

- **Date:** 2026-11-22 (TELC-004, owner request)
- **Reason:** the owner asked to replace the Nordrhein-Westfalen state questions (from the telc
  app) with the Lower Saxony ones.
- **Decision:** unit 13 of `einbuergerung-en-de` now holds the 10 Landesfragen for
  **Niedersachsen** ("NDS-1" … "NDS-10"), and each of the 10 mock tests has 30 general + 3
  Niedersachsen questions. This replaces the "3 NRW" part of PD-073.
  - Question and option texts are verbatim from the BAMF Gesamtfragenkatalog (Teil II,
    Niedersachsen, Stand 07.05.2025). The catalogue marks no solutions; the answers are
    unambiguous facts (Hannover, Ammerland, 5 years, 16, schwarz-rot-gold …).
  - The two picture questions (coat of arms, map) describe each picture in words, in the
    catalogue's order (Bild 1–4 left to right; map areas 1–4), without naming the Land in
    the options, so the question still tests recognition.
  - NRW- and Dortmund-specific notes in 30 general-question explanations are rewritten for
    Niedersachsen or made neutral. Official answer options that name NRW stay unchanged.
  - The telc app's source data is not edited: `scripts/import-telc/land-niedersachsen.mjs`
    is applied on import, and the build fails if a replacement no longer matches the source.
- **Rationale:** learners take the test in the Land where they live; NRW questions are wrong
  for anyone in Niedersachsen.
- **Alternatives considered:** a state picker for all 16 Länder (a bigger feature for later);
  keeping NRW alongside (two state units, confusing mock tests). Rejected for now.
- **Reversibility:** High (drop the module from the importer and rebuild).
- **Note:** the lesson id changes from `eb-u13-l02-nrw-1-10` to `eb-u13-l02-nds-1-10`, so a
  learner who finished the NRW lesson sees the new one as not done.

## PD-076: Einbürgerungstest picture questions show the official pictures

- **Date:** 2026-11-22 (TELC-005, owner request)
- **Reason:** the owner asked for real pictures on the questions that are answered from
  pictures. Describing the pictures in words gave the answer away.
- **Decision:** 7 questions show the pictures of the BAMF Gesamtfragenkatalog
  (Stand 07.05.2025): Q21 and Q209 (coats of arms, Bild 1–4), Q55 (photo of the Bundestag
  building), Q130 (four sample ballots), Q226 (flags, Bild 1–4), NDS-1 (coats of arms) and
  NDS-8 (map). Where the catalogue uses "Bild 1–4" or numbered pictures, the options are those
  labels and the correct option follows the catalogue. The explanation then names every
  picture. This replaces PD-075's "describe each picture in words" for these questions.
  - Q70, Q176, Q181, Q187, Q216 and Q235 also have a picture in the catalogue, but the telc
    app's versions are answerable without it; they stay text-only.
  - Every figure carries a credit line. The Q55 photo is credited
    "© Deutscher Bundestag/Achim Melde" as in the catalogue.
- **Open question for the owner:** the catalogue's photos are third-party copyright (Q55:
  Deutscher Bundestag). Before a public or paid launch, confirm the right to reuse them, or
  swap in a freely licensed photo. The coats of arms, flags, ballots and map are official
  symbols or BAMF drawings.
- **Reversibility:** High (remove an entry from `scripts/import-telc/pictures.mjs` and rebuild).

## PD-077: v0.5.4 waits for FIX-014 (goal-date link on courses without levels)

- **Date:** 2026-11-25 (PM-ACC5)
- **Reason:** CTO-017, GAM-013 and LES-022 are accepted on `main` `daffaa8`. PLT-027 is
  rejected on AC 10. On Einbürgerungstest (an available course) and en-es, Learn shows "Set a
  goal date", but Profile has no goal-date row for a course without levels, so the link opens
  nothing. The two exam courses arrived in the same milestone (TELC-001), after the tickets
  were written.
- **Decision:** v0.5.4 is **not ready for release** until **FIX-014** (dev-platform, P1) is
  merged and accepted: Learn shows no goal-date UI on courses without levels, with RTL and
  e2e tests. The pm re-checks only FIX-014; the other verdicts stand.
- **Rationale:** unlike PD-070 (a team README), this is a dead link on the first screen
  for every Einbürgerungstest learner. The draft release notes already promise "courses
  without levels show no goal". The fix is a small guard plus tests, so holding the release
  costs little.
- **Alternatives considered:** release now with FIX-014 in v0.5.5 (ships a known dead link
  and an untrue release note); hide the goal date on every course until per-course plans
  exist (removes a working feature from German and telc learners). Rejected.
- **Reversibility:** n/a (process decision).

## PD-078: The goal plan becomes per course (v0.5.5, before v0.6.0 sync)

- **Date:** 2026-11-25 (PM-ACC5, cto follow-up)
- **Reason:** CTO-017 stores one `Settings.goalPlan` for the app. With the course switch
  (TELC-001) it applies to whichever course is active, including telc B1. A German "A2 by
  12 Mar" plan then counts telc's A1 / A2 lessons, and a telc "B1 by …" plan shows as set in
  Profile on German while German's Learn says "Set a goal date". telc B1 learners are the
  clearest deadline learners (an exam date), so the goal date matters most to them.
- **Decision:**
  1. **Yes, a per-course goal is needed.** Rule for learners: the goal date always belongs
     to the course you are on. Each course has at most one plan. Changing or removing one
     course's plan never touches another's.
  2. **When:** milestone **v0.5.5**, contract first: **CTO-018** (shape, stored-data
     migration, Supabase column), then GAM-014 (hook) and PLT-028 (Profile, Learn, e2e),
     reserved now. It runs next to Smart review in the same milestone. It **must merge before
     v0.6.0's settings sync** (PLT-010 / PLT-014), so the server column has its final shape
     before any real account data exists.
  3. **Migration:** an existing single plan becomes the plan of the course that was active
     in that settings record (else the default course). No plan is lost.
  4. **v0.5.4 ships with the single plan** (after FIX-014). For a learner on one course,
     which is most learners, it is correct. The mismatch only affects course switchers and
     shows wrong numbers, not lost data.
  5. **Not now:** a date-only goal ("finish this course by …") for courses without levels
     such as Einbürgerungstest. It needs its own rule (no levels to count by) and copy that
     respects PD-035 next to an official test. Trigger: per-course plans are shipped **and**
     learners ask for it, or PLT-019 analytics show Einbürgerungstest retention needs it.
- **Rationale:** per-course plans are the honest model now that the app has several
  courses. Doing it before sync avoids a server-side data migration later. Keeping v0.5.4
  as built avoids reopening four accepted tickets for an edge case.
- **Alternatives considered:** keep one plan forever and clear it on course switch (silently
  deletes a learner's plan); store `courseId` inside the single plan and ignore it on other
  courses (a switcher can only ever have one plan, so a German + telc learner must choose);
  rebuild per-course plans inside v0.5.4 (reopens accepted tickets and delays the release).
  Rejected.
- **Reversibility:** Medium until v0.6.0 (local data migration only), low after accounts
  exist (server data).

## PD-079: Smart review product rules and ticket IDs (v0.5.5)

- **Date:** 2026-11-26 (PM-012)
- **Reason:** PD-071 #4 accepted smart review for v0.5.5 and left the IDs and rules to be
  set when the tickets are written. Today a result stores counts only, so review needs
  per-exercise data first.
- **Decision:**
  1. **IDs:** CTO-019 (per-exercise outcomes, review contracts, config), GAM-015 (selection
     rule, progress rules for review results, Practice "Review" card), LES-023 (review in the
     player, outcomes in every result, review results screen), PLT-029 (`/review` route,
     storage, e2e). GAM-014 and PLT-028 stay with the per-course goal plan (PD-078).
  2. **Only what you answered:** review uses exercises the learner already answered
     (`correct` or `incorrect` at least once) in lessons still in the course. No new content,
     no unseen exercises, no generated sentences.
  3. **Unit = one exercise** (course, lesson, exercise id), not a word: exercises are what we
     store and can replay as authored.
  4. **Schedule (simple Leitner):** a mistake makes an exercise due at once; each first-try
     correct answer in a row pushes it out by 1, 3, 7, 14, then 30 days
     (`GAME_CONFIG.reviewIntervalsDays`, tunable). Due first, fewest correct-in-a-row first,
     most overdue first.
  5. **Session:** up to 10 exercises (`reviewSessionSize`). When fewer are due, the session is
     topped up with the next ones to become due, so "Review anyway" always works once one
     exercise was answered. No daily cap (PD-071 §2).
  6. **Works like practice (PD-065):** free, costs no hearts, allowed at 0 hearts, correct
     answers earn hearts. **XP as for a lesson** (`xpPerLesson` + perfect bonus, PD-003: XP
     for any completed session, replays included), so review counts for the daily goal and
     the streak. A review is never a lesson completion: it doesn't move the path, the
     Practice list or the goal-plan count.
  7. **Storage preference:** per-exercise outcomes ride on the existing `LessonResult`
     (append-only, idempotent, already in the sync queue and guest migration) unless the
     cto's ADR finds a reason for a separate table. The schedule is derived on the device,
     never stored.
  8. **Practice entry:** a "Review" card at the top of Practice with the number of exercises
     ready; kind copy ("ready for review", never "weak" or "mistakes").
- **Rationale:** the smallest version that delivers spaced repetition with data we can
  collect now, ships in one run (one contract, three feature tickets), and keeps the
  "practice is never locked" pillar. XP for review keeps the daily goal reachable for
  learners who mostly review, which supports the daily-goal hit rate and D7 metrics.
- **Alternatives considered:** per-word scheduling (needs a word index per exercise, i.e.
  content work; rejected for now); SM-2 with ease factors (more tuning, no data to tune it
  yet); review without XP (would make review feel like it "doesn't count" for streaks);
  a daily cap or Plus-only unlimited review (rejected in PD-071 §2); only due exercises,
  with an empty "come back tomorrow" state (blocks practice on day 1).
- **Reversibility:** High for the rule and constants (pure function, config). Medium for the
  stored shape once v0.6.0 syncs it.

## PD-080: Review history starts with this release; only finished sessions count

- **Date:** 2026-11-26 (PM-012)
- **Decision:** results saved before CTO-019 have no per-exercise data and are **not**
  backfilled (the attempts were never stored). Every learner's review starts empty and fills
  as they finish lessons; the Practice card says so ("Answer exercises in any lesson and they
  come back here for review."). Only **finished** sessions (lesson, practice, review) store
  outcomes; quit and out-of-hearts sessions store nothing, as today.
- **Rationale:** a backfill would have to guess which exercises were wrong. Storing quit
  sessions would need a new record type outside the append-only result and could double
  count on a later finish; the gain (a few extra items) is small.
- **Alternatives considered:** treat every exercise of a completed lesson as "seen, correct"
  (invents data and floods review with items the learner may never have answered correctly);
  save attempts of quit sessions (more storage and sync rules). Rejected.
- **Reversibility:** High (a later ticket can store quit-session outcomes).

## PD-081: Which exercise types can be reviewed

- **Date:** 2026-11-26 (PM-012)
- **Decision:** reviewable: `multiple_choice`, `word_bank_translate`, `match_pairs`,
  `listen`, `cloze`, `choice`, `listening` (`REVIEW_EXERCISE_TYPES`). Not reviewable:
  `speak` (optional and often hidden, never costs hearts), `task` (open writing / speaking,
  never graded), `explain` (a card, no answer). Exam-course `choice` / `listening` items
  (telc, Einbürgerungstest) are reviewable like any other.
- **Rationale:** review needs a right / wrong outcome to schedule; ungraded items have none.
- **Reversibility:** High (one constant).

## PD-082: Start level and daily goal stay global when goal plans become per course

- **Date:** 2026-11-26 (PM-012, completing CTO-018)
- **Decision:** only the goal plan becomes per course (PD-078). `startLevel` and
  `dailyGoalXp` stay one value for the app. A plan for a course that is unknown, hidden or
  has no levels is kept and not shown, never deleted.
- **Rationale:** the daily goal is the learner's habit setting, not a course plan, and no
  learner has asked for per-course start levels; widening CTO-018 would delay the v0.6.0
  settings shape for no known need.
- **Trigger to revisit:** course switchers report a wrong start level or path after a switch.
- **Reversibility:** High until v0.6.0, medium after (server column).

## PD-083: v0.5.5 is released with two non-blocking follow-ups (FIX-015, CTO-021)

- **Date:** 2026-11-27 (PM-ACC6)
- **Reason:** on `main` `6bb29a4` all eight v0.5.5 tickets pass every criterion except
  PLT-029 AC 10. On `/review` the error state's second button says "Back to Learn" but goes
  to `/practice`; the ticket asks for "Back". Separately, ADR-018 §5 says the deprecated
  `SettingsPatch.goalPlan` is removed right after PLT-028 merges, and it is still in the type.
- **Decision:**
  1. **v0.5.5 is ready for release.** PLT-029 is accepted with AC 10 moved to **FIX-015**
     (dev-lessons + one line by dev-platform, P2), scheduled for the next milestone.
  2. **CTO-021** (cto, P1, planned): remove `SettingsPatch.goalPlan` and its doc comment. It
     doesn't block v0.5.5 but **must merge before PLT-010 / PLT-014 start**, so the v0.6.0
     sync never carries a legacy write. The schema field `Settings.goalPlan` stays until
     the release after sync is live, as ADR-018 §5 says.
- **Rationale:** the label is wrong only in a rare error state (the queue or every lesson
  failed to load), the button leads to a sensible screen, and nothing is lost. That is like
  PD-070 (a README) and unlike PD-077 (a dead link on the first screen for every
  Einbürgerungstest learner). No feature writes `SettingsPatch.goalPlan` any more, so
  learners can't notice it; the risk is only for future sync code, which CTO-021 removes in
  time.
- **Alternatives considered:** hold the release for FIX-015 (delays a working retention
  feature for one word); fix the label inside the release PR (crosses dev lanes in a cto
  PR); leave `SettingsPatch.goalPlan` until v0.6.0 (a sync author could use the wrong write
  path). Rejected.
- **Reversibility:** n/a (process decision).

## PD-084: The exam-prep courses before a public launch (MKT-002)

- **Date:** 2026-11-27 (PM-013, on `docs/marketing/feature-proposals.md` §11 and
  `waiting-on-owner.md` A7 / A8)
- **Reason:** "telc B1 Exam Prep" (`telc-b1-en-de`) and "Einbürgerungstest"
  (`einbuergerung-en-de`) are available on `main` since v0.5.4 (PD-073, owner request).
  - **Names:** their course titles, the level title "B1 · telc exam" and the description
    "every part of the telc Deutsch B1 exam" name exams in in-app copy, which PD-035 forbids.
    PD-073 was an owner-requested exception for the courses' existence, not a decision on
    public copy.
  - **Licences:** the telc material was imported from the owner's own web app, and nobody has
    confirmed that it contains no exam-provider material. Einbürgerungstest uses the BAMF
    Gesamtfragenkatalog text and pictures, including the third-party Bundestag photo on Q55
    (PD-076 open question). Both licences are **owner items** (A7); the name check is the
    PD-035 owner item (A8).
  - A public URL publishes every available course, whether or not marketing mentions it.
- **Decision:**
  1. **Default: hide both courses at public launch.** Before the public URL goes live (v1.0.0
     launch gate, or earlier if the owner publishes a URL sooner), both courses are set to
     `hidden` in the course registry, the same mechanism as `en-es` (PD-030): not offered in
     onboarding or Profile → Course. A device that already uses one of them keeps it, as for
     Spanish guests. Planned ticket **PLT-030** (dev-platform with the cto, v1.0.0 gate).
  2. **They come back only when both owner items are done for that course:**
     - **A7 (licence) cleared:** the owner confirms in `OWNER-NOTES.md` that the content may be
       published (for Einbürgerungstest including the pictures; or the Q55 photo is replaced by
       a freely licensed one or dropped, PD-076). Without this a course stays hidden whatever
       its name; a rename doesn't fix a licence.
     - **A8 (names) answered:** if the owner's legal check allows the exam names, the titles
       stay and each course gets one line on its first lesson and in Profile → Course: "Not
       affiliated with the exam provider or any authority. Check official sources for the
       current rules." If the check doesn't allow them, or there is no answer, the pm renames
       them in `/content` (CON ticket at that time): working titles **"German B1 Intensive"**
       (with level title "B1 · Intensive" and a description without exam names) and
       **"Life in Germany: Citizenship Questions"**, with the same "not affiliated" line.
  3. **Until launch nothing changes:** both courses stay available on today's private build
     (the owner uses them), and v0.5.5 isn't affected. Marketing keeps them out of all public
     copy and screenshots (`positioning.md` §5b) until point 2 is done.
  4. PD-035 stays the rule for public copy. Any future exam-named course needs the same two
     checks before it is public.
- **Rationale:** both risks (trademark names, copyright in imported or official material) are
  legal, can't be fixed by the team, and the owner may need time. Hiding is one registry flag,
  fully reversible, keeps the owner's own use, and leaves the launch on the courses we wrote
  ourselves (A1 + A2, PD-036). Marketing also found the citizenship-test field crowded with
  apps using the same catalogue (`feature-proposals.md` §11), so the courses are a weak
  acquisition hook compared with the risk.
- **Alternatives considered:** keep them public with a disclaimer only (doesn't solve
  licences or PD-035); rename now (rewrites the owner's course before the legal answer, and
  still leaves the licence question); delete them (loses owner-requested content that may
  well be cleared). Rejected.
- **Reversibility:** High (registry flag and course titles).
