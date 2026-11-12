/**
 * Canonical text normalisation shared by content validation (schemas) and answer
 * checking (features/lessons). Keeping one implementation here guarantees that an
 * answer the schema accepts as "buildable from the tiles" is also what the checker
 * compares against.
 *
 * Rules (PD-010, ADR-008): Unicode NFC, lower-case (so German nouns match whatever the
 * case: "Hund" = "hund"; capital "ẞ" becomes "ß"), typographic apostrophes unified,
 * punctuation (. , ; : ! ? ¡ ¿ quotes incl. German „ “ ‚ » « › ‹, brackets, dashes,
 * ellipsis) replaced by spaces, whitespace collapsed, trimmed. Diacritics, umlauts and
 * "ß" are kept (á ≠ a, ñ ≠ n, ö ≠ o, "schon" ≠ "schön", "ß" ≠ "ss").
 */

const PUNCTUATION = /[.,;:!?¡¿"“”„‚«»‹›()[\]{}…–—-]/gu;

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

/** Replaces "ß" with "ss" (run after normalisation, so "ẞ" is covered too). */
function foldSharpS(normalized: string): string {
  return normalized.replace(/ß/gu, "ss");
}

/**
 * Removes combining marks after normalising (á → a, ñ → n, ö → o) and folds "ß" to
 * "ss" (Swiss recognisers never output "ß"). Only for lenient comparisons such as
 * speech-recognition transcripts, never for tile answers (ADR-008, PD-033). Typed-answer
 * leniency (ss for ß, ae/oe/ue for umlauts, with a spelling note) is Phase 2 and will
 * get its own helper and result shape then.
 */
export function foldDiacritics(input: string): string {
  return foldSharpS(
    normalizeAnswerText(input).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"),
  );
}
