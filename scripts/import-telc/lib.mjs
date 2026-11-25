/**
 * Shared helpers for the telc B1 / Einbürgerungstest importer (TELC-001).
 * Source data: ../telcB1-web/src/data/*.json (sibling repo). Output follows
 * src/contracts/course.ts. Pure functions only; build.mjs writes files.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const SOURCE_DIR =
  process.env.TELC_SOURCE_DIR ?? join(ROOT, "..", "telcB1-web", "src", "data");

/** Loads one source JSON file by base name, e.g. `data("eb")`. */
export function data(name) {
  return JSON.parse(readFileSync(join(SOURCE_DIR, `${name}.json`), "utf8"));
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "" };

/**
 * Source HTML (the telc app uses <b>, <i>, <br>, <em>, <strong>, <u>, <span …>) →
 * light rich-text markup (src/contracts/rich-text.ts): **bold**, *italic*, newlines.
 * Unknown tags are dropped, their text kept.
 */
export function htmlToRich(html) {
  if (html == null) return "";
  let s = String(html);
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/?(p|div)[^>]*>/gi, "\n\n");
  s = s.replace(/<li[^>]*>/gi, "\n- ").replace(/<\/li>/gi, "");
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, "\n\n");
  s = s.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) =>
    inner.trim() ? `**${inner.trim()}**` : inner,
  );
  s = s.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) =>
    inner.trim() ? `*${inner.trim()}*` : inner,
  );
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
  s = s.replace(/\*\*\*\*/g, "");
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

/** Plain text (no markup) of source HTML, for short fields such as options and prompts. */
export function htmlToPlain(html) {
  return htmlToRich(html)
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
    .replace(/\*([^*\n]+?)\*/g, "$1")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

/** Kebab-case slug, ASCII only (ä→ae, ö→oe, ü→ue, ß→ss), max `max` chars. */
export function slug(text, max = 24) {
  const s = String(text)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cut = s.slice(0, max).replace(/-+$/g, "");
  return cut || "x";
}

/** Splits `items` into chunks of at most `size`, balanced so the last chunk isn't tiny. */
export function chunk(items, size) {
  if (items.length === 0) return [];
  const count = Math.ceil(items.length / size);
  const base = Math.floor(items.length / count);
  let extra = items.length % count;
  const out = [];
  let i = 0;
  for (let c = 0; c < count; c++) {
    const n = base + (extra-- > 0 ? 1 : 0);
    out.push(items.slice(i, i + n));
    i += n;
  }
  return out;
}

/** Truncates to `max` chars at a word boundary, adding "…". Use only where loss is acceptable. */
export function clip(text, max) {
  const s = String(text).trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Option ids a, b, c, … for 0-based index. */
export const optionId = (i) => String.fromCharCode(97 + i);

/** Deterministic PRNG (mulberry32) so re-running the importer gives identical output. */
export function rng(seed) {
  let a =
    typeof seed === "number"
      ? seed
      : [...String(seed)].reduce(
          (h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0,
          1779033703,
        );
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic shuffle (copy). */
export function shuffled(items, random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds a lesson object. `exercises` are given WITHOUT ids; ids are assigned as
 * `<lessonId>-exNN` (globally unique because lesson ids are).
 */
export function lesson({ id, courseId, unitId, title, tip, exercises }) {
  return {
    id,
    courseId,
    unitId,
    title,
    ...(tip ? { tip } : {}),
    exercises: exercises.map((e, i) => ({ id: `${id}-ex${String(i + 1).padStart(2, "0")}`, ...e })),
  };
}

/**
 * A unit plus its lesson files: `{ unit: { id, title, description?, level?, lessons:[{id,title}] }, lessons: [Lesson] }`.
 */
export function unit({ id, title, description, level, lessons }) {
  return {
    unit: {
      id,
      title,
      ...(description ? { description } : {}),
      ...(level ? { level } : {}),
      lessons: lessons.map((l) => ({ id: l.id, title: l.title })),
    },
    lessons,
  };
}
