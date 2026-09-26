import { z } from "zod";
import type {
  BloqueDisponibilidad,
  Especialidad,
  Medico,
} from "@/shared/types/catalogo-medico";

// Campos opcionales del contrato: se aceptan ausentes o null y se normalizan a undefined.
const optionalText = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

const isoDateTime = z.iso.datetime({ offset: true });

export const especialidadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: optionalText,
}) satisfies z.ZodType<Especialidad, unknown>;

export const medicoSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  specialtyId: z.string().min(1),
  specialtyName: optionalText,
  licenseNumber: optionalText,
}) satisfies z.ZodType<Medico, unknown>;

export const bloqueDisponibilidadSchema = z.object({
  id: z.string().min(1),
  practitionerId: z.string().min(1),
  startAt: isoDateTime,
  endAt: isoDateTime,
}) satisfies z.ZodType<BloqueDisponibilidad, unknown>;

export const especialidadesResponseSchema = z.array(especialidadSchema);
export const medicosResponseSchema = z.array(medicoSchema);
export const disponibilidadResponseSchema = z.array(bloqueDisponibilidadSchema);
