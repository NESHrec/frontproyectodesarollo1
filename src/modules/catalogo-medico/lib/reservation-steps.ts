export type ReservationStepState = "complete" | "current" | "upcoming";

export type ReservationStep = {
  label: "Especialidad" | "Profesional" | "Horario" | "Confirmación";
  state: ReservationStepState;
};

export function getReservationSteps(professionalSelected: boolean): ReservationStep[] {
  return [
    { label: "Especialidad", state: professionalSelected ? "complete" : "upcoming" },
    { label: "Profesional", state: professionalSelected ? "complete" : "current" },
    { label: "Horario", state: professionalSelected ? "current" : "upcoming" },
    { label: "Confirmación", state: "upcoming" },
  ];
}
