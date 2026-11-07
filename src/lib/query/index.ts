export { createQueryClient, LOCAL_QUERY_DEFAULTS, REMOTE_QUERY_OPTIONS } from "./client";
export { queryKeys, type QueryKeys } from "./keys";
// Test helpers live in `@/lib/query/testing` (not re-exported: keeps Testing Library out of
// the app bundle).
