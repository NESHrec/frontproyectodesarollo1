import { PatientProfileForm } from "@/modules/paciente-portal/components/PatientProfileForm";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { PatientLinkConfirmation } from "@/modules/paciente-portal/components/PatientLinkConfirmation";

export default function PatientProfilePage() {
  return <div className="space-y-8"><PatientPortalHeader description="Mantén actualizado tu nombre y revisa el estado de tu cuenta. La vinculación con recepción aparece como un paso separado." eyebrow="Datos personales" title="Mi perfil" /><section aria-labelledby="datos-cuenta"><h2 className="sr-only" id="datos-cuenta">Datos de la cuenta</h2><PatientProfileForm /></section><section aria-labelledby="vinculacion-expediente"><div className="mb-4"><p className="serena-kicker">Solo si recepción te dio un código</p><h2 className="mt-2 text-2xl font-black text-[#334B54]" id="vinculacion-expediente">Vincular mi expediente</h2></div><PatientLinkConfirmation /></section></div>;
}
