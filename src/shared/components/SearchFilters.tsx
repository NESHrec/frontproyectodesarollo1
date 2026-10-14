import type { ReactNode } from "react";

type SearchFiltersProps = {
  title?: string;
  children: ReactNode;
};

export function SearchFilters({ title = "Filtros de búsqueda", children }: SearchFiltersProps) {
  return (
    <section aria-label={title} className="rounded-[var(--serena-radius-md)] border border-[var(--serena-border)] bg-[var(--serena-surface)] p-4 shadow-[var(--serena-shadow-card)]">
      <p className="mb-3 text-sm font-bold text-[var(--serena-text)]">{title}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}
