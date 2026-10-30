"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField, SimulatedFormNotice } from "@/shared/components";
import { paymentSchema, type PaymentFormValues } from "@/modules/pagos/schemas";

export function PaymentForm() {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema), defaultValues: { patient: "", amount: 0, method: "efectivo", reference: "" } });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(() => setMessage("Cobro validado y comprobante simulado preparado. No hubo transacción real."))}>
      <Input error={errors.patient?.message} label="Paciente ficticio" {...register("patient")} />
      <Input error={errors.amount?.message} label="Monto (GTQ)" min="0" step="0.01" type="number" {...register("amount", { valueAsNumber: true })} />
      <SelectField error={errors.method?.message} label="Método de pago" {...register("method")}><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option></SelectField>
      <Input error={errors.reference?.message} label="Referencia simulada" {...register("reference")} />
      <Button type="submit">Validar cobro visual</Button>
      {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
    </form>
  );
}
