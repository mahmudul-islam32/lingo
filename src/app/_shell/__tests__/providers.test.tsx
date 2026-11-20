import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button, useToast } from "@/components/ui";
import { Providers } from "../../providers";
import * as providers from "../../providers";
import { DEFAULT_THEME } from "../theme";

function ToastTrigger() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: "Saved" })}>Show toast</Button>;
}

describe("Providers", () => {
  it("is light theme only, with no theme switch (PD-066)", () => {
    expect(DEFAULT_THEME).toBe("light");
    expect(Object.keys(providers)).toEqual(["Providers"]);
    render(
      <Providers>
        <p>content</p>
      </Providers>,
    );
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(screen.queryByRole("button", { name: /theme/i })).not.toBeInTheDocument();
  });

  it("mounts the toast provider", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ToastTrigger />
      </Providers>,
    );
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Show toast" }));
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
