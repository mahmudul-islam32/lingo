import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders a native button with type=button by default", () => {
    render(<Button>Check</Button>);
    const button = screen.getByRole("button", { name: "Check" });
    expect(button).toHaveAttribute("type", "button");
  });

  it.each(["primary", "secondary", "ghost", "danger", "success"] as const)(
    "renders the %s variant",
    (variant) => {
      render(<Button variant={variant}>Go</Button>);
      expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    },
  );

  it("applies size and full-width classes", () => {
    render(
      <Button size="lg" fullWidth>
        Continue
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveClass("min-h-12", "w-full");
  });

  it("is reachable with Tab and activates with Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Check</Button>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Check" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("has a visible focus ring class", () => {
    render(<Button>Focus me</Button>);
    expect(screen.getByRole("button")).toHaveClass("focus-visible:focus-ring");
  });

  it("does not fire when disabled and exposes aria-disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Check
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Check" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows a loading state that keeps focus but ignores clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Saving" onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Saving");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders decorative icons and forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button
        ref={ref}
        leftIcon={<svg data-testid="left" />}
        rightIcon={<svg data-testid="right" />}
      >
        Next
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("left").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("right").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("merges custom classes over defaults", () => {
    render(<Button className="px-10">Wide</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-10");
    expect(button).not.toHaveClass("px-4");
  });
});
