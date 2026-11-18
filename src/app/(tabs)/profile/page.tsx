import type { Metadata } from "next";
import { EmptyState } from "../../_shell/EmptyState";
import { StartLevelRow } from "./StartLevelRow";

export const metadata: Metadata = { title: "Profile" };

/**
 * Profile tab. The start level setting (PLT-025); the rest of the profile screen
 * (PLT-016) is still an empty state.
 */
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <StartLevelRow />
      <EmptyState message="Your profile will appear here." />
    </div>
  );
}
