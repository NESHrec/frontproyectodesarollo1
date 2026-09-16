import { especialidades } from "@/modules/catalogo-medico/data";
import { Card, PageHeader, StatusBadge } from "@/shared/components";

export default function EspecialidadesPage() {
  return (
    <>
      <PageHeader
        description="Catálogo ficticio de servicios médicos y odontológicos disponibles para consulta pública."
        eyebrow="Catálogo"
        title="Especialidades médicas y odontológicas"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {especialidades.map((especialidad) => (
            <Card key={especialidad.id}>
              <StatusBadge tone={especialidad.categoria === "medica" ? "agua" : "rosa"}>
                {especialidad.categoria === "medica" ? "Médica" : "Odontológica"}
              </StatusBadge>
              <h2 className="mt-4 text-xl font-bold text-[#62727B]">{especialidad.nombre}</h2>
              <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
                {especialidad.descripcion}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
