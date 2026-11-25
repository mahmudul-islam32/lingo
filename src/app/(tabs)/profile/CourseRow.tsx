"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import type { Slug } from "@/contracts";
import { Button, Dialog, Skeleton } from "@/components/ui";
import { settingsQuery } from "@/features/gamification";
import { SettingsRow, useSetCourse } from "@/features/profile";
import { listAvailableCourses } from "@/lib/content";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { learnCourseId } from "../_learn/course-caption";

export const COURSE_LABEL = "Course";
export const CHANGE_COURSE = "Change course";
export const COURSE_SAVE_ERROR = "We couldn't switch your course. Try again.";

/**
 * Profile row "Course" (TELC-001): the current course and "Change", which opens a dialog
 * with every available course (German, telc B1 Exam Prep, Einbürgerungstest). Progress
 * stays per course. Hidden when only one course is offered.
 */
export function CourseRow() {
  const settings = useQuery(settingsQuery());
  const courses = useQuery({
    queryKey: ["content", "available-courses"],
    queryFn: () => listAvailableCourses(),
    staleTime: Infinity,
  });
  const setCourse = useSetCourse();
  const labelId = useId();
  const groupLabelId = useId();
  const changeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Slug | null>(null);
  const [failed, setFailed] = useState(false);

  if (settings.isPending || courses.isPending) {
    return <Skeleton shape="rect" className="h-16 rounded-card" />;
  }
  const list = courses.data ?? [];
  if (list.length < 2) return null;

  const current = learnCourseId(settings.data?.courseId);
  const currentTitle = list.find((c) => c.id === current)?.title ?? current;
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
      await setCourse.mutateAsync(chosen);
      setFailed(false);
    } catch {
      setFailed(true);
    }
    close();
  }

  return (
    <SettingsRow
      label={COURSE_LABEL}
      labelId={labelId}
      value={currentTitle}
      valueTestId="course-value"
      changeLabel={CHANGE_COURSE}
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
          {COURSE_SAVE_ERROR}
        </p>
      )}
      <Dialog
        open={open}
        onClose={close}
        title={CHANGE_COURSE}
        returnFocusRef={changeRef}
        actions={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={setCourse.isPending}
              loadingLabel="Saving"
              onClick={() => void save()}
            >
              Save
            </Button>
          </>
        }
      >
        <span id={groupLabelId} className="sr-only">
          {COURSE_LABEL}
        </span>
        <RadioCardGroup
          labelledBy={groupLabelId}
          options={list.map((course) => ({
            value: course.id,
            label: course.title,
            description: course.levels?.[0]?.description,
          }))}
          value={chosen}
          onChange={setDraft}
        />
        <p className="mt-4 text-fg-muted">Your progress in each course is kept.</p>
      </Dialog>
    </SettingsRow>
  );
}
