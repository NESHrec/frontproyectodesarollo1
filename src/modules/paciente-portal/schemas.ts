import { z } from "zod";

export const patientAppointmentSchema = z.object({
  specialtyId: z.string().min(1, "Selecciona una especialidad."),
  professionalId: z.string().min(1, "Selecciona un profesional."),
  slotId: z.string().min(1, "Selecciona un horario."),
});

export const patientProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo.").max(160, "El nombre completo es demasiado largo."),
});

export const patientProfileResponseSchema = z.object({
  patientId: z.string().min(1),
  fullName: z.string().nullable(),
  email: z.string().email(),
  accountStatus: z.string().min(1),
  registeredAt: z.iso.datetime({ offset: true }),
});

export const patientProfileUpdateSchema = patientProfileSchema.strict();

export type PatientAppointmentFormValues = z.infer<typeof patientAppointmentSchema>;
export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;
