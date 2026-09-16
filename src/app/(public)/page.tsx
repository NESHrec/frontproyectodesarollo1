import Link from "next/link";
import { clinicaInfo, especialidades, medicos } from "@/modules/catalogo-medico/data";
import { Card, PageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";

export default function HomePage() {
  const especialidadesMedicas = especialidades.filter(
    (especialidad) => especialidad.categoria === "medica",
  ).length;
  const especialidadesOdontologicas = especialidades.length - especialidadesMedicas;

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
              Consulta información general, revisa especialidades, encuentra médicos
              disponibles y recorre un flujo visual de pre-agendamiento sin guardar datos reales.
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
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card>
              <p className="text-3xl font-bold text-[#62727B]">{medicos.length}</p>
              <p className="mt-2 text-sm text-[#62727B]/80">Profesionales simulados</p>
            </Card>
            <Card>
              <p className="text-3xl font-bold text-[#62727B]">{especialidadesMedicas}</p>
              <p className="mt-2 text-sm text-[#62727B]/80">Especialidades médicas</p>
            </Card>
            <Card>
              <p className="text-3xl font-bold text-[#62727B]">{especialidadesOdontologicas}</p>
              <p className="mt-2 text-sm text-[#62727B]/80">Especialidades odontológicas</p>
            </Card>
          </div>
        </div>
      </section>
      <section className="bg-[#DDF3F1] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            "Información clara de clínica y servicios",
            "Búsqueda de médicos por especialidad",
            "Horarios simulados para pre-agendamiento",
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
