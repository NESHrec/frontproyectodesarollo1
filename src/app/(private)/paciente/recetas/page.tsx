import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { PatientPrescriptionsClient } from "@/modules/paciente-portal/components/PatientPrescriptionsClient";

export default function PatientPrescriptionsPage() {
  return <div className="space-y-7"><PatientPortalHeader description="Medicamentos e indicaciones guardados en tus atenciones clínicas." eyebrow="Documentos" title="Mis recetas" /><PatientPrescriptionsClient /></div>;
}
