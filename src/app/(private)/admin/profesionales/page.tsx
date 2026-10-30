import { PractitionerManager } from "@/modules/admin/components/PractitionerManager";
import { getStaffPractitioners } from "@/modules/admin/server";
import { getEspecialidades } from "@/modules/catalogo-medico/api";
import { ApiErrorState, InternalPageHeader } from "@/shared/components";

export default async function AdminPractitionersPage() {
  const [specialties, practitioners] = await Promise.all([getEspecialidades(), getStaffPractitioners()]);
  return <div className="space-y-7"><InternalPageHeader description="Crea, edita y desactiva profesionales. Las fotos autorizadas se muestran únicamente mientras el profesional esté activo." eyebrow="Administración" title="Profesionales" />{specialties.ok ? <PractitionerManager initialItems={practitioners} specialties={specialties.data}/> : <ApiErrorState title="Especialidades no disponibles" description="No se puede gestionar profesionales sin consultar primero las especialidades."/>}</div>;
}
