# CON-DE-A1-07: A1 Unit 7 "My Day": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-06 · **Milestone:** v0.3.2 ·
**Curriculum:** `curriculum-german.md` §4 Unit 7

## User story
As a learner with a busy week, I want to tell the time, name the days and describe my
routine, so that I can make plans and keep appointments.

## Unit outline
- **Theme:** time, days of the week, routines, making plans
- **Can-do:** I can tell the time, name the days of the week, describe my daily routine and
  arrange a time to meet.
- **Grammar:** separable verbs (particle at the end); `um` + time, `am` + day; V2 inversion
  with time first; `wann`.

## Acceptance criteria
1. Unit `de-a1-u07`, title "My Day", description "Tell the time, name the days of the week,
   describe your daily routine and arrange to meet.", in level A1 after `de-a1-u06`, with
   these lessons in order:
   1. `de-a1-u07-l1-what-time-is-it` "What Time Is It?"
   2. `de-a1-u07-l2-days-of-the-week` "Days of the Week"
   3. `de-a1-u07-l3-morning-routine` "Morning Routine"
   4. `de-a1-u07-l4-separable-verbs` "Separable Verbs"
   5. `de-a1-u07-l5-making-a-plan` "Making a Plan"
2. All of **CDS-1 to CDS-13** pass. Times are written in words (`um halb acht`).
3. `halb` is taught correctly (`halb neun` = 8:30) and practised in at least 3 exercises,
   including 1 multiple choice with the common mistake (`halb acht` for 8:30) as a distractor.
4. At least 6 word-bank exercises have a separable verb with the particle at the end (`Ich
   stehe um sieben Uhr auf.`), and at least 1 multiple choice has an unsplit-verb distractor
   (`Ich aufstehe …`).
5. At least 4 exercises start with a time expression and invert subject and verb (`Am
   Montag lerne ich Deutsch.`). Where the English allows both orders, both are accepted.
6. Days are taught with `der` and used with `am`; every day of the week appears in at least
   1 exercise.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | What Time Is It? | wie spät ist es? (what time is it?), die Uhr / … Uhr (the clock / … o'clock), halb (half, "halb neun" = half past eight), Viertel nach (quarter past), Viertel vor (quarter to), um (at, with times) | 6 |
| 2 | Days of the Week | der Montag (Monday), der Dienstag (Tuesday), der Mittwoch (Wednesday), der Donnerstag (Thursday), der Freitag (Friday), der Samstag (Saturday), der Sonntag (Sunday), am (on, with days) | 8 |
| 3 | Morning Routine | aufstehen (to get up), frühstücken (to have breakfast), duschen (to shower), morgens (in the morning), früh (early), dann (then), arbeiten (to work) | 7 |
| 4 | Separable Verbs | einkaufen (to go shopping), anfangen: der Kurs fängt an (to start), anrufen (to call / phone), fernsehen (to watch TV), mittags (at midday), abends (in the evening) | 6 |
| 5 | Making a Plan | morgen (tomorrow), Zeit haben (to have time), wann? (when?), das Wochenende (the weekend), bis dann (see you then) | 5 |

Unit total: 32 items.

## Out of scope
- The 24-hour clock in announcements (Unit 9 uses simple full hours)
- Separable verbs in the Perfekt (A2)

## UX notes
- Tip examples: "With aufstehen, the 'auf' jumps to the end: Ich stehe um sieben auf.";
  "German 'halb neun' means half past eight: half way to nine."
- Lesson 5 is an invented message exchange between two friends arranging a time (no
  messenger brand).

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
Date 2026-11-12. I checked this by hand against `src/contracts/course.ts`, `config.ts` and `text.ts`. I did not run `npm run test` in this worktree; the orchestrator validates the files and commits them.

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Unit, lessons, ids, titles | PASS (fragment) | The 5 lesson files have the ids and titles from criterion 1. I did not edit `course.json`: the unit fragment goes to the orchestrator, who adds it after `de-a1-u06` and bumps `version` (CDS-1). |
| CDS-2 | Mix | PASS | Every lesson has 12 exercises. L1: 4 MC, 4 WB (2 to_learning, 2 to_known), 1 MP, 3 listen. L2: 4 / 4 (2+2) / 1 / 3. L3: 3 / 5 (3+2) / 1 / 3. L4: 3 / 5 (3+2) / 1 / 3. L5: 3 / 5 (3+2) / 1 / 3. |
| CDS-3 | Vocabulary | PASS | New items per lesson match the appendix (6 / 8 / 7 / 6 / 5). Everything else comes from Units 1–6 or earlier Unit 7 lessons, or is an allowed extra: the names Bastian, Lukas and Malik; the city Berlin; verb forms of taught regular verbs (`dusche`, `frühstückst`, `rufe`, `ruft`); `fängt` (given in the appendix); `es`, `ist` and `spät` from "wie spät ist es?"; `nach` and `vor` from "Viertel nach / vor"; `bis` from "bis dann". `sehe` and `sehen` are used only in the ich and wir forms. `siehst` and `sieht` (stem change) are avoided. |
| CDS-4 | Alternatives | PASS | Every time-first sentence also accepts subject-first, and the reverse, plus object-first where it reads naturally (`Deutsch lerne ich am Montag.`). `um sechs` is accepted with and without `Uhr` whenever the tiles allow both. English answers accept `It's` / `It is`, `a quarter` / `quarter`, `midday` / `noon`, `I go` / `I'm going`, and `half past six` / `six thirty`. |
| CDS-5 | Distractors | PASS | Every word bank has 2–4 distractor tiles. I checked each tile set for valid sentences that are missing from the list. As a result I added `When do you have free time tomorrow?` (L5 ex12) and `On Sunday, what are you doing?` (L2 ex12), and I replaced the distractor `what` in L5 ex12 because "What time are you free tomorrow?" was buildable. |
| CDS-6 | Conventions | PASS | Umlauts and ß are correct, there is no capital ẞ, nouns are capitalised, and days carry `der` in match pairs and MC. Tiles are in authored case. No tile set contains `Sie`. `ihr` (L1 ex09) and `ihre` (L4 ex10) appear without `Ihr` / `Ihre`. MC prompts mark `du` with "(to a friend)" where the register matters. |
| CDS-7 | MC direction | PASS | All MC prompts are English with German options and use the standard wording. |
| CDS-8 | Originality | PASS | All sentences and the L5 message exchange between friends are original. No brands. |
| CDS-9 | Audio | PASS | All 15 listen exercises use `/audio/de/a1/u07/<exercise-id>.mp3`. |
| CDS-10 | Tip | PASS | 5 tips, each 68–96 characters. |
| CDS-11 | Safe | PASS | Everyday routine content only. |
| CDS-12 | Ids | PASS | `de-a1-u07-lN-exNN`, ex01–ex12 in every lesson. |
| CDS-13 | Fit | PASS | The longest prompt is 64 characters (L5 ex01). The longest tile is `frühstückst` at 11 characters. |
| 2 | Times in words | PASS | No digits in tiles or answers. The only digits are the "(8:30)" hint in the L1 ex04 prompt. |
| 3 | `halb` | PASS | 9 exercises use `halb`: L1 ex02, ex04, ex05, ex09, ex11; L2 ex10; L3 ex10, ex12; L5 ex11. L1 ex04 is an MC for 8:30 with `halb acht` as a distractor. |
| 4 | Separable verbs | PASS | 8 to_learning word banks put the particle at the end (L3 ex03, ex09; L4 ex03, ex05, ex10; L5 ex05, ex08, ex10). 3 more to_known prompts have it too (L3 ex12, L4 ex07, ex12). Two MCs have an unsplit-verb distractor: L3 ex01 `Ich aufstehe um sieben.` and L4 ex01 `Ich einkaufe am Samstag.` |
| 5 | Time-first inversion | PASS | 15 or more exercises start with a time expression and invert, e.g. L2 ex03–ex07 and ex09, L3 ex06, ex09, ex10, L4 ex07, ex10, ex12, L5 ex04, ex08, ex10. Where the English allows both orders, both are accepted. Two MCs use the V2 error as a distractor: L2 ex05 and L4 ex09. |
| 6 | Days | PASS | Days are taught with `der` (L2 ex01, ex02) and used with `am`. Monday: L2 ex04. Tuesday: L2 ex06. Wednesday: L2 ex10, L3 ex10. Thursday: L2 ex08, L4 ex10. Friday: L2 ex07, ex11. Saturday: L2 ex03, ex09. Sunday: L2 ex05, ex12. |

**Needs native review** (to copy into CON-DE-A1-QA):
- L3 ex09 accepts `Ich stehe früh morgens auf.`, `Früh morgens stehe ich auf.` and `Morgens früh stehe ich auf.`. They are grammatical, but `morgens früh` may sound colloquial or regional.
- L3 ex10 accepts `Ich frühstücke um halb neun am Mittwoch.`, which is grammatical but has a less usual adverb order.
- L5 ex08 accepts `Ich stehe morgen früh auf.`, which can also mean "tomorrow morning". I accepted it because it is a natural way to say the prompt. I left out `Morgen früh stehe ich auf.` because it loses "early".
- L1 ex05 accepts `Halb acht ist es.` (marked word order), in line with the Unit 4 precedent `Billig ist der Kaffee.`.
- L4 ex02 glosses `anrufen` as "to call (on the phone)".
