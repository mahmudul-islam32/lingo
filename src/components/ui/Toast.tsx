"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { cn } from "./cn";
import { IconButton } from "./IconButton";
import { CheckIcon, CloseIcon, CrossIcon } from "./icons";

export type ToastTone = "info" | "success" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  /** `error` toasts are announced assertively (`role="alert"`), others politely. */
  tone?: ToastTone;
  action?: ToastAction;
  /** Auto-dismiss after this many ms; `null` = stays until dismissed. Default 5000. */
  duration?: number | null;
}

export interface ToastProps extends Omit<ToastOptions, "duration"> {
  onDismiss: () => void;
  className?: string;
}

const TONE: Record<ToastTone, string> = {
  info: "bg-surface-raised text-fg border-border-strong",
  success: "bg-success-soft text-success-fg border-success",
  error: "bg-danger-soft text-danger-fg border-danger",
};

/** One toast (presentational). Usually rendered by `ToastProvider`. */
export function Toast({
  title,
  description,
  tone = "info",
  action,
  onDismiss,
  className,
}: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-card border-2 p-4 shadow-lg motion-safe:animate-slide-up",
        TONE[tone],
        className,
      )}
    >
      {tone === "success" && <CheckIcon className="mt-0.5 shrink-0" />}
      {tone === "error" && <CrossIcon className="mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        {action && (
          <Button
            size="sm"
            variant="primary"
            className="mt-3"
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
          >
            {action.label}
          </Button>
        )}
      </div>
      <IconButton
        label="Dismiss"
        icon={<CloseIcon size={18} />}
        size="sm"
        variant="ghost"
        className="-m-1 text-current"
        onClick={onDismiss}
      />
    </div>
  );
}

interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss time in ms. Default 5000. */
  defaultDuration?: number;
  /** Classes for the fixed viewport, e.g. to sit above a bottom navigation. */
  viewportClassName?: string;
}

/**
 * Holds the toast queue and renders the live regions. Mount once near the root
 * (dev-platform: `src/app/providers.tsx`), then call `useToast()` anywhere below.
 */
export function ToastProvider({
  children,
  defaultDuration = 5000,
  viewportClassName,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      setToasts((list) => [...list, { ...options, id }]);
      const duration = options.duration === undefined ? defaultDuration : options.duration;
      if (duration !== null) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [defaultDuration, dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) clearTimeout(timer);
      map.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);
  const polite = toasts.filter((t) => t.tone !== "error");
  const assertive = toasts.filter((t) => t.tone === "error");

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4",
          viewportClassName,
        )}
      >
        <div role="alert" aria-live="assertive" className="flex flex-col gap-2">
          {assertive.map(({ id, title, description, tone, action }) => (
            <Toast
              key={id}
              title={title}
              description={description}
              tone={tone}
              action={action}
              onDismiss={() => dismiss(id)}
            />
          ))}
        </div>
        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          {polite.map(({ id, title, description, tone, action }) => (
            <Toast
              key={id}
              title={title}
              description={description}
              tone={tone}
              action={action}
              onDismiss={() => dismiss(id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/** Access the toast API. Throws when used outside `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}
