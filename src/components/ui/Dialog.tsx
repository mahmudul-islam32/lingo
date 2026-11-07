"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";
import { getFocusable } from "./focus";

const subscribeNothing = () => () => {};
const isClient = () => true;
const isServer = () => false;

export interface DialogProps {
  open: boolean;
  /** Called on Escape, backdrop click (if enabled) or by your own buttons. */
  onClose: () => void;
  /** Visible title; it names the dialog (`aria-labelledby`). */
  title: ReactNode;
  /** Optional body text; it describes the dialog (`aria-describedby`). */
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons row rendered at the bottom (e.g. "Keep learning" / "Quit"). */
  actions?: ReactNode;
  /** Element to focus when the dialog opens (default: first focusable element). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Element to focus after closing. Default: the element that had focus when the
   * dialog opened (e.g. the button that opened it).
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Close when the backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;
  /** `alertdialog` for destructive confirmations. Default `dialog`. */
  role?: "dialog" | "alertdialog";
  className?: string;
}

/**
 * Modal dialog: rendered in a portal, `aria-modal`, traps Tab/Shift+Tab inside, closes on
 * Escape, locks page scroll and restores focus on close. Also exported as `Modal`.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  initialFocusRef,
  returnFocusRef,
  closeOnBackdrop = true,
  role = "dialog",
  className,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // false during SSR and hydration, true afterwards: the portal never renders on the server.
  const mounted = useSyncExternalStore(subscribeNothing, isClient, isServer);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const returnTarget = returnFocusRef?.current ?? null;
    const panel = panelRef.current;
    const target =
      initialFocusRef?.current ?? (panel ? getFocusable(panel)[0] : undefined) ?? panel;
    target?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      const back = returnTarget ?? previouslyFocused;
      if (back && back.isConnected) back.focus();
    };
    // Refs are read once per opening on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted]);

  if (!open || !mounted) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = getFocusable(panelRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      panelRef.current.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden="true"
        data-testid="dialog-backdrop"
        className="absolute inset-0 bg-backdrop motion-safe:animate-fade-in"
        onClick={closeOnBackdrop ? () => onCloseRef.current() : undefined}
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative w-full max-w-md rounded-card border border-border bg-surface p-6 text-fg shadow-xl",
          "focus:outline-none motion-safe:animate-slide-up",
          className,
        )}
      >
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-fg-muted">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {actions && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Alias: tickets refer to the dialog as "Modal". */
export const Modal = Dialog;
export type ModalProps = DialogProps;
