"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, Input, SimulatedFormNotice } from "@/shared/components";
import { patientProfileSchema, type PatientProfileFormValues } from "../schemas";
import type { PatientProfile } from "../models";

export function PatientProfileForm({ patient }: { patient: PatientProfile }) {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: { name: patient.name, lastName: patient.lastName, phone: patient.phone, email: patient.email, address: patient.address, emergencyContact: patient.emergencyContact },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(() => setMessage("Datos validados visualmente. No se guardaron cambios."))}>
      <Card className="grid gap-5 sm:grid-cols-2">
        <Input error={errors.name?.message} label="Nombre ficticio" {...register("name")} />
        <Input error={errors.lastName?.message} label="Apellido ficticio" {...register("lastName")} />
        <Input error={errors.phone?.message} label="Teléfono de demostración" type="tel" {...register("phone")} />
        <Input error={errors.email?.message} label="Correo de demostración" type="email" {...register("email")} />
        <Input className="sm:col-span-2" error={errors.address?.message} label="Dirección ficticia" {...register("address")} />
        <Input className="sm:col-span-2" error={errors.emergencyContact?.message} label="Contacto de emergencia ficticio" {...register("emergencyContact")} />
      </Card>
      <div className="flex flex-wrap items-center gap-4"><Button disabled={isSubmitting} type="submit">Validar datos visuales</Button>{message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}</div>
      <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm text-[#62727B]">Los datos clínicos de referencia son ficticios y de solo lectura. Esta pantalla no tiene sesión ni persistencia.</p>
    </form>
  );
}
