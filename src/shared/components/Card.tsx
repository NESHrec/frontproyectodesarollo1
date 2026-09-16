import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-6 shadow-sm shadow-[#62727B]/10",
        className,
      )}
      {...props}
    />
  );
}
