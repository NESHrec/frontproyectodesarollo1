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
      <label className="block text-sm font-semibold text-[#62727B]" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition placeholder:text-[#62727B]/60 focus:border-[#62727B] focus:bg-[#DDF3F1]",
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
        <p className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm text-[#62727B]" id={`${inputId}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
