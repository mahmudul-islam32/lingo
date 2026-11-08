import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeartsMeter } from "../HeartsMeter";

describe("HeartsMeter", () => {
  it("is named 'Hearts: 5 of 5' with a filled icon and the number", () => {
    render(<HeartsMeter current={5} max={5} />);
    const meter = screen.getByRole("img", { name: "Hearts: 5 of 5" });
    expect(meter).toHaveTextContent("5");
    const icon = meter.querySelector("svg");
    expect(icon).toHaveAttribute("data-filled", "true");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("is named 'Hearts: 0 of 5' with an outlined icon at 0", () => {
    render(<HeartsMeter current={0} max={5} />);
    const meter = screen.getByRole("img", { name: "Hearts: 0 of 5" });
    expect(meter).toHaveTextContent("0");
    expect(meter.querySelector("svg")).toHaveAttribute("data-filled", "false");
  });

  it("takes max from props and renders the number with the fg token, bold", () => {
    render(<HeartsMeter current={2} max={3} size="sm" />);
    const meter = screen.getByRole("img", { name: "Hearts: 2 of 3" });
    const number = meter.querySelector("span");
    expect(number).toHaveClass("text-fg", "font-bold", "text-sm");
    expect(meter.querySelector("svg")).toHaveAttribute("width", "16");
  });

  it("uses theme tokens only (no colour literals)", () => {
    const { container } = render(<HeartsMeter current={4} max={5} size="lg" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
    expect(container.querySelector("svg")).toHaveClass("text-heart");
  });
});
