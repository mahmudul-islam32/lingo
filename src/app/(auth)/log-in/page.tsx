import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogInScreen } from "@/features/auth";
import { accountsEnabled } from "@/lib/supabase";

export const metadata: Metadata = { title: "Log in" };

/** `/log-in` (PLT-010). Without the accounts flag it redirects to Learn (criterion 1). */
export default function LogInPage() {
  if (!accountsEnabled()) redirect("/");
  return <LogInScreen />;
}
