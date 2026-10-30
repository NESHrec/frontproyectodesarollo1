import { MedicalScheduleManager } from "@/modules/agenda-citas/components/MedicalScheduleManager";
import { InternalPageHeader } from "@/shared/components";

export default function DoctorSchedulesPage() {
  return (
    <div className="space-y-8">
      <InternalPageHeader description="Consulta y agrega bloques únicamente para el profesional vinculado a tu cuenta." eyebrow="Médico / Odontólogo" title="Mis horarios" />
      <section aria-label="Gestor de disponibilidad" className="rounded-[2rem] border border-[#62727B]/10 bg-[linear-gradient(145deg,rgba(221,243,241,.42),rgba(251,252,250,.8))] p-3 shadow-[0_24px_65px_-50px_rgba(38,50,56,.65)] sm:p-5"><MedicalScheduleManager /></section>
    </div>
  );
}
