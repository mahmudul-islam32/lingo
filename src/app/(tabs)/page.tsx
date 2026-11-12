import type { Metadata } from "next";
import { EmptyState } from "../_shell/EmptyState";
import { InstallCard } from "../_shell/InstallCard";

export const metadata: Metadata = { title: "Learn" };

/**
 * Learn tab: the install card (PLT-005), then the empty state until the lesson list
 * (PLT-007) and skill path (GAM-008).
 */
export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <InstallCard />
      <EmptyState message="Your learning path will appear here." />
    </div>
  );
}
