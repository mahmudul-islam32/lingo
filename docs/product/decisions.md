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
