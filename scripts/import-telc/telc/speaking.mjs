/**
 * telc B1 Speaking (Sprechen), units tb1-u65 … tb1-u74. Source: sprechen.json
 * (meta.quelle/ablauf/hinweise, t1.stich + t1.red, t2.red + t2.themen, t3.red + t3.faelle).
 * Logic mirrors sessions/Sprechen.jsx (Teil 1–3 with 3/6/6-minute timers, cards A/B,
 * case + Stichpunkte, Redemittel list, self-check hint) and the Ablauf sheet in hubs.jsx.
 * The source has no model answers for speaking: every modelAnswer is a structure built
 * from the source Redemittel (and the cards), labelled as such.
 */
import { chunk, data, htmlToPlain, htmlToRich, lesson, unit } from "../lib.mjs";
import {
  COURSE,
  choiceEx,
  coverage,
  explainEx,
  listenEx,
  phraseDrills,
  sentences,
  taskEx,
} from "./_ws-util.mjs";

const pad = (n) => String(n).padStart(2, "0");

/** English versions of meta.ablauf[].txt and meta.hinweise (same order; checked below). */
const ABLAUF_EN = [
  "You get all task sheets and may take notes on stamped paper. No dictionaries, no phones. Candidates don't talk to each other during the preparation. You may not write anything on the task sheets themselves.",
  "You introduce yourselves and ask each other questions. The key words on the sheet are only a guide. Talk to your partner, not to the examiners.",
  "You and your partner have different opinion cards on the same topic. First you tell each other what is on your card. Then you talk about the topic, give your own opinion and talk about your own experiences.",
  "You organise something together: a party, an outing, an event. Make suggestions, react to the other person's suggestions, decide who takes on which task, and agree at the end.",
];
const HINWEISE_EN = [
  "The exam is a paired exam and takes about 15 minutes in total.",
  "Two examiners are in the room: one leads the conversation (interlocutor), the other only assesses (assessor).",
  "You are assessed on three criteria: expression, task completion and formal accuracy, plus pronunciation and intonation.",
  "Asking questions and helping your partner is rated positively. A lively conversation counts more than a perfect monologue.",
  "Don't read out your notes; just glance at them.",
  "Look at your partner while speaking, not at the examiners.",
];
/** Sprechen.jsx INFO (part title, hint) and timer length. */
const INFO = {
  1: ["Kontaktaufnahme", "Stellt euch gegenseitig vor. Ca. 3 Minuten, zu zweit.", "3:00"],
  2: [
    "Gespräch über ein Thema",
    "Gib die Meinung auf deiner Karte wieder, dann sag deine eigene. Ca. 6 Minuten.",
    "6:00",
  ],
  3: [
    "Gemeinsam etwas planen",
    "Macht Vorschläge, reagiert aufeinander, einigt euch. Ca. 6 Minuten.",
    "6:00",
  ],
};
const SELF_CHECK = "Hör dich an: Verb an Position 2? Ein „weil“? Rückfragen?";

/** Category per Redemittel section: distractors only come from another category. */
const CAT = {
  "Über sich sprechen": "self",
  "Von eigenen Erfahrungen erzählen": "self",
  "Die Meinung auf der Karte wiedergeben": "report",
  "Fragen an die Partnerin / den Partner": "talk",
  "Die eigene Meinung sagen": "talk",
  "Nachfragen und reagieren": "talk",
  "Etwas vorschlagen": "talk",
  Zustimmen: "talk",
  "Zweifeln / einschränken": "talk",
  "Ablehnen und Alternative anbieten": "talk",
  "Aufgaben verteilen": "talk",
  "Zum Ergebnis kommen": "talk",
};

/** Teil 1: Stichpunkt index → [Über-sich item indexes, Fragen item indexes]. */
const T1_MAP = [
  [[0], [0]],
  [[1], [0]],
  [[1], [1]],
  [[2], [0]],
  [[], [5]],
  [[3], [3]],
  [[], [0]],
  [[4], [2]],
  [[5], [4]],
  [[], [0]],
  [[6], [0]],
  [[], [0]],
  [[], [0]],
  [[5], [4]],
  [[], [0]],
];

export function build() {
  const sp = data("sprechen");
  const { meta, t1, t2, t3 } = sp;
  if (meta.ablauf.length !== ABLAUF_EN.length || meta.hinweise.length !== HINWEISE_EN.length)
    throw new Error("ablauf/hinweise count changed");
  if (t1.stich.length !== T1_MAP.length) throw new Error("t1.stich count changed");
  const allSecs = [...t1.red, ...t2.red, ...t3.red];
  for (const s of allSecs) if (!CAT[s.sec]) throw new Error(`no category for ${s.sec}`);
  const pool = allSecs.map((s) => ({ ...s, cat: CAT[s.sec] }));
  const withCat = (secs) => secs.map((s) => ({ ...s, cat: CAT[s.sec] }));

  const bundles = [];
  const mk = (unitId, n, s, title, exercises, tip) =>
    lesson({ id: `${unitId}-l${pad(n)}-${s}`, courseId: COURSE, unitId, title, tip, exercises });
  const redCard = (s, part) =>
    explainEx({
      title: `Redemittel Teil ${part}: ${s.sec}`,
      body: s.items.map((it) => `- **${it.de}**: ${it.en}`).join("\n"),
      examples: s.items.map((it) => ({ learning: it.de, known: it.en })),
    });
  /** Drills for a part: function choices and meaning choices kept apart for distribution. */
  const drillsFor = (secs, seed) => {
    const all = phraseDrills(withCat(secs), pool, seed);
    return {
      fn: all.filter((e) => e.prompt.startsWith("Welcher Satz")),
      mean: all.filter((e) => !e.prompt.startsWith("Welcher Satz")),
    };
  };
  /** Complete phrases (no "…") for dictation. */
  const complete = (secs) =>
    secs.flatMap((s) => s.items.map((it) => it.de)).filter((d) => !d.includes("…"));
  const ablaufStep = (i) => `**${meta.ablauf[i].t}** (${meta.ablauf[i].z})\n${meta.ablauf[i].txt}`;
  const labelNote =
    "*The source has no model answer for this task. This is a suggested structure built from the Redemittel of the source, not an official model answer.*";

  // ======================= u65: the oral exam =======================
  {
    const U = "tb1-u65";
    const hin = meta.hinweise.map(htmlToPlain);
    const ex1 = [
      explainEx({
        title: "The oral exam (Mündliche Prüfung)",
        body: `${meta.ablauf.map((a, i) => `## ${a.t} · ${a.z}\n${a.txt}\n\n*${ABLAUF_EN[i]}*`).join("\n\n")}\n\n*${meta.quelle}*`,
      }),
      explainEx({
        title: "The three parts at a glance",
        body:
          [1, 2, 3]
            .map((p) => `- **Teil ${p} · ${INFO[p][0]}** (timer ${INFO[p][2]}): ${INFO[p][1]}`)
            .join("\n") +
          "\n\nPart 1: *contact* (introduce yourselves, about 3 minutes). Part 2: *conversation about a topic*: report the opinion on your card, then give your own (about 6 minutes). Part 3: *planning together*: make suggestions, react to each other, agree (about 6 minutes).",
      }),
      choiceEx({
        prompt: "Wie lange dauert die Vorbereitung?",
        correct: meta.ablauf[0].z,
        distractors: [meta.ablauf[1].z, meta.ablauf[2].z],
        explanation: ablaufStep(0),
        seed: "s-a1",
      }),
      choiceEx({
        prompt: "Was ist in der Vorbereitung NICHT erlaubt?",
        correct: "Wörterbücher und Handys",
        distractors: ["Notizen auf gestempeltem Papier", "Alle Aufgabenblätter ansehen"],
        explanation: ablaufStep(0),
        seed: "s-a2",
      }),
      choiceEx({
        prompt: "Mit wem sprechen Sie in Teil 1?",
        correct: "Mit der Partnerin / dem Partner",
        distractors: ["Mit den Prüfenden", "Mit niemandem, es ist ein Monolog"],
        explanation: ablaufStep(1),
        seed: "s-a3",
      }),
      choiceEx({
        prompt: "Was machen Sie zuerst in Teil 2?",
        correct: "Wir berichten einander, was auf unserer Karte steht.",
        distractors: ["Wir planen zusammen eine Feier.", "Wir stellen uns gegenseitig vor."],
        explanation: ablaufStep(2),
        seed: "s-a4",
      }),
      choiceEx({
        prompt: "Was muss am Ende von Teil 3 passieren?",
        correct: "Wir einigen uns.",
        distractors: [
          "Wir lesen unsere Notizen vor.",
          "Wir berichten, was auf unserer Karte steht.",
        ],
        explanation: ablaufStep(3),
        seed: "s-a5",
      }),
      choiceEx({
        prompt: "Welcher Teil heißt „Über ein Thema sprechen“?",
        correct: "Teil 2",
        distractors: ["Teil 1", "Teil 3"],
        explanation: meta.ablauf.map((a) => a.t).join(" · "),
        seed: "s-a6",
      }),
    ];
    const ex2 = [
      explainEx({
        title: "Tips for the oral exam (Hinweise)",
        body:
          meta.hinweise.map((h, i) => `- ${htmlToRich(h)} (*${HINWEISE_EN[i]}*)`).join("\n") +
          `\n\n## Check your recording\n${SELF_CHECK}\n*Listen to yourself: verb in position 2? A „weil“? Follow-up questions?*`,
      }),
      choiceEx({
        prompt: "Wie lange dauert die Paarprüfung insgesamt?",
        correct: "ca. 15 Minuten",
        distractors: ["ca. 3 Minuten", "ca. 30 Minuten", "20 Minuten"],
        explanation: hin[0],
        seed: "s-h1",
      }),
      choiceEx({
        prompt: "Was macht der Assessor?",
        correct: "Er bewertet nur.",
        distractors: ["Er leitet das Gespräch.", "Er spricht mit Ihnen über das Thema."],
        explanation: hin[1],
        seed: "s-h2",
      }),
      choiceEx({
        prompt: "Was wird NICHT als Kriterium genannt?",
        correct: "Wortanzahl",
        distractors: ["Ausdrucksfähigkeit", "Aufgabenbewältigung", "Formale Richtigkeit"],
        explanation: hin[2],
        seed: "s-h3",
      }),
      choiceEx({
        prompt: "Was wird positiv bewertet?",
        correct: "Nachfragen und dem Partner helfen",
        distractors: ["Ein perfekter Monolog", "Die Notizen genau ablesen"],
        explanation: hin[3],
        seed: "s-h4",
      }),
      choiceEx({
        prompt: "Wie benutzen Sie Ihre Notizen?",
        correct: "Nur kurz hinschauen",
        distractors: ["Vorlesen", "Den Prüfenden zeigen"],
        explanation: hin[4],
        seed: "s-h5",
      }),
      choiceEx({
        prompt: "Wen sehen Sie beim Sprechen an?",
        correct: "Die Partnerin / den Partner",
        distractors: ["Die Prüfenden", "Das Aufgabenblatt"],
        explanation: hin[5],
        seed: "s-h6",
      }),
    ];
    bundles.push(
      unit({
        id: U,
        title: "Speaking (Sprechen) · The oral exam",
        description: "Preparation, the three parts, how you are assessed and tips.",
        level: "B1",
        lessons: [
          mk(
            U,
            1,
            "oral-exam-parts",
            "The oral exam: preparation and three parts",
            ex1,
            "20 minutes preparation, then Teil 1 (3 min), Teil 2 (6 min), Teil 3 (6 min).",
          ),
          mk(
            U,
            2,
            "oral-exam-tips",
            "Assessment and tips (Hinweise)",
            ex2,
            "Talk to your partner, ask questions, help each other.",
          ),
        ],
      }),
    );
  }

  // ======================= u66: Teil 1 =======================
  {
    const U = "tb1-u66";
    const d = drillsFor(t1.red, "s-t1");
    const ex1 = [
      explainEx({
        title: `Teil 1 · ${INFO[1][0]}`,
        body: `${ablaufStep(1)}\n\n*${ABLAUF_EN[1]}*\n\n## Stichpunkte\n${t1.stich.map((s) => `- ${s}`).join("\n")}`,
      }),
      ...t1.red.map((s) => redCard(s, 1)),
      ...d.fn,
      ...d.mean.slice(0, 8),
    ];
    const rest = d.mean.slice(8);
    const listens = complete(t1.red).map((p, i) =>
      listenEx({
        answer: p,
        pool: complete(t1.red).filter((x) => x !== p),
        seed: `s-t1l${i}`,
        src: `s-t1-${i}`,
      }),
    );
    const self = t1.red[0].items;
    const ask = t1.red[1].items;
    const stichTask = (s, i) => {
      const [si, qi] = T1_MAP[i];
      const mine = si.map((k) => self[k].de);
      const qs = [...new Set([...qi.map((k) => ask[k].de), ask[0].de])];
      return taskEx({
        skill: "speaking",
        title: `Teil 1 · ${s}`,
        task: `**Teil 1: ${INFO[1][0]}**\n${meta.ablauf[1].txt}\n\nTalk with your partner about this key word: **${s}**. Say something about yourself, then ask your partner.`,
        points: [
          `Say something about yourself: ${s}`,
          "Ask your partner the same",
          "React and ask a follow-up question",
        ],
        phrases: t1.red.flatMap((x) => x.items.map((it) => it.de)),
        modelAnswer: `${labelNote}\n\n## 1. About you (${t1.red[0].sec})\n${mine.length ? mine.map((m) => `- ${m}`).join("\n") : `- Say one or two sentences about „${s}“ in your own words.`}\n\n## 2. Ask your partner (${t1.red[1].sec})\n${qs.map((q) => `- ${q}`).join("\n")}\n\n## 3. React\n- ${ask[6].de}`,
      });
    };
    const groups = chunk(
      t1.stich.map((s, i) => [s, i]),
      8,
    );
    const lessons = [
      mk(
        U,
        1,
        "teil1-redemittel",
        "Teil 1 · Redemittel: introducing yourself",
        ex1,
        "Talk to your partner, not to the examiners.",
      ),
    ];
    groups.forEach((g, gi) => {
      const ex = g.map(([s, i]) => stichTask(s, i));
      const half = Math.ceil(rest.length / groups.length);
      ex.push(...rest.slice(gi * half, (gi + 1) * half));
      const lh = Math.ceil(listens.length / groups.length);
      ex.push(...listens.slice(gi * lh, (gi + 1) * lh));
      if (gi === groups.length - 1) {
        ex.push(
          taskEx({
            skill: "speaking",
            title: "Teil 1 · Das ganze Gespräch (ca. 3 Minuten)",
            task: `**Teil 1: ${meta.ablauf[1].t}** (${meta.ablauf[1].z})\n${meta.ablauf[1].txt}\n\n${INFO[1][1]}\n\nUse the key words as a guide. Check afterwards: ${SELF_CHECK}`,
            points: t1.stich.slice(0, 12),
            phrases: t1.red.flatMap((x) => x.items.map((it) => it.de)),
            modelAnswer: `${labelNote}\n\nAll key words: ${t1.stich.join(" · ")}\n\n${t1.red.map((x) => `## ${x.sec}\n${x.items.map((it) => `- ${it.de} (${it.en})`).join("\n")}`).join("\n\n")}\n\nTake turns: one sentence about yourself, then a question to your partner (*Und du? Wie ist das bei dir?*), then react.`,
          }),
        );
      }
      lessons.push(
        mk(
          U,
          gi + 2,
          `teil1-stichpunkte-${gi + 1}`,
          `Teil 1 · Key words ${gi + 1}: ${g.map(([s]) => s).join(", ")}`,
          ex,
        ),
      );
    });
    bundles.push(
      unit({
        id: U,
        title: "Speaking (Sprechen) · Part 1: Getting to know each other",
        description: "Introduce yourself and ask your partner: Redemittel and all 15 key words.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= u67–u69: Teil 2 =======================
  {
    const d = drillsFor(t2.red, "s-t2");
    const intro = [
      explainEx({
        title: `Teil 2 · ${INFO[2][0]}`,
        body: `${ablaufStep(2)}\n\n*${ABLAUF_EN[2]}*\n\n${INFO[2][1]}`,
      }),
      ...t2.red.map((s) => redCard(s, 2)),
      ...d.fn,
      ...d.mean.slice(0, 8),
    ];
    const rest = d.mean.slice(8);
    const t2Phrases = t2.red.flatMap((x) => x.items.map((it) => it.de));
    const red = Object.fromEntries(t2.red.map((x) => [x.sec, x.items.map((it) => it.de)]));
    const card = (tag, p) => `## Karte ${tag}\n${p.name}, ${p.alter}, ${p.beruf}:\n„${p.text}“`;
    const themaTask = (t) =>
      taskEx({
        skill: "speaking",
        title: `Teil 2 · ${t.thema}`,
        task: `**${meta.ablauf[2].t}**\n${meta.ablauf[2].txt}\n\n**Thema: ${t.thema}** (${t.bereich})\n\n${card("A", t.a)}\n\n${card("B", t.b)}\n\nYou have card A, your partner has card B. (Practise both roles.)`,
        points: [
          `Report what is on your card (${t.a.name})`,
          "Give your own opinion with a reason",
          "Tell about your own experience",
          "Ask your partner and react",
        ],
        phrases: t2Phrases,
        modelAnswer: `${labelNote}\n\n## 1. Report your card (${t2.red[0].sec})\nAuf meiner Karte spricht ${t.a.name} über das Thema „${t.thema}“. ${t.a.name} sagt: „${t.a.text}“\n\nYour partner: Auf meiner Karte spricht ${t.b.name} über das Thema „${t.thema}“. ${t.b.name} sagt: „${t.b.text}“\n\n## 2. Your opinion (${t2.red[1].sec})\n${red[t2.red[1].sec].map((x) => `- ${x}`).join("\n")}\n\n## 3. Your experience (${t2.red[2].sec})\n${red[t2.red[2].sec].map((x) => `- ${x}`).join("\n")}\n\n## 4. Ask and react (${t2.red[3].sec})\n${red[t2.red[3].sec].map((x) => `- ${x}`).join("\n")}`,
      });
    const whoSays = (t, i) => {
      const fromA = i % 2 === 0;
      const p = fromA ? t.a : t.b;
      const s = sentences(p.text)[0];
      return choiceEx({
        title: t.thema,
        passage: `„${s}“`,
        prompt: "Wer sagt das?",
        correct: `${p.name} (Karte ${fromA ? "A" : "B"})`,
        distractors: [`${(fromA ? t.b : t.a).name} (Karte ${fromA ? "B" : "A"})`],
        explanation: `**${t.a.name}** (A): ${t.a.text}\n\n**${t.b.name}** (B): ${t.b.text}`,
        seed: `s-w${t.id}`,
      });
    };
    const themeLessons = chunk(t2.themen, 5);
    const per = Math.ceil(rest.length / themeLessons.length);
    const lessonsOf = themeLessons.map((ts, gi) => {
      const ex = [];
      ts.forEach((t, i) => ex.push(whoSays(t, t.id + i), themaTask(t)));
      ex.push(...rest.slice(gi * per, (gi + 1) * per));
      return { ts, ex };
    });
    for (let u = 0; u < 3; u++) {
      const U = `tb1-u${67 + u}`;
      const lessons = [];
      if (u === 0)
        lessons.push(
          mk(
            U,
            1,
            "teil2-redemittel",
            "Teil 2 · Redemittel: talking about a topic",
            intro,
            "First report your card, then give your own opinion.",
          ),
        );
      for (const [k, { ts, ex }] of lessonsOf.slice(u * 2, u * 2 + 2).entries()) {
        lessons.push(
          mk(
            U,
            lessons.length + 1,
            `teil2-themen-${pad(ts[0].id)}-${pad(ts.at(-1).id)}`,
            `Teil 2 · Topics ${ts[0].id}–${ts.at(-1).id}: ${ts.map((t) => t.thema).join(", ")}`.slice(
              0,
              280,
            ),
            ex,
          ),
        );
        void k;
      }
      const ids = lessonsOf.slice(u * 2, u * 2 + 2).flatMap((l) => l.ts.map((t) => t.id));
      bundles.push(
        unit({
          id: U,
          title: `Speaking (Sprechen) · Part 2: Topics ${ids[0]}–${ids.at(-1)}`,
          description:
            "Report the opinion on your card, give your own and talk about your experience.",
          level: "B1",
          lessons,
        }),
      );
    }
  }

  // ======================= u70–u73: Teil 3 =======================
  {
    const d = drillsFor(t3.red, "s-t3");
    const t3Phrases = t3.red.flatMap((x) => x.items.map((it) => it.de));
    const listens = complete(t3.red).map((p, i) =>
      listenEx({
        answer: p,
        pool: complete(t3.red).filter((x) => x !== p),
        seed: `s-t3l${i}`,
        src: `s-t3-${i}`,
      }),
    );
    const halves = chunk(t3.red, 3);
    const U70 = "tb1-u70";
    const redLessons = halves.map((secs, gi) => {
      const fns = d.fn.filter((e) => secs.some((s) => e.title === s.sec));
      const ex = [
        ...(gi === 0
          ? [
              explainEx({
                title: `Teil 3 · ${INFO[3][0]}`,
                body: `${ablaufStep(3)}\n\n*${ABLAUF_EN[3]}*\n\n${INFO[3][1]}`,
              }),
            ]
          : []),
        ...secs.map((s) => redCard(s, 3)),
        ...fns,
        ...d.mean.slice(gi * 5, gi * 5 + 5),
      ];
      return mk(
        U70,
        gi + 1,
        `teil3-redemittel-${gi + 1}`,
        `Teil 3 · Redemittel ${gi + 1}: ${secs.map((s) => s.sec).join(", ")}`,
        ex,
        gi === 0 ? "Suggest, react, share tasks, agree." : undefined,
      );
    });
    bundles.push(
      unit({
        id: U70,
        title: "Speaking (Sprechen) · Part 3: Redemittel for planning",
        description: "Suggest, agree, doubt, reject, share tasks and agree on a result.",
        level: "B1",
        lessons: redLessons,
      }),
    );

    const rest = d.mean.slice(10);
    const red = Object.fromEntries(t3.red.map((x) => [x.sec, x.items.map((it) => it.de)]));
    const [sVor, sZu, sZw, sAb, sAuf, sErg] = t3.red.map((x) => x.sec);
    const fallTask = (f) =>
      taskEx({
        skill: "speaking",
        title: `Teil 3 · ${f.titel}`,
        task: `**${meta.ablauf[3].t}**\n${meta.ablauf[3].txt}\n\n**${f.titel}** (${f.bereich})\n\n${f.situation}\n\nTalk about all points, then agree on a plan.`,
        points: f.stich,
        phrases: t3Phrases,
        modelAnswer: `${labelNote}\n\n## 1. Make suggestions (${sVor})\nGo through the points one by one:\n${f.stich.map((s, i) => `- ${s}: ${red[sVor][i % red[sVor].length]}`).join("\n")}\n\n## 2. React to your partner\n**${sZu}:**\n${red[sZu].map((x) => `- ${x}`).join("\n")}\n**${sZw}:**\n${red[sZw].map((x) => `- ${x}`).join("\n")}\n**${sAb}:**\n${red[sAb].map((x) => `- ${x}`).join("\n")}\n\n## 3. Share the tasks (${sAuf})\n${red[sAuf].map((x) => `- ${x}`).join("\n")}\n\n## 4. Agree on the result (${sErg})\n${red[sErg].map((x) => `- ${x}`).join("\n")}`,
      });
    const fallLessons = chunk(t3.faelle, 5);
    const per = Math.ceil(rest.length / fallLessons.length);
    const lper = Math.ceil(listens.length / fallLessons.length);
    for (let u = 0; u < 3; u++) {
      const U = `tb1-u${71 + u}`;
      const lessons = fallLessons.slice(u * 2, u * 2 + 2).map((fs, k) => {
        const gi = u * 2 + k;
        const ex = fs.map(fallTask);
        ex.push(
          ...rest.slice(gi * per, (gi + 1) * per),
          ...listens.slice(gi * lper, (gi + 1) * lper),
        );
        return mk(
          U,
          k + 1,
          `teil3-faelle-${pad(fs[0].id)}-${pad(fs.at(-1).id)}`,
          `Teil 3 · Plans ${fs[0].id}–${fs.at(-1).id}: ${fs.map((f) => f.titel).join(", ")}`.slice(
            0,
            280,
          ),
          ex,
          "End with a clear result: Gut, dann machen wir es so.",
        );
      });
      const ids = fallLessons
        .slice(u * 2, u * 2 + 2)
        .flat()
        .map((f) => f.id);
      bundles.push(
        unit({
          id: U,
          title: `Speaking (Sprechen) · Part 3: Plans ${ids[0]}–${ids.at(-1)}`,
          description: "Plan something together: suggest, react, share tasks, agree.",
          level: "B1",
          lessons,
        }),
      );
    }

    // ======================= u74: simulation =======================
    const U = "tb1-u74";
    const sims = [0, 1, 2].map((k) => {
      const t = t2.themen[(k * 11 + 4) % t2.themen.length];
      const f = t3.faelle[(k * 13 + 7) % t3.faelle.length];
      const ex = [
        explainEx({
          title: "Oral exam simulation",
          body: `Do all three parts in a row, like on exam day (about 15 minutes after 20 minutes of preparation).\n\n${meta.ablauf.map((a) => `- **${a.t}** (${a.z})`).join("\n")}\n\n${HINWEISE_EN.slice(
            3,
          )
            .map((h) => `- ${h}`)
            .join("\n")}`,
        }),
        taskEx({
          skill: "speaking",
          title: `Simulation ${k + 1} · Teil 1`,
          task: `**${meta.ablauf[1].t}** (${meta.ablauf[1].z})\n${meta.ablauf[1].txt}`,
          points: t1.stich.slice(k * 5, k * 5 + 5),
          phrases: t1.red.flatMap((x) => x.items.map((it) => it.de)),
          modelAnswer: `${labelNote}\n\n${t1.red.map((x) => `## ${x.sec}\n${x.items.map((it) => `- ${it.de}`).join("\n")}`).join("\n\n")}`,
        }),
        { ...themaTaskFor(t), title: `Simulation ${k + 1} · Teil 2: ${t.thema}` },
        { ...fallTask(f), title: `Simulation ${k + 1} · Teil 3: ${f.titel}` },
        choiceEx({
          prompt: "Was prüfen Sie, wenn Sie Ihre Aufnahme anhören?",
          correct: "Verb an Position 2, ein „weil“, Rückfragen",
          distractors: ["Nur die Länge der Aufnahme", "Ob Sie alle Notizen vorgelesen haben"],
          explanation: SELF_CHECK,
          seed: `s-sim${k}`,
        }),
      ];
      return mk(
        U,
        k + 1,
        `oral-simulation-${k + 1}`,
        `Oral exam simulation ${k + 1}`,
        ex,
        "All three parts in a row: Teil 1 (3 min), Teil 2 (6 min), Teil 3 (6 min).",
      );
    });
    bundles.push(
      unit({
        id: U,
        title: "Speaking (Sprechen) · Oral exam simulation",
        description: "All three parts in a row, like on exam day.",
        level: "B1",
        lessons: sims,
      }),
    );

    function themaTaskFor(t) {
      const lessonsT2 = bundles.flatMap((b) => b.lessons).flatMap((l) => l.exercises);
      const found = lessonsT2.find((e) => e.type === "task" && e.title === `Teil 2 · ${t.thema}`);
      if (!found) throw new Error(`thema task not found: ${t.thema}`);
      const rest2 = { ...found };
      delete rest2.id;
      return rest2;
    }
  }

  // ======================= coverage =======================
  const cov = coverage(bundles);
  cov.check("meta.quelle", [meta.quelle]);
  cov.check(
    "meta.ablauf",
    meta.ablauf.flatMap((a) => [a.t, a.z, a.txt]),
  );
  cov.check("meta.hinweise", meta.hinweise.map(htmlToRich));
  cov.check(
    "t1.stich",
    t1.stich.map((s) => `Teil 1 · ${s}`),
  );
  cov.check(
    "red.sec",
    allSecs.map((s) => s.sec),
  );
  cov.check(
    "red.items",
    allSecs.flatMap((s) => s.items.flatMap((it) => [it.de, it.en])),
  );
  cov.check(
    "t2.themen",
    t2.themen.flatMap((t) => [
      `Teil 2 · ${t.thema}`,
      t.bereich,
      ...[t.a, t.b].flatMap((p) => [p.name, String(p.alter), p.beruf, p.text]),
    ]),
  );
  cov.check(
    "t3.faelle",
    t3.faelle.flatMap((f) => [`Teil 3 · ${f.titel}`, f.bereich, f.situation, ...f.stich]),
  );
  cov.check(
    "Sprechen.INFO",
    Object.values(INFO).flatMap((x) => [x[0], x[1]]),
  );
  cov.done("speaking");
  return bundles;
}
