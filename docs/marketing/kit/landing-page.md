# Landing-page copy (draft, v0.5.4)

**Last updated:** 2026-11-27 (MKT-002) · **Valid for:** v0.5.4 on `main`, plus one v0.5.5 draft
section marked DRAFT

**Status:** draft for the owner and dev-platform. Marketing writes the words; the page code is
dev-platform's (hand-off via a pm proposal). Every claim maps to a proof point in
`../positioning.md` §4. Replace `APP_URL` with the public URL once it exists.

Do not add: user numbers, ratings, reviews, testimonials, awards, exam brand names, the
exam-prep courses (`../positioning.md` §5b), visa or legal requirements, "native audio",
speaking, leagues, sync, B1 as available, "per-course goals", or Smart review before v0.5.5
ships.

---

## English

### Hero
**Headline:** German for your life in Germany. Five minutes a day.

**Sub-headline:** Free, game-like lessons from CEFR A1 to A2, built around real situations:
the registration office, the doctor, the supermarket, the train. Set a goal date and see what
it takes. No account, no ads, works offline.

**Primary button:** Start your first lesson
**Secondary link:** See what's inside ↓

**Small print under the button:** Free. Runs in your browser; add it to your home screen if you
like.

*Image: `docs/media/onboarding.gif` or `learn-lessons.png` in a phone frame, with Lumi.*

### Section: How it works
1. **Pick where to start.** A1 Beginner or A2 Elementary. You can change it later.
2. **Play a five-minute lesson.** A short tip, then 10–12 exercises: multiple choice, match
   the pairs, build the sentence, listen and build what you heard.
3. **Come back tomorrow.** Keep your streak, reach your daily goal and watch Lumi, your
   paper-lantern guide, glow.

### Section: German you'll actually use
130 lessons across 26 units. A1 takes you from "Guten Morgen" to appointments, shopping, the
doctor and registering your address. A2 covers offices and letters, work, home and neighbours,
train and hotel, health, phone calls and plans for the future. Each level ends with a
checkpoint.

*Image: `lesson-choice.png`, `lesson-word-bank.png`.*

### Section (new in v0.5.4): Have a date in mind?
Moving in spring? Starting a job in autumn? Pick a level and a date, for example **A2 by 25
March**. Polyglow shows how many lessons are left, how many days you have, and whether your
daily goal gets you there. If it doesn't, one tap raises your daily goal. You stay in charge:
Polyglow suggests, it never changes your goal on its own.

Set it any time in **Profile → Goal date**. After every lesson, the results screen shows how
many lessons are left.

*Image: needed. Learn tab with the goal card (`screenshot-shot-list.md` §C, missing shot 1).
Until it exists, use no image here rather than a mock-up.*

### Section: Practice is never locked
You have 5 hearts. A wrong answer costs one; **every correct answer gives one back**. Out of
hearts? Replay any lesson you've finished in **Practice**. It's free, never costs hearts and
earns them back.

*Image: `lesson-feedback-correct.png`.*

### Section: Made for phones, trains and busy weeks
- **Works offline.** Lessons you've opened keep working without signal.
- **Installable.** Add Polyglow to your home screen from the browser. No app store needed.
- **No account.** Your progress is saved on your device.
- **Your stats.** Day streak, total XP, lessons done and an "XP this week" chart.
- **Sounds you control.** A chime for a right answer and a fanfare at the end. Quiet place?
  Turn sound effects off in Profile.

*Image: `offline-banner.png`, `profile.png`.*

### Section: Honest about what's next
Polyglow is new and growing. Coming next: accounts so your progress follows you, recorded audio,
and German B1, which is being written now. Today, listening uses your device's German voice.

### Final call to action
**Headline:** Your first German lesson takes five minutes.
**Button:** Start learning free

### Footer
Impressum · Privacy · Contact · German course content © Polyglow

(Changed in v0.5.4 from "Original course content © Polyglow": the app on `main` also holds
exam-prep courses that are not our original content. The owner or a lawyer should confirm the
footer line together with the Impressum, `../waiting-on-owner.md` A3 and A7.)

### Meta
- **Title tag (≤ 60 chars):** Polyglow: learn German for life in Germany, free
- **Meta description (≤ 155 chars):** Free, game-like German lessons from A1 to A2 for daily life
  in Germany. Set a goal date, learn offline, no account, no ads. (about 125)

---

## Deutsch (für Seiten, die sich an Menschen in Deutschland richten)

Note: the app itself is in English. Say so on the German page so nobody is surprised. Screen
names ("Profile", "Goal date", "Practice") stay in English because that is what the app shows.

### Hero
**Überschrift:** Deutsch für dein Leben in Deutschland. Fünf Minuten am Tag.

**Unterzeile:** Kostenlose Lektionen im Spielformat von A1 bis A2, rund um echte Situationen:
Bürgeramt, Arztpraxis, Supermarkt, Bahn. Mit Zieldatum, ohne Konto, ohne Werbung, auch
offline. Die App erklärt auf Englisch.

**Button:** Erste Lektion starten

### So funktioniert's
1. **Wähle deinen Start:** A1 (Anfänger) oder A2 (Grundkenntnisse).
2. **Fünf Minuten üben:** ein kurzer Tipp, dann 10–12 Übungen.
3. **Morgen weitermachen:** Serie halten, Tagesziel erreichen, Lumi leuchten lassen.

### Neu: Du hast ein Datum im Kopf?
Wähle ein Niveau und ein Datum, zum Beispiel **A2 bis 25. März**. Polyglow zeigt dir, wie viele
Lektionen noch fehlen, wie viele Tage du hast und ob dein Tagesziel dafür reicht. Wenn nicht,
erhöhst du es mit einem Tipp. Die App schlägt vor, sie ändert nichts ohne dich. Einstellen
unter „Profile" → „Goal date".

### Üben ist nie gesperrt
Jede richtige Antwort bringt ein Herz zurück. Und im Bereich „Practice" wiederholst du
fertige Lektionen kostenlos.

### Gemacht fürs Handy
Funktioniert offline, lässt sich vom Browser aus installieren, kein Konto nötig. Soundeffekte
lassen sich im Profil ausschalten.

**Abschluss-Button:** Kostenlos loslegen

---

## DRAFT for v0.5.5 "Smart review": NOT on `main` yet. Publish only after v0.5.5 ships.

Source: tickets GAM-015, LES-023, PLT-029 and PD-079 … PD-081 (open, nothing merged as a
release). Before this section goes live, check every line against the v0.5.5 CHANGELOG and the
pre-publish checklist in `social-posts.md` (Smart review draft). Place it after "Practice is
never locked".

### Section: Review what you've learned (EN)
Lessons fade if you never see them again. **Review** in the Practice tab brings back up to 10
exercises from lessons you've already played: the ones you found tricky, and the ones you
haven't seen for a while. Get one right and it waits longer before it comes back: 1 day, then
3, 7, 14 and 30 days. Not quite? It's ready again right away.

Review is free, with no daily limit. It works even with 0 hearts, every correct answer gives a
heart back, and the XP counts for your daily goal and your streak.

*Small print:* Review starts with the lessons you finish after this update.

*Image: needed after v0.5.5. Practice tab with the Review card (`screenshot-shot-list.md` §C).*

### Abschnitt: Wiederholen, was du gelernt hast (DE)
Was man nie wiedersieht, vergisst man. **Review** im Bereich „Practice" holt bis zu 10 Übungen
aus Lektionen zurück, die du schon gemacht hast: die kniffligen und die, die du länger nicht
gesehen hast. Richtig gelöst? Dann kommt die Übung später wieder: nach 1 Tag, dann nach 3, 7,
14 und 30 Tagen. Noch nicht ganz? Dann ist sie gleich wieder dran.

Kostenlos und ohne Tageslimit. Klappt auch mit 0 Herzen, jede richtige Antwort bringt ein Herz
zurück, und die XP zählen für Tagesziel und Serie.

*Kleingedruckt:* Review beginnt mit den Lektionen, die du nach diesem Update abschließt.
