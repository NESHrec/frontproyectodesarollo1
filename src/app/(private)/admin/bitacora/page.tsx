import { AdminAuditClient } from "@/modules/admin/components/AdminAuditClient";
import { getInitialAuditEventPage } from "@/modules/admin/server";
import { InternalPageHeader } from "@/shared/components";

export default async function AdminAuditPage() {
  const initialPage = await getInitialAuditEventPage();
  return <div className="space-y-6 lg:space-y-7"><InternalPageHeader description="Historial de acciones administrativas disponibles, con actor, recurso y fecha, sin contraseñas ni información clínica." eyebrow="Administración" title="Bitácora" /><AdminAuditClient initialPage={initialPage} /></div>;
}
