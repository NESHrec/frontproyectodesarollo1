"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, DateTimePicker, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { appointmentSchema, type AppointmentFormValues } from "@/modules/agenda-citas/schemas";
import type { Medico } from "@/shared/types/catalogo-medico";

type AppointmentFormProps = {
  medicos: Medico[];
  mode?: "create" | "reschedule";
};

export function AppointmentForm({ medicos, mode = "create" }: AppointmentFormProps) {
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
      <SelectField
        error={errors.doctor?.message}
        helperText="Profesionales del catálogo real; el registro de la cita continúa siendo una demostración."
        label="Profesional"
        {...register("doctor")}
      >
        <option value="">Seleccionar</option>
        {medicos.map((medico) => (
          <option key={medico.id} value={medico.id}>
            {medico.specialtyName
              ? `${medico.fullName} — ${medico.specialtyName}`
              : medico.fullName}
          </option>
        ))}
      </SelectField>
      <DateTimePicker dateError={errors.date?.message} dateProps={register("date")} timeError={errors.time?.message} timeProps={register("time")} />
      <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm text-[#62727B]">
        La fecha y la hora son datos ficticios de la demostración. Este formulario no consulta
        disponibilidad ni crea, reprograma o reserva una cita.
      </p>
      <TextareaField error={errors.reason?.message} label="Motivo administrativo" rows={3} {...register("reason")} />
      <Button disabled={isSubmitting} type="submit">{mode === "create" ? "Validar registro de cita" : "Validar reprogramación"}</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
