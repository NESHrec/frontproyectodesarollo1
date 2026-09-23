import { auditEvents, type AuditEvent } from "@/modules/usuarios-accesos/data";
import { DataTable, Input, InternalPageHeader, SearchFilters, SelectField, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<AuditEvent>[] = [
  { key: "date", label: "Fecha", render: (item) => item.date },
  { key: "actor", label: "Actor", render: (item) => <span className="font-semibold">{item.actor}</span> },
  { key: "action", label: "Acción", render: (item) => item.action },
  { key: "entity", label: "Entidad", render: (item) => <code className="rounded bg-[#DDF3F1] px-2 py-1 text-xs">{item.entity}</code> },
];

export default function AdminAuditPage() {
  return <div className="space-y-7"><InternalPageHeader description="Trazabilidad simulada de acciones visuales. No procede de registros reales." eyebrow="Administración" title="Bitácora" /><SearchFilters><Input defaultValue="2026-09-16" label="Fecha" type="date" /><SelectField defaultValue="todos" label="Tipo de actor"><option value="todos">Todos</option><option>Recepción</option><option>Médico</option><option>Administrador</option></SelectField><Input label="Buscar entidad" placeholder="Ej. CIT-1043" type="search" /></SearchFilters><DataTable caption="Bitácora ficticia" columns={columns} getRowKey={(item) => item.id} rows={auditEvents} /></div>;
}
