import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  heartGainAnnouncement,
  heartLossAnnouncement,
  LessonHeartsMeter,
} from "../LessonHeartsMeter";

const region = () => screen.getByRole("status");

describe("heartLossAnnouncement", () => {
  it("says how many are left, or that the last one is gone", () => {
    expect(heartLossAnnouncement(4)).toBe("You lost a heart. 4 left.");
    expect(heartLossAnnouncement(1)).toBe("You lost a heart. 1 left.");
    expect(heartLossAnnouncement(0)).toBe("You lost your last heart.");
  });
});

describe("heartGainAnnouncement (LES-020 AC 5)", () => {
  it("says a heart was earned and how many there are now", () => {
    expect(heartGainAnnouncement(4)).toBe("You earned a heart. 4 hearts.");
    expect(heartGainAnnouncement(5)).toBe("You earned a heart. 5 hearts.");
    expect(heartGainAnnouncement(1)).toBe("You earned a heart. 1 heart.");
  });
});

describe("LessonHeartsMeter", () => {
  it("shows the meter and an empty polite region before any loss", () => {
    render(<LessonHeartsMeter current={5} max={5} />);
    expect(screen.getByRole("img", { name: "Hearts: 5 of 5" })).toBeInTheDocument();
    expect(region()).toHaveAttribute("aria-live", "polite");
    expect(region()).toHaveAttribute("aria-atomic", "true");
    expect(region()).toBeEmptyDOMElement();
  });

  it("clears and re-sets the message so an identical announcement is repeated", async () => {
    const { rerender } = render(<LessonHeartsMeter current={2} max={5} />);
    rerender(<LessonHeartsMeter current={1} max={5} />);
    // Cleared at once, set on the next frame.
    expect(region()).toBeEmptyDOMElement();
    await waitFor(() => expect(region()).toHaveTextContent("You lost a heart. 1 left."));

    // A rise is an earned heart (LES-020).
    rerender(<LessonHeartsMeter current={2} max={5} />);
    await waitFor(() => expect(region()).toHaveTextContent("You earned a heart. 2 hearts."));

    rerender(<LessonHeartsMeter current={1} max={5} />);
    expect(region()).toBeEmptyDOMElement();
    await waitFor(() => expect(region()).toHaveTextContent("You lost a heart. 1 left."));
  });
});
