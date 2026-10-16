import Link from "next/link";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { appointmentStatusLabel, attentionBlockerMessage, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { getOwnAppointment } from "@/modules/atencion-medica/server";
import { ConsultationForm } from "@/modules/expedientes/components/ConsultationForm";
import { EmptyState, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function NewConsultationPage({ searchParams }: { searchParams: PageSearchParams }) {
  const citaId = firstSearchParam((await searchParams).cita);
  const header = <InternalPageHeader description="Documenta motivo, diagnóstico y receta de una cita propia. El registro guardado no se sobrescribe." eyebrow="Atención clínica" title="Registrar atención" />;
  if (!citaId) return <div className="space-y-7">{header}<EmptyState action={<Link className={buttonLinkClasses} href="/medico/agenda">Ir a mi agenda</Link>} description="Cada atención se registra sobre una cita asignada a tu agenda." title="Selecciona una cita" /></div>;
  const result = await getOwnAppointment(citaId);
  if (!result.ok) return <div className="space-y-7">{header}<MedicalFailureNotice reason={result.reason} /></div>;

  const { appointment, attention } = result.data;
  const patient = patientLabel(appointment);
  return (
    <div className="space-y-7">
      {header}
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#62727B]/15 bg-white shadow-[0_28px_75px_-48px_rgba(38,50,56,0.72)]">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#334B54] px-6 py-5 text-white sm:px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DDF3F1]/70">Paciente y cita</p><h2 className="mt-1 text-xl font-black">{patient}</h2><p className="mt-1 text-sm text-white/70">{appointment.specialtyName} · {formatDateTime(appointment.scheduledAt)}</p></div>
          <StatusBadge tone={attention ? "pistacho" : "agua"}>{attention ? "Documentada" : appointmentStatusLabel[appointment.status]}</StatusBadge>
        </div>
        <div className="bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] p-5 sm:p-8">
          {attention ? <div className="space-y-4"><p className="rounded-xl bg-[#E5F1D8] px-4 py-3 text-sm font-semibold" role="status">Atención guardada. Este es el registro persistido.</p><AttentionCard attention={attention} /><Link className={buttonLinkClasses} href={`/medico/pacientes/${encodeURIComponent(appointment.patientId)}/expediente?cita=${encodeURIComponent(appointment.id)}`}>Ver expediente</Link></div>
          : appointment.canRecordAttention ? <ConsultationForm appointmentId={appointment.id} patientName={patient} />
          : <div className="space-y-3 rounded-xl bg-[#F8E2E8] px-4 py-4 text-sm" role="alert"><p className="font-bold">Aún no puedes registrar la atención:</p><ul className="list-disc space-y-1 pl-5">{appointment.attentionBlockers.map((blocker) => <li key={blocker}>{attentionBlockerMessage[blocker]}</li>)}</ul><p>El servidor vuelve a validar estas reglas al guardar.</p><Link className="font-bold underline-offset-4 hover:underline" href={`/medico/citas/${encodeURIComponent(appointment.id)}`}>Volver a la cita</Link></div>}
        </div>
      </section>
    </div>
  );
}
