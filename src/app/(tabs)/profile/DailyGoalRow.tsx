"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { GAME_CONFIG, type DailyGoalXp } from "@/contracts";
import { Button, Dialog, Skeleton } from "@/components/ui";
import { settingsQuery } from "@/features/gamification";
import { SettingsRow, useUpdateSettings } from "@/features/profile";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { GOAL_COPY, GOAL_OPTIONS } from "../../onboarding/goal-options";

export const DAILY_GOAL_LABEL = "Daily goal";
export const CHANGE_DAILY_GOAL = "Change daily goal";
export const DAILY_GOAL_SAVE_ERROR = "We couldn't save your daily goal. Try again.";

/** "Regular · 20 XP". */
export function dailyGoalValue(goal: DailyGoalXp): string {
  return `${GOAL_COPY[goal].label} · ${goal} XP`;
}

/**
 * Profile row "Daily goal" (PLT-026 AC 14): the goal chosen at onboarding and "Change",
 * which opens a dialog with the same options as the onboarding goal step. Saving goes
 * through `useUpdateSettings`, which updates `["settings"]`, so the daily-goal ring, the
 * weekly chart's goal line and this row update at once.
 */
export function DailyGoalRow() {
  const settings = useQuery(settingsQuery());
  const update = useUpdateSettings();
  const labelId = useId();
  const groupLabelId = useId();
  const changeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DailyGoalXp | null>(null);
  const [failed, setFailed] = useState(false);

  if (settings.isPending) return <Skeleton shape="rect" className="h-16 rounded-card" />;
  const current: DailyGoalXp = settings.data?.dailyGoalXp ?? GAME_CONFIG.defaultDailyGoalXp;
  const chosen = draft ?? current;

  function close() {
    setOpen(false);
    setDraft(null);
  }

  async function save() {
    if (chosen === current) {
      close();
      return;
    }
    try {
      await update.mutateAsync({ dailyGoalXp: chosen });
      setFailed(false);
    } catch {
      setFailed(true);
    }
    close();
  }

  return (
    <SettingsRow
      label={DAILY_GOAL_LABEL}
      labelId={labelId}
      value={dailyGoalValue(current)}
      valueTestId="daily-goal-value"
      changeLabel={CHANGE_DAILY_GOAL}
      onChange={() => {
        setDraft(current);
        setFailed(false);
        setOpen(true);
      }}
      changeRef={changeRef}
    >
      {failed && (
        <p
          role="alert"
          className="mr-2.5 mb-2 rounded-control border-2 border-danger-border bg-danger-tint px-3 py-2 font-medium text-danger-fg"
        >
          {DAILY_GOAL_SAVE_ERROR}
        </p>
      )}
      <Dialog
        open={open}
        onClose={close}
        title={CHANGE_DAILY_GOAL}
        returnFocusRef={changeRef}
        actions={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={update.isPending}
              loadingLabel="Saving"
              onClick={() => void save()}
            >
              Save
            </Button>
          </>
        }
      >
        <span id={groupLabelId} className="sr-only">
          {DAILY_GOAL_LABEL}
        </span>
        <RadioCardGroup
          labelledBy={groupLabelId}
          options={GOAL_OPTIONS.map((option) => ({
            value: option.xp,
            label: option.label,
            trailing: `${option.xp} XP`,
            description: option.hint,
          }))}
          value={chosen}
          onChange={setDraft}
        />
      </Dialog>
    </SettingsRow>
  );
}
