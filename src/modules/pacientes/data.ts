export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  nextAppointment: string;
  age: string;
  bloodType: string;
  allergies: string;
  lastVisit: string;
};

export const patients: Patient[] = [
  { id: "pac-001", name: "Ana Lucía Prado", phone: "5550-0101", email: "ana.prado@example.test", nextAppointment: "21 sep · 08:30", age: "34 años", bloodType: "O+", allergies: "Ninguna declarada", lastVisit: "16 sep 2026" },
  { id: "pac-002", name: "Diego Martín Paz", phone: "5550-0102", email: "familia.paz@example.test", nextAppointment: "22 sep · 09:00", age: "9 años", bloodType: "A+", allergies: "Polen (ficticia)", lastVisit: "16 sep 2026" },
  { id: "pac-003", name: "María Fernanda Solís", phone: "5550-0103", email: "maria.solis@example.test", nextAppointment: "24 sep · 08:45", age: "28 años", bloodType: "B+", allergies: "Ninguna declarada", lastVisit: "12 ago 2026" },
  { id: "pac-004", name: "Carlos Emilio León", phone: "5550-0104", email: "carlos.leon@example.test", nextAppointment: "Sin cita", age: "46 años", bloodType: "AB+", allergies: "Dato ficticio: látex", lastVisit: "01 sep 2026" },
  { id: "pac-005", name: "Sofía Isabel Ríos", phone: "5550-0105", email: "sofia.rios@example.test", nextAppointment: "25 sep · 13:00", age: "19 años", bloodType: "O-", allergies: "Ninguna declarada", lastVisit: "16 sep 2026" },
];

export function getPatientById(patientId: string) {
  return patients.find((patient) => patient.id === patientId) ?? patients[0];
}
