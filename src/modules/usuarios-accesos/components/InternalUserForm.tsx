"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice } from "@/shared/components";
import { internalUserSchema, type InternalUserFormValues } from "@/modules/usuarios-accesos/schemas";

export function InternalUserForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<InternalUserFormValues>({ resolver: zodResolver(internalUserSchema), defaultValues: { name: "", email: "", role: "recepcion" } });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(() => setMessage("Alta de usuario validada visualmente. No se creó ninguna cuenta."))}>
      <Input error={errors.name?.message} label="Nombre completo ficticio" {...register("name")} />
      <Input error={errors.email?.message} label="Correo institucional ficticio" type="email" {...register("email")} />
      <SelectField error={errors.role?.message} label="Rol visual" {...register("role")}><option value="recepcion">Recepción</option><option value="medico">Médico</option><option value="odontologo">Odontólogo</option><option value="admin">Administrador</option></SelectField>
      <Button type="submit">Validar alta visual</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
