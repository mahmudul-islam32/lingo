/**
 * telc B1 overview unit (tb1-u01): exam structure, timing, points and pass marks.
 * Facts only from the telc app: screens/Pruefung.jsx (STEPS, totals, biggestLever weights,
 * criteria), screens/Heute.jsx (pass markers 135/45, part maxima), core/store.js
 * (examPassed ≥ 135, oral part maxima 15/30/30), sessions/Sprechen.jsx (3/6/6 min timers),
 * sprechen.json meta (ablauf, hinweise), sessions/Schreiben.jsx (criteria, A5/B3/C1/D0 ×3,
 * Ziel ca. 80 Wörter, 30 min), core/planBudget.js (study-time estimates).
 */
import { data, htmlToPlain, lesson, unit } from "../lib.mjs";
import { COURSE, choiceEx, coverage, explainEx } from "./_ws-util.mjs";

const UNIT = "tb1-u01";

/** Pruefung.jsx STEPS (time, part, desktop detail). */
const STEPS = [
  ["90 Min", "Lesen + Sprachbausteine", "Aufgaben 1–40 · ein Block, du teilst die Zeit selbst ein"],
  ["30 Min", "Hören", "Aufgaben 41–60 · Teil 1 läuft nur einmal, Teil 2 und 3 zweimal"],
  ["30 Min", "Schreiben", "Eine E-Mail · alle vier Leitpunkte · Anrede und Gruß sind Pflicht"],
];

export function build() {
  const sp = data("sprechen");
  const L = (n, slug, title, tip, exercises) =>
    lesson({ id: `${UNIT}-l0${n}-${slug}`, courseId: COURSE, unitId: UNIT, title, tip, exercises });

  // ---------- Lesson 1: written exam ----------
  const written = [
    explainEx({
      title: "The written exam: three blocks, 150 minutes",
      body: [
        "The telc Deutsch B1 exam has a **written** part and a separate **oral** part. The written part runs like this:",
        STEPS.map(([t, a, b]) => `- **${t} · ${a}**: ${b}`).join("\n"),
        "In English:",
        [
          "- **90 minutes · Reading + Language elements (Lesen + Sprachbausteine)**: tasks 1–40, one block; you divide the time yourself.",
          "- **30 minutes · Listening (Hören)**: tasks 41–60; Part 1 is played only once, Parts 2 and 3 twice.",
          "- **30 minutes · Writing (Schreiben)**: one e-mail; cover all four guiding points (Leitpunkte); salutation (Anrede) and closing (Gruß) are compulsory.",
        ].join("\n"),
        "## In numbers\n- **150** minutes (Minuten)\n- **225** points (Punkte)\n- **135** points to pass (zum Bestehen)",
      ].join("\n\n"),
    }),
    explainEx({
      title: "Points per part",
      body: [
        "The 225 written points are split like this (Nach Teilen):",
        [
          "- **Leseverstehen (Reading): 75 points**. Part 1: 5 headlines to match (5 points each). Part 2: 5 detail questions (5 points each). Part 3: 10 situations (2.5 points each).",
          "- **Sprachbausteine (Language elements): 30 points**. 20 gaps, 1.5 points each.",
          "- **Hörverstehen (Listening): 75 points**. Part 1: 5 items (5 points each). Part 2: 10 items (2.5 points each). Part 3: 5 announcements (Durchsagen, 5 points each).",
          "- **Schreiben (Writing): 45 points**. Three criteria, each graded A = 5, B = 3, C = 1, D = 0; the sum is multiplied by 3.",
        ].join("\n"),
        "## The three writing criteria\n- I · Aufgabenbewältigung (task completion)\n- II · Kommunikative Gestaltung (communicative design)\n- III · Formale Richtigkeit (formal accuracy)",
        "## Where points are lost\n- Hören Teil 1 läuft nur einmal: Aussagen vorher lesen. (Part 1 plays only once: read the statements first.)\n- Hören Teil 2: oft Korrektur-Fallen („nicht … sondern“). (Often correction traps.)\n- Schreiben: Alle vier Leitpunkte, Anrede und Gruß: das bringt die meisten Punkte. (All four points, salutation and closing bring the most points.)",
      ].join("\n\n"),
    }),
    explainEx({
      title: "What surprises people on exam day",
      body: [
        "*Was am Prüfungstag überrascht:* Die 90 Minuten für Lesen + Bausteine sind ein Block. Niemand sagt dir, wann du wechseln sollst. Übertrage nach jedem Teil auf den Antwortbogen, und lass nie ein Feld leer.",
        "In English: the 90 minutes for reading and language elements are **one block**. Nobody tells you when to move on. **Transfer your answers to the answer sheet after each part**, and never leave a field empty.",
        "For a full mock exam: *Plane 2,5 Stunden am Stück ein: Handy weg, Tür zu.* Plan 2.5 hours in one go: phone away, door shut.",
      ].join("\n\n"),
    }),
    choiceEx({
      prompt: "How long is the written exam in total?",
      correct: "150 minutes",
      distractors: ["90 minutes", "120 minutes", "225 minutes"],
      explanation:
        "90 min Lesen + Sprachbausteine, 30 min Hören, 30 min Schreiben = **150 minutes**.",
      seed: "ov-1",
    }),
    choiceEx({
      prompt: "How many points do you need to pass the written exam?",
      correct: "135 of 225",
      distractors: ["45 of 225", "75 of 225", "150 of 225"],
      explanation: "The written exam has **225** points; you pass with **135**.",
      seed: "ov-2",
    }),
    choiceEx({
      prompt: "Which part covers tasks 41–60?",
      correct: "Hören (Listening)",
      distractors: ["Lesen + Sprachbausteine (Reading + Language elements)", "Schreiben (Writing)"],
      explanation: "Hören: Aufgaben 41–60, 30 minutes.",
      seed: "ov-3",
    }),
    choiceEx({
      prompt: "Which listening part is played only once?",
      correct: "Teil 1",
      distractors: ["Teil 2", "Teil 3"],
      explanation:
        "Teil 1 läuft nur einmal, Teil 2 und 3 zweimal. Read the statements before you listen.",
      seed: "ov-4",
    }),
    choiceEx({
      prompt: "How many points is the Sprachbausteine part worth?",
      correct: "30",
      distractors: ["45", "75", "25"],
      explanation: "20 gaps × 1.5 points = **30 points**.",
      seed: "ov-5",
    }),
    choiceEx({
      prompt: "What is compulsory in the writing part besides the four Leitpunkte?",
      correct: "Salutation and closing (Anrede und Gruß)",
      distractors: ["At least 200 words", "A title for the e-mail", "Your full address"],
      explanation: "Eine E-Mail · alle vier Leitpunkte · **Anrede und Gruß sind Pflicht**.",
      seed: "ov-6",
    }),
    choiceEx({
      prompt: "How is the writing score calculated?",
      correct: "Three criteria graded A=5, B=3, C=1, D=0; the sum × 3 (max. 45)",
      distractors: [
        "One grade from 0 to 45",
        "Four criteria worth 15 points each",
        "Points for every word you write",
      ],
      explanation: "Brief-Bewertung · Summe × 3: criteria I–III, each A/B/C/D = 5/3/1/0.",
      seed: "ov-7",
    }),
    choiceEx({
      prompt: "The 90 minutes for Lesen + Sprachbausteine …",
      correct: "are one block: you decide when to switch.",
      distractors: ["are split by the examiner after 45 minutes.", "include a 10-minute break."],
      explanation:
        "Die 90 Minuten für Lesen + Bausteine sind ein Block. Niemand sagt dir, wann du wechseln sollst.",
      seed: "ov-8",
    }),
  ];

  // ---------- Lesson 2: oral exam ----------
  const hin = sp.meta.hinweise.map(htmlToPlain);
  const oral = [
    explainEx({
      title: "The oral exam: 75 points, scored separately",
      body: [
        "*Die mündliche Prüfung wird getrennt gewertet: ab 45 von 75 Punkten.* The oral exam is scored **separately**: you pass with **45 of 75** points.",
        "To pass the whole exam you need both: **135 of 225** in the written part and **45 of 75** in the oral part.",
        "## Structure\n" + sp.meta.ablauf.map((a) => `- **${a.t}** (${a.z})`).join("\n"),
        "In English: 20 minutes preparation; Part 1 *getting to know each other* (about 3 minutes); Part 2 *talking about a topic* (about 6 minutes); Part 3 *planning something together* (about 6 minutes).",
        "In the telc app's oral forecast, Part 1 counts up to **15** points and Parts 2 and 3 up to **30** each (15 + 30 + 30 = 75).",
        "## Hinweise\n" + hin.map((h) => `- ${h}`).join("\n"),
      ].join("\n\n"),
    }),
    choiceEx({
      prompt: "How many points can you get in the oral exam?",
      correct: "75",
      distractors: ["45", "225", "30"],
      explanation: "Mündliche Prüfung · 75 Punkte.",
      seed: "ov-o1",
    }),
    choiceEx({
      prompt: "From how many points is the oral exam passed?",
      correct: "45",
      distractors: ["35", "60", "135"],
      explanation: "Getrennt gewertet: ab 45 von 75 Punkten.",
      seed: "ov-o2",
    }),
    choiceEx({
      prompt: "How long is the preparation time before the oral exam?",
      correct: "20 minutes",
      distractors: ["3 minutes", "6 minutes", "15 minutes"],
      explanation: `${sp.meta.ablauf[0].t}: ${sp.meta.ablauf[0].z}.`,
      seed: "ov-o3",
    }),
    choiceEx({
      prompt: "What do you do in Teil 3?",
      correct: "Plan something together (Gemeinsam etwas planen)",
      distractors: [
        "Introduce yourselves (Einander kennenlernen)",
        "Talk about a topic (Über ein Thema sprechen)",
      ],
      explanation: sp.meta.ablauf.map((a) => `${a.t} (${a.z})`).join(" · "),
      seed: "ov-o4",
    }),
    choiceEx({
      prompt: "How long does Teil 1 last?",
      correct: "about 3 minutes",
      distractors: ["about 6 minutes", "about 15 minutes", "about 20 minutes"],
      explanation: `${sp.meta.ablauf[1].t}: ${sp.meta.ablauf[1].z}.`,
      seed: "ov-o5",
    }),
    choiceEx({
      prompt: "Who do you look at while speaking?",
      correct: "Your partner",
      distractors: ["The examiners", "Your notes"],
      explanation: `${hin[5]} ${hin[4]}`,
      seed: "ov-o6",
    }),
    choiceEx({
      prompt: "Which behaviour is rated positively?",
      correct: "Asking follow-up questions and helping your partner",
      distractors: ["Reading out your notes", "Giving a long perfect monologue"],
      explanation: hin[3],
      seed: "ov-o7",
    }),
  ];

  // ---------- Lesson 3: planning (planBudget.js) ----------
  const plan = [
    explainEx({
      title: "Planning your preparation",
      body: [
        "The telc app plans your daily study time from the **days left until the exam** and the **content still to do**, instead of fixed minutes.",
        "Its rough estimates for working through each skill once:",
        "- Lesen (Reading): about 150 minutes\n- Hören (Listening): about 150 minutes\n- Sprachbausteine: about 75 minutes\n- Schreiben (Writing): about 90 minutes",
        "Daily minutes are kept within limits: vocabulary 5–50, grammar 5–40, exam skills 8–45 minutes a day. What you already master counts less, so the plan adapts to your pace.",
        "For writing, the app's target is **about 80 words** per e-mail in **30 minutes**.",
      ].join("\n\n"),
    }),
    choiceEx({
      prompt: "How long should your e-mail in the writing part be (target in the telc app)?",
      correct: "about 80 words",
      distractors: ["about 30 words", "about 250 words"],
      explanation: "Wörter · Ziel ca. 80 (30-minute timer).",
      seed: "ov-p1",
    }),
    choiceEx({
      prompt: "Which skill does the app estimate takes the least time to work through once?",
      correct: "Sprachbausteine (about 75 minutes)",
      distractors: [
        "Lesen (about 150 minutes)",
        "Hören (about 150 minutes)",
        "Schreiben (about 90 minutes)",
      ],
      explanation: "Estimates: Lesen 150, Hören 150, Sprachbausteine 75, Schreiben 90 minutes.",
      seed: "ov-p2",
    }),
  ];

  const bundles = [
    unit({
      id: UNIT,
      title: "The telc B1 exam",
      description: "All parts, timing, points and pass marks of telc Deutsch B1.",
      level: "B1",
      lessons: [
        L(
          1,
          "written-exam",
          "The written exam",
          "Written: 150 minutes, 225 points, 135 to pass.",
          written,
        ),
        L(2, "oral-exam", "The oral exam", "Oral: 75 points, scored separately, 45 to pass.", oral),
        L(3, "planning", "Planning your preparation", undefined, plan),
      ],
    }),
  ];

  const cov = coverage(bundles);
  cov.check(
    "Pruefung.STEPS",
    STEPS.flatMap((s) => s),
  );
  cov.check(
    "sprechen.meta.ablauf",
    sp.meta.ablauf.flatMap((a) => [a.t, a.z]),
  );
  cov.check("sprechen.meta.hinweise", hin);
  cov.check("facts", ["150", "225", "135", "75", "45", "30", "1.5", "2.5"]);
  cov.done("overview");
  return bundles;
}
