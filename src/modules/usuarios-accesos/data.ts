export type InternalUser = { id: string; name: string; email: string; role: string; status: "Activo" | "Inactivo"; lastAccess: string };
export type AuditEvent = { id: string; actor: string; action: string; entity: string; date: string };

export const internalUsers: InternalUser[] = [
  { id: "USR-001", name: "Laura Gómez", email: "laura.gomez@example.test", role: "Recepción", status: "Activo", lastAccess: "16 sep 2026 · 08:02" },
  { id: "USR-002", name: "Sofía Alvarado", email: "sofia.alvarado@example.test", role: "Médico", status: "Activo", lastAccess: "16 sep 2026 · 07:48" },
  { id: "USR-003", name: "Valeria Méndez", email: "valeria.mendez@example.test", role: "Odontólogo", status: "Activo", lastAccess: "15 sep 2026 · 16:21" },
  { id: "USR-004", name: "Mario Rivera", email: "mario.rivera@example.test", role: "Administrador", status: "Activo", lastAccess: "16 sep 2026 · 07:30" },
  { id: "USR-005", name: "Cuenta de demostración", email: "demo@example.test", role: "Recepción", status: "Inactivo", lastAccess: "02 sep 2026 · 10:15" },
];

export const rolePermissions = [
  { permission: "Gestionar agenda y llegadas", recepcion: true, medico: false, admin: false, paciente: false },
  { permission: "Consultar datos de contacto", recepcion: true, medico: true, admin: false, paciente: false },
  { permission: "Ver y registrar contenido clínico", recepcion: false, medico: true, admin: false, paciente: false },
  { permission: "Gestionar cobros", recepcion: true, medico: false, admin: false, paciente: false },
  { permission: "Gestionar usuarios y roles", recepcion: false, medico: false, admin: true, paciente: false },
  { permission: "Portal personal futuro", recepcion: false, medico: false, admin: false, paciente: true },
];

export const auditEvents: AuditEvent[] = [
  { id: "AUD-901", actor: "Mario Rivera", action: "Activó usuario ficticio", entity: "USR-003", date: "16 sep 2026 · 09:42" },
  { id: "AUD-900", actor: "Laura Gómez", action: "Reprogramó cita simulada", entity: "CIT-1043", date: "16 sep 2026 · 09:20" },
  { id: "AUD-899", actor: "Sofía Alvarado", action: "Validó consulta visual", entity: "CONS-301", date: "16 sep 2026 · 08:50" },
  { id: "AUD-898", actor: "Mario Rivera", action: "Actualizó permiso visual", entity: "ROL-RECEP", date: "15 sep 2026 · 16:05" },
  { id: "AUD-897", actor: "Laura Gómez", action: "Registró llegada simulada", entity: "CIT-1042", date: "15 sep 2026 · 15:45" },
];

export const managedSpecialties = [
  { id: "ESP-01", name: "Medicina general", category: "Médica", professionals: 2, status: "Activa" },
  { id: "ESP-02", name: "Pediatría", category: "Médica", professionals: 1, status: "Activa" },
  { id: "ESP-03", name: "Ginecología", category: "Médica", professionals: 1, status: "Activa" },
  { id: "ESP-04", name: "Odontología general", category: "Odontológica", professionals: 2, status: "Activa" },
  { id: "ESP-05", name: "Ortodoncia", category: "Odontológica", professionals: 1, status: "Activa" },
];
