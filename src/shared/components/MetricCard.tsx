import { Card } from "@/shared/components/Card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "agua" | "pistacho" | "rosa" | "crema";
};

const toneClasses = {
  agua: "bg-[var(--serena-surface-info)]",
  pistacho: "bg-[var(--serena-success-soft)]",
  rosa: "bg-[var(--serena-danger-soft)]",
  crema: "bg-[var(--serena-warning-soft)]",
};

export function MetricCard({ label, value, detail, tone = "agua" }: MetricCardProps) {
  return (
    <Card className={toneClasses[tone]}>
      <p className="text-sm font-semibold text-[#62727B]/80">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[#62727B]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#62727B]/75">{detail}</p>
    </Card>
  );
}
