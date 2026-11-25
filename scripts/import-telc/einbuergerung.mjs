/**
 * Einbürgerungstest module (TELC-001): course `einbuergerung-en-de`, units eb-u01 … eb-u14.
 *
 * Source: ../telcB1-web/src/data/eb.json (land, stand, 13 blocks with English `kompass` and
 * German `kompassDe`, 310 questions). App logic mirrored from telcB1-web:
 * - src/sessions/EB.jsx: block practice shows the Kompass first; picture questions (`img`)
 *   show "Bildfrage: Im echten Test siehst du hier Abbildungen. Die Antworten beschreiben
 *   sie."; the explanation is EN = enShort + enLong, DE = wd; vocab is shown as "Wortschatz".
 *   Simulation = 30 random general questions + 3 random Landesfragen, 60 minutes (3600 s),
 *   passed at ≥ 17, personal goal "3× in Folge 28+".
 * - src/core/content.js: a Landesfrage is a question whose label starts with "NRW".
 * - TELC-004 (PD-075): the telc app's NRW block is replaced by the 10 official Landesfragen
 *   for Niedersachsen (labels "NDS-1" …), and NRW/Dortmund notes in general questions are
 *   rewritten: see land-niedersachsen.mjs.
 * - `clock` is not rendered by the app; in the data it marks time-sensitive answers
 *   (officeholders, seat shares, population, EU members) whose wd/enLong say
 *   "⏰ re-check before the test". We turn it into an explicit note.
 *
 * Units: one per block (Kompass lesson + question lessons of ~10), then "Mock tests (Probetest)".
 */
import { LAND, withNiedersachsen } from "./land-niedersachsen.mjs";
import { withPictures } from "./pictures.mjs";
import { chunk, data, lesson, optionId, rng, shuffled, slug, unit } from "./lib.mjs";

const COURSE_ID = "einbuergerung-en-de";
const QUESTIONS_PER_LESSON = 10;
const MOCK_GENERAL = 30;
const MOCK_LAND = 3;
const PASS_MARK = 17;
const MINUTES = 60;
const CARD_SPLIT = 650; // English Kompass longer than this is split into several cards

/** English unit titles (German block title kept in parentheses). */
const BLOCK_EN = {
  1: "Basic rights, constitution & rule of law",
  2: "Democracy, welfare state, federalism & parties",
  3: "Constitutional bodies: Bundestag, Bundesrat, President, Chancellor",
  4: "Elections, party finances & welfare state",
  5: "Elections in detail & political participation",
  6: "Justice & the rule of law in everyday life",
  7: "Nazi dictatorship, World War II & new beginning",
  8: "Divided Germany: GDR, the Wall & the Peaceful Revolution",
  9: "End of the GDR, reunification & remembrance",
  10: "Germany today, neighbours & Europe",
  11: "Family, children, education & work",
  12: "Society, religion, holidays & migration",
  13: `State questions for ${LAND.enName}`,
};

const isLand = (q) => q.label.startsWith(`${LAND.prefix}-`);
const qLabel = (q) => (isLand(q) ? q.label.replace(/-/g, " ") : `Frage ${q.n}`);
const unitId = (n) => `eb-u${String(n).padStart(2, "0")}`;
const lessonId = (u, n, s) => `${u}-l${String(n).padStart(2, "0")}-${s}`;

/** Splits text into sentences without breaking "Art. 5", "(→Q167)" etc. */
function sentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"*(])/u).filter(Boolean);
}

/** Groups sentences into parts of roughly `max` chars (never splits a sentence). */
function splitText(text, max) {
  if (text.length <= max) return [text];
  const ss = sentences(text);
  const parts = Math.ceil(text.length / max);
  const target = text.length / parts;
  const out = [];
  let cur = "";
  for (const s of ss) {
    if (cur && cur.length + s.length > target * 1.15 && out.length < parts - 1) {
      out.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out;
}

function explanation(q, stand) {
  const parts = [`**Correct answer:** ${q.o[q.a]}`];
  if (q.figure) {
    parts.push(
      "*Picture question (Bildfrage):* the pictures above are the ones from the official question catalogue.",
    );
  } else if (q.img) {
    parts.push(
      "*Picture question (Bildfrage):* in the real test you see pictures here, and the answer options describe them.",
    );
  }
  parts.push(q.enShort);
  if (q.pictureNote) parts.push(q.pictureNote);
  if (q.enLong) parts.push(q.enLong);
  if (q.clock) {
    parts.push(
      `**Time-sensitive answer:** this answer depends on the current situation (who holds an office, seat shares, figures) and is correct as of the catalogue version *Stand ${stand}*. Check it again shortly before your test date.`,
    );
  }
  parts.push("## Auf Deutsch", q.wd);
  if (q.vocab) parts.push(`**Vocabulary (Wortschatz):** ${q.vocab}`);
  return parts.join("\n\n");
}

function choice(q, block, stand) {
  return {
    type: "choice",
    title: isLand(q) ? `${qLabel(q)} · Landesfrage` : `${qLabel(q)} · Block ${block.id}`,
    prompt: q.q,
    ...(q.figure ? { figure: q.figure } : {}),
    options: q.o.map((text, i) => ({ id: optionId(i), text })),
    correctOptionId: optionId(q.a),
    explanation: explanation(q, stand),
  };
}

function rangeLabel(qs) {
  const a = qs[0];
  const b = qs[qs.length - 1];
  if (isLand(a)) return `${qLabel(a)}–${b.label.slice(LAND.prefix.length + 1)}`;
  return `${a.n}–${b.n}`;
}

export function build() {
  const eb = withPictures(withNiedersachsen(data("eb")));
  const { land, stand, blocks, qs } = eb;
  const blockById = new Map(blocks.map((b) => [b.id, b]));
  const general = qs.filter((q) => !isLand(q));
  const landQs = qs.filter(isLand);
  const bundles = [];
  const used = new Map(qs.map((q) => [q.n, { block: 0, mock: 0 }]));
  const kompassCards = [];

  blocks.forEach((block, bi) => {
    const uId = unitId(bi + 1);
    const enTitle = BLOCK_EN[block.id] ?? block.title;
    const lessons = [];
    const enParts = splitText(block.kompass, CARD_SPLIT);
    const cards = enParts.map((body, i) => ({
      type: "explain",
      title:
        enParts.length > 1
          ? `Kompass: ${enTitle} (${i + 1}/${enParts.length})`
          : `Kompass: ${enTitle}`,
      body,
    }));
    cards.push({
      type: "explain",
      title: `Kompass auf Deutsch: ${block.title}`,
      body: block.kompassDe,
    });
    kompassCards.push({ block, en: enParts, de: block.kompassDe });
    lessons.push(
      lesson({
        id: lessonId(uId, 1, "kompass"),
        courseId: COURSE_ID,
        unitId: uId,
        title: `Kompass: ${enTitle}`,
        tip: "Read the Kompass first: it gives you the key facts behind every question in this block.",
        exercises: cards,
      }),
    );
    const blockQs = qs.filter((q) => q.block === block.id);
    chunk(blockQs, QUESTIONS_PER_LESSON).forEach((group, gi) => {
      for (const q of group) used.get(q.n).block++;
      const range = rangeLabel(group);
      const land = isLand(group[0]);
      lessons.push(
        lesson({
          id: lessonId(uId, gi + 2, land ? `${slug(range)}` : `q${slug(range)}`),
          courseId: COURSE_ID,
          unitId: uId,
          title: land ? `Questions ${range}` : `Questions ${range} (Fragen ${range})`,
          tip: group.some((q) => q.img)
            ? "Some of these are picture questions: look at the pictures, just like in the real test."
            : "After each Check you get an English explanation and a short German note (Auf Deutsch).",
          exercises: group.map((q) => choice(q, blockById.get(q.block), stand)),
        }),
      );
    });
    bundles.push(
      unit({
        id: uId,
        title:
          `${enTitle} (${block.title})`.length <= 280 ? `${enTitle} (${block.title})` : enTitle,
        description: `Block ${block.id} · ${block.rng.replace(/Q/g, "Fragen ")}`,
        lessons,
      }),
    );
  });

  // ---- Mock tests (Probetest) ----
  const mockUnitId = unitId(blocks.length + 1);
  const testCount = Math.max(
    Math.ceil(general.length / MOCK_GENERAL),
    Math.ceil(landQs.length / MOCK_LAND),
  );
  const random = rng("einbuergerung-mock-v1");
  // General: shuffle once, deal into tests; top up the last tests from a second shuffle if short.
  let pool = shuffled(general, random);
  while (pool.length < testCount * MOCK_GENERAL) pool = pool.concat(shuffled(general, random));
  const generalSets = Array.from({ length: testCount }, (_, t) =>
    pool.slice(t * MOCK_GENERAL, (t + 1) * MOCK_GENERAL),
  );
  // Land: consecutive rounds of shuffles, no duplicate inside a test.
  let landPool = [];
  const landSets = [];
  for (let t = 0; t < testCount; t++) {
    const set = [];
    while (set.length < MOCK_LAND) {
      if (landPool.length === 0) landPool = shuffled(landQs, random);
      const idx = landPool.findIndex((q) => !set.includes(q));
      set.push(landPool.splice(idx, 1)[0]);
    }
    landSets.push(set);
  }
  // Keep each test's general questions in catalogue order (like the real paper test).
  const total = MOCK_GENERAL + MOCK_LAND;
  const rulesBody = [
    "## The real test",
    [
      `- ${total} questions: ${MOCK_GENERAL} general questions (from the ${general.length}-question federal catalogue) + ${MOCK_LAND} state questions (Landesfragen) for ${land} (from ${landQs.length}).`,
      `- ${MINUTES} minutes in total.`,
      "- Every question has 4 answers; exactly one is correct.",
      `- You pass with at least **${PASS_MARK} correct answers**.`,
    ].join("\n"),
    `Questions in this course: ${land}, catalogue version *Stand ${stand}*.`,
    "## How to use these mock tests",
    [
      `- There are ${testCount} fixed mock tests. Together they contain every general question at least once, and every Landesfrage of ${land} at least once.`,
      `- Set a ${MINUTES}-minute timer and answer all ${total} questions in one go.`,
      "- In the real test you see no solutions until the end. Here the explanation appears after each Check: try to answer first, then read it.",
      "- Goal from the telc app: 28 or more correct, three times in a row. Then you are well prepared.",
      "- Picture questions (Bildfrage) show the same pictures as the official catalogue.",
      "- Answers marked as time-sensitive (current Chancellor, largest parliamentary groups, Federal President, population, EU members) can change: check them shortly before your test.",
    ].join("\n"),
  ].join("\n\n");
  const mockLessons = [
    lesson({
      id: lessonId(mockUnitId, 1, "rules"),
      courseId: COURSE_ID,
      unitId: mockUnitId,
      title: "How the test works (So läuft der Test)",
      tip: `${total} questions, ${MINUTES} minutes, pass with ${PASS_MARK} correct.`,
      exercises: [
        { type: "explain", title: "Einbürgerungstest: rules and format", body: rulesBody },
      ],
    }),
  ];
  for (let t = 0; t < testCount; t++) {
    const gen = [...generalSets[t]].sort((a, b) => a.n - b.n);
    const lnd = [...landSets[t]].sort((a, b) => a.n - b.n);
    const all = [...gen, ...lnd];
    for (const q of all) used.get(q.n).mock++;
    mockLessons.push(
      lesson({
        id: lessonId(mockUnitId, t + 2, `probetest-${t + 1}`),
        courseId: COURSE_ID,
        unitId: mockUnitId,
        title: `Mock test ${t + 1} (Probetest ${t + 1})`,
        tip: `Real format: ${MOCK_GENERAL} general + ${MOCK_LAND} ${land} questions. Allow ${MINUTES} minutes; ${PASS_MARK} correct to pass, aim for 28+.`,
        exercises: all.map((q) => choice(q, blockById.get(q.block), stand)),
      }),
    );
  }
  bundles.push(
    unit({
      id: mockUnitId,
      title: "Mock tests (Probetest)",
      description: `${testCount} full tests: ${total} questions (${MOCK_GENERAL} + ${MOCK_LAND} ${land}) · ${MINUTES} minutes · pass with ${PASS_MARK}`,
      lessons: mockLessons,
    }),
  );

  coverage({ eb, bundles, used, kompassCards, rulesBody, testCount });
  return bundles;
}

/** Throws if any source item or field is missing from the output; prints counts. */
function coverage({ eb, bundles, used, kompassCards, rulesBody, testCount }) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const errors = [];
  const exercises = bundles.flatMap((b) => b.lessons.flatMap((l) => l.exercises));
  const choices = exercises.filter((e) => e.type === "choice");
  const explains = exercises.filter((e) => e.type === "explain");
  const byPrompt = new Map();
  for (const e of choices) {
    if (!byPrompt.has(e.prompt)) byPrompt.set(e.prompt, []);
    byPrompt.get(e.prompt).push(e);
  }
  const counts = { q: 0, o: 0, a: 0, img: 0, clock: 0, wd: 0, enShort: 0, enLong: 0, vocab: 0 };
  for (const q of eb.qs) {
    const u = used.get(q.n);
    if (u.block !== 1) errors.push(`${q.label}: in ${u.block} block lessons`);
    if (u.mock < 1) errors.push(`${q.label}: in no mock test`);
    const es = (byPrompt.get(q.q) ?? []).filter(
      (e) => e.options.length === q.o.length && e.options.every((o, i) => o.text === q.o[i]),
    );
    if (es.length !== u.block + u.mock)
      errors.push(`${q.label}: ${es.length} exercises, expected ${u.block + u.mock}`);
    if (es.length === 0) continue;
    counts.q++;
    counts.o += q.o.length;
    let ok = {
      a: true,
      img: true,
      clock: true,
      wd: true,
      enShort: true,
      enLong: true,
      vocab: true,
    };
    for (const e of es) {
      const x = e.explanation;
      if (e.correctOptionId !== optionId(q.a) || !x.includes(q.o[q.a])) ok.a = false;
      if (q.img && !x.includes("Picture question")) ok.img = false;
      if (q.figure && JSON.stringify(e.figure) !== JSON.stringify(q.figure)) ok.img = false;
      if (q.pictureNote && !x.includes(q.pictureNote)) ok.img = false;
      if (q.clock && !x.includes("Time-sensitive answer")) ok.clock = false;
      for (const k of ["wd", "enShort", "enLong", "vocab"])
        if (q[k] && !x.includes(q[k])) ok[k] = false;
    }
    for (const [k, v] of Object.entries(ok)) {
      if (!v) errors.push(`${q.label}: field ${k} not covered`);
      else if (
        k === "a" ||
        (k === "img" && q.img) ||
        (k === "clock" && q.clock) ||
        (!["a", "img", "clock"].includes(k) && q[k])
      )
        counts[k]++;
    }
  }
  const bodies = explains.map((e) => e.body);
  let kompass = 0;
  let kompassDe = 0;
  for (const { block, en, de } of kompassCards) {
    if (norm(en.join(" ")) !== norm(block.kompass) || !en.every((p) => bodies.includes(p)))
      errors.push(`block ${block.id}: kompass not fully covered`);
    else kompass++;
    if (!bodies.includes(de)) errors.push(`block ${block.id}: kompassDe missing`);
    else kompassDe++;
  }
  if (!rulesBody.includes(eb.land) || !rulesBody.includes(eb.stand))
    errors.push("land/stand missing from rules card");
  const blocksUsed = new Set(eb.qs.map((q) => q.block));
  for (const b of eb.blocks)
    if (!blocksUsed.has(b.id)) errors.push(`block ${b.id} has no questions`);
  if (errors.length)
    throw new Error(`einbuergerung coverage failed:\n${errors.slice(0, 30).join("\n")}`);
  const has = (k) => eb.qs.filter((q) => (k === "img" || k === "clock" ? q[k] : q[k])).length;
  console.log(
    `einbuergerung coverage: questions ${counts.q}/${eb.qs.length}, options ${counts.o}/${eb.qs.length * 4}, ` +
      `answers ${counts.a}/${eb.qs.length}, enShort ${counts.enShort}/${has("enShort")}, enLong ${counts.enLong}/${has("enLong")}, ` +
      `wd ${counts.wd}/${has("wd")}, vocab ${counts.vocab}/${has("vocab")}, img ${counts.img}/${has("img")}, clock ${counts.clock}/${has("clock")}, ` +
      `kompass ${kompass}/${eb.blocks.length}, kompassDe ${kompassDe}/${eb.blocks.length}, land+stand 1/1, mock tests ${testCount}`,
  );
}
