import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMedicoPorId } from "@/modules/catalogo-medico/api";
import { HorariosDisponibles } from "@/modules/catalogo-medico/components/HorariosDisponibles";
import {
  ApiErrorState,
  Card,
  LoadingState,
  PageHeader,
  StatusBadge,
  buttonLinkClasses,
} from "@/shared/components";

export default async function MedicoDetailPage({
  params,
}: {
  params: Promise<{ medicoId: string }>;
}) {
  const { medicoId } = await params;
  const result = await getMedicoPorId(medicoId);

  if (!result.ok) {
    return (
      <>
        <PageHeader
          description="Información pública y horarios disponibles del profesional."
          eyebrow="Profesionales"
          title="Perfil del profesional"
        />
        <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ApiErrorState title="No pudimos cargar el perfil" />
          </div>
        </section>
      </>
    );
  }

  const medico = result.data;

  if (!medico) {
    notFound();
  }

  return (
    <>
      <PageHeader
        description="Consulta la información pública del profesional y sus horarios disponibles en Clínica Serena."
        eyebrow={medico.specialtyName ?? "Profesionales"}
        title={medico.fullName}
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="self-start bg-[#F8EDD2]">
            {medico.specialtyName ? (
              <StatusBadge tone="pistacho">{medico.specialtyName}</StatusBadge>
            ) : null}
            <dl className="mt-6 space-y-4 text-sm text-[#62727B]">
              <div>
                <dt className="font-semibold">Nombre</dt>
                <dd className="mt-1">{medico.fullName}</dd>
              </div>
              {medico.specialtyName ? (
                <div>
                  <dt className="font-semibold">Especialidad</dt>
                  <dd className="mt-1">{medico.specialtyName}</dd>
                </div>
              ) : null}
              {medico.licenseNumber ? (
                <div>
                  <dt className="font-semibold">Número de colegiado</dt>
                  <dd className="mt-1">{medico.licenseNumber}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className={buttonLinkClasses}
                href={`/reservar?${new URLSearchParams({ medicoId: medico.id })}`}
              >
                Iniciar pre-agendamiento
              </Link>
              <Link className={buttonLinkClasses} href="/medicos">
                Volver al listado
              </Link>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-[#62727B]">Horarios disponibles</h2>
            <p className="mt-2 mb-5 text-sm text-[#62727B]/80">Hora de Guatemala.</p>
            <Suspense fallback={<LoadingState message="Consultando horarios..." />}>
              <HorariosDisponibles medicoId={medico.id} />
            </Suspense>
          </Card>
        </div>
      </section>
    </>
  );
}
