"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import type { CefrLevel } from "@/contracts";
import { Button, Dialog, Skeleton } from "@/components/ui";
import { settingsQuery } from "@/features/gamification";
import {
  effectiveStartLevel,
  isLowerLevel,
  startLevelOptions,
  useSetStartLevel,
} from "@/features/profile";
import { useCourse } from "@/lib/content";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { learnCourseId } from "../_learn/course-caption";

export const START_LEVEL_LABEL = "Start level";
export const CHANGE_START_LEVEL = "Change start level";
export const LOWER_LEVEL_WARNING =
  "Lessons you haven't finished in earlier levels will lock again.";
export const START_LEVEL_SAVE_ERROR = "We couldn't save your start level. Try again.";

/**
 * Profile row "Start level" (PLT-025 AC 7–10): the current level ("A1 · Beginner" when not
 * set) and "Change", which opens a dialog with the course's levels. Save goes through
 * `useSetStartLevel`, which updates `["settings"]`, so this row and the path update at
 * once. Hidden for courses without a level choice (one level, or none, e.g. en-es).
 */
export function StartLevelRow() {
  const settings = useQuery(settingsQuery());
  const course = useCourse(learnCourseId(settings.data?.courseId));
  const setStartLevel = useSetStartLevel();
  const labelId = useId();
  const groupLabelId = useId();
  const changeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CefrLevel | null>(null);
  const [failed, setFailed] = useState(false);

  if (settings.isPending || course.isPending) {
    return <Skeleton shape="rect" className="h-16" />;
  }
  if (!course.data) return null;
  const options = startLevelOptions(course.data);
  if (options.length < 2) return null;

  const current = effectiveStartLevel(course.data, settings.data?.startLevel)!;
  const currentLabel = options.find((o) => o.level === current)!.label;
  const chosen = draft ?? current;
  const lowering = isLowerLevel(chosen, current);

  function openDialog() {
    setDraft(current);
    setFailed(false);
    setOpen(true);
  }

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
      // ADR-013: always an explicit level, also when going back to the first one.
      await setStartLevel.mutateAsync(chosen);
      setFailed(false);
      close();
    } catch {
      setFailed(true);
      close();
    }
  }

  return (
    <section
      aria-labelledby={labelId}
      className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={labelId} className="font-semibold">
          {START_LEVEL_LABEL}
        </h2>
        <div className="flex items-center gap-3">
          <span data-testid="start-level-value" className="text-fg-muted">
            {currentLabel}
          </span>
          <Button
            ref={changeRef}
            variant="secondary"
            aria-label={CHANGE_START_LEVEL}
            onClick={openDialog}
          >
            Change
          </Button>
        </div>
      </div>
      {failed && (
        <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-danger-fg">
          {START_LEVEL_SAVE_ERROR}
        </p>
      )}
      <Dialog
        open={open}
        onClose={close}
        title={CHANGE_START_LEVEL}
        returnFocusRef={changeRef}
        actions={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={setStartLevel.isPending}
              loadingLabel="Saving"
              onClick={() => void save()}
            >
              Save
            </Button>
          </>
        }
      >
        <span id={groupLabelId} className="sr-only">
          {START_LEVEL_LABEL}
        </span>
        <RadioCardGroup
          labelledBy={groupLabelId}
          options={options.map((option) => ({
            value: option.level,
            label: option.label,
            description: option.description,
          }))}
          value={chosen}
          onChange={setDraft}
        />
        {lowering && (
          <p role="status" className="mt-4 text-fg-muted">
            {LOWER_LEVEL_WARNING}
          </p>
        )}
      </Dialog>
    </section>
  );
}
