"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice } from "@/shared/components";
import { patientSchema, type PatientFormValues } from "@/modules/pacientes/schemas";

export function PatientForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormValues>({ resolver: zodResolver(patientSchema), defaultValues: { name: "", phone: "", email: "", birthDate: "", contactPreference: "telefono" } });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(() => setMessage("Paciente ficticio validado. Los datos no se almacenaron."))}>
      <Input error={errors.name?.message} label="Nombre completo" {...register("name")} />
      <div className="grid gap-4 sm:grid-cols-2"><Input error={errors.phone?.message} label="Teléfono" type="tel" {...register("phone")} /><Input error={errors.email?.message} label="Correo" type="email" {...register("email")} /></div>
      <Input error={errors.birthDate?.message} label="Fecha de nacimiento" type="date" {...register("birthDate")} />
      <SelectField error={errors.contactPreference?.message} label="Contacto preferido" {...register("contactPreference")}><option value="telefono">Teléfono</option><option value="correo">Correo</option></SelectField>
      <Button type="submit">Validar paciente visual</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
