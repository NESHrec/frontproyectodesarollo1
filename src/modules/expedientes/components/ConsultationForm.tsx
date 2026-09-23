"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { consultationSchema, type ConsultationFormValues } from "@/modules/expedientes/schemas";

export function ConsultationForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<ConsultationFormValues>({ resolver: zodResolver(consultationSchema), defaultValues: { patient: "", reason: "", symptoms: "", diagnosis: "", observations: "", nextCheckup: "2026-10-16" } });
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(() => setMessage("Consulta validada visualmente. Ningún dato clínico fue almacenado."))}>
      <SelectField error={errors.patient?.message} label="Paciente ficticio" {...register("patient")}><option value="">Seleccionar</option><option value="pac-001">Ana Lucía Prado</option><option value="pac-003">María Fernanda Solís</option><option value="pac-005">Sofía Isabel Ríos</option></SelectField>
      <TextareaField error={errors.reason?.message} label="Motivo de consulta" rows={3} {...register("reason")} />
      <TextareaField error={errors.symptoms?.message} label="Síntomas ficticios" rows={3} {...register("symptoms")} />
      <TextareaField error={errors.diagnosis?.message} label="Diagnóstico ficticio" rows={3} {...register("diagnosis")} />
      <TextareaField error={errors.observations?.message} label="Observaciones" rows={4} {...register("observations")} />
      <Input error={errors.nextCheckup?.message} label="Próximo chequeo" type="date" {...register("nextCheckup")} />
      <div><Button type="submit">Validar consulta visual</Button></div>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
