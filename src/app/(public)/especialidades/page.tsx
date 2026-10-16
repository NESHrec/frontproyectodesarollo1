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
    <div className="serena-stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {result.data.map((especialidad) => (
        <Card className="group relative flex flex-col overflow-hidden border-[var(--serena-border)] transition-[transform,box-shadow,border-color] duration-200 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[var(--serena-teal)] hover:-translate-y-1 hover:border-[var(--serena-border-strong)] hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none" key={especialidad.id}>
          <StatusBadge className="self-start" tone="agua">
            Especialidad
          </StatusBadge>
          <h2 className="mt-4 text-xl font-bold text-[#62727B]">{especialidad.name}</h2>
          {especialidad.description ? (
            <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
              {especialidad.description}
            </p>
          ) : null}
          <Link
            className={`${buttonLinkClasses} mt-6 self-start`}
            href={`/medicos?${new URLSearchParams({ specialtyId: especialidad.id })}`}
          >
            Ver profesionales
          </Link>
        </Card>
      ))}
    </div>
  );
}
