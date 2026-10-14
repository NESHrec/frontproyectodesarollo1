import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "cream" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#DDF3F1] text-[#62727B] hover:bg-[#E5F1D8]",
  secondary: "bg-[#E5F1D8] text-[#62727B] hover:bg-[#DDF3F1]",
  accent: "bg-[#F8E2E8] text-[#62727B] hover:bg-[#F8EDD2]",
  cream: "bg-[#F8EDD2] text-[#62727B] hover:bg-[#F8E2E8]",
  ghost: "bg-[#FBFCFA] text-[#62727B] hover:bg-[#DDF3F1]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] px-5 py-2 text-sm font-semibold text-[var(--serena-text)] transition hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none",
        variantClasses[variant],
        className,
      )}
      aria-busy={loading || undefined}
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" /> : null}
      {children}
    </button>
  );
}

export const buttonLinkClasses =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--serena-surface-info)] px-5 py-2 text-sm font-semibold text-[var(--serena-text)] transition hover:-translate-y-px hover:bg-[var(--serena-success-soft)] active:translate-y-0 motion-reduce:transform-none";
