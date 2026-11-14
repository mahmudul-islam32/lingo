"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { StoreApi } from "zustand";
import type { Course, DailyGoalXp, Slug } from "@/contracts";
import { guestProfileStore, type GuestProfileState } from "@/features/profile";
import { HOME_PATH } from "../_shell/OnboardingGate";
import { DEFAULT_COURSE_ID, firstLessonPath, listAvailableCourses } from "@/lib/content";
import { queryKeys } from "@/lib/query";
import { CourseStep, type CoursesState } from "./steps/CourseStep";
import { GoalStep } from "./steps/GoalStep";
import { Welcome } from "./steps/Welcome";

export type OnboardingStep = "welcome" | "course" | "goal";

/** Loads the courses offered at onboarding. Injected in tests. */
export type LoadCourses = () => Promise<Course[]>;

/**
 * The `available` courses of the registry (CTO-008), schema-validated: German only for
 * now (PD-030). Hidden courses (Spanish) are not offered or named (PLT-024 AC 1).
 */
const defaultLoadCourses: LoadCourses = () => listAvailableCourses();

export interface OnboardingFlowProps {
  loadCourses?: LoadCourses;
  store?: StoreApi<GuestProfileState>;
  /** Course whose language the Welcome heading names (PLT-024 AC 3). Tests only. */
  defaultCourseId?: Slug;
}

/**
 * The course "Continue" and "Start learning" use: the learner's choice, else the only
 * available course (PLT-024 AC 2: preselected when exactly one course is offered).
 */
export function effectiveCourseId(chosen: Slug | null, courses: CoursesState): Slug | null {
  if (chosen !== null) return chosen;
  if (courses.status === "ready" && courses.courses.length === 1) return courses.courses[0]!.id;
  return null;
}

/**
 * Three-step onboarding on one route (PLT-004). Choices live here in `useState`, so Back
 * keeps them and a reload starts over at Welcome with nothing saved. Only "Start
 * learning" writes: settings (course + daily goal) through the guest profile store, then
 * `onboardedAt`, then `router.replace` to the course's first lesson (PLT-007).
 *
 * Saving goes through the PLT-003 Zustand store, not a TanStack Query mutation
 * (ARCHITECTURE §5, temporary deviation PLT-003/CR-002). Afterwards `["settings"]` is
 * invalidated (PLT-009), so the daily goal and course read by gamification (GAM-003) are
 * the ones just chosen, also if settings were cached before onboarding.
 */
export function OnboardingFlow({
  loadCourses = defaultLoadCourses,
  store = guestProfileStore,
  defaultCourseId = DEFAULT_COURSE_ID,
}: OnboardingFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [chosenCourseId, setCourseId] = useState<Slug | null>(null);
  const [goal, setGoal] = useState<DailyGoalXp | null>(null);
  const [courses, setCourses] = useState<CoursesState>({ status: "loading" });
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const selectedCourseId = effectiveCourseId(chosenCourseId, courses);

  // Resolves to the next courses state; never sets state synchronously.
  const readCourses = useCallback(
    (): Promise<CoursesState> =>
      loadCourses().then(
        (list): CoursesState => ({ status: "ready", courses: list }),
        (): CoursesState => ({ status: "error" }),
      ),
    [loadCourses],
  );

  // Load while the learner reads the Welcome step, so the Course step is usually ready.
  useEffect(() => {
    let active = true;
    void readCourses().then((next) => {
      if (active) setCourses(next);
    });
    return () => {
      active = false;
    };
  }, [readCourses]);

  function retryCourses() {
    setCourses({ status: "loading" });
    void readCourses().then(setCourses);
  }

  // Criterion 7: focus the new step's heading on every step change (not on first render).
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    headingRef.current?.focus();
  }, [step]);

  async function finish() {
    const courseId = selectedCourseId; // the choice, or the preselected only course
    if (courseId === null || goal === null || saving) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const state = store.getState();
      await state.updateSettings({ courseId, dailyGoalXp: goal });
      await state.completeOnboarding();
      // `refetchType: "all"`: no settings query may be mounted here (app defaults don't
      // refetch on mount), so inactive ones are refreshed too.
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings(), refetchType: "all" });
      // PLT-007 criterion 6: straight into the course's first lesson.
      const course =
        courses.status === "ready" ? courses.courses.find((c) => c.id === courseId) : undefined;
      router.replace(course ? firstLessonPath(course) : HOME_PATH);
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  }

  const common = { headingId, headingRef };
  switch (step) {
    case "welcome":
      return <Welcome {...common} courseId={defaultCourseId} onStart={() => setStep("course")} />;
    case "course":
      return (
        <CourseStep
          {...common}
          courses={courses}
          selected={selectedCourseId}
          onSelect={setCourseId}
          onRetry={retryCourses}
          onBack={() => setStep("welcome")}
          onContinue={() => setStep("goal")}
        />
      );
    case "goal":
      return (
        <GoalStep
          {...common}
          selected={goal}
          onSelect={(value) => {
            setGoal(value);
            setSaveFailed(false);
          }}
          onBack={() => setStep("course")}
          onFinish={() => void finish()}
          saving={saving}
          saveFailed={saveFailed}
        />
      );
  }
}
