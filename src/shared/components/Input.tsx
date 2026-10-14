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
          "w-full rounded-md border border-[#62727B]/30 bg-[#FBFCFA] px-4 py-3 text-sm text-[#334B54] outline-none transition duration-200 placeholder:text-[#62727B]/65 focus:border-[#8D4154] focus:bg-white focus:ring-2 focus:ring-[#F8E2E8] disabled:cursor-not-allowed disabled:bg-[#62727B]/5 disabled:opacity-70",
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
