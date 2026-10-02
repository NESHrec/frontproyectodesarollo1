import Link from "next/link";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { appointmentStatusLabel, appointmentStatusTone, attentionBlockerMessage, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { getOwnAppointment } from "@/modules/atencion-medica/server";
import { Card, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";

export default async function DoctorAppointmentPage({ params }: { params: Promise<{ citaId: string }> }) {
  const { citaId } = await params;
  const result = await getOwnAppointment(citaId);
  if (!result.ok) {
    return <div className="space-y-7"><InternalPageHeader description="Detalle de una cita asignada a tu agenda." eyebrow="Atención clínica" title="Cita" /><MedicalFailureNotice reason={result.reason} /></div>;
  }

  const { appointment, attention } = result.data;
  const recordHref = `/medico/pacientes/${encodeURIComponent(appointment.patientId)}/expediente?cita=${encodeURIComponent(appointment.id)}`;
  return (
    <div className="space-y-7">
      <InternalPageHeader
        actions={<div className="flex flex-wrap gap-2">
          <Link className={buttonLinkClasses} href={recordHref}>Consultar expediente</Link>
          {appointment.canRecordAttention ? <Link className={buttonLinkClasses} href={`/medico/consultas/nueva?cita=${encodeURIComponent(appointment.id)}`}>Registrar atención</Link> : null}
          <Link className={buttonLinkClasses} href={`/medico/odontograma/${encodeURIComponent(appointment.patientId)}?cita=${encodeURIComponent(appointment.id)}`}>Odontograma</Link>
        </div>}
        description="Datos persistidos de la cita; el paciente proviene de la reserva registrada."
        eyebrow="Atención clínica"
        title={patientLabel(appointment)}
      />
      <Card className="border-l-4 border-l-[#DDF3F1]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">{appointment.specialtyName}</p>
            <h2 className="mt-1 text-xl font-bold text-[#62727B]">{formatDateTime(appointment.scheduledAt)}</h2>
          </div>
          <StatusBadge tone={appointmentStatusTone(appointment.status)}>{appointmentStatusLabel[appointment.status]}</StatusBadge>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="font-semibold">Llegada</dt><dd>{appointment.arrivalAt ? formatDateTime(appointment.arrivalAt) : "Pendiente"}</dd></div>
          <div><dt className="font-semibold">Atención</dt><dd>{appointment.attentionRecorded ? "Documentada" : appointment.canRecordAttention ? "Lista para documentar" : "Aún no disponible"}</dd></div>
          <div><dt className="font-semibold">Notas de la reserva</dt><dd className="whitespace-pre-line">{appointment.notes ?? "Sin notas"}</dd></div>
        </dl>
        {!appointment.attentionRecorded && appointment.attentionBlockers.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 rounded-md bg-[#F8EDD2] py-3 pl-8 pr-4 text-sm" role="status">
            {appointment.attentionBlockers.map((blocker) => <li key={blocker}>{attentionBlockerMessage[blocker]}</li>)}
          </ul>
        ) : null}
      </Card>
      {attention ? (
        <section className="space-y-4"><h2 className="text-xl font-bold text-[#62727B]">Atención registrada</h2><AttentionCard attention={attention} /></section>
      ) : null}
    </div>
  );
}
