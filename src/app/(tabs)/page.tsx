import type { Metadata } from "next";
import { LessonList } from "../_shell/LessonList";

export const metadata: Metadata = { title: "Learn" };

/** Learn tab: the temporary lesson list of v0.2.0 (PLT-007, PD-009) until GAM-008. */
export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <LessonList />
    </div>
  );
}
