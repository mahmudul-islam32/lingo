// @vitest-environment node
/**
 * Static checks on the Supabase SQL (CTO-003, ADR-003). No database is started:
 * the migration text is parsed to catch the mistakes that matter most — a table
 * without Row Level Security, an unsafe SECURITY DEFINER function, or a synced
 * contract field with no column.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HeartsStateSchema } from "../gamification";
import { LessonResultSchema } from "../lesson-session";
import { ProfileSchema, SettingsSchema } from "../user";

const supabaseDir = join(process.cwd(), "supabase");
const migrationsDir = join(supabaseDir, "migrations");

const migrationFiles = existsSync(migrationsDir)
  ? readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
  : [];

/** All migrations concatenated, lowercased, with `--` comments removed. */
const sql = migrationFiles
  .map((f) => readFileSync(join(migrationsDir, f), "utf8"))
  .join("\n")
  .replace(/--[^\n]*/g, "")
  .toLowerCase();

/** Table name -> column names, from `create table public.<name> ( ... );`. */
function parseTables(source: string): Map<string, string[]> {
  const tables = new Map<string, string[]>();
  for (const match of source.matchAll(/create table (?:public\.)?(\w+)\s*\(([\s\S]*?)\n\);/g)) {
    const [, name, body] = match;
    const columns = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) =>
        /^[a-z_][a-z0-9_]*\s+(uuid|text|integer|bigint|boolean|timestamptz|date|double precision|jsonb|public\.slug)\b/.test(
          line,
        ),
      )
      .map((line) => line.split(/\s+/)[0]);
    tables.set(name, columns);
  }
  return tables;
}

const tables = parseTables(sql);

const camelToSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

describe("supabase project files", () => {
  it("has config.toml, seed.sql and ordered, timestamped migrations", () => {
    expect(existsSync(join(supabaseDir, "config.toml"))).toBe(true);
    expect(existsSync(join(supabaseDir, "seed.sql"))).toBe(true);
    expect(migrationFiles.length).toBeGreaterThan(0);
    for (const file of migrationFiles) expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
  });

  it("seed.sql contains no real-looking secrets", () => {
    const seed = readFileSync(join(supabaseDir, "seed.sql"), "utf8");
    expect(seed).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/); // JWTs (anon / service role keys)
    expect(seed).not.toMatch(/\bsk_[a-zA-Z0-9]{16,}/);
  });
});

describe("supabase migrations", () => {
  it("define the expected tables", () => {
    expect([...tables.keys()].sort()).toEqual([
      "guest_migrations",
      "hearts_state",
      "lesson_results",
      "profiles",
      "settings",
    ]);
  });

  it.each([...tables.keys()])("enable row level security on %s", (table) => {
    expect(sql).toMatch(new RegExp(`alter table (public\\.)?${table} enable row level security`));
  });

  it.each([...tables.keys()])("scope every policy on %s to auth.uid()", (table) => {
    const policies = [
      ...sql.matchAll(
        new RegExp(`create policy \\w+ on (?:public\\.)?${table}\\b([\\s\\S]*?);`, "g"),
      ),
    ];
    expect(policies.length).toBeGreaterThan(0);
    for (const [, body] of policies) {
      expect(body).toContain("to authenticated");
      expect(body).toContain("(select auth.uid()) = user_id");
      expect(body).not.toMatch(/using\s*\(\s*true\s*\)/);
    }
  });

  it("keeps lesson_results append-only for clients", () => {
    expect(sql).not.toMatch(
      /create policy \w+ on (public\.)?lesson_results\s+for (update|delete|all)/,
    );
    expect(sql).toMatch(
      /revoke update, delete, truncate on table public\.lesson_results from authenticated/,
    );
  });

  it("defines migrate_guest_to_account as a hardened security definer RPC", () => {
    const fn = sql.match(
      /create function public\.migrate_guest_to_account\(payload jsonb\)([\s\S]*?)\$\$;/,
    );
    expect(fn).not.toBeNull();
    const body = fn![1];
    expect(body).toContain("security definer");
    expect(body).toContain("set search_path = ''");
    expect(body).toContain("auth.uid()");
    // The target user must never come from the payload.
    expect(body).not.toMatch(/payload\s*->>?\s*'userid'/);
    expect(sql).toMatch(
      /revoke execute on function public\.migrate_guest_to_account\(jsonb\) from public, anon/,
    );
    expect(sql).toMatch(
      /grant execute on function public\.migrate_guest_to_account\(jsonb\) to authenticated/,
    );
  });

  it("pins search_path on every function", () => {
    const functions = [
      ...sql.matchAll(/create (?:or replace )?function ([\w.]+)\(([\s\S]*?)as \$\$/g),
    ];
    expect(functions.length).toBeGreaterThan(0);
    for (const [, name, header] of functions) {
      expect(header, name).toContain("set search_path = ''");
    }
  });
});

describe("tables cover the synced contracts", () => {
  const cases: [string, readonly string[], Record<string, string[]>][] = [
    [
      "profiles",
      Object.keys(ProfileSchema.shape),
      { id: ["user_id"], avatar: ["avatar_kind", "avatar_preset_id"] },
    ],
    ["settings", Object.keys(SettingsSchema.shape), {}],
    ["hearts_state", Object.keys(HeartsStateSchema.shape), {}],
    [
      "lesson_results",
      Object.keys(LessonResultSchema.shape),
      { xp: ["xp_base", "xp_perfect_bonus"] },
    ],
  ];

  it.each(cases)("%s has a column for every contract field", (table, keys, renames) => {
    const columns = tables.get(table) ?? [];
    for (const key of keys) {
      for (const column of renames[key] ?? [camelToSnake(key)]) {
        expect(columns, `${table}.${column} (from ${key})`).toContain(column);
      }
    }
  });

  it.each(["profiles", "settings", "hearts_state", "lesson_results"])(
    "%s has a server-side pull cursor",
    (table) => {
      const columns = tables.get(table) ?? [];
      expect(columns).toContain("created_at");
      if (table !== "lesson_results") expect(columns).toContain("server_updated_at");
    },
  );
});
