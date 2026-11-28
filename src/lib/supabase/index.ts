/** Public API of the Supabase client layer (ADR-020 §1). Import from `@/lib/supabase`. */
export { accountsEnabled, googleAuthEnabled, supabaseAnonKey, supabaseUrl } from "./config";
export {
  AUTH_STORAGE_KEY,
  getSupabaseClient,
  setSupabaseClientForTests,
  type SupabaseClient,
} from "./client";
