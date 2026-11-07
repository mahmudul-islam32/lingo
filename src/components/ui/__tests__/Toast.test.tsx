import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button";
import { ToastProvider, useToast, type ToastOptions } from "../Toast";

function Trigger(props: ToastOptions) {
  const toast = useToast();
  return <Button onClick={() => toast.show(props)}>Show</Button>;
}

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces info toasts politely and dismisses with the button", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger title="Saved" description="Your lesson is on this device." duration={null} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Show" }));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Saved");
    expect(status).toHaveTextContent("Your lesson is on this device.");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(status).toBeEmptyDOMElement();
  });

  it("announces error toasts assertively", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger title="Couldn't save" tone="error" duration={null} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
  });

  it("runs the action, then dismisses; keyboard operable", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <ToastProvider>
        <Trigger
          title="A new version of Polyglow is ready"
          action={{ label: "Refresh", onClick: onRefresh }}
          duration={null}
        />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(screen.queryByText("A new version of Polyglow is ready")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the duration", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <ToastProvider defaultDuration={1000}>{children}</ToastProvider>,
    });
    act(() => {
      result.current.show({ title: "Quick", tone: "success" });
    });
    expect(screen.getByText("Quick")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Quick")).not.toBeInTheDocument();
  });

  it("dismisses programmatically by id", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <ToastProvider>{children}</ToastProvider>,
    });
    let id = "";
    act(() => {
      id = result.current.show({ title: "Bye" });
    });
    expect(screen.getByText("Bye")).toBeInTheDocument();
    act(() => {
      result.current.dismiss(id);
    });
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  });

  it("throws outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
