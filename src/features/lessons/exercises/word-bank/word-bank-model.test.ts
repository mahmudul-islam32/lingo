import { describe, expect, it } from "vitest";
import {
  add,
  answerTexts,
  createWordBank,
  isPlaced,
  remove,
  removeLast,
  type WordBankState,
} from "./word-bank-model";

/** Identity order: random() ≈ 1 makes the shuffle a no-op. */
const keepOrder = () => 0.999;

function bank(tiles: string[]): WordBankState {
  return createWordBank(tiles, keepOrder);
}

describe("createWordBank", () => {
  it("creates one slot per tile with unique ids, nothing placed", () => {
    const state = bank(["yo", "soy", "yo"]);
    expect(state.slots.map((s) => s.text)).toEqual(["yo", "soy", "yo"]);
    expect(new Set(state.slots.map((s) => s.id)).size).toBe(3);
    expect(state.placed).toEqual([]);
  });

  it("shuffles with the injected random source", () => {
    const state = createWordBank(["a", "b", "c", "d"], () => 0);
    expect(state.slots.map((s) => s.text)).toEqual(["b", "c", "d", "a"]);
  });
});

describe("add", () => {
  it("appends the slot to the end of the answer line", () => {
    let state = bank(["el", "gato", "come"]);
    state = add(state, 1);
    state = add(state, 0);
    expect(state.placed).toEqual([1, 0]);
    expect(answerTexts(state)).toEqual(["gato", "el"]);
    expect(isPlaced(state, 1)).toBe(true);
    expect(isPlaced(state, 2)).toBe(false);
  });

  it("keeps the slots unchanged (the bank does not shift)", () => {
    const initial = bank(["el", "gato"]);
    expect(add(initial, 0).slots).toBe(initial.slots);
  });

  it("ignores an already placed slot and out-of-range indexes", () => {
    const state = add(bank(["el", "gato"]), 0);
    expect(add(state, 0)).toBe(state);
    expect(add(state, -1)).toBe(state);
    expect(add(state, 2)).toBe(state);
    expect(add(state, 0.5)).toBe(state);
  });

  it("does not mutate the previous state", () => {
    const initial = bank(["el", "gato"]);
    add(initial, 0);
    expect(initial.placed).toEqual([]);
  });
});

describe("remove", () => {
  it("returns the tile at the answer position to the bank, keeping the others' order", () => {
    let state = bank(["a", "b", "c"]);
    state = add(add(add(state, 2), 0), 1);
    state = remove(state, 1);
    expect(state.placed).toEqual([2, 1]);
    expect(answerTexts(state)).toEqual(["c", "b"]);
    expect(isPlaced(state, 0)).toBe(false);
  });

  it("ignores invalid positions", () => {
    const state = add(bank(["a", "b"]), 0);
    expect(remove(state, 1)).toBe(state);
    expect(remove(state, -1)).toBe(state);
  });
});

describe("removeLast", () => {
  it("removes the last placed tile", () => {
    const state = removeLast(add(add(bank(["a", "b"]), 1), 0));
    expect(state.placed).toEqual([1]);
  });

  it("is a no-op on an empty answer line", () => {
    const state = bank(["a", "b"]);
    expect(removeLast(state)).toBe(state);
  });
});

describe("duplicate words", () => {
  it("treats two tiles with the same text independently", () => {
    let state = bank(["la", "casa", "la"]);
    state = add(state, 2);
    expect(isPlaced(state, 0)).toBe(false);
    expect(isPlaced(state, 2)).toBe(true);
    state = add(state, 0);
    expect(answerTexts(state)).toEqual(["la", "la"]);
    state = remove(state, 0);
    // The tile removed is slot 2 (first placed), slot 0 stays on the answer line.
    expect(state.placed).toEqual([0]);
    expect(isPlaced(state, 2)).toBe(false);
  });
});
