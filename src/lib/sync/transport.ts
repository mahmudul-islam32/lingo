/**
 * The network side of the sync engine (PLT-014), behind an interface so the engine is
 * unit-tested with a fake. The Supabase implementation uses PostgREST through the one
 * client: lesson results are inserted with `ignoreDuplicates` (`ON CONFLICT (id) DO
 * NOTHING`, a replayed id is a success); the one-row tables are upserted by `user_id`
 * (`merge-duplicates`; the server's `skip_stale_update` trigger keeps the newer row).
 */
import type { SupabaseClient } from "@/lib/supabase";
import { SYNC_TIMINGS } from "./config";
import type { LessonResultRow, OneRowTable } from "./mapping";

export type FailureKind = "network" | "timeout" | "server" | "unauthorized" | "rejected";

export type TransportResult =
  { ok: true } | { ok: false; kind: FailureKind; status: number; code: string | null };

export interface SyncTransport {
  /** The signed-in user's id from the stored session (may refresh it), or `null`. */
  sessionUserId(): Promise<string | null>;
  /** Forces one token refresh after a 401 (ADR-020 §5). `false` when it failed. */
  refreshSession(): Promise<boolean>;
  insertLessonResults(rows: LessonResultRow[]): Promise<TransportResult>;
  upsertRow(table: OneRowTable, row: Record<string, unknown>): Promise<TransportResult>;
}

/** HTTP status → what the engine does with the record (ADR-020 §5 table). */
export function classify(status: number, code: string | null): TransportResult {
  if (status >= 200 && status < 300) return { ok: true };
  if (status === 0) return { ok: false, kind: "network", status, code };
  if (status === 401 || code === "PGRST301" || code === "PGRST303") {
    return { ok: false, kind: "unauthorized", status, code };
  }
  if (status === 408 || status === 429 || status >= 500) {
    return { ok: false, kind: "server", status, code };
  }
  return { ok: false, kind: "rejected", status, code };
}

interface PostgrestLike {
  error: { code?: string | null } | null;
  status: number;
}

async function withTimeout(
  run: (signal: AbortSignal) => PromiseLike<PostgrestLike>,
  timeoutMs: number,
): Promise<TransportResult> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<TransportResult>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ ok: false, kind: "timeout", status: 0, code: null });
    }, timeoutMs);
  });
  try {
    const answer = Promise.resolve(run(controller.signal)).then(
      ({ error, status }): TransportResult =>
        controller.signal.aborted
          ? { ok: false, kind: "timeout", status: 0, code: null }
          : error
            ? classify(status, error.code ?? null)
            : classify(status || 200, null),
      (): TransportResult => ({ ok: false, kind: "network", status: 0, code: null }),
    );
    return await Promise.race([answer, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function createSupabaseTransport(
  load: () => Promise<SupabaseClient | null>,
  timeoutMs: number = SYNC_TIMINGS.requestTimeoutMs,
): SyncTransport {
  return {
    async sessionUserId() {
      const client = await load();
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data.session?.user.id ?? null;
    },
    async refreshSession() {
      const client = await load();
      if (!client) return false;
      const { data, error } = await client.auth.refreshSession();
      return !error && Boolean(data.session);
    },
    async insertLessonResults(rows) {
      const client = await load();
      if (!client) return { ok: false, kind: "unauthorized", status: 401, code: null };
      return withTimeout(
        (signal) =>
          client
            .from("lesson_results")
            .upsert(rows, { onConflict: "id", ignoreDuplicates: true })
            .abortSignal(signal),
        timeoutMs,
      );
    },
    async upsertRow(table, row) {
      const client = await load();
      if (!client) return { ok: false, kind: "unauthorized", status: 401, code: null };
      return withTimeout(
        (signal) => client.from(table).upsert(row, { onConflict: "user_id" }).abortSignal(signal),
        timeoutMs,
      );
    },
  };
}
