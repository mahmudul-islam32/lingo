/**
 * telc B1 Writing (Schreiben), units tb1-u55 … tb1-u64.
 * Sources: briefe.json (meta.bausteine / vorlagen / geruest, 29 letters) and coach.json
 * (coach.denk/swap/upgrade/konn/konnMC/frame/ausdruck/aufgabe + rules). Logic mirrors
 * sessions/Schreiben.jsx (letter task, Brief-Baukasten chips, criteria, Musterlösung),
 * sessions/Exercise.jsx (konnMC → choice, konn → typed answer with alts) and the coach
 * screens in screens/hubs.jsx.
 */
import {
  chunk,
  data,
  htmlToPlain,
  htmlToRich,
  lesson,
  rng,
  shuffled,
  slug,
  unit,
} from "../lib.mjs";
import {
  COURSE,
  choiceEx,
  connectorChoice,
  coverage,
  explainEx,
  listenEx,
  phraseDrills,
  pickDistinct,
  sentences,
  taskEx,
  wordBankEx,
} from "./_ws-util.mjs";

const pad = (n) => String(n).padStart(2, "0");

/** English glosses of the Baustein labels (meta.bausteine values). */
const LABEL_EN = {
  "Vorschlag annehmen": "accept a suggestion",
  "höflich ablehnen": "politely decline",
  "auf gute Nachricht reagieren": "react to good news",
  "auf schlechte Nachricht reagieren": "react to bad news",
  "eigene Neuigkeiten": "share your own news",
  "entschuldigen / begründen": "apologise / give a reason",
  "Vorschlag machen": "make a suggestion",
  "jemanden mitbringen": "bring someone along",
  "Rat geben": "give advice",
  "Rückfrage stellen": "ask a follow-up question",
  "über sich / Vorlieben": "talk about yourself / preferences",
  beschreiben: "describe",
  "Pläne / Zukunft": "plans / the future",
};

/** Criteria of Schreiben.jsx (CRITERIA) and GRADE_POINTS. */
const CRITERIA = [
  [
    "I",
    "Aufgabenbewältigung",
    "A = alle vier Leitpunkte klar bearbeitet · B = alle vier angefasst, einer dünn · C = nur zwei oder drei · D = einer oder keiner",
  ],
  [
    "II",
    "Kommunikative Gestaltung",
    "A = Anrede + Gruß korrekt, Register durchgehalten, Punkte hängen zusammen · B = kleine Brüche · C = Register wechselt oder Anrede/Gruß fehlt · D = kein Briefcharakter",
  ],
  [
    "III",
    "Formale Richtigkeit",
    "A = fast fehlerfrei · B = Fehler stören das Verstehen nicht · C = Verstehen stellenweise gestört · D = kaum verständlich",
  ],
];

/** English versions of the konn answers (word-bank prompts). Keyed by the German answer. */
const KONN_EN = {
  "Ich bleibe heute zu Hause, weil ich krank bin.": "I'm staying at home today because I'm ill.",
  "Ich bin krank, deshalb bleibe ich zu Hause.": "I'm ill, so I'm staying at home.",
  "Obwohl es geregnet hat, sind wir spazieren gegangen.": "Although it rained, we went for a walk.",
  "Die Wohnung ist teuer, trotzdem nehmen wir sie.":
    "The flat is expensive, but we're taking it anyway.",
  "Ich lerne jeden Tag, damit ich die Prüfung bestehe.":
    "I study every day so that I pass the exam.",
  "Wenn du Zeit hast, können wir uns treffen.": "If you have time, we can meet.",
  "Ich hoffe, dass wir uns bald sehen.": "I hope that we'll see each other soon.",
  "Die Wohnung ist günstig, außerdem liegt sie zentral.":
    "The flat is cheap, and it's also central.",
  "Ich fahre nicht mit dem Auto, sondern mit dem Zug.": "I'm not going by car but by train.",
  "Ich bleibe zu Hause, denn ich bin müde.": "I'm staying at home, because I'm tired.",
  "Nachdem ich gegessen hatte, habe ich weitergelernt.":
    "After I had eaten, I carried on studying.",
  "Er spricht nicht nur Deutsch, sondern auch Englisch.":
    "He speaks not only German but also English.",
  "Je mehr ich übe, desto sicherer werde ich.": "The more I practise, the more confident I become.",
  "Während ich koche, höre ich Podcasts.": "While I cook, I listen to podcasts.",
  "Beeil dich, sonst verpassen wir den Bus.": "Hurry up, otherwise we'll miss the bus.",
  "Die Arbeit ist zwar anstrengend, aber sie macht Spaß.": "The work may be tiring, but it's fun.",
};

/** Category per frame function; distractor frames come from another category. */
const FRAME_CAT = {
  Meinung: ["op"],
  Zustimmung: ["op", "re"],
  Widerspruch: ["op", "re"],
  Kontrast: ["op"],
  Zusammenfassen: ["op"],
  Vermutung: ["op"],
  Erfahrung: ["op"],
  Begründung: ["re"],
  "Grund nennen (Brief)": ["re"],
  Vorschlag: ["su"],
  Bitte: ["rq"],
  Beispiel: ["ex"],
};
const frameClash = (a, b) => FRAME_CAT[a].some((x) => FRAME_CAT[b].includes(x));
/** Category per Redemittel section of coach.ausdruck (overlapping functions share one). */
const AUSDRUCK_CAT = {
  "Meinung äußern": "op",
  Zustimmen: "op",
  "Widersprechen (höflich)": "op",
  "Vor- & Nachteile": "op",
  "Sprechen: Bild beschreiben": "op",
  Vorschlagen: "su",
  "Sprechen: Planen (Teil 3)": "su",
  "Höflich bitten": "rq",
  "Sich beschweren": "rq",
  Begründen: "re",
  "Zu-/Absagen": "re",
  "Brief: Einstieg": "re",
  "Brief: Schluss": "re",
  "Beispiele & Erfahrung": "ex",
  "Vergleichen & zusammenfassen": "cmp",
  "Nachfragen & Zeit gewinnen": "ask",
};

/** Coach rule groups (all 28 keys of coach.json rules). */
const RULE_GROUPS = [
  [
    "verb-end-1",
    "Connectors that send the verb to the end (1)",
    ["generic", "weil", "da", "dass", "wenn", "obwohl"],
  ],
  [
    "verb-end-2",
    "Connectors that send the verb to the end (2)",
    ["damit", "nachdem", "während", "umzu", "jedesto"],
  ],
  [
    "position-1",
    "Connectors with inversion or normal order (1)",
    ["deshalb", "denn", "trotzdem", "gegensatz", "außerdem"],
  ],
  [
    "position-2",
    "Connectors with inversion or normal order (2)",
    ["sondern", "sondernauch", "zwaraber", "sonst", "meaningmap"],
  ],
  [
    "grammar-frames",
    "Grammar frames for B1 sentences",
    ["kii", "perfekt", "komparativ", "inversion", "indirekt", "meinung", "futur"],
  ],
];

const CONNECTOR_TILES = ["weil", "denn", "deshalb", "obwohl", "trotzdem", "dass", "wenn", "damit"];

export function build() {
  const { meta, briefe } = data("briefe");
  const coachData = data("coach");
  const c = coachData.coach;
  const grammar = data("grammatik");
  const grammarTitle = Object.fromEntries(grammar.topics.map((t) => [t.id, t.title]));
  const rules = Object.fromEntries(
    Object.entries(coachData.rules).map(([k, r]) => [k, { t: r.t, en: r.en, p: htmlToRich(r.p) }]),
  );

  const labelOf = (code) => meta.bausteine[code.replace(/\+/g, "")] ?? code;
  const labelFull = (code) => `${labelOf(code)} (${LABEL_EN[labelOf(code)]})`;
  /** Schreiben.jsx template(): vorlage with {n} → … */
  const template = (code) => {
    let t = meta.vorlagen[code] ?? meta.vorlagen[code.replace(/\+/g, "")] ?? "";
    for (let i = 0; i < 5; i++) t = t.split(`{${i}}`).join("…");
    return t;
  };
  for (const l of Object.values(meta.bausteine))
    if (!LABEL_EN[l]) throw new Error(`no English label: ${l}`);
  for (const b of briefe)
    for (const p of b.plan) if (!template(p.b)) throw new Error(`no vorlage ${p.b}`);

  const bundles = [];
  const mkLesson = (unitId, n, s, title, exercises, tip) =>
    lesson({ id: `${unitId}-l${pad(n)}-${s}`, courseId: COURSE, unitId, title, tip, exercises });

  // ======================= u55: how the letter works =======================
  {
    const U = "tb1-u55";
    const lessons = [];
    // L1 scoring
    lessons.push(
      mkLesson(
        U,
        1,
        "letter-scoring",
        "How the letter is scored",
        [
          explainEx({
            title: "The writing part (Schreiben)",
            body: [
              "In the exam you have **30 minutes** to write **one e-mail** in reply to a personal letter. You must write something about **all four guiding points (Leitpunkte)**. A **salutation (Anrede)** and a **closing (Gruß)** are compulsory. The telc app's target length is **about 80 words**.",
              "You are graded on three criteria. Each gets A, B, C or D: **A = 5, B = 3, C = 1, D = 0** points. The sum is multiplied by 3, so the maximum is **45 points**.",
            ].join("\n\n"),
          }),
          explainEx({
            title: "The three criteria (Kriterien)",
            body:
              CRITERIA.map(
                ([n, t, d]) =>
                  `## Kriterium ${n} · ${t}\n\n${d
                    .split(" · ")
                    .map((x) => `- ${x}`)
                    .join("\n")}`,
              ).join("\n\n") +
              "\n\nIn English: **I** = did you handle all four points? **II** = salutation and closing correct, one register (du or Sie) throughout, points connected? **III** = how accurate is your German?",
          }),
          choiceEx({
            prompt:
              "Criterion I (Aufgabenbewältigung): you dealt with only two or three of the four points. Which grade?",
            correct: "C",
            distractors: ["A", "B", "D"],
            explanation: CRITERIA[0][2],
            seed: "w-sc1",
          }),
          choiceEx({
            prompt:
              "Criterion II (Kommunikative Gestaltung): the salutation or closing is missing. Which grade?",
            correct: "C",
            distractors: ["A", "B", "D"],
            explanation: CRITERIA[1][2],
            seed: "w-sc2",
          }),
          choiceEx({
            prompt:
              "Criterion III (Formale Richtigkeit): there are mistakes, but they don't disturb understanding. Which grade?",
            correct: "B",
            distractors: ["A", "C", "D"],
            explanation: CRITERIA[2][2],
            seed: "w-sc3",
          }),
          choiceEx({
            prompt: "You get B in all three criteria. How many points is that?",
            correct: "27",
            distractors: ["9", "15", "45"],
            explanation: "B = 3 points. (3 + 3 + 3) × 3 = **27** of 45.",
            seed: "w-sc4",
          }),
          choiceEx({
            prompt: "Which grade for criterion I if all four points are clearly covered?",
            correct: "A",
            distractors: ["B", "C"],
            explanation: CRITERIA[0][2],
            seed: "w-sc5",
          }),
        ],
        "Four points, Anrede and Gruß: that is where most writing points come from.",
      ),
    );

    // L2 Gerüst
    const g = meta.geruest;
    const intro = sentences(g.einleitung);
    const outro = sentences(g.schluss);
    const geruestEx = [
      explainEx({
        title: "The letter frame (Brief-Gerüst)",
        body: [
          "Every reply in this course uses the same frame. You only change the four middle blocks (one per Leitpunkt).",
          `## 1. Place and date\n${g.datum}`,
          "## 2. Salutation (Anrede)\nLiebe/r … ,  (Liebe Petra, / Lieber Jan,)",
          `## 3. Introduction (Einleitung)\n${g.einleitung}`,
          "## 4. Four building blocks\nOne sentence or two per Leitpunkt, built from the Bausteine (next lessons).",
          `## 5. Ending (Schluss)\n${g.schluss}`,
          `## 6. Closing (Gruß)\n${g.gruss}`,
        ].join("\n\n"),
        examples: [...intro, ...outro].map((s, i) => ({
          learning: s,
          known: i < intro.length ? "Introduction (Einleitung)" : "Ending (Schluss)",
        })),
      }),
    ];
    const frameSentences = [...intro, ...outro];
    frameSentences.forEach((s, i) => {
      geruestEx.push(
        choiceEx({
          passage: s,
          prompt: "Wohin gehört dieser Satz im Brief?",
          correct:
            i < intro.length ? "Einleitung (after the salutation)" : "Schluss (before the closing)",
          distractors: [
            i < intro.length ? "Schluss (before the closing)" : "Einleitung (after the salutation)",
          ],
          explanation: `Einleitung: ${g.einleitung}\n\nSchluss: ${g.schluss}`,
          seed: `w-g${i}`,
        }),
      );
      geruestEx.push(
        listenEx({
          answer: s,
          pool: frameSentences.filter((x) => x !== s),
          seed: `w-gl${i}`,
          src: `w-geruest-${i}`,
        }),
      );
    });
    geruestEx.push(
      choiceEx({
        prompt: "Which closing does the frame use for a letter to a friend?",
        correct: "Viele Grüße",
        distractors: ["Sehr geehrte Damen und Herren", "Liebe Petra"],
        explanation: `The frame ends with:\n${g.gruss}`,
        seed: "w-g-gruss",
      }),
    );
    lessons.push(
      mkLesson(
        U,
        2,
        "letter-frame",
        "The letter frame (Gerüst)",
        geruestEx,
        "Same frame every time: date, Anrede, Einleitung, 4 blocks, Schluss, Gruß.",
      ),
    );

    // L3–L5 Bausteine
    const groups = [
      ["bausteine-b1", "Building blocks: reacting (B1)", (k) => /^B1/.test(k)],
      [
        "bausteine-b2-b4",
        "Building blocks: news, apologies, suggestions (B2–B4)",
        (k) => /^B[234]/.test(k),
      ],
      [
        "bausteine-b5-b8",
        "Building blocks: advice, questions, preferences, plans (B5–B8)",
        (k) => /^B[5-8]/.test(k),
      ],
    ];
    const allLabels = [...new Set(Object.keys(meta.vorlagen).map(labelFull))];
    const groupedKeys = groups.flatMap(([, , f]) => Object.keys(meta.vorlagen).filter(f));
    if (groupedKeys.length !== Object.keys(meta.vorlagen).length)
      throw new Error("vorlagen grouping");
    groups.forEach(([s, title, f], gi) => {
      const keys = Object.keys(meta.vorlagen).filter(f);
      const examples = [];
      for (const k of keys) {
        const uses = briefe.flatMap((b) =>
          b.plan.filter((p) => p.b === k).map((p) => ({ ...p, nr: b.nr, name: b.name })),
        );
        for (const u of uses.slice(0, 2))
          examples.push({
            learning: u.satz,
            known: `${k} · ${LABEL_EN[labelOf(k)]} (letter ${u.nr} to ${u.name})`,
          });
      }
      const baseKeys = [...new Set(keys.map((k) => k.replace(/\+/g, "")))].filter(
        (k) => meta.bausteine[k],
      );
      const body = [
        "Each building block (Baustein) is a ready-made sentence with gaps (…). Fill in your own content. A **+** marks a more advanced variant.",
        ...baseKeys.map((k) => `**${k} · ${meta.bausteine[k]}** (${LABEL_EN[meta.bausteine[k]]})`),
        ...keys.map((k) => `- **${k}**: ${template(k)}`),
      ].join("\n\n");
      const ex = [explainEx({ title, body, examples: examples.slice(0, 24) })];
      keys.forEach((k, i) => {
        ex.push(
          choiceEx({
            title: `Baustein ${k}`,
            passage: template(k),
            prompt: "Wofür benutzt man diesen Baustein?",
            correct: labelFull(k),
            distractors: pickDistinct(
              allLabels.filter((l) => l !== labelFull(k)),
              3,
              `w-bl${k}`,
              [labelFull(k)],
            ),
            explanation: `**${k}** = ${labelOf(k)} (${LABEL_EN[labelOf(k)]}).\n\nVorlage: ${meta.vorlagen[k]}`,
            seed: `w-b${gi}-${i}`,
          }),
        );
        const gap = connectorChoice(template(k), rules, `w-bg${k}`, { title: `Baustein ${k}` });
        if (gap) ex.push(gap);
      });
      lessons.push(mkLesson(U, 3 + gi, s, title, ex));
    });

    bundles.push(
      unit({
        id: U,
        title: "Writing (Schreiben) · How the letter works",
        description:
          "Scoring, the letter frame and the building blocks (Bausteine) for the telc e-mail.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= u56–u60: the 29 letters =======================
  const letterChunks = chunk(briefe, 6);
  if (letterChunks.length !== 5) throw new Error(`letter chunks ${letterChunks.length}`);
  letterChunks.forEach((letters, ci) => {
    const U = `tb1-u${56 + ci}`;
    const lessons = letters.map((b, li) => {
      const seed = `w-l${b.nr}`;
      const ex = [];
      const notes = b.hinweise.length
        ? `\n\n## Notes on the source\n${b.hinweise.map((h) => `- ${h}`).join("\n")}`
        : "";
      ex.push(
        explainEx({
          title: `Letter from ${b.absender}: ${b.thema}`,
          body: `Read the letter. You will answer it in about 80 words and write something about each of the four points.\n\n## ${b.thema}\n\n${b.anrede}\n${b.text}\n\n${b.gruss}\n${b.absender}\n\n## Task\n**${b.instruktion}**\n${b.leitpunkte.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nSource video: ${b.url}${notes}`,
        }),
      );
      if (b.plan.length !== b.leitpunkte.length)
        throw new Error(`letter ${b.nr}: plan/leitpunkte mismatch`);
      ex.push(
        explainEx({
          title: "Plan: one building block per point",
          body: `For each Leitpunkt pick a Baustein and fill it in:\n\n${b.plan
            .map(
              (p, i) =>
                `**${i + 1}. ${b.leitpunkte[i]}**\nBaustein ${p.b} · ${labelOf(p.b)} (${LABEL_EN[labelOf(p.b)]}): *${template(p.b)}*\n→ ${p.satz}`,
            )
            .join("\n\n")}`,
          examples: b.plan.map((p, i) => ({
            learning: p.satz,
            known: `Point ${i + 1}: ${LABEL_EN[labelOf(p.b)]} (${p.b})`,
          })),
        }),
      );
      const plans = b.plan.map((p) => p.satz);
      b.plan.forEach((p, i) => {
        ex.push(
          choiceEx({
            title: `Leitpunkt ${i + 1}`,
            prompt: `Welcher Satz passt zum Leitpunkt „${b.leitpunkte[i]}“?`,
            correct: p.satz,
            distractors: plans.filter((x) => x !== p.satz),
            explanation: `Baustein **${p.b}** · ${labelOf(p.b)} (${LABEL_EN[labelOf(p.b)]}): ${template(p.b)}`,
            seed: `${seed}-lp${i}`,
          }),
        );
      });
      b.plan.forEach((p, i) => {
        const gap = connectorChoice(p.satz, rules, `${seed}-g${i}`, {
          title: `Leitpunkt ${i + 1}`,
        });
        if (gap) ex.push(gap);
      });
      const shortest = [...plans].sort((x, y) => x.length - y.length).slice(0, 2);
      shortest.forEach((s, i) =>
        ex.push(
          listenEx({
            answer: s,
            pool: plans.filter((x) => x !== s),
            seed: `${seed}-li${i}`,
            src: `w-brief-${b.nr}-${i}`,
          }),
        ),
      );
      const salutation = b.muster.split("\n").find((l) => /^Lieb/.test(l)) ?? `Liebe/r ${b.name},`;
      const codes = [...new Set(b.plan.map((p) => p.b))];
      const original =
        b.original && b.original !== b.muster
          ? `\n\n## Sample answer from the source video\n*This answer was written in the source video. It is not the model and may contain mistakes; check the notes on the source.*\n\n${b.original}`
          : "";
      ex.push(
        taskEx({
          skill: "writing",
          title: `E-Mail an ${b.name}: ${b.thema}`,
          task: `**${b.thema}**\n\nYou received this letter:\n\n${b.anrede}\n${b.text}\n${b.gruss}\n${b.absender}\n\n**${b.instruktion}**\n\nWrite about 80 words (30 minutes). Anrede and Gruß are compulsory.`,
          points: b.leitpunkte,
          phrases: [
            salutation,
            meta.geruest.einleitung,
            ...codes.map(template),
            meta.geruest.schluss,
            "Viele Grüße",
          ],
          modelAnswer: `## Model answer (Musterlösung)\n\n${b.muster}${original}`,
          ...(b.hinweise.length
            ? { explanation: `Notes on the source:\n${b.hinweise.map((h) => `- ${h}`).join("\n")}` }
            : {}),
        }),
      );
      return mkLesson(
        U,
        li + 1,
        `brief-${pad(b.nr)}-${slug(b.name, 14)}`,
        `Letter ${b.nr}: ${b.name} · ${b.thema}`,
        ex,
        "Cover all four points; Anrede and Gruß are compulsory.",
      );
    });
    const first = letters[0].nr;
    const last = letters.at(-1).nr;
    bundles.push(
      unit({
        id: U,
        title: `Writing (Schreiben) · Letters ${first}–${last}`,
        description: `Reply to letters ${first}–${last}: read, plan with Bausteine, write, compare with the model.`,
        level: "B1",
        lessons,
      }),
    );
  });

  // ======================= u61: coach rules =======================
  {
    const U = "tb1-u61";
    const lessons = [];
    const denkEx = c.denk.map((d, i) =>
      explainEx({
        title: `${i + 1}. ${d.t}`,
        body: `${htmlToRich(d.en)}\n\n*Deutsch:* ${htmlToRich(d.de)}`,
      }),
    );
    denkEx.push(
      choiceEx({
        prompt: "In a main clause (Hauptsatz), where does the verb go?",
        correct: "Position 2",
        distractors: ["Position 1", "At the end"],
        explanation: htmlToRich(c.denk[2].en),
        seed: "w-d1",
      }),
      choiceEx({
        prompt: "After weil, dass, wenn, obwohl the verb goes …",
        correct: "to the end",
        distractors: ["to position 2", "to position 1"],
        explanation: htmlToRich(c.denk[2].en),
        seed: "w-d2",
      }),
      choiceEx({
        prompt: "What counts most in the telc letter?",
        correct: "All 4 points, linked with connectors, with salutation and closing",
        distractors: ["Long, complicated sentences", "Rare, advanced words"],
        explanation: htmlToRich(c.denk[4].en),
        seed: "w-d3",
      }),
      choiceEx({
        prompt: "Which is better at B1?",
        correct: "Two short correct sentences joined with a connector",
        distractors: ["One long sentence, even with mistakes"],
        explanation: htmlToRich(c.denk[1].en),
        seed: "w-d4",
      }),
    );
    lessons.push(
      mkLesson(
        U,
        1,
        "think-like-b1",
        "Think like B1 (Denken wie B1)",
        denkEx,
        "Assemble chunks you know; don't translate word for word.",
      ),
    );

    const grouped = RULE_GROUPS.flatMap((g) => g[2]);
    for (const k of Object.keys(rules))
      if (!grouped.includes(k)) throw new Error(`rule ${k} not grouped`);
    RULE_GROUPS.forEach(([s, title, keys], gi) => {
      const ex = [];
      for (const k of keys) {
        const r = rules[k];
        if (!r) throw new Error(`rule ${k} missing`);
        ex.push(explainEx({ title: r.t, body: `${r.en}\n\n${r.p}` }));
        const plain = htmlToPlain(coachData.rules[k].p);
        const m = /Bsp:\s*(.+)$/.exec(plain);
        if (m) {
          const sample = m[1].split(" · ")[0].split(" / ")[0].trim();
          ex.push(
            listenEx({
              answer: sample,
              pool: CONNECTOR_TILES,
              seed: `w-r${k}`,
              src: `w-rule-${slug(k)}`,
              explanation: `**${r.t}**: ${r.en}`,
            }),
          );
        }
      }
      lessons.push(mkLesson(U, 2 + gi, s, title, ex));
    });
    bundles.push(
      unit({
        id: U,
        title: "Writing coach · Rules (Regeln)",
        description: "Think like B1, connector rules and grammar frames from the Ausdruck-Coach.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= u62: connectors =======================
  {
    const U = "tb1-u62";
    const lessons = [];
    const mcEx = [
      explainEx({
        title: rules.meaningmap.t,
        body: `${rules.meaningmap.en}\n\n${rules.meaningmap.p}`,
      }),
    ];
    c.konnMC.forEach((q, i) => {
      const correct = q.o[q.a];
      const key = correct.toLowerCase();
      const rule = rules[key] ?? null;
      mcEx.push(
        choiceEx({
          title: `Welcher Konnektor passt? · ${q.mean}`,
          prompt: q.s,
          correct,
          distractors: q.o.filter((_, j) => j !== q.a),
          explanation: `Meaning: **${q.mean}**. ${q.w}${rule ? `\n\n**${rule.t}**: ${rule.p}` : ""}`,
          seed: `w-mc${i}`,
        }),
      );
    });
    lessons.push(
      mkLesson(
        U,
        1,
        "connector-quiz",
        "Connector quiz (Konnektor-Quiz)",
        mcEx,
        "Pick the connector by its meaning: reason, result, contrast, goal, condition.",
      ),
    );

    chunk(c.konn, 6).forEach((items, gi) => {
      const ex = [];
      items.forEach((k) => {
        const idx = c.konn.indexOf(k);
        const en = KONN_EN[k.ans];
        if (!en) throw new Error(`no English for konn: ${k.ans}`);
        const first = k.conn.split(" ")[0];
        const only = k.conn === "je desto" ? null : k.conn === "zwar aber" ? "aber" : first;
        const passage = `**${k.task}**\n\n${k.s1}\n${k.s2}`;
        if (only) {
          const gap = connectorChoice(k.ans, rules, `w-kg${idx}`, {
            only,
            passage,
            title: "Sätze verbinden",
            why: k.w,
          });
          if (!gap) throw new Error(`konn gap failed: ${k.ans}`);
          ex.push(gap);
        }
        ex.push(
          wordBankEx({
            prompt: en,
            answers: [k.ans, ...k.alts],
            distractors: shuffled(CONNECTOR_TILES, rng(`w-kd${idx}`)),
            seed: `w-kw${idx}`,
            explanation: `${passage}\n\n${k.ans}${k.alts.length ? `\nAlso correct: ${k.alts.join(" / ")}` : ""}\n\n${k.w}`,
          }),
        );
      });
      lessons.push(
        mkLesson(
          U,
          2 + gi,
          `join-sentences-${gi + 1}`,
          `Joining sentences (Sätze verbinden) ${gi + 1}`,
          ex,
          "Join two sentences with the connector; watch where the verb goes.",
        ),
      );
    });
    bundles.push(
      unit({
        id: U,
        title: "Writing coach · Connectors (Konnektoren)",
        description: "Choose and use weil, deshalb, obwohl, trotzdem, damit and more.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= u63: swap, upgrade, frames =======================
  {
    const U = "tb1-u63";
    const lessons = [];
    let n = 1;
    chunk(c.swap, 9).forEach((items, gi) => {
      const ex = [
        explainEx({
          title: `Simple → B1 (Einfach → B1) ${gi + 1}`,
          body: `Left the A2 word, right the B1 alternative:\n\n${items.map((x) => `- ${x[0]} → **${x[1]}**${x[2] ? ` (${x[2]})` : ""}`).join("\n")}`,
        }),
      ];
      items.forEach((x) => {
        const idx = c.swap.indexOf(x);
        const conflict = (y) =>
          (idx === 0 && c.swap.indexOf(y) === 17) || (idx === 17 && c.swap.indexOf(y) === 0);
        const others = c.swap.filter((y) => y !== x && !conflict(y)).map((y) => y[1]);
        ex.push(
          choiceEx({
            prompt: `Was klingt besser als „${x[0]}“? (B1-Variante)`,
            correct: x[1],
            distractors: pickDistinct(others, 3, `w-sw${idx}`, [x[1]]),
            explanation: `${x[0]} → **${x[1]}**${x[2] ? ` (${x[2]})` : ""}`,
            seed: `w-swo${idx}`,
          }),
        );
      });
      lessons.push(
        mkLesson(
          U,
          n++,
          `simple-to-b1-${gi + 1}`,
          `Simple → B1 words ${gi + 1}`,
          ex,
          "Swap plain A2 words for B1 alternatives.",
        ),
      );
    });
    chunk(c.upgrade, 5).forEach((items, gi) => {
      const ex = [
        explainEx({
          title: "Sentence upgrade (Satz-Upgrade)",
          body: `Start with a simple sentence and improve it step by step. Try each step yourself, then compare with the model.\n\n${htmlToRich(c.denk[3].en)}`,
        }),
      ];
      items.forEach((u) => {
        const idx = c.upgrade.indexOf(u);
        ex.push(
          taskEx({
            skill: "writing",
            title: `Satz-Upgrade: ${u.topic}`,
            task: `Start sentence (Ausgangssatz): **${u.base}**\n\nImprove it step by step, one step at a time.`,
            points: u.steps.map((s, i) => `Schritt ${i + 1}: ${s.hint}`),
            modelAnswer: `${u.steps.map((s, i) => `**Schritt ${i + 1}:** ${s.hint}\n${s.model}`).join("\n\n")}\n\n${htmlToRich(u.w)}`,
          }),
        );
        const final = u.steps.at(-1).model;
        ex.push(
          listenEx({
            answer: final,
            pool: [u.base, ...CONNECTOR_TILES],
            seed: `w-up${idx}`,
            src: `w-upgrade-${idx}`,
            explanation: htmlToRich(u.w),
          }),
        );
      });
      lessons.push(
        mkLesson(U, n++, `sentence-upgrade-${gi + 1}`, `Sentence upgrade ${gi + 1}`, ex),
      );
    });
    for (const f of c.frame)
      if (!FRAME_CAT[f.fn]) throw new Error(`frame fn without category: ${f.fn}`);
    chunk(c.frame, 5).forEach((items, gi) => {
      const ex = [];
      items.forEach((f) => {
        const idx = c.frame.indexOf(f);
        const others = c.frame.filter((y) => !frameClash(y.fn, f.fn)).map((y) => y.frame);
        ex.push(
          choiceEx({
            title: `Satzrahmen · ${f.fn}`,
            prompt: `Welcher Satzrahmen passt zur Funktion „${f.fn}“?`,
            correct: f.frame,
            distractors: pickDistinct(others, 3, `w-fr${idx}`, [f.frame]),
            explanation: htmlToRich(f.w),
            seed: `w-fro${idx}`,
          }),
        );
        ex.push(
          taskEx({
            skill: "writing",
            title: `Satzrahmen: ${f.fn}`,
            task: `${f.prompt}\n\nUse this frame and fill the gap with your own content:\n**${f.frame}**`,
            phrases: [f.frame],
            modelAnswer: `${f.model}\n\n${htmlToRich(f.w)}`,
          }),
        );
      });
      lessons.push(
        mkLesson(
          U,
          n++,
          `sentence-frames-${gi + 1}`,
          `Sentence frames (Satzrahmen) ${gi + 1}`,
          ex,
          "Take the frame, fill the gap with your content.",
        ),
      );
    });
    bundles.push(
      unit({
        id: U,
        title: "Writing coach · Better words and sentences",
        description: "Simple → B1 words, sentence upgrades and sentence frames.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= u64: Redemittel + mini tasks =======================
  {
    const U = "tb1-u64";
    const lessons = [];
    for (const s of c.ausdruck)
      if (!AUSDRUCK_CAT[s.sec]) throw new Error(`ausdruck section without category: ${s.sec}`);
    const pool = c.ausdruck.map((s) => ({ ...s, cat: AUSDRUCK_CAT[s.sec] }));
    chunk(pool, 4).forEach((secs, gi) => {
      const ex = [];
      for (const s of secs) {
        const tip = s.tip ? `\n\n*Tipp:* ${htmlToRich(s.tip)}` : "";
        ex.push(
          explainEx({
            title: `Redemittel: ${s.sec}`,
            body: `${s.items.map((it) => `- **${htmlToPlain(it.de)}**: ${it.en}${it.r ? ` *(Grammar: ${grammarTitle[it.r] ?? it.r})*` : ""}`).join("\n")}${tip}`,
            examples: s.items.map((it) => ({ learning: htmlToPlain(it.de), known: it.en })),
          }),
        );
      }
      // Function choice per section + meaning choices for two items per section.
      const drills = phraseDrills(secs, pool, `w-au${gi}`, htmlToPlain);
      let k = 0;
      for (const s of secs) {
        const block = drills.slice(k, k + 1 + s.items.length);
        k += 1 + s.items.length;
        ex.push(block[0], ...block.slice(1, 3));
      }
      lessons.push(
        mkLesson(
          U,
          gi + 1,
          `phrases-${gi + 1}`,
          `Useful phrases (Redemittel) ${gi + 1}: ${secs.map((s) => s.sec).join(", ")}`,
          ex,
        ),
      );
    });
    const tasks = c.aufgabe.map((a, i) =>
      taskEx({
        skill: a.typ === "Sprechen" ? "speaking" : "writing",
        title: `Mini-Aufgabe ${i + 1} · ${a.typ}`,
        task: a.prompt,
        points: a.points,
        phrases: a.chunks,
        modelAnswer: `## Muster\n\n${a.model}\n\n## Checkliste\n${a.check.map((x) => `- ${x}`).join("\n")}`,
      }),
    );
    lessons.push(
      mkLesson(
        U,
        lessons.length + 1,
        "mini-tasks",
        "Mini tasks (Mini-Aufgaben)",
        tasks,
        "Use the chunks, then check yourself with the checklist.",
      ),
    );
    bundles.push(
      unit({
        id: U,
        title: "Writing coach · Phrases and mini tasks",
        description:
          "Redemittel for opinions, suggestions, requests and letters, plus short writing and speaking tasks.",
        level: "B1",
        lessons,
      }),
    );
  }

  // ======================= coverage =======================
  const cov = coverage(bundles);
  cov.check(
    "briefe.text",
    briefe.map((b) => b.text),
  );
  cov.check(
    "briefe.thema",
    briefe.map((b) => b.thema),
  );
  cov.check(
    "briefe.name/absender/gruss/anrede",
    briefe.flatMap((b) => [b.name, b.absender, b.gruss, b.anrede]),
  );
  cov.check(
    "briefe.url",
    briefe.map((b) => b.url),
  );
  cov.check(
    "briefe.instruktion",
    briefe.map((b) => b.instruktion),
  );
  cov.check(
    "briefe.leitpunkte",
    briefe.flatMap((b) => b.leitpunkte),
  );
  cov.check(
    "briefe.plan.satz",
    briefe.flatMap((b) => b.plan.map((p) => p.satz)),
  );
  cov.check(
    "briefe.plan.b",
    briefe.flatMap((b) => b.plan.map((p) => `Baustein ${p.b}`)),
  );
  cov.check(
    "briefe.muster",
    briefe.map((b) => b.muster),
  );
  cov.check(
    "briefe.original",
    briefe.filter((b) => b.original).map((b) => b.original),
  );
  cov.check(
    "briefe.hinweise",
    briefe.flatMap((b) => b.hinweise),
  );
  cov.check(
    "meta.bausteine",
    Object.entries(meta.bausteine).map(([k, v]) => `${k} · ${v}`),
  );
  cov.check("meta.vorlagen", Object.keys(meta.vorlagen).map(template));
  cov.check("meta.geruest", Object.values(meta.geruest));
  cov.check(
    "coach.denk",
    c.denk.flatMap((d) => [d.t, htmlToRich(d.de), htmlToRich(d.en)]),
  );
  cov.check(
    "coach.swap",
    c.swap.flatMap((x) => x.filter(Boolean)),
  );
  cov.check(
    "coach.upgrade",
    c.upgrade.flatMap((u) => [
      u.topic,
      u.base,
      htmlToRich(u.w),
      ...u.steps.flatMap((s) => [s.hint, s.model]),
    ]),
  );
  cov.check(
    "coach.konn",
    c.konn.flatMap((k) => [k.task, k.s1, k.s2, k.ans, ...k.alts, k.w]),
  );
  cov.check(
    "coach.konnMC",
    c.konnMC.flatMap((q) => [q.s, q.mean, q.w, ...q.o]),
  );
  cov.check(
    "coach.frame",
    c.frame.flatMap((f) => [f.fn, f.frame, f.prompt, f.model, htmlToRich(f.w)]),
  );
  cov.check(
    "coach.ausdruck.sec/tip",
    c.ausdruck.flatMap((s) => [s.sec, ...(s.tip ? [htmlToRich(s.tip)] : [])]),
  );
  cov.check(
    "coach.ausdruck.items",
    c.ausdruck.flatMap((s) => s.items.flatMap((it) => [htmlToPlain(it.de), it.en])),
  );
  cov.check(
    "coach.aufgabe",
    c.aufgabe.flatMap((a) => [a.typ, a.prompt, a.model, ...a.points, ...a.chunks, ...a.check]),
  );
  cov.check(
    "rules",
    Object.values(rules).flatMap((r) => [r.t, r.en, r.p]),
  );
  cov.check(
    "Schreiben.CRITERIA",
    CRITERIA.map(([, t]) => t),
  );
  cov.done("writing");
  return bundles;
}
