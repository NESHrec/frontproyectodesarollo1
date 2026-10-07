import { z } from "zod";

export const internalUserSchema = z.object({
  name: z.string().trim().min(5, "Ingresa un nombre completo ficticio."),
  email: z.string().trim().email("Ingresa un correo válido."),
  role: z.enum(["recepcion", "medico", "odontologo", "admin"]),
});

export const specialtySchema = z.object({
  name: z.string().trim().min(3, "Ingresa el nombre de la especialidad."),
  description: z.string().trim().min(10, "Agrega una descripción de al menos 10 caracteres."),
});

export type InternalUserFormValues = z.infer<typeof internalUserSchema>;
export type SpecialtyFormValues = z.infer<typeof specialtySchema>;

export const auditEventPageSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    actorAccountId: z.string(),
    actorType: z.enum(["PERSONAL", "PACIENTE"]),
    actorRole: z.string(),
    action: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    occurredAt: z.string(),
  })),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  hasNext: z.boolean(),
});

export type AuditEvent = z.infer<typeof auditEventPageSchema>["items"][number];
