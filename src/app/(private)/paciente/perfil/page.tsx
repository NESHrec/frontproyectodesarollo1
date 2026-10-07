import { PatientProfileForm } from "@/modules/paciente-portal/components/PatientProfileForm";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { PatientLinkConfirmation } from "@/modules/paciente-portal/components/PatientLinkConfirmation";

export default function PatientProfilePage() {
  return <div className="space-y-7"><PatientPortalHeader description="Consulta y actualiza el nombre completo guardado en tu cuenta autenticada." eyebrow="Datos personales" title="Mi perfil" /><PatientProfileForm /><PatientLinkConfirmation /></div>;
}
