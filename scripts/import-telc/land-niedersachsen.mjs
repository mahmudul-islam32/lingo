/**
 * Landesfragen for Niedersachsen (TELC-004, PD-075). Replaces the telc app's NRW block.
 *
 * Questions and options: verbatim from the BAMF Gesamtfragenkatalog "Leben in Deutschland" /
 * Einbürgerungstest, Teil II "Fragen für das Bundesland Niedersachsen", Aufgabe 1–10,
 * Stand 07.05.2025. The catalogue marks no solutions; the answers below are unambiguous
 * facts (capital, term, flag …). Picture questions (Aufgabe 1 coat of arms, Aufgabe 8 map)
 * use the catalogue's labels ("Bild 1" …, areas 1–4); their pictures come from
 * pictures.mjs (TELC-005).
 *
 * `GENERAL_EDITS` rewrites the NRW- and Dortmund-specific notes in general questions
 * (exact text replacements; the importer fails if a `from` text is not found, so a changed
 * source can't silently keep NRW notes). Official option texts are never changed.
 */

export const LAND = {
  name: "Niedersachsen",
  enName: "Lower Saxony",
  /** Label prefix: "NDS-1" … "NDS-10". */
  prefix: "NDS",
  catalogueStand: "07.05.2025",
  block: {
    title: "Niedersachsen: die 10 Landesfragen",
    rng: "NDS-1 bis NDS-10",
    kompass:
      "Exactly 3 of your 33 exam questions come from this pool of 10, and they're the easiest points in the test if you learn one index card: Landeshauptstadt **Hannover** (not Braunschweig, not Wolfsburg!) · Regierungschef = **Ministerpräsident(in)** · Landtag elected every **5 Jahre** · Kommunalwahlen ab **16** · Landesflagge **schwarz-rot-gold with the Land's coat of arms** · Wappen: the white **Sachsenross** (a leaping horse) on red · a Landkreis to remember: **Ammerland**. Niedersachsen was created in 1946 in the British zone (→Q167) from Hannover, Oldenburg, Braunschweig and Schaumburg-Lippe. About 8 million people live there; by area it is the second-largest Land after Bayern, from the North Sea coast to the Harz, wrapped around the city-state Bremen. No Land has an Außenminister (→Q39): foreign policy is Berlin's. The questions and pictures follow the official BAMF catalogue (Stand 07.05.2025).",
    kompassDe:
      "Niedersachsen in einer Karteikarte: Hauptstadt Hannover · Landtag 5 Jahre · Kommunalwahl ab 16 · Flagge schwarz-rot-gold mit Landeswappen · Wappen: weißes Sachsenross auf Rot · Landkreis-Beispiel: Ammerland · Regierungschef: Ministerpräsident/in · kein Außenminister · rund 8 Mio. Einwohner, nach Bayern das flächengrößte Land.",
  },
  questions: [
    {
      q: "Welches Wappen gehört zum Bundesland Niedersachsen?",
      o: ["Bild 1", "Bild 2", "Bild 3", "Bild 4"],
      a: 2,
      img: true,
      wd: "Das Wappen von Niedersachsen: ein weißes, springendes Pferd (Sachsenross) auf rotem Grund.",
      enShort:
        "Correct: **Bild 3**, a white leaping horse (the *Sachsenross*) filling a red shield.",
      enLong:
        "The other pictures: Bild 1 = Bayern (white-blue lozenges under a crown), Bild 2 = Schleswig-Holstein (two blue lions and a white nettle leaf), Bild 4 = Sachsen (black-gold stripes with a green crown of rue). Don't mix up the horses: NRW's arms also show a white horse, but only in one part of the shield; in Niedersachsen the horse fills the whole red shield. The same arms sit in the middle of the Landesflagge (→NDS-5).",
    },
    {
      q: "Welches ist ein Landkreis in Niedersachsen?",
      o: ["Ammerland", "Rhein-Sieg-Kreis", "Nordfriesland", "Vogtlandkreis"],
      a: 0,
      wd: "Der Landkreis Ammerland (bei Oldenburg, Kreisstadt Westerstede) liegt in Niedersachsen.",
      enShort:
        "**Ammerland**, a rural district in the northwest near Oldenburg (Kreisstadt Westerstede), known for its rhododendron parks and the Zwischenahner Meer.",
      enLong:
        'Rhein-Sieg-Kreis = NRW (around Bonn), Nordfriesland = Schleswig-Holstein (the North Frisian coast), Vogtlandkreis = Sachsen. Technique: river and region names place districts: "Rhein-" points west, "Vogtland" to the far southeast. Trap: Niedersachsen does have a Landkreis *Friesland* (around Jever), but *Nord*friesland is Schleswig-Holstein.',
    },
    {
      q: "Für wie viele Jahre wird der Landtag in Niedersachsen gewählt?",
      o: ["3", "4", "5", "6"],
      a: 2,
      wd: "Der Landtag in Niedersachsen wird für 5 Jahre gewählt (Bundestag: nur 4!).",
      enShort:
        "**5 years**, one year longer than the Bundestag's 4 (→Q107). That mismatch is the whole trap. The Landtag meets in the Leineschloss in Hannover; it was last elected in 2022, so the next regular Landtagswahl is due in 2027.",
    },
    {
      q: "Ab welchem Alter darf man in Niedersachsen bei Kommunalwahlen wählen?",
      o: ["14", "16", "18", "20"],
      a: 1,
      wd: "Bei Kommunalwahlen in Niedersachsen darf man ab 16 Jahren wählen.",
      enShort:
        "From **16**: Niedersachsen's Kommunalwahlen (Gemeinderat, Stadtrat, Kreistag, Bürgermeister, Landrat) are open to 16-year-olds. The age ladder (→Q94, Q246): **16** Kommunalwahl in Niedersachsen + Europawahl · **18** Landtag + Bundestag.",
    },
    {
      q: "Welche Farben hat die Landesflagge von Niedersachsen?",
      o: ["weiß-blau", "schwarz-rot-gold", "schwarz-gelb", "blau-weiß-rot"],
      a: 1,
      wd: "Die Landesflagge von Niedersachsen ist schwarz-rot-gold, mit dem Landeswappen (weißes Pferd auf Rot) in der Mitte.",
      enShort:
        "**Schwarz-rot-gold**, the same colours as the federal flag (→Q214), with the Land's coat of arms in the middle: the white horse on red (→NDS-1).",
      enLong:
        "That is the trap: you might expect Land colours that differ from the Bund's. The decoys: weiß-blau = Bayern, schwarz-gelb = Baden-Württemberg, blau-weiß-rot = Schleswig-Holstein.",
    },
    {
      q: "Wo können Sie sich in Niedersachsen über politische Themen informieren?",
      o: [
        "bei der Landeszentrale für politische Bildung",
        "beim Ordnungsamt der Gemeinde",
        "bei der Verbraucherzentrale",
        "bei den Kirchen",
      ],
      a: 0,
      wd: "Über politische Themen informiert die Landeszentrale für politische Bildung Niedersachsen (in Hannover).",
      enShort:
        "The **Landeszentrale für politische Bildung Niedersachsen**, the Land's nonpartisan civic-education agency: free or cheap books, events and election guides. Its federal sibling, the bpb, runs the well-known Wahl-O-Mat.",
      enLong:
        "Ordnungsamt = local public order (permits, registrations, noise); Verbraucherzentrale = consumer advice (contracts, prices); the churches are religious communities, not a source of neutral political information.",
    },
    {
      q: "Die Landeshauptstadt von Niedersachsen heißt …",
      o: ["Hannover.", "Braunschweig.", "Wolfsburg.", "Osnabrück."],
      a: 0,
      wd: "Die Landeshauptstadt von Niedersachsen ist Hannover.",
      enShort: "**Hannover**, seat of the Landtag (Leineschloss) and the Landesregierung.",
      enLong:
        "The decoys are all big Niedersachsen cities: Braunschweig (the second-largest), Wolfsburg (home of Volkswagen) and Osnabrück (Peace of Westphalia, 1648). Big or famous is not the same as capital.",
    },
    {
      q: "Welches Bundesland ist Niedersachsen?",
      o: ["Fläche 1", "Fläche 2", "Fläche 3", "Fläche 4"],
      a: 0,
      img: true,
      wd: "Niedersachsen ist das große Land im Nordwesten (Fläche 1), an der Nordsee und rund um Bremen.",
      enShort:
        "Correct: **area 1**, the large Land in the northwest, between the North Sea coast and the Harz, bordering the Netherlands.",
      enLong:
        "The other highlighted areas: 2 = Thüringen, 3 = Sachsen-Anhalt, 4 = Sachsen. Anchors for Niedersachsen: the North Sea coast with the East Frisian islands, the border with the Netherlands, and the small hole in its middle (that's the city-state Bremen). By area it is the second-largest Land after Bayern.",
    },
    {
      q: "Wie nennt man die Regierungschefin/den Regierungschef in Niedersachsen?",
      o: [
        "Erste Ministerin/Erster Minister",
        "Premierministerin/Premierminister",
        "Bürgermeisterin/Bürgermeister",
        "Ministerpräsidentin/Ministerpräsident",
      ],
      a: 3,
      wd: "Die Regierungschefin/der Regierungschef von Niedersachsen heißt Ministerpräsidentin/Ministerpräsident.",
      enShort:
        "Niedersachsen is a Flächenland, so its head of government is the **Ministerpräsident(in)** (→Q37). Only the *title* is tested; the officeholder (since May 2025 Olaf Lies, SPD ⏰) can change.",
      enLong:
        "Erster Minister / Premierminister are titles from other countries (Scotland, Wales, the UK); a Bürgermeister heads a Gemeinde (→Q131) or a city-state like Hamburg. Title follows Land type: Flächenland → Ministerpräsident, Stadtstaat → Bürgermeister.",
    },
    {
      q: "Welche Ministerin/ welchen Minister hat Niedersachsen nicht?",
      o: [
        "Justizministerin/Justizminister",
        "Außenministerin/Außenminister",
        "Finanzministerin/Finanzminister",
        "Innenministerin/Innenminister",
      ],
      a: 1,
      wd: "Einen Außenminister hat kein Bundesland. Außenpolitik macht nur der Bund.",
      enShort:
        "No Land has an **Außenminister**: foreign policy is federal (Art. 32 GG; →Q39's trio: foreign policy, currency, army). Niedersachsen does have ministers for justice, finance and the interior (Land police, →Q148), schools (→Q49) and more. Federalism gives the Länder real power at home, none abroad.",
    },
  ],
};

/** Exact replacements in general questions: { n, field, from, to }. */
export const GENERAL_EDITS = [
  { n: 19, field: "enShort", from: "from Dortmund to Munich", to: "from Hannover to Munich" },
  {
    n: 24,
    field: "enShort",
    from: "You live in the most populous one: NRW (~18 million).",
    to: "Niedersachsen (~8 million people) is the second-largest by area, after Bayern, and wraps around the city-state Bremen.",
  },
  { n: 24, field: "enShort", from: "the NRW block", to: "the Niedersachsen block" },
  { n: 25, field: "enLong", from: "NRW (yours), ", to: "NRW, " },
  {
    n: 37,
    field: "enShort",
    from: "NRW's currently governs from Düsseldorf.",
    to: "Niedersachsen's governs from Hannover.",
  },
  {
    n: 37,
    field: "enLong",
    from: "→NRW-Q9 asks this for your state specifically.",
    to: "→NDS-9 asks this for Niedersachsen specifically.",
  },
  {
    n: 39,
    field: "enLong",
    from: "→NRW-Q10 tests exactly this: NRW has no foreign minister.",
    to: "→NDS-10 tests exactly this: Niedersachsen has no foreign minister.",
  },
  { n: 49, field: "enShort", from: "follow NRW rules", to: "follow Niedersachsen rules" },
  {
    n: 62,
    field: "enShort",
    from: "(city/district council, in NRW from age 16! →NRW-Q4)",
    to: "(city/district council, in Niedersachsen from age 16! →NDS-4)",
  },
  {
    n: 62,
    field: "enShort",
    from: "(Land parliament. NRW's is in Düsseldorf, 5-year term →NRW-Q3)",
    to: "(Land parliament. Niedersachsen's is in Hannover, 5-year term →NDS-3)",
  },
  { n: 64, field: "enShort", from: "Dortmund is one", to: "Hannover is one" },
  { n: 67, field: "enShort", from: "NRW-Q10's mirror image", to: "NDS-10's mirror image" },
  {
    n: 85,
    field: "enShort",
    from: "NRW, largest Land, holds the maximum 6 votes; its government speaks for you in Berlin.",
    to: "Niedersachsen, with about 8 million people, holds the maximum 6 votes; its government speaks for its residents in Berlin.",
  },
  {
    n: 91,
    field: "enShort",
    from: "campaign hard in NRW's Landtagswahl, your state's 6 Bundesrat votes",
    to: "campaign hard in Niedersachsen's Landtagswahl, the Land's 6 Bundesrat votes",
  },
  {
    n: 95,
    field: "enShort",
    from: "; in NRW full-time to 16)",
    to: "; the exact years differ by Land)",
  },
  {
    n: 107,
    field: "enShort",
    from: "NRW-Landtag 5** (→Q109, Q110, Q230, NRW-Q3)",
    to: "Landtag in Niedersachsen 5** (→Q109, Q110, Q230, NDS-3)",
  },
  { n: 126, field: "enLong", from: "your Dortmund mailbox", to: "your mailbox" },
  {
    n: 131,
    field: "enShort",
    from: "in NRW directly elected",
    to: "in Niedersachsen directly elected",
  },
  {
    n: 167,
    field: "enShort",
    from: 'Local note: NRW, including Dortmund, was **British** zone; the British actually *created* NRW in 1946 ("Operation Marriage" merging Rhineland and Westphalia).',
    to: "Local note: Niedersachsen was in the **British** zone; the British created it on 1 November 1946 by merging Hannover, Oldenburg, Braunschweig and Schaumburg-Lippe.",
  },
  { n: 175, field: "enShort", from: "(incl. NRW/Dortmund)", to: "(incl. Niedersachsen)" },
  { n: 182, field: "enShort", from: "(Dortmund's included)", to: "(in Niedersachsen too)" },
  {
    n: 198,
    field: "enShort",
    from: "Note the NRW distractor: your Land was British-zone West (→Q167), if NRW appears",
    to: "Note the NRW distractor: NRW was British-zone West (→Q167), like Niedersachsen; if NRW appears",
  },
  {
    n: 201,
    field: "enShort",
    from: "Your own Land is the answer. NRW was",
    to: "NRW is the answer: it was",
  },
  {
    n: 206,
    field: "enShort",
    from: "Dortmund has hundreds, you've probably walked over them.",
    to: "most German cities have them, you've probably walked over some.",
  },
  {
    n: 221,
    field: "enShort",
    from: "Drive Dortmund→Netherlands",
    to: "Drive from Niedersachsen into the Netherlands",
  },
  {
    n: 230,
    field: "enShort",
    from: "NRW-Landtag 5 (→Q107, NRW-Q3)",
    to: "Landtag in Niedersachsen 5 (→Q107, NDS-3)",
  },
  { n: 246, field: "enShort", from: "(→NRW-Q4)", to: "(→NDS-4)" },
  {
    n: 253,
    field: "enShort",
    from: "(in Dortmund: Bürgerdienste)",
    to: "(in many cities called Bürgeramt)",
  },
  {
    n: 264,
    field: "enShort",
    from: "The Rhineland. Köln, Düsseldorf, and yes, Dortmund area, is the heartland; expect",
    to: "The Rhineland (Köln, Düsseldorf, Mainz) is the heartland; in Niedersachsen carnival is smaller (Braunschweig's Schoduvel is the north's biggest parade), but expect",
  },
  {
    n: 270,
    field: "enShort",
    from: "VHS Dortmund is very likely where you'll both sit",
    to: "Your local VHS is very likely where you'll sit",
  },
  {
    n: 284,
    field: "enShort",
    from: "NRW gives 5 paid days/year",
    to: "Niedersachsen gives 5 paid days/year",
  },
  {
    n: 294,
    field: "enShort",
    from: "(in NRW also Fronleichnam & Allerheiligen. NRW is historically Catholic-leaning, hence more days off than Berlin: federalism in your calendar, →Q49's cousin)",
    to: "(Niedersachsen adds Reformationstag on 31 October, a holiday there since 2018, while Catholic-leaning Länder like NRW add Fronleichnam & Allerheiligen: federalism in your calendar, →Q49's cousin)",
  },
  {
    n: 296,
    field: "enShort",
    from: "Weihnachtsmärkte (Dortmund's, with its giant tree, claims world records)",
    to: "Weihnachtsmärkte (every town has one; Hannover's fills the old town)",
  },
];

/** Applies LAND and GENERAL_EDITS to the telc app's `eb.json` data (returns a copy). */
export function withNiedersachsen(eb) {
  const LAND_BLOCK = 13;
  const qs = eb.qs.map((q) => ({ ...q }));
  const general = qs.filter((q) => q.block !== LAND_BLOCK);
  const byN = new Map(general.map((q) => [q.n, q]));
  for (const edit of GENERAL_EDITS) {
    const q = byN.get(edit.n);
    if (!q || typeof q[edit.field] !== "string" || !q[edit.field].includes(edit.from)) {
      throw new Error(`Niedersachsen edit not applicable: Q${edit.n}.${edit.field} "${edit.from}"`);
    }
    q[edit.field] = q[edit.field].replace(edit.from, edit.to);
  }
  const firstN = Math.max(...general.map((q) => q.n)) + 1;
  const landQs = LAND.questions.map((q, i) => ({
    n: firstN + i,
    label: `${LAND.prefix}-${i + 1}`,
    block: LAND_BLOCK,
    img: false,
    clock: false,
    enLong: "",
    vocab: "",
    ...q,
  }));
  const blocks = eb.blocks.map((b) => (b.id === LAND_BLOCK ? { ...b, ...LAND.block } : b));
  return { ...eb, land: LAND.name, blocks, qs: [...general, ...landQs] };
}
