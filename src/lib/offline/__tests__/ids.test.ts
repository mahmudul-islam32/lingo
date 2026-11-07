import { afterEach, describe, expect, it, vi } from "vitest";
import { UuidSchema } from "@/contracts";
import { newUuid } from "../ids";

afterEach(() => vi.unstubAllGlobals());

describe("newUuid", () => {
  it("returns a valid UUID", () => {
    expect(UuidSchema.safeParse(newUuid()).success).toBe(true);
  });

  it("works without crypto.randomUUID (non-secure contexts)", () => {
    const real = globalThis.crypto;
    vi.stubGlobal("crypto", { getRandomValues: real.getRandomValues.bind(real) });
    const id = newUuid();
    expect(UuidSchema.safeParse(id).success).toBe(true);
    expect(id[14]).toBe("4");
  });
});
