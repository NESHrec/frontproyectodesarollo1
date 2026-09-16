import { Card } from "@/shared/components/Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center">
      <h2 className="text-xl font-semibold text-[#62727B]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#62727B]/80">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
