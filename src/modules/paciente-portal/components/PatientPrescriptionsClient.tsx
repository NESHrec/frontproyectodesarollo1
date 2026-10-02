"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { patientPrescriptionsSchema, type PatientPrescription } from "@/modules/paciente-portal/prescription-schemas";
import { Card, EmptyState, ErrorState, LoadingState, ModalDialog, buttonLinkClasses } from "@/shared/components";
import { SectionTitle } from "@/modules/paciente-portal/components/PatientPortalHeader";

type LoadError = "expired" | "service" | null;

const dateTimeFormatter = new Intl.DateTimeFormat("es-GT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Guatemala",
});

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function PatientPrescriptionsClient() {
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[] | null>(null);
  const [error, setError] = useState<LoadError>(null);

  const load = useCallback(async () => {
    setPrescriptions(null);
    setError(null);
    const response = await fetch("/api/patient/prescriptions", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    const parsed = patientPrescriptionsSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setPrescriptions(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  if (prescriptions === null && !error) return <LoadingState message="Consultando tus recetas..." />;
  if (error === "expired") {
    return <EmptyState action={<Link className={buttonLinkClasses} href="/iniciar-sesion?next=/paciente/recetas&sesion=expirada">Iniciar sesión nuevamente</Link>} description="Tu sesión terminó. Inicia sesión nuevamente para consultar tus recetas." title="Sesión vencida" />;
  }
  if (error === "service") {
    return <ErrorState description="No pudimos consultar tus recetas. Intenta nuevamente cuando el servicio esté disponible." onRetry={() => void load()} title="Recetas no disponibles" />;
  }
  if (!prescriptions?.length) {
    return <EmptyState description="No hay atenciones con medicamentos recetados para tu cuenta." title="Aún no tienes recetas" />;
  }

  return <section className="space-y-4">
    <SectionTitle title={`${prescriptions.length} ${prescriptions.length === 1 ? "receta" : "recetas"}`} />
    <div className="grid gap-5 lg:grid-cols-2">
      {prescriptions.map((prescription) => <Card className="flex flex-col justify-between" key={prescription.id}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#62727B]/65">Emitida {formatDateTime(prescription.issuedAt)}</p>
          <h2 className="mt-3 text-xl font-bold text-[#62727B]">{prescription.practitionerName}</h2>
          <p className="mt-1 text-sm text-[#62727B]/75">Cita del {formatDateTime(prescription.appointmentScheduledAt)}</p>
          <ul className="mt-5 space-y-2">{prescription.items.map((item) => <li className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm text-[#62727B]" key={item.id}><span className="font-bold">{item.medicine}</span> · {item.dose}</li>)}</ul>
        </div>
        <ModalDialog description={`Emitida por ${prescription.practitionerName} el ${formatDateTime(prescription.issuedAt)}`} title="Detalle de receta" triggerLabel="Ver detalle" triggerVariant="ghost">
          <div className="space-y-4">{prescription.items.map((item) => <div className="rounded-md border border-[#62727B]/10 p-4" key={item.id}>
            <h3 className="font-bold text-[#62727B]">{item.medicine} · {item.dose}</h3>
            <dl className="mt-3 grid gap-2 text-sm text-[#62727B]/75 sm:grid-cols-2"><div><dt className="font-semibold">Frecuencia</dt><dd>{item.frequency}</dd></div><div><dt className="font-semibold">Duración</dt><dd>{item.duration}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">Indicaciones</dt><dd>{item.instructions ?? "Sin indicaciones adicionales"}</dd></div></dl>
          </div>)}</div>
        </ModalDialog>
      </Card>)}
    </div>
  </section>;
}
