import type { Metadata } from "next";
import { EmptyState } from "../_shell/EmptyState";

export const metadata: Metadata = { title: "Learn" };

/** Learn tab. Empty state until the lesson list (PLT-007) and skill path (GAM-008). */
export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <EmptyState message="Your learning path will appear here." />
    </div>
  );
}
