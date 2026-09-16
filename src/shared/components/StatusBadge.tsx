import { cn } from "@/shared/lib/cn";

type StatusBadgeTone = "agua" | "pistacho" | "rosa" | "crema";

const toneClasses: Record<StatusBadgeTone, string> = {
  agua: "bg-[#DDF3F1]",
  pistacho: "bg-[#E5F1D8]",
  rosa: "bg-[#F8E2E8]",
  crema: "bg-[#F8EDD2]",
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
        "inline-flex rounded-full border border-[#62727B]/15 px-3 py-1 text-xs font-semibold text-[#62727B]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
