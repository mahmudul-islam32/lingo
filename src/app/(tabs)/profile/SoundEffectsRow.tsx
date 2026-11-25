"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { Skeleton } from "@/components/ui";
import { settingsQuery } from "@/features/gamification";
import { sharedSoundEffects } from "@/features/lessons";
import { SettingsRow, useUpdateSettings } from "@/features/profile";

export const SOUND_EFFECTS_LABEL = "Sound effects";
export const SOUND_EFFECTS_ON = "On";
export const SOUND_EFFECTS_OFF = "Off";
// The accessible name contains the visible "Turn on" / "Turn off" (WCAG 2.5.3, FIX-012).
export const TURN_SOUND_EFFECTS_ON = "Turn on sound effects";
export const TURN_SOUND_EFFECTS_OFF = "Turn off sound effects";
export const SOUND_EFFECTS_SAVE_ERROR = "We couldn't save your sound setting. Try again.";

/**
 * Profile row "Sound effects" (LES-012): shows On / Off and a button that flips
 * `Settings.soundEffectsEnabled` (default on). Turning it on plays the "correct" chime
 * once, so the learner hears what they turned on. Lessons read the setting when they open.
 * Replaces PD-067 §6 ("no Sounds row"): a feature now reads the setting (PD-074).
 */
export function SoundEffectsRow() {
  const settings = useQuery(settingsQuery());
  const update = useUpdateSettings();
  const labelId = useId();
  const [failed, setFailed] = useState(false);

  if (settings.isPending) {
    return <Skeleton shape="rect" className="h-16 rounded-card" />;
  }
  const enabled = settings.data?.soundEffectsEnabled ?? true;

  async function toggle() {
    const next = !enabled;
    // Play inside the tap (a user gesture), before the save resolves.
    if (next) sharedSoundEffects().play("correct");
    try {
      await update.mutateAsync({ soundEffectsEnabled: next });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  return (
    <SettingsRow
      label={SOUND_EFFECTS_LABEL}
      labelId={labelId}
      value={enabled ? SOUND_EFFECTS_ON : SOUND_EFFECTS_OFF}
      valueTestId="sound-effects-value"
      changeLabel={enabled ? TURN_SOUND_EFFECTS_OFF : TURN_SOUND_EFFECTS_ON}
      actionText={enabled ? "Turn off" : "Turn on"}
      onChange={() => void toggle()}
    >
      {failed && (
        <p
          role="alert"
          className="mr-2.5 mb-2 rounded-control border-2 border-danger-border bg-danger-tint px-3 py-2 font-medium text-danger-fg"
        >
          {SOUND_EFFECTS_SAVE_ERROR}
        </p>
      )}
    </SettingsRow>
  );
}
