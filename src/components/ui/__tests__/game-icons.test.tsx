import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeartIcon } from "../HeartIcon";
import { XpBadge } from "../XpBadge";

describe("HeartIcon", () => {
  it("is decorative by default", () => {
    const { container } = render(<HeartIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-filled", "true");
  });

  it("has an image role with a label, and an outline state", () => {
    render(<HeartIcon filled={false} size="lg" label="Heart lost" />);
    const img = screen.getByRole("img", { name: "Heart lost" });
    expect(img).toHaveAttribute("data-filled", "false");
    expect(img).toHaveAttribute("width", "32");
  });
});

describe("XpBadge", () => {
  it("shows the amount as text", () => {
    render(<XpBadge amount={15} />);
    expect(screen.getByText("15 XP")).toBeInTheDocument();
  });

  it("prefixes positive amounts when signed and hides the icon", () => {
    const { container } = render(<XpBadge amount={5} signed size="sm" />);
    expect(screen.getByText("+5 XP")).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not prefix zero and accepts a custom label", () => {
    render(<XpBadge amount={0} signed label="No XP earned" />);
    expect(screen.getByLabelText("No XP earned")).toHaveTextContent("0 XP");
  });
});
