import type { Metadata } from "next";
import { PracticeScreen } from "@/features/path";

export const metadata: Metadata = { title: "Practice" };

/** Practice tab (PD-066 §5): route and nav PLT-026, screen GAM-012. */
export default function PracticePage() {
  return <PracticeScreen />;
}
