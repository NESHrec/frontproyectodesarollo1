"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { patientCheckupsSchema, type PatientCheckup } from "@/modules/paciente-portal/checkup-schemas";
import { Card, EmptyState, ErrorState, LoadingState, buttonLinkClasses } from "@/shared/components";
import { SectionTitle } from "@/modules/paciente-portal/components/PatientPortalHeader";

type LoadError = "expired" | "forbidden" | "service" | null;

const dateTimeFormatter = new Intl.DateTimeFormat("es-GT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Guatemala",
});

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function PatientCheckupsClient() {
  const [checkups, setCheckups] = useState<PatientCheckup[] | null>(null);
  const [error, setError] = useState<LoadError>(null);

  const load = useCallback(async () => {
    setCheckups(null);
    setError(null);
    const response = await fetch("/api/patient/checkups", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    if (response.status === 403) { setError("forbidden"); return; }
    const parsed = patientCheckupsSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setCheckups(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  if (checkups === null && !error) return <LoadingState message="Consultando tu seguimiento clínico..." />;
  if (error === "expired") {
    return <EmptyState action={<Link className={buttonLinkClasses} href="/iniciar-sesion?next=/paciente/chequeos&sesion=expirada">Iniciar sesión nuevamente</Link>} description="Tu sesión terminó. Inicia sesión nuevamente para consultar tu seguimiento." title="Sesión vencida" />;
  }
  if (error === "forbidden") return <ErrorState description="Tu sesión no tiene permiso para consultar este seguimiento." title="Acceso denegado" />;
  if (error === "service" || !checkups) return <ErrorState description="No pudimos consultar tu seguimiento clínico. Intenta nuevamente cuando el servicio esté disponible." onRetry={() => void load()} title="Seguimiento no disponible" />;
  if (checkups.length === 0) return <EmptyState description="No hay seguimiento clínico registrado actualmente." title="Sin seguimiento clínico" />;

  return <section className="space-y-4">
    <SectionTitle title={`${checkups.length} ${checkups.length === 1 ? "atención clínica" : "atenciones clínicas"}`} />
    <div className="space-y-5">
      {checkups.map((checkup) => <Card key={checkup.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-[#62727B]/65">Registrada {formatDateTime(checkup.recordedAt)}</p><h2 className="mt-3 text-xl font-bold text-[#62727B]">{checkup.practitionerName}</h2></div>
          <p className="text-sm text-[#62727B]/75">Cita: {formatDateTime(checkup.appointmentScheduledAt)}</p>
        </div>
        <dl className="mt-5 grid gap-4 text-sm text-[#62727B] sm:grid-cols-2">
          <div><dt className="font-semibold">Motivo de consulta</dt><dd className="mt-1 whitespace-pre-wrap">{checkup.reason}</dd></div>
          <div><dt className="font-semibold">Diagnóstico</dt><dd className="mt-1 whitespace-pre-wrap">{checkup.diagnosis}</dd></div>
          {checkup.findings ? <div><dt className="font-semibold">Hallazgos</dt><dd className="mt-1 whitespace-pre-wrap">{checkup.findings}</dd></div> : null}
          {checkup.treatmentPlan ? <div><dt className="font-semibold">Plan de tratamiento</dt><dd className="mt-1 whitespace-pre-wrap">{checkup.treatmentPlan}</dd></div> : null}
        </dl>
        {checkup.prescription.length > 0 ? <div className="mt-5 border-t border-[#62727B]/10 pt-5"><h3 className="font-semibold text-[#62727B]">Medicamentos registrados</h3><ul className="mt-3 space-y-2">{checkup.prescription.map((item) => <li className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm text-[#62727B]" key={item.id}><span className="font-bold">{item.medicine}</span> · {item.dose} · {item.frequency} · {item.duration}{item.instructions ? ` · ${item.instructions}` : ""}</li>)}</ul></div> : null}
      </Card>)}
    </div>
  </section>;
}
