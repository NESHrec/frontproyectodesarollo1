"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { Button, TextareaField } from "@/shared/components";

type ProfileValues = {
  allergies: string;
  relevantConditions: string;
  currentMedications: string;
  dentalHistory: string;
};

export function ClinicalProfileForm({
  appointmentId,
  initial,
}: {
  appointmentId: string;
  initial: { allergies?: string | null; relevantConditions?: string | null; currentMedications?: string | null; dentalHistory?: string | null } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [values, setValues] = useState<ProfileValues>({
    allergies: initial?.allergies ?? "",
    relevantConditions: initial?.relevantConditions ?? "",
    currentMedications: initial?.currentMedications ?? "",
    dentalHistory: initial?.dentalHistory ?? "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/expediente/perfil`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "x-csrf-token": await getCsrfToken() },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        setMessage("No se pudo guardar la nueva versión del perfil clínico.");
        return;
      }
      setMessage("Nueva versión guardada con autor y fecha.");
      router.refresh();
    } catch {
      setMessage("El servicio no está disponible.");
    } finally {
      setBusy(false);
    }
  }

  function field(name: keyof ProfileValues, label: string) {
    return (
      <TextareaField
        disabled={busy}
        id={name}
        label={label}
        maxLength={2000}
        rows={3}
        value={values[name]}
        onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
      />
    );
  }

  return (
    <form aria-busy={busy} className="grid gap-5" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        {field("allergies", "Alergias declaradas")}
        {field("relevantConditions", "Condiciones relevantes")}
        {field("currentMedications", "Medicamentos actuales")}
        {field("dentalHistory", "Antecedentes odontológicos")}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl bg-[#DDF3F1]/35 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-5 text-[#62727B]">Registra solo información declarada o comprobada. Cada guardado crea una versión; no modifica las anteriores.</p>
        <Button disabled={busy} type="submit">{busy ? "Guardando…" : "Guardar nueva versión"}</Button>
      </div>
      {message ? <p className="rounded-xl border border-[#62727B]/10 bg-[#FBFCFA] px-4 py-3 text-sm font-semibold" role="status">{message}</p> : null}
    </form>
  );
}
