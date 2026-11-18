"use client";

import { useCallback } from "react";
import type { CefrLevel } from "@/contracts";
import { useSetStartLevel as useProfileSetStartLevel } from "@/features/profile";

/** Saves `Settings.startLevel`; resolves once saved, rejects (nothing stored) on error. */
export type SetStartLevelFn = (level: CefrLevel) => Promise<void>;

/**
 * "Start here" setter (GAM-011 AC9, ADR-013). Delegates to the profile feature's
 * `useSetStartLevel` (PLT-025), the one settings writer for the start level: it saves
 * through the profile store and writes the saved `Settings` into the `["settings"]`
 * cache, so the path, Learn and Profile update without a reload. Rejects with the
 * repository's typed error and changes nothing in that case.
 */
export function useSetStartLevel(): SetStartLevelFn {
  const { mutateAsync } = useProfileSetStartLevel();
  return useCallback(
    async (level: CefrLevel) => {
      await mutateAsync(level);
    },
    [mutateAsync],
  );
}
