import Link from "next/link";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { appointmentStatusLabel, attentionBlockerMessage, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { getOwnAppointment } from "@/modules/atencion-medica/server";
import { ConsultationForm } from "@/modules/expedientes/components/ConsultationForm";
import { Card, EmptyState, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function NewConsultationPage({ searchParams }: { searchParams: PageSearchParams }) {
  const citaId = firstSearchParam((await searchParams).cita);
  const header = <InternalPageHeader description="Documenta motivo, diagnóstico y receta de una cita propia. El registro guardado no se sobrescribe." eyebrow="Atención clínica" title="Registrar atención" />;

  if (!citaId) {
    return <div className="space-y-7">{header}<EmptyState action={<Link className={buttonLinkClasses} href="/medico/agenda">Ir a mi agenda</Link>} description="Cada atención se registra sobre una cita asignada a tu agenda. Abre la cita y elige “Registrar atención”." title="Selecciona una cita" /></div>;
  }
  const result = await getOwnAppointment(citaId);
  if (!result.ok) return <div className="space-y-7">{header}<MedicalFailureNotice reason={result.reason} /></div>;

  const { appointment, attention } = result.data;
  const patient = patientLabel(appointment);
  return (
    <div className="space-y-7">
      {header}
      <Card className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#62727B]">{patient}</h2>
            <p className="mt-1 text-sm text-[#62727B]/70">{appointment.specialtyName} · {formatDateTime(appointment.scheduledAt)}</p>
          </div>
          <StatusBadge tone={attention ? "pistacho" : "agua"}>{attention ? "Documentada" : appointmentStatusLabel[appointment.status]}</StatusBadge>
        </div>
        {attention ? (
          <div className="space-y-4">
            <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold" role="status">Atención guardada. Este es el registro persistido.</p>
            <AttentionCard attention={attention} />
            <Link className={buttonLinkClasses} href={`/medico/pacientes/${encodeURIComponent(appointment.patientId)}/expediente?cita=${encodeURIComponent(appointment.id)}`}>Ver expediente</Link>
          </div>
        ) : appointment.canRecordAttention ? (
          <ConsultationForm appointmentId={appointment.id} patientName={patient} />
        ) : (
          <div className="space-y-3 rounded-md bg-[#F8E2E8] px-4 py-3 text-sm" role="alert">
            <p className="font-semibold">Aún no puedes registrar la atención de esta cita:</p>
            <ul className="list-disc space-y-1 pl-5">{appointment.attentionBlockers.map((blocker) => <li key={blocker}>{attentionBlockerMessage[blocker]}</li>)}</ul>
            <p>El servidor valida estas reglas al guardar: la atención solo se registra cuando la hora de la cita ya comenzó y recepción registró la llegada.</p>
            <Link className="font-bold underline-offset-4 hover:underline" href={`/medico/citas/${encodeURIComponent(appointment.id)}`}>Volver a la cita</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
