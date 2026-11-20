# Positioning

**Owner:** marketing · **Ticket:** MKT-001 · **Last updated:** 2026-11-20 · **Valid for:** v0.5.3 on `main`

Update this page at every release. Every proof point must be true on `main` (README,
CHANGELOG). If a feature is not on `main`, it is not a proof point.

---

## 1. Positioning statement (internal)

**For** English-speaking adults who are moving to, or have just moved to, Germany, **who**
need everyday German at a real CEFR level and have only a few minutes a day, **Polyglow is** a
free, game-like German course on your phone **that** teaches the German of daily life in
Germany (offices, the doctor, the flat, the train, work) from A1 to A2, works offline and needs
no app store or account. **Unlike** big general language apps, Polyglow is built only for
German, organised by CEFR level, and lets you practise as much as you like for free.

(The "unlike" line is internal. Public copy never names or compares with a competitor.)

## 2. Value proposition

**Headline:** German for your life in Germany. Five minutes a day.

**Sub-line:** Free, game-like lessons from A1 to A2, built around real situations: the
registration office, the doctor, the supermarket, the train. No account, no ads, works offline.

**Three pillars**

| Pillar | What it means | Proof on `main` (v0.5.3) |
|---|---|---|
| **German for real life** | Lessons are about the situations newcomers actually face | A1: greetings to appointments, shopping, the doctor and registering an address. A2: offices and letters, work, home and neighbours, train and hotel, health, phone calls (README "The German course") |
| **A clear CEFR path** | You always know your level and what's next | Learn tab grouped by CEFR level and unit; A1 and A2 each end in a checkpoint; start at A1 or A2 (v0.5.2) |
| **A habit that's kind** | Short, game-like, and practice is never locked | 10–12 exercises per lesson; XP, streak, daily goal; correct answers give back a heart (up to 5); Practice replays finished lessons for free (v0.5.2, v0.5.3) |

**Supporting points:** installable from the browser (PWA), works offline once loaded, free, no
account needed, no ads, original content written for this course, a grammar tip before every
lesson, Lumi the paper-lantern guide.

## 3. Key messages by persona

| Persona | Primary message | Proof |
|---|---|---|
| Priya (pre-arrival) | "Get your German ready before you move. Free, on any Android or iPhone browser, even offline." | PWA, offline, free, A1 + A2 |
| Sam (expat) | "The German you need at the Bürgeramt, the doctor and with your neighbours." | A1/A2 unit topics |
| Amara (A1 deadline) | "Practise all of A1, every day, between your classes." | 60 A1 lessons, ~700 exercises, A1 checkpoint, daily goal |
| Tom (hobby) | "Pick up where you left off. Start at A2 if A1 is too easy, and practise as much as you like." | Start level, free Practice, no ads |

## 4. Proof points (true on `main`, v0.5.3)

Use only these numbers and claims in public copy. Source: README (2026-11-20) and CHANGELOG
`[0.5.3]`, `[0.5.2]`, `[0.5.0]`.

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
| P14 | All content is original; teaches both "du" and "Sie"; accepts natural word orders | README |
| P15 | Free, no ads, no payments | PRD §7, no payment code on `main` |
| P16 | Profile with day streak, total XP, lessons done, starting level and an "XP this week" chart | README, CHANGELOG 0.5.3 |

## 5. Claims we must NOT make (today)

| Don't say | Why | Say instead |
|---|---|---|
| Any exam brand ("Goethe", "telc", "TestDaF", "ÖSD") or "exam-ready", "pass your exam" | PD-035 | "CEFR A1 and A2", "practise the A1 basics" |
| "Required for your visa / citizenship" or any legal requirement | PD-035, rules change (2026 cuts) | "Many people need A1 or B1 German for life in Germany. Check the official requirements for your case." (only in long-form content, with a link to the official source) |
| "Native audio", "recorded by native speakers" | Audio is device speech; TTS licence pending | "Listen with your device's German voice" |
| "Reviewed by native speakers" | Native review pending (STATUS) | Nothing, until it's done |
| "Speak", "pronunciation feedback", "writing practice" | Not on `main` for German | Nothing |
| "Leagues", "compete with friends", "sync across devices", "sign in" | Need accounts (v0.6.0) | "Leagues are coming" only if clearly labelled as future |
| "B1", "A1 to C1" as current | B1 is unmerged (PD-063) | "A1 and A2 today; B1 is being written" |
| "Fill-the-gap exercises" | Built but no content yet | Nothing |
| "#1", "best", "most effective", user counts, ratings, reviews, awards | Marketing rules | Nothing |
| "Free forever" | Pricing undecided | "Free" (true today) |
| "Like [app]" / "[app] alternative" | Brand and IP rules | Describe our own product |

## 6. Brand voice

- Warm, plain, encouraging. Short sentences. Talk to "you".
- Practical over playful: lead with the situation ("at the doctor's"), then the game.
- German words appear where they help and are always easy: "Guten Morgen", "Bürgeramt",
  "Anmeldung". Explain a German word the first time.
- Lumi is the guide, not a clown: "Lumi glows brighter as your streak grows" is fine.
- Visual identity (v0.5.3): light theme, indigo `#4338CA` and coral `#F2613F` with gold XP,
  Bricolage Grotesque and DM Sans (`docs/design/v2/BRIEF.md`). Use real app screenshots from
  `docs/media/` only.

## 7. Taglines (pick one per channel, A/B later)

1. German for your life in Germany. Five minutes a day.
2. From "Guten Morgen" to the Bürgeramt.
3. Your daily German, even offline.
4. Learn German for the life you're moving to.
5. German, five minutes at a time. Free.

German versions for DACH-facing copy:
1. Deutsch für dein Leben in Deutschland. Fünf Minuten am Tag.
2. Von „Guten Morgen" bis zum Bürgeramt.
3. Dein tägliches Deutsch, auch offline.
