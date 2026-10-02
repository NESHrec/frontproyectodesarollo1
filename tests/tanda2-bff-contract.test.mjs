import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const source = (relative) => readFileSync(join(root, relative), "utf8");

test("especialidades BFF exige CSRF antes de leer JSON y reenvía solo el contrato", () => {
  const route = source("src/app/api/staff/specialties/route.ts");
  assert.ok(route.includes("export async function GET"));
  assert.ok(route.includes("export async function POST"));
  assert.ok(route.indexOf("hasValidCsrf(request)") < route.indexOf("request.json()"));
  assert.match(route, /JSON\.stringify\(\{ name: input\.name, description: input\.description \}\)/);
  assert.match(route, /forwardStaffRequest\(request, "\/staff\/especialidades"/);
});

test("edición de especialidades valida el identificador y mantiene CSRF", () => {
  const route = source("src/app/api/staff/specialties/[specialtyId]/route.ts");
  assert.ok(route.includes("isSafeIdentifier(specialtyId)"));
  assert.ok(route.indexOf("hasValidCsrf(request)") < route.indexOf("request.json()"));
  assert.match(route, /method: "PATCH"/);
});

test("horarios BFF nunca acepta ni reenvía medicoId", () => {
  const route = source("src/app/api/staff/medico/horarios/route.ts");
  assert.ok(route.includes("export async function GET"));
  assert.ok(route.includes("export async function POST"));
  assert.ok(route.indexOf("hasValidCsrf(request)") < route.indexOf("request.json()"));
  assert.match(route, /JSON\.stringify\(\{ startAt: input\.startAt, endAt: input\.endAt \}\)/);
  assert.doesNotMatch(route, /medicoId/);
});

test("pantallas administrativas refrescan después de éxito y exponen errores de permisos/servicio", () => {
  const specialties = source("src/modules/usuarios-accesos/components/AdminSpecialtiesManager.tsx");
  const form = source("src/modules/usuarios-accesos/components/SpecialtyForm.tsx");
  const schedule = source("src/modules/agenda-citas/components/MedicalScheduleManager.tsx");
  assert.match(specialties, /response\.status === 401/);
  assert.match(specialties, /response\.status === 403/);
  assert.match(form, /response\.status === 409/);
  assert.match(form, /onSaved\(\)/);
  assert.match(schedule, /await load\(\)/);
  assert.match(schedule, /response\.status === 409/);
  assert.match(schedule, /state === "service"/);
  assert.match(schedule, /Edición\/retiro de bloques queda pendiente/);
});

test("la sesión de personal conserva Bearer solo en servidor y la cookie de sesión es HttpOnly", () => {
  const session = source("src/modules/auth/staff-session.ts");
  const security = source("src/modules/auth/session-security.ts");
  assert.match(session, /server-only/);
  assert.match(session, /Authorization: `Bearer \$\{token\}`/);
  assert.match(security, /setStaffSessionCookies/);
  assert.match(security, /STAFF_SESSION_COOKIE, sessionToken, \{[\s\S]*httpOnly: true/);
  assert.match(session, /medicoId/);
});
