# CON-DE-A2-14: A2 Unit 14 "Plans and the Future": 5 original lessons incl. A2 checkpoint (en → de)
**Owner:** pm (content writer) · **Priority:** P0 · **Depends on:** CON-DE-A1-QA; appendices
of CON-DE-A2-01 … 13 (PD-052) · **Milestone:** v0.5.0 · **Wave:** 4 · **Curriculum:**
`curriculum-german.md` §4b Unit 14 · **Decisions:** PD-035, PD-045 … PD-052

## User story
As a learner finishing A2, I want to talk about my plans and goals and review the whole
level, so that I know I can handle everyday life and am ready for B1.

## Unit outline
- **Theme:** plans, predictions, goals, life one year after arriving; A2 checkpoint
- **Life in DACH:** one year in: a new course, a new job, moving flat, missing home and
  feeling proud
- **Can-do:** I can talk about plans and make predictions, describe my life now with
  adjectives, and use everything from A2 in a "my first year" situation.
- **Grammar:** **`werden` + infinitive** (future, predictions); `werden` = "to become";
  future time words; adjective endings and all A2 grammar recycled.

## Lesson outline
1. `de-a2-u14-l1-i-will` **"I Will…"**: `Ich werde nächstes Jahr in Wien wohnen.`, `Wirst du
   den Kurs machen?`, `Wir werden bald umziehen` is **not** allowed (`umziehen` is L3); use
   `Wir werden bald eine Wohnung suchen.`, `In Zukunft werde ich mehr lesen.`, `der Plan`,
   `planen`.
2. `de-a2-u14-l2-predictions` **"It Will Rain"**: `Morgen wird es regnen.`, `Es wird kalt.`,
   `Am Abend wird es dunkel.`, `Das wird wahrscheinlich teuer.`, `Sie kommt sicher /
   bestimmt.`, `die Wolke`, `der Nebel`. Recycles U1 weather.
3. `de-a2-u14-l3-goals` **"Goals"**: `Mein Ziel ist B1` is **not** allowed (level codes are UI
   text, not content); use `Mein Ziel ist ein neuer Job.`, `Ich werde die Prüfung machen.`,
   `Ich hoffe, dass ich die Prüfung bestehe.`, `Ich übe jeden Tag` is **not** allowed
   (`jeden` not taught); use `Ich übe immer abends.`, `Ich lerne weiter Deutsch.`, `Mein
   Traum ist ein kleines Haus.`, `Wir ziehen im Mai um.`
4. `de-a2-u14-l4-about-me` **"About Me"**: a short self-portrait one year after arrival:
   `Ich habe eine kleine Wohnung und einen neuen Job.`, `Ich bin glücklich und zufrieden.`,
   `Ich vermisse meine Familie.`, `Ich bin stolz.`, `die Heimat`, `das Leben`.
5. `de-a2-u14-l5-a2-checkpoint` **"A2 Checkpoint: Your First Year"**: 14 exercises, one per A2
   unit, as one invented story: Lina (the A1 checkpoint character) looks back on her first
   year and ahead to the next. New items: `schaffen` (`Ich habe es geschafft!`), `die
   Erinnerung`.

## Acceptance criteria
1. Unit `de-a2-u14`, title "Plans and the Future", description "Talk about plans, goals and
   predictions with werden, and finish A2 with a review of your first year.", in level A2
   after `de-a2-u13`, with these lessons in order:
   1. `de-a2-u14-l1-i-will` "I Will…"
   2. `de-a2-u14-l2-predictions` "It Will Rain"
   3. `de-a2-u14-l3-goals` "Goals"
   4. `de-a2-u14-l4-about-me` "About Me"
   5. `de-a2-u14-l5-a2-checkpoint` "A2 Checkpoint: Your First Year"
2. All of **CDS-1 to CDS-19** pass, with the checkpoint exception of PD-047.
3. `werden` + infinitive appears in at least 6 exercises, covering `ich werde`, `du wirst`,
   `er / sie / es wird` and `wir werden`; where the English has a time word and the tiles
   allow it, the present-tense answer is also accepted (CDS-19.3).
4. `werden` = "to become" appears in at least 2 exercises, and 1 multiple choice for "It's
   getting cold." offers `Es wird kalt.` (correct) with the distractors `Es ist kalt.` and
   `Es werdet kalt.`.
5. L4 has at least 3 exercises with attributive adjective endings (nominative and accusative,
   U6 rules).
6. **A2 checkpoint (L5):** exactly **14 exercises**, one built around each A2 unit (U1–U14),
   told as one story; the mapping unit → exercise id is recorded in the self-review. The
   type mix of CDS-2 holds (at least 3 MC, 3 word banks with both directions, 1 match pairs,
   2 listen). Only the 2 new items below. The tip starts "This lesson reviews all of A2."
7. `die Prüfung` is a generic exam: no exam names, levels as content, pass guarantees or
   certification claims (PD-035).
8. After this ticket, level A2 in `course.json` has exactly 14 units and 70 lessons.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | I Will… | werden: ich werde, du wirst, er wird (will, future), bald (soon), nächstes Jahr (next year), die Zukunft / in Zukunft (the future / in future), der Plan (the plan), planen (to plan) | 6 |
| 2 | It Will Rain | werden (to become / get: Es wird kalt.), wahrscheinlich (probably), sicher (surely / safe), bestimmt (definitely / certainly), die Wolke (the cloud), der Nebel (the fog) | 6 |
| 3 | Goals | das Ziel (the goal), die Prüfung (the exam), bestehen (to pass, an exam), üben (to practise), weiter (further / on: weiter lernen), der Traum (the dream), umziehen / umgezogen (to move house) | 7 |
| 4 | About Me | das Leben (life), glücklich (happy), zufrieden (satisfied / content), stolz (proud), vermissen (to miss), die Heimat (home / home country) | 6 |
| 5 | A2 Checkpoint: Your First Year | schaffen: ich habe es geschafft (to manage / make it), die Erinnerung (the memory) | 2 |

Unit total: 27 items. `nächste` (A1) is used in the fixed chunks `nächstes Jahr` / `nächste
Woche`. `wurde` and Futur II are not taught.

## Out of scope
- `werden` passive (B1), Futur II (B2), `würde` (B1)
- A dedicated checkpoint node, badge or timer (Phase 2, curriculum §6)
- Exam preparation content (PD-035)

## UX notes
- Tip examples: "Future: werden + infinitive at the end: Ich werde Deutsch lernen.";
  "werden alone means become: Es wird dunkel."; checkpoint: "This lesson reviews all of A2.
  Follow Lina through her first year."
- The checkpoint story is warm and ends on an encouraging line (`Ich habe es geschafft!`).

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…19 and criteria 3–8)_
