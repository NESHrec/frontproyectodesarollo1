export function medicalScheduleErrorText(status: number, code?: string) {
  if (status === 401) return "Tu sesión médica expiró.";
  if (status === 403) return "No tienes permiso sobre este bloque.";
  if (status === 404) return "El bloque ya no existe.";
  if (status === 409 && code === "SCHEDULE_BLOCK_HAS_APPOINTMENTS") {
    return "El bloque conserva una cita asociada.";
  }
  if (status === 409) return "El horario entra en conflicto o cambió simultáneamente.";
  if (status === 422 || status === 400) return "Revisa fecha, zona horaria y duración.";
  return "No se pudo completar la operación.";
}
