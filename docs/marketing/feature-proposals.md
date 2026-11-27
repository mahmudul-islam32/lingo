# Feature proposals from marketing

**Owner:** marketing · **Ticket:** MKT-002 (first version MKT-001) · **Last updated:** 2026-11-27 ·
**Valid for:** v0.5.4 on `main`

**Status of every open item: proposal.** The pm decides, turns accepted items into tickets and
records the decision in `docs/product/decisions.md`. Marketing does not write tickets or change
the roadmap. The pm's decisions on the first list are in **PD-071** (2026-11-21); this page now
shows them next to each item.

Sources `[Sn]` refer to `market-research.md` §7 (S1–S31 accessed 2026-11-20; S32–S34 accessed
2026-11-27, see §8 there). Effort is a rough marketing guess (S = days, M = 1–2 weeks, L =
several weeks or an owner dependency) for the cto and pm to correct.

## Shipped and in progress

| Old rank | Proposal | Status | What shipped vs. what we proposed | Marketing follow-up |
|---|---|---|---|---|
| 1 | **Goal date** | **Shipped in v0.5.4** (2026-11-26; CTO-017, GAM-013, PLT-027, LES-022, FIX-014) | Set in Profile, not onboarding (PD-071 §1.5). The plan **suggests** a daily goal and never changes it (§1.2). Kind statuses instead of our "on track / behind" line (§1.4). No goal on courses without levels (Einbürgerungstest, Spanish; FIX-014). One plan for the whole app until v0.5.5 makes it per course (PD-078). Free (PD-072) | Now proof point P17 (`positioning.md`). Kit updated (landing section, social #11/#12, ad #6, store, email, press). Missing screenshot requested (shot list §C #1–3). Measure adoption once G5 exists (`launch-plan.md` §5) |
| 4 | **Smart review in Practice** | **In progress: v0.5.5 "Smart review"** (tickets CTO-019, GAM-015, LES-023, PLT-029 written 2026-11-26; none released) | Per exercise, not per word (PD-079 §3). Simple Leitner schedule 1, 3, 7, 14, 30 days, up to 10 exercises, topped up so "Review anyway" always works (§4–5). **Free with no daily cap**: our "1 a day free, unlimited in Plus" idea was rejected (PD-071 §2), which we support: it keeps "practice is never locked" true. XP counts for goal and streak; never moves the path (§6). History starts empty (PD-080) | DRAFT copy ready, clearly marked, publish only after v0.5.5 ships: social #13, landing section, store line, ad #7. Pre-publish checklist in `kit/social-posts.md` #13 |

**Numbering:** other documents and PD-071 use the **old** numbers (#1–#10 from MKT-001); the
"Was" column below maps them. New items are referred to by section (§11, §12).

## Scoring

Each open proposal gets 1–5 for impact on **A**cquisition, **R**etention and Re**v**enue. Rank
is by total, with ties broken by effort (lower first), then by whether the pm has already
accepted it.

## Open proposals, re-ranked 2026-11-27

| Rank | Was | Proposal | A | R | Rev | Total | Effort | Segment | PM decision (PD-071) | Change since 2026-11-20 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | Accounts, cloud sync and a public URL (v0.6.0) | 3 | 4 | 5 | 12 | L | All | Accepted; waits on the owner's hosted Supabase | Now also the only way a goal date and review history survive a phone change. Still the launch blocker |
| 2 | 3 | Recorded German audio for every listen exercise | 3 | 4 | 3 | 10 | M (owner licence) | All | Accepted, v1.0.0, gated on the TTS licence | Unchanged. Review (v0.5.5) will replay listen exercises too (PD-081), so silent devices hit "Audio isn't available" more often |
| 3 | 5 | "Life in Germany" topic index and landing pages | 5 | 2 | 2 | 9 | S | S6, S1 (Sam, Priya) | Index accepted (v0.5.6); landing pages wait for the public URL | Unchanged. Pages can also carry the goal-date SEO terms (`kit/seo-keywords.md`) |
| 4 | 6 | Shareable level and streak card | 4 | 3 | 1 | 8 | S | All | Deferred to v1.0.0; trigger public URL | **New share moment:** the goal card's "You've finished A2. Well done!" (v0.5.4) is a natural place for "Share" once the URL exists. Wording stays "finished the A2 path", never "certified" |
| 5 | 7 | Reminders and streak protection (Web Push, streak freeze) | 1 | 5 | 2 | 8 | M | All | Accepted, v0.7.0 after accounts | Goal-date learners now have a daily target, so an opt-in reminder ("2 lessons today keeps your A2 plan on track") would serve them. Consent and GDPR note by the cto first |
| 6 | 9 | Typed answers, then speaking | 2 | 3 | 3 | 8 | L | S3, S5 | Already planned (LES-011 v1.0.0, B1-T2 v1.1.0) | Unchanged |
| 7 | 8 | Mock level checkpoint (timed, with a can-do report) | 2 | 2 | **3** | **7** | M | S3, S1, S5 | Deferred; trigger B1 merged and a go on paid plans | **Revenue score lowered 4 → 3:** PD-072 keeps the app free through v1.0.0, so a paid feature has no near-term revenue. An untimed can-do summary on checkpoint results stays a good small idea (PD-071) |
| 8 | 10 | Teacher / cohort view (B2B pilot) | 1 | 2 | 4 | 7 | L | S2, S4 | Deferred; trigger v0.6.0, a pilot request, legal set-up | Unchanged |
| 9 | new | **Goal-date prompt after the first lesson** (not in onboarding) | 2 | 3 | 1 | 6 | S | Priya, Amara | **New, for the pm**; PD-071 §1.5 says revisit when analytics exist | See §12 below. Lowest because it should wait for G5 data |

**Not scored, but urgent before the public URL (flag for the pm and owner):** §11, clear the
exam-prep courses for public use or hide them at launch. It is legal hygiene rather than a
growth feature, so the A/R/Rev score doesn't fit it; it is listed here so it isn't missed.

---

## Unchanged proposals (details from MKT-001)

The full texts of #2 Accounts, #3 Audio, #5 Topics, #6 Share card, #7 Reminders, #8 Mock
checkpoint, #9 Typed/speaking and #10 B2B are unchanged from MKT-001 (2026-11-20) and are
kept below in short form. The pm's decisions in PD-071 answer most of their open questions.

### Accounts, cloud sync and a public URL (old #2)
- **Proposal:** v0.6.0 as the top engineering priority once the owner provides hosted
  Supabase, with a public URL at the same time.
- **Evidence:** no charging, restore or leagues without accounts (`pricing.md`). Device-only
  progress is lost with a new phone or cleared browser data. Since v0.5.4 that includes the
  learner's goal date, and from v0.5.5 their review history.
- **Answered (PD-071):** email and Google sign-in; cookieless, consent-based analytics need a
  cto note before PLT-019.

### Recorded German audio (old #3)
- **Proposal:** decide the TTS licence (owner, PRD Q7) and ship pre-generated `de-DE` audio.
- **Evidence:** some devices show "Audio isn't available" with Skip (README); all official
  exams test listening (pm §3); first impression [S19].
- **Answered (PD-071):** copy never says "native" unless human-recorded.

### "Life in Germany" topic index and landing pages (old #5)
- **Proposal:** a topic list that jumps to the matching lessons, plus one public page per topic.
- **Evidence:** 50 % of expats found life hard without German (2023) [S24]; "apps don't prepare
  you for life in Germany" [S22]; content already exists.
- **Answered (PD-071):** topics respect path locks (PD-064); pages wait for the URL.

### Shareable level and streak card (old #6)
- **Proposal:** "Share" at a checkpoint, a streak milestone or (new) a reached goal date: an image
  with Lumi, the level, the streak and the app URL (Web Share API), no personal data.
- **Evidence:** cheapest acquisition channel, pm hypothesis H1; WhatsApp-heavy markets (est.).

### Reminders and streak protection (old #7)
- **Proposal:** opt-in daily reminder at a chosen time and one free streak freeze a week.
- **Evidence:** standard for habit apps; streak loss drives quitting [S21]. iPhone web push only
  for installed apps (cto to confirm).
- **Answered (PD-071):** v0.7.0, freeze free (1 a week).

### Mock level checkpoint (old #8)
- **Proposal:** an optional timed version of the checkpoints with a can-do report; not an exam
  copy (PD-035).
- **Evidence:** deadline learners pay for certainty [S17][S18].
- **Answered (PD-071):** deferred (timer vs. kind feedback, not enough items, no payments).

### Typed answers, then speaking (old #9)
- **Evidence:** all official exams test four skills; paid tools charge for feedback [S14][S16].

### Teacher / cohort view, B2B pilot (old #10)
- **Evidence:** health professions are the largest recognised group [S10]; 2026 integration
  course cuts [S2]; teacher tools valued [S20]; pm H4.
- **Answered (PD-071):** deferred until accounts, a pilot request and the owner's legal set-up.

---

## 11. Clear the exam-prep courses for public use, or hide them at launch (new)

- **Proposal (pm and owner, not a dev feature):** before the public URL goes live, decide one
  of two things for "telc B1 Exam Prep" and "Einbürgerungstest" (on `main` since v0.5.4,
  TELC-001, PD-073):
  1. **Clear them:** the owner confirms the content licences (telc material imported from the
     owner's web app; BAMF catalogue text and pictures, incl. the third-party Bundestag photo,
     PD-076) and the legal check on exam names (PD-035 owner item). The pm then decides whether
     the in-app course titles may keep the exam names or get neutral ones, and marketing writes
     separate copy; or
  2. **Hide them at launch** through registry visibility (PD-073 says this is reversible) until
     option 1 is done.
- **Evidence:** PD-035 forbids exam names in in-app and store copy and forbids copying exam
  tasks; PD-076 says the photo rights must be confirmed "before a public or paid launch". A
  public URL makes these courses public whether or not marketing mentions them. The
  citizenship-test practice field is crowded with dedicated apps that all use the same official
  catalogue, several with "not a government agency" disclaimers [S32], so the course is a weak
  acquisition hook and a real legal risk.
- **Segment:** S3, S4 (later B1 / citizenship learners).
- **Effort:** S for the team (one registry flag or a title change); the licence work is the
  owner's.
- **Open questions:** does PD-073 override PD-035 for course titles? If the courses stay, do
  they need an in-app line "not affiliated with the exam provider or BAMF; check official
  sources" (pm / owner)?

## 12. Goal-date prompt after the first lesson (new)

- **Proposal:** keep onboarding as it is (PD-071 §1.5, time to first lesson ≤ 45 s), but show
  the existing "Have a date in mind? Set a goal date" link once on the **results screen of the
  first finished lesson** of a course with levels, for learners with no plan.
- **Evidence:** the goal date is our clearest message for deadline learners (Priya, Amara; ~72,500
  spouse visas needing A1 in 2024 [S9]; 11,497 opportunity-card visas [S8]), but today it is
  found only in Profile and as a small link on Learn. A one-time prompt at a moment of success
  costs no onboarding time.
- **Segment:** Priya, Amara.
- **Effort:** S (copy exists in `goal-plan-copy.ts`; one row on results).
- **Why rank 10:** PD-071 §1.5 asks for PLT-019 analytics before changing discovery. Marketing
  agrees: propose it, measure Profile-only adoption first (`launch-plan.md` §5), then decide.

---

## Considered, not in the top 10

- **Date-only goal for courses without levels** (e.g. "finish the citizenship-test course by
  …"): PD-078 §5 says "not now". Marketing agrees while that course isn't cleared (#11).
- **State questions for all 16 Länder** in the Einbürgerungstest course (PD-075 mentions it as
  "a bigger feature for later"): only Niedersachsen is on `main`, so the course is wrong for 3 of
  33 mock-test questions elsewhere. Only worth doing if #11 clears the course.
- **Explanations after every answer in the German course:** a big competitor reportedly made
  its answer explanations free for all users in January 2026 [S33, secondary, verify]. Our
  "a tip before every lesson" message is still true but less unique. Worth a pm look at the
  German feedback panel once Smart review ships.
- **UI in Ukrainian, Arabic, Turkish:** large in-country groups [S1], L effort (RTL); Phase 3
  (PD-031).
- **Leagues:** need accounts and many users (PRD §6.2); after #1.
- **AI conversation partner:** rejected for now (PD-071).
- **B1:** planned v1.1.0, merges after v1.0.0 (PD-063). B1 is the level for settlement and
  citizenship (333,343 naturalisations in 2025 [S7]); its paid/free status is open (PD-072 §3).
