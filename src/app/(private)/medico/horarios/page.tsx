import { MedicalScheduleManager } from "@/modules/agenda-citas/components/MedicalScheduleManager";
import { InternalPageHeader } from "@/shared/components";

export default function DoctorSchedulesPage() {
  return (
    <div className="space-y-7">
      <InternalPageHeader description="Consulta y agrega bloques únicamente para el profesional vinculado a tu cuenta." eyebrow="Médico / Odontólogo" title="Mis horarios" />
      <MedicalScheduleManager />
    </div>
  );
}
