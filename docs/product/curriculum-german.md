# German curriculum: A1 → C1 (course `en-de`)

**Owner:** pm · **Date:** 2026-11-12 · **Status:** v1 (A1 in full detail; A2–C1 as an outline) ·
**Related:** `market-analysis-german.md`, PD-030 to PD-038, tickets CTO-008, PLT-024,
GAM-010, LES-014, CON-DE-A1-01 … CON-DE-A1-12, CON-DE-A1-QA

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
| A1 · Beginner | 12 | 60 | ~400 | ~400 | v0.3.1 – v0.3.3 |
| A2 · Elementary | 14 | 70 | ~600 | ~1,000 | v0.5.0 |
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
- **Units:** 14. **New items:** ~600.

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
| **Gender choice** | A noun card with three big buttons `der` / `die` / `das`; fast rounds of 5–10 nouns | **New exercise type: contract + engine** (LES component). Can be imitated with multiple choice today. | A1–A2 |
| **Cloze (fill the gap)** | A German sentence with a gap; pick the right word or tile (articles, endings, prepositions, verb forms) | **New type: contract + engine.** Needs per-gap options and German text in the prompt (language tagging inside a sentence). | A2–C1 (essential for adjective endings from B1) |
| **Typed translation** | Type the answer; accept `ss` for `ß` and `ae / oe / ue` for `ä / ö / ü` with a spelling note; capitalisation of nouns gives a hint but is not wrong | **Contract (answer type) + checker change in `src/contracts/text.ts`** (PD-033) | A2+ (writing skill for exams) |
| **Reverse multiple choice** | German prompt, English options | Contract `direction` field (PD-019) | A1+ |
| **Sentence order** | Order whole clauses (main + subordinate clause with `weil` / `dass`) | Can reuse the word bank with clause tiles; tiles longer than 40 chars need a contract change | A2–B1 |
| **Reading passage** | A short text (letter, notice, ad) with 2–4 questions | **New type: contract + engine** | B1+ |
| **Listening comprehension** | Longer audio (announcement, voicemail) + questions | Multiple choice with audio may be enough; multi-question needs a new type | A2+ |
| **Grammar note card** | A short explanation with a table (e.g. accusative articles) before a lesson | **Contract** (longer tip or a new lesson section) | A2+ (B1+ essential) |
| **Speak with `de-DE` recognition** | Read aloud; checked by speech recognition | LES-011 with the course speech locale (CTO-008) | A1+ |
| **Level checkpoint flow** | A longer timed review at the end of a level, with a "you completed A1" badge | Engine + gamification (path node type) | Every level |

---

## 7. German content standard (CDS), used by every CON-DE ticket

Each `CON-DE-*` ticket passes **all** of these, plus its own unit-specific criteria.

- **CDS-1 Files:** the unit is added to `content/courses/en-de/course.json` under level A1,
  with its 5 lessons in the ticket's order, ids and titles. Each lesson is
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
- **CDS-9 Audio:** every listen exercise has `audio.src` = `/audio/de/a1/uNN/<exercise-id>.mp3`.
  Placeholder audio is allowed (PD-007, PD-034).
- **CDS-10 Tip:** each lesson has a `tip` of at most 120 characters that points out the
  lesson's German feature (e.g. "Every German noun starts with a capital letter.").
- **CDS-11 Inclusive and safe:** no slang, no sensitive topics, both forms of person and job
  nouns accepted; no legal or visa claims in content.
- **CDS-12 Validation:** all content files pass `npm run test` (the content schema test),
  exercise ids follow `de-a1-uNN-lN-exNN`, are unique across all courses and stay stable
  after later edits.
- **CDS-13 Fit:** prompts at most 80 characters; no single tile longer than 24 characters
  (LES-014 tests up to that length at 375 px).
