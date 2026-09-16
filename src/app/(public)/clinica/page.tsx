import { clinicaInfo } from "@/modules/catalogo-medico/data";
import { Card, PageHeader, StatusBadge } from "@/shared/components";

export default function ClinicaPage() {
  return (
    <>
      <PageHeader
        description="Información institucional simulada para presentar la experiencia pública de Clínica Serena."
        eyebrow="Nuestra clínica"
        title="Un entorno digital sereno para atención en salud"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="bg-[#F8EDD2]">
            <StatusBadge tone="agua">Información general</StatusBadge>
            <h2 className="mt-5 text-2xl font-bold text-[#62727B]">{clinicaInfo.nombre}</h2>
            <p className="mt-4 leading-7 text-[#62727B]/85">{clinicaInfo.descripcion}</p>
            <p className="mt-6 text-sm font-semibold text-[#62727B]">{clinicaInfo.direccion}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-[#62727B]">Horarios de atención</h2>
            <ul className="mt-5 space-y-3 text-sm text-[#62727B]">
              {clinicaInfo.horarios.map((horario) => (
                <li className="rounded-md bg-[#E5F1D8] px-4 py-3" key={horario}>
                  {horario}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-md bg-[#DDF3F1] p-4 text-sm text-[#62727B]">
              <p>{clinicaInfo.telefono}</p>
              <p>{clinicaInfo.correo}</p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
