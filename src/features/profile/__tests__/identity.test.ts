import { describe, expect, it } from "vitest";
import {
  GUEST_NAME,
  joinedLabel,
  profileDisplayName,
  profileInitials,
  profileSubtitle,
} from "../identity";

describe("profile identity (PLT-026 AC 10)", () => {
  it("uses the chosen name and its initials", () => {
    const p = { displayName: "Alex Lindqvist" };
    expect(profileDisplayName(p)).toBe("Alex Lindqvist");
    expect(profileInitials(p)).toBe("AL");
    expect(profileInitials({ displayName: "mia" })).toBe("M");
    expect(profileInitials({ displayName: "Ana Maria Ruiz" })).toBe("AR");
  });

  it('shows "Guest" and no initials for the placeholder name or no profile', () => {
    expect(profileDisplayName({ displayName: "Learner" })).toBe(GUEST_NAME);
    expect(profileInitials({ displayName: "Learner" })).toBeNull();
    expect(profileDisplayName(null)).toBe("Guest");
    expect(profileInitials(null)).toBeNull();
  });

  it('formats "Joined <Month YYYY>" from joinedAt, else onboardedAt, else nothing', () => {
    expect(joinedLabel({ joinedAt: "2026-09-03T10:00:00.000Z", onboardedAt: null }, "UTC")).toBe(
      "Joined September 2026",
    );
    expect(joinedLabel({ joinedAt: "", onboardedAt: "2026-11-19T10:00:00.000Z" }, "UTC")).toBe(
      "Joined November 2026",
    );
    expect(joinedLabel({ joinedAt: "not a date", onboardedAt: null })).toBeNull();
    expect(joinedLabel(null)).toBeNull();
  });

  it("joins the course and join date with a middle dot, leaving unknown parts out", () => {
    expect(profileSubtitle("German", "Joined November 2026")).toBe(
      "Learning German · Joined November 2026",
    );
    expect(profileSubtitle("German", null)).toBe("Learning German");
    expect(profileSubtitle(null, null)).toBe("");
  });
});
