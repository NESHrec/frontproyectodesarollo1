import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { PatientPrescriptionsClient } from "@/modules/paciente-portal/components/PatientPrescriptionsClient";

export default function PatientPrescriptionsPage() {
  return <div className="space-y-7"><PatientPortalHeader description="Consulta medicamentos, dosis e indicaciones exactamente como fueron registrados en tus atenciones." eyebrow="Documentos" title="Mis recetas" /><PatientPrescriptionsClient /></div>;
}
