# CON-DE-A1-04: A1 Unit 4 "At the Bakery": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-03 · **Milestone:** v0.3.1 ·
**Curriculum:** `curriculum-german.md` §4 Unit 4

## User story
As a learner who buys breakfast every day, I want to order at a bakery and understand the
price, so that I can shop with confidence.

## Unit outline
- **Theme:** bread, cakes, drinks, prices
- **Can-do:** I can order bread, cake and drinks politely, ask what something costs and
  understand the price.
- **Grammar:** noun gender `der / die / das` (every noun with its article); `ein / eine`;
  `ich möchte` + noun; `Das ist …`; prices.

## Acceptance criteria
1. Unit `de-a1-u04`, title "At the Bakery", description "Order bread, cake and coffee
   politely, ask what things cost and pay at the counter.", in level A1 after `de-a1-u03`,
   with these lessons in order:
   1. `de-a1-u04-l1-bread-and-rolls` "Bread and Rolls"
   2. `de-a1-u04-l2-der-die-das` "Der, Die, Das"
   3. `de-a1-u04-l3-id-like` "I'd Like…"
   4. `de-a1-u04-l4-what-does-it-cost` "What Does It Cost?"
   5. `de-a1-u04-l5-saturday-bakery` "Saturday Morning at the Bakery"
2. All of **CDS-1 to CDS-13** pass.
3. **Gender practice:** at least 6 multiple-choice exercises in the unit ask for the right
   article + noun ("Which one means 'the bread'?" with `das Brot` / `der Brot` / `die
   Brot`), covering all three genders.
4. **No masculine accusative yet:** no exercise needs `einen` or `den` (objects after `ich
   möchte` are feminine or neuter, or masculine nouns appear only as subjects: `Der Kaffee
   ist heiß.`). Unit 5 introduces the accusative.
5. Prices are written in words (`zwei Euro fünfzig`) and at least 2 listen exercises are
   prices.
6. The staff speak with `Sie` and the customer answers with `Sie` (PD-032) in lesson 5.

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Bread and Rolls | das Brot (the bread), das Brötchen / die Brötchen (the bread roll / rolls), die Brezel (the pretzel), der Kuchen (the cake), die Bäckerei (the bakery), das ist (this is / that is) | 6 |
| 2 | Der, Die, Das | der Kaffee (the coffee), der Tee (the tea), die Milch (the milk), das Wasser (the water), heiß (hot), kalt (cold), lecker (tasty / delicious) | 7 |
| 3 | I'd Like… | ich möchte (I would like), ein / eine (a / an), die Tasse (the cup), das Stück (the piece / slice), noch (another / one more), gern (gladly, in "Ja, gern") | 6 |
| 4 | What Does It Cost? | kosten / was kostet …? (to cost / how much is …?), der Euro (the euro), der Cent (the cent), das macht … (that comes to …), zusammen (altogether), teuer (expensive), billig (cheap) | 7 |
| 5 | Saturday Morning at the Bakery | zum Mitnehmen (to take away), essen (to eat), trinken (to drink), mit Karte (by card), bar (in cash), das ist alles (that's all) | 6 |

Unit total: 32 items.

## Out of scope
- Masculine accusative (`einen Kaffee`): Unit 5
- Regional bakery words (Austria, Switzerland, southern Germany): Phase 2 notes

## UX notes
- Tip examples: "Learn every noun with der, die or das. The article is part of the word.";
  "'Ich möchte' is the polite way to order."
- No bakery or café brand names.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–6)_

## PM self-review
_2026-11-12, pm. Schema test not run by the author (no test runner); the orchestrator
validates. Native-speaker review still pending (PD-038)._

| Lesson | Ex. | MC | WB (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| l1 bread-and-rolls | 12 | 4 | 2 / 2 | 1 | 3 |
| l2 der-die-das | 12 | 4 | 2 / 2 | 1 | 3 |
| l3 id-like | 12 | 4 | 2 / 2 | 1 | 3 |
| l4 what-does-it-cost | 12 | 4 | 2 / 2 | 1 | 3 |
| l5 saturday-bakery | 12 | 3 | 3 / 2 | 1 | 3 |
| **Unit** | **60** | **19** | **11 / 10** | **5** | **15** |

- **CDS-1 Files:** PASS for the 5 lesson files (ids, titles, order as criterion 1). The unit
  entry is delivered as a fragment to the orchestrator, who adds it to `course.json` after
  `de-a1-u03` and bumps `version` (agreed process, the pm doesn't touch `course.json` here).
- **CDS-2 Mix:** PASS (table above).
- **CDS-3 Vocabulary:** PASS. Each lesson only uses its appendix items plus U1–U3 items
  (greetings, `bitte`, `danke`, `ja`, `nein`, `wo`, `was`, `wie`, `hier`, `sehr`, `alt`,
  `haben`, `machen`, numbers) and allowed extras: regular plural `Brezeln`; verb forms of
  taught patterns (`möchtest`, `möchten Sie`, `kosten`, `trinke`, `esse`); `Karte`, `alles`
  only inside the taught phrases `mit Karte`, `das ist alles`. `ein / eine` first appear in
  lesson 3. L1–L4 introduce 6 / 7 / 6 / 7 items, L5 6.
- **CDS-4 Alternatives:** PASS. Listed where the tiles allow them: `Bitte zwei Brötchen.`,
  `Ich möchte bitte ein Brötchen.`, `Bitte noch ein Brötchen.`, `Bitte mit Karte.`, `Das ist
  alles, danke.`, emphatic `Heiß ist der Kaffee.` / `Lecker ist der Kuchen.` / `Billig ist der
  Kaffee.`, `This / That is the cake.`, `I'd / I would like …`, `tasty / delicious`, `any
  milk`, 4 word orders for "altogether".
- **CDS-5 Distractors:** PASS. Every word bank has 2–4 tiles beyond the canonical answer;
  each combination I could form was checked (e.g. `Möchtest du hier essen?` is buildable in
  l5-ex04 but is wrong, because the prompt says "(formal)").
- **CDS-6 German conventions:** PASS. Umlauts and `ß` throughout (`Brötchen`, `Bäckerei`,
  `heiß`, `dreißig`, `fünfzig`, `möchte`), no `ẞ`, nouns capitalised, tiles in authored
  case, every match-pair noun with its article. No lowercase `sie` tile anywhere in the
  unit, so `Sie` never clashes. "(formal)" marks the register in l5-ex01 and l5-ex04.
- **CDS-7 MC direction:** PASS. All 19 MC have English prompts and German options.
- **CDS-8 Originality:** PASS. All sentences written for this unit; no brands.
- **CDS-9 Audio:** PASS. All 15 listen exercises use `/audio/de/a1/u04/<exercise-id>.mp3`.
- **CDS-10 Tip:** PASS. 5 tips, all under 100 characters.
- **CDS-11 Inclusive and safe:** PASS. No person nouns, slang or sensitive topics.
- **CDS-12 Validation:** pending the orchestrator's `npm run test`. Ids `de-a1-u04-lN-exNN`,
  unique. I checked by hand that every answer can be built from its tiles after
  `normalizeAnswerText`.
- **CDS-13 Fit:** PASS. Longest prompt 56 characters (l4-ex11); longest tile 10
  characters (`altogether`).
- **Criterion 3 (gender MC ≥ 6, all genders):** PASS, 8: das Brot, die Brezel, die
  Bäckerei (l1); der Kaffee, die Milch, das Wasser (l2); die Tasse, das Stück (l3). Plus
  the sentence-level `Die / Der Milch ist kalt.` (l2-ex08).
- **Criterion 4 (no masculine accusative):** PASS. No `einen` or `den` in any answer,
  option or tile. Objects after `möchte` / `haben` / `trinke` are feminine, neuter or plural
  (`eine Tasse Kaffee`, `ein Stück Kuchen`, `ein Wasser`, `Brezeln`, `Milch`). Masculine
  nouns appear only as subjects (`Der Kaffee ist heiß.`, `Was kostet der Kuchen?`). Prices
  avoid "1 euro" (it would need `einen Euro`).
- **Criterion 5 (prices in words, ≥ 2 price listens):** PASS. All prices are words in tiles;
  4 price listens (l4-ex05, l4-ex09, l4-ex12, l5-ex07). Only MC prompt l4-ex01 shows a digit
  price ("€2.50"), which is never tokenised.
- **Criterion 6 (Sie both ways in l5):** PASS. Staff: `Was möchten Sie?` (ex01), `Möchten Sie
  hier essen?` (ex04). Customer: `Haben Sie Brezeln?` (ex02), `Haben Sie Milch?` (ex10).

**For native review (CON-DE-A1-QA list):**
- Feminine/neuter gender distractors (`der Bäckerei`, `der Milch`, `der Tasse`) are real
  dative/genitive forms. That's fine at A1 (the prompt asks for "the …" as the subject), but
  check the wording.
- `Ich möchte ein Wasser` (a bottle or glass) and `Ich trinke hier eine Tasse Tee.`: check
  that they sound natural to a native speaker.
- l4-ex10: "That comes to" is the accepted English for `das macht`. "That's five euros" is
  not offered (no `that's` tile).
