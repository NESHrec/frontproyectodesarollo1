"use client";

import { useEffect, useMemo, useState } from "react";

import { getCsrfToken as csrfToken } from "@/modules/auth/csrf-client";
import { receptionAppointmentsSchema, type ReceptionAppointment } from "@/modules/recepcion/schemas";
import { Button, EmptyState, InternalPageHeader, LoadingState, MetricCard, SelectField, StatusBadge } from "@/shared/components";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusTone(status: ReceptionAppointment["status"]): "rosa" | "pistacho" | "crema" | "agua" {
  if (status === "CANCELADA") return "rosa";
  if (status === "COMPLETADA") return "pistacho";
  if (status === "CONFIRMADA") return "crema";
  return "agua";
}

function canRegisterArrival(item: ReceptionAppointment) {
  return !item.arrivalAt && item.status !== "CANCELADA" && item.status !== "COMPLETADA";
}

export function ReceptionAgendaClient() {
  const [appointments, setAppointments] = useState<ReceptionAppointment[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [error, setError] = useState<"service" | "forbidden" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAgenda() {
    setAppointments(null);
    setError(null);
    const response = await fetch("/api/staff/agenda", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    if (!response.ok) { setError("service"); return; }
    const parsed = receptionAppointmentsSchema.safeParse(await response.json().catch(() => null));
    if (!parsed.success) { setError("service"); return; }
    setAppointments(parsed.data);
  }

  useEffect(() => {
    const task = window.setTimeout(() => { void loadAgenda(); }, 0);
    return () => window.clearTimeout(task);
  }, []);

  async function registerArrival(appointmentId: string) {
    setBusyId(appointmentId); setMessage(null);
    try {
      const token = await csrfToken();
      const response = await fetch(`/api/staff/agenda/${encodeURIComponent(appointmentId)}/arrival`, {
        method: "POST", headers: { "x-csrf-token": token },
      });
      if (response.status === 409) { setMessage("La llegada ya fue registrada o la cita no admite esta acción."); return; }
      if (response.status === 403) { setMessage("Tu cuenta no tiene permiso para registrar llegadas."); return; }
      if (!response.ok) { setMessage("No se pudo registrar la llegada."); return; }
      const updated = await response.json() as ReceptionAppointment;
      setAppointments((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? current);
      setMessage("Llegada registrada y persistida.");
    } catch { setMessage("No se pudo conectar con el servicio."); }
    finally { setBusyId(null); }
  }

  const metrics = useMemo(() => ({
    total: appointments?.length ?? 0,
    pending: appointments?.filter(canRegisterArrival).length ?? 0,
    arrived: appointments?.filter((item) => Boolean(item.arrivalAt)).length ?? 0,
  }), [appointments]);
  const visibleAppointments = useMemo(() => appointments?.filter((item) => statusFilter === "TODAS" || item.status === statusFilter) ?? [], [appointments, statusFilter]);

  const arrivalAction = (item: ReceptionAppointment) => canRegisterArrival(item)
    ? <Button className="w-full sm:w-auto" disabled={busyId === item.id} onClick={() => void registerArrival(item.id)}>{busyId === item.id ? "Guardando..." : "Registrar llegada"}</Button>
    : <span className="text-xs font-semibold text-[#62727B]/65">Sin acción pendiente</span>;

  return <div className="space-y-6 lg:space-y-7">
    <InternalPageHeader description="Prioriza las llegadas pendientes y confirma cada registro sin exponer información clínica." eyebrow="Recepción" title="Agenda del equipo" />

    {appointments ? <section aria-label="Resumen de agenda" className="grid gap-3 sm:grid-cols-3 [&>*]:min-h-[8rem]">
      <MetricCard detail="Citas devueltas por la consulta actual." label="Citas en agenda" value={String(metrics.total)} />
      <MetricCard detail="Citas que todavía admiten registrar llegada." label="Por recibir" tone="crema" value={String(metrics.pending)} />
      <MetricCard detail="Llegadas confirmadas en esta vista." label="Ya recibidos" tone="pistacho" value={String(metrics.arrived)} />
    </section> : null}

    {appointments === null && !error ? <LoadingState message="Consultando la agenda..." /> : null}
    {error === "forbidden" ? <section className="space-y-2 rounded-lg border border-[#8D4154]/20 bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold text-[#8D4154]">Acceso denegado</h2><p className="text-sm text-[#263238]">Tu sesión no tiene permiso para consultar la agenda.</p></section> : null}
    {error === "service" ? <section className="space-y-3 rounded-lg border border-[#8D4154]/20 bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold text-[#8D4154]">No se pudo cargar la agenda</h2><p className="text-sm text-[#263238]">El servicio no respondió. Puedes intentar nuevamente.</p><Button onClick={() => void loadAgenda()}>Intentar nuevamente</Button></section> : null}
    {message ? <p className="rounded-md border border-[#56777A]/15 bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#334B54]" role="status">{message}</p> : null}
    {appointments?.length === 0 ? <EmptyState description="No hay citas persistidas en el rango consultado." title="Agenda vacía" /> : null}

    {appointments && appointments.length > 0 ? <section className="space-y-4" aria-labelledby="agenda-list-title">
      <div className="grid gap-4 rounded-[1.5rem] border border-[#56777A]/20 bg-gradient-to-r from-[#DDF3F1]/70 via-[#FBFCFA] to-[#F8EDD2]/30 p-4 shadow-[0_10px_28px_rgba(51,75,84,0.06)] sm:p-5 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end">
        <div><h2 className="font-bold text-[#334B54]" id="agenda-list-title">Citas disponibles</h2><p className="mt-1 text-sm text-[#62727B]">{visibleAppointments.length} de {appointments.length} citas visibles.</p></div>
        <div className="w-full sm:w-56"><SelectField id="agenda-status-filter" label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="TODAS">Todos los estados</option><option value="PENDIENTE">Pendiente</option><option value="CONFIRMADA">Confirmada</option><option value="COMPLETADA">Completada</option><option value="CANCELADA">Cancelada</option></SelectField></div>
      </div>

      {visibleAppointments.length === 0 ? <EmptyState description="No hay citas que coincidan con el estado seleccionado." title="Sin coincidencias" /> : null}
      {visibleAppointments.length > 0 ? <>
        <ul className="space-y-3 border-l-2 border-[#DDF3F1] pl-3 md:hidden sm:pl-4" aria-label="Agenda persistida de recepción">
          {visibleAppointments.map((item) => <li className="rounded-2xl border border-[#62727B]/15 border-l-4 border-l-[#56777A]/50 bg-white p-4 shadow-[0_8px_22px_rgba(51,75,84,0.05)]" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">Fecha y hora</p><p className="mt-1 font-extrabold text-[#334B54]">{formatDate(item.scheduledAt)}</p></div><StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge></div><dl className="mt-4 grid gap-3 text-sm"><div><dt className="text-xs font-semibold text-[#62727B]/65">Paciente</dt><dd className="break-all font-semibold text-[#263238]">{item.patientId}</dd></div><div><dt className="text-xs font-semibold text-[#62727B]/65">Llegada</dt><dd className="text-[#263238]">{item.arrivalAt ? formatDate(item.arrivalAt) : "Pendiente"}</dd></div></dl><div className="mt-4 border-t border-[#62727B]/10 pt-4">{arrivalAction(item)}</div></li>)}
        </ul>
        <div aria-label="Tabla de agenda" className="hidden overflow-x-auto rounded-2xl border border-[#62727B]/15 bg-white shadow-[0_12px_32px_rgba(51,75,84,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] md:block" role="region" tabIndex={0}><table className="min-w-[48rem] text-left text-sm"><caption className="sr-only">Agenda persistida de recepción</caption><thead className="bg-[#DDF3F1] text-[#334B54]"><tr><th className="px-4 py-3" scope="col">Fecha</th><th className="px-4 py-3" scope="col">Paciente</th><th className="px-4 py-3" scope="col">Estado</th><th className="px-4 py-3" scope="col">Llegada</th><th className="px-4 py-3" scope="col">Acción</th></tr></thead><tbody className="divide-y divide-[#62727B]/10">{visibleAppointments.map((item) => <tr className="align-top transition-colors duration-180 ease-out hover:bg-[#FBFCFA] motion-reduce:transition-none" key={item.id}><td className="whitespace-nowrap px-4 py-4 font-semibold">{formatDate(item.scheduledAt)}</td><td className="max-w-52 break-all px-4 py-4">{item.patientId}</td><td className="px-4 py-4"><StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge></td><td className="whitespace-nowrap px-4 py-4">{item.arrivalAt ? formatDate(item.arrivalAt) : "Pendiente"}</td><td className="px-4 py-4">{arrivalAction(item)}</td></tr>)}</tbody></table></div>
      </> : null}
    </section> : null}
  </div>;
}
