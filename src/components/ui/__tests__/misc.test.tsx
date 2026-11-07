import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cn } from "../cn";
import { CheckIcon, CrossIcon } from "../icons";
import { Skeleton } from "../Skeleton";
import { Spinner } from "../Spinner";
import { VisuallyHidden } from "../VisuallyHidden";

describe("cn", () => {
  it("joins conditionally and lets later Tailwind classes win", () => {
    const off = false as boolean;
    expect(cn("px-2", off && "hidden", ["py-1", { "px-6": true }])).toBe("py-1 px-6");
  });

  it("resolves token colour conflicts without touching font size", () => {
    expect(cn("bg-canvas text-fg text-sm", "bg-surface")).toBe("text-fg text-sm bg-surface");
    expect(cn("focus-ring", "focus-ring")).toBe("focus-ring");
  });
});

describe("VisuallyHidden", () => {
  it("renders screen-reader-only text", () => {
    render(<VisuallyHidden>Exercise 1 of 10</VisuallyHidden>);
    expect(screen.getByText("Exercise 1 of 10")).toHaveClass("sr-only");
  });

  it("can be a live region with another element", () => {
    render(
      <VisuallyHidden as="div" role="status">
        Matched: hola, hello
      </VisuallyHidden>,
    );
    const status = screen.getByRole("status");
    expect(status.tagName).toBe("DIV");
    expect(status).toHaveTextContent("Matched: hola, hello");
  });
});

describe("Skeleton", () => {
  it("is hidden from assistive tech and pulses only with motion allowed", () => {
    const { container } = render(<Skeleton shape="circle" className="size-24" />);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("rounded-full", "size-24", "motion-safe:animate-pulse");
  });

  it("supports a loading region pattern", () => {
    render(
      <div role="status">
        <VisuallyHidden>Loading lesson</VisuallyHidden>
        <Skeleton />
        <Skeleton shape="rect" />
      </div>,
    );
    expect(screen.getByRole("status")).toHaveAccessibleName("");
    expect(screen.getByRole("status")).toHaveTextContent("Loading lesson");
  });
});

describe("Spinner", () => {
  it("is decorative without a label", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("is a status with a label", () => {
    render(<Spinner label="Loading" size="lg" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
});

describe("icons", () => {
  it("are decorative unless titled", () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    render(<CrossIcon title="Incorrect" />);
    expect(screen.getByRole("img", { name: "Incorrect" })).toBeInTheDocument();
  });
});
