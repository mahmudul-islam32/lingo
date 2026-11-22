/**
 * telc B1 Hörverstehen (hoer.json; app logic sessions/Hoeren.jsx, screens/hubs.jsx
 * HoerenHub). Units tb1-u50 … tb1-u54: trap catalogue, numbers & times, Teil 1–3.
 * Transcripts are read by German TTS (`listening` type); richtig/falsch = 2 options.
 */
import { chunk, data, htmlToPlain, htmlToRich, optionId, rng, shuffled, unit } from "../lib.mjs";
import {
  allText,
  covered,
  explain,
  hoerenInterview,
  hoerenStatements,
  mkLesson,
  rfListening,
  splitDialog,
} from "./_exam-util.mjs";

export const TIP_DE =
  "**Tipp:** Aufgabe verpasst? Loslassen und sofort auf die nächste schauen. Wer im Kopf übersetzt, verpasst zwei weitere. Nie ein Feld leer lassen.";

const overviewCard = explain(
  "Listening (Hörverstehen): the exam part",
  [
    "Listening is worth **75 points** and takes 30 minutes (tasks 41–60). Every item is *richtig* or *falsch*.",
    "- **Teil 1 · Globalverstehen** (41–45, 25 P): 5 short messages and announcements. **Each text is played only once.** 5 points each.\n- **Teil 2 · Interview** (46–55, 25 P): one conversation, 10 statements. Played **twice**. 2.5 points each.\n- **Teil 3 · Durchsagen** (56–60, 25 P): 5 public announcements, each played **twice**. 5 points each.",
    "Read the statements before you listen. In this app you can replay the audio, but try to answer after one listen (Teil 1) or two (Teil 2 and 3), as in the exam.",
    TIP_DE,
    "*Missed an item? Let it go and look at the next one at once. If you translate in your head you miss two more. Never leave a box empty.*",
  ].join("\n\n"),
);

// ---------------------------------------------------------------- Zahlen & Uhrzeiten

const category = (hint) =>
  /Preis/.test(hint) ? "price" : /Uhrzeit/.test(hint) ? "time" : "number";
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\s|uhr|€|euro/g, "")
    .replace(/\./g, ":");

/** Typical mishearing for an item (the trap the app's hint warns about). */
function trapOf(it) {
  const c = category(it.hint);
  if (c === "time") {
    const [h, m] = it.ans.split(":").map(Number);
    if (/halb|vor/.test(it.speak) && h < 23) return `${h + 1}:${String(m).padStart(2, "0")}`;
    return null;
  }
  if (c === "price") {
    const [e, ct] = it.ans.split(",");
    return e.length === 2 && e[0] !== e[1] ? `${e[1]}${e[0]},${ct}` : null;
  }
  const n = Number(it.ans);
  if (n >= 13 && n <= 19) return String((n - 10) * 10); // sechzehn ≠ sechzig
  if (n >= 20 && n < 100 && n % 10 === 0) return String(n / 10 + 10); // sechzig ≠ sechzehn
  if (n > 20 && n < 100 && n % 11 !== 0) return `${it.ans[1]}${it.ans[0]}`; // Einer vor Zehner
  return null;
}

function zeitExercise(it, i, all) {
  const random = rng(`zeit-${i}`);
  const accepted = new Set([it.ans, ...it.alts].map(norm));
  const ok = (s) => s && !accepted.has(norm(s));
  const pool = [
    trapOf(it),
    ...shuffled(
      all.filter((o) => o !== it && category(o.hint) === category(it.hint)).map((o) => o.ans),
      random,
    ),
  ];
  const distract = [];
  for (const d of pool) if (ok(d) && !distract.includes(d) && distract.length < 3) distract.push(d);
  const options = [...distract];
  options.splice((i * 3 + 2) % (distract.length + 1), 0, it.ans); // balanced answer positions
  return {
    type: "listening",
    title: `Zahlen & Uhrzeiten · ${htmlToPlain(it.hint)}`,
    transcript: it.speak,
    prompt: "Hör zu: Welche Zahl oder Uhrzeit hörst du?",
    options: options.map((text, k) => ({ id: optionId(k), text })),
    correctOptionId: optionId(options.indexOf(it.ans)),
    explanation: `Gesprochen: „${it.speak}“ = **${it.ans}**${it.alts.length ? `\n\nAlso written: ${it.alts.join(", ")}` : ""}\n\n*Hinweis:* ${htmlToPlain(it.hint)}`,
  };
}

const zeitCard = explain(
  "Numbers and times: the classic traps",
  [
    "Many listening items hinge on a time, a number or a price. Practise hearing them exactly:",
    "- **halb neun** = 8:30 (half *to* nine), not 9:30.\n- **Viertel vor sechs** = 5:45 · **Viertel nach acht** = 8:15 · **zwanzig vor drei** = 2:40.\n- **einundvierzig** = 41: the ones come before the tens.\n- **sechzehn** (16) vs. **sechzig** (60), **siebzehn** (17) vs. **siebzig** (70), **dreizehn** (13) vs. **dreißig** (30).\n- Prices: **neunzehn Euro neunzig** = 19,90 €.",
  ].join("\n\n"),
);

// ---------------------------------------------------------------- build

export function build() {
  const h = data("hoer");
  const units = [];

  // u50 · overview + trap catalogue (3 traps per lesson)
  const u50 = "tb1-u50";
  const trapLessons = chunk(h.traps, 3).map((traps, k) => {
    const ex = [];
    if (k === 0) ex.push(overviewCard);
    for (const tr of traps) {
      const n = h.traps.indexOf(tr) + 1;
      ex.push(
        explain(
          `Trap ${n}: ${htmlToPlain(tr.name)}`,
          `${htmlToRich(tr.en)}\n\n*Auf Deutsch:* ${htmlToRich(tr.de)}`,
        ),
      );
      tr.drills.forEach((d, i) =>
        ex.push(
          rfListening({
            title: `Falle ${n} · Beispiel ${i + 1}`,
            transcript: htmlToPlain(d.a),
            statement: d.s,
            rf: d.rf,
            w: d.w,
          }),
        ),
      );
    }
    const names = traps.map((t) => htmlToPlain(t.name).replace(/\s*\(.*\)/, "")).join(", ");
    return mkLesson(
      u50,
      k + 1,
      `fallen-${k + 1}`,
      `Listening traps ${k + 1}: ${names}`,
      ex,
      "Listen, then decide: richtig or falsch?",
    );
  });
  units.push(
    unit({
      id: u50,
      title: "Listening (Hören) · Trap catalogue",
      description: "Fallen-Katalog: the nine traps of the listening part.",
      level: "B1",
      lessons: trapLessons,
    }),
  );

  // u51 · numbers & times
  const u51 = "tb1-u51";
  const l51 = chunk(h.zeit, 10).map((items, k) =>
    mkLesson(
      u51,
      k + 1,
      `zahlen-uhrzeiten-${k + 1}`,
      `Numbers and times ${k + 1}`,
      [
        ...(k === 0 ? [zeitCard] : []),
        ...items.map((it) => zeitExercise(it, h.zeit.indexOf(it), h.zeit)),
      ],
      "halb neun = 8:30. The ones come before the tens.",
    ),
  );
  units.push(
    unit({
      id: u51,
      title: "Listening (Hören) · Numbers and times",
      description: "Zahlen & Uhrzeiten: hear times, numbers and prices exactly.",
      level: "B1",
      lessons: l51,
    }),
  );

  // u52 · Teil 1
  const u52 = "tb1-u52";
  const t1Card = explain(
    "Teil 1 · Globalverstehen",
    "**5 short texts (messages, announcements), each played only once.** Read the statement first, then listen for the one detail it checks: confirmed or cancelled, which platform, which day, what time.\n\nThe right answer is often a paraphrase (*zusätzliche Kasse* = *an Kasse vier ist jetzt auch geöffnet*).",
  );
  const l52 = h.t1.map((set, k) =>
    mkLesson(
      u52,
      k + 1,
      `teil1-${set.theme}`,
      `Part 1 · ${set.theme}`,
      [t1Card, ...hoerenStatements(set, 1)],
      "Each text runs only once in the exam.",
    ),
  );
  units.push(
    unit({
      id: u52,
      title: "Listening (Hören) · Part 1 · Short texts",
      description: "Globalverstehen: 5 texts, played once, richtig or falsch (41–45).",
      level: "B1",
      lessons: l52,
    }),
  );

  // u53 · Teil 2
  const u53 = "tb1-u53";
  const l53 = h.t2.map((set, k) =>
    mkLesson(
      u53,
      k + 1,
      `teil2-${set.theme}`,
      `Part 2 · Interview: ${set.theme}`,
      [
        explain(
          `Teil 2 · Interview: ${set.theme}`,
          `**One interview, ${set.stmts.length} statements, played twice.** Read all statements first; they follow the order of the conversation.\n\nWatch for corrections (*nicht … sondern*), plans that did not happen, and changes of opinion over time (*am Anfang … aber inzwischen*).`,
        ),
        ...hoerenInterview(set),
      ],
      "Read all statements first. You hear the interview twice.",
    ),
  );
  units.push(
    unit({
      id: u53,
      title: "Listening (Hören) · Part 2 · Interview",
      description: "One interview, 10 statements, played twice (46–55).",
      level: "B1",
      lessons: l53,
    }),
  );

  // u54 · Teil 3
  const u54 = "tb1-u54";
  const t3Card = explain(
    "Teil 3 · Durchsagen",
    "**5 public announcements (station, shop, museum), each played twice.** Listen for restrictions (*nur bis zum Marktplatz*), closures (*am Montag geschlossen*) and paraphrases (*außer Betrieb* = *funktioniert nicht*).",
  );
  const l54 = h.t3.map((set, k) =>
    mkLesson(
      u54,
      k + 1,
      `teil3-${set.theme}`,
      `Part 3 · ${set.theme}`,
      [t3Card, ...hoerenStatements(set, 3)],
      "Each announcement runs twice in the exam.",
    ),
  );
  units.push(
    unit({
      id: u54,
      title: "Listening (Hören) · Part 3 · Announcements",
      description: "Durchsagen: 5 announcements, played twice (56–60).",
      level: "B1",
      lessons: l54,
    }),
  );

  // ---- coverage
  const text = allText(units.flatMap((u) => u.lessons));
  const stmt = (x) => [htmlToPlain(x.s), htmlToRich(x.w)];
  const report = [
    covered(
      "traps",
      h.traps.flatMap((t) => [htmlToPlain(t.name), htmlToRich(t.de), htmlToRich(t.en)]),
      text,
    ),
    covered(
      "traps.drills",
      h.traps.flatMap((t) => t.drills.flatMap((d) => [htmlToPlain(d.a), ...stmt(d)])),
      text,
    ),
    covered(
      "zeit",
      h.zeit.flatMap((z) => [z.speak, z.ans, ...z.alts, htmlToPlain(z.hint)]),
      text,
    ),
    covered(
      "t1",
      h.t1.flatMap((s) => s.items.flatMap((x) => [htmlToPlain(x.a), ...stmt(x)])),
      text,
    ),
    covered(
      "t2.script",
      h.t2.map((s) => splitDialog(s.script)),
      text,
    ),
    covered(
      "t2.stmts",
      h.t2.flatMap((s) => s.stmts.flatMap(stmt)),
      text,
    ),
    covered(
      "t3",
      h.t3.flatMap((s) => s.items.flatMap((x) => [htmlToPlain(x.a), ...stmt(x)])),
      text,
    ),
  ];
  console.log(`listening coverage · ${report.join(" · ")}`);
  return units;
}
