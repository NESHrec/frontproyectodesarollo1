"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, DateTimePicker, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { appointmentSchema, type AppointmentFormValues } from "@/modules/agenda-citas/schemas";

export function AppointmentForm({ mode = "create" }: { mode?: "create" | "reschedule" }) {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { patient: mode === "reschedule" ? "María Fernanda Solís" : "", doctor: "", date: "2026-09-18", time: "09:00", reason: "" },
  });

  function onSubmit() {
    setMessage(mode === "create" ? "Cita validada visualmente. No se guardó ningún registro." : "Reprogramación simulada. La agenda original no fue modificada.");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input error={errors.patient?.message} label="Paciente ficticio" placeholder="Nombre completo" {...register("patient")} />
      <SelectField error={errors.doctor?.message} label="Profesional" {...register("doctor")}>
        <option value="">Seleccionar</option><option>Dra. Sofía Alvarado</option><option>Dr. Mateo Castillo</option><option>Dra. Valeria Méndez</option><option>Dra. Elena Rojas</option>
      </SelectField>
      <DateTimePicker dateError={errors.date?.message} dateProps={register("date")} timeError={errors.time?.message} timeProps={register("time")} />
      <TextareaField error={errors.reason?.message} label="Motivo administrativo" rows={3} {...register("reason")} />
      <Button disabled={isSubmitting} type="submit">{mode === "create" ? "Validar registro de cita" : "Validar reprogramación"}</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
