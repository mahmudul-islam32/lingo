import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";
import { Dialog, Modal } from "../Dialog";

function QuitFlow({ onQuit = () => {} }: { onQuit?: () => void }) {
  const [open, setOpen] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Quit lesson</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Quit this lesson?"
        description="Your progress in this lesson won't be saved."
        initialFocusRef={keepRef}
        actions={
          <>
            <Button variant="secondary" onClick={onQuit}>
              Quit
            </Button>
            <Button ref={keepRef} onClick={() => setOpen(false)}>
              Keep learning
            </Button>
          </>
        }
      />
    </>
  );
}

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    render(<Dialog open={false} onClose={() => {}} title="Hidden" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a labelled, described modal dialog", async () => {
    const user = userEvent.setup();
    render(<QuitFlow />);
    await user.click(screen.getByRole("button", { name: "Quit lesson" }));
    const dialog = screen.getByRole("dialog", { name: "Quit this lesson?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Your progress in this lesson won't be saved.");
  });

  it("focuses the initial element, traps Tab and closes on Escape restoring focus", async () => {
    const user = userEvent.setup();
    render(<QuitFlow />);
    const opener = screen.getByRole("button", { name: "Quit lesson" });
    await user.click(opener);
    const keep = screen.getByRole("button", { name: "Keep learning" });
    const quit = screen.getByRole("button", { name: "Quit" });
    expect(keep).toHaveFocus();

    await user.tab();
    expect(quit).toHaveFocus();
    await user.tab();
    expect(keep).toHaveFocus();
    await user.tab({ shift: true });
    expect(quit).toHaveFocus();
    await user.tab({ shift: true });
    expect(keep).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes from an action and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<QuitFlow />);
    const opener = screen.getByRole("button", { name: "Quit lesson" });
    await user.click(opener);
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes on backdrop click unless disabled", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open onClose={onClose} title="Backdrop" />);
    await user.click(screen.getByTestId("dialog-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<Dialog open onClose={onClose} title="Backdrop" closeOnBackdrop={false} />);
    await user.click(screen.getByTestId("dialog-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("focuses the panel when nothing inside is focusable and keeps Tab there", async () => {
    const user = userEvent.setup();
    render(
      <Modal open onClose={() => {}} title="Info" role="alertdialog">
        Plain text
      </Modal>,
    );
    const dialog = screen.getByRole("alertdialog", { name: "Info" });
    expect(dialog).toHaveFocus();
    await user.tab();
    expect(dialog).toHaveFocus();
  });

  it("locks body scroll while open", () => {
    const { unmount } = render(<Dialog open onClose={() => {}} title="Scroll" />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
