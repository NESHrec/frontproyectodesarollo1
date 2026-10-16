import Link from "next/link";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { appointmentStatusLabel, appointmentStatusTone, attentionBlockerMessage, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { getOwnAppointment } from "@/modules/atencion-medica/server";
import { Card, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";

export default async function DoctorAppointmentPage({ params }: { params: Promise<{ citaId: string }> }) {
  const { citaId } = await params;
  const result = await getOwnAppointment(citaId);
  if (!result.ok) return <div className="space-y-7"><InternalPageHeader description="Detalle de una cita asignada a tu agenda." eyebrow="Atención clínica" title="Cita" /><MedicalFailureNotice reason={result.reason} /></div>;

  const { appointment, attention } = result.data;
  const recordHref = `/medico/pacientes/${encodeURIComponent(appointment.patientId)}/expediente?cita=${encodeURIComponent(appointment.id)}`;
  return (
    <div className="space-y-8">
      <InternalPageHeader description="Contexto persistido de la cita y acceso a sus herramientas clínicas." eyebrow="Atención clínica" title={patientLabel(appointment)} />
      <section className="overflow-hidden rounded-[1.75rem] border border-[#62727B]/15 bg-white shadow-[0_24px_65px_-44px_rgba(38,50,56,0.65)]">
        <div className="grid gap-6 bg-[#334B54] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DDF3F1]/70">{appointment.specialtyName}</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{formatDateTime(appointment.scheduledAt)}</h2><div className="mt-4"><StatusBadge tone={appointmentStatusTone(appointment.status)}>{appointmentStatusLabel[appointment.status]}</StatusBadge></div></div>
          {appointment.canRecordAttention ? <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#DDF3F1] px-6 text-sm font-black text-[#334B54] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none" href={`/medico/consultas/nueva?cita=${encodeURIComponent(appointment.id)}`}>Registrar atención</Link> : null}
        </div>
        <dl className="grid divide-y divide-[#62727B]/12 p-6 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:p-8">
          <div className="py-3 sm:px-5 sm:py-0 sm:first:pl-0"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/65">Llegada</dt><dd className="mt-2 font-semibold text-[#263238]">{appointment.arrivalAt ? formatDateTime(appointment.arrivalAt) : "Pendiente"}</dd></div>
          <div className="py-3 sm:px-5 sm:py-0"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/65">Atención</dt><dd className="mt-2 font-semibold text-[#263238]">{appointment.attentionRecorded ? "Documentada" : appointment.canRecordAttention ? "Lista para documentar" : "Aún no disponible"}</dd></div>
          <div className="py-3 sm:px-5 sm:py-0"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/65">Notas</dt><dd className="mt-2 whitespace-pre-line text-[#263238]">{appointment.notes ?? "Sin notas"}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-3 border-t border-[#62727B]/12 px-6 py-5 sm:px-8"><Link className={buttonLinkClasses} href={recordHref}>Consultar expediente</Link><Link className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-[#56777A] hover:bg-[#DDF3F1]/50" href={`/medico/odontograma/${encodeURIComponent(appointment.patientId)}?cita=${encodeURIComponent(appointment.id)}`}>Abrir odontograma</Link></div>
      </section>
      {!appointment.attentionRecorded && appointment.attentionBlockers.length > 0 ? <Card className="border-l-4 border-l-[#F8EDD2]"><p className="font-bold text-[#334B54]">La atención todavía no está disponible</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm" role="status">{appointment.attentionBlockers.map((blocker) => <li key={blocker}>{attentionBlockerMessage[blocker]}</li>)}</ul></Card> : null}
      {attention ? <section className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Registro clínico</p><h2 className="mt-1 text-2xl font-black text-[#263238]">Atención registrada</h2></div><AttentionCard attention={attention} /></section> : null}
    </div>
  );
}
