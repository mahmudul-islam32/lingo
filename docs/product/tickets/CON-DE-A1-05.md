# CON-DE-A1-05: A1 Unit 5 "At the Supermarket": 5 original lessons (en → de)
**Owner:** pm · **Priority:** P0 · **Depends on:** CON-DE-A1-04 · **Milestone:** v0.3.2 ·
**Curriculum:** `curriculum-german.md` §4 Unit 5

## User story
As a learner doing my weekly shop, I want to say what I need, ask where things are and pay
at the checkout, so that I can manage the supermarket on my own.

## Unit outline
- **Theme:** groceries, quantities, checkout
- **Can-do:** I can say what I need, ask where something is, say what I don't have, and pay
  at the checkout.
- **Grammar:** accusative (`den`, `einen`; feminine and neuter unchanged); `brauchen`,
  `kaufen`; `kein / keine / keinen` vs `nicht`; `doch`; plural patterns.

## Acceptance criteria
1. Unit `de-a1-u05`, title "At the Supermarket", description "Say what you need, find
   things on the shelves, talk about quantities and pay at the checkout.", in level A1 after
   `de-a1-u04`, with these lessons in order:
   1. `de-a1-u05-l1-fruit-and-vegetables` "Fruit and Vegetables"
   2. `de-a1-u05-l2-i-need` "I Need a…"
   3. `de-a1-u05-l3-more-than-one` "More Than One"
   4. `de-a1-u05-l4-no-milk-today` "No Milk Today"
   5. `de-a1-u05-l5-checkout` "At the Checkout"
2. All of **CDS-1 to CDS-13** pass.
3. At least 5 exercises need the masculine accusative (`Ich brauche einen Apfel.`, `Ich
   kaufe den Käse.`), and at least 2 multiple choice offer `der / den / dem` or `ein / einen`
   as full-sentence options.
4. At least 3 exercises contrast `kein` with `nicht` (`Ich habe keine Milch.` / `Die Milch
   ist nicht kalt.`).
5. At least 1 exercise answers a negative question with `doch`.
6. At least 4 exercises practise plurals, covering at least 4 patterns (-e, -n, -er or
   umlaut, -s), always with `die`.
7. Every noun in the vocabulary appendix is listed with its plural in the pm's review notes
   (for CON-DE-A1-QA).

## Vocabulary appendix
| # | Lesson | New items (de → en) | Count |
|---|---|---|---|
| 1 | Fruit and Vegetables | der Apfel / die Äpfel (the apple / apples), die Banane (the banana), die Tomate (the tomato), die Kartoffel (the potato), die Zwiebel (the onion), das Obst (fruit), das Gemüse (vegetables) | 7 |
| 2 | I Need a… | brauchen (to need), kaufen (to buy), den / einen (the / a, masculine object), der Käse (the cheese), der Reis (rice), das Ei / die Eier (the egg / eggs), die Butter (butter) | 7 |
| 3 | More Than One | die Flasche (the bottle), die Packung (the pack), das Kilo (the kilo), viel (a lot / much), wie viel? (how much?), wie viele? (how many?) | 6 |
| 4 | No Milk Today | kein / keine / keinen (no / not a), nicht (not), leider (unfortunately), heute (today), mehr (more, in "keine Milch mehr" = no more milk), doch (yes, after a negative question) | 6 |
| 5 | At the Checkout | die Kasse (the checkout / till), die Tüte (the bag), der Kassenbon (the receipt), wo finde ich …? (where can I find …?), das Regal (the shelf), sonst noch etwas? (anything else?) | 6 |

Unit total: 32 items.

## Out of scope
- Dative (`mit der Tüte`): A2
- Other weights and measures (das Gramm, das Pfund, der Liter): A2

## UX notes
- Tip examples: "Only der changes after most verbs: der Käse → Ich kaufe den Käse."; "Use
  kein with nouns and nicht with everything else."
- No supermarket brand names; product names are generic.

## Technical notes
_(cto)_

## Review
_(pm self-review of CDS-1…13 and criteria 3–7)_

## PM self-review
_2026-11-12, pm. I didn't run the schema test (no test runner in this session); the
orchestrator validates. Native-speaker review is still pending (PD-038)._

| Lesson | Ex. | MC | WB (to_learning / to_known) | Match | Listen |
|---|---|---|---|---|---|
| l1 fruit-and-vegetables | 12 | 4 | 2 / 2 | 1 | 3 |
| l2 i-need | 12 | 4 | 2 / 2 | 1 | 3 |
| l3 more-than-one | 12 | 4 | 2 / 2 | 1 | 3 |
| l4 no-milk-today | 12 | 4 | 2 / 2 | 1 | 3 |
| l5 checkout | 12 | 3 | 3 / 2 | 1 | 3 |
| **Unit** | **60** | **19** | **11 / 10** | **5** | **15** |

- **CDS-1 Files:** PASS for the 5 lesson files (ids, titles and order as in criterion 1). The
  unit entry goes to the orchestrator as a fragment, who adds it to `course.json` after
  `de-a1-u04` and bumps `version`. The pm doesn't touch `course.json` (agreed process).
- **CDS-2 Mix:** PASS (see the table).
- **CDS-3 Vocabulary:** PASS. Each lesson uses only its own appendix items, the U1–U4 items
  and allowed extras:
  - regular plurals of taught nouns: `Bananen`, `Tomaten`, `Kartoffeln`, `Zwiebeln`,
    `Flaschen`, `Packungen`, `Brote`, `Kaffees`
  - forms of taught verbs: `brauche / brauchst / braucht / brauchen`, `kaufe / kaufst /
    kaufen`, `kosten`, `habe / hast / haben`, `sind`, `möchten Sie`, `findet`
  - words from taught phrases: `finde` (wo finde ich), `sonst` / `etwas` (sonst noch etwas?),
    `alles` (das ist alles)
  - `einen` / `den` first appear in l2, `kein` / `nicht` / `doch` in l4. Items introduced:
    L1–L4 7 / 7 / 6 / 6, L5 6.
- **CDS-4 Alternatives:** PASS. Listed where the tiles allow them:
  - German: `Billig sind die Bananen.`, `… zwei Zwiebeln und eine Banane.`, `Bitte zwei
    Packungen Reis.`, `Kalt ist die Milch nicht.`, `Leider ist der Käse nicht billig.` /
    `Billig ist der Käse leider nicht.`, `Danke, ich brauche keine Tüte.`, `Nein, das ist
    alles, danke.`
  - English: `I'm buying / I buy` in both noun orders, `tasty / delicious`, `How much is /
    does … cost`, `Don't you have (any) rice? / Do you have no rice? / Have you no rice?`,
    `Yes, I (do) have eggs.`, `Where is / Where's`
  - Listen exercises accept only the transcript, as in U1–U4.
- **CDS-5 Distractors:** PASS. Every word bank and listen has 3–4 tiles beyond the
  canonical answer. I checked every combination I could form. Wrong-meaning sentences are
  rejected on purpose:
  - number or meaning changes: `Die Banane ist billig.` (singular), `Wo finde ich die
    Zwiebel?` (singular)
  - negation reversed: `No, I don't have any eggs.` (l4-ex11)
  - wrong verb: `Wie viele Eier kaufst du?` (l3-ex04)
  - The colloquial `Wie viel Eier …?` can't be built (no `viel` tile in l3-ex04).
- **CDS-6 German conventions:** PASS.
  - umlauts and `ß` throughout (`Äpfel`, `Käse`, `Tüte`, `möchte`, `zwölf`, `heiß`), no `ẞ`
  - nouns capitalised, tiles in authored case, every match-pair noun has its article
  - `sie` and `Sie`: the only `Sie` tile is in l4-ex12 and that set has no `sie`. No
    lowercase `sie` tile anywhere in the unit.
  - register marked: "(to a friend)" in l2-ex08 and l3-ex04, "(formal)" in l5-ex09
- **CDS-7 MC direction:** PASS. All 19 MC have English prompts and German options. l4-ex07
  quotes the English question ("'Don't you have any rice?' Which answer means 'Yes, I
  do'?") so the prompt stays English.
- **CDS-8 Originality:** PASS. All sentences were written for this unit. No brands, product
  names are generic.
- **CDS-9 Audio:** PASS. All 15 listen exercises use `/audio/de/a1/u05/<exercise-id>.mp3`.
- **CDS-10 Tip:** PASS. 5 tips of 77–105 characters.
- **CDS-11 Inclusive and safe:** PASS. No person nouns, slang or sensitive topics.
- **CDS-12 Validation:** pending the orchestrator's `npm run test`. Ids are
  `de-a1-u05-lN-exNN` and unique. I checked by hand that every answer can be built from
  its tiles after `normalizeAnswerText` (apostrophe tokens `i'm`, `don't`, `where's` kept
  whole). There are no duplicate tiles, no digits in tiles and at most 11 tiles per set.
- **CDS-13 Fit:** PASS. The longest prompt is 60 characters (l5-ex09). The longest tile is
  14 characters (`Entschuldigung`).
- **Criterion 3 (masculine accusative ≥ 5, ≥ 2 article MC):** PASS.
  - Exercises that need the masculine accusative: l2-ex01, ex03, ex04, ex08, ex09, ex11,
    l4-ex05 (`keinen`), l5-ex01, ex09, plus prompts l2-ex06 and l4-ex06.
  - Full-sentence article MC: `der / den / dem` in l2-ex04, `ein / einen / eine` in
    l2-ex01, `der / den` in l5-ex01 and l5-ex09.
- **Criterion 4 (kein vs nicht ≥ 3):** PASS, 5: l4-ex01 (`keine Milch` / `nicht Milch`),
  l4-ex03 (`nicht kalt` with `kein / keine` tiles), l4-ex05 (`keinen Apfel` / `nicht einen
  Apfel`), l4-ex09 (`nicht billig` with `kein / keinen` tiles), l4-ex10 (`kein Brötchen` /
  `nicht Brötchen`).
- **Criterion 5 (doch ≥ 1):** PASS, 2: l4-ex07 (MC answer to a negative question) and
  l4-ex11 (`Doch, ich habe Eier.`), plus the match pair in l4-ex02.
- **Criterion 6 (plurals ≥ 4 exercises, ≥ 4 patterns, with die):** PASS, 5 patterns:
  - umlaut: `die Äpfel` (l1-ex02, l3-ex09)
  - -n / -en: `die Bananen`, `die Flaschen` (l1-ex04, l3-ex01), `Packungen` (l3-ex10)
  - -e: `die Brote` (l3-ex02)
  - -er: `die Eier` (l2-ex12, l3-ex12)
  - -s: `die Kaffees` (l3-ex08)
- **Criterion 7 (plurals of appendix nouns, for CON-DE-A1-QA):**
  - der Apfel / die Äpfel
  - die Banane / die Bananen
  - die Tomate / die Tomaten
  - die Kartoffel / die Kartoffeln
  - die Zwiebel / die Zwiebeln
  - das Obst / no everyday plural (die Obstsorten)
  - das Gemüse / no everyday plural (die Gemüsesorten; `die Gemüse` is rare and not used)
  - der Käse / die Käse (kinds of cheese, rare)
  - der Reis / no everyday plural (die Reissorten)
  - das Ei / die Eier
  - die Butter / no plural
  - die Flasche / die Flaschen
  - die Packung / die Packungen
  - das Kilo / die Kilo or die Kilos (stays `Kilo` after numbers: `zwei Kilo`)
  - die Kasse / die Kassen
  - die Tüte / die Tüten
  - der Kassenbon / die Kassenbons
  - das Regal / die Regale

**For native review (CON-DE-A1-QA list):**
- l3-ex08: `die Kaffees` is our -s example. It's correct, but `zwei Kaffee, bitte` is also
  common when ordering. Check that the "the coffees" MC reads naturally.
- l3-ex05: `Kilos` is a distractor (`zwei Kilo Kartoffeln` is standard). Some speakers say
  `zwei Kilos`. Check that rejecting it is fair.
- l4-ex09 accepts the emphatic `Billig ist der Käse leider nicht.` Check that it sounds
  natural.
- l4-ex06 accepts the British `Have you no rice?`. Remove it if it's too dated.
- l4-ex07: check that `Ja, ich habe keinen Reis.` is clearly wrong as the "Yes, I do"
  answer. Colloquially, `Ja` after a negative question is ambiguous.
- l5: `der Kassenbon` vs the common short `der Bon` and `die Quittung`. We teach
  `Kassenbon` as the appendix says.
- MC gender distractors (`der Regal`, `die Ei`, `der Gemüse`) don't exist as real forms. They
  are used only as wrong options.
