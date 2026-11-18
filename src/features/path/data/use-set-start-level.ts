"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CefrLevel, Settings } from "@/contracts";
import { guestProfileStore } from "@/features/profile";
import { queryKeys } from "@/lib/query";

/** Saves `Settings.startLevel`; resolves once saved, rejects (nothing stored) on error. */
export type SetStartLevelFn = (level: CefrLevel) => Promise<void>;

/**
 * "Start here" setter (GAM-011 AC9, ADR-013): saves `startLevel` through the profile
 * repository's existing patch API (`updateSettings`, via the profile store, so its
 * `settings` stay in step), then writes the saved `Settings` into the `["settings"]`
 * cache, so the path (and every `["settings"]` reader) updates without a reload.
 *
 * Interim: PLT-025 adds the profile feature's own settings setter hook; this one can then
 * delegate to it. It rejects with the repository's typed error (e.g. settings not set
 * yet) and changes nothing in that case.
 */
export function useSetStartLevel(): SetStartLevelFn {
  const client = useQueryClient();
  return useCallback(
    async (level: CefrLevel) => {
      const settings = await guestProfileStore.getState().updateSettings({ startLevel: level });
      client.setQueryData<Settings | null>(queryKeys.settings(), settings);
    },
    [client],
  );
}
