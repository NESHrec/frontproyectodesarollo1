import { Suspense } from "react";
import { getEspecialidades, getMedicos } from "@/modules/catalogo-medico/api";
import { MedicosFilter } from "@/modules/catalogo-medico/components/MedicosFilter";
import { ApiErrorState, LoadingState, PageHeader } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function MedicosPage({ searchParams }: { searchParams: PageSearchParams }) {
  const specialtyId = firstSearchParam((await searchParams).specialtyId);

  return (
    <>
      <PageHeader
        description="Encuentra médicos y odontólogos de Clínica Serena. Filtra por especialidad o busca por nombre."
        eyebrow="Profesionales"
        title="Listado de médicos"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<LoadingState message="Cargando profesionales..." />}>
            <MedicosCatalogo specialtyId={specialtyId} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function MedicosCatalogo({ specialtyId }: { specialtyId?: string }) {
  const [especialidades, medicos] = await Promise.all([
    getEspecialidades(),
    getMedicos(specialtyId),
  ]);

  if (!especialidades.ok || !medicos.ok) {
    return <ApiErrorState title="No pudimos cargar los profesionales" />;
  }

  return (
    <MedicosFilter
      especialidadId={specialtyId ?? ""}
      especialidades={especialidades.data}
      medicos={medicos.data}
    />
  );
}
