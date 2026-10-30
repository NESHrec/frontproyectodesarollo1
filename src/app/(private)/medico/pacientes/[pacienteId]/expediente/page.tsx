import Link from "next/link";
import { notFound } from "next/navigation";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { formatDateTime } from "@/modules/atencion-medica/format";
import { getRecordForAppointment } from "@/modules/atencion-medica/server";
import { Card, EmptyState, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";
import { ClinicalProfileForm } from "@/modules/expedientes/components/ClinicalProfileForm";

/**
 * El expediente solo se abre a través de una cita propia (`?cita=`): el backend
 * resuelve el paciente desde esa cita. El identificador de la ruta únicamente
 * debe coincidir con el paciente devuelto; nunca se envía al backend.
 */
export default async function PatientRecordPage({ params, searchParams }: {
  params: Promise<{ pacienteId: string }>;
  searchParams: PageSearchParams;
}) {
  const { pacienteId } = await params;
  const citaId = firstSearchParam((await searchParams).cita);
  const header = (title: string) => <InternalPageHeader description="Expediente básico e historial de atenciones persistidos, visibles solo para el profesional de la cita." eyebrow="Expediente clínico" title={title} />;

  if (!citaId) {
    return <div className="space-y-7">{header("Expediente")}<EmptyState action={<Link className={buttonLinkClasses} href="/medico/agenda">Ir a mi agenda</Link>} description="Abre el expediente desde una cita de tu agenda para consultar la información del paciente." title="Selecciona una cita" /></div>;
  }
  const result = await getRecordForAppointment(citaId);
  if (!result.ok) return <div className="space-y-7">{header("Expediente")}<MedicalFailureNotice reason={result.reason} /></div>;
  if (result.data.patient.id !== pacienteId) notFound();

  const { patient, recordId, recordCreatedAt, clinicalProfile, clinicalProfileHistory, attentions } = result.data;
  const appointmentHref = `/medico/citas/${encodeURIComponent(citaId)}`;
  return (
    <div className="space-y-8">
      {header(patient.fullName ?? "Paciente sin nombre registrado")}
      <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-[#334B54] text-white shadow-[0_28px_75px_-42px_rgba(38,50,56,0.82)] before:pointer-events-none before:absolute before:-right-12 before:-top-24 before:size-64 before:rounded-full before:bg-[#DDF3F1]/10 before:blur-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DDF3F1]/70">Paciente</p>
            <h2 className="mt-2 text-2xl font-black text-white">{patient.fullName ?? "Sin nombre registrado"}</h2>
            <p className="mt-1 text-sm text-white/65">Registrado {formatDateTime(patient.registeredAt)}</p>
          </div>
          <StatusBadge tone={patient.status === "ACTIVO" ? "pistacho" : "rosa"}>{patient.status === "ACTIVO" ? "Activo" : "Inactivo"}</StatusBadge>
        </div>
        <dl className="relative mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-white/60">Expediente</dt><dd className="mt-1 font-semibold">{recordId ? `Abierto ${formatDateTime(recordCreatedAt)}` : "Se abrirá con la primera atención"}</dd></div>
          <div className="rounded-xl bg-white/5 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-white/60">Atenciones</dt><dd className="mt-1 text-2xl font-black">{attentions.length}</dd></div>
        </dl>
        <Link className="mt-5 inline-flex text-sm font-bold text-[#DDF3F1] underline-offset-4 hover:underline" href={appointmentHref}>Volver a la cita</Link>
      </Card>
      <Card className="rounded-[1.75rem] border-[#62727B]/12 shadow-[0_20px_55px_-44px_rgba(38,50,56,.65)]"><div className="border-b border-[#62727B]/12 pb-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Perfil longitudinal</p><h2 className="mt-1 text-xl font-black text-[#334B54]">Información clínica declarada</h2></div><div className="mt-5"><ClinicalProfileForm appointmentId={citaId} initial={clinicalProfile}/></div>{clinicalProfileHistory.length>0?<details className="group mt-6 rounded-2xl border border-[#62727B]/12 bg-[#FBFCFA] p-4"><summary className="cursor-pointer font-bold text-[#334B54] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#56777A]">Historial de versiones ({clinicalProfileHistory.length})</summary><ol className="mt-4 space-y-3">{clinicalProfileHistory.map(version=><li className="rounded-xl border border-[#62727B]/10 bg-white p-4 text-sm leading-6" key={version.id}><p className="font-bold text-[#334B54]">{formatDateTime(version.recordedAt)} · {version.authorName??version.authorAccountId}</p><p className="mt-2"><strong>Alergias:</strong> {version.allergies??"No indicado"}</p><p><strong>Condiciones:</strong> {version.relevantConditions??"No indicado"}</p><p><strong>Medicamentos:</strong> {version.currentMedications??"No indicado"}</p><p><strong>Antecedentes odontológicos:</strong> {version.dentalHistory??"No indicado"}</p></li>)}</ol></details>:<p className="mt-4 rounded-xl bg-[#F8EDD2]/60 p-4 text-sm text-[#62727B]">Aún no se ha registrado información clínica explícita.</p>}</Card>
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Cronología clínica</p><h2 className="mt-1 text-2xl font-black text-[#263238]">Historial de atenciones</h2>
        {attentions.length === 0
          ? <div className="mt-5"><EmptyState description="Este paciente aún no tiene atenciones documentadas." title="Sin atenciones" /></div>
          : <ol className="mt-5 space-y-5 border-l-2 border-[#DDF3F1] pl-4 sm:pl-6">{attentions.map((attention) => <li className="relative before:absolute before:-left-[1.35rem] before:mt-7 before:size-3 before:rounded-full before:border-2 before:border-white before:bg-[#56777A] sm:before:-left-[1.85rem]" key={attention.id}><AttentionCard attention={attention} /></li>)}</ol>}
      </section>
    </div>
  );
}
