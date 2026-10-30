import { z } from "zod";

export const dentalObservationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  appointmentId: z.string(),
  practitionerId: z.string(),
  recordedByAccountId: z.string(),
  toothNumber: z.number(),
  surface: z.string().nullable(),
  observation: z.string(),
  recordedAt: z.string(),
});

export const dentalObservationPageSchema = z.object({
  patientId: z.string(),
  patientName: z.string().nullable(),
  observations: z.array(dentalObservationSchema),
});

export type DentalObservation = z.infer<typeof dentalObservationSchema>;
export type DentalObservationPage = z.infer<typeof dentalObservationPageSchema>;
