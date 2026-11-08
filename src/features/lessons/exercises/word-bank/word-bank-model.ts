/**
 * Pure model of a word bank (LES-005). Tiles are identified by their **slot index** in
 * the (shuffled) bank, never by text, so two tiles with the same text are independent.
 */
import { shuffle } from "../shuffle";

export interface WordBankSlot {
  /** Stable id for React keys and DOM ids; unique even for duplicate texts. */
  id: string;
  text: string;
}

export interface WordBankState {
  /** Bank slots in display order (shuffled once). A slot keeps its place when placed. */
  slots: WordBankSlot[];
  /** Slot indexes in the order they were placed on the answer line. */
  placed: number[];
}

/** Builds the initial state: tiles shuffled with `random`, nothing placed. */
export function createWordBank(
  tiles: readonly string[],
  random: () => number = Math.random,
): WordBankState {
  const order = shuffle(
    tiles.map((_, index) => index),
    random,
  );
  return {
    slots: order.map((original) => ({ id: `tile-${original}`, text: tiles[original] as string })),
    placed: [],
  };
}

/** True when the slot's tile is on the answer line. */
export function isPlaced(state: WordBankState, slotIndex: number): boolean {
  return state.placed.includes(slotIndex);
}

/** Moves the bank tile at `slotIndex` to the end of the answer line (no-op if invalid). */
export function add(state: WordBankState, slotIndex: number): WordBankState {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= state.slots.length) {
    return state;
  }
  if (isPlaced(state, slotIndex)) return state;
  return { ...state, placed: [...state.placed, slotIndex] };
}

/** Returns the answer tile at `placedIndex` to its slot in the bank (no-op if invalid). */
export function remove(state: WordBankState, placedIndex: number): WordBankState {
  if (!Number.isInteger(placedIndex) || placedIndex < 0 || placedIndex >= state.placed.length) {
    return state;
  }
  return { ...state, placed: state.placed.filter((_, index) => index !== placedIndex) };
}

/** Returns the last answer tile to the bank (no-op when the answer line is empty). */
export function removeLast(state: WordBankState): WordBankState {
  return remove(state, state.placed.length - 1);
}

/** Ordered texts of the answer line: the learner's answer. */
export function answerTexts(state: WordBankState): string[] {
  return state.placed.map((slotIndex) => state.slots[slotIndex]?.text ?? "");
}
