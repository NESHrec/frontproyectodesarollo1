import { z } from "zod";

export const patientCheckupPrescriptionItemSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1).max(10),
  medicine: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().nullable(),
});

export const patientCheckupSchema = z.object({
  id: z.string().min(1),
  appointmentId: z.string().min(1),
  appointmentScheduledAt: z.iso.datetime({ offset: true }),
  recordedAt: z.iso.datetime({ offset: true }),
  practitionerId: z.string().min(1),
  practitionerName: z.string().min(1),
  reason: z.string().min(1),
  findings: z.string().nullable(),
  diagnosis: z.string().min(1),
  treatmentPlan: z.string().nullable(),
  prescription: z.array(patientCheckupPrescriptionItemSchema),
});

export const patientCheckupsSchema = z.array(patientCheckupSchema);

export type PatientCheckup = z.infer<typeof patientCheckupSchema>;
