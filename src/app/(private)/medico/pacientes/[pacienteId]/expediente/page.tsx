import Link from "next/link";
import { notFound } from "next/navigation";

import { AttentionCard } from "@/modules/atencion-medica/components/AttentionCard";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { formatDateTime } from "@/modules/atencion-medica/format";
import { getRecordForAppointment } from "@/modules/atencion-medica/server";
import { Card, EmptyState, InternalPageHeader, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

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

  const { patient, recordId, recordCreatedAt, attentions } = result.data;
  const appointmentHref = `/medico/citas/${encodeURIComponent(citaId)}`;
  return (
    <div className="space-y-7">
      {header(patient.fullName ?? "Paciente sin nombre registrado")}
      <Card className="border-l-4 border-l-[#DDF3F1]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">Paciente</p>
            <h2 className="mt-1 text-xl font-bold text-[#62727B]">{patient.fullName ?? "Sin nombre registrado"}</h2>
            <p className="mt-1 text-sm text-[#62727B]/75">Registrado {formatDateTime(patient.registeredAt)}</p>
          </div>
          <StatusBadge tone={patient.status === "ACTIVO" ? "pistacho" : "rosa"}>{patient.status === "ACTIVO" ? "Activo" : "Inactivo"}</StatusBadge>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="font-semibold">Expediente</dt><dd>{recordId ? `Abierto ${formatDateTime(recordCreatedAt)}` : "Se abrirá con la primera atención"}</dd></div>
          <div><dt className="font-semibold">Atenciones</dt><dd>{attentions.length}</dd></div>
        </dl>
        <Link className="mt-5 inline-flex text-sm font-bold text-[#62727B] underline-offset-4 hover:underline" href={appointmentHref}>Volver a la cita</Link>
      </Card>
      <section>
        <h2 className="text-xl font-bold text-[#62727B]">Historial de atenciones</h2>
        {attentions.length === 0
          ? <div className="mt-5"><EmptyState description="Este paciente aún no tiene atenciones documentadas." title="Sin atenciones" /></div>
          : <ol className="mt-5 space-y-4 border-l-2 border-[#DDF3F1] pl-5">{attentions.map((attention) => <li key={attention.id}><AttentionCard attention={attention} /></li>)}</ol>}
      </section>
    </div>
  );
}
