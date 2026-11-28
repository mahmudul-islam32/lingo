import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCallbackScreen } from "@/features/auth";
import { accountsEnabled } from "@/lib/supabase";

export const metadata: Metadata = { title: "Signing in" };

/** `/auth/callback` (ADR-020 §3), a client page. Redirects to Learn without accounts. */
export default function AuthCallbackPage() {
  if (!accountsEnabled()) redirect("/");
  return <AuthCallbackScreen />;
}
