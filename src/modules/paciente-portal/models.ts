export type PatientProfile = {
  id: "pac-001";
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  birthDate: string;
  bloodType: string;
};

export type PatientAppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export type PatientAppointment = {
  id: string;
  date: string;
  time: string;
  professional: string;
  specialty: string;
  cost: number;
  status: PatientAppointmentStatus;
};

export type PatientPrescription = {
  id: string;
  issuedAt: string;
  professional: string;
  specialty: string;
  status: "active" | "finished";
  medicines: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
};

export type PatientCheckup = {
  id: string;
  name: string;
  recommendedDate: string;
  description: string;
  status: "recommended" | "completed";
};

export type ActiveTreatment = {
  name: string;
  description: string;
  progress: number;
};
