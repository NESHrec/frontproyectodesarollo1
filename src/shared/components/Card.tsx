import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "serena-card min-w-0 max-w-full border border-[var(--serena-border)] bg-[var(--serena-surface)] p-6 shadow-[var(--serena-shadow-card)] transition-shadow duration-200 hover:shadow-[0_22px_58px_rgb(51_75_84_/_0.12)]",
        className,
      )}
      {...props}
    />
  );
}
