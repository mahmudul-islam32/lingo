import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

/** Deterministic generator returning the given values in a loop. */
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length] as number;
    index += 1;
    return value;
  };
}

describe("shuffle", () => {
  it("keeps every item exactly once", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    for (let run = 0; run < 50; run += 1) {
      const result = shuffle(items);
      expect(result).toHaveLength(items.length);
      expect([...result].sort()).toEqual(items);
    }
  });

  it("does not mutate the input", () => {
    const items = [1, 2, 3, 4];
    const copy = [...items];
    shuffle(items, sequence(0));
    expect(items).toEqual(copy);
  });

  it("is deterministic for an injected random source", () => {
    expect(shuffle([1, 2, 3, 4], sequence(0))).toEqual([2, 3, 4, 1]);
    expect(shuffle([1, 2, 3, 4], sequence(0.999))).toEqual([1, 2, 3, 4]);
  });

  it("handles empty and single-item arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["x"])).toEqual(["x"]);
  });

  it("can produce different orders", () => {
    const orders = new Set<string>();
    for (let run = 0; run < 100; run += 1) orders.add(shuffle([1, 2, 3, 4]).join(","));
    expect(orders.size).toBeGreaterThan(1);
  });

  it("keeps duplicate items (word-bank tiles can repeat)", () => {
    expect(shuffle(["la", "la", "casa"], () => 0.5).filter((t) => t === "la")).toHaveLength(2);
  });
});
