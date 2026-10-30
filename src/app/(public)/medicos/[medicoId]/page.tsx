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
import { PractitionerPortrait } from "@/modules/catalogo-medico/components/PractitionerPortrait";

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
      <section className="serena-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="relative self-start overflow-hidden border-[var(--serena-border)] bg-[linear-gradient(145deg,#fff,var(--serena-warning-soft))] p-5 sm:p-7 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[var(--serena-teal)] before:to-[#DDF3F1]">
            <PractitionerPortrait large practitioner={medico} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {medico.specialtyName ? <StatusBadge tone="pistacho">{medico.specialtyName}</StatusBadge> : <StatusBadge tone="agua">Profesional de Serena</StatusBadge>}
              <span className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--serena-teal)]">Perfil público</span>
            </div>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[var(--serena-ink)]">{medico.fullName}</h2>
            <dl className="mt-6 grid gap-3 text-sm text-[var(--serena-text)] sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[.1em] text-[var(--serena-teal)]">Área de atención</dt>
                <dd className="mt-1 font-semibold text-[var(--serena-ink)]">{medico.specialtyName ?? "Clínica Serena"}</dd>
              </div>
              {medico.licenseNumber ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[.1em] text-[var(--serena-teal)]">Número de colegiado</dt>
                  <dd className="mt-1 font-semibold text-[var(--serena-ink)]">{medico.licenseNumber}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-7 grid gap-3">
              <Link
                className={`${buttonLinkClasses} w-full justify-between !rounded-full !px-6`}
                href={`/reservar?${new URLSearchParams({ medicoId: medico.id })}`}
              >
                Consultar horarios <span aria-hidden="true">→</span>
              </Link>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold text-[var(--serena-ink)] transition hover:bg-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--serena-focus)]" href="/medicos">
                Volver a profesionales
              </Link>
            </div>
          </Card>
          <Card className="self-start border-[var(--serena-border)] p-5 sm:p-7">
            <div className="serena-catalog-heading !items-center">
              <div><p className="serena-kicker">Disponibilidad</p><h2 className="mt-2 text-2xl font-black text-[var(--serena-ink)]">Horarios disponibles</h2></div>
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-[var(--serena-success-soft)] text-xl text-[var(--serena-teal)]">◷</span>
            </div>
            <p className="mb-5 mt-4 text-sm text-[var(--serena-text)]/80">Horarios mostrados en hora de Guatemala.</p>
            <Suspense fallback={<LoadingState message="Consultando horarios..." />}>
              <HorariosDisponibles medicoId={medico.id} />
            </Suspense>
          </Card>
        </div>
      </section>
    </>
  );
}
