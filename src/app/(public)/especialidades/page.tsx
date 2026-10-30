import { Suspense } from "react";
import Link from "next/link";
import { getEspecialidades } from "@/modules/catalogo-medico/api";
import {
  ApiErrorState,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
  buttonLinkClasses,
} from "@/shared/components";

export default function EspecialidadesPage() {
  return (
    <>
      <PageHeader
        description="Servicios médicos y odontológicos disponibles en Clínica Serena. Selecciona una especialidad para conocer a sus profesionales."
        eyebrow="Catálogo"
        title="Especialidades médicas y odontológicas"
      />
      <section className="serena-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<LoadingState message="Cargando especialidades..." />}>
            <EspecialidadesListado />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function EspecialidadesListado() {
  const result = await getEspecialidades();

  if (!result.ok) {
    return <ApiErrorState title="No pudimos cargar las especialidades" />;
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        description="Todavía no hay especialidades publicadas. Vuelve a consultar más tarde."
        title="Sin especialidades disponibles"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="serena-catalog-heading">
        <div><p className="serena-kicker">Encuentra tu atención</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--serena-ink)]">Explora por especialidad</h2></div>
        <StatusBadge tone="agua">{result.data.length} {result.data.length === 1 ? "especialidad" : "especialidades"}</StatusBadge>
      </div>
      <div className="serena-stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {result.data.map((especialidad, index) => (
          <Card className="serena-specialty-card group relative flex flex-col overflow-hidden border-[var(--serena-border)] transition-[transform,box-shadow,border-color] duration-200 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[var(--serena-teal)] hover:-translate-y-1 hover:border-[var(--serena-border-strong)] hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none" key={especialidad.id}>
            <div className="flex items-start justify-between gap-3">
              <StatusBadge className="self-start" tone="agua">Atención especializada</StatusBadge>
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--serena-surface-info)] text-sm font-black text-[var(--serena-teal)]">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h2 className="mt-5 text-xl font-black leading-tight text-[var(--serena-ink)]">{especialidad.name}</h2>
            {especialidad.description ? (
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--serena-text)]/85">{especialidad.description}</p>
            ) : <p className="mt-3 flex-1 text-sm leading-6 text-[var(--serena-text)]/75">Conoce a los profesionales disponibles para esta área de atención.</p>}
            <Link className={`${buttonLinkClasses} mt-6 w-full justify-between group-hover:shadow-[0_12px_26px_rgb(51_75_84_/_0.16)]`} href={`/medicos?${new URLSearchParams({ specialtyId: especialidad.id })}`}>
              Ver profesionales <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
