# Launch and growth plan

**Owner:** marketing · **Ticket:** MKT-001 · **Last updated:** 2026-11-20
**Status:** plan. Marketing prepares every post, email and ad as a draft in `docs/marketing/kit/`.
**Only the owner publishes, posts, signs up or spends money.**

Sources `[Sn]` refer to `market-research.md` §7 (accessed 2026-11-20).

---

## 1. Launch gate (must be true before Day 0)

| # | Gate | Owner | Status 2026-11-20 |
|---|---|---|---|
| G1 | The app is on a public URL (`APP_URL` in the kit) | **owner** (hosting), cto | Not done |
| G2 | Domain and trademark check for "Polyglow" | **owner** | Open (STATUS, PD-001) |
| G3 | Impressum and privacy policy on the site (German law for a public website) | **owner** | Not done |
| G4 | A way to hear from users (feedback email or form) | **owner** sets up the inbox; dev-platform links it | Not done |
| G5 | Privacy-friendly, consent-based measurement of the metrics in §5 | cto technical note, then dev-platform | Not done |
| G6 | Kit copy re-checked against `main` on launch day | marketing | Ready for v0.5.3 |

**Strongly recommended before paid ads (not before the free launch):** the native-speaker
review of A1 (owner, STATUS) and recorded audio (proposal #3). Paid traffic judges quality fast.

## 2. Channels

| Channel | Segment | Cost | Why | Draft in kit |
|---|---|---|---|---|
| **Reddit** (r/German, r/germany, r/Expats_in_Germany-type subs, r/IWantToLearn, city subs) | Sam, Tom, Priya | €0 | Where learners ask "which app for German?" Follow each sub's self-promotion rules; post as the maker, ask for feedback | `social-posts.md` #1–2 |
| **Show HN / dev communities** | Early adopters, press | €0 | "Built by a team of AI agents" is a real, unusual story (README); owner decides whether to tell it | `press-note.md` |
| **Product discovery sites** (Product Hunt-type launch day) | Tom, early adopters | €0 | One-day spike, backlinks | `store-listing.md` short texts |
| **Facebook and WhatsApp/Telegram groups** for Indians/Nigerians moving to Germany, spouse-visa groups, nurses' groups | Priya, Amara | €0 | High-intent, Android, word-of-mouth; only where admins allow | `social-posts.md` #3–6 |
| **Instagram / YouTube Shorts / TikTok** with screen recordings from `docs/media/` | Priya, Tom | €0 (owner's time) | Short "German at the Bürgeramt in 15 seconds" clips | `social-posts.md` #7–10, `screenshot-shot-list.md` |
| **LinkedIn** (owner's profile) | Priya, Sam, B2B | €0 | Skilled workers and recruiters | `social-posts.md` #5 |
| **SEO: topic landing pages** | Sam, Priya | €0 + dev time | Long-term free traffic; "how to say … in German", "Anmeldung German phrases" | `seo-keywords.md`, proposal #5 |
| **PWA / web-app directories** and, later, **Google Play** via a Trusted Web Activity ($25 one-time [S26]) | Priya (Android) | €0–25 | Store presence where people search | `store-listing.md` |
| **Partnerships**: university international offices, student unions, relocation agencies, expat meetups, integration-course teachers, nursing-recruitment agencies | Students, Sam, nurses | €0 | Trusted intermediaries; later B2B | `launch-email.md` (partner version) |
| **Email to people who asked** (waitlist, only with consent) | All | €0 | Highest conversion | `launch-email.md` |
| **Paid search and social ads** | Priya (India), Sam (DE) | Budget options §3 | Test messages fast; only after G1–G5 | `ads.md` |

**Never:** buy followers, reviews or email lists; post in groups that forbid promotion; message
people who did not opt in; use competitor names in ads or keywords in public copy.

## 3. Budget options

**Option 0: €0 (recommended start).** Owner's time only: about 3–5 hours a week posting the
kit drafts, answering comments and contacting partners. Expected result (est.): a few hundred to
a few thousand visitors in the first month, mostly from Reddit and discovery sites.

| Option | Monthly | Mix | Use it when |
|---|---|---|---|
| **A: €100** | €100 | Search ads on "learn German app" / "German A1 practice" style terms in India (low cost per click, est.) | G1–G5 done, D1 retention ≥ 25 % on organic users |
| **B: €500** | €500 | €250 India search + €150 Meta (Instagram) in India and DE + €100 for a short creator video | Option A shows a cost per activated learner below €1 (est. target) |
| **C: €2,000** | €2,000 | €800 search (IN, DE, UK, US), €700 Meta, €500 two creators (Germany-life or study-abroad YouTubers) | Paid plans exist (`pricing.md`) and payback is measurable |

Every euro is spent by the owner, from the owner's ad accounts. Marketing prepares the ads,
keywords and targeting notes only.

## 4. 30 / 60 / 90-day plan

Day 0 = the day G1–G5 are done.

### Days 1–30: soft launch, learn

| Week | Actions | Output |
|---|---|---|
| 1 | Owner posts the launch post on 2–3 subreddits and one discovery site; sends the launch email to friends and any opted-in contacts; shares on LinkedIn | First 200–500 visitors (est.) |
| 2 | Answer every comment; collect bugs and quotes (with permission) in a feedback log; marketing updates the kit to fix what confused people | Feedback log |
| 3 | Owner contacts 10 partners (university international offices, expat groups, 3 nursing agencies) using the partner email | 2–3 replies (est.) |
| 4 | First metrics review against §5; marketing writes a short report and new proposals | Report in `docs/marketing/` |

### Days 31–60: content and SEO

- dev-platform ships the first 5 "life in Germany" topic landing pages from our copy (if the pm
  accepts proposal #5).
- Owner posts 2 short videos a week from the shot list (`kit/screenshot-shot-list.md`).
- Run the free interest test for Plus (`pricing.md` §7) if the pm and cto agree.
- If D1 ≥ 25 % and D7 ≥ 10 %: start budget Option A for 2 weeks with the 5 ad variants.

### Days 61–90: scale what works

- Keep the best 2 channels by cost per activated learner; drop the rest.
- Pilot conversation with 1–2 agencies or schools (proposal #10), no contract until accounts exist.
- Refresh the kit for the next release (accounts, audio or B1 when they reach `main`).
- Decide with the pm and owner: build payments now, or wait for B1.

## 5. Metrics and targets

Definitions follow the PRD (§5). Targets are first-90-day targets (est.) and need the
measurement in G5. No personal data; aggregate counts with consent.

| Stage | Metric | Definition | Target (90 days) |
|---|---|---|---|
| Acquisition | Visitors | Unique visits to the app or landing page per month | 5,000 by day 90 |
| Acquisition | Installs | PWA "add to home screen" accepted | 10 % of visitors who finish a lesson |
| Activation | First lesson completed | % of new visitors who finish lesson 1 | ≥ 50 % (PRD target ≥ 70 % of starters) |
| Activation | Time to first exercise | Median from first load | ≤ 45 s (PRD) |
| Retention | D1 | Finished ≥ 1 lesson the day after day 1 | ≥ 30 % (PRD) |
| Retention | D7 | Same on day 7 | ≥ 12 % (PRD) |
| Retention | D30 | Same on day 30 | ≥ 5 % (est.) |
| Engagement | Daily goal hit rate | % of active learner-days with the goal reached | ≥ 50 % (PRD) |
| Engagement | A1 checkpoint reached | % of A1 starters reaching the checkpoint within 60 days | ≥ 5 % (est.) |
| Referral | Share rate | Shares per 100 active learners per week (after proposal #6) | ≥ 2 (est.) |
| Revenue (later) | Interest-test click rate | % of A1 finishers tapping "Tell me" | ≥ 5 % |
| Revenue (later) | Paid conversion | % of monthly active learners paying | 2–3 % in year 1 (est.; leader ~9 % [S11]) |
| Channel | Cost per activated learner | Ad spend ÷ new learners who finish lesson 1 | < €1 India, < €3 DE (est.) |

## 6. Owner items for the launch

1. Hosting and a public URL; domain; trademark check (G1, G2).
2. Impressum, privacy policy, feedback inbox (G3, G4).
3. Publish each kit draft where it says, from the owner's own accounts.
4. Approve any spend and run the ad accounts (Options A–C).
5. Native-speaker review of A1 before paid ads (recommended).
6. Decide whether to tell the "built by AI agents" story in public (`kit/press-note.md`).

The orchestrator should list these under "Waiting on owner (non-blocking)" in `docs/STATUS.md`
(marketing does not edit STATUS).
