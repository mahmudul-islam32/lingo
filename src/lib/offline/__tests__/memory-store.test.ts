import { describe, expect, it } from "vitest";
import { MemoryLocalStore } from "../memory-store";

describe("MemoryLocalStore", () => {
  it("rolls back every write of a failed transaction", async () => {
    const store = new MemoryLocalStore();
    await store.transaction("rw", (tx) => tx.put("meta", "sync", { a: 1 }));
    await expect(
      store.transaction("rw", async (tx) => {
        await tx.put("meta", "sync", { a: 2 });
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(await store.transaction("r", (tx) => tx.get("meta", "sync"))).toEqual({ a: 1 });
  });

  it("refuses writes in read-only transactions and isolates stored values", async () => {
    const store = new MemoryLocalStore();
    await expect(store.transaction("r", (tx) => tx.put("meta", "sync", 1))).rejects.toThrow(
      /ReadOnly/,
    );
    const value = { a: 1 };
    await store.transaction("rw", (tx) => tx.put("meta", "sync", value));
    value.a = 99;
    expect(await store.transaction("r", (tx) => tx.get("meta", "sync"))).toEqual({ a: 1 });
  });
});
