import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

/**
 * Offline-first defaults for queries backed by on-device data (Dexie repositories and
 * bundled content). ADR-005 / ARCHITECTURE §5:
 *
 * - `networkMode: "always"`: IndexedDB reads must run with no network; the default
 *   ("online") would pause them offline.
 * - `retry: false`: a failing local read is a bug or a quota/corruption error, not a flaky
 *   network; retrying only delays the error UI.
 * - No refetch on window focus / reconnect / mount: local data changes only through our own
 *   writes, which invalidate the matching key (and the sync engine invalidates after a pull).
 * - `staleTime: Infinity`: same reason; it also keeps optimistic `["hearts"]` writes from
 *   being undone by a background refetch.
 *
 * Server-backed queries (Supabase, Phase 2) override per query with `REMOTE_QUERY_OPTIONS`.
 */
export const LOCAL_QUERY_DEFAULTS = {
  queries: {
    networkMode: "always",
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  },
  mutations: {
    networkMode: "always",
    retry: false,
  },
} as const satisfies DefaultOptions;

/** Per-query overrides for server-backed reads (Supabase): pause offline, retry, refresh. */
export const REMOTE_QUERY_OPTIONS = {
  networkMode: "online",
  retry: 2,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 30_000,
} as const;

/**
 * Creates the app's QueryClient. The app mounts exactly one per browser tab
 * (`src/app/providers.tsx`); tests use `createTestQueryClient` from `@/lib/query/testing`.
 */
export function createQueryClient(overrides: DefaultOptions = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { ...LOCAL_QUERY_DEFAULTS.queries, ...overrides.queries },
      mutations: { ...LOCAL_QUERY_DEFAULTS.mutations, ...overrides.mutations },
    },
  });
}
