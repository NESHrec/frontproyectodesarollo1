import { AdminAuditClient } from "@/modules/admin/components/AdminAuditClient";
import { InternalPageHeader } from "@/shared/components";

export default function AdminAuditPage() {
  return <div className="space-y-7"><InternalPageHeader description="Eventos persistidos y limitados a las operaciones cubiertas por esta primera versión. No registra todas las acciones del sistema." eyebrow="Administración" title="Bitácora" /><AdminAuditClient /></div>;
}
