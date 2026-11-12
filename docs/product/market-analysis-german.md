# Market analysis: German (English → German first)

**Owner:** pm · **Date:** 2026-11-12 · **Status:** v1, desk research · **Related:** PD-030 to
PD-038 in `decisions.md`, `curriculum-german.md`, `ROADMAP.md`

> **How to read the numbers.** This is desk research from the pm's own knowledge. There was
> no web access while it was written. **Every figure is an estimate to verify** and is marked
> "(est.)". The "Sources to check" column says where to confirm it. Figures are rounded on
> purpose. Decisions that depend on a figure only depend on its order of magnitude, so a
> correction of ±30 % does not change the recommendation.
>
> Exams and competitors are described **generically**. We do not copy, adapt or paraphrase
> any exam task, word list wording, course or brand asset. Exam names appear in this internal
> document only to describe the market. In-app copy follows PD-035 (no exam brand names, no
> certification claims).

---

## 1. Summary

1. German is one of the most-studied foreign languages worldwide: about **15 million
   learners (est.)**, plus a fast-growing group of adults who need it for a **visa, a job or a
   university place** in Germany, Austria or Switzerland.
2. For adults the need is often **mandatory and level-specific**. A1 for spouse visas and the
   opportunity card, A2–B1 in integration courses, **B1 for permanent residence and
   citizenship**, **B1–B2 for nurses' professional recognition**, **C1 for university**. The
   CEFR level is the product, so our path should be organised by CEFR level.
3. Demand clusters in four segments: **(a) skilled workers and nurses preparing abroad**,
   **(b) recent immigrants and refugees in DACH**, **(c) international students**, and
   **(d) hobby and heritage learners**. (a) and (c) are global, digital, price-sensitive and
   usually speak English.
4. The big in-country groups (Ukrainian, Arabic, Turkish, Dari/Pashto speakers) are best
   served in their own language. That needs UI localisation, and for Arabic RTL support. So
   they are Phase 2. **English → German (`en-de`) is the right first course** (PD-031).
5. Competitors are strong at **either** fun (gamified apps, weak beyond A2 and not exam-led)
   **or** rigour (institutes, integration courses, tutors: expensive, scheduled, rarely
   offline). Nobody clearly combines a **daily-habit game loop with a CEFR A1 → C1 path, exam
   readiness and "life in Germany" scenarios**.
6. Polyglow can win with: a CEFR-aligned path with level checkpoints, everyday-life scenarios
   (registration office, doctor, flat, train, workplace), an **offline-first PWA** that runs on
   low-end Android without an app store, and a **free core**.
7. Pricing hypothesis (Phase 3, PRD non-goal for MVP): free A1–A2 core, an optional "Plus"
   subscription around **€6–10 / month or €50–70 / year (est.)** with regional pricing, and
   later B2B seats for recruitment agencies and employers.
8. **Launch market:** English-speaking adults who are moving to, or have just moved to, Germany,
   with India and other English-proficient source countries plus expats inside Germany first,
   and US/UK hobby and heritage learners as a secondary audience. Standard German as used in
   Germany (`de-DE`).

---

## 2. Who learns German and why

### 2.1 Segments

| # | Segment | Why they learn | Level they need | Typical constraints | Fit for Polyglow `en-de` |
|---|---|---|---|---|---|
| S1 | **Skilled workers preparing abroad** (IT, engineering, trades, hospitality) | Job offer, opportunity-card points, settling with family | A1–A2 to arrive, B1 to settle, B1–B2 at work | Study after work, on a phone, often on mobile data; deadlines | **High**: English-speaking, digital, deadline-driven |
| S2 | **Nurses and care workers** | Professional recognition needs a language certificate, usually B1 or B2 depending on the state and the role (est.) | B1–B2, healthcare vocabulary | Recruited in cohorts by agencies; intensive courses | **High** for A1–B1 foundation; B2 healthcare elective is Phase 2 |
| S3 | **Spouses and family reunification** | Basic German (usually A1) is generally required for a spouse visa, with exceptions (est.) | A1 | Often studying alone, before the visa interview | **High**: A1 is exactly our first release |
| S4 | **Recent immigrants and refugees in DACH** | Integration course, job centre requirements, daily life | A2–B1 (integration course final test) | Classroom course plus self-study; native language often not English | Medium for `en-de`, **high once `uk-de`, `ar-de`, `tr-de` exist** |
| S5 | **International students** | Studienkolleg (B1–B2 entry), German-taught degrees (about C1), part-time jobs, staying after graduation | B1 → C1 | Strong motivation, exam-driven, budget-limited | **High** for A1–B1 now, B2–C1 later |
| S6 | **Expats in English-speaking jobs** (Berlin, Munich, Hamburg, Frankfurt, Vienna, Zurich) | Daily life, bureaucracy, social integration, permanent residence or citizenship at B1 | A1 → B1 | Busy, irregular schedules, bought-and-abandoned courses | **High**: scenario content ("Anmeldung", flat, doctor) is exactly their pain |
| S7 | **Heritage learners** (German ancestry in the US, Brazil, Eastern Europe; children of expats) | Family, identity, travel | A1–B1 | Low urgency | Medium: habit loop helps |
| S8 | **Hobby learners and school/university students worldwide** | Culture, travel, school subject, music, football | A1–B1 | Low urgency, high churn | Medium: classic gamified-app audience |

### 2.2 Legal and institutional drivers (DACH)

All of these are **estimates from general knowledge, verify before using in marketing**.
Rules change often and have exceptions.

| Driver | Country | Language requirement (est.) | Sources to check |
|---|---|---|---|
| Spouse / family reunification visa | DE | Basic German, usually A1, with exceptions (e.g. some nationalities, Blue Card holders' spouses) | Federal Foreign Office visa pages, "Make it in Germany" portal |
| Opportunity card (job-search card for skilled workers, since 2024) | DE | A1 German **or** B2 English as a minimum; more German earns more points | Make it in Germany, BMI / BAMF |
| Integration course (general course: 600 lessons of language + an orientation course) | DE | Aims at B1; ends with a scaled A2/B1 test for immigrants | BAMF integration course pages and annual statistics |
| Permanent settlement permit | DE | Usually B1 | Residence Act, BAMF |
| Naturalisation (reformed 2024) | DE | B1 | Nationality Act (StAG), BMI |
| Vocational training (Ausbildung) visa | DE | Typically B1, sometimes A2–B2 depending on the employer and school | Make it in Germany, Federal Employment Agency |
| Nursing recognition | DE | B1 or B2 depending on federal state and role; healthcare-specific exams exist | State recognition authorities, "Anerkennung in Deutschland" portal |
| University admission (German-taught) | DE | About C1 via TestDaF or DSH; Studienkolleg entry about B1–B2 | DAAD, uni-assist, TestDaF-Institut |
| Integration agreement | AT | A2, then B1 for long-term residence (est.) | Austrian Integration Fund (ÖIF) |
| Permits and naturalisation | CH | Language passport framework; for naturalisation B1 oral and A2 written (est.) | Swiss State Secretariat for Migration (SEM), fide |

### 2.3 Size of the market (all estimates)

| Figure | Estimate | Sources to check |
|---|---|---|
| Learners of German as a foreign language worldwide | ~15 million (est., last large survey about 2020) | Federal Foreign Office survey "Deutsch als Fremdsprache weltweit" (with Goethe-Institut, DAAD, ZfA, Deutsche Welle) |
| New integration-course participants per year in Germany | ~300,000–360,000 in recent years (est.) | BAMF integration course statistics (Integrationskursgeschäftsstatistik) |
| International students in Germany | ~400,000 (est.), India and China the largest groups | DAAD / DZHW "Wissenschaft weltoffen", Destatis |
| Indian students in Germany | ~50,000+ and rising (est.) | DAAD, Indian Ministry of External Affairs |
| Ukrainians with protection status in Germany | ~1.1–1.2 million (est.) | Destatis, Central Register of Foreigners, BAMF |
| Visas for employment purposes per year | ~150,000–200,000 (est.) | Federal Foreign Office visa statistics, BAMF Migrationsbericht |
| Shortage of skilled workers and nurses | Hundreds of thousands of open positions (est.), care sector among the most affected | Federal Employment Agency, IW Köln, KOFA |
| Rank of German on consumer language apps | Usually top 5 worldwide (est.) | App vendors' public annual language reports, app-store intelligence tools |

### 2.4 Learner base by region and source language

| Region | Main learner groups | Main known languages | Notes |
|---|---|---|---|
| **South Asia** (India, Pakistan, Bangladesh, Sri Lanka, Nepal) | S1, S2, S5, S3 | **English** (as education language), Hindi, Malayalam, Tamil, Urdu, Bengali | Largest growing source of students and skilled workers (est.). Many learn German through English. Low-end Android, mobile data, price sensitive. **Best fit for `en-de`.** |
| **Eastern Europe** (Ukraine, Poland, Romania, Western Balkans) | S4, S1, S2, S8 | **Ukrainian**, Russian, Polish, Romanian, Serbian/Bosnian/Croatian, Albanian | Large in-country Ukrainian group. EU citizens need no visa but need German for work. |
| **Middle East and North Africa** (Syria, Iraq, Egypt, Morocco, Tunisia, Jordan) | S4, S2, S1 | **Arabic**, French (Maghreb), Kurdish | Large in-country group; nurse recruitment from the Maghreb. Needs RTL UI. |
| **Türkiye** | S4, S1, S5, S7 | **Turkish** | Long-standing community, heritage learners, students. |
| **Afghanistan / Iran** | S4 | Dari, Pashto, Farsi | Needs RTL; in-country. |
| **Southeast and East Asia** (Philippines, Vietnam, Indonesia, China, Korea, Japan) | S2, S1, S5, S8 | English (Philippines), Vietnamese, Indonesian, Chinese, Korean, Japanese | Nurse recruitment (Philippines, Vietnam, Indonesia); students (China). |
| **Latin America and Iberia** (Mexico, Colombia, Brazil, Spain) | S2, S1, S5, S7 | **Spanish**, Portuguese | Nurse and skilled-worker recruitment; heritage in southern Brazil. Latin script, easy to localise. |
| **Sub-Saharan Africa** (Nigeria, Ghana, Kenya, Cameroon) | S5, S1, S2 | **English**, French | Fast-growing student interest (est.), English-speaking, mobile-first. **Good fit for `en-de`.** |
| **North America, UK, Ireland, Australia** | S7, S8, S6 | English | Classic consumer-app audience; heritage learners; expats moving to DACH. |
| **Inside DACH** (expats) | S6, S4 | English as a working language, plus many others | Need scenarios for bureaucracy and daily life. Can be reached locally (meetups, relocation services). |

**Takeaway.** English is not the first language of the largest in-country groups, but it is the
shared language of the **globally mobile, digital, pre-arrival** segments (S1, S2 partly, S3, S5,
S6) and of the hobby market (S7, S8). Our UI is English only today (PRD §6.1). So `en-de` reaches
the most addressable learners with the least engineering.

---

## 3. Official exam landscape (generic)

Exams are described generically: format and purpose only. **We never copy, paraphrase or
imitate exam tasks, sample papers, word-list wording or rating scales.** Our checkpoints test
our own can-do goals (PD-035).

| Exam family | Provider type | Levels | Typical use | Format (generic) |
|---|---|---|---|---|
| Goethe-Zertifikat | Germany's cultural institute, worldwide | A1–C2 | Visas (A1), work, study; B1 and up modular | Reading, listening, writing, speaking; from B1 modules can be taken separately |
| telc Deutsch (incl. job, healthcare and university variants) | Non-profit exam provider | A1–C1 | Integration, work, nursing (healthcare B1–B2 variant), university (C1 university variant) | Four skills; job-specific variants use workplace scenarios |
| ÖSD | Austrian exam provider | A1–C2 | Austria and worldwide; Austrian integration | Four skills; pluricentric (accepts Austrian and Swiss variants) |
| Scaled test for immigrants (end of integration course) | Federal / exam providers | A2–B1 (scaled) | End of the integration course in DE | Four skills; result A2 or B1 |
| TestDaF (paper and digital) | Exam institute for university admission | about B2–C1 (three result bands) | University admission | Academic reading, listening, writing, speaking |
| DSH | Run by universities | about B2–C1 (DSH-1 to 3) | Admission to that university | Academic, written and oral, university-specific |
| School exams (DSD) and Swiss fide | Public bodies | A1–C1 | Schools abroad; Swiss migration | Varies |

**Product implications**
- All exams are **four-skill**. Our engine trains reading and listening well, speaking partly
  (Speak exercise, LES-011) and **writing hardly at all** (tiles only). Exam readiness at B1+
  needs typed answers, longer reading and listening, and some guided writing (Phase 2+, see
  curriculum §8).
- Exams use **standard German** with pluricentric tolerance. We teach Germany's standard
  (`de-DE`) and add Austrian and Swiss notes later (PD-032).
- An exam-readiness checkpoint at the end of each level is a strong motivator and a natural
  paid feature later (mock checkpoint with timed sections, Phase 3).

---

## 4. Competitor landscape (generic categories)

Described factually by category. No competitor content, branding or copy is used.

| Category | What they offer | Typical price (est.) | Strengths | Weaknesses we can exploit |
|---|---|---|---|---|
| **Gamified consumer apps** | Short game-like lessons, streaks, leagues; many languages | Free with ads or limits; subscription ~€7–15 / month | Habit loop, brand reach, free | Breadth over depth; weak beyond A2; not built around CEFR levels or DACH life; little exam relevance; often need app-store install and a good connection |
| **Structured course apps** | Dialogue-based lessons, grammar explanations, review | Subscription ~€8–15 / month | Better grammar, clear structure | Less habit-forming; often stop around B1; offline varies; paid only |
| **Tutor marketplaces** | 1:1 video lessons with tutors | ~€10–40 per hour | Speaking practice, personalised | Expensive over a full level; scheduling; no structured path between sessions |
| **Cultural institute / language school courses** (online and classroom) | Full CEFR courses, exam prep | ~€400–1,500 per level (est.) | Quality, recognised, exam centres | Price, fixed schedules, waiting lists in some countries |
| **Integration courses** (DE) | Subsidised classroom courses to B1 | Low participant fee per lesson hour or free for eligible groups (est.) | Cheap, mandatory for many, community | Waiting lists, mixed-level classes, little self-study tooling, in-country only |
| **Free public-broadcaster and institute courses** | Free web courses, videos, podcasts | Free | Good free content, trusted | Not habit-forming, web-heavy, little feedback |
| **Exam-prep books and apps** | Mock tests, word lists, tips | €20–40 per book; apps vary | Exam focus | Dry; no daily habit; no learning path |
| **AI chat tutors** (new) | Conversation practice with AI | Subscription ~€10–20 / month | Unlimited speaking/writing practice | Quality and accuracy vary; no curriculum; hard to measure progress |

**White space:** a **free, offline-capable, habit-forming CEFR path from A1 to C1** that uses
DACH everyday-life scenarios, clearly says what level you are at and what exam-relevant skills
you can do, and can be used before and after arrival.

---

## 5. Where Polyglow can win

1. **CEFR is the spine.** The path is organised as A1 → A2 → B1 → B2 → C1, each with can-do
   goals and a level checkpoint ("You can now do the A1 basics"). The learner always knows
   their level. This matches how visas, jobs and universities talk about German.
2. **Life-in-Germany scenarios.** Registering an address, the bakery, the supermarket, the
   doctor's practice, flat viewings, trains and delays, the first day at work, the job centre
   letter (later levels). Original, practical and memorable.
3. **Offline-first PWA.** Works on low-end Android, no app store, little data (S1, S2, S5 in
   South Asia and Africa), and on trains in Germany (S6). Our PRD G3 already targets this.
4. **Free core.** All of A1 and A2 free, with hearts as the only constraint (PD-003). That
   competes with free public courses on price and beats them on habit.
5. **Deadline mode (Phase 2 idea).** "My visa appointment is on …": pick a target level and
   date, get a daily goal that gets you there. Directly tied to PRD G2 (daily goal hit rate).
6. **Specialised electives later.** B1–B2 healthcare German for nurses, B2–C1 academic German
   for students, workplace German. Each is a clear B2B and paid opportunity.
7. **More source languages later.** `uk-de`, `ar-de`, `tr-de`, `es-de` reach groups where
   gamified, CEFR-aligned options are thinner (est.).

---

## 6. Pricing hypotheses (to test in Phase 3, not in MVP)

MVP stays free with no ads (PRD §7). These are hypotheses for later and need testing.

| Hypothesis | Detail | How to test |
|---|---|---|
| H1: Free core keeps acquisition cheap | A1 + A2 fully free; hearts limit play (PD-003) | D7 retention and organic sharing vs paid acquisition |
| H2: Exam-focused learners pay | "Plus" at ~€6–10 / month or ~€50–70 / year (est.): unlimited hearts, full offline download, level mock checkpoints, grammar notes | Fake-door "Plus" button after the A1 checkpoint (Phase 3) |
| H3: Regional pricing is required | e.g. India and Africa at roughly a third of the EU price (est.) | Conversion by region |
| H4: B2B seats for recruiters, schools and employers | ~€3–6 per learner per month (est.), progress dashboard per cohort | 3 pilot agencies (nursing recruitment) |
| H5: B1+ content justifies payment | Free A1–A2, paid B1+ as an alternative to H2 | A/B on the paywall position, only after B1 ships |

---

## 7. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Content scale.** A1 → C1 is about 75–80 units and 390+ lessons (curriculum §2) | Very high effort for the pm | Ship level by level; reusable content rules (curriculum §7); content QA ticket per level |
| **German accuracy.** One pm writing German without native review | Credibility, wrong answers | Native-speaker review before each level ships (owner, non-blocking, PD-038); tight vocabulary control |
| **Grammar depth vs game feel.** B1+ needs explanations | Learners stall at A2/B1 | Tip line now; grammar note cards and cloze in Phase 2 (curriculum §8) |
| **Exam claims and trademarks** | Legal | No exam brand names or certification claims in the app (PD-035) |
| **TTS licence for de-DE audio** | No audio at launch | PD-007 fallback with a German speech voice (PD-034); owner licence decision still pending |
| **Writing and speaking gaps** | "Exam-ready" would be overstated | Use "CEFR level" and can-do wording only; Speak (LES-011) and typed answers in Phase 2 |
| **English-only UI excludes big in-country groups** | Smaller reach in DACH | Phase 2 source languages (PD-031) |
| **Pluricentric German** (AT/CH words) | Some learners confused | Germany standard first; notes for Austria and Switzerland later (PD-032) |
| **Competition from incumbents** | Acquisition cost | Niche positioning on CEFR + life in Germany + offline; communities of students and workers moving abroad |
| **Fast-changing immigration rules** | Outdated marketing | Never quote legal requirements in the app; link to official sources in help content |

---

## 8. Launch market recommendation

- **Primary:** English-speaking adults preparing to move to Germany or newly arrived (S1, S3,
  S5, S6), first reached in **India** and other English-proficient source countries
  (Pakistan, Nigeria, Ghana, Kenya, the Philippines) and among **expats inside Germany**.
- **Secondary:** US, UK and Irish hobby and heritage learners (S7, S8).
- **Variant:** standard German as used in Germany (`de-DE`), both "du" and "Sie" from Unit 1
  (PD-032).
- **First release:** A1 complete (12 units × 5 lessons), then A2, then public launch with
  A1 + A2 (PD-036).
- **Positioning line (draft, our own):** "German for your new life, five minutes a day, from
  A1 to C1."

## 9. Known language for the first course

**Recommendation: English → German (`en-de`).** The analysis supports the default:

- English is the shared language of the most addressable, digital, pre-arrival segments.
- The UI is English only (PRD §6.1). Any other known language needs UI localisation first.
- One known language keeps the content pipeline simple while we scale to C1.

**Recommended Phase 2 known languages** (each needs UI localisation, PRD Phase 3 pulled
forward for these):

| Order | Course | Why | Extra engineering |
|---|---|---|---|
| 1 | `uk-de` Ukrainian → German | Very large in-country group with an urgent need (est.); Cyrillic, left-to-right | UI localisation |
| 2 | `ar-de` Arabic → German | Large in-country group plus Maghreb nurse recruitment | UI localisation **and RTL layout** (mixed-direction tiles) |
| 3 | `tr-de` Turkish → German | Long-standing community, heritage learners | UI localisation |
| 4 | `es-de` Spanish → German | Latin American nurse and skilled-worker recruitment, Spain | UI localisation |

Hindi and other South Asian languages are not prioritised: most learners there learn German
through English (est., verify with learner surveys after launch).

## 10. Sources to check (consolidated)

- Federal Foreign Office: "Deutsch als Fremdsprache weltweit" learner survey; visa statistics
- BAMF: integration course statistics, Migrationsbericht, opportunity-card information
- Destatis: foreign population statistics (Central Register of Foreigners)
- DAAD / DZHW: "Wissenschaft weltoffen" (international students)
- "Make it in Germany" (official portal for skilled immigration) and "Anerkennung in
  Deutschland" (recognition of foreign qualifications)
- Federal Employment Agency: shortage occupations, nursing recruitment programmes
- Austrian Integration Fund (ÖIF); Swiss SEM and the fide framework
- Council of Europe: CEFR Companion Volume (2020)
- Exam providers' public pages (format overviews only, never task content)
- App-store intelligence tools and app vendors' public annual language reports
