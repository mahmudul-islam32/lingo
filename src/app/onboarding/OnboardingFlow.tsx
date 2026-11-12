"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { StoreApi } from "zustand";
import type { Course, DailyGoalXp, Slug } from "@/contracts";
import { guestProfileStore, type GuestProfileState } from "@/features/profile";
import { HOME_PATH } from "../_shell/OnboardingGate";
import { firstLessonPath, listBundledCourses } from "@/lib/content";
import { CourseStep, type CoursesState } from "./steps/CourseStep";
import { GoalStep } from "./steps/GoalStep";
import { Welcome } from "./steps/Welcome";

export type OnboardingStep = "welcome" | "course" | "goal";

/** Loads the courses offered at onboarding. Injected in tests. */
export type LoadCourses = () => Promise<Course[]>;

/** The bundled, schema-validated courses from `@/lib/content` (PLT-007). */
const defaultLoadCourses: LoadCourses = () => listBundledCourses();

export interface OnboardingFlowProps {
  loadCourses?: LoadCourses;
  store?: StoreApi<GuestProfileState>;
}

/**
 * Three-step onboarding on one route (PLT-004). Choices live here in `useState`, so Back
 * keeps them and a reload starts over at Welcome with nothing saved. Only "Start
 * learning" writes: settings (course + daily goal) through the guest profile store, then
 * `onboardedAt`, then `router.replace` to the course's first lesson (PLT-007).
 *
 * Saving goes through the PLT-003 Zustand store, not a TanStack Query mutation: Query is
 * not installed yet (ARCHITECTURE §5, temporary deviation PLT-003/CR-002).
 */
export function OnboardingFlow({
  loadCourses = defaultLoadCourses,
  store = guestProfileStore,
}: OnboardingFlowProps) {
  const router = useRouter();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [courseId, setCourseId] = useState<Slug | null>(null);
  const [goal, setGoal] = useState<DailyGoalXp | null>(null);
  const [courses, setCourses] = useState<CoursesState>({ status: "loading" });
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

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
    if (courseId === null || goal === null || saving) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const state = store.getState();
      await state.updateSettings({ courseId, dailyGoalXp: goal });
      await state.completeOnboarding();
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
      return <Welcome {...common} onStart={() => setStep("course")} />;
    case "course":
      return (
        <CourseStep
          {...common}
          courses={courses}
          selected={courseId}
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
