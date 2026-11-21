/**
 * Helpers shared by telc/overview.mjs, telc/writing.mjs and telc/speaking.mjs (TELC-001).
 * Exercise builders that enforce the contract limits up front (so a bad item throws here
 * with a readable message), plus a coverage helper.
 */
import { optionId, rng, shuffled } from "../lib.mjs";

export const COURSE = "telc-b1-en-de";

// Same punctuation set as src/contracts/text.ts (tokenizeAnswer).
const PUNCT = /[.,;:!?¡¿"“”„‚«»‹›()[\]{}…–—-]/gu;

/** Tokens of `s` like tokenizeAnswer, but keeping the authored case (for tiles). */
export function tokensKeepCase(s) {
  return String(s)
    .normalize("NFC")
    .replace(/[‘’`´]/gu, "'")
    .replace(PUNCT, " ")
    .split(/\s+/u)
    .filter(Boolean);
}
const low = (t) => t.toLowerCase();

function countMap(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}
export function buildable(answer, tiles) {
  const have = countMap(tiles.flatMap((t) => tokensKeepCase(t).map(low)));
  const need = countMap(tokensKeepCase(answer).map(low));
  if (need.size === 0) return false;
  for (const [t, n] of need) if ((have.get(t) ?? 0) < n) return false;
  return true;
}

function fail(msg) {
  throw new Error(msg);
}
/**
 * Makes authored markup parse as intended (rich-text.ts): a "## " heading must be a block
 * of its own, and a bullet list must not share a block with plain lines.
 */
export function fixRich(text) {
  const isList = (l) => /^\s*[-•] /.test(l);
  const out = [];
  for (const line of String(text).split("\n")) {
    const prev = out.length ? out[out.length - 1] : "";
    const blank = line.trim() === "";
    if (!blank && prev.trim() !== "") {
      const head = line.startsWith("## ") || prev.startsWith("## ");
      if (head || isList(line) !== isList(prev)) out.push("");
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

function rich(s, max, what) {
  return len(fixRich(s), max, what);
}

function len(s, max, what) {
  if (typeof s !== "string" || !s.trim()) fail(`${what}: empty`);
  if (s.trim().length > max) fail(`${what}: ${s.length} > ${max}: ${s.slice(0, 80)}`);
  return s.trim();
}

/** Tiles for an answer: its words plus distractors, merged into pairs if over 24. */
function makeTiles(answer, distractorPool, seed, nDistractors = 3) {
  const random = rng(seed);
  let words = tokensKeepCase(answer);
  const inAnswer = new Set(words.map(low));
  const pool = [...new Set(distractorPool.flatMap((p) => tokensKeepCase(p)))].filter(
    (w) => !inAnswer.has(low(w)) && w.length <= 40,
  );
  const seen = new Set();
  const distractors = [];
  for (const w of shuffled(pool, random)) {
    if (distractors.length >= nDistractors) break;
    if (seen.has(low(w))) continue;
    seen.add(low(w));
    distractors.push(w);
  }
  let tiles = words;
  // Merge neighbours until it fits (answer tiles + distractors ≤ 24, each ≤ 40 chars).
  let group = 1;
  while (tiles.length + distractors.length > 24) {
    group++;
    tiles = [];
    for (let i = 0; i < words.length; i += group) tiles.push(words.slice(i, i + group).join(" "));
    if (tiles.some((t) => t.length > 40)) fail(`cannot tile: ${answer}`);
  }
  return shuffled([...tiles, ...distractors], random);
}

/** `listen` exercise: German TTS reads answers[0]; learner builds it from tiles. */
export function listenEx({ answer, pool, seed, src, explanation }) {
  len(answer, 280, "listen answer");
  const tiles = makeTiles(answer, pool, seed);
  if (!buildable(answer, tiles)) fail(`listen not buildable: ${answer}`);
  return {
    type: "listen",
    audio: { src: `/audio/de/telc/${src}.mp3` },
    tiles,
    answers: [answer],
    ...(explanation ? { explanation: rich(explanation, 3000, "explanation") } : {}),
  };
}

/** `word_bank_translate` to_learning: English prompt, German answer(s). */
export function wordBankEx({ prompt, answers, distractors, seed, explanation }) {
  len(prompt, 280, "wb prompt");
  const uniq = [...new Set(answers.map((a) => len(a, 280, "wb answer")))];
  const tiles = makeTiles(uniq[0], [], seed, 0);
  // Alternatives may need extra tokens; add any missing ones.
  for (const a of uniq.slice(1)) {
    const have = countMap(tiles.flatMap((t) => tokensKeepCase(t).map(low)));
    const need = countMap(tokensKeepCase(a).map(low));
    for (const [t, n] of need) for (let i = have.get(t) ?? 0; i < n; i++) tiles.push(t);
  }
  const answerTokens = new Set(uniq.flatMap((a) => tokensKeepCase(a).map(low)));
  const ds = distractors.filter((d) => !answerTokens.has(low(d))).slice(0, 4);
  const all = shuffled([...tiles, ...ds], rng(`${seed}-d`));
  if (all.length > 24) fail(`too many tiles: ${uniq[0]}`);
  for (const a of uniq) if (!buildable(a, all)) fail(`wb not buildable: ${a}`);
  return {
    type: "word_bank_translate",
    direction: "to_learning",
    prompt: prompt.trim(),
    tiles: all,
    answers: uniq,
    ...(explanation ? { explanation: rich(explanation, 3000, "explanation") } : {}),
  };
}

/** `choice` exercise; options shuffled deterministically, texts must be unique. */
export function choiceEx({ title, passage, prompt, correct, distractors, explanation, seed }) {
  const texts = [correct, ...distractors].map((t) => len(t, 400, "option"));
  const lower = texts.map((t) => t.toLowerCase());
  if (new Set(lower).size !== lower.length) fail(`duplicate options: ${texts.join(" | ")}`);
  if (texts.length < 2 || texts.length > 12) fail(`option count ${texts.length}`);
  const order = shuffled(
    texts.map((_, i) => i),
    rng(seed),
  );
  const options = order.map((src, i) => ({ id: optionId(i), text: texts[src] }));
  return {
    type: "choice",
    ...(title ? { title: len(title, 160, "choice title") } : {}),
    ...(passage ? { passage: rich(passage, 8000, "passage") } : {}),
    prompt: len(prompt, 600, "choice prompt"),
    options,
    correctOptionId: optionId(order.indexOf(0)),
    ...(explanation ? { explanation: rich(explanation, 3000, "explanation") } : {}),
  };
}

export function explainEx({ title, body, examples }) {
  const ex = examples?.length ? examples : undefined;
  if (ex && ex.length > 24) fail(`too many examples: ${title}`);
  return {
    type: "explain",
    title: len(title, 160, "explain title"),
    body: rich(body, 8000, `explain body (${title})`),
    ...(ex
      ? {
          examples: ex.map((e) => ({
            learning: len(e.learning, 400, "ex"),
            known: len(e.known, 400, "ex"),
          })),
        }
      : {}),
  };
}

export function taskEx({ skill, title, task, points, phrases, modelAnswer, explanation }) {
  if (points && (points.length < 1 || points.length > 12))
    fail(`points ${points.length}: ${title}`);
  if (phrases && (phrases.length < 1 || phrases.length > 40))
    fail(`phrases ${phrases.length}: ${title}`);
  return {
    type: "task",
    skill,
    title: len(title, 160, "task title"),
    task: rich(task, 6000, `task (${title})`),
    ...(points ? { points: points.map((p) => len(p, 280, "point")) } : {}),
    ...(phrases ? { phrases: [...new Set(phrases.map((p) => len(p, 280, "phrase")))] } : {}),
    modelAnswer: rich(modelAnswer, 10000, `model answer (${title})`),
    ...(explanation ? { explanation: rich(explanation, 3000, "explanation") } : {}),
  };
}

/** Word-set similarity of two strings (0..1), to keep near-synonyms out of distractors. */
export function similarity(a, b) {
  const A = new Set(tokensKeepCase(a).map(low));
  const B = new Set(tokensKeepCase(b).map(low));
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / Math.max(1, Math.min(A.size, B.size));
}

/** Picks `n` items from `pool` (deterministic), skipping ones too similar to `avoid`. */
export function pickDistinct(pool, n, seed, avoid = [], key = (x) => x) {
  const out = [];
  for (const x of shuffled(pool, rng(seed))) {
    if (out.length >= n) break;
    const k = key(x);
    if (
      [...avoid, ...out.map(key)].some(
        (a) => a.toLowerCase() === k.toLowerCase() || similarity(a, k) > 0.6,
      )
    )
      continue;
    out.push(x);
  }
  if (out.length < n) fail(`pickDistinct: only ${out.length}/${n} for ${avoid[0]}`);
  return out;
}

// ---------- connector gaps ----------
const SUB = ["weil", "obwohl", "damit", "wenn", "dass", "ob", "nachdem", "bevor"];
const POS1 = ["deshalb", "trotzdem", "außerdem"];
const ORDER = [...SUB, ...POS1, "denn", "sondern", "aber"];
/** Coach rule key for each connector (coach.json rules). */
const RULE_OF = {
  weil: "weil",
  obwohl: "obwohl",
  damit: "damit",
  wenn: "wenn",
  dass: "dass",
  ob: "indirekt",
  nachdem: "nachdem",
  bevor: "generic",
  deshalb: "deshalb",
  trotzdem: "trotzdem",
  außerdem: "außerdem",
  denn: "denn",
  sondern: "sondern",
  aber: "gegensatz",
  während: "während",
  sonst: "sonst",
};
/** Wrong-by-word-order distractors per connector class (never the same class). */
function distractorsFor(word) {
  if (SUB.includes(word) || word === "während") return ["deshalb", "denn", "trotzdem"];
  if (POS1.includes(word) || word === "sonst") return ["weil", "denn", "obwohl"];
  if (word === "denn") return ["weil", "deshalb", "obwohl"];
  if (word === "sondern") return ["aber", "weil", "dass"];
  if (word === "aber") return ["weil", "dass", "obwohl"];
  return null;
}
const cap = (w) => w[0].toUpperCase() + w.slice(1);

/**
 * Finds the first connector of a known class that starts a clause (sentence start or after
 * , : ; or "…") and returns the sentence with it gapped.
 */
export function findConnector(sentence, only) {
  const words = only ? [only] : ORDER;
  let best = null;
  for (const w of words) {
    const re = new RegExp(`(^|[,:;.!?]\\s+|…\\s*)(${w})(?=\\s)`, "iu");
    const m = re.exec(sentence);
    if (!m) continue;
    const idx = m.index + m[1].length;
    if (!best || idx < best.idx) best = { idx, word: w, found: m[2] };
  }
  if (!best) return null;
  // The clause after the gap must show its word order: ≥ 2 real words, not ending in "…"
  // (in templates like "…, ___ …." any connector would fit).
  const clause = sentence
    .slice(best.idx + best.found.length)
    .split(/[.,;:?!](?!\.)/u)[0]
    .trim();
  const realWords = clause.replace(/…/g, " ").trim().split(/\s+/).filter(Boolean);
  if (realWords.length < 2 || clause.endsWith("…")) return null;
  const gapped = `${sentence.slice(0, best.idx)}___${sentence.slice(best.idx + best.found.length)}`;
  return { ...best, gapped, upper: best.found[0] !== best.found[0].toLowerCase() };
}

/** Choice "which connector fills the gap?" with a coach rule as explanation; null if none. */
export function connectorChoice(sentence, rules, seed, { only, passage, title, why } = {}) {
  const hit = findConnector(sentence, only);
  if (!hit) return null;
  const ds = distractorsFor(hit.word);
  if (!ds) return null;
  const fmt = (w) => (hit.upper ? cap(w) : w);
  const rule = rules[RULE_OF[hit.word]];
  const parts = [];
  if (why) parts.push(why);
  if (rule) parts.push(`**${rule.t}**: ${rule.en}\n\n${rule.p}`);
  return choiceEx({
    title: title
      ? `${title} · Welches Wort passt in die Lücke?`
      : "Welches Wort passt in die Lücke?",
    passage,
    prompt: hit.gapped,
    correct: hit.found,
    distractors: ds.slice(0, 2).map(fmt),
    explanation: `Full sentence: *${sentence}*${parts.length ? `\n\n${parts.join("\n\n")}` : ""}`,
    seed,
  });
}

/** Splits German text into sentences (on . ! ? followed by a space and a capital). */
export function sentences(text) {
  return String(text)
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- phrase (Redemittel) drills ----------
/**
 * For sections [{sec, items:[{de,en}]}] with a category per section: one choice per item
 * ("Which phrase means …?") and one per section ("Which phrase fits the function …?").
 * Distractors come only from sections of a different category (no near-synonyms).
 * `pool` = all sections (with categories) allowed as distractor sources.
 */
export function phraseDrills(sections, pool, seed, plain = (s) => s) {
  const out = [];
  for (const [si, s] of sections.entries()) {
    const others = pool
      .filter((p) => p.cat !== s.cat)
      .flatMap((p) => p.items.map((it) => ({ ...it, sec: p.sec })));
    const own = s.items.map((it) => plain(it.de));
    out.push(
      choiceEx({
        title: s.sec,
        prompt: `Welcher Satz passt zur Funktion „${s.sec}“?`,
        correct: own[si % own.length],
        distractors: pickDistinct(others, 3, `${seed}-f${si}`, own, (x) => plain(x.de)).map((x) =>
          plain(x.de),
        ),
        explanation: `Phrases for **${s.sec}**:\n${s.items.map((it) => `- ${plain(it.de)} (${it.en})`).join("\n")}`,
        seed: `${seed}-fo${si}`,
      }),
    );
    for (const [ii, it] of s.items.entries()) {
      out.push(
        choiceEx({
          prompt: `Which phrase means: “${it.en}”?`,
          correct: plain(it.de),
          distractors: pickDistinct(others, 3, `${seed}-m${si}-${ii}`, own, (x) => plain(x.de)).map(
            (x) => plain(x.de),
          ),
          explanation: `**${plain(it.de)}**: ${it.en} (${s.sec})`,
          seed: `${seed}-mo${si}-${ii}`,
        }),
      );
    }
  }
  return out;
}

// ---------- coverage ----------
/** Collects every string in the built lessons, then checks source strings are present. */
export function coverage(bundles) {
  const parts = [];
  const walk = (v) => {
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(bundles.map((b) => b.lessons));
  const squash = (s) => String(s).replace(/\s+/g, " ").trim();
  const hay = squash(parts.join("\n"));
  const report = [];
  const missing = [];
  return {
    /** `items`: array of strings (already converted the way they are output). */
    check(field, items) {
      let ok = 0;
      for (const it of items) {
        if (hay.includes(squash(it))) ok++;
        else missing.push(`${field}: ${String(it).slice(0, 90)}`);
      }
      report.push(`${field} ${ok}/${items.length}`);
    },
    done(name) {
      console.log(`[${name}] coverage: ${report.join(", ")}`);
      if (missing.length)
        throw new Error(
          `[${name}] coverage missing ${missing.length}:\n${missing.slice(0, 30).join("\n")}`,
        );
    },
  };
}
