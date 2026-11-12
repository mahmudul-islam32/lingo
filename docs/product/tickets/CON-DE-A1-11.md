# CON-DE-A1-11: A1 Unit 11 "At the Doctor's": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-10 · **Milestone:** v0.3.3 ·
**Curriculum:** `curriculum-german.md` §4 Unit 11

## User story
As a learner who gets ill, I want to make an appointment, say what hurts and understand how
to take my medicine, so that I can get help when I need it.

## Unit outline
- **Theme:** the body, symptoms, appointments, the practice reception, the pharmacy
- **Can-do:** I can make a doctor's appointment, say what hurts and since when, check in at
  the reception and understand simple instructions for taking medicine.
- **Grammar:** `wehtun` (singular and plural); `Ich habe Kopfschmerzen`; `dürfen`
  (`Darf ich …?`); Sie imperative review; `seit gestern` as a chunk.

## Acceptance criteria
1. Unit `de-a1-u11`, title "At the Doctor's", description "Say what hurts, make an
   appointment, check in at the practice and get your medicine.", in level A1 after
   `de-a1-u10`, with these lessons in order:
   1. `de-a1-u11-l1-the-body` "The Body"
   2. `de-a1-u11-l2-what-hurts` "What Hurts?"
   3. `de-a1-u11-l3-appointment` "Making an Appointment"
   4. `de-a1-u11-l4-reception` "At the Reception"
   5. `de-a1-u11-l5-pharmacy` "At the Pharmacy"
2. All of **CDS-1 to CDS-13** pass.
3. At least 2 exercises contrast `tut weh` (singular) with `tun weh` (plural: `Meine Augen
   tun weh.`).
4. At least 2 exercises build `-schmerzen` compounds from taught nouns (`Kopfschmerzen`,
   `Bauchschmerzen`, `Rückenschmerzen`, `Halsschmerzen`).
5. At least 2 exercises use `dürfen` in a question (`Darf ich hier warten?`).
6. **Safety:** no exercise gives medical advice, names a real medicine or dose beyond the
   generic `dreimal täglich`, or describes serious illness, emergencies or distressing
   symptoms (CDS-11). Lesson 5 only practises understanding a pharmacist's simple
   instruction.
7. The doctor and staff are both `der Arzt` and `die Ärztin` across the unit, and the
   learner's answers accept both forms.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | The Body | der Kopf (the head), der Bauch (the stomach / belly), der Rücken (the back), der Hals (the throat / neck), der Arm (the arm), das Bein (the leg), das Auge / die Augen (the eye / eyes) | 7 |
| 2 | What Hurts? | wehtun: tut weh / tun weh (to hurt), die Schmerzen / Kopfschmerzen (pain / headache), krank (ill / sick), das Fieber (fever / a temperature), der Husten (cough) | 5 |
| 3 | Making an Appointment | der Termin (the appointment), die Praxis (the practice / surgery), der Arzt / die Ärztin (the doctor), gestern (yesterday), seit gestern (since yesterday), dringend (urgent) | 6 |
| 4 | At the Reception | die Krankenkasse (the health insurance company), die Versichertenkarte (the health insurance card), das Wartezimmer (the waiting room), warten (to wait), Nehmen Sie bitte Platz (please take a seat), dürfen: darf ich …? (may / to be allowed to) | 6 |
| 5 | At the Pharmacy | die Apotheke (the pharmacy), die Tablette (the tablet / pill), das Medikament (the medicine), dreimal täglich (three times a day), gute Besserung! (get well soon!) | 5 |

Unit total: 29 items.

## Out of scope
- Dative with body parts (`Mir tut der Kopf weh`): A2
- Emergency numbers and hospital admission: not in A1 content (safety)

## UX notes
- Tip examples: "One thing hurts: tut weh. Two or more: tun weh."; "German loves compound
  nouns: Kopf + Schmerzen = Kopfschmerzen."
- Tone stays light and practical: a cold, a sore back, a headache.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–7)_

## PM self-review
_Date: 2026-11-12 · Reviewer: pm · Native review still pending (PD-038)._

**Files:** `content/courses/en-de/lessons/de-a1-u11-l1-the-body.json`, `…-l2-what-hurts.json`,
`…-l3-appointment.json`, `…-l4-reception.json`, `…-l5-pharmacy.json`. The unit fragment for
`course.json` was handed to the orchestrator. The pm doesn't edit `course.json` in this
worktree.

| Lesson | Exercises | MC | Word bank (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| L1 The Body | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L2 What Hurts? | 12 | 4 | 5 (3 / 2) | 1 | 2 |
| L3 Making an Appointment | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L4 At the Reception | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L5 At the Pharmacy | 12 | 3 | 5 (3 / 2) | 1 | 3 |

**CDS checks**
1. CDS-1 Files: PASS for the lesson files (ids and titles exactly as in criterion 1). The
   orchestrator adds the `course.json` entry and bumps the version.
2. CDS-2 Mix: PASS (table above).
3. CDS-3 Vocabulary: PASS, with notes. Each lesson brings in only its appendix items
   (7 / 5 / 6 / 6 / 5). Extras I used:
   - regular plurals (`Beine`, `Arme`, `Tabletten`)
   - the `-schmerzen` compounds of taught nouns (`Bauch-`, `Hals-`, `Rückenschmerzen`), which
     criterion 4 requires
   - one invented surname (`Herr Okafor`)
   - forms of taught verbs (`tun` from wehtun, `kommt`, `rufe … an`, `nehmt` / `wartet` /
     `warte` only as MC distractors)
   - `es` from taught phrases (`es gibt`, `wie geht es`) in `Wo tut es weh?`
   - `Platz` only inside the taught phrase `Nehmen Sie bitte Platz`

   Items from Units 9–10 (taught, written in parallel): `frei`, `weit`, `links`, `rechts`,
   `muss`, `es gibt`, `Zimmer`, `Schlafzimmer`, `Wohnzimmer`. If those units drop any of
   them, L3 ex04 / ex11 / ex12, L4 ex05 / ex11 and L5 ex04 / ex07 need a check.
4. CDS-4 Alternatives: PASS. Word banks list the orders the tiles allow:
   - time-first and topicalised orders (`Seit gestern habe ich Fieber.`, `Jetzt kommt die
     Ärztin.`, `Halsschmerzen habe ich.`, both orders of the cat sentence in L1 ex07)
   - `Ich habe Halsschmerzen.` / `Mein Hals tut weh.` for "I have a sore throat"
   - on the English side: ill / sick, tablets / pills, practice / surgery, may / can, with or
     without `some`, and both forms of the `Krankenkasse` question

   Listen answers are the exact transcript.
5. CDS-5 Distractors: PASS. Every word bank has 2–4 tiles that appear in no accepted answer.
   No accepted answer needs the same tile twice. Two sentences were rewritten for this:
   L3 ex12, where "on **the** left" would need `the` twice, and L5 ex12, where only `any
   medicine` is buildable and not `a medicine`. I checked each set so that no distractor
   combination gives a valid translation that isn't listed:
   - `Darf ich warten?` can't be built in L4.
   - `ist` was left out of L5 ex04, so `Ist hier eine Apotheke?` can't be built.
   - `here` was left out of L3 ex12.
6. CDS-6 Conventions: PASS. Umlauts and ß are correct (`Ärztin`, `Rücken`, `täglich`,
   `heiß`, `heißt`). Nouns are capitalised, match pairs have articles, and tiles are in
   authored case. No tile set mixes `sie` / `Sie` or `ihr` / `Ihr`: L4 ex08 has `Sie` +
   `Ihre` only, and `Sie ist …` in L2 ex12 is a prompt with English tiles. `(formal)` and
   `(to a friend)` are marked where they matter.
7. CDS-7: PASS. All MC prompts are in English and all options in German, with the standard
   wording.
8. CDS-8: PASS. All sentences and the pharmacy scenario are original, with no brands.
9. CDS-9: PASS. Every audio path is `/audio/de/a1/u11/<exercise-id>.mp3` (14 listen
   exercises).
10. CDS-10: PASS. Tips are 87–96 characters.
11. CDS-11: PASS. The symptoms are everyday ones (headache, sore throat, back, cough, a
    fever) and there's no emergency or serious illness. No medicine or brand names and no
    dose beyond the generic `dreimal täglich`. Nobody gives medical advice: L5 only practises
    understanding the pharmacist's instruction and asking for "a medicine". Both `der Arzt`
    and `die Ärztin` are used.
12. CDS-12: I hand-checked the schema rules (strict keys, 3–4 options, 5 pairs, ≤ 16 tiles,
    every answer buildable after normalisation, unique ids `de-a1-u11-lN-exNN`). The
    orchestrator runs `npm run test`.
13. CDS-13: PASS. The longest prompt is 68 characters (L5 ex03) and the longest tile is 17
    (`Versichertenkarte`).

**Unit criteria**
- 3: PASS. `tut weh` vs `tun weh`: L2 ex02 (MC contrast), ex03 (`tut` with a `tun`
  distractor), ex06 (`Meine Beine tun weh.`), ex09; L5 ex09.
- 4: PASS. `-schmerzen` compounds: L2 ex04, ex05, ex07 (`Halsschmerzen`), ex09
  (`Rückenschmerzen`); L5 ex02.
- 5: PASS. `dürfen` questions: L4 ex01, ex02 (`Darf ich hier warten?`), ex07 (`Darf ich
  morgen anrufen?`), ex12 (`Darf ich hier Wasser trinken?`).
- 6: PASS (see CDS-11).
- 7: PASS. `die Ärztin`: L3 ex01, ex05, ex11. Both forms: L3 ex07 and L4 ex10, where every
  learner answer with "doctor" accepts `Arzt` and `Ärztin`.

**Needs native review (to CON-DE-A1-QA)**
- `Ich habe Fieber seit gestern.` and `Fieber habe ich seit gestern.` (L3 ex03),
  `Halsschmerzen habe ich.` (L2 ex07) and `Zwei Augen und vier Beine hat die Katze.`
  (L1 ex07): accepted as grammatical but marked orders.
- `Wo tut es weh?` without the dative `Ihnen` (the dative is A2): natural enough at A1?
- `Wie heißt Ihre Krankenkasse?` (the more typical `Bei welcher Krankenkasse sind Sie?`
  needs the dative).
- `Meine Versichertenkarte ist hier.` accepted for "Here is my health insurance card."
- `Darf ich hier Wasser trinken?` and `Mein Hals ist kalt.`: natural at A1?
- English side: L3 ex06 doesn't accept the learner form "My back is hurting since
  yesterday".
