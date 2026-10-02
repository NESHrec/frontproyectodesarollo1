import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().trim().min(5, "Ingresa un nombre completo ficticio."),
  phone: z.string().trim().min(8, "Ingresa un teléfono válido."),
  email: z.string().trim().email("Ingresa un correo válido."),
  birthDate: z.string().min(1, "Selecciona una fecha ficticia."),
  contactPreference: z.enum(["telefono", "correo"]),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const administrativePatientSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa el nombre completo."),
  phone: z.string().trim().min(7, "Ingresa un teléfono válido."),
  email: z.union([z.literal(""), z.string().trim().email("Ingresa un correo válido.")]),
});

export type AdministrativePatientFormValues = z.infer<typeof administrativePatientSchema>;
