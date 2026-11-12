import type { Metadata } from "next";
import { InstallCard } from "../_shell/InstallCard";
import { LessonList } from "../_shell/LessonList";

export const metadata: Metadata = { title: "Learn" };

/**
 * Learn tab: the install card (PLT-005), then the temporary lesson list of v0.2.0
 * (PLT-007, PD-009) until the skill path (GAM-008).
 */
export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <InstallCard />
      <LessonList />
    </div>
  );
}
