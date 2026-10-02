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

  if (appointments === null && !error) return <LoadingState message="Consultando el resumen de agenda..." />;
  if (error === "forbidden") {
    return <ErrorState description="Tu sesión no tiene permiso para consultar la agenda de recepción." title="Acceso denegado" />;
  }
  if (error === "service") {
    return <ErrorState description="No se pudo consultar la agenda. Ningún fallo de carga se presenta como cero." onRetry={() => void load()} title="No se pudo cargar el resumen" />;
  }
  if (!appointments?.length) {
    return <EmptyState action={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="No hay citas en la ventana consultada: comienza ayer y termina 30 días después de ese inicio." title="Sin citas en la vista actual" />;
  }

  const waiting = appointments.filter((item) =>
    !item.arrivalAt && (item.status === "PENDIENTE" || item.status === "CONFIRMADA")
  ).length;
  const arrivals = appointments.filter((item) => Boolean(item.arrivalAt)).length;
  const cancelled = appointments.filter((item) => item.status === "CANCELADA").length;
  const limitDetail = appointments.length === 50
    ? "Se alcanzó el límite de 50; esta cifra no es un total general."
    : "Rango: ventana de 30 días que comienza ayer y termina 30 días después de ese inicio; máximo 50.";

  return <div className="space-y-6">
    <section aria-label="Indicadores de la vista de agenda" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard detail={limitDetail} label="Citas recuperadas" value={String(appointments.length)} />
      <MetricCard detail="Pendientes o confirmadas sin llegada, dentro de la vista cargada." label="Por recibir" tone="pistacho" value={String(waiting)} />
      <MetricCard detail="Registros de llegada persistidos dentro de la vista cargada." label="Llegadas registradas" tone="crema" value={String(arrivals)} />
      <MetricCard detail="Citas canceladas dentro de la vista cargada." label="Canceladas" tone="rosa" value={String(cancelled)} />
    </section>
    <Card>
      <h2 className="text-lg font-bold text-[#62727B]">Agenda operativa</h2>
      <p className="mt-2 text-sm leading-6 text-[#62727B]/80">Consulta las citas persistidas y registra llegadas únicamente desde la agenda autorizada. Este resumen no muestra diagnósticos, notas clínicas, recetas ni expedientes.</p>
      <Link className={`${buttonLinkClasses} mt-5`} href="/recepcion/agenda">Abrir agenda real</Link>
    </Card>
  </div>;
}
