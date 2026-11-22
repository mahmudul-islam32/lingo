/**
 * telc B1 Sprachbausteine (sim1.json, sim2.json, bausteine_trainer.json; app logic
 * sessions/Bausteine.jsx, screens/hubs.jsx BausteineHub). Units tb1-u45 … tb1-u49.
 *
 * Source fields: per gap `o` options, `a` correct index (Teil 2: index into `bank`),
 * `ch` grammar chapter used for the topic tag (2 Konnektoren … 9 Kleine Klassiker,
 * 10 = vocabulary/letter chunks, shown as "Grammatik" in the app), `w` German and `we`
 * English explanation.
 */
import { data, htmlToPlain, htmlToRich, optionId, rng, shuffled, unit } from "../lib.mjs";
import {
  allText,
  CHAPTER_TITLES,
  covered,
  explain,
  gapExplanation,
  gapFragments,
  mkLesson,
  sb1Exercises,
  sb2Exercises,
  sb2IntroCard,
} from "./_exam-util.mjs";

const formatCard = explain(
  "Sprachbausteine: the exam part",
  [
    "Sprachbausteine (language elements) are worth **30 points**: 20 gaps in two parts, **1.5 points per gap**.",
    "- **Teil 1 · Brief mit Lücken** (tasks 21–30): a letter with 10 gaps, three options each (a, b or c). Mostly grammar.\n- **Teil 2 · Wortbank** (tasks 31–40): a letter with 10 gaps and a bank of 15 words (a–o). Each word fits only once; five stay unused.",
    "They share the 90-minute block with Reading (tasks 1–40).",
    "## The routine",
    "First look at **where the verb is** after the gap: that usually rules out two options on its own (connector families, word order). Only then check the meaning. Check the salutation for the register (du or Sie).",
  ].join("\n\n"),
);

function radarCards(radar) {
  const line = (r) =>
    `- **${htmlToPlain(r[0])}**: ${htmlToRich(r[2])}. Deutsch: ${htmlToRich(r[1])}`;
  return [
    explain(
      "Gap radar: what the options tell you",
      [
        "The three options already show what a gap tests. Recognise the type, then apply its rule:",
        radar.map(line).join("\n"),
      ].join("\n\n"),
    ),
  ];
}

const drillChoice = (it, ch) => ({
  type: "choice",
  prompt: htmlToPlain(it.q),
  options: it.o.map((t, i) => ({ id: optionId(i), text: htmlToPlain(t) })),
  correctOptionId: optionId(it.a),
  explanation: gapExplanation(htmlToPlain(it.o[it.a]), ch, it),
});

/** Words that also work in another class (e.g. "bis" preposition/subordinator): not quizzed. */
const DUAL = [
  "bis",
  "seit",
  "da",
  "während",
  "als",
  "um",
  "nach",
  "vor",
  "damit",
  "seitdem",
  "dann",
  "zuerst",
  "vorher",
];

/** Quiz on the word-bank classes: words that belong to exactly one class. */
function bankClassQuiz(classes) {
  const parse = (s) =>
    s
      .split(",")
      .map((w) => w.replace(/\([^)]*\)/g, "").trim())
      .filter(Boolean);
  const lists = classes.map((c) => parse(c[2]));
  const count = new Map();
  lists.flat().forEach((w) => count.set(w, (count.get(w) ?? 0) + 1));
  const labels = classes.map((c) => `${c[1]} (${c[0]})`);
  const out = [];
  lists.forEach((ws, k) => {
    const unique = ws.filter((w) => count.get(w) === 1 && !DUAL.includes(w));
    shuffled(unique, rng(`bank-${k}`))
      .slice(0, 2)
      .forEach((w) => {
        out.push({
          type: "choice",
          title: "Wortbank sortieren",
          prompt: `Zu welcher Gruppe gehört „${w}“?`,
          options: labels.map((text, i) => ({ id: optionId(i), text })),
          correctOptionId: optionId(k),
          explanation: `**${classes[k][1]}** (*${classes[k][0]}*): ${classes[k][2]}`,
        });
      });
  });
  return shuffled(out, rng("bank-order"));
}

export function build() {
  const sim1 = data("sim1");
  const sim2 = data("sim2");
  const t = data("bausteine_trainer");
  const units = [];

  // u45 · overview + diagnosis
  const u45 = "tb1-u45";
  const l45 = [
    mkLesson(
      u45,
      1,
      "format-und-radar",
      "Format and gap types",
      [formatCard, ...radarCards(t.radar)],
      "30 points: 20 gaps in two parts.",
    ),
    mkLesson(
      u45,
      2,
      "diagnose",
      "Diagnosis: one gap of each type",
      [
        explain(
          "Diagnosis",
          `${t.diag.length} gaps, one of each type. The feedback names the type of each gap; practise the types you miss in the gap-type drills.`,
        ),
        ...t.diag.map((it) => drillChoice(it, it.ch)),
      ],
      "One item per gap type: find your weak spots.",
    ),
  ];
  units.push(
    unit({
      id: u45,
      title: "Language elements (Sprachbausteine) · Overview",
      description: "Exam format, the gap radar and a diagnosis test.",
      level: "B1",
      lessons: l45,
    }),
  );

  // u46 · Teil 1
  const u46 = "tb1-u46";
  const l46 = [
    mkLesson(
      u46,
      1,
      "teil1-brief",
      "Part 1: a letter with 10 gaps",
      [
        explain(
          "Teil 1 · Brief mit Lücken",
          `*${htmlToPlain(sim1.intro)}*\n\nYou see the whole letter for every gap; the current gap is **bold**. Look at the verb position and the salutation (*Liebe Sandra* → du) before you choose.`,
        ),
        ...sb1Exercises(sim1, { number: (n) => `Lücke ${n}` }),
      ],
      "Three options per gap: a, b or c.",
    ),
  ];
  units.push(
    unit({
      id: u46,
      title: "Sprachbausteine · Part 1 · Letter with gaps",
      description: "Teil 1: 10 gaps, a, b or c (tasks 21–30).",
      level: "B1",
      lessons: l46,
    }),
  );

  // u47 · Teil 2
  const u47 = "tb1-u47";
  const l47 = [
    mkLesson(
      u47,
      1,
      "teil2-wortbank",
      "Part 2: word bank",
      [sb2IntroCard(sim2), ...sb2Exercises(sim2)],
      "Each word fits only once. Five words stay unused.",
    ),
  ];
  units.push(
    unit({
      id: u47,
      title: "Sprachbausteine · Part 2 · Word bank",
      description: "Teil 2: 10 gaps, 15 words (tasks 31–40).",
      level: "B1",
      lessons: l47,
    }),
  );

  // u48 · drills
  const u48 = "tb1-u48";
  const l48 = t.drills.map((d, k) =>
    mkLesson(
      u48,
      k + 1,
      `${d.id}-${d.te}`,
      `${htmlToPlain(d.te)} (${htmlToPlain(d.t)})`,
      [
        explain(
          htmlToPlain(d.te),
          `${htmlToRich(d.rulee)}\n\n## Auf Deutsch: ${htmlToPlain(d.t)}\n\n${htmlToRich(d.rule)}`,
        ),
        ...d.items.map((it) => drillChoice(it, d.ch)),
      ],
      `Gap type: ${CHAPTER_TITLES[d.ch] ?? "Grammatik"}.`,
    ),
  );
  units.push(
    unit({
      id: u48,
      title: "Sprachbausteine · Gap-type drills",
      description: "One drill per gap type: rule card plus practice gaps.",
      level: "B1",
      lessons: l48,
    }),
  );

  // u49 · twins + bank classes
  const u49 = "tb1-u49";
  const twinCard = explain(
    "Evil twins (Böse Zwillinge) in Part 2",
    [
      "In the word bank the traps come in pairs that look alike but work differently:",
      t.twins.map((tw) => `- **${htmlToPlain(tw[0])}**: ${htmlToRich(tw[2])}`).join("\n"),
      "## Auf Deutsch",
      t.twins.map((tw) => `- **${htmlToPlain(tw[0])}**: ${htmlToRich(tw[1])}`).join("\n"),
    ].join("\n\n"),
  );
  const classCard = explain(
    "Sort the word bank (Wortbank sortieren)",
    [
      "Before you fill any gap, sort the 15 words into classes. The class tells you what has to follow the gap:",
      t.bankclasses.map((b) => `- **${b[1]}** (*${b[0]}*): ${b[2]}`).join("\n"),
    ].join("\n\n"),
  );
  const l49 = [
    mkLesson(
      u49,
      1,
      "zwillinge-und-wortbank",
      "Evil twins and word classes",
      [twinCard, classCard, ...bankClassQuiz(t.bankclasses)],
      "Sort the bank first: the class decides what follows the gap.",
    ),
  ];
  units.push(
    unit({
      id: u49,
      title: "Sprachbausteine · Evil twins and word bank",
      description: "Look-alike pairs and the word classes of the bank.",
      level: "B1",
      lessons: l49,
    }),
  );

  // ---- coverage
  const text = allText(units.flatMap((u) => u.lessons));
  const gaps = (items, opt) =>
    items.flatMap((it) => [...opt(it), htmlToRich(it.w), htmlToRich(it.we)]);
  const report = [
    covered("sim1.text", gapFragments(sim1.text), text),
    covered(
      "sim1.items",
      gaps(sim1.items, (it) => it.o.map(htmlToPlain)),
      text,
    ),
    covered("sim2.text", gapFragments(sim2.text), text),
    covered("sim2.ad", sim2.ad.map(htmlToRich), text),
    covered(
      "sim2.bank",
      sim2.bank.map((w) => w.toLowerCase()),
      text,
    ),
    covered(
      "sim2.items",
      gaps(sim2.items, (it) => [sim2.bank[it.a].toLowerCase()]),
      text,
    ),
    covered(
      "radar",
      t.radar.flatMap((r) => [htmlToPlain(r[0]), htmlToRich(r[1]), htmlToRich(r[2])]),
      text,
    ),
    covered(
      "diag",
      gaps(t.diag, (it) => [htmlToPlain(it.q), ...it.o.map(htmlToPlain)]),
      text,
    ),
    covered(
      "drills.rule",
      t.drills.flatMap((d) => [
        htmlToRich(d.rule),
        htmlToRich(d.rulee),
        htmlToPlain(d.t),
        htmlToPlain(d.te),
      ]),
      text,
    ),
    covered(
      "drills.items",
      t.drills.flatMap((d) => gaps(d.items, (it) => [htmlToPlain(it.q), ...it.o.map(htmlToPlain)])),
      text,
    ),
    covered(
      "twins",
      t.twins.flatMap((tw) => [htmlToPlain(tw[0]), htmlToRich(tw[1]), htmlToRich(tw[2])]),
      text,
    ),
    covered(
      "bankclasses",
      t.bankclasses.flatMap((b) => [...b]),
      text,
    ),
  ];
  console.log(`bausteine coverage · ${report.join(" · ")}`);
  return units;
}
