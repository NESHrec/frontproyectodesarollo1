import assert from "node:assert/strict";
import test from "node:test";

import { omitStaffAccountId } from "../src/modules/auth/staff-proxy";
import { patientClinicalRecordSchema, summarizeStaffAccounts, staffAccountsSchema } from "../src/modules/atencion-medica/schemas";
import { parseStaffIdentity } from "../src/modules/auth/staff-session";

test("la identidad de sesión omite accountId aunque Spring lo incluya", () => {
  const identity = parseStaffIdentity({
    accountId: "internal-account-id",
    email: "admin@example.test",
    fullName: "Admin de prueba",
    role: "ADMIN",
    practitionerLinkStatus: "NO_APLICA",
  });
  assert.ok(identity);
  assert.equal("accountId" in identity, false);
});

test("las respuestas de cuenta innecesarias no devuelven accountId", () => {
  assert.deepEqual(omitStaffAccountId({ accountId: "internal-id", role: "RECEPCION", status: "ACTIVA" }), {
    role: "RECEPCION", status: "ACTIVA",
  });
});

test("el resumen administrativo agrega cuentas sin serializar identificadores", () => {
  const accounts = staffAccountsSchema.parse([
    { accountId: "internal-1", email: "a@example.test", fullName: "Recepción", role: "RECEPCION", status: "ACTIVA", practitionerLinkStatus: "NO_APLICA", practitionerId: null, practitionerName: null, practitionerLinkedAt: null },
    { accountId: "internal-2", email: "b@example.test", fullName: "Médico", role: "MEDICO", status: "ACTIVA", practitionerLinkStatus: "PENDIENTE_VINCULACION", practitionerId: null, practitionerName: null, practitionerLinkedAt: null },
  ]);
  const summary = summarizeStaffAccounts(accounts);
  assert.deepEqual(summary, { total: 2, active: 2, rolesPresent: 2, pendingLinks: 1 });
  assert.equal("accountId" in summary, false);
});

test("la proyección del expediente de paciente omite IDs internos de autores", () => {
  const record = patientClinicalRecordSchema.parse({
    patient: { id: "patient-id", fullName: "Paciente", status: "ACTIVO", registeredAt: "2026-10-01T00:00:00Z" },
    recordId: "record-id", recordCreatedAt: "2026-10-01T00:00:00Z",
    clinicalProfile: { id: "profile-id", allergies: null, relevantConditions: null, currentMedications: null, dentalHistory: null, authorAccountId: "staff-internal-id", authorName: "Profesional", recordedAt: "2026-10-01T00:00:00Z" },
    clinicalProfileHistory: [],
    attentions: [{ id: "attention-id", appointmentId: "appointment-id", appointmentScheduledAt: null, practitionerId: "doctor-id", practitionerName: "Profesional", authorAccountId: "staff-internal-id", authorName: "Profesional", reason: "Consulta", findings: null, diagnosis: "Diagnóstico", treatmentPlan: null, recordedAt: "2026-10-01T00:00:00Z", prescription: [], addenda: [{ id: "addendum-id", text: "Texto", reason: "Motivo", authorAccountId: "staff-internal-id", authorName: "Profesional", recordedAt: "2026-10-01T00:00:00Z" }] }],
  });
  assert.equal("authorAccountId" in (record.clinicalProfile ?? {}), false);
  assert.equal("authorAccountId" in record.attentions[0], false);
  assert.equal("authorAccountId" in record.attentions[0].addenda[0], false);
});
