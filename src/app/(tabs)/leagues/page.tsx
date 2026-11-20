import type { Metadata } from "next";
import { LeaguesScreen } from "@/features/gamification";

export const metadata: Metadata = { title: "Leagues" };

/** Leagues tab (PD-066 §6): route and nav PLT-026, screen GAM-012. */
export default function LeaguesPage() {
  return <LeaguesScreen />;
}
