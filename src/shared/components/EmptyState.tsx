import { Card } from "@/shared/components/Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="serena-state text-center">
      <span aria-hidden="true" className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[var(--serena-surface-info)] text-lg font-black text-[var(--serena-teal)]">—</span>
      <h2 className="text-xl font-black text-[var(--serena-ink)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#62727B]/80">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
