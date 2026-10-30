import { Odontogram } from "@/modules/odontologia/components/Odontogram";
import { getPatientOdontogram } from "@/modules/odontologia/server";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";
import { InternalPageHeader } from "@/shared/components";

export default async function OdontogramPage({ params, searchParams }: { params: Promise<{ pacienteId: string }>; searchParams: PageSearchParams }) {
  const { pacienteId } = await params;
  const appointmentId = firstSearchParam((await searchParams).cita);
  const result = await getPatientOdontogram(pacienteId);
  const header = <InternalPageHeader description="Observaciones persistidas por pieza dental; solo accesibles desde citas propias del médico." eyebrow="Odontología" title={`Odontograma · ${result.ok ? result.data.patientName ?? "Paciente" : "Paciente"}`} />;
  if (!result.ok) return <div className="space-y-7">{header}<MedicalFailureNotice reason={result.reason === "forbidden" ? "forbidden" : result.reason === "not-found" ? "not-found" : result.reason === "expired" ? "expired" : "service"} /></div>;
  return <div className="space-y-7">{header}<Odontogram patientId={pacienteId} appointmentId={appointmentId ?? undefined} initialObservations={result.data.observations} /></div>;
}
