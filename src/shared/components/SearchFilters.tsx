import type { ReactNode } from "react";

type SearchFiltersProps = {
  title?: string;
  children: ReactNode;
  contentClassName?: string;
};

export function SearchFilters({ title = "Filtros de búsqueda", children, contentClassName }: SearchFiltersProps) {
  return (
    <section aria-label={title} className="rounded-[var(--serena-radius-lg)] border border-[var(--serena-border)] bg-white/75 p-5 shadow-[var(--serena-shadow-card)] backdrop-blur-sm">
      <p className="serena-section-label mb-4">{title}</p>
      <div className={contentClassName ?? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"}>{children}</div>
    </section>
  );
}
