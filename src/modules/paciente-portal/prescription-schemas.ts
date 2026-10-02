import { z } from "zod";

export const patientPrescriptionItemSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1).max(10),
  medicine: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().nullable(),
});

export const patientPrescriptionSchema = z.object({
  id: z.string().min(1),
  appointmentId: z.string().min(1),
  appointmentScheduledAt: z.iso.datetime({ offset: true }),
  issuedAt: z.iso.datetime({ offset: true }),
  practitionerId: z.string().min(1),
  practitionerName: z.string().min(1),
  items: z.array(patientPrescriptionItemSchema).min(1),
});

export const patientPrescriptionsSchema = z.array(patientPrescriptionSchema);

export type PatientPrescription = z.infer<typeof patientPrescriptionSchema>;
