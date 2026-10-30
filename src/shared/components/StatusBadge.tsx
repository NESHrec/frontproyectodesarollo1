import { cn } from "@/shared/lib/cn";

type StatusBadgeTone = "agua" | "pistacho" | "rosa" | "crema";

const toneClasses: Record<StatusBadgeTone, string> = {
  agua: "bg-[var(--serena-surface-info)]",
  pistacho: "bg-[var(--serena-success-soft)]",
  rosa: "bg-[var(--serena-danger-soft)]",
  crema: "bg-[var(--serena-warning-soft)]",
};

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: StatusBadgeTone;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "agua",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border border-[var(--serena-border)] px-3 py-1 text-xs font-bold text-[var(--serena-ink)] shadow-[0_2px_8px_rgb(51_75_84_/_0.04)]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
