import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Main } from "../Main";
import { SkipLink } from "../SkipLink";

describe("SkipLink", () => {
  it("is the first focusable element and moves focus to <main> with Enter", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipLink />
        <button type="button">Something else</button>
        <Main>
          <h1>Page</h1>
        </Main>
      </>,
    );
    await user.tab();
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("href", "#main");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("is visually hidden until focused", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });
});
