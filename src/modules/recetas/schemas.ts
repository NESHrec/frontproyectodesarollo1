import { z } from "zod";

/** Medicamento de la receta; los límites coinciden con el contrato del backend. */
export const prescriptionItemSchema = z.object({
  medicine: z.string().trim().min(2, "Indica el medicamento.").max(160, "Máximo 160 caracteres."),
  dose: z.string().trim().min(1, "Indica la dosis.").max(80, "Máximo 80 caracteres."),
  frequency: z.string().trim().min(1, "Indica la frecuencia.").max(80, "Máximo 80 caracteres."),
  duration: z.string().trim().min(1, "Indica la duración.").max(80, "Máximo 80 caracteres."),
  instructions: z.string().trim().max(500, "Máximo 500 caracteres."),
});

export const MAX_PRESCRIPTION_ITEMS = 10;

export type PrescriptionItemValues = z.infer<typeof prescriptionItemSchema>;

export const emptyPrescriptionItem: PrescriptionItemValues = {
  medicine: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
};
