import { z } from "zod";

export const consultationSchema = z.object({
  patient: z.string().trim().min(3, "Selecciona un paciente ficticio."),
  reason: z.string().trim().min(5, "Describe el motivo de consulta."),
  symptoms: z.string().trim().min(5, "Describe síntomas ficticios."),
  diagnosis: z.string().trim().min(5, "Ingresa un diagnóstico ficticio."),
  observations: z.string().trim().min(5, "Agrega observaciones ficticias."),
  nextCheckup: z.string().min(1, "Selecciona la fecha del próximo chequeo."),
});
export type ConsultationFormValues = z.infer<typeof consultationSchema>;
