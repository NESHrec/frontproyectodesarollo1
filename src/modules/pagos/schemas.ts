import { z } from "zod";

export const paymentSchema = z.object({
  patient: z.string().trim().min(3, "Indica un paciente ficticio."),
  amount: z.number().positive("El monto debe ser mayor que cero."),
  method: z.enum(["efectivo", "tarjeta", "transferencia"]),
  reference: z.string().trim().min(3, "Agrega una referencia simulada."),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;
