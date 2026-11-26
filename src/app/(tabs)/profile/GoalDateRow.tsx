"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { GAME_CONFIG, type CefrLevel, type ComputeGoalPlan, type GoalPlan } from "@/contracts";
import { Button, CloseIcon, Dialog, IconButton, Skeleton } from "@/components/ui";
import {
  computeGoalPlan,
  settingsQuery,
  useProgressInputs,
  useUserProgress,
} from "@/features/gamification";
import {
  CHANGE_GOAL_DATE,
  defaultGoalLevel,
  GOAL_DATE_DIALOG_TITLE,
  GOAL_DATE_EDIT_PARAM,
  GOAL_DATE_EDIT_VALUE,
  GOAL_DATE_ERRORS,
  GOAL_DATE_LABEL,
  GOAL_DATE_QUESTION,
  GOAL_DATE_REMOVED,
  GOAL_DATE_SAVE_ERROR,
  GOAL_DATE_SAVED,
  GOAL_LEVEL_QUESTION,
  goalDateBounds,
  goalDateRowValue,
  goalLevelOptions,
  goalPlanPreview,
  isValidGoalDate,
  REMOVE_GOAL_DATE,
  SET_GOAL_DATE,
  SettingsRow,
  useUpdateSettings,
  validateGoalDate,
  type GoalDateError,
} from "@/features/profile";
import { useCourse } from "@/lib/content";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { learnCourseId } from "../_learn/course-caption";
import { useOptionalToast } from "./use-optional-toast";

export const GOAL_DATE_ROW_ID = "goal-date";

export interface GoalDateRowProps {
  /**
   * The goal-plan rule for the preview. Default: GAM-013's `computeGoalPlan`, the same
   * rule as the Learn card and the results row (ADR-015 Consequences). Read only when a
   * preview is shown.
   */
  computePlan?: ComputeGoalPlan;
}

function hasEditParam(): boolean {
  return (
    new URLSearchParams(window.location.search).get(GOAL_DATE_EDIT_PARAM) === GOAL_DATE_EDIT_VALUE
  );
}

/** Drops `?edit=goal-date` with history `replace`, so closing adds no back step (AC 9). */
function clearEditParam(): void {
  if (!hasEditParam()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete(GOAL_DATE_EDIT_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Profile row "Goal date" (PLT-027 AC 1–9, ADR-015, PD-071 §1) under "Daily goal": the
 * saved plan ("Finish A2 by 12 Mar 2027") or "Not set", and "Set" / "Change", which opens
 * the dialog with the level, the date, a live preview from the goal-plan rule, "Remove goal
 * date" and inline save errors. "After today" and "within 730 days" are enforced here on
 * Save (ADR-015 §1). Saving never touches `dailyGoalXp` (PD-071: suggest only). Hidden for
 * courses without levels (en-es), where no plan can be computed.
 */
export function GoalDateRow({ computePlan }: GoalDateRowProps) {
  const settings = useQuery(settingsQuery());
  const courseId = learnCourseId(settings.data?.courseId);
  const course = useCourse(courseId);
  const { progress } = useUserProgress(courseId);
  // `today` from the shared progress inputs (device-local date, refreshed at midnight).
  const { today } = useProgressInputs(courseId);
  const update = useUpdateSettings();
  const toast = useOptionalToast();
  const labelId = useId();
  const levelLabelId = useId();
  const dateId = useId();
  const errorId = useId();
  const rowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const deepLinkHandled = useRef(false);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState<GoalDateError | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [pending, setPending] = useState<"save" | "remove" | null>(null);

  const ready = !settings.isPending && !course.isPending;
  const options =
    ready && course.data ? goalLevelOptions(course.data, settings.data?.startLevel) : [];
  const saved: GoalPlan | null = settings.data?.goalPlan ?? null;

  function openDialog() {
    setLevel(
      defaultGoalLevel(
        options.map((o) => o.level),
        saved,
      ),
    );
    setDate(saved?.targetDate ?? "");
    setError(null);
    setSaveFailed(false);
    setOpen(true);
  }

  // AC 9: `/profile?edit=goal-date` scrolls to the row and opens the dialog once. The
  // URL is read after commit (a client navigation updates it in the commit), and the
  // dialog opens on the next frame, once the row is laid out.
  useEffect(() => {
    if (deepLinkHandled.current || !ready) return;
    // FIX-014 AC 3: on a course without levels there is no row and no dialog; the stale
    // `?edit=goal-date` is dropped with history `replace` (no extra back step).
    if (!hasEditParam() || options.length === 0) {
      deepLinkHandled.current = true;
      clearEditParam();
      return;
    }
    const frame = requestAnimationFrame(() => {
      deepLinkHandled.current = true;
      rowRef.current?.scrollIntoView?.({ block: "center" });
      openDialog();
    });
    return () => cancelAnimationFrame(frame);
    // `openDialog` reads the same render's values; run once when the row is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, options.length]);

  if (!ready) return <Skeleton shape="rect" className="h-16 rounded-card" />;
  if (!course.data || options.length === 0) return null;

  const { min, max } = goalDateBounds(today);
  const chosenLevel =
    level ??
    defaultGoalLevel(
      options.map((o) => o.level),
      saved,
    );
  const preview =
    chosenLevel && isValidGoalDate(date, today)
      ? goalPlanPreview(
          (computePlan ?? computeGoalPlan)({
            course: course.data,
            completedLessonIds: progress?.completedLessonIds ?? [],
            startLevel: settings.data?.startLevel,
            goalPlan: { targetLevel: chosenLevel, targetDate: date },
            today,
            dailyGoalXp: settings.data?.dailyGoalXp ?? GAME_CONFIG.defaultDailyGoalXp,
          }),
        )
      : [];

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
    setSaveFailed(false);
    clearEditParam();
  }

  async function write(goalPlan: GoalPlan | null, kind: "save" | "remove") {
    setPending(kind);
    setSaveFailed(false);
    try {
      await update.mutateAsync({ goalPlan });
    } catch {
      setPending(null);
      setSaveFailed(true);
      return;
    }
    setPending(null);
    setOpen(false);
    setError(null);
    clearEditParam();
    toast?.show({ title: kind === "save" ? GOAL_DATE_SAVED : GOAL_DATE_REMOVED, tone: "success" });
  }

  function save() {
    if (pending || !chosenLevel) return;
    const invalid = validateGoalDate(date, today);
    setError(invalid);
    if (invalid) {
      dateRef.current?.focus();
      return;
    }
    void write({ targetLevel: chosenLevel, targetDate: date }, "save");
  }

  return (
    <div ref={rowRef} id={GOAL_DATE_ROW_ID} className="scroll-mt-4">
      <SettingsRow
        label={GOAL_DATE_LABEL}
        labelId={labelId}
        value={goalDateRowValue(saved)}
        valueTestId="goal-date-value"
        changeLabel={saved ? CHANGE_GOAL_DATE : SET_GOAL_DATE}
        actionText={saved ? "Change" : "Set"}
        onChange={openDialog}
        changeRef={buttonRef}
      >
        <Dialog
          open={open}
          onClose={close}
          title={GOAL_DATE_DIALOG_TITLE}
          returnFocusRef={buttonRef}
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
          actions={
            <>
              <Button variant="secondary" onClick={close} disabled={pending !== null}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={pending === "save"}
                loadingLabel="Saving…"
                onClick={save}
              >
                {pending === "save" ? "Saving…" : "Save"}
              </Button>
            </>
          }
        >
          <IconButton
            label="Close"
            icon={<CloseIcon />}
            size="lg"
            className="absolute top-3 right-3"
            onClick={close}
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span id={levelLabelId} className="font-bold">
                {GOAL_LEVEL_QUESTION}
              </span>
              <RadioCardGroup
                labelledBy={levelLabelId}
                options={options.map((option) => ({
                  value: option.level,
                  label: option.label,
                  description: option.description,
                }))}
                value={chosenLevel}
                onChange={setLevel}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={dateId} className="font-bold">
                {GOAL_DATE_QUESTION}
              </label>
              <input
                ref={dateRef}
                id={dateId}
                type="date"
                min={min}
                max={max}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError(null);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="min-h-12 w-full min-w-0 rounded-control border-2 border-border bg-surface px-3 text-base text-fg focus-visible:focus-ring aria-invalid:border-danger-border"
              />
              {error && (
                <p id={errorId} className="font-medium text-danger-fg">
                  {GOAL_DATE_ERRORS[error]}
                </p>
              )}
            </div>
            <div role="status" data-testid="goal-date-preview" className="text-fg-muted">
              {preview.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {saveFailed && (
              <p
                role="alert"
                className="rounded-control border-2 border-danger-border bg-danger-tint px-3 py-2 font-medium text-danger-fg"
              >
                {GOAL_DATE_SAVE_ERROR}
              </p>
            )}
            {saved && (
              <Button
                variant="ghost"
                className="self-start"
                loading={pending === "remove"}
                loadingLabel="Removing…"
                onClick={() => {
                  if (!pending) void write(null, "remove");
                }}
              >
                {REMOVE_GOAL_DATE}
              </Button>
            )}
          </div>
        </Dialog>
      </SettingsRow>
    </div>
  );
}
