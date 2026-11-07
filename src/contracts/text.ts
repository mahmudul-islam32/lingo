/**
 * Canonical text normalisation shared by content validation (schemas) and answer
 * checking (features/lessons). Keeping one implementation here guarantees that an
 * answer the schema accepts as "buildable from the tiles" is also what the checker
 * compares against.
 *
 * Rules: Unicode NFC, lower-case, typographic apostrophes unified, punctuation
 * (. , ; : ! ? ¡ ¿ quotes, brackets, dashes, ellipsis) replaced by spaces,
 * whitespace collapsed, trimmed. Diacritics are kept (á ≠ a, ñ ≠ n).
 */

const PUNCTUATION = /[.,;:!?¡¿"“”„«»()[\]{}…–—-]/gu;

export function normalizeAnswerText(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’`´]/gu, "'")
    .replace(PUNCTUATION, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** Normalised whitespace-separated tokens; `[]` for blank input. */
export function tokenizeAnswer(input: string): string[] {
  const normalized = normalizeAnswerText(input);
  return normalized === "" ? [] : normalized.split(" ");
}

/**
 * Removes combining marks after normalising (á → a, ñ → n). Only for lenient
 * comparisons such as speech-recognition transcripts, never for typed/tile answers.
 */
export function foldDiacritics(input: string): string {
  return normalizeAnswerText(input).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
