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
  /** "lesson" (default) or "review" (LES-023): the noun in the title and description. */
  noun?: "lesson" | "review";
}

/** Confirm before quitting (LES-002 criterion 10). "Keep learning" is focused by default. */
export function QuitDialog({
  open,
  onKeepLearning,
  onQuit,
  returnFocusRef,
  noun = "lesson",
}: QuitDialogProps) {
  const keepRef = useRef<HTMLButtonElement>(null);
  // The Dialog's action row is column-reverse on mobile: "Keep learning" ends up on top.
  return (
    <Dialog
      open={open}
      onClose={onKeepLearning}
      role="alertdialog"
      title={`Quit this ${noun}?`}
      description={`Your progress in this ${noun} won't be saved.`}
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
