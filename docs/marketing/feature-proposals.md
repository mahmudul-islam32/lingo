# Feature proposals from marketing

**Owner:** marketing · **Ticket:** MKT-001 · **Last updated:** 2026-11-20
**Status of every item: proposal.** The pm decides, turns accepted items into tickets and
records the decision in `docs/product/decisions.md`. Marketing does not write tickets or change
the roadmap.

Sources `[Sn]` refer to `market-research.md` §7 (accessed 2026-11-20). Effort is a rough
marketing guess (S = days, M = 1–2 weeks, L = several weeks or an owner dependency) for the cto
and pm to correct.

## Scoring

Each proposal gets 1–5 for impact on **A**cquisition, **R**etention and Re**v**enue. Rank is by
total, with ties broken by effort (lower first).

| Rank | Proposal | A | R | Rev | Total | Effort | Segment |
|---|---|---|---|---|---|---|---|
| 1 | Goal date ("my exam / move is on …") | 4 | 4 | 4 | 12 | S–M | S1, S3, S5 (Priya, Amara) |
| 2 | Accounts, cloud sync and a public URL (v0.6.0) | 3 | 4 | 5 | 12 | L | All |
| 3 | Recorded German audio for every listen exercise | 3 | 4 | 3 | 10 | M (owner licence) | All |
| 4 | Smart review in Practice (spaced repetition of weak words) | 2 | 5 | 3 | 10 | M | All |
| 5 | "Life in Germany" topic index and landing pages | 5 | 2 | 2 | 9 | S | S6, S1 (Sam, Priya) |
| 6 | Shareable level and streak card | 4 | 3 | 1 | 8 | S | All |
| 7 | Reminders and streak protection (Web Push, streak freeze) | 1 | 5 | 2 | 8 | M | All |
| 8 | Mock level checkpoint (timed, with a can-do report) | 2 | 2 | 4 | 8 | M | S3, S1, S5 |
| 9 | Typed answers, then speaking | 2 | 3 | 3 | 8 | L | S3, S5 (four-skill exams) |
| 10 | Teacher / cohort view for courses and agencies (B2B pilot) | 1 | 2 | 4 | 7 | L | S2, S4 (agencies, schools) |

Note: #2 ties with #1 on score and ranks second only on effort. It is the **prerequisite** for
charging, push reminders, leagues and B2B (#7, #10, `pricing.md`), so the pm may well schedule
it first; #1 needs no backend and can ship meanwhile.

---

## 1. Goal date

- **Proposal:** in onboarding or Profile, "Do you have a date?" Learner picks a target (end of
  A1 or A2) and a date. The app shows the lessons left, suggests a daily goal and a "on track /
  behind" line on the Learn tab. No exam names, no pass promise (PD-035).
- **Evidence:** deadlines drive this market: ~72,500 spouse visas in 2024 needing A1 [S9],
  11,497 opportunity-card visas [S8], students with semester dates [S4]. 38 % fail after a
  prep course [S9]. The pm already lists "deadline mode" as a Phase 2 idea
  (`market-analysis-german.md` §5.5).
- **Segment:** Priya, Amara, students.
- **Effort:** S–M (local calculation from lesson count and daily goal; no backend needed).
- **Open questions:** does the goal change the daily XP goal automatically or only suggest?
  How to keep it kind when the learner falls behind (no guilt)?
- **Marketing use:** strongest acquisition hook for deadline learners and a natural paid
  "pass" later (`pricing.md` §3).

## 2. Accounts, cloud sync and a public URL

- **Proposal:** keep v0.6.0 as the top engineering priority once the owner provides hosted
  Supabase, and put the app at a public URL at the same time (it is the launch blocker).
- **Evidence:** you cannot charge, restore a purchase or run leagues without an account
  (`pricing.md`). Device-only progress is lost when a phone is replaced or the browser data is
  cleared, which hurts retention and trust. Leagues already have a tab that says they arrive
  with accounts (PD-068).
- **Segment:** all; most for Sam (phone + laptop) and paying users.
- **Effort:** L (already planned; blocked on owner hosting).
- **Open questions:** Google sign-in only, or email too, at launch? Is there a consent-based,
  cookieless analytics option the cto can approve so we can measure D1/D7 (needs a cto
  technical note)?

## 3. Recorded German audio

- **Proposal:** decide the TTS licence (owner item, PRD Q7) and ship pre-generated `de-DE`
  audio for every listen exercise, replacing device speech where available.
- **Evidence:** today some devices show "Audio isn't available" with Skip (README). All
  official exams test listening (pm §3). Reviews of free courses criticise thin feedback
  [S19]; audio quality is the first thing a new user hears.
- **Segment:** all; most for Android users in India and Africa whose devices may lack a German
  voice (est.).
- **Effort:** M plus an owner licence decision.
- **Open questions:** which provider and licence allow commercial use offline? Total audio
  size for 130 lessons, and does it fit the offline cache on low-end phones?
- **Marketing use:** unlocks the claim "listen to every sentence" (still not "native speaker"
  unless it is human-recorded).

## 4. Smart review in Practice

- **Proposal:** Practice already replays finished lessons. Add a "Review" button that builds a
  short session from the words and sentences the learner got wrong or hasn't seen for a while
  (spaced repetition), earning hearts as Practice does today.
- **Evidence:** the PRD already lists practice of weak words as Phase 2 (§6.2). Learners
  plateau and forget between levels [S22]; free practice is our differentiator against the
  energy model [S21].
- **Segment:** all.
- **Effort:** M (needs per-item results stored locally; no backend).
- **Open questions:** does it need a contract change (cto)? Should review be part of the free
  core or Plus? Marketing suggests **free basic review, Plus for unlimited smart review**.

## 5. "Life in Germany" topic index and landing pages

- **Proposal:** a list of real-life topics (Anmeldung, doctor, supermarket, train, flat,
  work, letters) that jumps to the matching lessons, plus one public landing page per topic
  that dev-platform builds from our copy.
- **Evidence:** expats find life hard without German (50 % in 2023) [S24]; criticism that
  general apps don't prepare you for life in Germany [S22]; the content already exists in A1
  and A2. Topic pages are the best SEO surface we have (`kit/seo-keywords.md`).
- **Segment:** Sam, Priya.
- **Effort:** S (content mapping by pm; a simple screen and static pages by dev-platform).
- **Open questions:** does jumping to a topic skip the path order? Who owns the landing pages
  (dev-platform code, marketing copy)?

## 6. Shareable level and streak card

- **Proposal:** at a checkpoint or streak milestone, "Share" makes an image with Lumi, the
  level ("I finished CEFR A1 on Polyglow"), the streak and the app URL, using the Web Share API.
  No personal data beyond what the learner chooses to share.
- **Evidence:** organic sharing is the cheapest acquisition channel and is pm hypothesis H1
  (`market-analysis-german.md` §6). WhatsApp-heavy markets (India, Nigeria) share images
  easily (est.).
- **Segment:** all.
- **Effort:** S.
- **Open questions:** wording that avoids sounding like a certificate (PD-035): "finished our
  A1 path", never "certified A1".

## 7. Reminders and streak protection

- **Proposal:** optional daily reminder (Web Push, opt-in only) at a time the learner picks,
  and one free streak freeze per week.
- **Evidence:** daily reminders are standard for habit apps and in PRD Phase 2; streak loss
  is the most common reason people quit a habit app after a long streak [S21]. On iPhone, web
  push works only for installed home-screen apps (est., cto to confirm).
- **Segment:** all.
- **Effort:** M (push needs a server, so it follows accounts).
- **Open questions:** consent and GDPR wording (cto note); freeze free or Plus?

## 8. Mock level checkpoint

- **Proposal:** an optional timed version of the A1 and A2 checkpoints with a can-do report
  ("You can introduce yourself, ask for an appointment …"). Not a copy of any exam format
  (PD-035).
- **Evidence:** deadline learners pay hundreds for certainty (€695 self-study course [S17],
  INR 7,000–9,400 per exam attempt [S18]); the pm lists mock checkpoints as a paid feature
  (`market-analysis-german.md` §3, §6 H2).
- **Segment:** Amara, Priya, students.
- **Effort:** M (reuses checkpoint content; needs a timer and a report screen).
- **Open questions:** enough checkpoint items for a repeatable mock? Plus-only?

## 9. Typed answers, then speaking

- **Proposal:** add typed translation (with umlaut/ß tolerance) to train writing, then enable
  the speaking exercise for German where the browser supports it.
- **Evidence:** all official exams test four skills; our engine trains writing "hardly at all"
  (pm §3). Paid competitors charge extra for speaking and writing feedback [S14][S16].
- **Segment:** Amara, students, later B1 learners.
- **Effort:** L.
- **Open questions:** German answer normalisation for typed input (cto); privacy of
  microphone use.

## 10. Teacher / cohort view (B2B pilot)

- **Proposal:** after accounts, a simple view where a teacher or recruiter sees a group's
  progress (lessons done, level, streak) with the learners' consent. Pilot with 2–3 nursing
  agencies or language schools.
- **Evidence:** health professions are the largest group of recognised foreign
  qualifications [S10]; Indian nursing recognitions +50 % [S10]; integration-course seats were
  cut in 2026, so schools need self-study tools [S2]; the free vhs-Lernportal shows teacher
  tools are valued [S20]. pm hypothesis H4 (€3–6 per learner per month).
- **Segment:** S2, S4 via organisations.
- **Effort:** L (accounts, roles, consent, a new screen).
- **Open questions:** data-protection agreement (owner/legal); does B1–B2 healthcare content
  need to exist first?


---

## Considered, not in the top 10

- **UI in Ukrainian, Arabic, Turkish:** large in-country groups [S1], but L effort (RTL) and
  already planned by the pm as Phase 2.
- **Leagues:** need accounts and many users to feel alive (PRD §6.2); after #2.
- **AI conversation partner:** popular in paid tiers [S14], but accuracy and cost risks; revisit
  after B1.
- **B1:** already planned (v1.1.0). Marketing's only ask: B1 is the level for settlement and
  citizenship (333,343 naturalisations in 2025 [S7]), so it is the strongest reason to pay.
