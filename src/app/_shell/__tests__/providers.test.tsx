import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Button, useToast } from "@/components/ui";
import { Providers, useTheme } from "../../providers";

function ToastTrigger() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: "Saved" })}>Show toast</Button>;
}

function ThemeReader() {
  const { theme, setTheme } = useTheme();
  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme: {theme}</Button>
  );
}

describe("Providers", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it("applies the dark theme by default and can switch it", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ThemeReader />
      </Providers>,
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(screen.getByRole("button", { name: "Theme: dark" }));
    expect(document.documentElement.dataset.theme).toBe("light");
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
