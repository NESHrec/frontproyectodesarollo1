import type {
  ActiveTreatment,
  PatientAppointment,
  PatientCheckup,
  PatientPrescription,
  PatientProfile,
} from "./models";

/** Datos visuales ficticios; no representan una sesión autenticada. */
export const demoPatient: PatientProfile = {
  id: "pac-001",
  name: "Valentina",
  lastName: "Morales",
  phone: "5555-0142",
  email: "valentina.morales@example.test",
  address: "Zona 15, Ciudad de Guatemala",
  emergencyContact: "Ana Morales · 5555-0198",
  birthDate: "1998-04-18",
  bloodType: "O positivo",
};

export const demoAppointments: PatientAppointment[] = [
  { id: "demo-cita-001", date: "2026-09-29", time: "10:30", professional: "Dr. Andrés Lima", specialty: "Ortodoncia", cost: 350, status: "confirmed" },
  { id: "demo-cita-002", date: "2026-10-18", time: "09:00", professional: "Dra. Valeria Méndez", specialty: "Odontología general", cost: 275, status: "pending" },
  { id: "demo-cita-003", date: "2026-08-22", time: "11:00", professional: "Dra. Sofía Alvarado", specialty: "Medicina general", cost: 250, status: "completed" },
  { id: "demo-cita-004", date: "2026-07-14", time: "15:30", professional: "Dra. Elena Rojas", specialty: "Ginecología", cost: 400, status: "cancelled" },
];

export const demoPrescriptions: PatientPrescription[] = [
  {
    id: "demo-receta-001",
    issuedAt: "2026-09-18",
    professional: "Dr. Andrés Lima",
    specialty: "Ortodoncia",
    status: "active",
    medicines: [{ name: "Medicamento ficticio A", dose: "400 mg", frequency: "Cada 8 horas", duration: "3 días", instructions: "Indicación de demostración; no constituye una receta real." }],
  },
  {
    id: "demo-receta-002",
    issuedAt: "2026-08-22",
    professional: "Dra. Sofía Alvarado",
    specialty: "Medicina general",
    status: "finished",
    medicines: [{ name: "Producto ficticio B", dose: "500 mg", frequency: "Cada 8 horas", duration: "5 días", instructions: "Instrucción académica de demostración." }],
  },
];

export const demoCheckups: PatientCheckup[] = [
  { id: "demo-chequeo-001", name: "Control de seguimiento visual", recommendedDate: "2026-10-03", description: "Revisión preventiva ficticia para mostrar el seguimiento del portal.", status: "recommended" },
  { id: "demo-chequeo-002", name: "Evaluación de progreso", recommendedDate: "2026-11-14", description: "Valoración de demostración del avance de un tratamiento.", status: "recommended" },
  { id: "demo-chequeo-003", name: "Revisión inicial", recommendedDate: "2026-08-22", description: "Consulta ficticia registrada en el expediente visual.", status: "completed" },
];

export const demoTreatment: ActiveTreatment = {
  name: "Plan de seguimiento dental ficticio",
  description: "Este progreso es una representación visual y no corresponde a indicaciones clínicas reales.",
  progress: 65,
};
