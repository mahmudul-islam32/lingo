import type { Metadata } from "next";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = { title: "Profile" };

/** Profile tab (PLT-016 slot, redesign v2 PLT-026): see `ProfileScreen`. */
export default function ProfilePage() {
  return <ProfileScreen />;
}
