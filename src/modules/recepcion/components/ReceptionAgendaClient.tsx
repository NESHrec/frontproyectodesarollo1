"use client";

import { useEffect, useState } from "react";

import { Button, EmptyState, InternalPageHeader, LoadingState, StatusBadge } from "@/shared/components";
import { getCsrfToken as csrfToken } from "@/modules/auth/csrf-client";
import { receptionAppointmentsSchema, type ReceptionAppointment } from "@/modules/recepcion/schemas";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}


export function ReceptionAgendaClient() {
  const [appointments, setAppointments] = useState<ReceptionAppointment[] | null>(null);
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

  return <div className="space-y-7">
    <InternalPageHeader description="Agenda actualizada. Solo recepción puede registrar la llegada de una cita." eyebrow="Recepción" title="Agenda" />
    {appointments === null && !error ? <LoadingState message="Consultando la agenda..." /> : null}
    {error === "forbidden" ? <section className="space-y-3 rounded-lg border border-[#62727B]/15 bg-[#F8E2E8] p-5"><h2 className="font-bold text-[#62727B]">Acceso denegado</h2><p className="text-sm">Tu sesión no tiene permiso para consultar la agenda.</p></section> : null}
    {error === "service" ? <section className="space-y-3 rounded-lg border border-[#62727B]/15 bg-[#F8E2E8] p-5"><h2 className="font-bold text-[#62727B]">No se pudo cargar la agenda</h2><p className="text-sm">El servicio no respondió. Puedes intentar nuevamente.</p><Button onClick={() => void loadAgenda()}>Intentar nuevamente</Button></section> : null}
    {message ? <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">{message}</p> : null}
    {appointments?.length === 0 ? <EmptyState description="No hay citas persistidas en el rango consultado." title="Agenda vacía" /> : null}
    {appointments && appointments.length > 0 ? <div className="overflow-x-auto rounded-lg border border-[#62727B]/15 bg-[#FBFCFA]"><table className="min-w-full text-left text-sm"><caption className="sr-only">Agenda persistida de recepción</caption><thead className="bg-[#DDF3F1] text-[#62727B]"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Paciente</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Llegada</th><th className="px-4 py-3">Acción</th></tr></thead><tbody>{appointments.map((item) => <tr className="border-t border-[#62727B]/10" key={item.id}><td className="px-4 py-3">{formatDate(item.scheduledAt)}</td><td className="px-4 py-3 font-semibold">{item.patientId}</td><td className="px-4 py-3"><StatusBadge tone={item.status === "CANCELADA" ? "rosa" : "agua"}>{item.status}</StatusBadge></td><td className="px-4 py-3">{item.arrivalAt ? formatDate(item.arrivalAt) : "Pendiente"}</td><td className="px-4 py-3">{item.arrivalAt || item.status === "CANCELADA" || item.status === "COMPLETADA" ? <span className="text-xs text-[#62727B]/70">Sin acción</span> : <Button disabled={busyId === item.id} onClick={() => void registerArrival(item.id)}>{busyId === item.id ? "Guardando..." : "Registrar llegada"}</Button>}</td></tr>)}</tbody></table></div> : null}
  </div>;
}
