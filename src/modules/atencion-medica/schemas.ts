import { z } from "zod";

const nullableText = z.string().nullable().optional().transform((value) => value ?? null);
const appointmentStatus = z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"]);

export const medicalAppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: nullableText,
  practitionerId: z.string(),
  specialtyId: z.string(),
  specialtyName: z.string(),
  scheduledAt: z.string(),
  status: appointmentStatus,
  notes: nullableText,
  arrivalAt: nullableText,
  attentionRecorded: z.boolean(),
  canRecordAttention: z.boolean(),
  attentionBlockers: z.array(z.enum(["ATTENTION_ALREADY_RECORDED", "STATUS_NOT_DOCUMENTABLE", "NOT_STARTED", "ARRIVAL_NOT_REGISTERED"])),
});

export const attentionSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  appointmentScheduledAt: nullableText,
  practitionerId: z.string(),
  practitionerName: nullableText,
  authorAccountId: z.string(),
  authorName: nullableText,
  reason: z.string(),
  findings: nullableText,
  diagnosis: z.string(),
  treatmentPlan: nullableText,
  recordedAt: z.string(),
  prescription: z.array(z.object({
    order: z.number(),
    medicine: z.string(),
    dose: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: nullableText,
  })),
});

export const medicalAppointmentsSchema = z.array(medicalAppointmentSchema);

export const medicalAppointmentDetailSchema = z.object({
  appointment: medicalAppointmentSchema,
  attention: attentionSchema.nullable(),
});

export const clinicalRecordSchema = z.object({
  patient: z.object({
    id: z.string(),
    fullName: nullableText,
    status: z.string(),
    registeredAt: z.string(),
  }),
  recordId: nullableText,
  recordCreatedAt: nullableText,
  attentions: z.array(attentionSchema),
});

export const staffAccountSchema = z.object({
  accountId: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: z.enum(["ADMIN", "RECEPCION", "MEDICO"]),
  status: z.enum(["ACTIVA", "BLOQUEADA"]),
  practitionerLinkStatus: z.enum(["VINCULADA", "PENDIENTE_VINCULACION", "NO_APLICA"]),
  practitionerId: nullableText,
  practitionerName: nullableText,
  practitionerLinkedAt: nullableText,
});

export const staffAccountsSchema = z.array(staffAccountSchema);

export type MedicalAppointment = z.infer<typeof medicalAppointmentSchema>;
export type MedicalAppointmentDetail = z.infer<typeof medicalAppointmentDetailSchema>;
export type Attention = z.infer<typeof attentionSchema>;
export type ClinicalRecord = z.infer<typeof clinicalRecordSchema>;
export type StaffAccount = z.infer<typeof staffAccountSchema>;
