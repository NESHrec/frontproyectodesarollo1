import Link from "next/link";
import { notFound } from "next/navigation";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { PatientRecordSummaryCard } from "@/modules/atencion-medica/components/PatientRecordSummaryCard";
import { formatDateTime } from "@/modules/atencion-medica/format";
import { getRecordForAppointment } from "@/modules/atencion-medica/server";
import { Card, EmptyState, InternalPageHeader, buttonLinkClasses } from "@/shared/components";
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
      <PatientRecordSummaryCard
        patientName={patient.fullName}
        registeredAt={patient.registeredAt}
        status={patient.status}
        recordId={recordId}
        recordCreatedAt={recordCreatedAt}
        attentionCount={attentions.length}
        appointmentHref={appointmentHref}
      />
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
