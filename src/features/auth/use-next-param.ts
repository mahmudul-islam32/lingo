"use client";

import { useSyncExternalStore } from "react";
import { safeNextPath } from "@/contracts";

const subscribe = () => () => {};

function read(): string | null {
  const safe = safeNextPath(new URLSearchParams(window.location.search).get("next"));
  return safe === "/" ? null : safe;
}

/**
 * The page's `next` parameter when it is a same-origin path other than `/` (ADR-020 §3),
 * else `null`. Read on the client only (the auth pages are static).
 */
export function useNextParam(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
