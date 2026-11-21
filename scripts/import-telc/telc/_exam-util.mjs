/**
 * Shared builders for the telc exam-part modules (reading, bausteine, listening, mock).
 * Each builder turns one source set into exercises WITHOUT ids (lesson() adds them), so
 * the practice units and the Modelltest can reuse the same source items under their own
 * lesson ids.
 */
import { htmlToPlain, htmlToRich, lesson, optionId, rng, shuffled, slug } from "../lib.mjs";

export const COURSE_ID = "telc-b1-en-de";
export const LETTER = (i) => String.fromCharCode(65 + i); // UI shows options as A, B, C …

/** Lesson with id `<unitId>-lNN-<slug>`. */
export function mkLesson(unitId, n, slugText, title, exercises, tip) {
  const id = `${unitId}-l${String(n).padStart(2, "0")}-${slug(slugText, 40)}`;
  if (id.length > 64) throw new Error(`lesson id too long: ${id}`);
  return lesson({ id, courseId: COURSE_ID, unitId, title, tip, exercises });
}

export const explain = (title, body, examples) => ({
  type: "explain",
  title,
  body,
  ...(examples && examples.length ? { examples } : {}),
});

const opts = (texts) => texts.map((text, i) => ({ id: optionId(i), text }));

/** First `n` words of a text, for referring to an ad by its content. */
const firstWords = (text, n = 4) => {
  const words = text.split(/\s+/);
  return words.length <= n ? text : `${words.slice(0, n).join(" ")} …`;
};

// ---------------------------------------------------------------- Lesen

/**
 * Lesen Teil 1: one `choice` per text, options = all 10 headlines in a fixed per-set
 * shuffled order (the source lists the correct headline first, then its trap, so the
 * source order would give the answers away). Letters in `w` ("Falle j") are remapped.
 */
export function readingT1(set, { number = (i) => `Text ${i + 1}`, seed = set.id } = {}) {
  const perm = shuffled(
    set.heads.map((_, i) => i),
    rng(`t1-${seed}`),
  );
  const pos = new Map(perm.map((src, i) => [src, i]));
  const remap = (w) =>
    htmlToRich(w).replace(
      /\bFalle ([a-j])\b/g,
      (_m, l) => `Falle ${LETTER(pos.get(l.charCodeAt(0) - 97))}`,
    );
  return set.texts.map((text, i) => {
    const key = set.key[i];
    return {
      type: "choice",
      title: `${number(i)} · ${set.theme}`,
      passage: htmlToRich(text),
      prompt: `Welche Überschrift passt zu Text ${i + 1}?`,
      options: opts(perm.map((h) => htmlToPlain(set.heads[h]))),
      correctOptionId: optionId(pos.get(key)),
      explanation: `**Answer: ${LETTER(pos.get(key))}** „${htmlToPlain(set.heads[key])}“\n\n${remap(set.w[i])}`,
    };
  });
}

/** Lesen Teil 2: the whole article as passage, one `choice` per question (a/b/c kept). */
export function readingT2(set, { number = (i) => `Frage ${i + 1}` } = {}) {
  const passage = set.art.map(htmlToRich).join("\n\n");
  const fix = (w) =>
    htmlToRich(w)
      .replace(/\bAntwort ([abc])\b/g, (_m, l) => `Antwort ${l.toUpperCase()}`)
      .replace(/\b([abc])\/([abc])\b/g, (_m, x, y) => `${x.toUpperCase()}/${y.toUpperCase()}`);
  return set.qs.map((q, i) => ({
    type: "choice",
    title: `${set.title} · ${number(i)}`,
    passage,
    prompt: htmlToPlain(q.q),
    options: opts(q.o.map(htmlToPlain)),
    correctOptionId: optionId(q.a),
    explanation: `**Answer: ${LETTER(q.a)}** „${htmlToPlain(q.o[q.a])}“\n\n${fix(q.w)}`,
  }));
}

const NO_AD = "Keine Anzeige passt (x)";
const words = (s) => new Set(s.toLowerCase().match(/[a-zäöüß]{4,}/g) ?? []);

/**
 * Lesen Teil 3: one `choice` per situation. 12 ads + "x" would be 13 options (max 12), so
 * per situation one ad is left out: never the answer, never an ad the explanation names,
 * and the one sharing fewest words with the situation. Ads appear in a fixed per-set
 * shuffled order (source order would mirror the situations); `w` references such as
 * "Anzeige 12" are rewritten to name the ad by its first words.
 */
export function readingT3(set, { number = (i) => `Situation ${i + 1}`, seed = set.id } = {}) {
  const perm = shuffled(
    set.ads.map((_, i) => i),
    rng(`t3-${seed}`),
  );
  const adRef = (n) => `„${firstWords(htmlToPlain(set.ads[n - 1]))}“`;
  const rewrite = (w) =>
    htmlToRich(w)
      .replace(/\b(Anzeige|Kurs) (\d{1,2})\b/g, (_m, word, n) => `${word} ${adRef(Number(n))}`)
      .replace(/\) und (\d{1,2}) \(/g, (_m, n) => `) und ${adRef(Number(n))} (`);
  const dropped = [];
  const exercises = set.sits.map((sit, i) => {
    const key = set.key[i];
    const named = new Set(
      [...(set.w[i] ?? "").matchAll(/\b(?:Anzeige|Kurs|und) (\d{1,2})\b/g)].map(
        (m) => Number(m[1]) - 1,
      ),
    );
    const sw = words(`${sit.de} ${sit.c.join(" ")}`);
    let drop = -1;
    let best = Infinity;
    for (const a of [...perm].reverse()) {
      if (a === key || named.has(a)) continue;
      const overlap = [...words(set.ads[a])].filter((x) => sw.has(x)).length;
      if (overlap < best) {
        best = overlap;
        drop = a;
      }
    }
    dropped.push(drop);
    const shown = perm.filter((a) => a !== drop);
    const texts = [...shown.map((a) => htmlToPlain(set.ads[a])), NO_AD];
    const correct = key === "x" ? texts.length - 1 : shown.indexOf(key);
    if (correct < 0) throw new Error(`${set.id} sit ${i}: answer dropped`);
    const answer = key === "x" ? "x · keine Anzeige passt" : `„${htmlToPlain(set.ads[key])}“`;
    const parts = [
      `**Answer: ${LETTER(correct)}** ${answer}`,
      `*Bedingungen:* ${sit.c.map(htmlToPlain).join(" + ")}`,
    ];
    if (set.w[i]) parts.push(rewrite(set.w[i]));
    return {
      type: "choice",
      title: `${number(i)} · ${set.theme}`,
      passage: htmlToRich(sit.de),
      prompt: "Welche Anzeige passt? Wenn keine passt: x.",
      options: opts(texts),
      correctOptionId: optionId(correct),
      explanation: parts.join("\n\n"),
    };
  });
  return exercises;
}

// ---------------------------------------------------------------- Sprachbausteine

/** Topic tag of a gap from its chapter number `ch` (telc app `sbTag` / `chapterTitle`). */
const CHAPTERS = {
  2: "Konnektoren (connectors)",
  3: "Präpositionen (prepositions)",
  4: "Verb + Präposition",
  5: "Verbformen (verb forms)",
  6: "Relativsätze (relative clauses)",
  7: "Pronomen · Register",
  8: "Adjektivendungen (adjective endings)",
  9: "Kleine Klassiker (small classics)",
  10: "Wortschatz · Briefbausteine (vocabulary & letter chunks)",
};
const AUX = ["bin", "habe", "ist", "hat", "sind", "haben", "bist", "hast"];
export function sbTag(ch, answer) {
  if (ch === 5 && AUX.includes(answer)) return "Perfekt · Hilfsverb (auxiliary)";
  return CHAPTERS[ch] ?? "Grammatik";
}
export const CHAPTER_TITLES = CHAPTERS;

/** Feedback for a gap: answer, topic tag, English (`we`) then German (`w`) explanation. */
export function gapExplanation(answer, ch, item) {
  const head = `**Answer: ${answer}**${ch != null ? ` · ${sbTag(ch, answer)}` : ""}`;
  return `${head}\n\n${htmlToRich(item.we)}\n\n*Auf Deutsch:* ${htmlToRich(item.w)}`;
}

/** Letter text with gap `current` marked bold and all other gaps numbered. */
export function gapPassage(lines, current) {
  return lines
    .join("\n")
    .replace(/\{(\d+)\}/g, (_m, d) => (Number(d) === current ? `**(${d}) ______**` : `(${d}) …`))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Sprachbausteine Teil 1: per gap a `choice` with the letter as passage, options a/b/c. */
export function sb1Exercises(sim, { number = (n) => `Lücke ${n}` } = {}) {
  return sim.items.map((it) => ({
    type: "choice",
    title: `Sprachbausteine Teil 1 · ${number(it.n)}`,
    passage: gapPassage(sim.text, it.n),
    prompt: `${number(it.n)}: Welche Lösung passt?`,
    options: opts(it.o.map(htmlToPlain)),
    correctOptionId: optionId(it.a),
    explanation: gapExplanation(htmlToPlain(it.o[it.a]), it.ch, it),
  }));
}

/**
 * Sprachbausteine Teil 2: per gap a `choice`; the bank has 15 words but a choice has at
 * most 12 options, so 3 words are left out per gap: only answers of OTHER gaps (in the
 * exam each word fits once), never a word the explanation names as the trap ("Zwilling"),
 * preferring words already used for earlier gaps.
 */
export function sb2Exercises(sim, { number = (n) => `Lücke ${n}` } = {}) {
  const bank = sim.bank.map((w) => w.toLowerCase());
  return sim.items.map((it, idx) => {
    const named = new Set((it.w.match(/\b[A-ZÄÖÜ]{2,}\b/g) ?? []).map((w) => w.toLowerCase()));
    const others = sim.items.filter((o) => o !== it).map((o) => o.a);
    const earlier = sim.items
      .slice(0, idx)
      .map((o) => o.a)
      .reverse();
    const later = shuffled(
      others.filter((a) => !earlier.includes(a)),
      rng(`sb2-${it.n}`),
    );
    const drop = [...earlier, ...later].filter((a) => !named.has(bank[a])).slice(0, 3);
    if (drop.length !== 3) throw new Error(`sb2 gap ${it.n}: cannot drop 3 words`);
    const shown = bank.map((_, i) => i).filter((i) => !drop.includes(i));
    return {
      type: "choice",
      title: `Sprachbausteine Teil 2 · ${number(it.n)}`,
      passage: gapPassage(sim.text, it.n),
      prompt: `${number(it.n)}: Welches Wort passt?`,
      options: opts(shown.map((i) => bank[i])),
      correctOptionId: optionId(shown.indexOf(it.a)),
      explanation: gapExplanation(bank[it.a], it.ch, it),
    };
  });
}

/** Sprachbausteine Teil 2 intro card: instruction, the ad the letter answers, the whole bank. */
export function sb2IntroCard(sim, title = "Teil 2 · the ad and the word bank") {
  return explain(
    title,
    [
      `*${sim.intro}*`,
      "The letter answers this ad (*Anzeige*):",
      sim.ad.map(htmlToRich).join("\n"),
      `**Word bank (a–o):** ${sim.bank.map((w, i) => `${String.fromCharCode(97 + i)}) ${w.toLowerCase()}`).join(" · ")}`,
      "In this app each gap shows 12 of the 15 words: words that belong in other gaps are partly left out (in the exam every word fits only once and five stay unused).",
    ].join("\n\n"),
  );
}

// ---------------------------------------------------------------- Hören

export const RF = opts(["richtig", "falsch"]);

/** Interview script ("Moderator: … Keller: …" in one string) → one `Name: text` line per turn. */
export function splitDialog(script) {
  const re = /(?:^|\s)([A-ZÄÖÜ][a-zäöüß]+(?: [A-ZÄÖÜ][a-zäöüß]+)?):\s/g;
  const matches = [...script.matchAll(re)];
  if (!matches.length) return script.trim();
  return matches
    .map((m, i) => {
      const start = m.index + m[0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : script.length;
      return `${m[1]}: ${script.slice(start, end).trim()}`;
    })
    .join("\n");
}

/** One richtig/falsch `listening` exercise. */
export function rfListening({ title, transcript, statement, rf, w, number }) {
  return {
    type: "listening",
    title,
    transcript,
    prompt: `${number ? `${number}. ` : ""}${htmlToPlain(statement)} Richtig oder falsch?`,
    options: RF,
    correctOptionId: rf ? "a" : "b",
    explanation: `**${rf ? "Richtig" : "Falsch"}.** ${htmlToRich(w)}`,
  };
}

/** Hören Teil 1 (first = 41) / Teil 3 (first = 56): one listening item per text. */
export function hoerenStatements(set, part, { first = part === 1 ? 41 : 56 } = {}) {
  const label = part === 1 ? "Hören Teil 1 · Text" : "Hören Teil 3 · Durchsage";
  return set.items.map((it, i) =>
    rfListening({
      title: `${label} ${i + 1} von ${set.items.length} · ${set.theme}`,
      transcript: htmlToPlain(it.a),
      statement: it.s,
      rf: it.rf,
      w: it.w,
      number: first + i,
    }),
  );
}

/** Hören Teil 2: the whole interview as transcript for each of the 10 statements (46–55). */
export function hoerenInterview(set, { first = 46 } = {}) {
  const transcript = splitDialog(set.script);
  return set.stmts.map((st, i) =>
    rfListening({
      title: `Hören Teil 2 · Interview: ${set.theme}`,
      transcript,
      statement: st.s,
      rf: st.rf,
      w: st.w,
      number: first + i,
    }),
  );
}

// ---------------------------------------------------------------- coverage

/** All string values of a structure, joined (for "is this source text in the output?"). */
export function allText(value) {
  const out = [];
  const walk = (v) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(value);
  return out.join("\n");
}

/**
 * Throws if any needle is missing from the output text; returns "label: n/n" for the log.
 * Needles are normalised like the output (rich/plain conversion done by the caller).
 */
export function covered(label, needles, haystack) {
  const missing = needles.filter((n) => n && !haystack.includes(n));
  if (missing.length) {
    throw new Error(
      `coverage ${label}: ${missing.length} missing, e.g. ${JSON.stringify(missing.slice(0, 3))}`,
    );
  }
  return `${label}: ${needles.length}/${needles.length}`;
}

/** Fragments of a gap text (source lines split at the {n} markers), for coverage. */
export const gapFragments = (lines) =>
  lines
    .flatMap((l) => l.split(/\{\d+\}/))
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
