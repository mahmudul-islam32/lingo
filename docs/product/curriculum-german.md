# German curriculum: A1 → C1 (course `en-de`)

**Owner:** pm · **Date:** 2026-11-13 · **Status:** v2 (A1 and A2 in full detail; B1–C1 as an
outline) · **Related:** `market-analysis-german.md`, PD-030 to PD-052, tickets CTO-008,
PLT-024, GAM-010, LES-014, CON-DE-A1-01 … CON-DE-A1-12, CON-DE-A1-QA, CON-DE-A2-01 …
CON-DE-A2-14, CON-DE-A2-QA, CTO-009, LES-015, LES-013

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
| B1 · Intermediate | 16 | 80 | ~1,000 | ~2,000 | v1.1.0 |
| B2 · Upper intermediate | 18 | 90 | ~1,500 | ~3,500 | v1.2.0 |
| C1 · Advanced | 18 | 90 | ~1,500 | ~5,000 | v1.3.0 |
| **Total** | **78** | **390** | | **~5,000** | |

B1 and above need exercise types we don't have yet (cloze, typed answers, reading passages,
grammar notes; §8). Their unit count may change once those types exist.

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
- **Units:** 16. **New items:** ~1,000. Exam-readiness milestone: B1 checkpoint (the level
  most immigration rules ask for, market analysis §2.2).

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
| **Grammar note card** | A short explanation with a table (e.g. accusative articles) before a lesson | **Contract** (longer tip or a new lesson section). A2 uses the existing `tip` (≤ 200 characters, CDS-15) shown by the tip card LES-013, pulled into v0.5.0 (PD-050). Tables wait for B1. | A2+ (B1+ essential) |
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
