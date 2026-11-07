/**
 * Pure state model for the match-pairs exercise (LES-006). The component keeps an
 * instance in React state and only adds timing (mismatch feedback) and announcements.
 *
 * A tile is identified by its column (`side`) and the pair id it came from; a left tile
 * and a right tile belong together iff they carry the same pair id.
 */
import type { AnswerInputOfType } from "@/contracts";

export type MatchSide = "learning" | "known";

export interface MatchPairsState {
  /** Currently highlighted tile per column (`aria-pressed`). */
  readonly selected: { readonly learning: string | null; readonly known: string | null };
  /** Pair ids matched so far, in match order. */
  readonly matched: readonly string[];
  /** The last wrong pair, shown in the error style until `clearMismatch`. */
  readonly mismatch: { readonly learning: string; readonly known: string } | null;
  /** Wrong pairs tried so far (CR-001). */
  readonly mismatchCount: number;
}

/**
 * `selected` / `deselected`: highlight moved or cleared; `matched` / `mismatch`: a pair
 * was tried; `ignored`: the tile is already matched or unknown, nothing changed.
 */
export type MatchEvent = "selected" | "deselected" | "matched" | "mismatch" | "ignored";

export interface SelectResult {
  state: MatchPairsState;
  event: MatchEvent;
  /** For `matched` / `mismatch`: the learning and known pair ids that were tried. */
  pair?: { learning: string; known: string };
}

export function createMatchPairsState(): MatchPairsState {
  return {
    selected: { learning: null, known: null },
    matched: [],
    mismatch: null,
    mismatchCount: 0,
  };
}

/** Clears the error highlight after the mismatch feedback. No-op without a mismatch. */
export function clearMismatch(state: MatchPairsState): MatchPairsState {
  return state.mismatch === null ? state : { ...state, mismatch: null };
}

function other(side: MatchSide): MatchSide {
  return side === "learning" ? "known" : "learning";
}

/**
 * Applies a tap on a tile. Same column: moves the highlight (tapping the highlighted
 * tile again clears it). Other column with a highlight: tries the pair. A tap while a
 * mismatch is still shown clears that mismatch first.
 */
export function select(
  current: MatchPairsState,
  side: MatchSide,
  pairId: string,
  pairIds?: readonly string[],
): SelectResult {
  if (current.matched.includes(pairId) || (pairIds && !pairIds.includes(pairId))) {
    return { state: current, event: "ignored" };
  }
  const state = clearMismatch(current);
  const otherSide = other(side);
  const otherSelected = state.selected[otherSide];

  if (otherSelected === null) {
    if (state.selected[side] === pairId) {
      return {
        state: { ...state, selected: { ...state.selected, [side]: null } },
        event: "deselected",
      };
    }
    return {
      state: { ...state, selected: { ...state.selected, [side]: pairId } },
      event: "selected",
    };
  }

  const pair =
    side === "learning"
      ? { learning: pairId, known: otherSelected }
      : { learning: otherSelected, known: pairId };
  const cleared = { learning: null, known: null };

  if (pair.learning === pair.known) {
    return {
      state: { ...state, selected: cleared, matched: [...state.matched, pairId] },
      event: "matched",
      pair,
    };
  }
  return {
    state: {
      ...state,
      selected: cleared,
      mismatch: pair,
      mismatchCount: state.mismatchCount + 1,
    },
    event: "mismatch",
    pair,
  };
}

/** True once every pair id is matched. */
export function isComplete(state: MatchPairsState, pairIds: readonly string[]): boolean {
  return pairIds.length > 0 && pairIds.every((id) => state.matched.includes(id));
}

/** The final answer for `onComplete` (CR-001). */
export function toAnswer(state: MatchPairsState): AnswerInputOfType<"match_pairs"> {
  return {
    type: "match_pairs",
    matches: state.matched.map((id) => ({ learningPairId: id, knownPairId: id })),
    mismatchCount: state.mismatchCount,
  };
}
