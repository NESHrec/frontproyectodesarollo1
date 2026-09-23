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
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-11 w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition focus:border-[#62727B] focus:bg-[#DDF3F1]",
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
          "w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition placeholder:text-[#62727B]/60 focus:border-[#62727B] focus:bg-[#DDF3F1]",
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
