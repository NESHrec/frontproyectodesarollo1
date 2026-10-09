"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, TextareaField } from "@/shared/components";
import { getCsrfToken } from "@/modules/auth/csrf-client";
import { specialtySchema, type SpecialtyFormValues } from "@/modules/usuarios-accesos/schemas";

type SpecialtyFormProps = {
  specialty?: { id: string; name: string; description: string };
  onSaved: () => void;
};

export function SpecialtyForm({ specialty, onSaved }: SpecialtyFormProps) {
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtySchema),
    defaultValues: { name: specialty?.name ?? "", description: specialty?.description ?? "" },
  });

  async function submit(values: SpecialtyFormValues) {
    setMessage(null);
    try {
      const csrf = await getCsrfToken();
      const response = await fetch(specialty ? `/api/staff/specialties/${encodeURIComponent(specialty.id)}` : "/api/staff/specialties", {
        method: specialty ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ name: values.name, description: values.description }),
      });
      if (response.ok) {
        setMessage({ tone: "success", text: specialty ? "Especialidad actualizada correctamente." : "Especialidad creada correctamente." });
        onSaved();
        return;
      }
      const body = await response.json().catch(() => null) as { reason?: string; code?: string } | null;
      setMessage({ tone: "error", text: response.status === 400 ? "Revisa el nombre y la descripción." : response.status === 401 ? "Tu sesión ADMIN expiró." : response.status === 403 ? "Solo una sesión ADMIN puede modificar especialidades." : response.status === 409 || body?.code === "SPECIALTY_DUPLICATE" ? "Ya existe una especialidad con ese nombre." : "No se pudo guardar la especialidad." });
    } catch {
      setMessage({ tone: "error", text: "No se pudo conectar con el servicio." });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <Input error={errors.name?.message} label="Nombre" {...register("name")} />
      <TextareaField error={errors.description?.message} label="Descripción" rows={3} {...register("description")} />
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando…" : specialty ? "Guardar cambios" : "Crear especialidad"}</Button>
      {message ? <p aria-live="assertive" className={`rounded-lg border px-4 py-4 text-sm font-bold shadow-sm ${message.tone === "success" ? "border-[#7AA274] bg-[#E5F1D8] text-[#334B54]" : "border-[#B96B7E] bg-[#F8E2E8]"}`} role="status">{message.tone === "success" ? "✓ " : ""}{message.text}</p> : null}
    </form>
  );
}
