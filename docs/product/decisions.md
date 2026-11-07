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
