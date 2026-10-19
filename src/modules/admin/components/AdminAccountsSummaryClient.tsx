"use client";

import { useCallback, useEffect, useState } from "react";

import { staffAccountSummarySchema } from "@/modules/atencion-medica/schemas";
import { EmptyState, ErrorState, LoadingState, MetricCard } from "@/shared/components";

type LoadError = "forbidden" | "service" | null;

export function AdminAccountsSummaryClient() {
  const [summary, setSummary] = useState<{ total: number; active: number; rolesPresent: number; pendingLinks: number } | null>(null);
  const [error, setError] = useState<LoadError>(null);

  const load = useCallback(async () => {
    setSummary(null);
    setError(null);
    const response = await fetch("/api/staff/accounts/summary", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    const parsed = staffAccountSummarySchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setSummary(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  if (summary === null && !error) return <LoadingState message="Consultando cuentas de personal..." />;
  if (error === "forbidden") {
    return <ErrorState description="Tu sesión no tiene permiso para consultar las cuentas de personal." title="Acceso denegado" />;
  }
  if (error === "service") {
    return <ErrorState description="No se pudieron consultar las cuentas. Ningún fallo de carga se presenta como cero." onRetry={() => void load()} title="No se pudo cargar el resumen" />;
  }
  if (!summary?.total) {
    return <EmptyState description="Todavía no existen cuentas de personal." title="Sin cuentas de personal" />;
  }

  return <section aria-label="Indicadores de cuentas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <MetricCard detail="Total de cuentas de personal." label="Cuentas de personal" value={String(summary.total)} />
    <MetricCard detail="Cuentas habilitadas actualmente." label="Cuentas activas" tone="pistacho" value={String(summary.active)} />
    <MetricCard detail="Roles que tienen al menos una cuenta configurada." label="Roles presentes" tone="crema" value={String(summary.rolesPresent)} />
    <MetricCard detail="Cuentas MEDICO que aún requieren vinculación." label="Vinculaciones pendientes" tone="rosa" value={String(summary.pendingLinks)} />
  </section>;
}
