import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("exposes progressbar aria values", () => {
    render(<ProgressBar value={3} max={10} label="Lesson progress" valueText="Exercise 4 of 10" />);
    const bar = screen.getByRole("progressbar", { name: "Lesson progress" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "Exercise 4 of 10");
    expect(bar.firstElementChild).toHaveStyle({ width: "30%" });
  });

  it("clamps values to the range", () => {
    render(<ProgressBar value={15} max={10} label="Over" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  });

  it("clamps negative values and handles max 0", () => {
    render(<ProgressBar value={-2} max={0} label="Empty" />);
    const bar = screen.getByRole("progressbar", { name: "Empty" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.firstElementChild).toHaveStyle({ width: "0%" });
  });

  it("can be labelled by a visible element", () => {
    render(
      <>
        <span id="goal">Daily goal</span>
        <ProgressBar value={10} max={20} labelledBy="goal" tone="xp" />
      </>,
    );
    expect(screen.getByRole("progressbar", { name: "Daily goal" })).toBeInTheDocument();
  });

  it("only animates width when motion is allowed", () => {
    render(<ProgressBar value={1} max={2} label="Motion" />);
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(
      "motion-safe:transition-[width]",
    );
  });
});
