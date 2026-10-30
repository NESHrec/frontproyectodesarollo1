export type AppointmentStatus = "Confirmada" | "En espera" | "En consulta" | "Completada" | "Cancelada";

export type Appointment = {
  id: string;
  time: string;
  date: string;
  patientId: string;
  patient: string;
  doctor: string;
  specialty: string;
  status: AppointmentStatus;
  arrival: "Pendiente" | "Registrada";
};

export const appointments: Appointment[] = [
  { id: "CIT-1041", time: "08:00", date: "2026-09-16", patientId: "pac-001", patient: "Ana Lucía Prado", doctor: "Dra. Sofía Alvarado", specialty: "Medicina general", status: "Completada", arrival: "Registrada" },
  { id: "CIT-1042", time: "09:15", date: "2026-09-16", patientId: "pac-002", patient: "Diego Martín Paz", doctor: "Dr. Mateo Castillo", specialty: "Pediatría", status: "En espera", arrival: "Registrada" },
  { id: "CIT-1043", time: "10:30", date: "2026-09-16", patientId: "pac-003", patient: "María Fernanda Solís", doctor: "Dra. Valeria Méndez", specialty: "Odontología general", status: "Confirmada", arrival: "Pendiente" },
  { id: "CIT-1044", time: "11:45", date: "2026-09-16", patientId: "pac-004", patient: "Carlos Emilio León", doctor: "Dra. Elena Rojas", specialty: "Ginecología", status: "Cancelada", arrival: "Pendiente" },
  { id: "CIT-1045", time: "14:00", date: "2026-09-16", patientId: "pac-005", patient: "Sofía Isabel Ríos", doctor: "Dr. Andrés Lima", specialty: "Ortodoncia", status: "En consulta", arrival: "Registrada" },
  { id: "CIT-1046", time: "15:30", date: "2026-09-17", patientId: "pac-006", patient: "Jorge Andrés Mena", doctor: "Dra. Camila Estrada", specialty: "Periodoncia", status: "Confirmada", arrival: "Pendiente" },
];

export const scheduleBlocks = [
  { day: "Lunes", range: "08:00–12:00", type: "Disponible" },
  { day: "Martes", range: "08:00–16:00", type: "Disponible" },
  { day: "Miércoles", range: "10:00–12:00", type: "Bloqueo académico" },
  { day: "Jueves", range: "08:00–16:00", type: "Disponible" },
  { day: "Viernes", range: "08:00–13:00", type: "Disponible" },
];
