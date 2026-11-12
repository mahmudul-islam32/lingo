# CON-DE-A1-02: A1 Unit 2 "Where Are You From?": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-01 · **Milestone:** v0.3.1 ·
**Curriculum:** `curriculum-german.md` §4 Unit 2

## User story
As a newcomer, I want to say where I come from, where I live and which languages I speak,
so that I can introduce myself in a class, at work or to my neighbours.

## Unit outline
- **Theme:** countries, cities, languages, people in the class
- **Can-do:** I can say where I come from, where I live and which languages I speak, and ask
  others the same.
- **Grammar:** present tense of regular verbs for all persons; `sprechen` (e → i); `woher`,
  `wo`, `wer`, `was`; V2 word order; `aus` + country, `in` + city.

## Acceptance criteria
1. Unit `de-a1-u02`, title "Where Are You From?", description "Say where you come from,
   where you live and which languages you speak, and ask other people.", in level A1 after
   `de-a1-u01`, with these lessons in order:
   1. `de-a1-u02-l1-countries` "Countries"
   2. `de-a1-u02-l2-where-do-you-live` "Where Do You Live?"
   3. `de-a1-u02-l3-languages` "Languages"
   4. `de-a1-u02-l4-he-she-we` "He, She, We"
   5. `de-a1-u02-l5-welcome-cafe` "The Welcome Café"
2. All of **CDS-1 to CDS-13** pass.
3. Across the unit, every person (`ich`, `du`, `er / sie`, `wir`, `ihr`, `sie`, `Sie`) appears
   in at least 2 exercises with a regular verb (`kommen`, `wohnen`, `lernen`).
4. At least 3 exercises practise the stem change `du sprichst` / `er spricht`, including 1
   multiple choice with `sprecht`/`sprechst` as distractor options.
5. At least 2 word-bank exercises practise V2 with a non-subject first ("Now I live in
   Vienna." → `Jetzt wohne ich in Wien.`), and both `Jetzt wohne ich in Wien.` and `Ich wohne
   jetzt in Wien.` are accepted where the English allows both.
6. Lesson 4 never has `sie` and `Sie` in the same tile set (PD-033), and every English
   prompt with "she" or "they" makes the meaning unambiguous.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Countries | woher? (where from?), kommen: ich komme, du kommst (to come), aus (from), Deutschland (Germany), Österreich (Austria), die Schweiz / aus der Schweiz (Switzerland / from Switzerland), Indien (India) | 7 |
| 2 | Where Do You Live? | wo? (where?), wohnen (to live), in (in), die Stadt (the city / town), das Land (the country), die Adresse (the address), jetzt (now), hier (here) | 8 |
| 3 | Languages | sprechen: du sprichst, er spricht (to speak), Deutsch (German), Englisch (English), Arabisch (Arabic), Türkisch (Turkish), ein bisschen (a little), lernen (to learn) | 7 |
| 4 | He, She, We | er (he), sie (she), wir (we), ihr (you, to several friends), sie (they), der Freund / die Freundin (the friend) | 6 |
| 5 | The Welcome Café | wer? (who?), was? (what?), machen (to do / make), der Kurs (the course / class), neu (new) | 5 |

Unit total: 33 items. City names (Berlin, Wien, Zürich, Hamburg, Graz) are allowed proper
nouns (CDS-3).

## Out of scope
- More country names with articles (die Türkei, der Iran): A2 or later
- Nationalities (der Inder, die Deutsche): A2

## UX notes
- Tip examples: "The verb is always the second part of a German sentence."; "In 'du
  sprichst' the e changes to i."
- Names in examples reflect people who live in DACH today (invented, varied).

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
**Date:** 2026-11-12 · **Status:** content written, waiting for schema test (`npm run test`) and
the orchestrator's manifest merge. Native-speaker review is still open (PD-038).

| Rule | Result | Notes |
|---|---|---|
| CDS-1 Files | PASS (pending merge) | 5 lesson files in `content/courses/en-de/lessons/`, with the ticket's ids and titles in order. The pm did not edit `course.json` (parallel unit work). The manifest fragment was handed to the orchestrator, which adds the unit after `de-a1-u01` and bumps `version`. |
| CDS-2 Mix | PASS | Each lesson has 12 exercises. L1: 4 MC, 4 WB (2 to_learning, 2 to_known), 1 MP, 3 listen. L2–L5: 3 MC, 5 WB (3 to_learning, 2 to_known), 1 MP, 3 listen. |
| CDS-3 Vocabulary | PASS | New items per lesson match the appendix (7/8/7/6/5). Allowed extras used: city names (Hamburg, Berlin, Wien, Graz, Zürich), invented names, `Sie kommen / Sie wohnen` (the Sie pattern from `Sie heißen`, U1), `ist` / `sind` / `mein` / `der` / `die` (words from taught U1 phrases), the plurals `Freunde` / `Freundinnen`, and `heißt`/`-t` forms only after `spricht` (L3) or `er` (L4). The 3rd person with names first appears in L3 (`Amira spricht`) and the `er` pronoun first appears in L4. There are no yes/no questions (U3), no `ein/eine` (U4) and no `das ist` (U4). |
| CDS-4 Alternatives | PASS | Word-order variants are listed: `jetzt`/`hier` fronted or mid-sentence, `Herr Novak, wo …` / `Wo …, Herr Novak?`, and both language orders with `und`. English answers list contraction variants (`I'm` / `I am`, `you're` / `you are`) and `a little` / `a (little) bit of`. Both forms are accepted for `Freunde` / `Freundinnen`. |
| CDS-5 Distractors | PASS | Each word bank and listen has 2–4 distractors. Every combination of distractors was checked: they either change the meaning (wrong person, wrong country, wrong register against "(formal)" / "(to a friend)") or are ungrammatical. Fronted prepositional phrases (`Aus Österreich komme ich.`) are not accepted on purpose (marked emphasis). See the open question below. |
| CDS-6 German conventions | PASS | Umlauts and ß are correct (Österreich, Türkisch, Zürich, heiße). Every noun in match pairs and MC has its article. Tiles keep their authored case: sentence-initial words are lower case, nouns, names and `Sie` are capitalised. Lowercase `sie` tiles appear only in L4 ex03, ex07, ex12 and L5 ex10, and none of these has a `Sie` tile. No to_known prompt starts with a sentence-initial `Sie` / `sie`. Register is marked in prompts. |
| CDS-7 MC direction | PASS | All MC prompts are English, use the "Which one / Which sentence means '…'?" wording, and have German options. |
| CDS-8 Originality | PASS | All sentences are original. The welcome-café scenario is our own. Names are varied and invented: Priya, Kaya, Novak, Amira, Jonas, Tarek, Ravi, Weber, Haddad. |
| CDS-9 Audio | PASS | 15 listen exercises, all with `/audio/de/a1/u02/<exercise-id>.mp3`. |
| CDS-10 Tip | PASS | 5 tips, from 80 to 100 characters. |
| CDS-11 Inclusive | PASS | No slang and no sensitive topics. Both forms of person nouns (`Freund` / `Freundin`, `Lehrer` / `Lehrerin`) appear. No visa or legal claims. |
| CDS-12 Validation | PENDING | Ids follow `de-a1-u02-lN-exNN`. Every answer was checked by hand to be buildable from its tiles after `text.ts` normalisation (the duplicate `ich` tile in L1 ex12 covers the 2 needed). The schema test is to be run by the orchestrator. |
| CDS-13 Fit | PASS | The longest prompt is 62 characters. The longest tile is `Freundinnen` (11). |

**Ticket criteria**
- **3 Persons with kommen/wohnen/lernen: PASS.**
  - ich: many
  - du: L1 ex02, ex05, ex10, L2 ex01, ex07
  - er/sie: L4 ex02 (`er kommt`), L4 ex03 (`sie wohnt`), L5 ex10 (`sie kommt`)
  - wir: L4 ex04, ex06, L5 ex08
  - ihr: L4 ex05, ex08, L5 ex12
  - sie (they): L4 ex07, ex12
  - Sie: L1 ex08, L2 ex04, ex11
- **4 sprichst/spricht: PASS.** L3 ex04, ex05, ex08, ex09, ex12. The MCs with `sprechst` / `sprecht` as distractors are L3 ex04 and ex08.
- **5 V2 non-subject first: PASS.** In L2 ex05, `Jetzt wohne ich in Wien.` and `Ich wohne jetzt in Wien.` are both accepted. L3 ex07 does the same with `Jetzt lerne ich Deutsch.` / `Ich lerne jetzt Deutsch.`. L5 ex08 also accepts `Hier lernen wir Deutsch.`.
- **6 L4 sie/Sie: PASS.** No `Sie` tile appears in L4. The "she" prompt (ex03) is unambiguous. The "they" prompt (ex07) adds "(two or more people)" so it is not read as singular they.

**Open questions (for CON-DE-A1-QA / native review)**
- Should fronted prepositional phrases (`In Wien wohne ich.`) be accepted? Today we accept only fronted `jetzt` / `hier`.
- Is `Wir lernen Deutsch hier.` (L5 ex08) natural enough to keep as an accepted answer?
