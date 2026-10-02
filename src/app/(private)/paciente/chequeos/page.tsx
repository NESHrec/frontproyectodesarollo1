import { PatientCheckupsClient } from "@/modules/paciente-portal/components/PatientCheckupsClient";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default function PatientCheckupsPage() {
  return <div className="space-y-7"><PatientPortalHeader description="Información derivada únicamente de atenciones clínicas, citas y recetas persistidas. No muestra recomendaciones futuras ni datos de muestra." eyebrow="Seguimiento" title="Chequeos y tratamiento" /><PatientCheckupsClient /></div>;
}
