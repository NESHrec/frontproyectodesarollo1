import { z } from "zod";

export const appointmentSchema = z.object({
  patient: z.string().trim().min(3, "Selecciona o escribe un paciente ficticio."),
  doctor: z.string().trim().min(3, "Selecciona un profesional."),
  date: z.string().min(1, "Selecciona una fecha."),
  time: z.string().min(1, "Selecciona una hora."),
  reason: z.string().trim().min(5, "Describe brevemente el motivo."),
});

export const scheduleSchema = z.object({
  date: z.string().min(1, "Selecciona una fecha."),
  startTime: z.string().min(1, "Indica la hora inicial."),
  endTime: z.string().min(1, "Indica la hora final."),
  blockType: z.enum(["disponible", "bloqueo"]),
  note: z.string().trim().min(3, "Agrega una descripción breve."),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
