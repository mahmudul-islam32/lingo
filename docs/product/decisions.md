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
| Native-speaker review of German content | pm self-review against CDS-1…13; a "needs native review" list kept in CON-DE-A1-QA | PD-038 |
| Legal check of mentioning exam names in marketing | No exam brand names in the app or store copy | PD-035 |

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
