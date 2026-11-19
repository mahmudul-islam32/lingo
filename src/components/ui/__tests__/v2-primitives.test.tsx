import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { cn } from "../cn";
import { NavTab } from "../NavTab";
import { OptionCard } from "../OptionCard";
import { ProgressBar } from "../ProgressBar";
import { StatTile } from "../StatTile";
import { XpBadge } from "../XpBadge";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Button v2 styles (CTO-016)", () => {
  it("primary has the 3D edge and a pressed state; disabled is grey and flat", () => {
    render(
      <>
        <Button>Check</Button>
        <Button disabled>Locked</Button>
      </>,
    );
    const primary = screen.getByRole("button", { name: "Check" });
    expect(primary).toHaveClass(
      "bg-primary",
      "shadow-3d-primary",
      "enabled:active:translate-y-0.5",
      "min-h-13",
    );
    expect(screen.getByRole("button", { name: "Locked" })).toHaveClass(
      "disabled:bg-disabled",
      "disabled:shadow-none",
    );
  });

  it("has a soft variant", () => {
    render(<Button variant="soft">0.7×</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary-soft", "text-primary-fg");
  });
});

describe("cn with v2 theme values", () => {
  it("resolves shadow and radius conflicts", () => {
    expect(cn("shadow-3d-card", "shadow-3d-primary")).toBe("shadow-3d-primary");
    expect(cn("shadow-3d-primary", "shadow-none")).toBe("shadow-none");
    expect(cn("rounded-control", "rounded-chip")).toBe("rounded-chip");
  });
});

describe("Chip", () => {
  it("shows the code and can replace it for screen readers", () => {
    const { container } = render(
      <Chip tone="gold" label="German">
        DE
      </Chip>,
    );
    expect(screen.getByText("DE")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("German")).toHaveClass("sr-only");
    expect(container.firstChild).toHaveClass("bg-xp-soft");
  });
});

describe("StatTile", () => {
  it("reads label before value in the header layout", () => {
    const { container } = render(<StatTile label="Total XP" value={15} tone="gold" />);
    expect(container.firstChild).toHaveTextContent(/^Total XP15$/);
    expect(container.firstChild).toHaveClass("border-xp-gold");
  });

  it("renders the inline layout as a list item", () => {
    render(
      <ul>
        <StatTile as="li" layout="inline" label="Day streak" value={13} tone="coral" />
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent(/Day streak.*13/);
  });
});

describe("OptionCard", () => {
  it("acts as a radio with aria-checked and a check mark when selected", () => {
    render(
      <div role="radiogroup" aria-label="Course">
        <OptionCard role="radio" selected title="German" description="Strong grammar focus" />
        <OptionCard role="radio" title="Spanish" />
      </div>,
    );
    const german = screen.getByRole("radio", { name: /German/ });
    expect(german).toHaveAttribute("aria-checked", "true");
    expect(german).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("radio", { name: "Spanish" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getAllByTestId("check-icon")).toHaveLength(1);
  });

  it("is a toggle button by default and shows the answer status", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OptionCard layout="tile" title="el café" status="correct" onClick={onClick} />);
    const card = screen.getByRole("button", { name: "el café" });
    expect(card).toHaveAttribute("aria-pressed", "false");
    expect(card).toHaveAttribute("data-status", "correct");
    expect(card).toHaveClass("border-success");
    await user.click(card);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("NavTab", () => {
  it("marks the current tab with aria-current", () => {
    render(
      <nav>
        <NavTab href="/" label="Learn" icon={<svg />} active />
        <NavTab href="/profile" label="Profile" icon={<svg />} />
      </nav>,
    );
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute("aria-current");
  });
});

describe("XpBadge and ProgressBar v2", () => {
  it("XpBadge has a plain variant without the pill", () => {
    const { container } = render(<XpBadge amount={340} variant="plain" />);
    expect(screen.getByText("340 XP")).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass("bg-xp-soft");
  });

  it("ProgressBar uses the track colour", () => {
    render(<ProgressBar value={3} max={10} label="Lesson progress" tone="accent" />);
    expect(screen.getByRole("progressbar")).toHaveClass("bg-track");
  });
});
