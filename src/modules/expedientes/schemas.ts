import { z } from "zod";

import { MAX_PRESCRIPTION_ITEMS, prescriptionItemSchema } from "@/modules/recetas/schemas";

/** Datos clínicos mínimos de la atención; paciente y profesional provienen de la cita. */
export const consultationSchema = z.object({
  reason: z.string().trim().min(3, "Describe el motivo de consulta.").max(1000, "Máximo 1000 caracteres."),
  findings: z.string().trim().max(2000, "Máximo 2000 caracteres."),
  diagnosis: z.string().trim().min(3, "Ingresa el diagnóstico.").max(1000, "Máximo 1000 caracteres."),
  treatmentPlan: z.string().trim().max(2000, "Máximo 2000 caracteres."),
  prescription: z.array(prescriptionItemSchema).max(MAX_PRESCRIPTION_ITEMS, `Máximo ${MAX_PRESCRIPTION_ITEMS} medicamentos.`),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;
