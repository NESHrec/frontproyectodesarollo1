"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { scheduleSchema, type ScheduleFormValues } from "@/modules/agenda-citas/schemas";

export function ScheduleForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { date: "2026-09-21", startTime: "08:00", endTime: "12:00", blockType: "disponible", note: "Horario regular" },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(() => setMessage("Bloque horario validado. No se persistió ningún cambio."))}>
      <Input error={errors.date?.message} label="Fecha" type="date" {...register("date")} />
      <div className="grid gap-4 sm:grid-cols-2"><Input error={errors.startTime?.message} label="Desde" type="time" {...register("startTime")} /><Input error={errors.endTime?.message} label="Hasta" type="time" {...register("endTime")} /></div>
      <SelectField error={errors.blockType?.message} label="Tipo de bloque" {...register("blockType")}><option value="disponible">Disponible</option><option value="bloqueo">Bloqueo</option></SelectField>
      <TextareaField error={errors.note?.message} label="Descripción" rows={2} {...register("note")} />
      <Button type="submit">Validar bloque visual</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
