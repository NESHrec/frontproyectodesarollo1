import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "cream" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-[#56777A] text-white shadow-[var(--serena-shadow-soft)] hover:bg-[#334B54]",
  secondary: "bg-[#E5F1D8] text-[#334B54] hover:bg-[#DDF3F1]",
  accent: "border-transparent bg-[#8D4154] text-white shadow-[var(--serena-shadow-soft)] hover:bg-[#6f3041]",
  cream: "bg-[#F8EDD2] text-[#334B54] hover:bg-[#F8E2E8]",
  ghost: "bg-transparent text-[#334B54] hover:bg-[#DDF3F1]",
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
        "serena-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] px-5 py-2 text-sm font-bold transition hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:translate-none",
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
  "serena-action inline-flex min-h-11 items-center justify-center rounded-[var(--serena-radius-sm)] border border-transparent bg-[var(--serena-teal)] px-5 py-2 text-sm font-bold text-white shadow-[var(--serena-shadow-soft)] transition hover:-translate-y-px hover:bg-[var(--serena-ink)] active:translate-y-0 motion-reduce:transform-none motion-reduce:translate-none";
