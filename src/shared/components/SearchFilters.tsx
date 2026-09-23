import type { ReactNode } from "react";

type SearchFiltersProps = {
  title?: string;
  children: ReactNode;
};

export function SearchFilters({ title = "Filtros de búsqueda", children }: SearchFiltersProps) {
  return (
    <section aria-label={title} className="rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-[#62727B]">{title}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}
