import { z } from "zod";

export const patientAppointmentSchema = z.object({
  specialtyId: z.string().min(1, "Selecciona una especialidad."),
  professionalId: z.string().min(1, "Selecciona un profesional."),
  slotId: z.string().min(1, "Selecciona un horario."),
});

export const patientProfileSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre."),
  lastName: z.string().trim().min(2, "Escribe tu apellido."),
  phone: z.string().regex(/^\d{4}-?\d{4}$/, "Usa un teléfono de 8 dígitos."),
  email: z.string().trim().email("Ingresa un correo válido."),
  address: z.string().trim().min(8, "Escribe una dirección más completa."),
  emergencyContact: z.string().trim().min(5, "Indica un contacto de demostración."),
});

export type PatientAppointmentFormValues = z.infer<typeof patientAppointmentSchema>;
export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;
