"use client";

import { useCallback, useEffect, useState } from "react";

import { auditEventPageSchema, type AuditEvent } from "@/modules/usuarios-accesos/schemas";
import { Button, DataTable, EmptyState, LoadingState, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<AuditEvent>[] = [
  { key: "date", label: "Fecha", render: (item) => new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.occurredAt)) },
  { key: "actor", label: "Actor", render: (item) => <span className="font-semibold">{item.actorAccountId}</span> },
  { key: "action", label: "Acción", render: (item) => item.action },
  { key: "entity", label: "Entidad", render: (item) => <code className="rounded bg-[#DDF3F1] px-2 py-1 text-xs">{item.entityType} · {item.entityId}</code> },
];

export function AdminAuditClient() {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<"forbidden" | "service" | null>(null);

  const load = useCallback(async (requestedPage: number) => {
    setEvents(null);
    setError(null);
    const response = await fetch(`/api/staff/audit-events?page=${requestedPage}&limit=50`, { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    const parsed = auditEventPageSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setEvents(parsed.data.items);
    setPage(parsed.data.page);
    setHasNext(parsed.data.hasNext);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(0); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  if (events === null && !error) return <LoadingState message="Consultando bitácora persistida…" />;
  if (error === "forbidden") return <section className="rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">Acceso denegado</h2><p className="mt-1 text-sm">La bitácora solo está disponible para ADMIN.</p></section>;
  if (error === "service") return <section className="space-y-3 rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">No se pudo cargar la bitácora</h2><p className="text-sm">El backend no respondió.</p><Button onClick={() => void load(page)}>Intentar nuevamente</Button></section>;
  return <div className="space-y-4">
    {events?.length === 0 ? <EmptyState description="El backend respondió correctamente, pero todavía no hay eventos de los tipos cubiertos por esta versión." title="Bitácora vacía" /> : <DataTable caption="Bitácora persistida" columns={columns} getRowKey={(item) => item.id} rows={events ?? []} />}
    <div className="flex flex-wrap justify-between gap-3 text-sm"><Button disabled={page === 0 || events === null} onClick={() => void load(page - 1)} variant="ghost">Página anterior</Button><span aria-live="polite" className="self-center">Página {page + 1}</span><Button disabled={!hasNext || events === null} onClick={() => void load(page + 1)} variant="ghost">Página siguiente</Button></div>
  </div>;
}
