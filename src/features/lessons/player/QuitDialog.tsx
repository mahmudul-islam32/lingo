"use client";

import { useRef, type RefObject } from "react";
import { Button, Dialog } from "@/components/ui";

export interface QuitDialogProps {
  open: boolean;
  /** "Keep learning", Escape or backdrop. */
  onKeepLearning: () => void;
  onQuit: () => void;
  /** Focus goes back here on close (the header's close button). */
  returnFocusRef: RefObject<HTMLElement | null>;
}

/** Confirm before quitting (LES-002 criterion 10). "Keep learning" is focused by default. */
export function QuitDialog({ open, onKeepLearning, onQuit, returnFocusRef }: QuitDialogProps) {
  const keepRef = useRef<HTMLButtonElement>(null);
  // The Dialog's action row is column-reverse on mobile: "Keep learning" ends up on top.
  return (
    <Dialog
      open={open}
      onClose={onKeepLearning}
      role="alertdialog"
      title="Quit this lesson?"
      description="Your progress in this lesson won't be saved."
      initialFocusRef={keepRef}
      returnFocusRef={returnFocusRef}
      actions={
        <>
          <Button variant="secondary" size="lg" onClick={onQuit} className="sm:w-auto">
            Quit
          </Button>
          <Button ref={keepRef} variant="primary" size="lg" onClick={onKeepLearning}>
            Keep learning
          </Button>
        </>
      }
    />
  );
}
