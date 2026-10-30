import { AdminSpecialtiesManager } from "@/modules/usuarios-accesos/components/AdminSpecialtiesManager";
import { InternalPageHeader } from "@/shared/components";

export default function AdminSpecialtiesPage() {
  return <div className="space-y-7"><InternalPageHeader description="Gestiona el catálogo persistente sin modificar médicos ni información clínica." eyebrow="Administración" title="Especialidades" /><AdminSpecialtiesManager /></div>;
}
