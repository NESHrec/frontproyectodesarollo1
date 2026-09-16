import { especialidades, medicos } from "@/modules/catalogo-medico/data";
import { MedicosFilter } from "@/modules/catalogo-medico/components/MedicosFilter";
import { PageHeader } from "@/shared/components";

export default function MedicosPage() {
  return (
    <>
      <PageHeader
        description="Filtra el listado de profesionales ficticios por especialidad o búsqueda de texto."
        eyebrow="Profesionales"
        title="Listado de médicos"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <MedicosFilter especialidades={especialidades} medicos={medicos} />
        </div>
      </section>
    </>
  );
}
