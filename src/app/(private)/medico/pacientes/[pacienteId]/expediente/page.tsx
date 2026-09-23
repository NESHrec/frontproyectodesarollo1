import { clinicalTimeline } from "@/modules/expedientes/data";
import { getPatientById, patients } from "@/modules/pacientes/data";
import { Card, InternalPageHeader, PatientSummaryCard, StatusBadge } from "@/shared/components";

export function generateStaticParams() { return patients.map((patient) => ({ pacienteId: patient.id })); }

export default async function PatientRecordPage({ params }: { params: Promise<{ pacienteId: string }> }) {
  const { pacienteId } = await params;
  const patient = getPatientById(pacienteId);
  return <div className="space-y-7"><InternalPageHeader description="Resumen clínico académico visible únicamente en el área profesional." eyebrow="Expediente ficticio" title={patient.name} /><PatientSummaryCard {...patient} /><section><h2 className="text-xl font-bold text-[#62727B]">Línea de tiempo de consultas</h2><ol className="mt-5 space-y-4 border-l-2 border-[#DDF3F1] pl-5">{clinicalTimeline.map((event) => <li key={event.id}><Card><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">{event.date}</p><h3 className="mt-1 font-bold text-[#62727B]">{event.title}</h3></div><StatusBadge tone="pistacho">{event.status}</StatusBadge></div><p className="mt-3 text-sm leading-6">{event.summary}</p><p className="mt-3 text-xs font-semibold">Profesional: {event.professional}</p></Card></li>)}</ol></section></div>;
}
