import { MedicalScheduleManager } from "@/modules/agenda-citas/components/MedicalScheduleManager";
import { InternalPageHeader } from "@/shared/components";

export default function DoctorSchedulesPage() {
  return (
    <div className="space-y-8">
      <InternalPageHeader description="Consulta y agrega bloques únicamente para el profesional vinculado a tu cuenta." eyebrow="Médico / Odontólogo" title="Mis horarios" />
      <section className="rounded-[1.75rem] border border-[#62727B]/10 bg-[#DDF3F1]/20 p-3 sm:p-5"><MedicalScheduleManager /></section>
    </div>
  );
}
