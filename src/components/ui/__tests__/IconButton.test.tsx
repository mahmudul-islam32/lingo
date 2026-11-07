import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "../IconButton";
import { CloseIcon } from "../icons";

describe("IconButton", () => {
  it("uses the label as accessible name and hides the icon", () => {
    render(<IconButton label="Quit lesson" icon={<CloseIcon />} />);
    const button = screen.getByRole("button", { name: "Quit lesson" });
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("is at least 44px by default", () => {
    render(<IconButton label="Back" icon={<CloseIcon />} />);
    expect(screen.getByRole("button", { name: "Back" })).toHaveClass("size-11");
  });

  it("works with the keyboard and forwards refs", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} label="Dismiss" icon={<CloseIcon />} onClick={onClick} />);
    await user.tab();
    expect(ref.current).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
});
