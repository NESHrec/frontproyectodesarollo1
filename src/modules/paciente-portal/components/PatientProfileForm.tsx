"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, buttonLinkClasses } from "@/shared/components";
import { patientProfileResponseSchema, patientProfileSchema, type PatientProfileFormValues } from "../schemas";

type LoadError = "expired" | "forbidden" | "service" | null;

const dateTimeFormatter = new Intl.DateTimeFormat("es-GT", {
  dateStyle: "long",
  timeZone: "America/Guatemala",
});

export function PatientProfileForm() {
  const [profile, setProfile] = useState<ReturnType<typeof patientProfileResponseSchema.parse> | null>(null);
  const [error, setError] = useState<LoadError>(null);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: { fullName: "" },
  });

  const load = useCallback(async () => {
    setProfile(null);
    setError(null);
    setMessage("");
    const response = await fetch("/api/patient/profile", { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    if (response.status === 403) { setError("forbidden"); return; }
    const parsed = patientProfileResponseSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setError("service"); return; }
    setProfile(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function onSubmit(values: PatientProfileFormValues) {
    setMessage("");
    try {
      const csrfResponse = await fetch("/api/session/csrf", { cache: "no-store" });
      const csrfPayload = await csrfResponse.json().catch(() => null) as { csrfToken?: unknown } | null;
      if (!csrfResponse.ok || typeof csrfPayload?.csrfToken !== "string") { setError("service"); return; }
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfPayload.csrfToken },
        body: JSON.stringify(values),
      });
      if (response.status === 401) { setError("expired"); return; }
      if (response.status === 403) { setError("forbidden"); return; }
      if (response.status === 400) { setMessage("Revisa el nombre completo e inténtalo nuevamente."); return; }
      const parsed = patientProfileResponseSchema.safeParse(await response.json().catch(() => null));
      if (!response.ok || !parsed.success) { setError("service"); return; }
      setProfile(parsed.data);
      setMessage("Tu nombre completo se guardó correctamente.");
    } catch {
      setError("service");
    }
  }

  if (profile === null && !error) return <LoadingState message="Consultando tu perfil..." />;
  if (error === "expired") {
    return <EmptyState action={<Link className={buttonLinkClasses} href="/iniciar-sesion?next=/paciente/perfil&sesion=expirada">Iniciar sesión nuevamente</Link>} description="Tu sesión terminó. Inicia sesión nuevamente para consultar tu perfil." title="Sesión vencida" />;
  }
  if (error === "forbidden") return <ErrorState description="Tu sesión no tiene permiso para consultar este perfil." title="Acceso denegado" />;
  if (error === "service" || !profile) return <ErrorState description="No pudimos consultar tu perfil. Intenta nuevamente cuando el servicio esté disponible." onRetry={() => void load()} title="Perfil no disponible" />;

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card className="space-y-5">
        <Input error={errors.fullName?.message} helperText="Es el único dato personal editable en esta fase." label="Nombre completo" {...register("fullName")} defaultValue={profile.fullName ?? ""} />
        <Input helperText="El correo requiere un proceso adicional de verificación y no puede cambiarse aquí." label="Correo asociado a tu cuenta" readOnly value={profile.email} type="email" />
        <dl className="grid gap-4 rounded-md bg-[#DDF3F1] p-4 text-sm text-[#62727B] sm:grid-cols-2">
          <div><dt className="font-semibold">Estado de la cuenta</dt><dd className="mt-1">{profile.accountStatus}</dd></div>
          <div><dt className="font-semibold">Cuenta registrada</dt><dd className="mt-1">{dateTimeFormatter.format(new Date(profile.registeredAt))}</dd></div>
        </dl>
      </Card>
      <div className="flex flex-wrap items-center gap-4"><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando…" : "Guardar cambios"}</Button>{message ? <p aria-live="polite" className="rounded-md bg-[#DDF3F1] px-4 py-3 text-sm text-[#62727B]" role="status">{message}</p> : null}</div>
      <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm text-[#62727B]">El correo asociado a tu cuenta no puede modificarse desde esta pantalla porque requiere un proceso adicional de verificación.</p>
    </form>
  );
}
