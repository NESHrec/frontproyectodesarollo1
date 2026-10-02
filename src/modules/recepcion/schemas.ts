import { z } from "zod";

export const receptionAppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  practitionerId: z.string(),
  specialtyId: z.string(),
  scheduledAt: z.string(),
  status: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"]),
  arrivalAt: z.string().nullable(),
  arrivalByAccountId: z.string().nullable(),
});

export const receptionAppointmentsSchema = z.array(receptionAppointmentSchema);

export type ReceptionAppointment = z.infer<typeof receptionAppointmentSchema>;
