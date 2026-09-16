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
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md border border-[#62727B]/20 px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export const buttonLinkClasses =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[#62727B]/20 bg-[#DDF3F1] px-5 py-2 text-sm font-semibold text-[#62727B] transition hover:bg-[#E5F1D8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]";
