import { render, screen } from "@testing-library/react";
import { renderWithQueryClient } from "@/lib/query/testing";
import { describe, expect, it } from "vitest";
import LearnPage, { metadata } from "./page";
import ProfilePage, { metadata as profileMetadata } from "./profile/page";

describe("LearnPage", () => {
  it("renders one h1 and the lesson list (loading first)", async () => {
    renderWithQueryClient(<LearnPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Learn" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading lessons" })).toBeInTheDocument();
    // Bundled Unit 1 of the default course (en-de, CTO-008; titles are pm content); jsdom
    // has no IndexedDB, so progress uses the in-memory fallback.
    expect(await screen.findByRole("link", { name: /^Lesson 1: / })).toBeInTheDocument();
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
