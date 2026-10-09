import { AdminAuditClient } from "@/modules/admin/components/AdminAuditClient";
import { InternalPageHeader } from "@/shared/components";

export default function AdminAuditPage() {
  return <div className="space-y-7"><InternalPageHeader description="Historial de acciones administrativas disponibles, con actor, recurso y fecha, sin contraseñas ni información clínica." eyebrow="Administración" title="Bitácora" /><AdminAuditClient /></div>;
}
