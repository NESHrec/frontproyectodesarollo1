import type { ReactNode } from "react";
import { InternalPageHeader } from "@/shared/components";

export function PatientPortalHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <InternalPageHeader
      actions={actions}
      description={description}
      eyebrow={`Demostración · ${eyebrow}`}
      title={title}
    />
  );
}

export function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-xl font-bold text-[#62727B]">{title}</h2>;
}
