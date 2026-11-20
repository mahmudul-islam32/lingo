# Market research: English-speaking learners of German

**Owner:** marketing · **Ticket:** MKT-001 · **Last updated:** 2026-11-20 · **Next refresh:** by 2026-12-20
**Builds on:** `docs/product/market-analysis-german.md` (pm). That document covers segments S1–S8,
legal drivers, the exam landscape and source languages. This one adds **current, cited numbers**,
willingness to pay, a named competitor landscape and the gaps marketing can use. It does not
repeat the pm's tables.

> **Internal document.** Competitor names appear here only. Public copy never names a
> competitor and never says "like X" or "X alternative" (CLAUDE.md, marketing rules).

## How to read the sources

- Every figure has a source ID `[Sn]`. The full list with URLs is in §7. **All sources were
  accessed on 2026-11-20.**
- **[P]** = primary source (government, statistics office, company filing).
  **[S]** = secondary (press, review site, aggregator).
  **(est.)** = our own estimate or a figure that sources disagree on. Never use an (est.) figure
  in public copy.
- Several primary pages (goethe.de, some PDFs) could not be opened from this environment, so
  some figures were taken from search-result summaries of those pages. They are marked
  "verify" and must be checked against the page before anyone quotes them.

---

## 1. Key findings

1. **The demand is mandatory, level-specific and growing, but the public supply is shrinking.**
   363,466 people started an integration course in 2024 [S1][P]. In February 2026 BAMF stopped
   admitting many groups to free integration courses (about 129,500 people affected), and only
   partly reopened in August 2026 [S2][S]. At the same time naturalisations hit a record
   333,343 in 2025 (B1 German is the usual requirement) [S7][P]. More people need a CEFR level,
   and fewer of them have a subsidised classroom seat. That pushes learners to self-study.
2. **India is now the single most important English-speaking source market.** India is the
   largest country of origin for international students in Germany (about 59,000 of about
   402,000) [S4][S], issued by far the most opportunity-card visas (3,721 of 11,497,
   June 2024 to June 2025) [S8][P], grew by about 34,000 residents in Germany in 2025 [S6][P],
   and Indian nursing qualifications recognised in Germany rose about 50 % in 2024 [S10][S].
   About 94 % of Indian mobile web traffic is Android [S25][S]. A **free, light, offline PWA
   that works on Android without a store** fits this segment unusually well.
3. **The market leader's free tier got stricter, and learners noticed.** In 2025 the biggest
   gamified app replaced hearts (lost only on mistakes) with "energy" (used by every exercise)
   for free users; petitions and press coverage followed [S21][S]. Polyglow went the other way
   in v0.5.2: correct answers earn hearts and Practice is free. **"Practise as much as you
   like, free"** is a real, current differentiator, as long as we keep it true.
4. **Pass rates show learners need more practice, not just a course.** 38 % of spouse-visa
   applicants who took a preparatory course at the main cultural institute still failed the A1
   exam in 2024 [S9][S, verify against S9 primary]. A daily, offline drill between classes is
   a clear job to be done.
5. **Willingness to pay exists but is anchored by free, strong public options.** Free: DW
   (A1–B1 video course), vhs-Lernportal (A1–B1, BAMF-recognised, offline apps) [S19][S20].
   Paid apps sit at about €6–10 a month on annual plans; classes cost €10–16 per group lesson
   and €695 for a self-study A1 course at the cultural institute [S12–S17]. Polyglow must
   keep a generous free core and charge for **depth, speed and certainty** (higher levels,
   smart review, mock checkpoints, sync), not for access to the basics.

---

## 2. Segments and size

The pm's segments S1–S8 (`market-analysis-german.md` §2.1) stay. This table adds current
numbers and a marketing priority. "Reachable with `en-de` today" means: English UI, A1–A2
content, no account.

| Segment (pm ID) | Best current figure | Source | Reachable with `en-de` today | Marketing priority |
|---|---|---|---|---|
| **Integration-course learners** (S4) | 363,466 course starts in 2024; ~360,000 in 2023; BAMF expected ~326,000 for 2025 | [S1][P] | Low–medium: most top nationalities (Ukraine, Syria, Afghanistan, Türkiye) are not English-first [S1] | Medium: the English-speaking minority, plus people who lost a free seat in 2026 [S2] |
| **Spouses / family reunification** needing A1 (S3) | ~72,500 spouse visas in 2024 (77,200 in 2023) | [S9][S] | **High**: A1 is complete and free on `main` | **High** |
| **Skilled workers, opportunity card** (S1) | 11,497 opportunity-card visas 1 Jun 2024 to 15 Jun 2025; 3,721 in India | [S8][P] | **High**: A1–A2 now; B1 later | **High** (India first) |
| **Nurses and health workers** (S2) | ~86,600 foreign qualifications recognised in 2025 (+10 %), health professions the largest group; Indian nursing qualifications +50 % in 2024 | [S10][P/S] | Medium: A1–A2 foundation only; B1–B2 healthcare needed later | Medium now, **High for B2B later** |
| **International students** (S5) | ~402,000 international students (WS 2024/25); India the largest group, ~59,000; record ~116,600 first-year internationals | [S4][S] | **High**: A1–A2 for daily life and part-time jobs | **High** |
| **Expats in English-speaking jobs** (S6) | ~14.07 million foreign residents in Germany at end of 2025 (all nationalities) | [S6][P] | **High** for English speakers | **High** (in-country, reachable via communities) |
| **Citizenship / settlement** (S4, S6) | 333,343 naturalisations in 2025, a record and the fifth rise in a row | [S7][P] | Medium: needs B1, which is not on `main` yet | Medium now, **High after B1** |
| **Hobby, heritage, students worldwide** (S7, S8) | ~15.4 million learners of German worldwide (survey cycle unclear, verify against the 2025 edition) | [S5][S] | **High** | Medium: large but low urgency and high churn |

**Rough serviceable market for v0.5.3 (est.).** English-speaking adults who need or want A1–A2
German in the next 12 months: a few hundred thousand per year across S1, S3, S5 and S6
(estimate built from the rows above, overlapping and not additive), plus a large but
unquantified hobby audience. Treat this as an order of magnitude, not a forecast.

### Jobs to be done (from the segments)

| Job | Who | What they hire today | Where they hurt |
|---|---|---|---|
| "Pass the A1 test before my visa appointment" | S3, S1 | Institute course, tutor, prep book | Price, schedule, 38 % still fail [S9] |
| "Get by at the Bürgeramt, doctor and supermarket" | S6, S5 | Free videos, gamified app, colleagues | Apps teach travel phrases, not German bureaucracy |
| "Keep practising between classes" | S4, S1, S2 | Workbook, vhs-Lernportal, flashcards | Not habit-forming; no daily loop |
| "Reach B1 for settlement or citizenship" | S4, S6 | Integration course, paid course | Seats cut in 2026 [S2]; Polyglow has no B1 on `main` yet |
| "Learn on my phone with little data" | S1, S5 (India, Africa) | Free YouTube, app with ads | Data cost, app size, ads |

---

## 3. Willingness to pay

| Signal | Figure | Source | What it tells us |
|---|---|---|---|
| Paid share of the largest gamified app | 13.1 M paid subscribers, 64.9 M DAU (Q3 2026); ~9 % of MAU paid in Q3 2025 | [S11][P] | Even with a huge free tier, roughly 1 in 11 monthly users pays. A niche app can plan on **2–5 % (est.)** at first |
| Category concentration (Europe) | One app took >40 % of language-app consumer spend 2019–early 2022 | [S31][S] | Hard to win head-on; win a niche |
| Integration course participant fee | €2.29 per 45-minute lesson where a fee applies | [S3][S] | Learners in DE are used to paying small, regular amounts |
| Self-study A1 course at the cultural institute | €695 (one country page; prices vary) | [S17][S, verify] | Deadline learners pay hundreds for certainty |
| A1 exam fee in India | INR 7,000 (internal) / 9,400 (external) | [S18][S, verify] | Indian learners spend about €75–100 (est., at ~€1 = INR 95) on one exam attempt; a failed attempt is costly |
| Group online classes | ~€10.49–15.99 per class | [S15][S] | A month of app is cheaper than one class |
| Tutors | Typical $5–40 per lesson; ~$29/hour average (est. by one marketplace) | [S16][S] | Speaking practice is the paid premium |

**Conclusion (est.).** Learners with a deadline (S1, S3, S5) will pay for anything that
raises their chance of passing at the right level by a date, at **€4–8 a month or €30–60 a
year** in the EU and roughly a third of that in India (pm hypothesis H3, consistent with the
regional pricing gap at the market leader [S30]). Hobby learners pay mainly for convenience
(no limits, no ads). See `pricing.md`.

---

## 4. Competitor and alternative landscape (internal, names allowed)

Prices are list prices found on 2026-11-20 and vary by country, store and promotion. Where
sources disagree, the range is shown and marked (est.).

| Product | Type | Levels / focus | Price (EUR unless noted) | What users love | What users hate | Source |
|---|---|---|---|---|---|---|
| **Duolingo** | Gamified app, many languages | German course said to reach B2 after a 2026 update (unverified); historically A1–B1 | Free with limits; Super ~€10.25/mo on annual (€122.99/yr; other sources €71–90/yr, est.); Max €14.99/mo; India ~INR 4,000–5,000/yr (est.) | Habit loop, streaks, fun, free | **Energy system** (2025) limits free play; terse grammar; plateau at A2–B1; "living in Germany showed how little I'd learned" | [S11][S12][S21][S22][S30] |
| **Babbel** | Structured course app (Berlin) | A1–B2, dialogue-based, grammar | 12 months ~€6.95–8.99/mo; lifetime ~€299 (est.) | Clear grammar, practical dialogues; TrustScore ~4.4–4.5 on 32k reviews | Auto-renewal without reminder, refund refusals; "a lot of money for basic sentences" | [S13][S23] |
| **Busuu** | Course app + community corrections | A1–B2 | ~€9.99/mo; 12 months ~$5.83/mo; Premium Plus ~$13.99/mo (AI conversation) | Native-speaker feedback on writing; structured | Paywall early; free tier thin | [S14] |
| **DW Learn German / Nicos Weg** | Free public broadcaster course | A1–B1 (video story), placement test, certificate of completion | **Free** | Free, trusted, video story, CEFR | Mistakes not explained; light on speaking; not a daily habit; video bugs | [S19] |
| **vhs-Lernportal** | Free adult-education portal | A1–B1 integration course content, >900 exercises per course, offline apps, guest access | **Free** | Free, BAMF-recognised, tied to classes | Built for classroom/teacher use; not game-like (est.) | [S20] |
| **Goethe-Institut online courses** | Cultural institute | A1–C2, exam preparation | ~€695 for a self-study A1 course (country page; varies) | Authority, quality, exam centres | Price, fixed formats | [S17] |
| **Lingoda** | Live online classes (Berlin) | A1–C1 | ~€10.49–15.99 per group class | Real teachers, CEFR, flexible | Cost adds up; class availability | [S15] |
| **italki / Preply** | Tutor marketplaces | Any | ~$5–40 per lesson | Speaking, personal | Cost over a whole level; no path between lessons | [S16] |
| **Integration course** | Subsidised classroom (DE) | To B1, scaled A2/B1 test | €2.29/lesson where a fee applies, often free | Cheap, mandatory, community | 2026 admission stop for many groups; waiting lists | [S1][S2][S3] |
| **Prep books and mock tests** | Print and apps | A1–C1 exam formats | ~€20–40 per book (pm est.) | Exam focus | Dry, no habit | pm §4 |

### Review themes we can act on

| Theme | Evidence | Polyglow today (v0.5.3) | Opportunity |
|---|---|---|---|
| Free play is being squeezed | Energy backlash [S21] | Correct answers earn hearts; Practice is free and never costs hearts | Message it; protect it in pricing |
| Grammar is under-explained | r/German, reviews [S22] | Every lesson opens with a grammar tip card | Message "a tip before every lesson"; grammar notes later |
| Apps don't prepare you for life in Germany | [S22], expat surveys: 50 % found life hard without German (2023) [S24] | A1 covers registering an address, doctor, appointments, shopping; A2 covers offices, letters, work, train, hotel | Lead with "German for life in Germany" |
| Subscription traps | Babbel auto-renewal complaints [S23] | No payments at all | Make "renewal reminder + one-click cancel" a brand promise (also a legal duty in DE, [S28]) |
| Need to practise between classes | 38 % fail rate after a prep course [S9] | 130 lessons, offline, 5 minutes | Position as the daily companion to a course, not a replacement |

---

## 5. Gaps Polyglow can own

1. **"German for your life in Germany", free and offline.** No gamified app leads with DACH
   life scenarios; the free public options do, but are not habit-forming. Polyglow has both,
   on `main` today.
2. **Generous free practice.** The leader made free play stricter; Polyglow made it looser.
   Hold this position in pricing (`pricing.md`).
3. **A light PWA for Android-first markets.** No store, small download, works offline; matches
   India and Africa (pm §2.4, [S25]).
4. **CEFR clarity.** The path is grouped by CEFR level with checkpoints. We can say "CEFR A1
   and A2" (PD-035), never an exam brand or a pass promise.
5. **Honest subscriptions (when we charge).** Renewal reminders, a visible cancel button, no
   dark patterns. Cheap to do, rare in the category, and the German Kündigungsbutton rule
   requires the cancel part anyway [S28].
6. **Companion to courses (B2B2C).** Teachers in integration courses, language schools and
   nursing-recruitment agencies need a daily practice tool between classes. Nobody gamified
   owns this for `en-de` (est.).

**Gaps we cannot claim yet:** speaking practice, writing, recorded native audio, B1+ levels,
accounts/sync, leagues. These are product gaps (see `feature-proposals.md`), not messages.

---

## 6. Risks to the marketing story

| Risk | Mitigation |
|---|---|
| The market leader's 2026 German update closes the "stops at A2/B1" gap [S22] | Do not use "goes further than other apps" in copy; compete on life-in-Germany, free practice and offline |
| German content has not had a native-speaker review yet (STATUS) | Never claim "reviewed by native speakers" until it happens; ask the owner to prioritise it before paid ads |
| Listening uses the device voice; some devices have none and show "Audio isn't available" + Skip | Say "listening with your device's German voice"; recorded audio is a top proposal |
| No public URL, domain or trademark check yet (STATUS, PD-001) | Owner items; nothing launches before them (`launch-plan.md` §1) |
| Immigration rules change (2026 integration-course cuts) | Never state legal requirements in public copy (PD-035); link to official sources |

---

## 7. Sources (all accessed 2026-11-20)

| ID | Source | URL | Used for |
|---|---|---|---|
| S1 | Deutscher Bundestag, Drucksache 21/456 (government answer) | https://dserver.bundestag.de/btd/21/004/2100456.pdf | 363,466 integration-course starts 2024; 360,000 in 2023; top nationalities. ~326,000 expected 2025 from a related Drucksache (via search summary, verify) |
| S2 | table.media briefing PDF; Der Paritätische, "Anpassung der Integrationskursverordnung zum 01.08.2026"; ZDFheute | https://table.media/assets/berlin/integrationskurse.pdf · https://www.der-paritaetische.de/alle-meldungen/anpassung-der-integrationskursverordnung-zum-01-august-2026/ · https://www.zdfheute.de/politik/integrationskurse-finanzierung-asylbewerber-bundesregierung-100.html | BAMF admission stop of 9 Feb 2026, ~129,500 affected, partial reopening 1 Aug 2026 |
| S3 | migrando.de; Haufe | https://migrando.de/news/allgemein/ueber-eine-milliarde-euro-in-2025-deutschland-erhoeht-mittel-fuer-integrationskurse/ · https://www.haufe.de/id/beitrag/fluechtling-integrationeingliederung-in-den-arbeitsmarkt-22-kostenbeitragspflicht-HI14190675.html | €2.29 participant fee per lesson unit |
| S4 | DAAD press release "Wissenschaft weltoffen 2025"; VnExpress; ICEF Monitor; The PIE News | https://www.daad.de/en/press-releases/erneut-hohe-zahl-an-internationalen-studierenden-in-deutschland/ · https://e.vnexpress.net/news/news/education/international-students-enrollments-in-germany-hit-all-time-high-4993075.html · https://monitor.icef.com/?p=46555 · https://thepienews.com/germanys-record-first-year-intake-drives-6-rise-in-international-enrolments/ | ~402,000 international students; India largest (~59,000); ~116,600 first-year |
| S5 | Auswärtiges Amt, "Deutsch als Fremdsprache weltweit" (2025 edition, published 28 Jul 2025); DAAD release | https://www.auswaertiges-amt.de/de/newsroom/deutsch-als-fremdsprache-2728478 · https://www.daad.de/de/pressemitteilungen/deutsch-als-fremdsprache-afrika-asien/ | ~15.4 M learners worldwide (cycle unclear, verify); growth in Asia, Africa, Latin America |
| S6 | Destatis, Ausländerstatistik 31.12.2025 | https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Migration-Integration/auslaenderstatistik-stichtag.html | ~14.07 M foreign residents; India +34,000 |
| S7 | Destatis press release 186/2026 "332 500 Einbürgerungen im Jahr 2025" | https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/06/PD26_186_125.html | Record naturalisations (333,343 final) |
| S8 | Deutscher Bundestag, Drucksache 21/692; bundestag.de hib 283/2025 | https://dserver.bundestag.de/btd/21/006/2100692.pdf · https://www.bundestag.de/presse/hib/kurzmeldungen-1098734 | 11,497 opportunity-card visas; India 3,721 |
| S9 | Stuttgarter Zeitung (dpa); Deutscher Bundestag Drucksache 21/175 | https://www.stuttgarter-zeitung.de/politik/sprachnachweis-weniger-visa-fuer-ehegatten-hoehere-durchfallquote-beim-deutsch-test-79148538.html · https://dserver.bundestag.de/btd/21/001/2100175.pdf | ~72,500 spouse visas 2024; 38 % fail rate after a prep course (verify in Drucksache) |
| S10 | Destatis press release 295/2026; BMBFSFJ press release (2024 data) | https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/08/PD26_295_212.html · https://www.bmbfsfj.bund.de/bmbfsfj/aktuelles/pressemitteilungen/anerkennung-auslaendischer-berufsqualifikationen-2024-neue-hoechstwerte-erneut-deutlicher-zuwachs-bei-gesundheitsberufen--269962 | ~86,600 recognitions 2025; Indian nursing +50 % in 2024 |
| S11 | Duolingo Q3 2026 shareholder letter (SEC 8-K); Q3 2025 letter | https://www.sec.gov/Archives/edgar/data/0001562088/000162828026069474/q3fy26duolingo9-30x26share.htm · https://www.sec.gov/Archives/edgar/data/1562088/000162828025049514/q3fy25duolingo9-30x25share.htm | 64.9 M DAU, 13.1 M paid; ~9 % paid penetration (Q3 2025) |
| S12 | monsterdealz.de; giga.de (Duolingo prices in Germany; sources conflict) | https://www.monsterdealz.de/magazin/duolingo-super-kosten · https://www.giga.de/artikel/duolingo-kosten-im-ueberblick-was-gibts-kostenlos/ | Super and Max prices (est.) |
| S13 | trusted.de; sharesub; Babbel support "Pricing" | https://trusted.de/babbel-kosten · https://www.sharesub.com/cms/en/?p=62381 · https://support.babbel.com/hc/en-gb/articles/19650417983378-Pricing | Babbel prices (est.) |
| S14 | top10.com Busuu review | https://top10.com/language-learning/reviews/busuu | Busuu prices |
| S15 | Settle in Berlin, Lingoda review; Lingoda pricing page | https://www.settle-in-berlin.com/learning-german-with-lingoda-review/ · https://www.lingoda.com/en/pricing/?language=german | Group class prices (est.) |
| S16 | Preply German tutors listing; LanguaTalk | https://preply.com/en/online/german-tutors · https://languatalk.com/blog/how-much-do-german-tutors-charge | Tutor prices (est.) |
| S17 | Goethe-Institut Japan, "Deutsch Online" individual course (via search summary, verify) | https://www.goethe.de/ins/jp/de/spr/kur/doln/doi.html | €695 self-study A1 course |
| S18 | Goethe-Institut India, exam fees, Bangalore (via search summary, verify) | https://goethe.de/ins/in/en/sta/ban/prf/anm.html | INR 7,000 / 9,400 A1 exam fee |
| S19 | DW Learn German (App Store); Lingoclub on Nicos Weg | https://apps.apple.com/us/app/-/id1224076534 · https://www.lingoclub.com/nicos-weg | Free A1–B1 course |
| S20 | DVV vhs-Lernportal information sheet | https://beruf.vhs-lernportal.de/wws/bin/4007242-4008322-1-infoblatt_a1-b1.pdf · https://www.vhs-lernportal.de/wws/bin/4007802-4081202-1-dvv_de_web.pdf | Free, BAMF-recognised, offline apps |
| S21 | Duolingo blog "Energy"; Android Authority | https://blog.duolingo.com/duolingo-energy/ · https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/ | Hearts → energy, backlash |
| S22 | r/German thread (mirror); smartergerman.com review | https://nyc1.lr.ggtyler.dev/r/German/comments/192ew9u/why_is_duolingo_considered_bad · https://smartergerman.com/blog/duolingo-german/ | Grammar and plateau themes; claimed 2026 course update (unverified) |
| S23 | Trustpilot Babbel; BBB Babbel complaints | https://uk.trustpilot.com/review/babbel.com?page=6 · https://prod.bbb.org/us/ny/new-york/profile/tutoring/babbel-0121-87145663/complaints | Review score; auto-renewal complaints |
| S24 | The Local (Expat Insider 2023); iamexpat.de (2025 ranking) | https://www.thelocal.de/20230711/foreigners-in-germany-among-the-unhappiest-and-loneliest-worldwide · https://www.iamexpat.de/expat-info/germany-news/isolating-and-uptight-germany-receives-worst-ranking-yet-expat-insider | 50 % find life hard without German (2023); Germany 42/46 (2025) |
| S25 | StatCounter, mobile OS share India | https://gs.statcounter.com/os-market-share/mobile/india | Android ~93.9 % (Sep 2026) |
| S26 | Google Play Console help; Chrome TWA docs | https://support.google.com/googleplay/android-developer/answer/6112435?hl=en · https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing | $25 one-time fee; Play Billing for TWAs |
| S27 | Paddle pricing | https://www.paddle.com/pricing | 5 % + 50¢ merchant of record |
| S28 | § 312k BGB (gesetze-im-internet.de) | https://www.gesetze-im-internet.de/bgb/__312k.html | Cancellation button duty in DE |
| S29 | European Commission, VAT One Stop Shop | https://vat-one-stop-shop.ec.europa.eu/index_en | €10,000 EU-wide B2C threshold |
| S30 | Bizz Buzz; cybernews (Duolingo regional prices, third-party) | https://www.bizzbuzz.news/international/how-super-duolingo-prices-vary-globally-1377749 · https://cybernews.com/vpn-guides/buy-duolingo-plans-cheaper/ | India ~INR 4,000–5,000/yr (est.) |
| S31 | Sensor Tower, "State of Language Apps Europe 2022" | https://sensortower.com/blog/state-of-language-apps-europe-2022 | >40 % category spend concentration |
