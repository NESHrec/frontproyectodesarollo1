"use client";

import { useCallback, useEffect, useState } from "react";

import { staffAccountsSchema, type StaffAccount } from "@/modules/atencion-medica/schemas";
import { EmptyState, ErrorState, LoadingState, MetricCard } from "@/shared/components";

type LoadError = "forbidden" | "service" | null;

export function AdminAccountsSummaryClient() {
  const [accounts, setAccounts] = useState<StaffAccount[] | null>(null);
  const [error, setError] = useState<LoadError>(null);

  const load = useCallback(async () => {
    setAccounts(null);
    setError(null);
    const response = await fetch("/api/staff/accounts", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    const parsed = staffAccountsSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setAccounts(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  if (accounts === null && !error) return <LoadingState message="Consultando cuentas de personal..." />;
  if (error === "forbidden") {
    return <ErrorState description="Tu sesión no tiene permiso para consultar las cuentas de personal." title="Acceso denegado" />;
  }
  if (error === "service") {
    return <ErrorState description="No se pudieron consultar las cuentas. Ningún fallo de carga se presenta como cero." onRetry={() => void load()} title="No se pudo cargar el resumen" />;
  }
  if (!accounts?.length) {
    return <EmptyState description="El backend respondió correctamente y no existen cuentas de personal." title="Sin cuentas de personal" />;
  }

  const active = accounts.filter((account) => account.status === "ACTIVA").length;
  const roles = new Set(accounts.map((account) => account.role)).size;
  const pendingLinks = accounts.filter((account) =>
    account.role === "MEDICO" && account.practitionerLinkStatus === "PENDIENTE_VINCULACION"
  ).length;

  return <section aria-label="Indicadores de cuentas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricCard detail="Lista completa de GET /staff/accounts, sin paginación." label="Cuentas de personal" value={String(accounts.length)} />
    <MetricCard detail="Cuentas con estado ACTIVA en el backend." label="Cuentas activas" tone="pistacho" value={String(active)} />
    <MetricCard detail="Roles que tienen al menos una cuenta configurada." label="Roles presentes" tone="crema" value={String(roles)} />
    <MetricCard detail="Cuentas MEDICO que aún requieren vinculación." label="Vinculaciones pendientes" tone="rosa" value={String(pendingLinks)} />
  </section>;
}
