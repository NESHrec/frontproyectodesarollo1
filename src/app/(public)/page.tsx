import { Suspense } from "react";
import Link from "next/link";
import { clinicaInfo } from "@/modules/catalogo-medico/data";
import { getEspecialidades, getMedicos } from "@/modules/catalogo-medico/api";
import {
  ApiErrorState,
  Card,
  LoadingState,
  PageHeader,
  StatusBadge,
  buttonLinkClasses,
} from "@/shared/components";

export default function HomePage() {
  return (
    <>
      <PageHeader
        description={clinicaInfo.descripcion}
        eyebrow="Jardín Sereno"
        title={clinicaInfo.nombre}
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-[#F8EDD2]">
            <StatusBadge tone="agua">Proyecto Desarrollo Web</StatusBadge>
            <h2 className="mt-5 text-2xl font-bold text-[#62727B]">{clinicaInfo.lema}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#62727B]/85">
              Consulta información general, revisa especialidades, encuentra médicos y
              revisa sus horarios disponibles. El envío de solicitudes de cita se habilitará
              en una próxima fase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={buttonLinkClasses} href="/medicos">
                Ver médicos
              </Link>
              <Link className={buttonLinkClasses} href="/reservar">
                Pre-agendar cita
              </Link>
            </div>
          </Card>
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Suspense
              fallback={
                <div className="sm:col-span-2 lg:col-span-1">
                  <LoadingState message="Cargando resumen del catálogo..." />
                </div>
              }
            >
              <ResumenCatalogo />
            </Suspense>
          </div>
        </div>
      </section>
      <section className="bg-[#DDF3F1] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            "Información clara de clínica y servicios",
            "Búsqueda de médicos por especialidad",
            "Horarios disponibles consultados en línea",
          ].map((item) => (
            <Card className="bg-[#FBFCFA]" key={item}>
              <StatusBadge tone="pistacho">Disponible</StatusBadge>
              <p className="mt-4 text-lg font-semibold text-[#62727B]">{item}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

async function ResumenCatalogo() {
  const [especialidades, medicos] = await Promise.all([getEspecialidades(), getMedicos()]);

  if (!especialidades.ok || !medicos.ok) {
    return (
      <div className="sm:col-span-2 lg:col-span-1">
        <ApiErrorState
          description="No fue posible obtener el resumen del catálogo en este momento."
          title="Resumen no disponible"
        />
      </div>
    );
  }

  return (
    <>
      <Card>
        <p className="text-3xl font-bold text-[#62727B]">{medicos.data.length}</p>
        <p className="mt-2 text-sm text-[#62727B]/80">Profesionales registrados</p>
      </Card>
      <Card>
        <p className="text-3xl font-bold text-[#62727B]">{especialidades.data.length}</p>
        <p className="mt-2 text-sm text-[#62727B]/80">Especialidades disponibles</p>
      </Card>
    </>
  );
}
