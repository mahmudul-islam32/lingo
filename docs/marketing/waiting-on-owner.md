# Waiting on owner (marketing)

**Owner of this list:** marketing · **Ticket:** MKT-002 (first version MKT-001) ·
**Last updated:** 2026-11-27 · **Valid for:** v0.5.4 on `main`

Only the owner can do these things. Agents never post, email, sign up or spend money. The
orchestrator copies these items into `docs/STATUS.md` under "Waiting on owner (non-blocking)";
marketing does not edit STATUS. They don't block the team, but they do block the launch and
any revenue.

**Order:** do section A first. Nothing in B–E should go public until A1–A4 are done. Before
posting anything, replace `APP_URL` in the draft with the real URL and check the draft against
README and CHANGELOG on `main`. Drafts marked **DRAFT for v0.5.5** must wait until v0.5.5 is
released, whatever the gate says.

**What changed on 2026-11-27 (v0.5.4):** the launch gate is unchanged and still open (A1–A4).
New: A7 (content licences of the exam-prep courses you added) and A8 (exam names in course
titles), because a public URL makes those courses public. New drafts: B15–B17. E1 reworded to
match the pricing decision PD-072.

---

## A. Launch gate (do first)

**Gate status 2026-11-27:** A1 not done · A2 open · A3 not done · A4 not done. No change since
2026-11-20, so the launch date is still "not set". Kit copy is re-checked for v0.5.4 (G6).

| # | What to do | Exact text / file | Where | Why |
|---|---|---|---|---|
| A1 | Host the app on a public URL | No text. The cto/dev-platform deploy once hosting exists | A hosting account of your choice, in your name | Every draft links to `APP_URL`; there is nothing to launch without it (`launch-plan.md` §1 G1) |
| A2 | Check the trademark and register the domain for "Polyglow" | Name "Polyglow", classes 9 and 41 (software, education) | DPMA register (register.dpma.de), EUIPO eSearch (euipo.europa.eu), a domain registrar | Already open in STATUS (PD-001). Rebranding after launch would waste all marketing |
| A3 | Publish an Impressum and a privacy policy | Written by you or a lawyer; marketing doesn't draft legal text. Note for the privacy policy: since v0.5.4 the device also stores the goal date; from v0.5.5 it stores which exercises were right or wrong (for review). Nothing is sent to a server | Pages on the app's site, linked in the footer (`kit/landing-page.md` footer) | German law requires an Impressum on public websites, and the privacy policy must be accurate (G3) |
| A4 | Set up a feedback inbox | e.g. `hello@<domain>` | Your email provider | The drafts promise "reply and I read every answer" (`kit/launch-email.md`) (G4) |
| A5 | Approve consent-based measurement (after a cto note) | No text | Decision in the ticket the pm/cto open | Without it we can't measure D1/D7, goal-date use or ad results (G5) |
| A6 | Native-speaker review of A1 (recommended before paid ads) | The lists under "Uncertainties / needs native review" in each content ticket | A native speaker you trust | Paid traffic judges quality fast; until then copy can't say "reviewed by native speakers" |
| **A7** | **Confirm the content licences of the exam-prep courses, or ask the team to hide them at launch** (new) | (1) "telc B1 Exam Prep": confirm that everything imported from your telc B1 web app is yours to publish and contains no exam provider material (model tasks, official word lists, formats; PD-035). (2) "Einbürgerungstest": confirm the reuse of the BAMF Gesamtfragenkatalog text and pictures, and in particular the Bundestag photo on Q55 ("© Deutscher Bundestag/Achim Melde"), or swap it for a freely licensed photo (PD-076 open question). Our web search found many apps using the catalogue but no clear statement of its reuse terms (`market-research.md` §8) | A lawyer, or the rights holders (exam provider, BAMF, Deutscher Bundestag). If you prefer to wait, tell the pm: the courses can be hidden through registry visibility (PD-073) | PD-076 says this must be settled "before a public or paid launch". A public URL publishes these courses even though marketing never mentions them |
| **A8** | **Legal check on exam names in the app** (new; the PD-035 owner item, now urgent) | The course titles "telc B1 Exam Prep" and "Einbürgerungstest", the level title "B1 · telc exam" and the description "every part of the telc Deutsch B1 exam" in `content/courses/telc-b1-en-de/course.json` | A lawyer; then tell the pm, who owns course titles | PD-035 bans exam brand names in in-app and store copy; PD-073 added them at your request. Until this is settled, marketing keeps these courses out of all public copy and screenshots (`positioning.md` §5b) |

## B. Posting each draft (after A1–A4)

Post from your own accounts. Follow each community's self-promotion rules and ask moderators or
admins when in doubt. Don't post the same text in many groups on the same day.

| # | Draft | Exact text | Where to post | Why |
|---|---|---|---|---|
| B1 | Reddit maker post | `kit/social-posts.md` #1 + `docs/media/lesson.gif` | r/German (read the rules on self-promotion first; some subs allow maker posts only on certain days) | Learners there ask "which app for German?"; honest feedback |
| B2 | Reddit post on everyday situations | `kit/social-posts.md` #2 | r/germany or a city sub (r/berlin, r/munich …) only if the rules allow | Reaches Sam (expats in Germany) |
| B3 | Group post, moving to Germany | `kit/social-posts.md` #3 | Facebook / WhatsApp / Telegram groups for Indians, Nigerians and others moving to Germany, only where admins allow | Reaches Priya; high intent, Android |
| B4 | Group post, A1 on your own | `kit/social-posts.md` #4 | Facebook groups for spouses / family reunification. Don't mention visas, exams or exam dates | Reaches Amara |
| B5 | LinkedIn post | `kit/social-posts.md` #5 + `docs/media/learn-lessons.png` | Your LinkedIn profile | Skilled workers, recruiters, future B2B partners |
| B6 | Instagram / Facebook carousel | `kit/social-posts.md` #6 + the 4 images listed there | A new Polyglow Instagram/Facebook page (you create it, see D1) | Visual audience, link in bio |
| B7–B9 | Short videos | `kit/social-posts.md` #7–9 with `lesson.mp4`, `offline.mp4`, the feedback screenshots | Instagram Reels, YouTube Shorts, TikTok (accounts in D1) | Cheapest reach for Priya and Tom |
| B10 | German-language group post | `kit/social-posts.md` #10 | German-language expat/integration groups and forums that allow it | DACH-based learners |
| B11 | Launch email | `kit/launch-email.md` A | Your own email, only to friends and people who opted in. No bought lists | Highest conversion, first feedback |
| B12 | Partner emails | `kit/launch-email.md` B (EN) / C (DE) | University international offices, student unions, expat groups, relocation agencies, language schools, 2–3 nursing-recruitment agencies (about 10 contacts in weeks 3–4) | Trusted intermediaries; groundwork for B2B (`launch-plan.md` §4) |
| B13 | Press note | `kit/press-note.md` (EN/DE). Decide whether to keep the optional "built by AI agents" paragraph | Tech and expat media of your choice, from your email | Backlinks, credibility; the AI-agent story suits tech press |
| B14 | Landing-page copy | `kit/landing-page.md` (without the DRAFT v0.5.5 section) | Hand it to dev-platform via a pm ticket (proposal #5), or paste it into your site builder | Every link and ad lands here |
| **B15** | **Goal-date post (new, v0.5.4)** | `kit/social-posts.md` #11 (EN) / #12 (DE). Text starts "Have a date in mind? Pick a level and a date, like "A2 by 25 March"…" | The same groups as B3, B4 and B10, about a week after the first post there, and LinkedIn | Deadline learners (Priya, Amara); the goal date is the newest honest reason to post again |
| **B16** | **Goal-date ad (new, v0.5.4)** | `kit/ads.md` #6 (EN and DE) | Your search-ad account, only with budget E5 | Tests the deadline message |
| **B17** | **Smart review drafts: DRAFT for v0.5.5, do not post yet** | `kit/social-posts.md` #13, `kit/landing-page.md` "Review what you've learned", `kit/store-listing.md` DRAFT line, `kit/ads.md` variant 7 | After v0.5.5 is released **and** marketing has re-checked them against the v0.5.5 CHANGELOG (checklist in social post #13) | Retention message for existing learners; the feature is not on `main` yet |

## C. Accounts on directories and stores

| # | What to do | Exact text / file | Where | Why |
|---|---|---|---|---|
| C1 | Product discovery launch (one day) | Name, short description and full description from `kit/store-listing.md`; screenshots 1–6 from `kit/screenshot-shot-list.md` | A Product Hunt-style discovery site; sign up yourself | One-day spike and backlinks for early adopters (Tom) |
| C2 | Show HN (optional) | Title: "Show HN: Polyglow, a free offline German course built by a team of AI agents" + 3–4 lines from `kit/press-note.md` | news.ycombinator.com, from your account | Only if you choose to tell the AI-agent story |
| C3 | PWA / web-app directories | Same texts as C1 | Web-app and PWA directories of your choice | Store-like discovery without a store |
| C4 | Google Play listing via a Trusted Web Activity (later, optional) | Texts from `kit/store-listing.md`; screenshots 1–6 | Google Play Console: developer account, $25 one-time fee | Where Android users search; note Play Billing rules if paid plans come (`pricing.md` §5) |
| C5 | Free keyword-planner check | The keywords in `kit/seo-keywords.md` (incl. the new goal-date terms) | A free keyword tool of your choice (your account) | Adds search volumes before the cto/pm invest in topic pages |

## D. Social accounts

| # | What to do | Where | Why |
|---|---|---|---|
| D1 | Reserve the handle "polyglow" (or "polyglowapp") | Instagram, TikTok, YouTube, X / Bluesky, LinkedIn page | Needed for B6–B9; avoids someone else taking the name. Do it after A2 |
| D2 | Profile text | Bio: "German for life in Germany. Free 5-minute lessons, A1 to A2, works offline. APP_URL" (EN, from `kit/store-listing.md`) | Consistent, true claims |
| D3 | Profile image | The app icon / Lumi from the app's assets (dev-platform can export it) | Brand recognition |

## E. Payments, legal terms, VAT and budget (before any charging)

The pm's pricing position (PD-072): Polyglow stays free with no ads and no payments through
v1.0.0, and whether to charge at all is your decision. Everything shipped free (incl. goal date
and, when it ships, Smart review) stays free.

| # | What to do | Exact text / file | Where | Why |
|---|---|---|---|---|
| E1 | Decide whether to charge at all; only then approve or change prices | Marketing's hypothesis, not approved: Plus €5.99/month or €39.99/year; Goal Pass €14.99 (6 months, no renewal); India ₹149/month, ₹999/year, ₹499 pass (`pricing.md` §1–3). Also decide whether B1 is free or paid **before B1 merges** (PD-072 §3) | Reply to the pm (decisions) | The team needs a yes/no before any pricing work (PD-072 §5) |
| E2 | Choose a payment provider and open the account (only if E1 is yes) | Recommendation: a merchant of record (e.g. Paddle, 5% + 50¢) that handles VAT for us (`pricing.md` §5) | The provider's sign-up, as the seller (you or your company) | Agents can't sign up; nothing can be charged without it |
| E3 | Legal terms | Terms (AGB), withdrawal information for digital content, the subscription cancel button ("Verträge hier kündigen", § 312k BGB), and the privacy policy updated for payments | A lawyer; then pages on the site | Legal duties for online subscriptions in Germany (`pricing.md` §5–6) |
| E4 | VAT set-up | With a merchant of record, the provider handles it. Without one: EU One-Stop-Shop once cross-border B2C sales pass €10,000 a year, plus German small-business rules | A tax adviser; the tax office / OSS portal | Selling digital services across the EU has VAT duties |
| E5 | Ad budget | Option 0 (€0, 3–5 h/week of your time) first; then A €100, B €500 or C €2,000 a month (`launch-plan.md` §3); ad texts in `kit/ads.md` | Your own ad accounts (search ads, Meta) | Agents never spend money; start only after A1–A5 and organic D1 ≥ 25% |
| E6 | Licence for recorded German audio (TTS) | Decision on the provider and licence (PRD Q7) | The provider you choose | Removes "Audio isn't available" (old proposal #3, rank 2 since 2026-11-27); also needed before paid ads |
| E7 | Approve the free-tier promise for public copy (optional) | PD-072 §2: "nothing that is free becomes paid". Copy says "Free" today and never "free forever" until you approve | Tell the pm | A public promise is a trust message; it is hard to reverse |

---

**Done?** When an item is finished, tell the orchestrator (or note it in OWNER-NOTES), so STATUS
and this list can be updated. Marketing refreshes this list at every release.
