/**
 * telc B1: vocabulary (TELC-001). Source: vokab.json (cards + themes).
 * Units tb1-u02 … tb1-u29: the 82 themes grouped into 28 units (A1 → A2 → B1 topics →
 * B1 word families → Redemittel). One lesson ≈ 5 cards of one theme:
 *   match_pairs (short head words, introduces the words) → per card a multiple_choice
 *   with the FULL form (plural, Perfekt, + case …) and one sentence exercise built from the
 *   example sentence (word bank to German, listen, or word bank to English).
 */
import { chunk, data, lesson, rng, slug, unit } from "../lib.mjs";
import { audioSrc, buildTiles, pickDistinct, shuffledOptions } from "./_vg-util.mjs";

const COURSE = "telc-b1-en-de";

const THEME_EN = {
  "A1-01": "Numbers & Time",
  "A1-02": "Days & Months",
  "A1-03": "Family & People",
  "A1-04": "Body & Health",
  "A1-05": "Food & Drink",
  "A1-06": "House & Home",
  "A1-07": "Clothes & Colours",
  "A1-08": "Animals & Nature",
  "A1-09": "Key Verbs (A1)",
  "A1-10": "Adjectives: Opposites",
  "A1-11": "Question Words & Little Words",
  "A1-12": "Useful Everyday Sentences",
  "A2-01": "Work & Jobs (A2)",
  "A2-02": "Travel & Transport (A2)",
  "A2-03": "Shopping & Money",
  "A2-04": "Feelings & Character",
  "A2-05": "Verbs (A2)",
  "A2-06": "Adjectives (A2)",
  "A2-07": "Time & Frequency",
  "A2-08": "Communication & Media",
  "A2-09": "Town & Directions",
  "A2-10": "Connectors (A2)",
  "A2-11": "Introducing Yourself & Opinions",
  "A2-12": "Letters: Opening & Closing",
  "A2-13": "Appointments & Arrangements",
  "A2-14": "Small Talk & Reacting",
  "A2-15": "Important Nouns (Extra)",
  "A2-16": "Perfekt: Key Participles",
  D01: "Work & Career",
  D02: "Health & the Doctor",
  D03: "Travel & Transport",
  D04: "Housing & Moving",
  D05: "Environment & Weather",
  D06: "Media & Technology",
  D07: "Family & Relationships",
  D08: "Education & Language Learning",
  D09: "Free Time & Sport",
  D10: "Shopping & Complaints",
  D11: "Food & Restaurants",
  D12: "Celebrations & Invitations",
  D13: "Offices, Bank & Post",
  D14: "Town & Neighbourhood",
  D15: "Future Plans & Wishes",
  D16: "Useful Phrases",
  "B1-01": "Opinion & Discussion",
  "B1-02": "Environment & Society",
  "B1-03": "Verbs with Prepositions",
  "B1-04": "Noun-Verb Combinations",
  "B1-05": "Abstract Nouns",
  "B1-06": "Connectors (B1)",
  "B1-07": "Adjectives (B1)",
  "B1-08": "Giving Your Opinion",
  "B1-09": "Agreeing & Disagreeing",
  "B1-10": "Suggestions & Advice",
  "B1-11": "Letters & E-mails",
  "B1-12": "Complaints (Phrases)",
  "B1-13": "The Oral Exam",
  "B1-14": "Writing: Model Sentences",
  "B1-15": "Planning (Speaking Part 3)",
  "B1-16": "Pros & Cons",
  "B1-17": "Reason, Result & Example",
  "B1-18": "Comparing & Summarising",
  "B1-19": "Guessing & Certainty",
  "B1-20": "Describing a Picture",
  "B1-21": "Polite Requests",
  "B1-22": "Exam Language & Instructions",
  "B1-23": "Frequent Exam Verbs I",
  "B1-24": "Frequent Exam Verbs II",
  "B1-25": "Nouns: Everyday Life",
  "B1-26": "Nouns: Work, Education & Society",
  "B1-27": "Frequent Exam Adjectives",
  "B1-28": "Little Words & Adverbs",
  "B1-29": "Verbs with Prepositions II",
  "B1-30": "Nouns: Health, Transport & Environment",
  "B1-31": "Presentations & Talks",
  "B1-32": "Asking & Clarifying",
  "B1-33": "Phone & Messages",
  "B1-34": "Feelings & Reactions",
  "B1-35": "Clause Patterns & Connectors",
  "B1-36": "Complaints (Sentences)",
  "B1-37": "Speaking: Planning & Agreeing",
  "B1-38": "Informal E-mails",
};

/** 28 units, in path order. */
/** CEFR level shared by all themes of a unit; throws if a unit mixes levels. */
function unitLevel(codes) {
  const themes = data("vokab").themes;
  const levels = new Set(codes.map((code) => themes.find((t) => t.code === code).level));
  if (levels.size !== 1) throw new Error(`unit mixes levels: ${codes.join(", ")}`);
  return [...levels][0];
}

const UNITS = [
  ["Basics 1: Numbers, Dates & Family", ["A1-01", "A1-02", "A1-03"]],
  ["Basics 2: Body, Food & Home", ["A1-04", "A1-05", "A1-06"]],
  ["Basics 3: Clothes, Nature & Opposites", ["A1-07", "A1-08", "A1-10"]],
  ["Basics 4: Key Verbs & Questions", ["A1-09", "A1-11", "A1-12"]],
  ["Everyday 1: Work, Travel & Shopping", ["A2-01", "A2-02", "A2-03"]],
  ["Everyday 2: Feelings, Adjectives & Time", ["A2-04", "A2-06", "A2-07"]],
  ["Everyday 3: Media, Town & Key Nouns", ["A2-08", "A2-09", "A2-15"]],
  ["Everyday 4: Verbs & the Perfekt", ["A2-05", "A2-16"]],
  ["Everyday 5: Connectors & Useful Sentences", ["A2-10", "A2-11", "A2-12", "A2-13", "A2-14"]],
  ["Topics 1: Work & Health", ["D01", "D02"]],
  ["Topics 2: Travel & Housing", ["D03", "D04"]],
  ["Topics 3: Environment & Media", ["D05", "D06"]],
  ["Topics 4: Family & Education", ["D07", "D08"]],
  ["Topics 5: Free Time & Shopping", ["D09", "D10"]],
  ["Topics 6: Food & Celebrations", ["D11", "D12"]],
  ["Topics 7: Offices & Neighbourhood", ["D13", "D14"]],
  ["Topics 8: Plans & Useful Phrases", ["D15", "D16"]],
  ["B1 Words 1: Opinion & Society", ["B1-01", "B1-02", "B1-05"]],
  ["B1 Words 2: Verbs with Prepositions", ["B1-03", "B1-29", "B1-04"]],
  ["B1 Words 3: Connectors & Clause Patterns", ["B1-06", "B1-35"]],
  ["B1 Words 4: Adjectives", ["B1-07", "B1-27"]],
  ["B1 Words 5: Exam Language", ["B1-22"]],
  ["B1 Words 6: Frequent Exam Verbs", ["B1-23", "B1-24"]],
  ["B1 Words 7: Key Nouns", ["B1-25", "B1-26", "B1-30"]],
  ["B1 Words 8: Little Words & Adverbs", ["B1-28"]],
  [
    "Phrases 1: Discussing (Redemittel)",
    ["B1-08", "B1-09", "B1-10", "B1-16", "B1-17", "B1-18", "B1-19"],
  ],
  ["Phrases 2: Writing Letters & Complaints", ["B1-11", "B1-12", "B1-14", "B1-36", "B1-38"]],
  [
    "Phrases 3: Speaking & Presenting",
    ["B1-13", "B1-15", "B1-20", "B1-37", "B1-21", "B1-31", "B1-32", "B1-33", "B1-34"],
  ],
];

const ARTS = ["der ", "die ", "das "];

/** Head word and plural as the telc app shows them (content.js `headline`). */
function headline(c) {
  if (c.type !== "word") return { main: c.de, sub: null };
  const parts = c.de.split(" · ");
  const rest = parts.slice(1).join(" · ");
  const pieces = parts[0].split(", ");
  if (
    pieces.length === 2 &&
    ARTS.some((a) => pieces[0].startsWith(a)) &&
    (ARTS.some((a) => pieces[1].startsWith(a)) || pieces[1].startsWith("-"))
  ) {
    return { main: pieces[0], sub: `plural: ${pieces[1]}${rest ? ` · also: ${rest}` : ""}` };
  }
  return { main: c.de, sub: null };
}

/** Short German form for a match pair (telc studyQuiz `dePrompt`). */
function deShort(c) {
  let t = headline(c).main.split(" · ")[0].split("↔")[0];
  if (c.type === "word") {
    t = t
      .replace(/\(.*?\)/g, "")
      .replace(/\+\s*(Akk|Dat|Gen)\.?/g, "")
      .split(/[:→]/)[0];
    if (/^(der|die|das) /.test(t)) t = t.split(/,|\//)[0];
  }
  return t
    .replace(/\s+/g, " ")
    .replace(/[\s,.]+$/, "")
    .trim();
}

/** Short English form for a match pair (telc studyQuiz `enShort`; no comma split for phrases). */
function enShort(c) {
  const part = (c.en.split(" · ")[0] || c.en).trim();
  if (c.type !== "word") return part;
  return part.split(":")[0].split(",")[0].split("↔")[0].trim();
}

const kindLabel = (c) => {
  if (c.type === "sentence") return "sentence";
  if (c.type === "phrase") return "phrase";
  const first = c.de.split(" ")[0];
  if (["der", "die", "das"].includes(first)) return "noun";
  if (c.de.startsWith("sich ") || c.de.includes("(hat ") || c.de.includes("(ist ")) return "verb";
  return "word";
};

function cardNote(c) {
  const h = headline(c);
  const lines = [`**${h.main}** = ${c.en}`];
  if (h.sub) lines.push(`*${h.sub[0].toUpperCase()}${h.sub.slice(1)}*`);
  else if (c.de !== h.main) lines.push(`Full form: **${c.de}**`);
  return lines.join("\n");
}

export function build() {
  const { cards, themes } = data("vokab");
  const random = rng("telc-vocab");
  cards.forEach((c, i) => {
    c._i = i;
  });

  // ---- coverage bookkeeping
  const cov = { mc: new Set(), sentence: new Set(), pair: new Set(), example: new Set() };
  const themeCodes = new Set(themes.map((t) => t.code));
  const assigned = UNITS.flatMap(([, codes]) => codes);
  for (const code of themeCodes)
    if (!assigned.includes(code)) throw new Error(`theme ${code} not assigned`);
  if (new Set(assigned).size !== assigned.length) throw new Error("theme assigned twice");
  for (const code of assigned)
    if (!THEME_EN[code] || !themeCodes.has(code)) throw new Error(`unknown theme ${code}`);
  if (UNITS.length > 28) throw new Error("too many vocab units");

  const bundles = [];
  let sentenceTurn = 0;
  UNITS.forEach(([title, codes], ui) => {
    const unitId = `tb1-u${String(ui + 2).padStart(2, "0")}`;
    const unitCards = cards.filter((c) => codes.includes(c.code));
    const lessons = [];
    for (const code of codes) {
      const theme = themes.find((t) => t.code === code);
      const themeCards = cards.filter((c) => c.code === code);
      const groups = chunk(themeCards, 5);
      groups.forEach((group, gi) => {
        const n = lessons.length + 1;
        const name = groups.length > 1 ? `${THEME_EN[code]} ${gi + 1}` : THEME_EN[code];
        const lessonId = `${unitId}-l${String(n).padStart(2, "0")}-${slug(name, 40)}`;
        const exercises = [];

        // 1) match pairs: own cards first, topped up from the theme, then the unit.
        const eligible = (c) =>
          deShort(c).length <= 40 && enShort(c).length <= 40 && deShort(c) && enShort(c);
        const own = group.filter(eligible);
        if (own.length >= 2) {
          const board = [];
          const fits = (c) =>
            !board.some(
              (b) =>
                deShort(b).toLowerCase() === deShort(c).toLowerCase() ||
                enShort(b).toLowerCase() === enShort(c).toLowerCase(),
            );
          for (const c of [...own, ...themeCards.filter(eligible), ...unitCards.filter(eligible)]) {
            if (board.length === 5) break;
            if (!board.includes(c) && fits(c)) board.push(c);
          }
          if (board.length === 5) {
            exercises.push({
              type: "match_pairs",
              pairs: board.map((c, i) => ({
                id: `p${i + 1}`,
                learning: deShort(c),
                known: enShort(c),
              })),
            });
            for (const c of board) cov.pair.add(c._i);
          }
        }

        // 2) per card: full-form multiple choice + one sentence exercise
        const mcs = [];
        const sents = [];
        for (const c of group) {
          const sameType = themeCards.filter(
            (o) => o !== c && o.type === c.type && o.en.toLowerCase() !== c.en.toLowerCase(),
          );
          const notSame = (o) =>
            o !== c && o.type === c.type && o.en.toLowerCase() !== c.en.toLowerCase();
          const fallback = unitCards.filter(notSame);
          if (fallback.length < 3)
            fallback.push(
              ...cards.filter((o) => notSame(o) && o.level === c.level && !fallback.includes(o)),
            );
          let wrong = pickDistinct(
            sameType.filter((o) => kindLabel(o) === kindLabel(c)),
            3,
            (o) => o.de,
            [c],
            random,
          );
          if (wrong.length < 3)
            wrong = [
              ...wrong,
              ...pickDistinct(sameType, 3 - wrong.length, (o) => o.de, [c, ...wrong], random),
            ];
          if (wrong.length < 3)
            wrong = [
              ...wrong,
              ...pickDistinct(fallback, 3 - wrong.length, (o) => o.de, [c, ...wrong], random),
            ];
          if (wrong.length < 2) throw new Error(`no distractors for ${c.de}`);
          const opts = shuffledOptions(
            c.de,
            wrong.map((o) => o.de),
            random,
          );
          const what = {
            noun: "Which noun means",
            verb: "Which verb means",
            word: "Which one means",
            phrase: "Which phrase means",
            sentence: "Which sentence means",
          }[kindLabel(c)];
          mcs.push({
            type: "multiple_choice",
            prompt: `${what} „${c.en}“?`,
            ...opts,
            explanation: `${cardNote(c)}\n\n*Example:* ${c.exDe}\n${c.exEn}`,
          });
          cov.mc.add(c._i);

          const others = themeCards.filter((o) => o !== c);
          const note = `${cardNote(c)}`;
          const hasNote = /\(.*\)/.test(c.exEn);
          let mode = sentenceTurn++ % 3; // 0 to German, 1 listen, 2 to English
          if (mode === 2 && hasNote) mode = 0;
          if (mode === 0) {
            sents.push({
              type: "word_bank_translate",
              direction: "to_learning",
              prompt: c.exEn,
              tiles: buildTiles(
                [c.exDe],
                others.map((o) => o.exDe),
                random,
              ),
              answers: [c.exDe],
              explanation: note,
            });
          } else if (mode === 1) {
            sents.push({
              type: "listen",
              audio: audioSrc(`${lessonId}-${sents.length + 1}`),
              tiles: buildTiles(
                [c.exDe],
                others.map((o) => o.exDe),
                random,
              ),
              answers: [c.exDe],
              explanation: `${c.exDe}\n*${c.exEn}*\n\n${note}`,
            });
          } else {
            sents.push({
              type: "word_bank_translate",
              direction: "to_known",
              prompt: c.exDe,
              tiles: buildTiles(
                [c.exEn],
                others.map((o) => o.exEn),
                random,
              ),
              answers: [c.exEn],
              explanation: note,
            });
          }
          cov.sentence.add(c._i);
          cov.example.add(c._i);
        }
        // interleave: MC1 MC2 S1 MC3 S2 …
        mcs.forEach((m, i) => {
          exercises.push(m);
          if (i >= 1) exercises.push(sents[i - 1]);
        });
        exercises.push(sents[sents.length - 1]);

        lessons.push(
          lesson({
            id: lessonId,
            courseId: COURSE,
            unitId,
            title: name,
            tip: `Theme: ${theme.label} (${theme.level})`,
            exercises,
          }),
        );
      });
    }
    if (lessons.length > 30) throw new Error(`${unitId}: ${lessons.length} lessons`);
    const labels = codes.map((c) => themes.find((t) => t.code === c).label).join(", ");
    bundles.push(
      unit({
        id: unitId,
        title: `Vocabulary · ${title}`,
        description: `${unitCards.length} words and phrases · ${labels}`.slice(0, 280),
        // TELC-003: the unit's CEFR level is its themes' level (each unit holds one level).
        level: unitLevel(codes),
        lessons,
      }),
    );
  });

  // ---- coverage check
  const missing = (set) => cards.filter((c) => !set.has(c._i));
  for (const [k, set] of Object.entries({
    mc: cov.mc,
    sentence: cov.sentence,
    example: cov.example,
  })) {
    const m = missing(set);
    if (m.length)
      throw new Error(`vocab coverage ${k}: ${m.length} cards missing, e.g. ${m[0].de}`);
  }
  const pairable = cards.filter((c) => deShort(c).length <= 40 && enShort(c).length <= 40);
  console.log(
    `vocab coverage: ${cards.length}/${cards.length} cards in multiple choice (full form + en), ` +
      `${cov.example.size}/${cards.length} example sentences (exDe/exEn) practised, ` +
      `${cov.pair.size} cards on match boards (${pairable.length} have a ≤40-char short form), ` +
      `${themes.length}/${themes.length} themes in ${bundles.length} units`,
  );
  return bundles;
}
