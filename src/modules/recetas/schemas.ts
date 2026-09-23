import { z } from "zod";

export const prescriptionSchema = z.object({
  patient: z.string().trim().min(3, "Selecciona un paciente ficticio."),
  medicine: z.string().trim().min(3, "Ingresa un medicamento ficticio."),
  dose: z.string().trim().min(2, "Indica una dosis ficticia."),
  frequency: z.string().trim().min(3, "Indica la frecuencia."),
  duration: z.string().trim().min(3, "Indica la duración."),
  instructions: z.string().trim().min(5, "Agrega indicaciones ficticias."),
});
export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
