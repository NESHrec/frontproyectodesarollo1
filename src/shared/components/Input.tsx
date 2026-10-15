import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Input({
  id,
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const describedBy = error
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#526871]" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-11 w-full rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-white/80 px-4 py-3 text-sm text-[var(--serena-text)] outline-none transition placeholder:text-[var(--serena-text)]/55 focus:border-[var(--serena-focus)] focus:bg-[var(--serena-surface-info)] focus:shadow-[0_0_0_4px_rgb(86_119_122_/_0.12)]",
          error ? "border-[var(--serena-danger)] bg-[var(--serena-danger-soft)]/30" : null,
          className,
        )}
        id={inputId}
        {...props}
      />
      {helperText && !error ? (
        <p className="text-xs text-[#62727B]/80" id={`${inputId}-helper`}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm text-[#62727B]" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
