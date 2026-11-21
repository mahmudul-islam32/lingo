"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type { StoreApi } from "zustand";
import type { CefrLevel, Settings } from "@/contracts";
import type { SettingsPatch } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { guestProfileStore, type GuestProfileState } from "./guest-profile-store";

/** Drops `undefined` values: the repository spreads the patch (ADR-013 Compatibility). */
function definedOnly(patch: SettingsPatch): SettingsPatch {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as SettingsPatch;
}

/**
 * Saves a settings patch through the guest profile store (and so the settings repository,
 * which validates, stores and queues it for sync), then writes the saved `Settings` into
 * the `["settings"]` cache, so every reader (path, Learn, Profile) updates without a
 * reload. Rejects with the repository's typed `LocalDataError`; nothing changes then.
 */
export function useUpdateSettings(
  store: StoreApi<GuestProfileState> = guestProfileStore,
): UseMutationResult<Settings, Error, SettingsPatch> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => store.getState().updateSettings(definedOnly(patch)),
    onSuccess: (settings) => {
      client.setQueryData<Settings | null>(queryKeys.settings(), settings);
    },
  });
}

/**
 * Sets `Settings.startLevel` (PLT-025, ADR-013). `mutate("A2")` / `mutateAsync("A2")`.
 * To go back to the first level pass it explicitly (`"A1"`), never `undefined`.
 * Used by Profile and by the path's "Start here" (GAM-011).
 */
export function useSetStartLevel(
  store: StoreApi<GuestProfileState> = guestProfileStore,
): UseMutationResult<Settings, Error, CefrLevel> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (startLevel: CefrLevel) => store.getState().updateSettings({ startLevel }),
    onSuccess: (settings) => {
      client.setQueryData<Settings | null>(queryKeys.settings(), settings);
    },
  });
}

/**
 * Switches the learner's course: `Settings.courseId` (TELC-001). Progress is kept per
 * course (results carry their `courseId`), so switching back resumes where they were.
 */
export function useSetCourse(
  store: StoreApi<GuestProfileState> = guestProfileStore,
): UseMutationResult<Settings, Error, string> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => store.getState().updateSettings({ courseId }),
    onSuccess: (settings) => {
      client.setQueryData<Settings | null>(queryKeys.settings(), settings);
    },
  });
}
