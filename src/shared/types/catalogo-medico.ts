export type Especialidad = {
  id: string;
  nombre: string;
  categoria: "medica" | "odontologica";
  descripcion: string;
};

export type Medico = {
  id: string;
  nombre: string;
  especialidadId: string;
  especialidad: string;
  enfoque: string;
  experiencia: string;
  ubicacion: string;
  disponibilidad: string;
  biografia: string;
};

export type HorarioDisponible = {
  medicoId: string;
  fecha: string;
  bloques: string[];
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
