import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LearnPage, { metadata } from "./page";
import ProfilePage, { metadata as profileMetadata } from "./profile/page";

describe("LearnPage", () => {
  it("renders one h1 and the lesson list (loading first)", async () => {
    render(<LearnPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Learn" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading lessons" })).toBeInTheDocument();
    // Bundled Unit 1; jsdom has no IndexedDB, so progress uses the in-memory fallback.
    expect(await screen.findByRole("link", { name: "Lesson 1: Hello!" })).toBeInTheDocument();
    expect(metadata.title).toBe("Learn");
  });
});

describe("ProfilePage", () => {
  it("renders one h1 and the empty state", () => {
    render(<ProfilePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Your profile will appear here.")).toBeInTheDocument();
    expect(profileMetadata.title).toBe("Profile");
  });
});
