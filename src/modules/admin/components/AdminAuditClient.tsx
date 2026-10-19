"use client";

import { useCallback, useEffect, useState } from "react";

import { auditEventPageSchema, type AuditEvent } from "@/modules/usuarios-accesos/schemas";
import { Button, DataTable, EmptyState, LoadingState, type DataTableColumn } from "@/shared/components";

export const actionLabels: Record<string, string> = {
  STAFF_ACCOUNT_CREATED: "Cuenta de personal creada",
  SPECIALTY_CREATED: "Especialidad creada",
  SPECIALTY_UPDATED: "Especialidad actualizada",
  STAFF_PRACTITIONER_LINKED: "Profesional vinculado",
  STAFF_PRACTITIONER_UNLINKED: "Profesional desvinculado",
  PATIENT_ADMINISTRATIVE_RECORD_CREATED: "Expediente administrativo creado",
  PATIENT_PROFILE_UPDATED: "Perfil de paciente actualizado",
  APPOINTMENT_BOOKED: "Cita reservada",
  CLINICAL_ATTENTION_RECORDED: "Atención clínica registrada",
  DENTAL_OBSERVATION_RECORDED: "Observación odontológica registrada",
  STAFF_LOGIN_SUCCEEDED: "Inicio de sesión exitoso",
  STAFF_LOGIN_FAILED: "Inicio de sesión fallido",
  STAFF_LOGIN_BLOCKED: "Intento bloqueado por límite de acceso",
  AUTH_LOGIN_FAILED: "Inicio de sesión fallido",
  AUTH_LOGIN_BLOCKED: "Intento bloqueado por límite de acceso",
  PATIENT_LOGIN_SUCCEEDED: "Acceso de paciente exitoso",
  PATIENT_LOGOUT: "Cierre de sesión de paciente",
  STAFF_LOGOUT: "Cierre de sesión",
  HTTP_401: "Acceso sin autenticación (401)",
  HTTP_403: "Acceso denegado (403)",
  HTTP_500: "Error interno (500)",
};

const columns: DataTableColumn<AuditEvent>[] = [
  { key: "date", label: "Fecha", render: (item) => new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.occurredAt)) },
  { key: "actor", label: "Actor", render: (item) => <span className="font-semibold">{item.actorType} · {item.actorRole} · {item.actorAccountId}</span> },
  { key: "action", label: "Acción", render: (item) => actionLabels[item.action] ?? item.action.replaceAll("_", " ").toLowerCase() },
  { key: "entity", label: "Recurso", render: (item) => <span className="text-sm">{item.entityType.replaceAll("_", " ").toLowerCase()} · {item.entityId}</span> },
  { key: "ip", label: "IP de origen", render: (item) => <span className="font-mono text-xs">{item.clientIp ?? "No disponible"}</span> },
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
  if (error === "service") return <section className="space-y-3 rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">No se pudo cargar la bitácora</h2><p className="text-sm">El servicio no está disponible en este momento.</p><Button onClick={() => void load(page)}>Intentar nuevamente</Button></section>;
  return <div className="space-y-4">
    <div className="flex flex-col gap-2 rounded-2xl border border-[#56777A]/15 border-l-4 border-l-[#56777A]/70 bg-[#DDF3F1]/55 px-4 py-3 text-sm text-[#334B54] sm:flex-row sm:items-center sm:justify-between"><span className="font-extrabold" role="status">{events?.length ?? 0} eventos en esta página</span><span className="text-[#62727B]">Ordenados del más reciente al más antiguo</span></div>
    {events?.length === 0 ? <EmptyState description="Todavía no hay acciones administrativas registradas." title="Bitácora vacía" /> : <section className="overflow-hidden rounded-[1.5rem] border border-[#62727B]/15 bg-white shadow-[0_12px_32px_rgba(51,75,84,0.06)]" aria-label="Eventos de bitácora"><header className="flex flex-col gap-1 border-b border-[#62727B]/10 bg-gradient-to-r from-[#FBFCFA] to-[#DDF3F1]/45 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#56777A]">Actividad reciente</p><h2 className="mt-1 font-extrabold tracking-[-0.02em] text-[#334B54]">Registro de actividad</h2></div><p className="text-sm text-[#62727B]">Actor, acción y recurso tal como los entrega el servicio.</p></header><div aria-label="Tabla de eventos de bitácora" className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A]" role="region" tabIndex={0}><DataTable caption="Bitácora persistida" columns={columns} getRowKey={(item) => item.id} rows={events ?? []} /></div></section>}
    <nav aria-label="Paginación de la bitácora" className="grid grid-cols-1 gap-2 rounded-2xl border border-[#62727B]/15 bg-[#FBFCFA] p-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4"><Button className="w-full sm:w-fit" disabled={page === 0 || events === null} onClick={() => void load(page - 1)} variant="ghost">Página anterior</Button><span aria-live="polite" className="justify-self-center rounded-full bg-[#DDF3F1] px-3 py-1 font-bold text-[#334B54]">Página {page + 1}</span><Button className="w-full justify-self-end sm:w-fit" disabled={!hasNext || events === null} onClick={() => void load(page + 1)} variant="ghost">Página siguiente</Button></nav>
  </div>;
}
