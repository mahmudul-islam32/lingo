import { describe, expect, it } from "vitest";
import { DailyGoalXpSchema, IdentitySchema, ProfileSchema, SettingsSchema } from "../index";
import { profile, settings, UUID_A } from "./fixtures";

describe("DailyGoalXpSchema", () => {
  it.each([10, 20, 30, 50])("accepts %i", (goal) => {
    expect(DailyGoalXpSchema.parse(goal)).toBe(goal);
  });

  it.each([0, 15, 40, 100, "20"])("rejects %s", (goal) => {
    expect(DailyGoalXpSchema.safeParse(goal).success).toBe(false);
  });
});

describe("SettingsSchema", () => {
  it("accepts valid settings", () => {
    expect(SettingsSchema.parse(settings)).toEqual(settings);
  });

  it("rejects an unsupported daily goal", () => {
    expect(SettingsSchema.safeParse({ ...settings, dailyGoalXp: 25 }).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  it("accepts a valid profile and a preset avatar", () => {
    expect(ProfileSchema.safeParse(profile).success).toBe(true);
    const preset = { ...profile, avatar: { kind: "preset", presetId: "lantern-blue" } };
    expect(ProfileSchema.safeParse(preset).success).toBe(true);
  });

  it("trims the display name and rejects blank or too-long names", () => {
    expect(ProfileSchema.parse({ ...profile, displayName: "  Sam  " }).displayName).toBe("Sam");
    expect(ProfileSchema.safeParse({ ...profile, displayName: "   " }).success).toBe(false);
    expect(ProfileSchema.safeParse({ ...profile, displayName: "x".repeat(31) }).success).toBe(
      false,
    );
  });

  it("rejects an unknown avatar kind", () => {
    expect(ProfileSchema.safeParse({ ...profile, avatar: { kind: "photo" } }).success).toBe(false);
  });
});

describe("IdentitySchema", () => {
  it("accepts guest and account identities", () => {
    expect(IdentitySchema.safeParse({ kind: "guest", guestId: UUID_A }).success).toBe(true);
    expect(IdentitySchema.safeParse({ kind: "account", userId: UUID_A }).success).toBe(true);
  });

  it("rejects a guest without a uuid", () => {
    expect(IdentitySchema.safeParse({ kind: "guest", guestId: "abc" }).success).toBe(false);
  });
});
