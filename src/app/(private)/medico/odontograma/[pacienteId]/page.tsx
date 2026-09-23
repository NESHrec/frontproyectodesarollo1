import { Odontogram } from "@/modules/odontologia/components/Odontogram";
import { getPatientById, patients } from "@/modules/pacientes/data";
import { InternalPageHeader, PatientSummaryCard } from "@/shared/components";
export function generateStaticParams() { return patients.map((patient) => ({ pacienteId: patient.id })); }
export default async function OdontogramPage({ params }: { params: Promise<{ pacienteId: string }> }) { const { pacienteId } = await params; const patient = getPatientById(pacienteId); return <div className="space-y-7"><InternalPageHeader description="Mapa odontológico ficticio con estados por color para demostrar la interfaz." eyebrow="Odontología" title={`Odontograma · ${patient.name}`} /><PatientSummaryCard {...patient} /><Odontogram /></div>; }
