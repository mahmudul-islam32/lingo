import type { Metadata } from "next";
import { LearnScreen } from "./_learn/LearnScreen";

export const metadata: Metadata = { title: "Learn" };

/** Learn tab (PLT-009): top bar, streak Lumi + daily goal, skill path. */
export default function LearnPage() {
  return <LearnScreen />;
}
