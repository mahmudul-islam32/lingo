import { describe, expect, it } from "vitest";
import {
  clearMismatch,
  createMatchPairsState,
  isComplete,
  select,
  toAnswer,
  type MatchPairsState,
} from "./match-pairs-model";

const ids = ["hola", "gato", "perro"];

type Side = "learning" | "known";

function run(steps: [side: Side, id: string][], start = createMatchPairsState()) {
  let state: MatchPairsState = start;
  const events: string[] = [];
  for (const [side, id] of steps) {
    const result = select(state, side, id, ids);
    state = result.state;
    events.push(result.event);
  }
  return { state, events };
}

describe("match-pairs model", () => {
  it("starts empty", () => {
    expect(createMatchPairsState()).toEqual({
      selected: { learning: null, known: null },
      matched: [],
      mismatch: null,
      mismatchCount: 0,
    });
  });

  it("selects a tile", () => {
    const { state, events } = run([["learning", "hola"]]);
    expect(events).toEqual(["selected"]);
    expect(state.selected).toEqual({ learning: "hola", known: null });
  });

  it("moves the selection within the same column", () => {
    const { state, events } = run([
      ["learning", "hola"],
      ["learning", "gato"],
    ]);
    expect(events).toEqual(["selected", "selected"]);
    expect(state.selected).toEqual({ learning: "gato", known: null });
    expect(state.mismatchCount).toBe(0);
  });

  it("deselects when the selected tile is tapped again", () => {
    const { state, events } = run([
      ["known", "hola"],
      ["known", "hola"],
    ]);
    expect(events).toEqual(["selected", "deselected"]);
    expect(state.selected).toEqual({ learning: null, known: null });
  });

  it("matches a pair from either column first", () => {
    const a = select(select(createMatchPairsState(), "learning", "hola").state, "known", "hola");
    expect(a.event).toBe("matched");
    expect(a.pair).toEqual({ learning: "hola", known: "hola" });
    expect(a.state.matched).toEqual(["hola"]);
    expect(a.state.selected).toEqual({ learning: null, known: null });

    const b = select(select(createMatchPairsState(), "known", "gato").state, "learning", "gato");
    expect(b.event).toBe("matched");
    expect(b.state.matched).toEqual(["gato"]);
  });

  it("records a mismatch, clears the selection and counts it", () => {
    const { state, events } = run([
      ["learning", "hola"],
      ["known", "gato"],
    ]);
    expect(events).toEqual(["selected", "mismatch"]);
    expect(state.mismatch).toEqual({ learning: "hola", known: "gato" });
    expect(state.mismatchCount).toBe(1);
    expect(state.selected).toEqual({ learning: null, known: null });
    expect(state.matched).toEqual([]);
  });

  it("clearMismatch removes the error highlight and keeps the count", () => {
    const { state } = run([
      ["known", "gato"],
      ["learning", "hola"],
    ]);
    expect(state.mismatch).toEqual({ learning: "hola", known: "gato" });
    const cleared = clearMismatch(state);
    expect(cleared.mismatch).toBeNull();
    expect(cleared.mismatchCount).toBe(1);
    expect(clearMismatch(cleared)).toBe(cleared);
  });

  it("a tap during the mismatch feedback clears it and selects", () => {
    const { state, events } = run([
      ["learning", "hola"],
      ["known", "gato"],
      ["learning", "perro"],
    ]);
    expect(events).toEqual(["selected", "mismatch", "selected"]);
    expect(state.mismatch).toBeNull();
    expect(state.selected.learning).toBe("perro");
  });

  it("ignores taps on matched or unknown tiles", () => {
    const { state } = run([
      ["learning", "hola"],
      ["known", "hola"],
    ]);
    expect(select(state, "learning", "hola", ids)).toEqual({ state, event: "ignored" });
    expect(select(state, "known", "hola", ids).event).toBe("ignored");
    expect(select(state, "known", "nope", ids).event).toBe("ignored");
  });

  it("completes without mismatches", () => {
    const steps = ids.flatMap((id): [Side, string][] => [
      ["learning", id],
      ["known", id],
    ]);
    const { state } = run(steps);
    expect(isComplete(state, ids)).toBe(true);
    expect(toAnswer(state)).toEqual({
      type: "match_pairs",
      matches: ids.map((id) => ({ learningPairId: id, knownPairId: id })),
      mismatchCount: 0,
    });
  });

  it("completes with mismatches and reports the count", () => {
    const { state } = run([
      ["learning", "hola"],
      ["known", "gato"],
      ["learning", "gato"],
      ["known", "perro"],
      ["learning", "hola"],
      ["known", "hola"],
      ["learning", "gato"],
      ["known", "gato"],
      ["known", "perro"],
      ["learning", "perro"],
    ]);
    expect(isComplete(state, ids)).toBe(true);
    expect(toAnswer(state).mismatchCount).toBe(2);
    expect(toAnswer(state).matches).toHaveLength(3);
  });

  it("is not complete until every pair is matched", () => {
    const { state } = run([
      ["learning", "hola"],
      ["known", "hola"],
    ]);
    expect(isComplete(state, ids)).toBe(false);
    expect(isComplete(createMatchPairsState(), [])).toBe(false);
  });

  it("never mutates the input state", () => {
    const start = createMatchPairsState();
    const frozen = Object.freeze({ ...start, selected: Object.freeze({ ...start.selected }) });
    expect(() => select(frozen, "learning", "hola")).not.toThrow();
    expect(frozen.selected.learning).toBeNull();
  });
});
