import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type FieldBaseProps = {
  label: string;
  error?: string;
  helperText?: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldBaseProps;

export function SelectField({ label, error, helperText, className, id, ...props }: SelectProps) {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#62727B]" htmlFor={fieldId}>
        {label}
      </label>
      <span className="group relative block">
        <select
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            "serena-field-control min-h-12 w-full appearance-none rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--background)] px-4 py-3 pr-11 text-sm font-medium text-[var(--serena-text)] outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--serena-border-strong)] focus:border-[var(--serena-focus)] focus:bg-[var(--serena-surface-info)] focus:shadow-[0_0_0_3px_rgb(86_119_122_/_0.12)]",
            error ? "border-[var(--serena-danger)] bg-[var(--serena-danger-soft)]/30" : null,
            className,
          )}
          id={fieldId}
          {...props}
        />
        <svg aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[var(--serena-teal)] transition-transform duration-200 group-focus-within:rotate-180 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </span>
      {helperText && !error ? <p className="text-xs text-[#62727B]/80" id={`${fieldId}-helper`}>{helperText}</p> : null}
      {error ? <p className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm" id={`${fieldId}-error`}>{error}</p> : null}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldBaseProps;

export function TextareaField({ label, error, helperText, className, id, ...props }: TextareaProps) {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#62727B]" htmlFor={fieldId}>{label}</label>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          "serena-field-control min-h-24 w-full rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--serena-text)] outline-none transition placeholder:text-[var(--serena-text)]/60 focus:border-[var(--serena-focus)] focus:bg-[var(--serena-surface-info)]",
          error ? "border-[var(--serena-danger)] bg-[var(--serena-danger-soft)]/30" : null,
          className,
        )}
        id={fieldId}
        {...props}
      />
      {helperText && !error ? <p className="text-xs text-[#62727B]/80" id={`${fieldId}-helper`}>{helperText}</p> : null}
      {error ? <p className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm" id={`${fieldId}-error`}>{error}</p> : null}
    </div>
  );
}
