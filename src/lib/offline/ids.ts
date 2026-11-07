/** Client-side ids and clock, injectable for tests. */

/**
 * RFC 9562 v4 UUID. Uses `crypto.randomUUID` when available; falls back to
 * `crypto.getRandomValues`, which also works outside secure contexts (for example a
 * phone opening the dev server over plain http on the LAN).
 */
export function newUuid(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = c.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const systemClock = (): Date => new Date();
