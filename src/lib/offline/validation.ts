/** Parsing of everything read from local storage: records are never trusted. */
import type { z } from "zod";
import type { TableName } from "./store";

/** Reported when a stored record fails its contract and is skipped or replaced. */
export interface CorruptRecordEvent {
  table: TableName;
  key: string;
  /** What the repository did about it. */
  action: "skipped" | "replaced" | "recovered" | "removed";
  issues: string[];
}

export type CorruptRecordReporter = (event: CorruptRecordEvent) => void;

export const warnCorruptRecord: CorruptRecordReporter = (event) => {
  console.warn(
    `[offline] corrupt record in ${event.table}/${event.key} (${event.action}): ${event.issues.join("; ")}`,
  );
};

export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export type ReadResult<T> =
  { status: "missing" } | { status: "ok"; value: T } | { status: "corrupt"; issues: string[] };

/** Classifies a raw stored value against a contract schema. */
export function readRecord<S extends z.ZodType>(schema: S, raw: unknown): ReadResult<z.infer<S>> {
  if (raw === undefined || raw === null) return { status: "missing" };
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { status: "ok", value: parsed.data };
  return { status: "corrupt", issues: formatIssues(parsed.error) };
}
