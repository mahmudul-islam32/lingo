/**
 * telc B1 Modellprüfung (sessions/Exam.jsx, screens/Pruefung.jsx). Unit tb1-u75.
 *
 * The app rotates the exam material per run (`examSet(n)`: Lesen t1/t2/t3, Hören
 * t1/t2/t3 by n mod length; Sprachbausteine sim1/sim2 always the same). We build four
 * Modelltests (n = 0…3), so every Lesen Teil 1/2 set appears once, in exam order:
 * Lesen 1–3 (tasks 1–20), Sprachbausteine 1–2 (21–40), Hören 1–3 (41–60). Writing and
 * speaking live in their own units; one card points there.
 */
import { data, unit } from "../lib.mjs";
import {
  allText,
  covered,
  explain,
  hoerenInterview,
  hoerenStatements,
  mkLesson,
  readingT1,
  readingT2,
  readingT3,
  sb1Exercises,
  sb2Exercises,
  sb2IntroCard,
} from "./_exam-util.mjs";
import { TIP_DE } from "./listening.mjs";

const UNIT = "tb1-u75";
const RUNS = 4;

const rulesCards = [
  explain(
    "The written exam at a glance",
    [
      "**150 minutes · 225 points · 135 points to pass.** The Modelltest mirrors the written telc B1 exam:",
      "- **90 min · Lesen + Sprachbausteine** (tasks 1–40): one block, you split the time yourself.\n- **30 min · Hören** (tasks 41–60): Teil 1 is played only once, Teil 2 and 3 twice.\n- **30 min · Schreiben**: one e-mail covering all four guiding points (*Leitpunkte*); salutation and closing are required.",
      "The oral exam (*Sprechen*, 75 points) is scored separately: you pass it from **45 of 75** points.",
    ].join("\n\n"),
  ),
  explain(
    "Scoring",
    [
      "- **Leseverstehen, 75 P:** Teil 1 = 5 P per text, Teil 2 = 5 P per question, Teil 3 = 2.5 P per situation.\n- **Sprachbausteine, 30 P:** 1.5 P per gap (20 gaps).\n- **Hörverstehen, 75 P:** Teil 1 = 5 P per text, Teil 2 = 2.5 P per statement, Teil 3 = 5 P per announcement.\n- **Schreiben, 45 P:** three criteria (task, communication, accuracy) graded A = 5, B = 3, C = 1, D = 0; the sum × 3. B-B-B = 9 × 3 = 27 of 45, and that is enough.",
      "Add the four parts: **135 of 225** passes the written exam. After each part, count your points: the part where you lost most is your biggest lever (*größter Hebel*).",
    ].join("\n\n"),
  ),
  explain(
    "How to take the Modelltest",
    [
      "Plan 2.5 hours in one go: phone away, door closed. Use a timer: 90 minutes for Lesen + Sprachbausteine (the first two lessons of each Modelltest), 30 for Hören, 30 for the letter.",
      "## What surprises people on exam day",
      "The 90 minutes for Lesen + Sprachbausteine are one block. Nobody tells you when to switch. Transfer your answers to the answer sheet after each part, and never leave a box empty.",
      "In the real exam you cannot go back after handing in a part. Here the explanation appears after each answer; to simulate the exam, note your answers first and read the explanations afterwards.",
    ].join("\n\n"),
  ),
];

const lesenCards = {
  t1: explain(
    "Lesen Teil 1 · Aufgaben 1–5",
    "5 texts, 10 headlines, 5 stay unused. Each headline fits only one text. **5 points per text.**",
  ),
  t2: explain(
    "Lesen Teil 2 · Aufgaben 6–10",
    "One article, 5 questions, a, b or c. **5 points per question.**",
  ),
  t3: explain(
    "Lesen Teil 3 · Aufgaben 11–20",
    "10 situations, 12 ads. Each ad fits at most once; x = no ad fits (one unrelated ad is left out of each list here). **2.5 points per situation.**",
  ),
};

const writingPointer = explain(
  "Schreiben and Sprechen",
  [
    "The written exam ends with **30 minutes of Schreiben**: one e-mail (about 80 words) that covers all four guiding points, with salutation and closing. Do one task from the **Writing (Schreiben)** unit now, with a 30-minute timer, and grade yourself strictly (when in doubt, one grade lower).",
    "The oral exam is separate (75 points, pass from 45): practise Teil 1–3 in the **Speaking (Sprechen)** units.",
    "Then add up your points: Lesen + Sprachbausteine + Hören + Schreiben. **135 of 225** = passed.",
  ].join("\n\n"),
);

export function build() {
  const lese = data("lese");
  const hoer = data("hoer");
  const sim1 = data("sim1");
  const sim2 = data("sim2");
  const lessons = [
    mkLesson(
      UNIT,
      1,
      "regeln-und-zeit",
      "Exam rules and timing",
      rulesCards,
      "150 minutes, 225 points, 135 to pass.",
    ),
  ];
  let n = 2;
  for (let run = 0; run < RUNS; run++) {
    const pick = (arr) => arr[run % arr.length];
    const set = {
      l1: pick(lese.t1),
      l2: pick(lese.t2),
      l3: pick(lese.t3),
      h1: pick(hoer.t1),
      h2: pick(hoer.t2),
      h3: pick(hoer.t3),
    };
    const m = run + 1;
    lessons.push(
      mkLesson(
        UNIT,
        n++,
        `modelltest-${m}-lesen`,
        `Modelltest ${m} · Lesen (tasks 1–20)`,
        [
          explain(
            `Modelltest ${m}: start the 90-minute block`,
            "Lesen + Sprachbausteine, tasks 1–40, one block of **90 minutes**. Start your timer now; the Sprachbausteine follow in the next lesson.",
          ),
          lesenCards.t1,
          ...readingT1(set.l1, { number: (i) => `Aufgabe ${1 + i}`, seed: `mock-${set.l1.id}` }),
          lesenCards.t2,
          ...readingT2(set.l2, { number: (i) => `Aufgabe ${6 + i}` }),
          lesenCards.t3,
          ...readingT3(set.l3, { number: (i) => `Aufgabe ${11 + i}`, seed: `mock-${set.l3.id}` }),
        ],
        "90 minutes for Lesen + Sprachbausteine together.",
      ),
      mkLesson(
        UNIT,
        n++,
        `modelltest-${m}-sprachbausteine`,
        `Modelltest ${m} · Sprachbausteine (tasks 21–40)`,
        [
          explain(
            "Sprachbausteine Teil 1 · Aufgaben 21–30",
            `*${sim1.intro}*\n\n**1.5 points per gap.** Still inside the 90-minute block.`,
          ),
          ...sb1Exercises(sim1, { number: (k) => `Aufgabe ${k}` }),
          sb2IntroCard(sim2, "Sprachbausteine Teil 2 · Aufgaben 31–40"),
          ...sb2Exercises(sim2, { number: (k) => `Aufgabe ${k}` }),
        ],
        "Look at the verb position first, then the meaning.",
      ),
      mkLesson(
        UNIT,
        n++,
        `modelltest-${m}-hoeren`,
        `Modelltest ${m} · Hören (tasks 41–60)`,
        [
          explain(
            "Hören · 30 minutes",
            `Tasks 41–60, **30 minutes**. Teil 1 runs only once, Teil 2 and 3 twice. Read the statements before each text.\n\n${TIP_DE}`,
          ),
          explain(
            `Hören Teil 1 · Aufgaben 41–45 · ${set.h1.theme}`,
            "Richtig oder falsch? Each text runs **only once**: listen once, then answer. **5 points each.**",
          ),
          ...hoerenStatements(set.h1, 1),
          explain(
            `Hören Teil 2 · Aufgaben 46–55 · ${set.h2.theme}`,
            "You hear the conversation **twice**. Read all statements first. **2.5 points each.**",
          ),
          ...hoerenInterview(set.h2),
          explain(
            `Hören Teil 3 · Aufgaben 56–60 · ${set.h3.theme}`,
            "Richtig oder falsch? Each announcement runs **twice**. **5 points each.**",
          ),
          ...hoerenStatements(set.h3, 3),
          writingPointer,
        ],
        "Missed one? Let it go and look at the next statement.",
      ),
    );
  }

  const units = [
    unit({
      id: UNIT,
      title: "Mock exam (Modelltest)",
      description: "Four full written exams in exam order: Lesen, Sprachbausteine, Hören.",
      level: "B1",
      lessons,
    }),
  ];

  // ---- coverage: every set the app's rotation (n = 0…3) uses must be in the mock.
  const text = allText(lessons);
  const used = (arr) => [...new Set(Array.from({ length: RUNS }, (_, r) => arr[r % arr.length]))];
  const report = [
    covered(
      "lesen.t1",
      used(lese.t1).flatMap((s) => s.texts),
      text,
    ),
    covered(
      "lesen.t2",
      used(lese.t2).flatMap((s) => s.qs.map((q) => q.q)),
      text,
    ),
    covered(
      "lesen.t3",
      used(lese.t3).flatMap((s) => s.sits.map((x) => x.de)),
      text,
    ),
    covered(
      "sim1",
      sim1.items.flatMap((it) => it.o),
      text,
    ),
    covered(
      "sim2",
      sim2.bank.map((w) => w.toLowerCase()),
      text,
    ),
    covered(
      "hoeren.t1",
      used(hoer.t1).flatMap((s) => s.items.map((x) => x.s)),
      text,
    ),
    covered(
      "hoeren.t2",
      used(hoer.t2).flatMap((s) => s.stmts.map((x) => x.s)),
      text,
    ),
    covered(
      "hoeren.t3",
      used(hoer.t3).flatMap((s) => s.items.map((x) => x.s)),
      text,
    ),
  ];
  const sets = `t1 ${used(lese.t1).length}/${lese.t1.length}, t2 ${used(lese.t2).length}/${lese.t2.length}, t3 ${used(lese.t3).length}/${lese.t3.length}, h1 ${used(hoer.t1).length}/${hoer.t1.length}, h2 ${used(hoer.t2).length}/${hoer.t2.length}, h3 ${used(hoer.t3).length}/${hoer.t3.length}`;
  console.log(`mock coverage · sets used: ${sets} · ${report.join(" · ")}`);
  return units;
}
