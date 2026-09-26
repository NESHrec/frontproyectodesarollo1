/**
 * Tipos del catálogo público según `docs/openapi.yaml` del backend
 * (esquemas Specialty, Practitioner y AvailabilitySlot).
 */
export type Especialidad = {
  id: string;
  name: string;
  description?: string;
};

export type Medico = {
  id: string;
  fullName: string;
  specialtyId: string;
  specialtyName?: string;
  licenseNumber?: string;
};

export type BloqueDisponibilidad = {
  id: string;
  practitionerId: string;
  /** ISO 8601; se muestra convertido a America/Guatemala. */
  startAt: string;
  /** ISO 8601; se muestra convertido a America/Guatemala. */
  endAt: string;
};

/** Bloque de disponibilidad ya formateado para mostrarse en la interfaz. */
export type BloqueHorarioVista = {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

export type ClinicaInfo = {
  nombre: string;
  lema: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  correo: string;
  horarios: string[];
};
