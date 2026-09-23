"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { prescriptionSchema, type PrescriptionFormValues } from "@/modules/recetas/schemas";

export function PrescriptionForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<PrescriptionFormValues>({ resolver: zodResolver(prescriptionSchema), defaultValues: { patient: "", medicine: "", dose: "", frequency: "", duration: "", instructions: "" } });
  return (
    <form className="grid gap-4" onSubmit={handleSubmit(() => setMessage("Receta validada visualmente. No se firmó, envió ni almacenó."))}>
      <SelectField error={errors.patient?.message} label="Paciente ficticio" {...register("patient")}><option value="">Seleccionar</option><option>Ana Lucía Prado</option><option>María Fernanda Solís</option><option>Sofía Isabel Ríos</option></SelectField>
      <Input error={errors.medicine?.message} label="Medicamento ficticio" {...register("medicine")} />
      <div className="grid gap-4 md:grid-cols-3"><Input error={errors.dose?.message} label="Dosis" {...register("dose")} /><Input error={errors.frequency?.message} label="Frecuencia" {...register("frequency")} /><Input error={errors.duration?.message} label="Duración" {...register("duration")} /></div>
      <TextareaField error={errors.instructions?.message} label="Indicaciones" rows={4} {...register("instructions")} />
      <div><Button type="submit">Validar receta visual</Button></div>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
