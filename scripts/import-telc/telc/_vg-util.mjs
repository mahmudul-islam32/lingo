/**
 * Shared helpers for the telc `vocab` and `grammar` modules (TELC-001): tile building for
 * word-bank / listen exercises, option shuffling, coverage bookkeeping.
 */
import { optionId, shuffled } from "../lib.mjs";

const P = `.,;:!?¡¿"“”„‚«»‹›()\\[\\]{}…–—-`;
const EDGE_L = new RegExp(`^[${P}]+`, "u");
const EDGE_R = new RegExp(`[${P}]+$`, "u");

/** Same normalisation as src/contracts/text.ts (kept in sync by hand; validated by vitest). */
export function normalize(input) {
  return String(input)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’`´]/gu, "'")
    .replace(/[.,;:!?¡¿"“”„‚«»‹›()[\]{}…–—-]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
export const tokens = (s) => (normalize(s) === "" ? [] : normalize(s).split(" "));

/** Visible words of a sentence for tiles: punctuation stripped from the edges, case kept. */
export function words(sentence) {
  return String(sentence)
    .split(/\s+/)
    .map((w) =>
      w
        .replace(/^[-–—]+$/, "")
        .replace(EDGE_L, "")
        .replace(EDGE_R, ""),
    )
    .filter((w) => w && tokens(w).length > 0);
}

/** Merges neighbouring words until there are at most `max` tiles (each ≤40 chars). */
export function groupWords(ws, max) {
  let out = [...ws];
  while (out.length > max) {
    // merge the shortest adjacent pair that still fits in 40 chars
    let best = -1;
    let bestLen = Infinity;
    for (let i = 0; i < out.length - 1; i++) {
      const len = out[i].length + 1 + out[i + 1].length;
      if (len <= 40 && len < bestLen) {
        best = i;
        bestLen = len;
      }
    }
    if (best === -1) throw new Error(`cannot group tiles: ${ws.join(" ")}`);
    out = [...out.slice(0, best), `${out[best]} ${out[best + 1]}`, ...out.slice(best + 2)];
  }
  return out;
}

/**
 * Tiles for one or more accepted answers: every answer must be buildable. Answer tiles are
 * the words of answers[0] plus any extra words the alternatives need; then up to
 * `nDistractors` distractor words from `pool` whose tokens are not in any answer.
 */
export function buildTiles(answers, pool, random, nDistractors = 3, maxTiles = 24, prefer = []) {
  const base = words(answers[0]);
  const have = new Map();
  for (const t of base.flatMap(tokens)) have.set(t, (have.get(t) ?? 0) + 1);
  const extra = [];
  for (const alt of answers.slice(1)) {
    const need = new Map();
    for (const w of words(alt)) for (const t of tokens(w)) need.set(t, (need.get(t) ?? 0) + 1);
    for (const [t, n] of need) {
      const missing = n - (have.get(t) ?? 0);
      for (let i = 0; i < missing; i++)
        extra.push(words(alt).find((w) => tokens(w).includes(t)) ?? t);
      if (missing > 0) have.set(t, n);
    }
  }
  const answerToks = new Set(answers.flatMap(tokens));
  const seen = new Set();
  const cands = [];
  for (const w of [...prefer.flatMap(words), ...shuffled(pool.flatMap(words), random)]) {
    const ts = tokens(w);
    const key = ts.join(" ");
    if (seen.has(key) || ts.some((t) => answerToks.has(t)) || w.length > 40) continue;
    seen.add(key);
    cands.push(w);
  }
  const distractors = cands.slice(0, nDistractors);
  let answerTiles = [...base, ...extra];
  if (answerTiles.length + distractors.length > maxTiles) {
    if (extra.length) throw new Error(`too many tiles with alternatives: ${answers.join(" | ")}`);
    answerTiles = groupWords(base, maxTiles - distractors.length);
  }
  return shuffled([...answerTiles, ...distractors], random);
}

/** Options with ids a, b, c … in shuffled order; returns {options, correctOptionId}. */
export function shuffledOptions(correct, wrong, random) {
  const all = shuffled([correct, ...wrong], random);
  return {
    options: all.map((text, i) => ({ id: optionId(i), text })),
    correctOptionId: optionId(all.indexOf(correct)),
  };
}

/** Picks up to `n` items from `pool` (deterministic) whose `key` differs from those in `taken`. */
export function pickDistinct(pool, n, key, taken, random) {
  const used = new Set(taken.map((t) => key(t).toLowerCase()));
  const out = [];
  for (const c of shuffled(pool, random)) {
    const k = key(c).toLowerCase();
    if (used.has(k)) continue;
    used.add(k);
    out.push(c);
    if (out.length >= n) break;
  }
  return out;
}

/** Kebab-ish audio path for German TTS (no file exists; the app reads answers[0]). */
export const audioSrc = (id) => ({ src: `/audio/de/telc/${id}.mp3` });
