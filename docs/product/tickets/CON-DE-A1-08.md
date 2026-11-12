# CON-DE-A1-08: A1 Unit 8 "Free Time": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-07 · **Milestone:** v0.3.2 ·
**Curriculum:** `curriculum-german.md` §4 Unit 8

## User story
As a learner who wants to make friends, I want to talk about my hobbies and what I can do,
so that I can join activities and plan a weekend.

## Unit outline
- **Theme:** hobbies, likes and dislikes, abilities, weekend plans
- **Can-do:** I can talk about my hobbies, say what I like and don't like doing, and say what
  I can and can't do.
- **Grammar:** `gern`, `nicht gern`, `lieber`; `mögen` (`ich mag` + noun); stem change
  `lesen → liest`, `fahren → fährt`, `laufen → läuft`; `können` + infinitive at the end.

## Acceptance criteria
1. Unit `de-a1-u08`, title "Free Time", description "Talk about your hobbies, what you like
   doing and what you can do, and make plans for the weekend.", in level A1 after
   `de-a1-u07`, with these lessons in order:
   1. `de-a1-u08-l1-hobbies` "Hobbies"
   2. `de-a1-u08-l2-i-like` "I Like…"
   3. `de-a1-u08-l3-on-the-move` "On the Move"
   4. `de-a1-u08-l4-i-can-swim` "I Can Swim"
   5. `de-a1-u08-l5-weekend-plans` "Weekend Plans"
2. All of **CDS-1 to CDS-13** pass.
3. At least 3 exercises use `gern` / `nicht gern` with a verb (`Ich koche gern.`) and at
   least 2 use `mögen` with a noun (`Ich mag Filme.`), and 1 multiple choice contrasts them.
4. At least 3 exercises use a stem-change verb in the `du` or `er / sie` form (`liest`,
   `fährt`, `läuft`).
5. At least 5 word-bank exercises use `können` with the infinitive at the end (`Kannst du
   gut schwimmen?`), and at least 1 multiple choice has a distractor with the infinitive in
   second position.
6. Lesson 5 is a scenario where two people agree on a plan, using `Lust haben`, a day and a
   time from Unit 7.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Hobbies | schwimmen (to swim), lesen: du liest (to read), kochen (to cook), tanzen (to dance), spielen (to play), der Fußball (football / soccer), Musik hören (to listen to music) | 7 |
| 2 | I Like… | nicht gern (not like doing; "gern" + verb = like doing, extends Unit 4), lieber (rather / prefer), mögen: ich mag, du magst (to like), das Buch (the book), der Film (the film / movie), die Serie (the series / TV show) | 6 |
| 3 | On the Move | fahren: du fährst (to go / ride / drive), das Fahrrad (the bicycle), laufen: du läufst (to run / walk), wandern (to hike), der Park (the park), oft (often) | 6 |
| 4 | I Can Swim | können: ich kann, du kannst (can / to be able to), singen (to sing), malen (to paint / draw), die Gitarre (the guitar), das Klavier (the piano) | 5 |
| 5 | Weekend Plans | das Kino (the cinema), gehen (to go, on foot), Lust haben (to feel like), die Freizeit (free time), toll (great), schade (what a pity) | 6 |

Unit total: 30 items.

## Out of scope
- `wollen` (Unit 12) and `möchten` + verb (A2 consolidation)
- Reflexive verbs (`sich treffen`): A2

## UX notes
- Tip examples: "With können, the second verb goes to the very end."; "Ich mag + a thing,
  ich ... gern + an activity."
- No sports club, film or series titles.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
_Date: 2026-11-12 · Reviewer: pm · Native review still pending (PD-038)._

**Files:** `content/courses/en-de/lessons/de-a1-u08-l1-hobbies.json`, `…-l2-i-like.json`,
`…-l3-on-the-move.json`, `…-l4-i-can-swim.json`, `…-l5-weekend-plans.json`. The unit
fragment for `course.json` was handed to the orchestrator; the pm doesn't edit `course.json`
in this worktree.

| Lesson | Exercises | MC | Word bank (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| L1 Hobbies | 12 | 4 | 4 (2 / 2) | 1 | 3 |
| L2 I Like… | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L3 On the Move | 12 | 3 | 5 (3 / 2) | 1 | 3 |
| L4 I Can Swim | 12 | 3 | 5 (4 / 1) | 1 | 3 |
| L5 Weekend Plans | 12 | 3 | 5 (4 / 1) | 1 | 3 |

**CDS checks**
1. CDS-1 Files: PASS for the lesson files (ids and titles exactly as criterion 1). The
   `course.json` entry and version bump are done by the orchestrator.
2. CDS-2 Mix: PASS (table above).
3. CDS-3 Vocabulary: PASS, with notes. Each lesson brings in only its appendix items
   (7 / 6 / 6 / 5 / 6). Extras I used: names (Aylin, Leyla); regular plurals (`Filme`,
   `Serien`); verb forms whose pattern is already taught (`er liest`, `sie läuft`, `er fährt`,
   `höre / hörst` from `Musik hören`, `er kann`, `wir können`, `fängst`); `am Wochenende`
   (U7); `der Film fängt … an` (U7 `anfangen`). `ins Kino` was left out on purpose
   because `ins` isn't taught, so the cinema is used with `das Kino ist …`. Borderline:
   `in den Park` (direction, `in` + accusative `den`). Both words are taught but this use
   is new. It goes on the CON-DE-A1-QA list.
4. CDS-4 Alternatives: PASS. Word banks list the topicalised orders the tiles allow
   (`Fußball spiele ich.`, `Gern koche ich.`, `Kochen kann er nicht.`, all four `können` orders
   in L4 ex03 / ex10). English alternatives cover football / soccer, TV shows / series,
   paint / draw, cycles / rides his bike, at / on the weekend. Listen answers are the exact
   transcript.
5. CDS-5 Distractors: PASS. Every word bank has 2–4 tiles that appear in no accepted answer.
   I checked each set so that no distractor combination gives a valid translation that
   isn't listed. For example, `gern` was taken out of L2 ex07 because `Ich mag das Buch gern`
   would be valid, and `sehr` was not used in L4 ex03.
6. CDS-6 Conventions: PASS. Umlauts and ß are correct (`Fußball`, `fährst`, `läuft`, `groß`,
   `fängt`), nouns are capitalised, match pairs have articles, tiles are in authored case,
   and no tile set has `Sie` (only `sie` in L3 ex04 and L4 ex12). `(to a friend)` is marked
   where needed.
7. CDS-7: PASS. All MC prompts are in English and all options in German, with the standard
   wording.
8. CDS-8: PASS. Sentences and scenario are original, with no brands or titles.
9. CDS-9: PASS. Every audio path is `/audio/de/a1/u08/<exercise-id>.mp3`.
10. CDS-10: PASS. Tips are 60–105 characters.
11. CDS-11: PASS.
12. CDS-12: hand-checked for schema rules (strict keys, 3–4 options, 5 pairs, ≤16 tiles,
    every answer buildable after normalisation). `npm run test` is to be run by the
    orchestrator.
13. CDS-13: PASS. The longest prompt is 55 characters and the longest tile is 9.

**Unit criteria**
- 3: PASS. `gern / nicht gern` + verb: L2 ex03, ex04, ex05, ex10, ex12; L3 ex09; L5 ex06.
  `mögen` + noun: L2 ex02, ex06, ex07, ex09; L5 ex06. Contrast MC: L2 ex02 (and ex05).
- 4: PASS. Stem change in the du / er / sie form: L1 ex05, ex06; L3 ex03, ex04, ex06,
  ex07, ex11.
- 5: PASS. Word banks with `können` and the infinitive at the end: L4 ex03, ex05, ex07,
  ex10; L5 ex04 (plus L4 ex09, to_known). MC with the infinitive in second position as a
  distractor: L4 ex02, L4 ex11, L5 ex11.
- 6: PASS. In L5 Aylin and a friend agree on a plan with `Hast du Lust?` / `Ich habe Lust`
  (ex04, ex05, ex12), a day (`am Samstag`, ex02, ex11) and a time (`um halb acht`,
  `um acht`, ex10, ex11).

**Needs native review (to CON-DE-A1-QA)**
- `Ich laufe in den Park.` (natural enough for "I'm running to the park", or is `gehen`
  better once it is taught?)
- `Hast du Lust? In den Park können wir gehen.` and `Gut kann ich schwimmen.`: accepted as
  grammatical but marked orders.
- `Wir können Fußball am Samstag spielen.`: accepted, but less natural than the time-first
  order.
- `Wir können am Samstag um acht gehen.` with no destination (it depends on context).
