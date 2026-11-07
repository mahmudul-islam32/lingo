import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../Card";

describe("Card", () => {
  it("renders a div by default with content", () => {
    render(<Card>Hello</Card>);
    const card = screen.getByText("Hello");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass("bg-surface", "p-4");
  });

  it("renders as a list item inside a list", () => {
    render(
      <ol>
        <Card as="li">Lesson 1</Card>
      </ol>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Lesson 1");
  });

  it("supports section with an accessible name, tones and padding", () => {
    render(
      <Card as="section" aria-label="Unit 1" tone="accent" padding="lg">
        Unit
      </Card>,
    );
    const region = screen.getByRole("region", { name: "Unit 1" });
    expect(region).toHaveClass("bg-night-800", "p-6");
  });
});
