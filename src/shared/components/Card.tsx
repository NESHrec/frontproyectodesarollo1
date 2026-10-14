import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full rounded-[var(--serena-radius-md)] border border-[var(--serena-border)] bg-[var(--serena-surface)] p-6 shadow-[var(--serena-shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
