import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHorariosByMedicoId,
  getMedicoById,
  medicos,
} from "@/modules/catalogo-medico/data";
import { Card, PageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";

export function generateStaticParams() {
  return medicos.map((medico) => ({ medicoId: medico.id }));
}

export default async function MedicoDetailPage({
  params,
}: {
  params: Promise<{ medicoId: string }>;
}) {
  const { medicoId } = await params;
  const medico = getMedicoById(medicoId);

  if (!medico) {
    notFound();
  }

  const horarios = getHorariosByMedicoId(medico.id);

  return (
    <>
      <PageHeader
        description={medico.biografia}
        eyebrow={medico.especialidad}
        title={medico.nombre}
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="bg-[#F8EDD2]">
            <StatusBadge tone="pistacho">{medico.enfoque}</StatusBadge>
            <dl className="mt-6 space-y-4 text-sm text-[#62727B]">
              <div>
                <dt className="font-semibold">Experiencia</dt>
                <dd className="mt-1">{medico.experiencia}</dd>
              </div>
              <div>
                <dt className="font-semibold">Ubicación</dt>
                <dd className="mt-1">{medico.ubicacion}</dd>
              </div>
              <div>
                <dt className="font-semibold">Disponibilidad general</dt>
                <dd className="mt-1">{medico.disponibilidad}</dd>
              </div>
            </dl>
            <Link className={`${buttonLinkClasses} mt-6`} href="/reservar">
              Iniciar pre-agendamiento
            </Link>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-[#62727B]">Horarios disponibles simulados</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {horarios.flatMap((horario) =>
                horario.bloques.map((bloque) => (
                  <div className="rounded-md bg-[#DDF3F1] p-4 text-[#62727B]" key={`${horario.fecha}-${bloque}`}>
                    <p className="text-sm font-semibold">{horario.fecha}</p>
                    <p className="mt-2 text-2xl font-bold">{bloque}</p>
                  </div>
                )),
              )}
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
