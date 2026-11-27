# PWA and store listing text (draft, v0.5.4)

**Last updated:** 2026-11-27 (MKT-002) · **Valid for:** v0.5.4 on `main`, plus one v0.5.5 draft
line marked DRAFT

**Status:** draft. The web app manifest is dev-platform's (PWA config); hand the manifest text
over via a proposal. Store listings (Google Play via a Trusted Web Activity, web-app
directories) are published by the owner only. Character limits below are the common store
limits; check the store's form on the day.

The listing describes **the German course only**. The exam-prep courses on `main` are not
mentioned until the owner clears the exam-name and licence questions (`../positioning.md` §5b).

## App name
- **Name:** Polyglow: Learn German
- **Short name (home screen, ≤ 12):** Polyglow

## Short description (≤ 80 characters)
- EN (A, unchanged): `German for life in Germany. Free 5-minute lessons, A1 to A2, works offline.` (75)
- EN (B, new in v0.5.4, to test): `German for life in Germany. Free 5-minute lessons, A1 to A2, set a goal date.` (77)
- DE: `Deutsch für den Alltag in Deutschland. 5-Minuten-Lektionen, A1 bis A2, offline.` (79)

## Manifest `description` (one sentence)
Learn German for everyday life in Germany with free five-minute lessons from A1 to A2 that work
offline.

## Full description (EN)

Learn the German you need for life in Germany, five minutes at a time.

Polyglow is a free German course in short, game-like lessons. It follows the CEFR levels A1 and
A2 and is built around real situations: greeting people, making appointments, shopping, the
doctor, registering your address, offices and letters, work, the train and your neighbours.

WHAT'S INSIDE
• 130 lessons in 26 units: A1 (60 lessons) and A2 (70 lessons), each ending in a checkpoint
• A short grammar tip before every lesson, then 10–12 exercises
• Multiple choice, match the pairs, build the sentence (both directions) and listening
• Wrong answers come back at the end, so you finish every lesson on a right answer
• Listening uses your device's German voice, at normal or slow speed

YOUR LEVEL, YOUR DATE
• Pick a level and a date, for example "A2 by 25 March"
• See the lessons left, the days to go and whether your daily goal gets you there
• One tap raises your daily goal if you need more. Polyglow suggests; you decide

A HABIT THAT'S KIND
• XP, a daily streak and a daily goal you choose
• 5 hearts: a mistake costs one, every correct answer gives one back
• Practice: replay any finished lesson for free to earn hearts back
• Start at A1 or jump straight to A2
• Sound effects for right answers and finished lessons, with an off switch

MADE FOR YOUR PHONE
• Works offline once lessons are loaded
• No account needed: progress is saved on your device
• No ads
• Profile with your streak, total XP, lessons done and an "XP this week" chart

The German course is original and written for Polyglow. The app is in English.

Coming next: accounts and sync, recorded audio, and German B1.

## Full description (DE)

Lerne das Deutsch, das du im Alltag in Deutschland brauchst, fünf Minuten am Stück.

Polyglow ist ein kostenloser Deutschkurs in kurzen Lektionen im Spielformat. Er folgt den
GER-Stufen A1 und A2 und dreht sich um echte Situationen: Begrüßen, Termine, Einkaufen,
Arztpraxis, Anmeldung, Ämter und Briefe, Arbeit, Bahn und Nachbarn.

• 130 Lektionen in 26 Einheiten (A1 und A2), jede Stufe endet mit einem Checkpoint
• Vor jeder Lektion ein kurzer Grammatik-Tipp, dann 10–12 Übungen
• Zieldatum: Niveau und Datum wählen (z. B. „A2 bis 25. März") und sehen, wie viele Lektionen
  noch fehlen und ob dein Tagesziel reicht
• Jede richtige Antwort bringt ein Herz zurück; „Practice" ist kostenlos
• Soundeffekte, im Profil abschaltbar
• Funktioniert offline, kein Konto nötig, keine Werbung
• Der Deutschkurs ist eigens für Polyglow geschrieben. Die App ist auf Englisch.

## Keywords / tags (store and directory fields)
learn german, german a1, german a2, german for beginners, deutsch lernen, german course,
german vocabulary, german for expats, life in germany, offline language app, german study plan

(No exam brand names, per PD-035. "german study plan" is new for the goal date; volume not
checked, see `seo-keywords.md`.)

## Category
Education

## Screenshots for the listing
Use the first six from `screenshot-shot-list.md` (phone, portrait, 1080 × 1920 or the store's
size), each with a one-line caption from that list. Never use a screenshot that shows the
course switch or an exam-prep course.

## Privacy fields (owner to confirm with the privacy policy)
- Data collected today: none sent to a server; progress, settings and the goal date are stored
  on the device (README, CHANGELOG 0.5.4: "The plan is computed on the device"). If analytics
  are added (launch gate G5), update this section first.

---

## DRAFT for v0.5.5 "Smart review": NOT on `main` yet. Publish only after v0.5.5 ships.

Add under "A HABIT THAT'S KIND" once v0.5.5 is released and the CHANGELOG confirms it
(GAM-015, LES-023, PLT-029):

- EN: `• Review: up to 10 exercises from lessons you've played come back when they're due. Free, no daily limit`
- DE: `• Review: bis zu 10 Übungen aus deinen Lektionen kommen zur richtigen Zeit zurück. Kostenlos, ohne Tageslimit`

Privacy line to add at the same time: "Which exercises you got right or wrong is stored on the
device to plan your review" (CTO-019; check the wording against the shipped ADR).
