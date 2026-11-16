# German curriculum: A1 → C1 (course `en-de`)

**Owner:** pm · **Date:** 2026-11-16 · **Status:** v3 (A1 and A2 in full detail; B1 planned
in §4c; B2–C1 as an outline) · **Related:** `market-analysis-german.md`, PD-030 to PD-063,
tickets CTO-008, PLT-024, GAM-010, LES-014, CON-DE-A1-01 … CON-DE-A1-12, CON-DE-A1-QA,
CON-DE-A2-01 … CON-DE-A2-14, CON-DE-A2-QA, CTO-009, LES-015, LES-013, CON-DE-B1-PLAN,
CON-DE-B1-01 … CON-DE-B1-16, CON-DE-B1-QA

All lessons, sentences, scenarios, names and themes are **original**, written for Polyglow.
Nothing is copied or adapted from any app, textbook, exam, word list or course. Can-do
statements are our own wording, aligned with the CEFR level descriptions but not quoted.

---

## 1. Structure

```
Course "German" (en-de)
└── Level  A1 · Beginner, A2 · Elementary, B1 · Intermediate, B2 · Upper intermediate, C1 · Advanced
    └── Unit (theme + can-do + grammar focus)
        └── Lesson × 5 (10–12 exercises each)
```

- **Levels are the top of the path** (PD-030). Levels with no content yet show as "Coming
  soon" (GAM-010).
- **5 lessons per unit.** Lessons 1–4 introduce new language. Lesson 5 is a **scenario
  lesson** that recombines the unit in an everyday situation with only a few new items.
- **Level checkpoint.** The last lesson of each level is a checkpoint that reviews the whole
  level (A1: unit 12, lesson 5). A dedicated checkpoint exercise flow is Phase 2.
- **Ids** (PD-037): unit `de-a1-u01`; lesson `de-a1-u01-l1-<slug>`; exercise
  `de-a1-u01-l1-ex01`. Lesson ids are unique across **all** courses, because the lesson route
  is `/lesson/<lessonId>` (CTO-008).
- **Audio paths:** `/audio/de/a1/u01/<exercise-id>.mp3` (placeholder audio until the TTS
  licence is decided; PD-007 / PD-034 fallback to a German speech voice).

## 2. Size per level (targets)

Vocabulary counts are **new active items in the path** (words and fixed phrases). They are
targets and estimates. Typical published level word lists are larger because they include
receptive vocabulary (to verify against public CEFR profile resources, without copying them).

| Level | Units | Lessons | New items (target) | Cumulative | Milestone (PD-036) |
|---|---|---|---|---|---|
| A1 · Beginner | 12 | 60 | ~400 (375 appendix entries, CON-DE-A1-QA) | ~400 | v0.3.1 – v0.3.3 |
| A2 · Elementary | 14 | 70 | ~460 appendix entries, ~600+ word forms (PD-046) | ~1,000 forms | v0.5.0 |
| B1 · Intermediate | 16 | 80 | ~510 appendix entries (planned 508), ~800 word forms; ~150 receptive words later with reading passages (PD-057) | ~1,350 entries, ~1,800+ forms | v1.1.0 |
| B2 · Upper intermediate | 18 | 90 | ~1,500 | ~3,500 | v1.2.0 |
| C1 · Advanced | 18 | 90 | ~1,500 | ~5,000 | v1.3.0 |
| **Total** | **78** | **390** | | **~5,000** | |

B2 and above need exercise types we don't have yet (cloze, typed answers, reading passages,
grammar notes; §6). Their unit count may change once those types exist. B1 is planned with
today's four types; the new types are additive follow-ups (§4c tech needs, PD-060).

---

## 3. Level overview

### A1 · Beginner
- **Can-do:** greet people and introduce myself; give personal details (name, origin, age,
  phone number, address) and spell them; order food and shop; tell the time and talk about
  my day; ask for and understand simple directions and train information; describe my flat
  and family; say what hurts at the doctor's; fill in a simple form.
- **Grammar:** personal pronouns; present tense of regular verbs; `sein`, `haben`; stem-change
  verbs (`sprechen`, `lesen`, `fahren`); noun gender `der / die / das` and capitalised nouns;
  indefinite articles `ein / eine`; nominative and accusative (only the masculine changes:
  `den / einen`); negation `nicht / kein`; `ja / nein / doch`; W-questions and yes/no questions;
  **V2 word order** (including time-first inversion); **separable verbs**; modal verbs `können`,
  `müssen`, `wollen`, `dürfen`, `möchten`; imperative (Sie form); possessives `mein / dein /
  Ihr / sein / ihr`; plural patterns; `es gibt`; prepositions as chunks (`aus`, `in`, `nach`,
  `um`, `am`, `mit dem / mit der`); numbers, time, dates.
- **Themes:** greetings, countries and languages, numbers and the alphabet, bakery,
  supermarket, family, daily routine, free time, transport, flat, doctor, registration and
  jobs.

### A2 · Elementary
- **Can-do:** talk about past events; describe people, places and plans; give reasons and
  opinions in simple sentences; handle routine tasks at the bank, post office, pharmacy and
  workplace; write a short message or email (Phase 2 typed answers).
- **Grammar:** **Perfekt** with `haben` and `sein` and common irregular participles;
  Präteritum of `sein`, `haben` and modal verbs; **dative** (articles, pronouns `mir / dir /
  ihm …`, dative verbs `helfen`, `gefallen`, `gehören`); dative prepositions (`mit`, `bei`,
  `nach`, `von`, `zu`, `seit`, `aus`); accusative prepositions (`für`, `ohne`, `durch`, `gegen`,
  `um`); **two-way prepositions** (location vs direction: `in der Stadt` / `in die Stadt`);
  reflexive verbs; **subordinate clauses with `weil`, `dass`, `wenn`** (verb at the end);
  `deshalb`, `trotzdem` (intro); comparative and superlative; basic adjective endings;
  imperative `du / ihr`; `werden` for the future (intro); indirect questions with `ob` (intro).
- **Themes:** past weekend and holidays, health and pharmacy, clothes and shopping, weather,
  celebrations, bank and post, job search and the workplace, school and childcare, neighbours,
  repairs in the flat, travel booking.
- **Units:** 14. **New items:** ~460 appendix entries (~600+ word forms with participles,
  comparatives and numbers; PD-046). **Full detail:** §4b.

### B1 · Intermediate
- **Can-do:** deal with most situations in daily life and at work; tell a story in the past;
  explain plans, wishes and problems; understand the main points of clear standard speech,
  announcements and letters from authorities; write a structured message.
- **Grammar:** **Präteritum** of regular and irregular verbs (narration); Plusquamperfekt;
  **Konjunktiv II** (`würde`, `hätte`, `wäre`, `könnte`; polite requests, wishes,
  hypotheticals); **passive** (present and Präteritum, with `von`); **relative clauses**
  (nominative, accusative, dative); infinitive with `zu`; `um … zu` / `damit`; `obwohl`, `als` /
  `wenn`, `während`, `bevor`, `nachdem`, `seit(dem)`; indirect questions; Futur I; **genitive**
  (`des / der`, `wegen`, `trotz`); two-part connectors (`sowohl … als auch`, `weder … noch`,
  `entweder … oder`); verbs with prepositions and `da- / wo-` compounds (`darauf`, `worauf`);
  full adjective declension; n-declension.
- **Themes:** work life and colleagues, letters from authorities, rental contracts and
  complaints, health system and insurance, media and news, environment, education and
  further training, relationships, culture and leisure, life in Germany (orientation-course
  style topics, our own content).
- **Units:** 16. **New items:** ~510 appendix entries (PD-057). Ends with the B1 checkpoint
  (the level most immigration rules ask for, market analysis §2.2; never claimed in product
  copy, PD-035). **Full plan:** §4c.

### B2 · Upper intermediate
- **Can-do:** follow longer talks and discussions; argue for and against; understand
  articles and reports on familiar topics; communicate fluently at work, including with
  patients or customers; write clear, detailed texts (Phase 2+ writing support).
- **Grammar:** passive with modal verbs and in Perfekt; state passive (`ist geöffnet`);
  passive alternatives (`sich lassen`, `-bar`, `sein … zu`); **Konjunktiv II past** (`hätte
  gemacht`, `wäre gekommen`); **Konjunktiv I** for reported speech (news); participles as
  adjectives and extended participle attributes; **nominalisation**; Futur II; connectors
  `indem`, `sodass`, `je … desto`, `falls`, `sofern`; genitive prepositions (`aufgrund`,
  `innerhalb`, `außerhalb`); subjective modal verbs (`soll`, `muss`, `dürfte`); modal
  particles (`ja`, `doch`, `mal`, `halt`, `eben`); noun-verb collocations (`eine Entscheidung
  treffen`).
- **Themes:** workplace communication and meetings, healthcare and care work (elective
  track), science and technology, society and politics, economy and consumption, education
  and university life, media literacy, environment and climate.
- **Units:** 18. **New items:** ~1,500. Electives (Phase 2+): healthcare German, workplace
  German.

### C1 · Advanced
- **Can-do:** understand demanding, longer texts and implicit meaning; express myself
  fluently and precisely in academic and professional settings; structure complex arguments;
  adjust register from formal to colloquial.
- **Grammar:** advanced nominal style and noun-verb collocations; complex connectors and text
  cohesion; Konjunktiv I in full; extended attributes; advanced word formation (prefixes,
  suffixes, compounds); alternatives to passive and modal verbs; register and style
  (academic, bureaucratic, colloquial); idioms and fixed expressions; awareness of Austrian
  and Swiss standard variants.
- **Themes:** academic study and research, the labour market and careers, law and
  administration, culture and literature (our own texts), philosophy and ethics, economics,
  global issues, language and identity.
- **Units:** 18. **New items:** ~1,500. Electives (Phase 2+): academic German for university
  admission.

---

## 4. A1 in full detail (12 units × 5 lessons)

Unit titles are English (the UI language, PD-019 language tagging). German theme words are
given for reference only. Each unit ticket (`CON-DE-A1-NN`) holds the full per-lesson
vocabulary appendix. The "key words" below are a subset of that appendix.

### Unit 1 · "Hello!" (Hallo!) · `de-a1-u01` · CON-DE-A1-01
- **Theme:** greetings, names, formal and informal address.
- **Can-do:** I can greet people and say goodbye at any time of day, say my name, ask
  someone's name and ask how they are, using "du" with friends and "Sie" with strangers.
- **Grammar focus:** `ich`, `du`, `Sie`; `heißen` (`ich heiße`, `du heißt`, `Sie heißen`);
  `sein` (`ich bin`, `du bist`, `Sie sind`); W-question `wie`; nouns are capitalised (`der
  Name`).
- **Key words (12):** hallo, guten Morgen, guten Tag, guten Abend, tschüss, auf
  Wiedersehen, ich heiße, wie heißt du?, Herr / Frau, freut mich, wie geht's?, danke.
- **Lessons:**
  1. *Hello and Goodbye:* greetings by time of day, informal and formal goodbyes.
  2. *What's Your Name?:* `ich heiße`, `du heißt`, `mein Name ist`, `wie`.
  3. *Formal or Informal:* `Sie`, `Herr` / `Frau` + surname, `freut mich`.
  4. *How Are You?:* `wie geht's?` / `wie geht es Ihnen?`, `gut`, `nicht so gut`.
  5. *Scenario: First Day at the Language School:* greet a teacher (Sie) and a classmate
     (du), `ich bin`, `ja`, `nein`, `Entschuldigung`.

### Unit 2 · "Where Are You From?" (Woher kommst du?) · `de-a1-u02` · CON-DE-A1-02
- **Theme:** countries, cities, languages, people in the class.
- **Can-do:** I can say where I come from, where I live and which languages I speak, and ask
  others the same.
- **Grammar focus:** present tense of regular verbs for all persons (`kommen`, `wohnen`,
  `lernen`); stem change `sprechen` → `du sprichst`, `er spricht`; W-questions `woher`, `wo`,
  `wer`, `was`; **V2 word order** in statements; `aus` + country, `in` + city.
- **Key words (12):** woher?, kommen, aus, Deutschland, Österreich, die Schweiz, wo?,
  wohnen, die Stadt, sprechen, Deutsch, Englisch.
- **Lessons:**
  1. *Countries:* `Woher kommst du?` / `Ich komme aus …`, the DACH countries and `Indien`.
  2. *Where Do You Live?:* `wo`, `wohnen in`, `die Stadt`, `das Land`, `die Adresse`,
     `jetzt`, `hier`.
  3. *Languages:* `sprechen` (stem change), languages, `ein bisschen`, `lernen`.
  4. *He, She, We:* `er`, `sie`, `wir`, `ihr`, `sie`; verb endings; `der Freund` / `die
     Freundin`.
  5. *Scenario: The Welcome Café:* meet new neighbours, `wer`, `was`, `machen`, `der Kurs`.

### Unit 3 · "Numbers and Letters" (Zahlen und Buchstaben) · `de-a1-u03` · CON-DE-A1-03
- **Theme:** numbers 0–100, phone numbers, age, the alphabet and spelling.
- **Can-do:** I can count to 100, give my phone number and age, and spell my name, including
  ä, ö, ü and ß.
- **Grammar focus:** `haben` (`ich habe`, `du hast`, `er hat`, `Sie haben`); `Ich bin … Jahre
  alt`; **yes/no questions with the verb first**; number building (`einundzwanzig`: units
  before tens); `-zehn` and `-zig`.
- **Key words (12):** null, eins, zwei, drei, zehn, zwölf, zwanzig, hundert, die
  Telefonnummer, wie alt?, das Jahr, buchstabieren.
- **Lessons:**
  1. *Count to Six:* `null` – `sechs`.
  2. *Count to Twelve:* `sieben` – `zwölf`, `die Telefonnummer`.
  3. *How Old Are You?:* `-zehn` numbers, `zwanzig`, `wie alt`, `haben`, yes/no questions.
  4. *Big Numbers:* `einundzwanzig` pattern, `-zig` tens, `hundert`.
  5. *Scenario: Spell It, Please:* alphabet, Ä / Ö / Ü / ß, `Wie schreibt man das?`, `noch
     einmal`, `langsam`.

### Unit 4 · "At the Bakery" (In der Bäckerei) · `de-a1-u04` · CON-DE-A1-04
- **Theme:** bread, cakes, drinks, prices.
- **Can-do:** I can order bread, cake and drinks politely, ask what something costs and
  understand the price.
- **Grammar focus:** **noun gender `der / die / das`** (every noun taught with its article);
  `ein / eine`; `ich möchte` + noun (only feminine and neuter objects here, where accusative =
  nominative; masculine accusative comes in Unit 5); `Das ist …`; prices (`drei Euro
  zwanzig`).
- **Key words (12):** das Brot, das Brötchen, die Brezel, der Kuchen, der Kaffee, das
  Wasser, ich möchte, ein / eine, das Stück, was kostet …?, der Euro, zum Mitnehmen.
- **Lessons:**
  1. *Bread and Rolls:* bakery items, `das ist`.
  2. *Der, Die, Das:* drinks, `heiß`, `kalt`, `lecker`; gender practice.
  3. *I'd Like…:* `ich möchte`, `ein / eine`, `eine Tasse`, `ein Stück`, `noch`.
  4. *What Does It Cost?:* `kosten`, `der Euro`, `der Cent`, `das macht …`, `teuer`, `billig`.
  5. *Scenario: Saturday Morning at the Bakery:* `zum Mitnehmen`, `hier essen`, `mit Karte`,
     `bar`, `das ist alles`.

### Unit 5 · "At the Supermarket" (Im Supermarkt) · `de-a1-u05` · CON-DE-A1-05
- **Theme:** groceries, quantities, checkout.
- **Can-do:** I can say what I need, ask where something is, say what I don't have, and pay
  at the checkout.
- **Grammar focus:** **accusative**: only the masculine changes (`der → den`, `ein → einen`);
  `brauchen`, `kaufen`; **negation `kein / keine / keinen` vs `nicht`**; `doch` as the answer
  to a negative question; **plural patterns** (-e, -n, -er, umlaut, -s) taught with `die`.
- **Key words (12):** der Apfel, die Banane, das Gemüse, brauchen, kaufen, der Käse, das
  Ei, die Flasche, wie viel?, kein, leider, die Kasse.
- **Lessons:**
  1. *Fruit and Vegetables:* produce nouns and their plurals.
  2. *I Need a…:* `brauchen`, `kaufen`, `einen / den`, dairy and staples.
  3. *More Than One:* plural patterns, `die Flasche`, `die Packung`, `das Kilo`, `wie viel /
     wie viele`.
  4. *No Milk Today:* `kein`, `nicht`, `leider`, `heute`, `mehr`, `doch`.
  5. *Scenario: At the Checkout:* `die Kasse`, `die Tüte`, `der Kassenbon`, `Wo finde ich …?`,
     `Sonst noch etwas?`.

### Unit 6 · "Family and Friends" (Familie und Freunde) · `de-a1-u06` · CON-DE-A1-06
- **Theme:** family members, relationships, pets, describing people.
- **Can-do:** I can introduce my family, say who is who in a photo, and say whether I am
  married and have children or siblings.
- **Grammar focus:** possessives `mein / meine`, `dein / deine`, `Ihr / Ihre`, `sein`, `ihr`
  (nominative, plus `meinen` in the accusative); `haben` + accusative (`Ich habe einen
  Bruder`); `Das ist …` / `Das sind …`; predicative adjectives (`Er ist groß`).
- **Key words (12):** die Familie, die Mutter, der Vater, die Eltern, das Kind, der Bruder,
  die Schwester, die Geschwister, verheiratet, der Hund, die Katze, nett.
- **Lessons:**
  1. *My Family:* core family nouns, `mein / meine`.
  2. *Brothers and Sisters:* siblings, son and daughter, `älter` / `jünger` (as words).
  3. *Your Family?:* `dein`, `Ihr`, `verheiratet`, `ledig`, partners.
  4. *Grandparents and Pets:* grandparents, pets, `sein / ihr`, `das Foto`.
  5. *Scenario: Photos on the Phone:* `Wer ist das?`, `Das sind …`, `groß`, `klein`, `nett`,
     `süß`.

### Unit 7 · "My Day" (Mein Alltag) · `de-a1-u07` · CON-DE-A1-07
- **Theme:** time, days of the week, routines, making plans.
- **Can-do:** I can tell the time, name the days of the week, describe my daily routine and
  arrange a time to meet.
- **Grammar focus:** **separable verbs** (`aufstehen` → `Ich stehe um sieben Uhr auf`);
  `um` + time, `am` + day; **V2 inversion with time first** (`Am Montag arbeite ich`); `wann`.
- **Key words (12):** wie spät ist es?, die Uhr, halb, um, Montag, am, arbeiten,
  aufstehen, frühstücken, einkaufen, anrufen, morgen.
- **Lessons:**
  1. *What Time Is It?:* `Wie spät ist es?`, `Uhr`, `halb`, `Viertel nach / vor`, `um`.
  2. *Days of the Week:* Monday–Sunday, `am`, time-first word order (`Am Montag lerne ich
     Deutsch`).
  3. *Morning Routine:* `aufstehen`, `frühstücken`, `duschen`, `morgens`, `früh`, `dann`,
     `arbeiten`.
  4. *Separable Verbs:* `einkaufen`, `anfangen`, `anrufen`, `fernsehen`, `mittags`, `abends`.
  5. *Scenario: Making a Plan:* `morgen`, `Zeit haben`, `wann`, `das Wochenende`, `bis dann`.

### Unit 8 · "Free Time" (Freizeit) · `de-a1-u08` · CON-DE-A1-08
- **Theme:** hobbies, likes and dislikes, abilities, weekend plans.
- **Can-do:** I can talk about my hobbies, say what I like and don't like doing, and say what
  I can and can't do.
- **Grammar focus:** `gern`, `nicht gern`, `lieber`; `mögen` (`ich mag` + noun); stem-change
  verbs `lesen → liest`, `fahren → fährt`, `laufen → läuft`; **modal verb `können` with the
  infinitive at the end** (`Ich kann gut schwimmen`).
- **Key words (12):** schwimmen, lesen, kochen, spielen, gern, mögen, das Buch, fahren,
  das Fahrrad, können, das Kino, Lust haben.
- **Lessons:**
  1. *Hobbies:* activity verbs, `der Fußball`, `Musik hören`.
  2. *I Like…:* `gern`, `nicht gern`, `mögen`, `lieber`, books and films.
  3. *On the Move:* `fahren`, `laufen`, `wandern`, `das Fahrrad`, `der Park`, `oft`.
  4. *I Can Swim:* `können`, `singen`, `malen`, `die Gitarre`.
  5. *Scenario: Weekend Plans:* `das Kino`, `gehen`, `Lust haben`, `toll`, `schade`.

### Unit 9 · "By Bus and Train" (Mit Bus und Bahn) · `de-a1-u09` · CON-DE-A1-09
- **Theme:** public transport, tickets, platforms, delays, directions.
- **Can-do:** I can buy a ticket, ask when and where a train leaves, understand a simple
  delay notice, and ask for and follow simple directions.
- **Grammar focus:** **`müssen`** (`Ich muss in Köln umsteigen`: modal + separable verb);
  **imperative, Sie form** (`Gehen Sie geradeaus`, `Nehmen Sie die U-Bahn`); `mit dem Bus` /
  `mit der Bahn` as chunks (full dative in A2); `nach` + city; `wohin`.
- **Key words (12):** der Bus, die Bahn, der Zug, zu Fuß, die Fahrkarte, hin und zurück,
  das Gleis, die Verspätung, umsteigen, die Haltestelle, geradeaus, links / rechts.
- **Lessons:**
  1. *Getting Around:* means of transport, `mit dem / mit der`, `zu Fuß`.
  2. *Buying a Ticket:* `die Fahrkarte`, `einfach`, `hin und zurück`, `der Automat`, `nach`,
     `nehmen`.
  3. *Departures and Platforms:* `der Zug`, `das Gleis`, `abfahren`, `ankommen`, `die
     Verspätung`, `pünktlich`.
  4. *I Have to Change:* `müssen`, `umsteigen`, `die Haltestelle`, `der Bahnhof`, `nächste`,
     `wohin`.
  5. *Scenario: Which Way?:* `geradeaus`, `links`, `rechts`, imperative, `weit`, `nah`,
     `Wie komme ich zum Bahnhof?`.

### Unit 10 · "The New Flat" (Die neue Wohnung) · `de-a1-u10` · CON-DE-A1-10
- **Theme:** rooms, furniture, describing a flat, a flat viewing.
- **Can-do:** I can describe a flat and its rooms, say what is in a room, and ask about the
  rent and size at a viewing.
- **Grammar focus:** **`es gibt` + accusative** (`Es gibt einen Balkon`); predicative
  adjectives and `zu` (`Die Küche ist zu klein`); gender and plural review with room and
  furniture nouns; `Wie viele Zimmer hat die Wohnung?`.
- **Key words (12):** die Wohnung, das Zimmer, die Küche, das Bad, der Balkon, der Tisch,
  das Bett, es gibt, hell, ruhig, die Miete, der Quadratmeter.
- **Lessons:**
  1. *Rooms:* room nouns with articles.
  2. *Furniture:* furniture nouns, gender practice.
  3. *There Is…:* `es gibt`, `einen / eine / ein`, `kein`, appliances.
  4. *Big, Small, Bright:* `hell`, `dunkel`, `ruhig`, `laut`, `schön`, `zu`.
  5. *Scenario: The Viewing:* `die Miete`, `der Quadratmeter`, `die Besichtigung`, `frei`,
     `ab sofort`, `der Vermieter / die Vermieterin`.

### Unit 11 · "At the Doctor's" (Beim Arzt) · `de-a1-u11` · CON-DE-A1-11
- **Theme:** the body, symptoms, appointments, the practice reception, the pharmacy.
- **Can-do:** I can make a doctor's appointment, say what hurts and since when, check in at
  the reception and understand simple instructions for taking medicine.
- **Grammar focus:** `wehtun` (`Mein Kopf tut weh`, `Meine Füße tun weh`: singular and
  plural); `Ich habe Kopfschmerzen`; **`dürfen`** (`Darf ich …?`); imperative review (`Nehmen
  Sie …`); `seit gestern` as a chunk.
- **Key words (12):** der Kopf, der Bauch, der Rücken, tut weh, die Schmerzen, krank, das
  Fieber, der Termin, die Praxis, die Versichertenkarte, die Apotheke, gute Besserung.
- **Lessons:**
  1. *The Body:* body parts with articles.
  2. *What Hurts?:* `tut weh`, `die Schmerzen`, compounds (`Kopfschmerzen`), `krank`, `das
     Fieber`, `der Husten`.
  3. *Making an Appointment:* `der Termin`, `die Praxis`, `der Arzt / die Ärztin`,
     `gestern`, `seit gestern`, `dringend`.
  4. *At the Reception:* `die Krankenkasse`, `die Versichertenkarte`, `das Wartezimmer`,
     `warten`, `Nehmen Sie Platz`, `dürfen`.
  5. *Scenario: At the Pharmacy:* `die Apotheke`, `die Tablette`, `das Medikament`,
     `dreimal täglich`, `Gute Besserung!`.

### Unit 12 · "Offices and Work" (Ämter und Arbeit) · `de-a1-u12` · CON-DE-A1-12
- **Theme:** months and dates, registering an address, simple forms, jobs; A1 checkpoint.
- **Can-do:** I can say my date of birth, register my address and fill in a simple form,
  say what my job is and where I work, and use everything from A1 in a "first week in
  Germany" situation.
- **Grammar focus:** months; dates with ordinals (`am dritten Mai`); **`wollen`**; `als` +
  job without an article (`Ich arbeite als Ingenieurin`); review of V2, W-questions,
  separable verbs and the formal `Sie` / `Ihr`.
- **Key words (12):** der Monat, Mai, geboren, die Anmeldung, das Bürgeramt, das
  Formular, ausfüllen, der Vorname, der Nachname, das Geburtsdatum, der Beruf, wollen.
- **Lessons:**
  1. *Months:* January–June, `der Monat`.
  2. *Dates:* July–December, ordinals `am ersten / zweiten / dritten …`, `geboren`.
  3. *The Registration Office:* `die Anmeldung`, `das Bürgeramt`, `das Formular`,
     `ausfüllen`, name fields, `das Geburtsdatum`, `die Unterschrift`.
  4. *Jobs:* `der Beruf`, `als`, job nouns (both forms), `die Firma`, `wollen`.
  5. *A1 Checkpoint: Your First Week:* a mixed review of all 12 units in one week-in-Germany
     story; only 2 new items (`der Kollege / die Kollegin`, `willkommen`).

### A1 grammar coverage map

| Grammar point | Introduced | Recycled in |
|---|---|---|
| `sein`, `heißen`, du / Sie | U1 | every unit |
| Regular present tense, all persons | U2 | U3–U12 |
| V2 word order | U2 | U7 (time-first), U9, U12 |
| Yes/no questions (verb first) | U3 | U4–U12 |
| `haben` | U3 | U5, U6, U10, U11 |
| Gender `der / die / das`, capitalised nouns | U1 (Name), U4 (systematic) | every noun from U4 on |
| `ein / eine`, `ich möchte` | U4 | U5, U10 |
| Accusative `den / einen` | U5 | U6, U10, U11 |
| `kein / nicht`, `doch` | U5 | U8, U10 |
| Plural patterns | U5 | U6, U10, U11 |
| Possessives | U6 | U11, U12 |
| Separable verbs | U7 | U9, U12 |
| `können` | U8 | U9–U12 |
| `müssen`, imperative (Sie) | U9 | U11 |
| `es gibt` | U10 | U12 |
| `dürfen` | U11 | U12 |
| `wollen`, dates | U12 | — |

---

## 4b. A2 in full detail (14 units × 5 lessons)

Same structure and rules as A1 (§1, §7), plus the A2 additions to the content standard
(CDS-14 … CDS-19, §7). Ids: unit `de-a2-u01`, lesson `de-a2-u01-l1-<slug>`, exercise
`de-a2-u01-l1-ex01`; audio `/audio/de/a2/u01/<exercise-id>.mp3`. Each unit ticket
(`CON-DE-A2-NN`) holds the full per-lesson vocabulary appendix; the key words below are a
subset. **The appendices are the vocabulary contract between parallel writers** (PD-052):
a lesson may use A1 (the A1 appendices and CON-DE-A1-QA allowed extras), the appendices of
all earlier A2 units, and earlier lessons of its own unit, nothing else.

**Why this order** (PD-045): the past tense comes first, because learners need it in every
later scenario (U2–U3). Accusative pronouns and accusative prepositions follow in U3, the
dative in two steps (U4 pronouns, articles and verbs; U5 prepositions), then adjective
endings on a known case base (U6), reflexive verbs and imperatives (U7), past modals and
`weil` (U8), two-way prepositions only after both cases are known (U9) and applied at once
in travel (U10). The three subordinate clauses are spread out (`weil` U8, `dass` U11, `wenn`
and `ob` U12) so each is recycled before the next. Comparison (U13) and `werden` (U14) close
the level. **Deferred from A1** and where they land: `im` + month and seasons → U1 (PD-039);
hundreds, thousands and years → U5 L3 (PD-041); `die Minute(n)` → U8 L2; `auf / von Gleis`,
`der Bahnsteig`, `… Minuten Verspätung` → U10 L1–L2 (PD-042); productive `ins / in den /
in die` → U9 L3 (PD-040); native-review follow-ups `nach links / rechts` → U5 L2, `Bei
welcher Krankenkasse sind Sie?` → U7 L4, `sich anmelden` → U12 L2.

**Words A1 never taught** that A2 must add early (checked against all A1 appendices):
`aber`, `oder`, `denn` (U1), `die Woche`, `der Tag`, `immer`, `manchmal`, `nie`, `schon`
(U1), `sehen`, `schlafen` (U2), accusative pronouns `mich`, `dich`, `ihn`, `uns`, `euch`
(U3), `schreiben` as a verb (U3), `suchen` (U6), `wissen` (U12).

### Unit 1 · "Weather and Seasons" (Wetter und Jahreszeiten) · `de-a2-u01` · CON-DE-A2-01
- **Life in DACH:** rainy autumns, snowy Alpine winters, long summer evenings; planning a
  hike around the weather forecast.
- **Can-do:** I can say what the weather is like, say what it is usually like in each
  season, say in which month or season something happens, and link two ideas with `aber`,
  `oder` and `denn`.
- **Grammar focus:** weather verbs with `es` (`es regnet`, `es schneit`, `es ist warm`);
  **`im` + month and season** (`im Mai`, `im Winter`; `im` = `in dem`, the first look at the
  dative, PD-039); **`aber`, `oder`, `denn`** in position 0 (no change to V2); frequency
  adverbs `immer`, `manchmal`, `nie`; temperatures (`zwanzig Grad`, `minus fünf Grad`).
- **Key words (12):** das Wetter, die Sonne, der Regen, es regnet, warm, der Sommer, der
  Winter, im, der Geburtstag, aber, oder, denn.
- **Lessons:**
  1. *What's the Weather Like?:* `das Wetter`, `die Sonne scheint`, `es regnet`, `warm`,
     `windig`.
  2. *Seasons:* the four seasons, `im Sommer`, `der Schnee`, `es schneit`.
  3. *Birthdays and Months:* `im` + month, `Wann hast du Geburtstag? Im Juli.`, `die Woche`,
     `der Tag`, `immer`, `manchmal`, `nie`, `schon`.
  4. *But, Or, Because:* `aber`, `oder`, `denn`; `sonnig`, `bewölkt`, `Grad`, `minus`.
  5. *Scenario: The Weekend Forecast:* two friends plan a Sunday hike: `der Wetterbericht`,
     `das Gewitter`, `heute Abend`, `draußen`, `drinnen`, `vielleicht`.

### Unit 2 · "How Was Your Weekend?" (Wie war dein Wochenende?) · `de-a2-u02` · CON-DE-A2-02
- **Life in DACH:** Monday small talk with colleagues in the office kitchen.
- **Can-do:** I can say how something was and tell someone what I did yesterday or at the
  weekend.
- **Grammar focus:** **Präteritum of `sein` and `haben`** (`war`, `hatte`, all persons);
  **Perfekt with `haben`**: `haben` in position 2, participle at the end; regular `ge-…-t`
  and `ge-…-et`; common irregular participles (`gegessen`, `getrunken`, `gesehen`,
  `geschlafen`, `getroffen`); separable (`eingekauft`, `angerufen`), inseparable
  (`besucht`, `bezahlt`) and `-ieren` (`telefoniert`) participles. Only `haben` verbs in
  this unit.
- **Key words (12):** war, hatte, wie war …?, letzte Woche, gemacht, gekauft, gestern Abend,
  gegessen, gesehen, eingekauft, besuchen, das Büro.
- **Lessons:**
  1. *How Was It?:* `war`, `hatte`, `wie war …?`, `letzte Woche`, `letztes Wochenende`,
     `vorgestern`, `langweilig`, `interessant`.
  2. *What Did You Do?:* the Perfekt pattern with regular participles, `gestern Abend`,
     `zu Hause`.
  3. *Eaten, Drunk, Seen:* irregular participles; `sehen`, `schlafen`, `treffen`.
  4. *Phoned, Visited, Paid:* separable, inseparable and `-ieren` participles.
  5. *Scenario: Monday at Work:* `das Büro`, `die Pause`, `erzählen`, `nichts Besonderes`,
     `ziemlich`.

### Unit 3 · "Holiday Stories" (Urlaubsgeschichten) · `de-a2-u03` · CON-DE-A2-03
- **Life in DACH:** a week by a lake in Austria, a city trip by train, a postcard to grandma.
- **Can-do:** I can say where I went on holiday, how I travelled, how long I stayed and
  what I did, and say who something is for.
- **Grammar focus:** **Perfekt with `sein`** for movement and change (`gefahren`, `geflogen`,
  `gegangen`, `gekommen`, `angekommen`, `geblieben`, `aufgestanden`, `passiert`); choosing
  `haben` or `sein`; **accusative personal pronouns** (`mich`, `dich`, `ihn`, `uns`, `euch`);
  **accusative prepositions** `für`, `ohne`, `durch`, `um` (+ the A1 accusative articles).
- **Key words (12):** der Urlaub, die Reise, das Meer, der See, gefahren, geflogen,
  geblieben, wie lange?, für, ohne, mich, dich.
- **Lessons:**
  1. *On Holiday:* `der Urlaub`, `die Reise`, `das Meer / am Meer`, `die Berge`, `der See`,
     `das Hotel`, `der Koffer`.
  2. *We Went by Train:* `ich bin … gefahren`, `geflogen`, `das Flugzeug`, `der Flughafen`,
     `gegangen`, `gekommen`, `angekommen`.
  3. *How Long Did You Stay?:* `bleiben`, `wie lange?`, `für eine Woche`, `die Nacht`,
     `aufgestanden`, `gewandert`, `gelaufen`, `passiert`.
  4. *For You:* `für mich / dich / ihn / uns / euch`, `ohne`, `durch die Stadt`, `um den See`.
  5. *Scenario: A Postcard from the Alps:* `die Postkarte`, `Liebe … / Lieber …`, `viele
     Grüße`, `die Aussicht`, `schicken`, `schreiben`.

### Unit 4 · "Gifts and Celebrations" (Feste und Geschenke) · `de-a2-u04` · CON-DE-A2-04
- **Life in DACH:** invitations, a wedding, and the custom of bringing your own birthday cake
  to the office.
- **Can-do:** I can invite someone and accept or decline, congratulate people, say who I
  give a present to, and say whether I like something.
- **Grammar focus:** **dative case**: articles `dem / der / dem / den …-n`, `einem / einer`,
  `meinem / meiner`; the indirect object with `geben`, `schenken`, `zeigen` (dative before an
  accusative noun: `Ich schenke meiner Schwester ein Buch.`); **dative pronouns** `mir, dir,
  ihm, ihr, uns, euch, ihnen, Ihnen`; **dative verbs** `gefallen`, `gehören`, `helfen`,
  `gratulieren`.
- **Key words (12):** feiern, einladen, die Hochzeit, herzlichen Glückwunsch, das Geschenk,
  schenken, mir, dir, dem, geben, gefallen, helfen.
- **Lessons:**
  1. *Invitations:* `feiern`, `die Feier`, `die Party`, `einladen`, `die Einladung`, `die
     Hochzeit`, `der Gast`.
  2. *Happy Birthday!:* `herzlichen Glückwunsch`, `alles Gute!`, `gratulieren`, `mir`, `dir`,
     `Ihnen`, `das Geschenk`, `schenken`.
  3. *Who Gets What?:* dative articles and possessives, dative plural `-n`, `geben`, `die
     Blumen`, `die Schokolade`, `die Kerze`.
  4. *I Like It:* `gefallen`, `gehören`, `helfen`, `zeigen`, `ihm`, `ihr`, `ihnen`.
  5. *Scenario: Cake at the Office:* `mitbringen`, `die Torte`, `viel Spaß!`, `die
     Überraschung`.

### Unit 5 · "Errands in Town" (Erledigungen in der Stadt) · `de-a2-u05` · CON-DE-A2-05
- **Life in DACH:** a Saturday of errands: bank, cash machine, post office, supermarket.
- **Can-do:** I can say where I am going and where I am, ask the way, open a bank account,
  send a parcel, and understand amounts and years in the hundreds and thousands.
- **Grammar focus:** **dative prepositions** `zu`, `bei`, `von`, `mit`, `nach`, `aus`, `seit`,
  plus `gegenüber (von)`; contractions `zum`, `zur`, `beim`, `vom` (the A1 chunks `mit dem
  Bus`, `aus der Schweiz`, `wie komme ich zum …?` are explained); `nach Hause` vs `zu Hause`;
  `seit` and `vor` + dative for time (`seit einem Jahr`, `vor zwei Jahren`); **numbers
  100 – 1,000,000 and years** (PD-041, now productive).
- **Key words (12):** zu, zum / zur, die Bank, die Post, bei, von, nach Hause, tausend, das
  Geld, seit, das Konto, das Paket.
- **Lessons:**
  1. *To the Bank, to the Post Office:* `zu`, `zum / zur`, `die Bank`, `die Post`, `der
     Supermarkt`, `nach Hause`, `die Straße`.
  2. *Where Are You?:* `bei / beim`, `von / vom`, `mit` + dative, `nach links / nach rechts`,
     `gegenüber`.
  3. *Hundreds and Thousands:* hundreds, `tausend`, years, `die Million`, `das Geld`, `Geld
     abheben`, `der Geldautomat`.
  4. *Since When?:* `seit wann?`, `seit` + dative, `vor` + dative (ago), `das Konto`,
     `eröffnen`, `der Ausweis`, `die Bankkarte`.
  5. *Scenario: At the Post Office:* `das Paket`, `der Brief`, `die Briefmarke`, `der
     Schalter`.

### Unit 6 · "Clothes and Shopping" (Kleidung kaufen) · `de-a2-u06` · CON-DE-A2-06
- **Life in DACH:** a department-store fitting room, a sale, exchanging a faulty jacket.
- **Can-do:** I can describe clothes by colour and size, ask for another size, say what fits
  and suits me, and exchange an item.
- **Grammar focus:** **basic adjective endings**, nominative and accusative only: after
  `der / die / das` (`der blaue Pullover`, `den blauen Pullover`, `die schwarzen Schuhe`) and
  after `ein / kein / mein` (`ein blauer Pullover`, `einen blauen Pullover`, `ein rotes
  Kleid`, `eine weiße Jacke`); `welcher / welche / welches?`, `dieser / diese / dieses`;
  `passen` and `stehen` + dative (recycles U4).
- **Key words (12):** die Kleidung, die Hose, der Pullover, die Jacke, die Farbe, blau,
  schwarz, welcher?, suchen, die Größe, anprobieren, passen.
- **Lessons:**
  1. *Clothes:* clothing nouns with articles and plurals.
  2. *Colours:* `die Farbe`, `welche Farbe?`, seven colours, predicative (`Die Jacke ist
     blau.`).
  3. *The Blue Jumper:* endings after `der / die / das`; `welcher?`, `dieser`, `suchen`,
     `das T-Shirt`, `der Mantel`, `die Socken`.
  4. *A Red Dress:* endings after `ein / kein / mein`; `die Größe`, `anprobieren`, `die
     Umkleidekabine`, `passen`, `eng`, `weit`, `kurz`, `lang`.
  5. *Scenario: Exchanging a Jacket:* `Das steht dir gut.`, `umtauschen`, `zurückgeben`,
     `im Angebot`, `kaputt`.

### Unit 7 · "Health and Sport" (Gesund und fit) · `de-a2-u07` · CON-DE-A2-07
- **Life in DACH:** the local sports club (`der Verein`), the gym, catching a cold, being
  signed off sick.
- **Can-do:** I can say how I feel and what I do to stay fit, give friends simple advice,
  describe a cold or a small injury, and say what the doctor told me to do.
- **Grammar focus:** **reflexive verbs** with accusative reflexive pronouns (`sich fühlen`,
  `sich ausruhen`, `sich verletzen`, `sich freuen`); **imperative `du` and `ihr`** (`Trink
  viel Wasser!`, `Macht eine Pause!`), stem-change imperatives (`Nimm!`, `Iss!`, `Lies!`,
  `Hilf!`), `Sei! / Seid!`; **`sollen`** (`Ich soll viel schlafen.`).
- **Key words (12):** der Sport, der Verein, gesund, sich fühlen, müde, besser, sich
  ausruhen, vorsichtig, sollen, die Erkältung, sich verletzen, gewinnen.
- **Lessons:**
  1. *Sport:* `Sport machen`, `joggen`, `das Fitnessstudio`, `der Verein`, `trainieren`, `die
     Mannschaft`, `gesund`.
  2. *How Do You Feel?:* `sich fühlen`, reflexive pronouns, `müde`, `fit`, `besser`, `es geht
     mir …`, `sich ausruhen`.
  3. *Drink Water!:* du and ihr imperatives, stem changes, `sei!`, `vorsichtig`, `genug`.
  4. *The Doctor Says…:* `sollen`, `die Erkältung`, `erkältet sein`, `die Grippe`, `sich
     verletzen`, `krankgeschrieben sein`, `Bei welcher Krankenkasse sind Sie?`.
  5. *Scenario: Back at Training:* `der Fuß`, `das Spiel`, `gewinnen`, `verlieren`, `Ich freue
     mich!`.

### Unit 8 · "Appointments and Phone Calls" (Termine und Telefonate) · `de-a2-u08` · CON-DE-A2-08
- **Life in DACH:** phoning a practice or a hairdresser, moving an appointment, leaving a
  voicemail, apologising for a missed appointment.
- **Can-do:** I can make, move or cancel an appointment on the phone, leave a short message,
  apologise and give a reason, and say what I could, had to or wanted to do.
- **Grammar focus:** **Präteritum of modal verbs** (`konnte`, `musste`, `wollte`, `durfte`)
  with the infinitive at the end; **subordinate clause with `weil`** (verb at the end,
  separable verb joined: `weil ich früh aufstehe`; `weil ich krank war`); **minutes and
  hours** (`die Minuten`, `in zehn Minuten`, `eine halbe Stunde`); telephone phrases.
- **Key words (12):** das Telefon, die Nachricht, zurückrufen, die Minute, die Stunde,
  später, verschieben, absagen, warum?, weil, konnte, musste.
- **Lessons:**
  1. *On the Phone:* `das Telefon`, `hier spricht …`, `Moment, bitte`, `die Nachricht`,
     `zurückrufen`, `auf Wiederhören`, `besetzt`.
  2. *Minutes and Hours:* `die Minute(n)`, `die Stunde(n)`, `eine halbe Stunde`, `in` + time,
     `später`, `gleich`, `zu spät`.
  3. *Moving an Appointment:* `verschieben`, `absagen`, `der Friseur / die Friseurin`,
     `möglich`, `am Vormittag`, `am Nachmittag`, `Passt Ihnen …?`.
  4. *Because I Was Ill:* `warum?`, `weil`, `konnte`, `musste`, `wollte`, `durfte`,
     `vergessen`.
  5. *Scenario: A Message on the Mailbox:* `die Mailbox`, `Bescheid sagen`, `erreichen`,
     `sich melden`.

### Unit 9 · "At Home and the Neighbours" (Wohnen und Nachbarn) · `de-a2-u09` · CON-DE-A2-09
- **Life in DACH:** arranging a new flat, the building's house rules, separating rubbish,
  calling the caretaker about a repair.
- **Can-do:** I can say where things are and where I put them, talk politely with
  neighbours, understand simple house rules and report something broken.
- **Grammar focus:** **two-way prepositions** `in, an, auf, unter, über, neben, vor, hinter,
  zwischen`: **Wo? + dative** (location) vs **Wohin? + accusative** (direction); `liegen /
  stehen / hängen` vs `legen / stellen / hängen`; contractions `im / ins`, `am / ans`;
  productive `in den / in die / ins` (completes PD-040).
- **Key words (12):** auf, unter, neben, an, zwischen, liegen, stehen, legen, stellen, ins,
  der Nachbar, der Hausmeister.
- **Lessons:**
  1. *Where Is It?:* `auf`, `unter`, `neben`, `an / am`, `über` + dative; `liegen`,
     `stehen`, `die Wand`.
  2. *In Front, Behind, Between:* `vor`, `hinter`, `zwischen`, `hängen`, `das Bild`, `der
     Teppich`, `die Tür`, `die Ecke`.
  3. *Where Does It Go?:* Wohin? + accusative: `stellen`, `legen`, `hängen`, `ins`, `in den
     / in die`, `der Keller`, `die Kiste`.
  4. *Good Neighbours:* `der Nachbar / die Nachbarin`, `das Haus`, `der Müll`, `die
     Mülltonne`, `trennen`, `leise`, `stören`, `die Hausordnung`.
  5. *Scenario: The Tap Is Dripping:* `der Hausmeister / die Hausmeisterin`, `reparieren`,
     `funktionieren`, `der Schlüssel`, `tropfen`.

### Unit 10 · "Train and Hotel" (Mit dem Zug ins Hotel) · `de-a2-u10` · CON-DE-A2-10
- **Life in DACH:** a long-distance train trip with a reserved seat, a delay and a missed
  connection, then checking in late at a city hotel.
- **Can-do:** I can understand platform and delay announcements with minutes, find my
  carriage and seat, book a hotel room, check in and ask about the room.
- **Grammar focus:** **`auf Gleis` / `von Gleis` + number** and **`der Bahnsteig`**
  (completes PD-042); **`… Minuten Verspätung`**; two-way and dative prepositions applied
  (`im Hotel`, `ins Hotel`, `vom Bahnhof zum Hotel`, `im zweiten Stock`); hundreds in prices
  (`hundertzwanzig Euro pro Nacht`); Perfekt and `konnte` in problem reports.
- **Key words (12):** auf Gleis, der Bahnsteig, der Wagen, reservieren, Minuten Verspätung,
  ausfallen, der Anschluss, verpassen, buchen, das Einzelzimmer, das Frühstück, die
  Rezeption.
- **Lessons:**
  1. *Which Platform?:* `auf / von Gleis …`, `der Bahnsteig`, `der Wagen`, `der Platz`
     (seat), `reservieren`, `die Reservierung`.
  2. *Ten Minutes Late:* `… Minuten Verspätung`, `die Durchsage`, `ausfallen`, `der
     Anschluss`, `verpassen`, `die Abfahrt`, `die Ankunft`.
  3. *Booking a Room:* `buchen`, `das Einzelzimmer`, `das Doppelzimmer`, `pro Nacht`, `das
     Frühstück`, `die Bestätigung`.
  4. *At Reception:* `die Rezeption`, `im … Stock`, `der Aufzug`, `das Handtuch`, `die
     Dusche`, `das WLAN`, `das Passwort`.
  5. *Scenario: Missed Connection:* `das Problem`, `stornieren`, `heute Nacht`, `die
     Kreditkarte`.

### Unit 11 · "Work and Job Search" (Arbeit und Jobsuche) · `de-a2-u11` · CON-DE-A2-11
- **Life in DACH:** reading a job ad, a CV and certificates, a first interview, an offer.
- **Can-do:** I can understand a simple job ad, say what training and experience I have,
  answer simple interview questions, and give an opinion with "I think that …".
- **Grammar focus:** **subordinate clause with `dass`** after `glauben`, `denken`, `hoffen`,
  `finden` (verb at the end, including modal + infinitive: `dass ich gut Deutsch sprechen
  kann`, and Perfekt: `dass ich drei Jahre als Ingenieurin gearbeitet habe`); `weil`
  recycled; reflexive `sich bewerben`, `sich vorstellen`.
- **Key words (12):** die Stelle, die Erfahrung, verdienen, sich bewerben, die Bewerbung,
  der Lebenslauf, dass, glauben, finden, wichtig, das Vorstellungsgespräch, der Vertrag.
- **Lessons:**
  1. *Job Ads:* `die Stelle`, `die Stellenanzeige`, `Vollzeit`, `Teilzeit`, `die
     Erfahrung`, `verdienen`, `das Gehalt`.
  2. *Applying:* `sich bewerben`, `die Bewerbung`, `der Lebenslauf`, `das Zeugnis`, `die
     Ausbildung`, `das Studium`, `studieren`.
  3. *I Think That…:* `dass`, `glauben`, `denken`, `hoffen`, `finden` (opinion), `wichtig`,
     `richtig`.
  4. *The Interview:* `das Vorstellungsgespräch`, `sich vorstellen`, `die Frage`, `die
     Sprache`, `zuverlässig`, `flexibel`, `die Stärke`.
  5. *Scenario: The Job Offer:* `die Zusage`, `die Absage`, `der Vertrag`, `der Chef / die
     Chefin`, `das Team`.

### Unit 12 · "Offices and Letters" (Ämter und Briefe) · `de-a2-u12` · CON-DE-A2-12
- **Life in DACH:** formal emails, bringing documents to an office, a letter from the
  daycare centre, a notice from the property management.
- **Can-do:** I can understand the main point of a short formal letter or email, reply with
  the right greeting and closing, ask which documents I need, and say what happens if
  something is the case.
- **Grammar focus:** **subordinate clause with `wenn`** (clause first: `Wenn Sie Fragen
  haben, rufen Sie uns an.`, verb–comma–verb); **`deshalb` and `trotzdem`** (intro, verb
  in position 2); **indirect question with `ob`** (intro: `Ich weiß nicht, ob …`); `wissen`;
  formal letter conventions.
- **Key words (12):** die E-Mail, Sehr geehrte Damen und Herren, Mit freundlichen Grüßen,
  antworten, die Unterlagen, sich anmelden, wissen, wenn, fehlen, deshalb, trotzdem, ob.
- **Lessons:**
  1. *Letters and Emails:* `die E-Mail`, formal greetings and closing, `der Betreff`, `die
     Antwort`, `antworten`.
  2. *Documents:* `die Unterlagen`, `der Pass`, `die Kopie`, `unterschreiben`, `sich
     anmelden`, `die Bescheinigung`, `wissen`.
  3. *If You Have Questions:* `wenn`, `fehlen`, `das Dokument`, `schriftlich`, `persönlich`,
     `die Öffnungszeiten`, `geöffnet / geschlossen`.
  4. *School and Daycare:* `deshalb`, `trotzdem`, `ob`, `die Kita`, `die Schule`, `der
     Elternabend`.
  5. *Scenario: A Letter from the Property Management:* `die Hausverwaltung`, `der
     Handwerker / die Handwerkerin`, `die Nebenkosten`, `informieren`, `Bitte beachten Sie`.

### Unit 13 · "Media and Comparisons" (Medien und Vergleiche) · `de-a2-u13` · CON-DE-A2-13
- **Life in DACH:** phones and apps, the evening news, a family talk about screen time.
- **Can-do:** I can compare two things, say what I like best, say which media I use and how
  often, and give a short opinion.
- **Grammar focus:** **comparative** `-er … als` (with umlaut: `älter`, `größer`, `wärmer`)
  and `so … wie`; **superlative** `am …-sten` (predicative only); irregular `gut – besser –
  am besten`, `gern – lieber – am liebsten`, `viel – mehr – am meisten`; `als` vs `wie`.
- **Key words (12):** das Handy, das Internet, die App, als, so … wie, schnell, schwer, am
  besten, am liebsten, die Nachrichten, die Zeitung, die Meinung.
- **Lessons:**
  1. *Phone and Internet:* `das Handy`, `das Internet`, `die App`, `online`, `der Laptop`,
     `der Computer`, `chatten`.
  2. *Faster and Cheaper:* comparative, `als`, `so … wie`, `schnell`, `leicht`, `schwer`,
     `praktisch`.
  3. *Best of All:* superlative, `am besten`, `am liebsten`, `am meisten`, `die Sendung`,
     `der Krimi`, `die Nachrichten`.
  4. *News and Opinions:* `die Zeitung`, `das Radio`, `der Artikel`, `die Werbung`, `die
     Meinung`, `meiner Meinung nach`, `Das stimmt.`.
  5. *Scenario: Screen Time:* `die Bildschirmzeit`, `weniger`, `zu viel`, `ausschalten`,
     `einschalten`.

### Unit 14 · "Plans and the Future" (Pläne und Zukunft) · `de-a2-u14` · CON-DE-A2-14
- **Life in DACH:** one year after arrival: plans for the next course, a new job, moving
  flat; the A2 checkpoint.
- **Can-do:** I can talk about plans and make predictions, describe my life now with
  adjectives, and use everything from A2 in a "my first year" situation.
- **Grammar focus:** **`werden` + infinitive** for the future and predictions (`ich werde,
  du wirst, er wird`; `Morgen wird es regnen.`); `werden` = "to become" (`Es wird kalt.`);
  future time words; adjective endings and all A2 grammar recycled.
- **Key words (12):** werden, bald, nächstes Jahr, die Zukunft, der Plan, wahrscheinlich,
  sicher, das Ziel, die Prüfung, üben, umziehen, glücklich.
- **Lessons:**
  1. *I Will…:* `werden` (future), `bald`, `nächstes Jahr`, `in Zukunft`, `der Plan`,
     `planen`.
  2. *It Will Rain:* `werden` (become), `wahrscheinlich`, `sicher`, `bestimmt`, `die Wolke`,
     `der Nebel`.
  3. *Goals:* `das Ziel`, `die Prüfung`, `bestehen`, `üben`, `weiter`, `der Traum`,
     `umziehen`.
  4. *About Me:* `das Leben`, `glücklich`, `zufrieden`, `stolz`, `vermissen`, `die Heimat`;
     a short self-portrait with adjective endings.
  5. *A2 Checkpoint: Your First Year:* 14 exercises, one per A2 unit, in one invented
     first-year story (PD-047); only 2 new items (`schaffen: Ich habe es geschafft!`, `die
     Erinnerung`).

### A2 grammar coverage map

| Grammar point | Introduced | Recycled in |
|---|---|---|
| `im` + month / season (PD-039) | U1 L2–L3 | U4, U10, U14 |
| `aber`, `oder`, `denn` | U1 L4 | every unit |
| Präteritum `war`, `hatte` | U2 L1 | U3, U7, U8, U10, U14 |
| Perfekt with `haben` | U2 L2–L4 | U3–U14 |
| Perfekt with `sein` | U3 L2–L3 | U5, U7, U10, U14 |
| Accusative pronouns, `für / ohne / durch / um` | U3 L3–L4 | U4, U6, U8, U12 |
| Dative articles, pronouns, dative verbs | U4 | U5, U6 (`passen`, `stehen`), U7 (`es geht mir`), U8, U9 |
| Dative prepositions, contractions | U5 L1–L2, L4 | U8, U9, U10, U12 |
| Hundreds, thousands, years (PD-041) | U5 L3 | U6, U9 (rent), U10, U11 (salary) |
| Adjective endings (nom. / acc.) | U6 L3–L4 | U9, U10, U13, U14 L4 |
| Reflexive verbs | U7 L2, L4 | U8 L5, U11, U12 L2 |
| Imperative `du` / `ihr` | U7 L3 | U9, U13 L5 |
| `sollen` | U7 L4 | U12 |
| Präteritum of modals | U8 L4 | U10 L5, U11, U14 |
| Minutes and hours | U8 L2 | U10 L2 |
| `weil` | U8 L4 | U9, U11, U13 |
| Two-way prepositions, `ins / in den / in die` (PD-040) | U9 | U10, U12, U14 |
| `auf / von Gleis`, `Bahnsteig`, `… Minuten Verspätung` (PD-042) | U10 L1–L2 | U14 L5 |
| `dass` | U11 L3 | U12, U13 L4, U14 |
| `wenn` | U12 L3 | U13, U14 |
| `deshalb`, `trotzdem`, `ob` (intro) | U12 L4 | U13, U14 |
| Comparative / superlative | U13 L2–L3 | U14 |
| `werden` (future, become) | U14 L1–L2 | U14 L3–L5 |

QA (CON-DE-A2-QA) checks the same thresholds as A1: at least 5 exercises in the introducing
unit and at least 3 in later units for every row.

---

## 4c. B1 plan (16 units × 5 lessons)

**Status:** plan (CON-DE-B1-PLAN, 2026-11-16, PD-056 … PD-063). Same structure and rules as A1
and A2 (§1, §7), plus the B1 additions to the content standard (CDS-20 … CDS-28, §7). Ids:
unit `de-b1-u01`, lesson `de-b1-u01-l1-<slug>`, exercise `de-b1-u01-l1-ex01`; audio
`/audio/de/b1/u01/<exercise-id>.mp3`. Each unit ticket (`CON-DE-B1-NN`) holds the full,
**fixed** per-lesson vocabulary appendix. The appendices are the vocabulary contract between
the 4 parallel writers (PD-052, PD-062): a lesson may use A1, A2 (appendices plus the
CON-DE-A1-QA and CON-DE-A2-QA additions), the appendices of all earlier B1 units, earlier
lessons of its own unit and the allowed extras of CDS-3 / CDS-16 / CDS-22, nothing else.

**Level goal.** B1 is the level of the integration-course final test and of most
long-term-residence rules (market analysis §2.2; we never claim this in product copy,
PD-035). The learner can deal with work, housing, offices, health and shopping in German,
tell a story in the past, explain wishes, plans and problems, give and justify an opinion,
and understand the main point of a short letter, notice or local news item.

**Size (PD-057):** 16 units, 80 lessons, **508 planned appendix entries** (~800 word forms
once regular Präteritum, Konjunktiv II, zu-infinitive, passive, case and ending forms are
counted). The earlier "~1,000 items" figure included receptive vocabulary, which needs
reading passages (tech item B1-T3 below). The CDS-3 ranges stay: L1–L4 5–8 items, L5 2–6,
the checkpoint 2. Cumulative after B1: ~1,350 entries, ~1,800+ word forms.

**Why this order (PD-056).** Every unit introduces one or two grammar points and recycles
earlier ones (coverage map below). Polite Konjunktiv II and indirect questions come first
(U1), because learners need them in every later service scenario. The Präteritum follows
(U2) so that stories, biographies and news can use it from U3 on. Relative clauses come in
two steps: nominative and accusative (U3), then dative and with prepositions (U6, together
with the dative adjective endings, so U6 is the "dative unit"). Verbs with prepositions and
`da- / wo-` compounds (U4) come before the zu-infinitive (U5), so that `Ich freue mich
darauf, … zu …` can be recycled in U6 and U10. The n-declension (U7) only needs the cases
learners already know. `obwohl` and `damit` (U8) contrast with A2's `trotzdem` and U5's
`um … zu`. The passive (U9) uses `werden` and participles from A2; its Präteritum (U12)
waits for news texts, together with the Plusquamperfekt and `nachdem / bevor`. Konjunktiv II
for wishes and hypotheticals (U10) builds on the U1 chunks. The genitive (U11) comes with
official letters, where it is most frequent, and before the full adjective system (U13).
Two-part connectors (U14) and the remaining conjunctions `während`, `seitdem`, `bis` (U15)
close the clause system. U16 adds `ohne … zu / statt … zu` and Futur I with `wohl`, then the
**B1 checkpoint** (U16 L5).

**Gap words (PD-062).** These high-frequency words were never taught in A1 or A2 (checked
against all 26 appendices and both QA tickets), so writers must not use them before the
lesson that lists them. They are placed early:
`fragen`, `erklären`, `verstehen`, `mal`, `bekommen`, `bringen`, `nur` (U1 L1–L2); `kennen`,
`genau`, `unser` (U1 L3); `man`, `meinen` (U1 L4); `also` (U1 L5); `früher`, `damals`, `leben`
(U2 L1); `zuerst`, `danach`, `plötzlich`, `endlich`, `beginnen`, `der Anfang`, `das Ende`
(U2 L3); `wirklich`, `erst` (U2 L4); `kennenlernen`, `heiraten`, `wusste`, `dachte` (U2 L5);
`der Mensch`, `die Leute`, `die Person` (U3 L1); `jemand`, `niemand`, `alle`, `jeder`, `beide`,
`allein`, `ein paar` (U3 L2); `andere` (U3 L3); `die Arbeit`, `fertig`, `wieder` (U4 L1);
`schlecht`, `falsch`, `eigentlich`, `ganz` (U4 L4); `natürlich` (U4 L5). Still **not taught
before their unit:** `sondern` (U14 L2), `damit` in any meaning (U8 L4), `während` (U11 L3),
`die Hand` (U7 L3), `der Preis` (U13 L4), `öffnen / schließen` as verbs (U9 L3), `reisen`
(U10 L2), `die Rechnung` (U8 L1), `der Weg` (U16 L5; A2 avoided it too).
Each unit ticket adds its own "not yet taught" list.

### Unit list

| Unit | Title (German theme) | Ticket | Grammar introduced | Wave / writer |
|---|---|---|---|---|
| U1 | "Could You Help Me?" (Könnten Sie mir helfen?) | CON-DE-B1-01 | Konjunktiv II for politeness (`könnten / würden Sie`, `hätte gern`, `wäre`); indirect W-questions | 1 / 1 |
| U2 | "Life Stories" (Lebensgeschichten) | CON-DE-B1-02 | Präteritum (regular, 14 common irregular forms); `als` vs `wenn` in the past | 1 / 2 |
| U3 | "People Around Me" (Menschen um mich herum) | CON-DE-B1-03 | Relative clauses: nominative and accusative | 1 / 3 |
| U4 | "Everyday Work" (Arbeitsalltag) | CON-DE-B1-04 | Verbs with prepositions; `wo-` and `da-` compounds | 1 / 4 |
| U5 | "Learning for Life" (Lernen und Weiterbildung) | CON-DE-B1-05 | Infinitive with `zu`; `um … zu` | 2 / 1 |
| U6 | "Renting a Flat" (Wohnungssuche) | CON-DE-B1-06 | Relative clauses: dative and with prepositions, `wo`; adjective endings in the dative | 2 / 2 |
| U7 | "Doctors and Hospitals" (Arzt und Krankenhaus) | CON-DE-B1-07 | n-declension; dative reflexive pronouns (`Ich putze mir die Zähne.`) | 2 / 3 |
| U8 | "Orders and Complaints" (Bestellen und Reklamieren) | CON-DE-B1-08 | `obwohl`; `damit` vs `um … zu` | 2 / 4 |
| U9 | "Environment and the City" (Umwelt und Stadt) | CON-DE-B1-09 | Passive present (with `von`); `lassen` + infinitive | 3 / 1 |
| U10 | "If I Had More Time" (Kultur, Wünsche und Träume) | CON-DE-B1-10 | Konjunktiv II for wishes, hypotheticals and advice (`würde`, `hätte`, `wäre`, `könnte`, `sollte`) | 3 / 2 |
| U11 | "Letters from the Authorities" (Post vom Amt) | CON-DE-B1-11 | Genitive basics; `wegen`, `trotz`, `während` + genitive | 3 / 3 |
| U12 | "News and Reports" (Nachrichten und Berichte) | CON-DE-B1-12 | `wurde`; passive Präteritum; Plusquamperfekt; `nachdem`, `bevor` | 3 / 4 |
| U13 | "Food and Markets" (Essen und Märkte) | CON-DE-B1-13 | Adjective endings without article (all cases) and in the genitive; comparative and superlative before nouns | 4 / 1 |
| U14 | "Living Together" (Zusammenleben) | CON-DE-B1-14 | Two-part connectors (`nicht nur … sondern auch`, `sowohl … als auch`, `entweder … oder`, `weder … noch`, `zwar … aber`) | 4 / 2 |
| U15 | "Discussing and Deciding" (Diskutieren und entscheiden) | CON-DE-B1-15 | `während`, `seitdem`, `bis` as conjunctions; `einerseits … andererseits`; opinion phrases | 4 / 3 |
| U16 | "Next Steps" (Nächste Schritte) + B1 checkpoint | CON-DE-B1-16 | `ohne … zu`, `statt … zu`; Futur I with `wohl` | 4 / 4 |

### Unit 1 · "Could You Help Me?" (Könnten Sie mir helfen?) · `de-b1-u01` · CON-DE-B1-01
- **Life in DACH:** asking for help at a library desk, finding a room in a large office
  building, calling a service hotline and being put on hold.
- **Can-do:** I can make polite requests, ask politely for information with indirect
  questions, say that I didn't understand and ask someone to repeat or explain.
- **Grammar:** Konjunktiv II as polite chunks: `Könnten Sie …?`, `Würden Sie …?`, `Ich
  hätte gern …`, `Das wäre …` (Sie / du forms only; the full paradigm is U10); **indirect
  W-questions** (`Können Sie mir sagen, wo der Eingang ist?`, `Wissen Sie, wann …?`), verb at
  the end, extending A2's `ob`.
- **Key words:** könnten Sie, würden Sie, verstehen, erklären, fragen, ich hätte gern,
  bekommen, nur, kennen, unser, man, meinen.
- **Lessons:** 1 `de-b1-u01-l1-could-you` "Could You…?" · 2 `de-b1-u01-l2-id-like` "I'd
  Like…" · 3 `de-b1-u01-l3-do-you-know-where` "Do You Know Where…?" · 4
  `de-b1-u01-l4-sorry` "Sorry, I Didn't Understand" · 5 `de-b1-u01-l5-hotline` "Scenario:
  Calling a Hotline".

### Unit 2 · "Life Stories" (Lebensgeschichten) · `de-b1-u02` · CON-DE-B1-02
- **Life in DACH:** a grandmother's story of the village she grew up in, a short biography
  in a neighbourhood newsletter, a couple telling how they met.
- **Can-do:** I can tell a short story in the past in written style, understand a short
  biography, and say when something happened once (`als`) or every time (`wenn`).
- **Grammar:** **Präteritum** of regular verbs (`lebte`, `arbeitete`); 14 common irregular
  and mixed forms as appendix items (`ging`, `kam`, `sah`, `fuhr`, `gab`, `fand`, `nahm`,
  `blieb`, `begann`, `schrieb`, `wusste`, `dachte`; U3 adds `trug`, `half`); Perfekt in speech
  vs Präteritum in writing (CDS-23); **`als` vs `wenn`** in the past.
- **Key words:** früher, damals, leben, ging, kam, gab, zuerst, danach, plötzlich, als,
  jedes Mal, kennenlernen.
- **Lessons:** 1 `de-b1-u02-l1-back-then` "Back Then" · 2 `de-b1-u02-l2-went-came-saw`
  "Went, Came, Saw" · 3 `de-b1-u02-l3-first-then` "First, Then, Finally" · 4
  `de-b1-u02-l4-when-i-was-a-child` "When I Was a Child" · 5 `de-b1-u02-l5-how-we-met`
  "Scenario: How We Met".

### Unit 3 · "People Around Me" (Menschen um mich herum) · `de-b1-u03` · CON-DE-B1-03
- **Life in DACH:** describing colleagues and neighbours, a friend who helps with the move,
  finding people with the same hobby through a local group.
- **Can-do:** I can describe people's character, say who someone is with a relative clause,
  talk about friendship and say what I do with friends.
- **Grammar:** **relative clauses, nominative and accusative** (`der Kollege, der …`, `die
  Freundin, die ich …`, `der Mann, den …`); comma and verb at the end; position after the
  noun or after the final verb (CDS-24.3); indefinite pronouns (`jemand`, `niemand`,
  `alle`, `jeder`).
- **Key words:** freundlich, ehrlich, der Mensch, die Leute, jemand, alle, jeder, die
  Freundschaft, sich verstehen, gemeinsam, der Umzug, tragen.
- **Lessons:** 1 `de-b1-u03-l1-what-are-they-like` "What Are They Like?" · 2
  `de-b1-u03-l2-the-man-who` "The Man Who…" · 3 `de-b1-u03-l3-the-friend-i-met` "The Friend
  I Met" · 4 `de-b1-u03-l4-shared-hobbies` "Shared Hobbies" · 5 `de-b1-u03-l5-moving-help`
  "Scenario: Help with the Move".

### Unit 4 · "Everyday Work" (Arbeitsalltag) · `de-b1-u04` · CON-DE-B1-04
- **Life in DACH:** a team meeting, a shift plan, a printer that won't print, small talk at
  the coffee machine before the end of the working day.
- **Can-do:** I can talk about my tasks, say what I'm waiting for, thinking about or looking
  forward to, ask what someone is talking about, and report a problem at work.
- **Grammar:** **verbs with fixed prepositions** (`warten auf`, `sich freuen auf / über`,
  `denken an`, `sprechen über`, `sich kümmern um`, `sich interessieren für`, `teilnehmen
  an`); **`wo-` compounds** for questions about things (`Worauf wartest du?`) and **`da-`
  compounds** in answers (`Ich warte darauf.`); people take preposition + pronoun (`auf
  ihn`).
- **Key words:** die Arbeit, die Aufgabe, die Besprechung, warten auf, sich freuen auf,
  sich kümmern um, worauf, darauf, der Fehler, schlecht, falsch, der Feierabend.
- **Lessons:** 1 `de-b1-u04-l1-tasks` "Tasks at Work" · 2 `de-b1-u04-l2-waiting-for`
  "Waiting for an Answer" · 3 `de-b1-u04-l3-what-about` "What Are You Talking About?" · 4
  `de-b1-u04-l4-printer-problem` "The Printer Doesn't Work" · 5
  `de-b1-u04-l5-coffee-machine` "Scenario: At the Coffee Machine".

### Unit 5 · "Learning for Life" (Lernen und Weiterbildung) · `de-b1-u05` · CON-DE-B1-05
- **Life in DACH:** an evening class, further training paid for by the employer, a
  learning plan for the next exam, tips from classmates.
- **Can-do:** I can talk about courses and training, say what I plan, try, promise or stop
  doing, say why I'm doing something, and give learning tips.
- **Grammar:** **infinitive with `zu`** after verbs (`vorhaben`, `versuchen`, `aufhören`,
  `vergessen`, `versprechen`) and after `Es ist wichtig / schwer / sinnvoll, …` and `Ich
  habe keine Zeit / Lust, …`; separable verbs (`anzufangen`); **`um … zu`** for purpose.
- **Key words:** die Weiterbildung, der Abendkurs, das Thema, vorhaben, versuchen,
  aufhören, die Möglichkeit, sinnvoll, um … zu, der Grund, der Fortschritt, sich merken.
- **Lessons:** 1 `de-b1-u05-l1-courses` "Courses and Training" · 2 `de-b1-u05-l2-i-plan-to`
  "I Plan to…" · 3 `de-b1-u05-l3-its-important-to` "It's Important to Practise" · 4
  `de-b1-u05-l4-in-order-to` "In Order to…" · 5 `de-b1-u05-l5-learning-tips` "Scenario:
  Tips for Learning".

### Unit 6 · "Renting a Flat" (Wohnungssuche) · `de-b1-u06` · CON-DE-B1-06
- **Life in DACH:** reading flat ads (cold and warm rent, deposit), a shared flat, a quiet
  courtyard, mould in the bathroom, a written complaint to the property management.
- **Can-do:** I can understand a flat ad, describe the flat and area I want, say which
  people and places I mean with relative clauses, and report a problem in writing.
- **Grammar:** **dative relative pronouns** (`dem`, `der`, `dem`, `denen`); **preposition +
  relative pronoun** (`die Wohnung, in der ich wohne`) and `wo` for places; **adjective
  endings in the dative** (`mit einem großen Balkon`, `in einer ruhigen Gegend`, `mit den
  netten Nachbarn`); `da-` compounds with a clause recycled (`Ich warte darauf, dass …`).
- **Key words:** die Anzeige, die Kaltmiete, die Kaution, die Lage, der Mieter, denen, die
  Gegend, der Hof, der Schaden, der Schimmel, die Reparatur, die Beschwerde.
- **Lessons:** 1 `de-b1-u06-l1-flat-ads` "Flat Ads" · 2 `de-b1-u06-l2-the-landlord`
  "The Landlord I Wrote To" · 3 `de-b1-u06-l3-big-balcony` "A Flat with a Big Balcony" · 4
  `de-b1-u06-l4-the-room-where` "The Room Where It's Damp" · 5
  `de-b1-u06-l5-complaint-letter` "Scenario: A Letter About the Mould".

### Unit 7 · "Doctors and Hospitals" (Arzt und Krankenhaus) · `de-b1-u07` · CON-DE-B1-07
- **Life in DACH:** seeing the family doctor first, a referral to a specialist, a visit to
  A&E, visiting hours on a ward, a call to the health insurer about a new address.
- **Can-do:** I can describe symptoms in more detail, understand what the doctor asks me to
  do, talk about a small injury, and handle a short call with my health insurer.
- **Grammar:** **n-declension** (`der Patient`, `den / dem Patienten`; also `der Kunde`,
  `der Junge`, `der Student` and the known `der Kollege`, `der Nachbar`, `der Herr`, `der
  Mensch`); **dative reflexive pronouns** with a second object (`Ich wasche mir die Hände.`,
  `Er hat sich den Arm gebrochen.`).
- **Key words:** das Symptom, stark, schwindlig, der Patient, der Hausarzt, die
  Überweisung, das Rezept, die Hand, sich die Zähne putzen, das Krankenhaus, die
  Notaufnahme, die Versicherung.
- **Lessons:** 1 `de-b1-u07-l1-symptoms` "Symptoms" · 2 `de-b1-u07-l2-the-patient` "The
  Patient" · 3 `de-b1-u07-l3-wash-your-hands` "Wash Your Hands" · 4 `de-b1-u07-l4-hospital`
  "At the Hospital" · 5 `de-b1-u07-l5-insurance-call` "Scenario: A Call to the Health
  Insurer".

### Unit 8 · "Orders and Complaints" (Bestellen und Reklamieren) · `de-b1-u08` · CON-DE-B1-08
- **Life in DACH:** an online order, a parcel left with a neighbour, a damaged device, a
  complaint to customer service, cancelling a mobile phone contract.
- **Can-do:** I can order online, complain about a faulty product, ask for my money back,
  say what I do so that something happens, and express a contrast with `obwohl`.
- **Grammar:** **`obwohl`** (verb at the end; contrasted with A2 `trotzdem`); **`damit`**
  (different subject) vs **`um … zu`** (same subject, U5); clause-first orders accepted
  (CDS-24.2).
- **Key words:** bestellen, die Lieferung, die Rechnung, obwohl, beschädigt, sich
  beschweren über, reklamieren, das Gerät, damit, abholen, kündigen, bestätigen.
- **Lessons:** 1 `de-b1-u08-l1-ordering-online` "Ordering Online" · 2
  `de-b1-u08-l2-although` "Although It Was New" · 3 `de-b1-u08-l3-complaint` "Making a
  Complaint" · 4 `de-b1-u08-l4-so-that` "So That It Arrives Today" · 5
  `de-b1-u08-l5-cancelling` "Scenario: Cancelling a Contract".

### Unit 9 · "Environment and the City" (Umwelt und Stadt) · `de-b1-u09` · CON-DE-B1-09
- **Life in DACH:** sorting glass, paper and organic waste, returning bottles for the
  deposit, a new cycle path, getting a bike repaired, a neighbourhood clean-up.
- **Can-do:** I can say what is done and by whom, talk about what I do for the environment,
  understand simple notices about building work, and say what I have done by someone else.
- **Grammar:** **passive present** (`Das Glas wird gesammelt.`, `Die Brücke wird von der
  Stadt gebaut.`) and `man` as the active alternative; **`lassen` + infinitive** (`Ich lasse
  mein Rad reparieren.`).
- **Key words:** die Umwelt, sparen, der Strom, das Glas, das Pfand, sammeln, bauen, die
  Baustelle, der Verkehr, die Luft, lassen, mitmachen.
- **Lessons:** 1 `de-b1-u09-l1-environment` "The Environment" · 2 `de-b1-u09-l2-is-sorted`
  "The Rubbish Is Sorted" · 3 `de-b1-u09-l3-built-by` "Built by the City" · 4
  `de-b1-u09-l4-by-bike` "By Bike or by Bus?" · 5 `de-b1-u09-l5-clean-up` "Scenario: The
  Neighbourhood Clean-Up".

### Unit 10 · "If I Had More Time" (Kultur, Wünsche und Träume) · `de-b1-u10` · CON-DE-B1-10
- **Life in DACH:** museum and theatre evenings, a sold-out concert in the park, dreaming of
  a trip around the world, giving a friend advice.
- **Can-do:** I can talk about culture and leisure, say what I would do if things were
  different, express wishes and give advice.
- **Grammar:** **Konjunktiv II** in full: `würde` + infinitive (all persons), `hätte`,
  `wäre`, `könnte` (all persons); `wenn` + Konjunktiv II (`Wenn ich mehr Zeit hätte, würde
  ich …`); advice with `sollte` and `an deiner Stelle`.
- **Key words:** die Kultur, das Museum, das Konzert, die Ausstellung, würde, reisen, der
  Wunsch, hätte, wäre, sollte, der Rat, ausverkauft.
- **Lessons:** 1 `de-b1-u10-l1-culture` "Out and About" · 2 `de-b1-u10-l2-i-would-love-to`
  "I Would Love To" · 3 `de-b1-u10-l3-if-i-had` "If I Had More Time" · 4
  `de-b1-u10-l4-if-i-were-you` "If I Were You" · 5 `de-b1-u10-l5-concert` "Scenario: A
  Concert in the Park".

### Unit 11 · "Letters from the Authorities" (Post vom Amt) · `de-b1-u11` · CON-DE-B1-11
- **Life in DACH:** an invented letter from the citizens' office about a new ID card, a
  reference number and enclosures, a payment reminder, a call to the clerk in charge.
- **Can-do:** I can understand the main point of a short official letter and what I am
  asked to do, say whose documents are missing, give reasons with `wegen`, and ask about a
  letter on the phone.
- **Grammar:** **genitive basics**: `des / eines / meines` + `-(e)s`, `der / einer / meiner`;
  `wessen?`; names with `-s` (`Annas Pass`); **`wegen`, `trotz`, `während` + genitive**;
  `von` + dative accepted as the spoken alternative (CDS-23.7).
- **Key words:** die Behörde, das Amt, der Bescheid, das Schreiben, die Anlage, wessen, der
  Antrag, beantragen, wegen, trotz, die Mahnung, überweisen.
- **Lessons:** 1 `de-b1-u11-l1-official-letters` "Official Letters" · 2 `de-b1-u11-l2-whose`
  "Whose Form Is It?" · 3 `de-b1-u11-l3-because-of` "Because of the Delay" · 4
  `de-b1-u11-l4-reminder` "A Payment Reminder" · 5 `de-b1-u11-l5-calling-the-office`
  "Scenario: Calling About a Letter".

### Unit 12 · "News and Reports" (Nachrichten und Berichte) · `de-b1-u12` · CON-DE-B1-12
- **Life in DACH:** invented local news: a town hall renovated, a library reopened, a city
  festival, firefighters rescuing a cat, the local club's season.
- **Can-do:** I can understand the main points of a short local news report, say what was
  done, say what had happened before something else, and retell a local event.
- **Grammar:** **`wurde`** (Präteritum of `werden`: "became" and passive); **passive
  Präteritum** (`Die Bibliothek wurde gestern eröffnet.`); **Plusquamperfekt** (`hatte …
  gegessen`, `war … gefahren`); **`nachdem`** and **`bevor`**.
- **Key words:** die Meldung, berichten, aktuell, wurde, die Eröffnung, das Gebäude,
  nachdem, bevor, stattfinden, der Unfall, die Feuerwehr, der Erfolg.
- **Lessons:** 1 `de-b1-u12-l1-local-news` "Local News" · 2 `de-b1-u12-l2-was-opened` "It
  Was Opened Yesterday" · 3 `de-b1-u12-l3-after-we-had` "After We Had Eaten" · 4
  `de-b1-u12-l4-what-happened` "What Happened?" · 5 `de-b1-u12-l5-club-newsletter`
  "Scenario: The Club Newsletter".

### Unit 13 · "Food and Markets" (Essen und Märkte) · `de-b1-u13` · CON-DE-B1-13
- **Life in DACH:** the weekly market, regional and seasonal produce, cooking for a shared
  team lunch, ordering vegetarian and vegan dishes.
- **Can-do:** I can describe food and taste, follow and give a simple recipe, compare
  products and offers, and order with special wishes.
- **Grammar:** **adjective endings without an article** in all cases (`frisches Brot`, `mit
  frischem Gemüse`, `frische Tomaten`) and **in the genitive** (`wegen des schlechten
  Wetters`); **comparative and superlative before nouns** (`der günstigere Preis`, `das
  beste Brot`). Completes the adjective system (A2 U6, B1 U6).
- **Key words:** der Wochenmarkt, frisch, regional, probieren, scharf, schmecken, das
  Rezept (recipe), die Zutaten, schneiden, günstig, der Preis, vegetarisch.
- **Lessons:** 1 `de-b1-u13-l1-market` "At the Weekly Market" · 2
  `de-b1-u13-l2-fresh-bread` "Fresh Bread, Strong Coffee" · 3
  `de-b1-u13-l3-fresh-vegetables` "With Fresh Vegetables" · 4 `de-b1-u13-l4-the-cheaper-one`
  "The Cheaper Offer" · 5 `de-b1-u13-l5-team-lunch` "Scenario: The Team Lunch".

### Unit 14 · "Living Together" (Zusammenleben) · `de-b1-u14` · CON-DE-B1-14
- **Life in DACH:** volunteering with senior citizens, house rules for a shared courtyard,
  friendships across cultures, organising a street party.
- **Can-do:** I can talk about volunteering and community life, link two alternatives or
  two things that are both true or both not true, and talk about differences and
  similarities between cultures with respect.
- **Grammar:** **two-part connectors**: `nicht nur … sondern auch`, `sowohl … als auch`,
  `entweder … oder`, `weder … noch`, `zwar … aber`; `sondern` after a negation.
- **Key words:** das Ehrenamt, sich engagieren, unterstützen, sondern, sowohl … als auch,
  die Gemeinschaft, entweder … oder, weder … noch, die Regel, der Unterschied, ähnlich,
  das Straßenfest.
- **Lessons:** 1 `de-b1-u14-l1-volunteering` "Volunteering" · 2 `de-b1-u14-l2-not-only`
  "Not Only… but Also" · 3 `de-b1-u14-l3-either-or` "Either… or…" · 4
  `de-b1-u14-l4-cultures` "Different Cultures" · 5 `de-b1-u14-l5-street-party` "Scenario:
  The Street Party".

### Unit 15 · "Discussing and Deciding" (Diskutieren und entscheiden) · `de-b1-u15` · CON-DE-B1-15
- **Life in DACH:** a team deciding about working from home, a family weighing city against
  countryside, a house meeting about bikes in the courtyard.
- **Can-do:** I can give and justify my opinion, agree and disagree politely, weigh pros and
  cons, and say what happens at the same time, since or until something happens.
- **Grammar:** **`während`** (while / whereas), **`seitdem`** and **`bis`** as conjunctions
  (verb at the end); **`einerseits … andererseits`**; opinion phrases (`Ich bin der Meinung,
  dass …`, `Ich bin dafür / dagegen.`).
- **Key words:** der Meinung sein, dafür / dagegen sein, zustimmen, das Argument, der
  Vorteil, der Nachteil, einerseits … andererseits, während, seitdem, bis, sich gewöhnen an,
  der Kompromiss.
- **Lessons:** 1 `de-b1-u15-l1-opinions` "Opinions" · 2 `de-b1-u15-l2-pros-and-cons` "Pros
  and Cons" · 3 `de-b1-u15-l3-while` "While Some Work…" · 4 `de-b1-u15-l4-since-until`
  "Since and Until" · 5 `de-b1-u15-l5-house-meeting` "Scenario: The House Meeting".

### Unit 16 · "Next Steps" (Nächste Schritte) · `de-b1-u16` · CON-DE-B1-16
- **Life in DACH:** two years in: a career-advice appointment, applying for a job with more
  responsibility, the interview, looking ahead; the B1 checkpoint.
- **Can-do:** I can talk about my career plans and experience, present my strengths in an
  interview, say what I do without or instead of doing something, make assumptions about the
  future, and use all of B1 in one story.
- **Grammar:** **`ohne … zu`** and **`statt … zu`**; **Futur I with `wohl`** for
  assumptions (`Sie wird wohl zu Hause sein.`); all B1 grammar recycled.
- **Key words:** der Arbeitgeber, die Berufserfahrung, die Beratung, ohne … zu, statt … zu,
  die Verantwortung, die Herausforderung, wohl, vermutlich, sich Sorgen machen, der Weg,
  durchhalten.
- **Lessons:** 1 `de-b1-u16-l1-career` "Career Plans" · 2 `de-b1-u16-l2-without-instead`
  "Without Asking, Instead of Waiting" · 3 `de-b1-u16-l3-interview` "The Interview" · 4
  `de-b1-u16-l4-probably` "That's Probably Right" · 5 `de-b1-u16-l5-b1-checkpoint` "B1
  Checkpoint: Your Next Steps" (16 exercises, one per B1 unit, CDS-28).

### B1 grammar coverage map

"Recycled in" is a **duty** (CDS-25): each listed unit ticket names the point in its
recycling criterion and uses it in at least 2 exercises, so every row reaches the QA
threshold (≥ 5 in the introducing unit, ≥ 3 in later units) by plan, not by luck (the A2 QA
had to fix 4 rows with 0–1 later uses).

| Grammar point | Introduced | Recycled in (duty) |
|---|---|---|
| Konjunktiv II politeness chunks (`könnten / würden Sie`, `hätte gern`, `wäre`) | U1 L1–L2 | U4, U7, U8, U11 |
| Indirect W-questions | U1 L3 | U5, U11, U12 |
| Präteritum (regular + listed irregular) | U2 L1–L3 | U3 L5, U9, U12, U16 |
| `als` vs `wenn` (past) | U2 L4 | U3, U12, U16 |
| Relative clauses nom. / acc. | U3 L2–L3 | U4, U5, U8, U13, U16 |
| Verbs with prepositions, `wo- / da-` compounds | U4 L2–L3 | U5, U6, U9, U14, U15 |
| Infinitive with `zu` | U5 L2–L3 | U6, U8, U10, U16 |
| `um … zu` | U5 L4 | U8 (vs `damit`), U9, U13 |
| Relative clauses dat. / with prepositions, `wo` | U6 L2, L4 | U7, U11, U14 |
| Adjective endings in the dative | U6 L3 | U7, U10, U13 |
| n-declension | U7 L2 | U8, U12, U14, U16 |
| Dative reflexive pronouns | U7 L3 | U13, U16 |
| `obwohl` | U8 L2 | U10, U14, U15 |
| `damit` | U8 L4 | U9, U14, U16 |
| Passive present (+ `von`) | U9 L2–L3 | U11, U12, U13 |
| `lassen` + infinitive | U9 L4 | U11, U13 |
| Konjunktiv II wishes / hypotheticals (`wenn … hätte`, `würde`) | U10 L2–L3 | U14, U15, U16 |
| `sollte`, `an deiner Stelle` | U10 L4 | U13, U15 |
| Genitive, `wegen / trotz / während` + gen. | U11 L2–L3 | U12, U13, U15 |
| `wurde`, passive Präteritum | U12 L2 | U14, U16 |
| Plusquamperfekt, `nachdem / bevor` | U12 L3 | U14, U16 |
| Adjective endings without article, genitive endings, attributive comparison | U13 L2–L4 | U14, U16 |
| Two-part connectors | U14 L2–L3 | U15, U16 |
| `während` / `seitdem` / `bis` (conjunctions) | U15 L3–L4 | U16 |
| `ohne … zu`, `statt … zu`, Futur I with `wohl` | U16 L2, L4 | U16 L5 |

A1 and A2 points that B1 keeps alive without a duty: Perfekt (speech), dative and two-way
prepositions, `weil / dass / wenn / ob`, comparison, `werden`. The checkpoint (U16 L5)
touches every unit.

### Exercise types for B1 and the tech needs list (PD-060)

**All 16 units can be written with today's four types** (multiple choice, word bank both
directions, match pairs, listen). No unit waits for engine work. Reading comprehension of
letters, notices and news is practised sentence by sentence in `to_known` word banks
(translate a line from the letter), and announcements in `listen`. Later types are added
to B1 by follow-up content tickets with **new exercise ids only** (as CON-DE-A2-CLZ).

| # | Tech need | Owner | Blocker? | B1 use | Follow-up content |
|---|---|---|---|---|---|
| B1-T1 | **Cloze** (CTO-009 contract, LES-015 component; v0.5.1) | cto, dev-lessons | **No** (writing or v1.1.0). If v0.5.1 slips, it moves to v1.1.0 (ROADMAP). | Relative pronouns (U3, U6), `da- / wo-` (U4), endings (U6, U13), n-declension (U7), genitive (U11) | CON-DE-B1-CLZ (planned): 1–2 cloze exercises in U3, U4, U6, U7, U11, U13 |
| B1-T2 | **Typed answers** with `ss` / `ae oe ue` leniency and a capitalisation note (PD-033): an answer type in the contract and a checker change in `src/contracts/text.ts` | cto (contract, checker), dev-lessons (input UI) | **No** | Writing one sentence of an email or complaint in the L5 scenarios (U6, U8, U11, U16); spelling of gap words | CON-DE-B1-TYP (planned): 1 typed exercise per L5 |
| B1-T3 | **Reading passage**: a German text of up to ~600 characters (letter, notice, ad, news item) with 2–4 questions. Needs English options with correct `lang` tagging, i.e. the reverse-direction MC of PD-019 (`direction` field) | cto (contract), dev-lessons (component) | **No** for writing and for v1.1.0. Strongly recommended for v1.1.0; if late, it ships as v1.1.1 | U6 L1 (flat ad), U8 L5, U11 L1 / L5, U12 L1 / L5, U15 L5 | CON-DE-B1-RDG (planned): one passage per listed lesson, adding up to ~150 receptive words (the rest of the old "~1,000") |
| B1-T4 | **Grammar note card with tables** (case and ending tables before a lesson) | cto (contract), dev-lessons | **No**. B1 tips (CDS-21) carry one-line tables | Endings (U6, U13), n-declension (U7), relative pronouns (U3, U6), genitive (U11) | Note cards written into the same lessons later, no exercise changes |
| B1-T5 | **Verification, not new tech:** the LES-013 tip card shows a 240-character tip, and a 110-character prompt fits above a 14-tile word bank with the feedback panel open, at 375 × 667 without horizontal scroll | pm (preview check before wave 1); dev-lessons if it fails | **Yes, for CDS-20 / CDS-21 only.** If it fails, B1 keeps A2's limits (80-character prompts, 200-character tips) and writing still starts | Every lesson | — |
| B1-T6 | Offline caching for 210 German lessons and their audio (PLT-015 scope grows from 130) | dev-platform | No | Every lesson | — |
| B1-T7 | Prompt audio on MC (LES-016, v1.0.0, PD-055) | dev-lessons | No | Announcement comprehension in U8, U9, U12 | Optional prompt audio on existing MCs |

---

## 5. Exercise engine today and how German is practised

**Supported today** (`src/contracts/course.ts`): `multiple_choice`, `word_bank_translate`
(both directions), `match_pairs` (exactly 5 pairs), `listen` (tiles, normal and 0.7× slow).
`speak` is in the contract and comes with LES-011 (v1.0.0). Multiple choice prompts are in
English and options in German (PD-019).

| German feature | How we practise it with today's engine |
|---|---|
| **Article gender** (`der / die / das`) | Every noun is taught with its article: match pairs pair `der Tisch` ↔ `the table`. Multiple choice "Which one means 'the table'?" with options `der Tisch` / `die Tisch` / `das Tisch`. Word banks include the article tiles `der`, `die`, `das` as distractors. |
| **Plural forms** | Plurals are taught with `die` (`die Äpfel`). Multiple choice "Which one means 'the apples'?" with plural-form options (`die Äpfel` / `die Apfel` / `die Äpfeln`). |
| **Umlauts and ß** | They are significant in answers (PD-033). Tiles always show the correct spelling. Distractor tiles may contrast minimal pairs taught in the course (`schon` / `schön` only once both are taught). Listen exercises train the sound. |
| **Capitalised nouns** | Matching ignores case (PD-010, PD-033), but tiles are shown in their authored case: nouns, names and the formal `Sie` / `Ihr` capitalised, everything else lower case, including sentence-initial words (PD-037). The learner sees correct noun capitalisation on every tile. The feedback panel shows the canonical sentence with correct capitals. |
| **Separable verbs** | Word banks where the particle tile goes at the end (`ich` `stehe` `um` `sieben` `Uhr` `auf`). Multiple choice "Which sentence means 'I get up at seven'?" with a wrong-order option (`Ich aufstehe um sieben Uhr.`). |
| **V2 word order** | Word banks with a time-first English prompt ("On Monday I work") and the tiles for `Am Montag arbeite ich.`. The variant `Ich arbeite am Montag.` is also accepted, because the English allows both. The wrong order `Am Montag ich arbeite` is never accepted. Multiple choice can offer it as a distractor. |
| **Verb at the end with modals** | Word banks (`ich` `kann` `gut` `schwimmen`). |
| **du / Sie** | English prompts mark the register: "(formal)" or "(to a friend)". |
| **Cases** (accusative at A1) | Multiple choice with article options (`Ich brauche den / der / dem Käse.` as three full-sentence options). |
| **Listening** | `listen` exercises with German audio. Multiple choice already allows optional prompt audio. Short announcement comprehension is possible when LES-004 plays it (to verify by the cto in CTO-008). |
| **Perfekt** (A2) | Word banks with the participle tile at the end (`ich` `habe` `gestern` `Pizza` `gegessen`) and a wrong auxiliary tile as distractor (`bin` with `gegessen`, `habe` with `gefahren`). MC with the typical errors as options: `Ich habe gegessen Pizza.` / `Ich bin Pizza gegessen.` / `Ich habe Pizza gegessen.` |
| **Cases and articles** (dative, A2) | MC with three or four full-sentence options that differ only in the article (`Ich helfe dem / den / der Mann.`). Word banks with competing article tiles (`dem`, `den`, `der`); because a wrong article makes a sentence that isn't in the accepted list, the tile set itself is the drill. |
| **Two-way prepositions** (A2) | Paired MCs: "Which sentence means 'The book is on the table'?" (`auf dem Tisch`) and "… 'I'm putting the book on the table'?" (`auf den Tisch`), each with the other case as a distractor. Word banks with `liegt` / `legt` and `dem` / `den` tiles in the same set. |
| **Adjective endings** (A2, nom. / acc.) | MC with four full-sentence options differing only in the ending (`einen blauen / blaue / blauer / blaues Pullover`). Word banks that offer two ending tiles of the same adjective (`blauen`, `blaue`). Match pairs pair a noun phrase with its English (`ein rotes Kleid` ↔ `a red dress`). Cloze (CTO-009 / LES-015) will add a faster drill later; it is not required (PD-049). |
| **Verb at the end** (`weil`, `dass`, `wenn`, `ob`, A2) | Word banks with the whole sentence as word tiles; the English allows main-clause-first and, for `weil` / `wenn`, clause-first orders, and both are accepted (PD-048). MC offers the V2 error (`weil ich war krank`) as a distractor. |
| **Comparison** (A2) | MC with `als` / `wie` / `dann` options and with wrong forms (`gutter`, `am gutesten`) only where the error is common; word banks with `als` and `wie` tiles in one set. |

### Content rules specific to German
- `sie` (she/they) and `Sie` (formal you) never both appear in one tile set, because
  matching ignores case (PD-033). Prompts make the meaning clear.
- No capital `ẞ` in content. Write numbers as words in tile answers (`drei Euro zwanzig`)
  and keep digits out of tiles, because punctuation like `1.` is removed by normalisation.
- Hyphenated compounds (`U-Bahn`, `S-Bahn`, `E-Mail`) are one tile. Normalisation splits
  them into two tokens on both sides, which the cto confirms in CTO-008.
- Person and job nouns accept both forms in `to_learning` answers (`Ich bin Lehrer.` /
  `Ich bin Lehrerin.`). Content uses paired forms, not gender symbols, in A1.

---

## 6. Phase 2 exercise ideas for German

| Idea | What it does | Needed work | Level where it matters |
|---|---|---|---|
| **Gender choice** | A noun card with three big buttons `der` / `die` / `das`; fast rounds of 5–10 nouns | **Covered by the cloze type** (one gap with options `der / die / das`, PD-049). No separate type. | A1–A2 |
| **Cloze (fill the gap)** | A German sentence with one or two gaps; pick the right word for each gap (articles, endings, prepositions, verb forms) | **Proposed: CTO-009 (contract) + LES-015 (component), P1, not blocking A2** (PD-049). | A2–C1 (essential for adjective endings from B1) |
| **Typed translation** | Type the answer; accept `ss` for `ß` and `ae / oe / ue` for `ä / ö / ü` with a spelling note; capitalisation of nouns gives a hint but is not wrong | **Contract (answer type) + checker change in `src/contracts/text.ts`** (PD-033) | A2+ (writing skill for exams) |
| **Reverse multiple choice** | German prompt, English options | Contract `direction` field (PD-019) | A1+ |
| **Sentence order** | Order whole clauses (main + subordinate clause with `weil` / `dass`) | Can reuse the word bank with clause tiles; tiles longer than 40 chars need a contract change | A2–B1 |
| **Reading passage** | A short text (letter, notice, ad) with 2–4 questions | **New type: contract + engine** | B1+ |
| **Listening comprehension** | Longer audio (announcement, voicemail) + questions | Multiple choice with audio may be enough; multi-question needs a new type | A2+ |
| **Grammar note card** | A short explanation with a table (e.g. accusative articles) before a lesson | **Contract** (longer tip or a new lesson section). A2 uses the existing `tip` (≤ 200 characters, CDS-15) shown by the tip card LES-013, pulled into v0.5.0 (PD-050). B1 writes one-line tables into tips (CDS-21); the card itself is tech item B1-T4, not blocking (§4c, PD-060). | A2+ (B1+ essential) |
| **Speak with `de-DE` recognition** | Read aloud; checked by speech recognition | LES-011 with the course speech locale (CTO-008) | A1+ |
| **Level checkpoint flow** | A longer timed review at the end of a level, with a "you completed A1" badge | Engine + gamification (path node type) | Every level |

---

## 7. German content standard (CDS), used by every CON-DE ticket

Each `CON-DE-*` ticket passes **all** of these, plus its own unit-specific criteria.

- **CDS-1 Files:** the unit is added to `content/courses/en-de/course.json` under its level
  (A1, A2, …; units grouped by level in CEFR order, ADR-008), with its 5 lessons in the ticket's order, ids and titles. Each lesson is
  `content/courses/en-de/lessons/<lessonId>.json`. The course `version` is bumped.
- **CDS-2 Mix:** each lesson has 10–12 exercises: at least 3 multiple choice, at least 3 word
  bank translate (at least 1 in each direction), exactly 1 match pairs with 5 pairs, and at
  least 2 listen.
- **CDS-3 Vocabulary control:** each lesson introduces only the items in its ticket's
  vocabulary appendix (lessons 1–4: 5–8 items; lesson 5: 2–6 items). Exercises only use items
  from this lesson or earlier lessons of the course. Allowed extras (PD-020, extended by
  PD-037): proper nouns (invented first names, real German, Austrian and Swiss city names,
  and country names already taught or spelled the same in English and German), regular plurals
  of taught nouns, forms of taught verbs whose pattern is already taught, and words from
  taught phrases. Distractor tiles also follow this rule.
- **CDS-4 Alternatives:** every word bank and listen exercise lists all reasonable accepted
  answers (word-order variants, `ich heiße` / `mein Name ist`, `hi` / `hello`).
- **CDS-5 Distractors:** 2–4 distractor tiles per word bank, and no tile combination forms a
  valid answer that isn't in the accepted list (pm review per exercise).
- **CDS-6 German conventions (PD-032, PD-033, PD-037):** standard German as used in Germany;
  correct umlauts and `ß` (no `ae` / `ss` substitutes, no capital `ẞ`); nouns capitalised;
  every noun on the learning side of match pairs and in vocabulary has its article; tiles in
  authored case (nouns, names, `Sie` / `Ihr` capitalised; other words lower case); `sie` and
  `Sie` never in the same tile set; register marked in English prompts where `du` / `Sie`
  matters.
- **CDS-7 Multiple choice direction:** English prompt, German options (PD-019). Standard
  wording: "Which one means '<english>'?" or "Which sentence means '<english>'?".
- **CDS-8 Originality:** every sentence, scenario, name and theme is original. No brands, no
  celebrities, no exam tasks. Names are varied and invented and reflect the diversity of
  people living in German-speaking countries.
- **CDS-9 Audio:** every listen exercise has `audio.src` = `/audio/de/<level>/uNN/<exercise-id>.mp3`
  (`/audio/de/a1/u03/…`, `/audio/de/a2/u10/…`).
  Placeholder audio is allowed (PD-007, PD-034).
- **CDS-10 Tip:** each lesson has a `tip` of at most 120 characters that points out the
  lesson's German feature (e.g. "Every German noun starts with a capital letter.").
- **CDS-11 Inclusive and safe:** no slang, no sensitive topics, both forms of person and job
  nouns accepted; no legal or visa claims in content.
- **CDS-12 Validation:** all content files pass `npm run test` (the content schema test),
  exercise ids follow `de-<level>-uNN-lN-exNN` (`de-a1-u01-l1-ex01`, `de-a2-u01-l1-ex01`),
  are unique across all courses and stay stable after later edits.
- **CDS-13 Fit:** prompts at most 80 characters; no single tile longer than 24 characters
  (LES-014 tests up to that length at 375 px).

### A2 additions (CDS-14 … CDS-19, PD-047, PD-048)

From A2 on, every `CON-DE-A2-*` ticket passes CDS-1 … CDS-19. Where an A2 rule differs
from an A1 rule, the A2 rule wins for A2 content only.

- **CDS-14 Grammar drill:** every lesson whose appendix contains a grammar pattern (marked
  *pattern* in the appendix) has at least 4 exercises that need that pattern, and at least
  1 multiple choice whose distractors are the typical learner errors for it (wrong case,
  wrong ending, wrong auxiliary, V2 instead of verb-final, `wie` for `als`).
- **CDS-15 Tip (replaces the 120-character limit of CDS-10 for A2):** at most **200
  characters**, naming the rule and giving one German example (`After weil the verb goes to
  the end: …, weil ich krank war.`). Shown by the tip card (LES-013, PD-050).
- **CDS-16 Extended allowed extras (CDS-3):** once its pattern lesson is done, these are
  allowed without an appendix entry: regular `ge-…-t` / `ge-…-et` participles of taught
  verbs (after U2 L2); participles of taught separable, inseparable and `-ieren` verbs that
  follow U2 L4; `sein` participles only if listed in an appendix; dative and accusative
  forms of taught articles, possessives, `kein`, `dieser`, `welcher` (after U4 L3, U6 L3);
  adjective endings of taught adjectives (after U6 L3 / L4, nominative and accusative only);
  regular comparatives and superlatives of taught adjectives, with umlaut for `alt, groß,
  jung, kalt, warm, lang, kurz` (after U13 L2 / L3); any number up to a million and years
  (after U5 L3). Irregular participles and irregular comparisons are always appendix items.
- **CDS-17 Case-only tile pairs:** besides `sie` / `Sie`, these never share one tile set
  because matching ignores case (PD-033): `ihnen` / `Ihnen` and `ihr` / `Ihr` (A1 rule, now
  also for the dative `ihr` "to her"). The formal `Ihnen` is marked "(formal)" in the prompt.
- **CDS-18 Numbers and dates in A2:** numbers stay words in tiles and answers (CDS-6). A
  number word longer than 24 characters (`zweitausenddreiundzwanzig`) is allowed **only** as
  a multiple-choice option, never as a tile (CDS-13). English prompts may use digits for
  years, prices and times ("I came in 2021.").
- **CDS-19 Tense and clause mapping (PD-048):**
  1. English simple past and present perfect both map to the German **Perfekt**, except
     `sein`, `haben` and modal verbs, which use the **Präteritum** (`war`, `hatte`,
     `konnte`). No Präteritum of other verbs appears in A2 tiles.
  2. `to_known` answers accept the natural English only ("I played football yesterday", not
     "I have played football yesterday").
  3. English "will" is answered with the German present plus a time word before U14, and
     with `werden` from U14 L1 on; from U14, when the tiles allow both and the English has a
     time word, both are accepted.
  4. Subordinate clauses: main clause first is canonical; for `weil` and `wenn` the
     clause-first order (`Weil ich krank war, bin ich zu Hause geblieben.`) is also accepted
     when the tiles allow it. `dass` and `ob` clauses stay after the main clause. PD-043
     applies inside each clause. `weil` with V2 (spoken) is never accepted.
  5. Two-way prepositions: before U9, `in / an / auf` + article appear only in the listed
     chunks (`im` + month / season, `am Meer`, `zu Hause`, `im Angebot`, `in` + time) and in
     A1 chunks (`ins Kino`).
- **Checkpoint exception (PD-047):** the A2 checkpoint (U14 L5) has **14 exercises**, one
  per A2 unit (CDS-2's 10–12 does not apply to it; the CDS-2 type mix still does).

### B1 additions (CDS-20 … CDS-28, PD-058, PD-059, PD-061)

From B1 on, every `CON-DE-B1-*` ticket passes CDS-1 … CDS-28. Where a B1 rule differs from an
A1 or A2 rule, the B1 rule wins for B1 content only. Every rule below works with today's
four exercise types; nothing here needs new tech (the tech needs are in §4c).

- **CDS-20 Length (replaces the 80-character prompt limit of CDS-13 for B1):** prompts at
  most **110 characters**; a canonical word-bank answer has at most **14 tiles** and at most
  **2 clauses**; listen transcripts have at most 2 sentences and 18 words. Tiles stay at most
  24 characters (CDS-13), MC options at most 90 characters. Falls back to 80-character
  prompts if the B1-T5 check fails.
- **CDS-21 Tip (replaces CDS-15 for B1):** at most **240 characters**, naming the rule and
  giving one German example. A small table is written on one line with arrows and
  semicolons (`Relative pronouns, dative: dem; der; dem; denen. Die Frau, der ich helfe.`).
  Falls back to 200 if the B1-T5 check fails.
- **CDS-22 B1 allowed extras (extends CDS-3 and CDS-16):** once the pattern lesson is done,
  these need no appendix entry:
  1. regular Präteritum (`-te / -ete`) of taught regular verbs, including separable ones
     (`kaufte … ein`), after U2 L1. Irregular and mixed Präteritum forms only when an
     appendix lists them (U2: `ging, kam, sah, fuhr, gab, fand, nahm, blieb, begann, schrieb,
     wusste, dachte`; U3: `trug, half`; U12: `wurde, rief … an, lief`) or A2 did (`war,
     hatte`, modals); separable and prefixed verbs built on a listed form are allowed
     (`kam … an`, `fand … statt`, `nahm … teil`);
  2. Konjunktiv II: before U10 only the U1 chunks (`könnten Sie / könntest du`, `würden
     Sie / würdest du`, `ich hätte gern`, `das wäre / es wäre`); `würde` + any taught
     infinitive after U10 L2; `hätte / wäre / könnte` in all persons after U10 L3; `sollte`
     after U10 L4;
  3. relative pronouns: nominative after U3 L2, accusative after U3 L3, dative after U6 L2,
     after any taught preposition after U6 L4;
  4. `zu` + infinitive of taught verbs after U5 L2 (`anzufangen`, `einzukaufen`);
  5. passive present of taught verbs with a taught or CDS-16 participle after U9 L2, passive
     Präteritum after U12 L2, Plusquamperfekt after U12 L3;
  6. genitive forms of taught articles and possessives, and `-(e)s` on taught masculine and
     neuter nouns, after U11 L2;
  7. adjective endings of taught adjectives: dative after U6 L3; without an article and in the
     genitive after U13 L2 / L3; regular comparatives and superlatives before nouns after
     U13 L4;
  8. n-declension forms of the U7 L2 nouns and of `der Kollege`, `der Nachbar`, `der Herr`,
     `der Mensch` after U7 L2. Before U7 L2, B1 content uses these nouns only in the
     nominative singular and in the plural;
  9. a transparent compound of two taught nouns (`der Fahrradkeller`) in a listen transcript
     or an MC option only, at most 1 per lesson, logged in the self-review.
  Gap words (§4c) are never extras; they are appendix items.
- **CDS-23 Tense and form mapping (replaces CDS-19.1–19.3 for B1; PD-059):**
  1. English simple past → **Perfekt** in dialogue (prompts marked "(to a friend)",
     "(formal)", phone calls, chat) and **Präteritum** in narration (stories, biographies,
     reports, letters). Each `to_learning` tile set builds **one** past tense; when the tiles
     build both, both are accepted. An MC never marks the other past tense as the error;
     its distractors are wrong forms (`gehte`, `ging gegangen`) or wrong auxiliaries.
     `sein`, `haben` and modals stay Präteritum everywhere (A2 rule).
  2. English past perfect ("had …ed") → Plusquamperfekt. After `nachdem`, the Plusquamperfekt
     is canonical even when the English uses the simple past ("After we ate, …"); `to_known`
     accepts both English forms.
  3. English passive → German passive. An active `man` sentence is accepted only when the
     tiles contain `man` (writers leave `man` out of passive drills).
  4. "would + verb" → `würde` + infinitive, except `sein`, `haben`, modals → `wäre`, `hätte`,
     `könnte`; `würde sein / würde haben` is never accepted. "Could you …?" ↔ `Könnten Sie /
     Könntest du …?`; in `to_known`, "Can you …?" is also accepted. "I'd like …" ↔ `Ich hätte
     gern …` and `Ich möchte …` (both accepted when the tiles allow).
  5. English "will" keeps CDS-19.3. "will probably" → `wird wohl` or `wird wahrscheinlich`
     (both when the tiles allow).
  6. Relative clauses in `to_known`: "who / that / which" and the contact clause without a
     pronoun ("the man I met") are all accepted; "whom" is accepted, never required.
  7. Genitive or `von` + dative: both accepted when the tiles allow; genitive pattern lessons
     keep `von` out of the tiles. `wegen` / `trotz` + dative is never accepted.
  8. zu-infinitive or `dass`-clause with the same subject (`Ich hoffe, die Prüfung zu
     bestehen.` / `Ich hoffe, dass ich die Prüfung bestehe.`): both accepted when the tiles
     allow; zu-infinitive drills leave `dass` out of the tiles.
- **CDS-24 Word order and clause position (extends PD-043, PD-053, CDS-19.4; PD-059):**
  1. PD-043 and **PD-053 apply from the first B1 lesson**: fronting rules, middle-field
     adverbial swaps, fixed pronoun and object order, the `dass`-less and "…, glaube ich"
     orders. Writers build their answer lists with these rules; accepted marked orders go
     on the self-review's native-review list.
  2. **Clause-first accepted** (when the tiles allow) for `weil`, `wenn`, `als`, `obwohl`,
     `damit`, `nachdem`, `bevor`, `während`, `seitdem`, `bis` and for `um / ohne / statt … zu`
     clauses, with verb–comma–verb. **Never fronted:** `dass`, `ob`, indirect W-questions,
     relative clauses, other zu-infinitive clauses (`Es ist wichtig, … zu …` only).
  3. **Relative clauses** come right after their noun, or after the clause-final verb part
     when only that verb part would follow (`Ich habe einen Mann getroffen, der …` and `Ich
     habe einen Mann, der …, getroffen` are both accepted when buildable); never moved over
     any other constituent.
  4. **Verb clusters** at the end of subordinate clauses: modal and Perfekt as in A2;
     passive `…, weil die Straße gebaut wird`; Plusquamperfekt `…, nachdem wir gegessen
     hatten`. No double infinitive (`hat … machen lassen`, `hat kommen können`) in B1; `lassen`
     appears in the present, Präteritum `ließ` is not taught.
  5. **Two-part connectors** keep their taught positions; `weder … noch` never takes `nicht`
     or `kein`.
  6. **Answer budget:** at most 20 accepted answers per exercise (contract limit). If a
     sentence has more than 12 acceptable orders, the writer shortens it or changes the
     tiles; never lists a subset of valid orders.
- **CDS-25 Recycling duty:** each unit ticket lists earlier B1 points (coverage map, §4c)
  with a minimum number of exercises in that unit (usually 2 each). The self-review gives
  the exercise ids.
- **CDS-26 Safe topics for B1 (extends CDS-11 and PD-051; PD-061):** no real news events,
  real people, politicians, parties, elections or court cases; no migration, residence,
  citizenship or benefit rules; letters from authorities are invented, use only generic
  nouns (`das Amt`, `die Behörde`, `das Bürgeramt`, `die Krankenkasse`) and state no
  deadlines, fees, fines or consequences as rules; no medical diagnoses, doses or treatment
  advice and no statements on what insurance pays; no tenancy rules (deposit amounts, notice
  periods, rent increases); environment as personal everyday actions, no statistics and no
  political claims; news is mild and local (openings, festivals, sport, a small accident
  with nobody seriously hurt), no crime, disasters or war; relationships without sexual
  content and without break-up drama; no religion or religious holidays, no alcohol, no
  brands (shops, devices, apps, insurers, carriers, media).
- **CDS-27 Glosses:** a recycled item keeps its A1 / A2 / B1 gloss. A new meaning of a known
  word is its own appendix entry, marked "new meaning" (`als` "when", `wenn` "whenever",
  `das Land` "countryside", `das Rezept` "recipe", `die Überweisung` "bank transfer", `der
  Bescheid` "official notice", `dafür sein` "be in favour").
- **CDS-28 B1 checkpoint (PD-058):** U16 L5 has **16 exercises**, one per B1 unit, told as one
  story; CDS-2's 10–12 doesn't apply, its type mix does. Only 2 new items. The tip starts
  "This lesson reviews all of B1."
