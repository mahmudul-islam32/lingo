import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpScreen } from "@/features/auth";
import { accountsEnabled } from "@/lib/supabase";

export const metadata: Metadata = { title: "Create your account" };

/** `/sign-up` (PLT-010). Without the accounts flag it redirects to Learn (criterion 1). */
export default function SignUpPage() {
  if (!accountsEnabled()) redirect("/");
  return <SignUpScreen />;
}
