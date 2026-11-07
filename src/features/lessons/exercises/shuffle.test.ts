import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = ["a", "b", "c", "d", "e"];
    const copy = input.slice();
    const result = shuffle(input);
    expect(input).toEqual(copy);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual(copy);
  });

  it("is deterministic for an injected random source", () => {
    // random() = 0 always swaps i with 0: [a,b,c,d] → [b,c,d,a]
    expect(shuffle(["a", "b", "c", "d"], () => 0)).toEqual(["b", "c", "d", "a"]);
    // random() close to 1 always swaps i with itself: identity
    expect(shuffle(["a", "b", "c", "d"], () => 0.999)).toEqual(["a", "b", "c", "d"]);
  });

  it("handles empty and single-item arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["x"])).toEqual(["x"]);
  });

  it("keeps duplicates", () => {
    expect(shuffle(["la", "la", "casa"], () => 0.5).filter((t) => t === "la")).toHaveLength(2);
  });
});
