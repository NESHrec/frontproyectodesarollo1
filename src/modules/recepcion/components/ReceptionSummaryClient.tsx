"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { receptionAppointmentsSchema, type ReceptionAppointment } from "@/modules/recepcion/schemas";
import { Card, EmptyState, ErrorState, LoadingState, MetricCard, buttonLinkClasses } from "@/shared/components";

type LoadError = "forbidden" | "service" | null;

export function ReceptionSummaryClient() {
  const [appointments, setAppointments] = useState<ReceptionAppointment[] | null>(null);
  const [error, setError] = useState<LoadError>(null);

  const load = useCallback(async () => {
    setAppointments(null);
    setError(null);
    const response = await fetch("/api/staff/agenda?limit=50", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    const parsed = receptionAppointmentsSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setAppointments(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const loadedAppointments = appointments ?? [];
  const waiting = loadedAppointments.filter((item) =>
    !item.arrivalAt && (item.status === "PENDIENTE" || item.status === "CONFIRMADA")
  ).length;
  const arrivals = loadedAppointments.filter((item) => Boolean(item.arrivalAt)).length;
  const cancelled = loadedAppointments.filter((item) => item.status === "CANCELADA").length;
  const limitDetail = loadedAppointments.length === 50
    ? "Se alcanzó el límite de 50; esta cifra no es un total general."
    : "Rango: ventana de 30 días que comienza ayer y termina 30 días después de ese inicio; máximo 50.";

  return <div className="space-y-5">
    {appointments === null && !error ? <LoadingState message="Consultando el resumen de agenda..." /> : null}
    {error === "forbidden" ? <ErrorState description="Tu sesión no tiene permiso para consultar la agenda de recepción." title="Acceso denegado" /> : null}
    {error === "service" ? <ErrorState description="No se pudo consultar la agenda. Ningún fallo de carga se presenta como cero." onRetry={() => void load()} title="No se pudo cargar el resumen" /> : null}
    {appointments?.length === 0 && !error ? <div className="overflow-hidden rounded-[1.5rem] border border-[#62727B]/10 bg-gradient-to-br from-[#FBFCFA] to-[#DDF3F1]/35"><EmptyState action={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="No hay citas en la ventana consultada: comienza ayer y termina 30 días después de ese inicio." title="Sin citas en la vista actual" /></div> : null}
    {appointments && appointments.length > 0 ? <section aria-label="Indicadores de la vista de agenda" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard detail={limitDetail} label="Citas recuperadas" value={String(loadedAppointments.length)} />
      <MetricCard detail="Pendientes o confirmadas sin llegada, dentro de la vista cargada." label="Por recibir" tone="pistacho" value={String(waiting)} />
      <MetricCard detail="Registros de llegada persistidos dentro de la vista cargada." label="Llegadas registradas" tone="crema" value={String(arrivals)} />
      <MetricCard detail="Citas canceladas dentro de la vista cargada." label="Canceladas" tone="rosa" value={String(cancelled)} />
    </section> : null}
    <Card className="border-[#56777A]/20 bg-white/90 p-5 shadow-[0_12px_32px_rgba(51,75,84,0.07)] sm:p-6">
      <div className="flex flex-col gap-2 border-b border-[#62727B]/10 pb-4 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#334B54]">Acciones frecuentes</h2><span className="text-xs font-semibold text-[#62727B]">Continúa en un módulo</span></div>
      <p className="mt-2 text-sm leading-6 text-[#62727B]">Continúa en el módulo correspondiente. Este resumen no muestra diagnósticos, notas clínicas, recetas ni expedientes.</p>
      <nav aria-label="Acciones frecuentes de recepción" className="mt-4 grid gap-3 lg:grid-cols-3">
        <Link className={`${buttonLinkClasses} group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-[#56777A]/15 bg-[#DDF3F1]/40 px-4 py-3 text-left transition-[background-color,border-color,box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:bg-[#DDF3F1]/75 hover:shadow-[0_10px_24px_rgba(51,75,84,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334B54] motion-reduce:!translate-none motion-reduce:!transition-none`} href="/recepcion/agenda"><span className="font-bold">Revisar agenda</span><span aria-hidden="true" className="text-lg text-[#56777A] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:!translate-none motion-reduce:!transition-none">↗</span></Link>
        <Link className={`${buttonLinkClasses} group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-[#56777A]/15 bg-[#FBFCFA] px-4 py-3 text-left transition-[background-color,border-color,box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:bg-white hover:shadow-[0_10px_24px_rgba(51,75,84,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334B54] motion-reduce:!translate-none motion-reduce:!transition-none`} href="/recepcion/pacientes"><span className="font-bold">Buscar paciente</span><span aria-hidden="true" className="text-lg text-[#56777A] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:!translate-none motion-reduce:!transition-none">↗</span></Link>
        <Link className={`${buttonLinkClasses} group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-[#56777A]/15 bg-[#F8EDD2]/45 px-4 py-3 text-left transition-[background-color,border-color,box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:bg-[#F8EDD2]/70 hover:shadow-[0_10px_24px_rgba(51,75,84,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334B54] motion-reduce:!translate-none motion-reduce:!transition-none`} href="/recepcion/cobros"><span className="font-bold">Consultar cobros</span><span aria-hidden="true" className="text-lg text-[#56777A] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:!translate-none motion-reduce:!transition-none">↗</span></Link>
      </nav>
    </Card>
  </div>;
}
