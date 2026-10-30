import { PatientCheckupsClient } from "@/modules/paciente-portal/components/PatientCheckupsClient";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default function PatientCheckupsPage() {
  return <div className="space-y-7"><PatientPortalHeader description="Revisa el motivo, diagnóstico y plan registrados después de cada atención. Aquí no se agregan recomendaciones automáticas." eyebrow="Seguimiento" title="Mi seguimiento" /><PatientCheckupsClient /></div>;
}
