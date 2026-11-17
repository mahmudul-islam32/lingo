/**
 * Cloze (fill-the-gap) helpers (ADR-009, CTO-009). Pure and shared by the content schema
 * (`ClozeExerciseSchema`), the answer check and the LES-015 component, so the way a
 * sentence is split into text and gaps can never drift between them.
 *
 * A gap is written as exactly `CLOZE_GAP_MARKER` (three underscores) inside `sentence`:
 * `"Ich lege das Buch auf ___ Tisch."`. Gaps are numbered from 0 in reading order and
 * match `gaps[index]` of the exercise.
 */

/** The gap marker in `ClozeExercise.sentence`. Any other underscore is invalid content. */
export const CLOZE_GAP_MARKER = "___";

/** One piece of a cloze sentence in reading order. */
export type ClozeSegment =
  | { kind: "text"; text: string }
  /** `gapIndex` is 0-based; announce it as "blank {gapIndex + 1} of {gapCount}". */
  | { kind: "gap"; gapIndex: number };

/**
 * Splits a sentence into text and gap segments in reading order. Empty text pieces are
 * dropped (a sentence may start or end with a gap). Whitespace is kept as authored, so
 * joining the segments with the chosen option texts rebuilds the sentence exactly.
 */
export function splitClozeSentence(sentence: string): ClozeSegment[] {
  const segments: ClozeSegment[] = [];
  sentence.split(CLOZE_GAP_MARKER).forEach((text, index) => {
    if (index > 0) segments.push({ kind: "gap", gapIndex: index - 1 });
    if (text !== "") segments.push({ kind: "text", text });
  });
  return segments;
}

/** Number of gap markers in a sentence. */
export function countClozeGaps(sentence: string): number {
  return sentence.split(CLOZE_GAP_MARKER).length - 1;
}

/**
 * Sentence with gap `i` replaced by `fills[i]`. A missing fill keeps the marker, so a
 * partly filled sentence is still recognisable. Used for the feedback panel (all
 * correct options) and for the CDS-13 length rule (longest options).
 */
export function fillClozeSentence(sentence: string, fills: readonly string[]): string {
  return splitClozeSentence(sentence)
    .map((segment) =>
      segment.kind === "text" ? segment.text : (fills[segment.gapIndex] ?? CLOZE_GAP_MARKER),
    )
    .join("");
}
