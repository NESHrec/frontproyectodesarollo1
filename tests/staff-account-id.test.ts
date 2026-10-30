import assert from "node:assert/strict";
import test from "node:test";

import { forwardStaffRequest, omitAccountIdFromStaffResponse, omitStaffAccountId } from "../src/modules/auth/staff-proxy";
import { patientClinicalRecordSchema, summarizeStaffAccounts, staffAccountsSchema } from "../src/modules/atencion-medica/schemas";
import { parseStaffIdentity } from "../src/modules/auth/staff-session";
import { NextRequest } from "next/server";

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

test("el filtro de respuesta BFF elimina accountId solo en respuestas exitosas con objeto JSON", async () => {
  const response = await omitAccountIdFromStaffResponse(new Response(JSON.stringify({ accountId: "internal-id", practitionerId: "doctor-1" }), { status: 200 }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { practitionerId: "doctor-1" });

  const conflict = new Response(JSON.stringify({ accountId: "kept-for-error-diagnostics", reason: "conflict" }), { status: 409 });
  assert.equal(await omitAccountIdFromStaffResponse(conflict), conflict);
});

test("el filtro conserva 204 y convierte JSON inválido en respuesta vacía no cacheable", async () => {
  const noContent = new Response(null, { status: 204 });
  assert.equal(await omitAccountIdFromStaffResponse(noContent), noContent);

  const invalid = await omitAccountIdFromStaffResponse(new Response("not-json", { status: 200 }));
  assert.equal(invalid.headers.get("cache-control"), "no-store");
  assert.equal(await invalid.json(), null);
});

test("el proxy de personal convierte 401 del backend en sesión expirada", async () => {
  process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls += 1; return new Response("", { status: 401 }); }) as typeof fetch;
  try {
    const request = new NextRequest("http://localhost/api/staff/accounts", {
      headers: { cookie: "clinica_serena_staff_session=session-test" },
    });
    const response = await forwardStaffRequest(request, "/staff/accounts");
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { ok: false, reason: "expired" });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; }
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

test("el resumen no cuenta cuentas bloqueadas ni vínculos pendientes de otros roles", () => {
  const accounts = staffAccountsSchema.parse([
    { accountId: "internal-1", email: "a@example.test", fullName: "Recepción", role: "RECEPCION", status: "BLOQUEADA", practitionerLinkStatus: "NO_APLICA", practitionerId: null, practitionerName: null, practitionerLinkedAt: null },
    { accountId: "internal-2", email: "b@example.test", fullName: "Médico", role: "MEDICO", status: "BLOQUEADA", practitionerLinkStatus: "PENDIENTE_VINCULACION", practitionerId: null, practitionerName: null, practitionerLinkedAt: null },
  ]);
  assert.deepEqual(summarizeStaffAccounts(accounts), { total: 2, active: 0, rolesPresent: 2, pendingLinks: 1 });
  assert.deepEqual(summarizeStaffAccounts([]), { total: 0, active: 0, rolesPresent: 0, pendingLinks: 0 });
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
