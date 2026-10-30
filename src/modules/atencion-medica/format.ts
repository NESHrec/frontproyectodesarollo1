import type { MedicalAppointment } from "@/modules/atencion-medica/schemas";

const TIME_ZONE = "America/Guatemala";

export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE })
    .format(new Date(value));
}

export const appointmentStatusLabel: Record<MedicalAppointment["status"], string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
};

export function appointmentStatusTone(status: MedicalAppointment["status"]) {
  if (status === "COMPLETADA") return "pistacho" as const;
  if (status === "CANCELADA") return "rosa" as const;
  return "agua" as const;
}

/** Explicación de las reglas del servidor que impiden documentar una cita; la UI solo informa. */
export const attentionBlockerMessage: Record<MedicalAppointment["attentionBlockers"][number], string> = {
  ATTENTION_ALREADY_RECORDED: "La cita ya tiene una atención registrada.",
  STATUS_NOT_DOCUMENTABLE: "La cita está cancelada o completada.",
  NOT_STARTED: "La hora programada de la cita aún no comienza.",
  ARRIVAL_NOT_REGISTERED: "Recepción aún no registra la llegada del paciente.",
};

export function patientLabel(appointment: Pick<MedicalAppointment, "patientName">) {
  return appointment.patientName ?? "Paciente sin nombre registrado";
}
