# Positioning

**Owner:** marketing · **Ticket:** MKT-002 (first version MKT-001) · **Last updated:** 2026-11-27 ·
**Valid for:** v0.5.4 on `main` (drafts for v0.5.5 are marked as such)

Update this page at every release. Every proof point must be true on `main` (README,
CHANGELOG). If a feature is not on `main`, it is not a proof point.

> **Note on sources for v0.5.4.** `README.md` on `main` still describes v0.5.3 (last updated
> 2026-11-20). The v0.5.4 proof points below come from `CHANGELOG.md` `[0.5.4]`, the PM
> decisions PD-071 §1, PD-077, PD-078 and the shipped copy in
> `src/features/gamification/rules/goal-plan-copy.ts`. The orchestrator owns the README
> refresh; until it happens, check new claims against CHANGELOG.

---

## 1. Positioning statement (internal)

**For** English-speaking adults who are moving to, or have just moved to, Germany, **who**
need everyday German at a real CEFR level, often by a date, and have only a few minutes a day,
**Polyglow is** a free, game-like German course on your phone **that** teaches the German of
daily life in Germany (offices, the doctor, the flat, the train, work) from A1 to A2, shows you
what it takes to reach your level by your date, works offline and needs no app store or account.
**Unlike** big general language apps, Polyglow is built only for German, organised by CEFR
level, and lets you practise as much as you like for free.

(The "unlike" line is internal. Public copy never names or compares with a competitor.)

## 2. Value proposition

**Headline:** German for your life in Germany. Five minutes a day.

**Sub-line:** Free, game-like lessons from A1 to A2, built around real situations: the
registration office, the doctor, the supermarket, the train. Set a goal date and see what it
takes. No account, no ads, works offline.

**Three pillars**

| Pillar | What it means | Proof on `main` (v0.5.4) |
|---|---|---|
| **German for real life** | Lessons are about the situations newcomers actually face | A1: greetings to appointments, shopping, the doctor and registering an address. A2: offices and letters, work, home and neighbours, train and hotel, health, phone calls (README "The German course") |
| **A clear CEFR path, to your date** | You always know your level, what's next and how much is left | Learn tab grouped by CEFR level and unit; A1 and A2 each end in a checkpoint; start at A1 or A2 (v0.5.2); **goal date**: pick a level and a date, see lessons left and whether your daily goal gets you there (v0.5.4) |
| **A habit that's kind** | Short, game-like, practice is never locked, and the plan never scolds you | 10–12 exercises per lesson; XP, streak, daily goal; correct answers give back a heart (up to 5); Practice replays finished lessons for free (v0.5.2, v0.5.3); the goal plan only *suggests* a daily goal and uses kind wording ("On track", "Aim for about …") (v0.5.4) |

**Supporting points:** installable from the browser (PWA), works offline once loaded, free, no
account needed, no ads, the German course is original content written for Polyglow, a grammar
tip before every lesson, sound effects you can turn off, Lumi the paper-lantern guide.

## 3. Key messages by persona

| Persona | Primary message | Proof |
|---|---|---|
| Priya (pre-arrival) | "Moving in spring? Set A2 as your goal, pick the date, and see how much to do each day. Free, on any phone browser, even offline." | Goal date (P17), PWA, offline, free, A1 + A2 |
| Sam (expat) | "The German you need at the Bürgeramt, the doctor and with your neighbours." | A1/A2 unit topics |
| Amara (A1 by a date) | "Pick A1 and your date. Polyglow shows the lessons left and a daily goal that gets you there." Never mention her exam or a pass | Goal date (P17), 60 A1 lessons, A1 checkpoint, daily goal |
| Tom (hobby) | "Pick up where you left off. Start at A2 if A1 is too easy, and practise as much as you like." | Start level, free Practice, no ads |

## 4. Proof points (true on `main`, v0.5.4)

Use only these numbers and claims in public copy. Sources: README (2026-11-20, v0.5.3) and
CHANGELOG `[0.5.4]`, `[0.5.3]`, `[0.5.2]`, `[0.5.0]`. **All proof points are about the German
course (`en-de`)** unless a row says otherwise.

| # | Claim (public wording) | Source on `main` |
|---|---|---|
| P1 | 130 lessons across CEFR A1 and A2 (26 units) | README header and "The German course" |
| P2 | A1: 12 units, 60 lessons, about 700 exercises, ending in an A1 checkpoint | README |
| P3 | A2: 14 units, 70 lessons, ending in an A2 checkpoint | README, CHANGELOG 0.5.0 |
| P4 | Each lesson opens with a short tip, then 10–12 exercises | README "Play a German lesson" |
| P5 | Exercise types: multiple choice, match pairs, word-bank translation (both directions), listening | README |
| P6 | Wrong answers come back at the end of the lesson | README |
| P7 | Results show XP, accuracy, time, streak and daily goal | README |
| P8 | Choose where to start: A1 Beginner or A2 Elementary; change it later | README, CHANGELOG 0.5.2 |
| P9 | Every correct answer gives back a heart, up to 5 | README, CHANGELOG 0.5.2 |
| P10 | Practice: replay finished lessons for free; it never costs hearts and earns them back | README, CHANGELOG 0.5.3 |
| P11 | No account needed: progress is saved on your device | README "First launch" |
| P12 | Installable web app (PWA) that works offline | README |
| P13 | Listening uses your device's German voice (normal and slow), where the device has one | README "Listening"; PD-034 |
| P14 | The German course is original content; it teaches both "du" and "Sie" and accepts natural word orders | README. **Scope changed in v0.5.4:** say "the German course", never "all content", because the exam-prep courses on `main` are not our original content (see §5b) |
| P15 | Free, no ads, no payments | PRD §7, PD-072, no payment code on `main` |
| P16 | Profile with day streak, total XP, lessons done, starting level and an "XP this week" chart | README, CHANGELOG 0.5.3 |
| **P17** | **Goal date:** in Profile, pick a level (A1 or A2, at or after where you started) and a date, up to two years ahead, for example "A2 by 25 March". Learn shows the lessons left, the days to go and whether your daily goal gets you there; if not, one tap ("Use <n> XP a day") raises it. Polyglow suggests and never changes your goal on its own. The results screen shows the lessons left. Worked out on your device | CHANGELOG 0.5.4 (CTO-017, GAM-013, PLT-027, LES-022, FIX-014); PD-071 §1; `goal-plan-copy.ts` |
| **P18** | **Sound effects** for a right answer, a wrong answer and a finished lesson, with an on/off switch in Profile | CHANGELOG 0.5.4 (LES-012), PD-074 |

**Exact in-app goal-date wording you may quote** (from `goal-plan-copy.ts`, v0.5.4): "Have a
date in mind?", "Set a goal date", "Goal: finish A2 by 12 Mar 2027", "130 lessons left · 111
days to go" (example numbers only), "On track. Your daily goal of 30 XP gets you there.",
"Aim for about 2 lessons a day to get there.", "This date is tight …", "You've finished A2.
Well done!". If you quote numbers, label them as an example.

### Where the goal date works (check before every claim)

| Course on `main` | Goal date in v0.5.4 | May public copy say so? |
|---|---|---|
| German (`en-de`, A1 + A2) | **Yes** (target A1 or A2) | **Yes**: this is the proof point P17 |
| telc B1 Exam Prep (`telc-b1-en-de`, levels A1, A2, B1) | Yes in the app, but **one plan is shared by all courses in v0.5.4** (PD-078): a German plan counts telc lessons after a course switch | **No**: the course isn't promoted (exam brand, licence unclear, §5b) |
| Einbürgerungstest (`einbuergerung-en-de`, no levels) | **No**: no goal card, no Profile row, no results row (FIX-014) | **No**: never say "set a goal for your citizenship test" |
| Spanish (`en-es`, hidden, no levels) | **No** | **No**: Spanish is not offered to new learners (PD-030) |

**Per-course goals are v0.5.5 (PLT-028), not v0.5.4.** Until v0.5.5 ships, copy says "your goal
date", never "a goal for each course" or "separate goals per course".

## 5. Claims we must NOT make (today)

| Don't say | Why | Say instead |
|---|---|---|
| Any exam brand ("Goethe", "telc", "TestDaF", "ÖSD") or "exam-ready", "pass your exam", "exam date", "on track to pass" | PD-035; the in-app goal copy also bans "exam", "test", "pass" (GAM-013 AC14) | "CEFR A1 and A2", "your goal date", "practise the A1 basics" |
| "Required for your visa / citizenship" or any legal requirement | PD-035, rules change (2026 cuts) | "Many people need A1 or B1 German for life in Germany. Check the official requirements for your case." (only in long-form content, with a link to the official source) |
| "Behind", "late", "failed", "deadline", "countdown" about the goal date | PD-071 §1.4 kind copy | "On track", "Aim for about …", "This date is tight" |
| "Polyglow sets your daily goal" / "adjusts automatically" | It only suggests; the learner taps (PD-071 §1.2) | "One tap raises your daily goal" |
| "Based on your pace / history" | The plan uses the daily goal, not past pace (PD-071 §1.3) | "Shows whether your daily goal gets you there" |
| "Goal for every course" / "per-course goals" | Single plan in v0.5.4; per course from v0.5.5 (PD-078) | "Your goal date" (German course) |
| Goal date for the citizenship-test course or Spanish | Not on `main` (FIX-014, PD-078 §5) | Nothing |
| "Smart review", "spaced repetition", a "Review" card, as available | v0.5.5, not on `main` | Nothing until v0.5.5 ships; drafts are in the kit, marked DRAFT |
| "All content is original" / "Original course content © Polyglow" for the whole app | The exam-prep courses on `main` are imported (PD-073) and use the BAMF catalogue verbatim (PD-075, PD-076) | "The German course is original and written for Polyglow" |
| "Native audio", "recorded by native speakers" | Audio is device speech; TTS licence pending | "Listen with your device's German voice" |
| "Reviewed by native speakers" | Native review pending (STATUS) | Nothing, until it's done |
| "Speak", "pronunciation feedback", "writing practice" | Not on `main` for German | Nothing |
| "Leagues", "compete with friends", "sync across devices", "sign in" | Need accounts (v0.6.0) | "Leagues are coming" only if clearly labelled as future |
| "B1", "A1 to C1" as current | German B1 is unmerged (PD-063). B1 items exist only inside the exam-prep course, which we don't promote | "A1 and A2 today; B1 is being written" |
| "Fill-the-gap exercises" | Built but no German content yet | Nothing |
| "#1", "best", "most effective", user counts, ratings, reviews, awards | Marketing rules | Nothing |
| "Free forever" | Pricing undecided (PD-072 §2: don't publish the promise until the owner approves) | "Free" (true today) |
| "Like [app]" / "[app] alternative" | Brand and IP rules | Describe our own product |

### 5b. The exam-prep courses on `main`: not in public copy (flag)

CHANGELOG `[0.5.4]` adds two courses the owner requested (TELC-001, PD-073): **"telc B1 Exam
Prep"** and **"Einbürgerungstest"**, with a course switch in Profile. They are real and on
`main`, but marketing **does not claim or show them** until the owner clears three things:

| Issue | Detail | Owner item |
|---|---|---|
| Exam names | Both course titles name an exam. PD-035 forbids exam names in in-app, store and marketing copy; PD-073 (a later owner request) put them in the app. The pm should confirm which rule wins for course titles | `waiting-on-owner.md` A8 |
| Content licence: telc course | Imported "from the owner's telc B1 web app" (PD-073). We don't know whether any of it is the exam provider's material (model tasks, Redemittel lists, formats). PD-035 forbids copying or imitating exam tasks | `waiting-on-owner.md` A7 |
| Content licence: Einbürgerungstest | Questions and options are verbatim from the BAMF Gesamtfragenkatalog (PD-075). 7 questions show the catalogue's pictures; the Bundestag photo (Q55) is third-party copyright, and PD-076 says the right to reuse it must be confirmed **before a public or paid launch**. Whether the catalogue text may be reused freely (e.g. as an official work) was not confirmed by our search (see `market-research.md` §8) | `waiting-on-owner.md` A7 |

Practical rules until then:
- No screenshot or video that shows the Profile course switch, the course picker with the exam
  courses, or any exam-course screen (`kit/screenshot-shot-list.md`).
- Don't describe the app as having "three courses". Say "a German course from A1 to A2".
- If the owner clears both items, marketing writes separate, neutral copy (e.g. "B1 practice"
  and "Life in Germany test practice"), still with no pass promise and a link to the official
  source. A crowded field of citizenship-test apps already exists (`market-research.md` §8), so
  this course is not a strong acquisition hook on its own.

## 6. Brand voice

- Warm, plain, encouraging. Short sentences. Talk to "you".
- Practical over playful: lead with the situation ("at the doctor's"), then the game.
- German words appear where they help and are always easy: "Guten Morgen", "Bürgeramt",
  "Anmeldung". Explain a German word the first time.
- Lumi is the guide, not a clown: "Lumi glows brighter as your streak grows" is fine.
- The goal date talks like a friend with a calendar, not a coach with a stopwatch: "On track",
  "Aim for about two lessons a day", never "You're behind".
- Visual identity (v0.5.4): light theme, indigo `#4338CA` and coral `#F2613F` with gold XP
  (`docs/design/v2/BRIEF.md`). **Fonts changed in v0.5.4:** the app now uses the device's system
  fonts (SF Pro, Segoe UI, Roboto) instead of Bricolage Grotesque and DM Sans (TELC-002). Use
  real app screenshots from `docs/media/` only, and note that the current captures are from
  v0.5.3 (old fonts, no goal date).

## 7. Taglines (pick one per channel, A/B later)

1. German for your life in Germany. Five minutes a day.
2. From "Guten Morgen" to the Bürgeramt.
3. Your daily German, even offline.
4. Learn German for the life you're moving to.
5. German, five minutes at a time. Free.
6. **New (v0.5.4):** Pick your level. Pick your date. See the plan.
7. **New (v0.5.4):** A2 by spring? See how many lessons are left.

German versions for DACH-facing copy:
1. Deutsch für dein Leben in Deutschland. Fünf Minuten am Tag.
2. Von „Guten Morgen" bis zum Bürgeramt.
3. Dein tägliches Deutsch, auch offline.
6. Niveau wählen. Datum wählen. Plan sehen.
