import type { Metadata } from "next";
import { EmptyState } from "../../_shell/EmptyState";

export const metadata: Metadata = { title: "Profile" };

/** Profile tab. Empty state until the profile screen (PLT-016). */
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <EmptyState message="Your profile will appear here." />
    </div>
  );
}
