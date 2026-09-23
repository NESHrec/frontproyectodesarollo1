"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice, TextareaField } from "@/shared/components";
import { specialtySchema, type SpecialtyFormValues } from "@/modules/usuarios-accesos/schemas";

export function SpecialtyForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<SpecialtyFormValues>({ resolver: zodResolver(specialtySchema), defaultValues: { name: "", category: "medica", description: "" } });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(() => setMessage("Especialidad validada visualmente. El catálogo no fue modificado."))}>
      <Input error={errors.name?.message} label="Nombre" {...register("name")} />
      <SelectField error={errors.category?.message} label="Categoría" {...register("category")}><option value="medica">Médica</option><option value="odontologica">Odontológica</option></SelectField>
      <TextareaField error={errors.description?.message} label="Descripción" rows={3} {...register("description")} />
      <Button type="submit">Validar especialidad</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
