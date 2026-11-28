import { describe, expect, it } from "vitest";
import {
  AUTH_ERROR_CODES,
  AuthErrorCodeSchema,
  DEFAULT_AUTH_REDIRECT,
  SyncMetaSchema,
  SyncPullResultSchema,
  safeNextPath,
} from "../index";
import { heartsFull, lessonResult, profile, settings } from "./fixtures";

/** CTO-025 (ADR-020): auth error codes, the `next` rule, pull cursors and results. */

describe("AuthErrorCodeSchema", () => {
  it("has one code per case the auth screens handle", () => {
    expect(AUTH_ERROR_CODES).toEqual([
      "invalid_credentials",
      "email_not_confirmed",
      "email_taken",
      "weak_password",
      "rate_limited",
      "network",
      "provider_disabled",
      "link_expired",
      "session_expired",
      "unknown",
    ]);
    expect(AuthErrorCodeSchema.safeParse("server_said_no").success).toBe(false);
  });
});

describe("safeNextPath (ADR-020 §3: no open redirect)", () => {
  it.each([
    ["/", "/"],
    ["/profile", "/profile"],
    ["/lesson/de-a1-u01-l1?practice=1#top", "/lesson/de-a1-u01-l1?practice=1#top"],
    ["/profile?edit=goal-date", "/profile?edit=goal-date"],
    ["/a/../b", "/b"],
  ])("follows the same-origin path %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["empty", ""],
    ["an absolute URL", "https://evil.example/"],
    ["a protocol-relative URL", "//evil.example/path"],
    ["a backslash trick", "/\\evil.example"],
    ["a backslash inside", "/foo\\bar"],
    ["a javascript: URL", "javascript:alert(1)"],
    ["a relative path", "profile"],
    ["a control character", "/pro\u0000file"],
    ["a newline", "/profile\nSet-Cookie: x"],
    ["a tab", "/\t/evil.example"],
    ["too long", `/${"a".repeat(600)}`],
  ])("falls back to / for %s", (_, next) => {
    expect(safeNextPath(next)).toBe(DEFAULT_AUTH_REDIRECT);
  });
});

describe("SyncMeta and SyncPullResult", () => {
  const cursors = {
    lessonResults: {
      createdAt: "2026-11-27T10:00:00.000Z",
      id: "3f1c2b8e-4d5a-4c6b-9e7f-1a2b3c4d5e6f",
    },
    profile: null,
    settings: "2026-11-27T09:00:00.000Z",
    hearts: null,
  };

  it("keeps SyncMeta stored before CTO-025 valid and accepts cursors", () => {
    expect(SyncMetaSchema.safeParse({ lastPushAt: null, lastPullAt: null }).success).toBe(true);
    expect(
      SyncMetaSchema.safeParse({ lastPushAt: null, lastPullAt: null, pullCursors: cursors })
        .success,
    ).toBe(true);
    expect(
      SyncMetaSchema.safeParse({
        lastPushAt: null,
        lastPullAt: null,
        pullCursors: { ...cursors, settings: "yesterday" },
      }).success,
    ).toBe(false);
    // A bare timestamp is not enough for lesson results (ties across pages).
    expect(
      SyncMetaSchema.safeParse({
        lastPushAt: null,
        lastPullAt: null,
        pullCursors: { ...cursors, lessonResults: "2026-11-27T10:00:00.000Z" },
      }).success,
    ).toBe(false);
  });

  it("accepts a page of results with unchanged one-row facts", () => {
    const page = {
      lessonResults: [lessonResult],
      profile: null,
      settings: null,
      hearts: null,
      cursors,
      hasMore: true,
    };
    expect(SyncPullResultSchema.parse(page)).toEqual(page);
  });

  it("accepts changed one-row facts and rejects an invalid row", () => {
    const full = {
      lessonResults: [],
      profile,
      settings,
      hearts: heartsFull,
      cursors,
      hasMore: false,
    };
    expect(SyncPullResultSchema.safeParse(full).success).toBe(true);
    const bad = { ...full, lessonResults: [{ ...lessonResult, xpEarned: 99 }] };
    expect(SyncPullResultSchema.safeParse(bad).success).toBe(false);
    expect(SyncPullResultSchema.safeParse({ ...full, hasMore: undefined }).success).toBe(false);
  });
});
