import { Card } from "@/shared/components";
import { demoPatient } from "@/modules/paciente-portal/data";
import { PatientProfileForm } from "@/modules/paciente-portal/components/PatientProfileForm";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default function PatientProfilePage() {
  return <div className="space-y-7"><PatientPortalHeader description="Valida visualmente datos de contacto ficticios. No hay sesión ni guardado de cambios." eyebrow="Datos personales" title="Mi perfil de demostración" /><div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><PatientProfileForm patient={demoPatient} /><Card className="h-fit bg-[#F8EDD2]"><h2 className="text-lg font-bold text-[#62727B]">Referencia visual</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-[#62727B]/65">Fecha de nacimiento ficticia</dt><dd className="mt-1 font-semibold text-[#62727B]">18 de abril de 1998</dd></div><div><dt className="text-[#62727B]/65">Tipo de sangre ficticio</dt><dd className="mt-1 font-semibold text-[#62727B]">{demoPatient.bloodType}</dd></div></dl><p className="mt-7 border-t border-[#62727B]/10 pt-5 text-xs leading-5 text-[#62727B]/70">Estos datos no pertenecen a una persona autenticada. Para una futura integración se requeriría sesión y un endpoint privado.</p></Card></div></div>;
}
