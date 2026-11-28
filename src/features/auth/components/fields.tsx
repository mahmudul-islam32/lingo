"use client";

import { useId, useState, type Ref } from "react";
import { cn } from "@/components/ui";
import { AUTH_COPY } from "../messages";

const INPUT_CLASSES =
  "min-h-12 w-full min-w-0 rounded-control border-2 border-border bg-surface px-3 text-base " +
  "text-fg focus-visible:focus-ring aria-invalid:border-danger-border";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "email" | "text";
  autoComplete: string;
  error?: string | null;
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
  name: string;
}

/** A labelled input; the hint and the error are linked with `aria-describedby` (PLT-010 AC 3). */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  hint,
  inputRef,
  disabled,
  name,
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        inputMode={type === "email" ? "email" : undefined}
        autoCapitalize={type === "email" ? "none" : undefined}
        spellCheck={type === "email" ? false : undefined}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={INPUT_CLASSES}
      />
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="font-medium text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export interface PasswordFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
  error?: string | null;
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
  name: string;
}

/** Password input with a "Show password" toggle (`aria-pressed`, PLT-010 AC 9). */
export function PasswordField({
  label = AUTH_COPY.password,
  value,
  onChange,
  autoComplete,
  error,
  hint,
  inputRef,
  disabled,
  name,
}: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={INPUT_CLASSES}
      />
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="font-medium text-danger-fg">
          {error}
        </p>
      )}
      <button
        type="button"
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "inline-flex min-h-12 items-center gap-2 self-start rounded-control px-2 font-bold",
          "text-primary hover:bg-primary-tint focus-visible:focus-ring",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-5 items-center justify-center rounded border-2 border-primary text-xs",
            visible && "bg-primary text-on-primary",
          )}
        >
          {visible ? "✓" : ""}
        </span>
        {AUTH_COPY.showPassword}
      </button>
    </div>
  );
}
