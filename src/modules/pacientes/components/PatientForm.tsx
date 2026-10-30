"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/shared/components";
import { administrativePatientSchema, type AdministrativePatientFormValues } from "@/modules/pacientes/schemas";
import { getCsrfToken } from "@/modules/auth/csrf-client";

type SavedPatient = {
  patientId: string;
  fullName: string;
  phone: string;
  email: string | null;
  recordType: string;
  patientAccountLinked: boolean;
  createdAt: string;
};

export function PatientForm({ onSaved }: { onSaved?: (patient: SavedPatient) => void }) {
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdministrativePatientFormValues>({ resolver: zodResolver(administrativePatientSchema), defaultValues: { fullName: "", phone: "", email: "" } });

  async function submit(values: AdministrativePatientFormValues) {
    setMessage(null);
    try {
      const response = await fetch("/api/staff/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": await getCsrfToken() },
        body: JSON.stringify(values),
      });
      if (response.status === 409) {
        setMessage({ tone: "error", text: "Ya existe un registro con esos datos o el correo requiere una vinculación autorizada." });
        return;
      }
      if (response.status === 400) {
        setMessage({ tone: "error", text: "Revisa los datos ingresados." });
        return;
      }
      if (!response.ok) {
        setMessage({ tone: "error", text: "No se pudo guardar el expediente administrativo." });
        return;
      }
      const saved = await response.json() as SavedPatient;
      reset();
      onSaved?.(saved);
      setMessage({ tone: "ok", text: "Expediente administrativo guardado. No se creó una cuenta ni una contraseña." });
    } catch {
      setMessage({ tone: "error", text: "El servicio no está disponible. Intenta nuevamente." });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <p className="rounded-md bg-[#F8EDD2] px-3 py-2 text-sm text-[#62727B]">Este formulario crea solo un expediente administrativo. La cuenta PACIENTE y su verificación se gestionan por separado.</p>
      <Input error={errors.fullName?.message} label="Nombre completo" {...register("fullName")} />
      <div className="grid gap-4 sm:grid-cols-2"><Input error={errors.phone?.message} label="Teléfono" type="tel" {...register("phone")} /><Input error={errors.email?.message} label="Correo de contacto (opcional)" type="email" {...register("email")} /></div>
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando…" : "Guardar expediente"}</Button>
      {message ? <p className={message.tone === "ok" ? "rounded-md bg-[#E5F1D8] px-3 py-2 text-sm" : "rounded-md bg-[#F8E2E8] px-3 py-2 text-sm"} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p> : null}
    </form>
  );
}
