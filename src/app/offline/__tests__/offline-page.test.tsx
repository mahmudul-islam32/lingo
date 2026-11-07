import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OfflinePage, { metadata } from "../page";
import { RetryButton } from "../RetryButton";

describe("offline fallback page (PLT-002)", () => {
  it("has one main, one h1 'You're offline', the body text and a focusable button", () => {
    render(<OfflinePage />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("You're offline");
    expect(screen.getByText("Check your connection and try again.")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Try again" });
    button.focus();
    expect(button).toHaveFocus();
    expect(metadata.title).toBe("Offline");
    // Decorative Lumi in the low "ember" pose (UX notes).
    const lumi = document.querySelector('svg[data-pose="ember"]');
    expect(lumi).toHaveAttribute("aria-hidden", "true");
  });

  it("'Try again' reloads the page", async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    render(<RetryButton reload={reload} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
