import assert from "node:assert/strict";
import test from "node:test";

/**
 * Desarrollo local:
 * 1. Arranca Next con `npm run dev -- --hostname 127.0.0.1 --port 3000`.
 * 2. Para otro puerto, configura `NEXT_BASE_URL`, por ejemplo:
 *    `$env:NEXT_BASE_URL = "http://127.0.0.1:3100"`.
 * 3. Ejecuta solo esta prueba con `npx tsx --test tests/staff-agenda-bff.test.ts`.
 *
 * Las cookies de las sesiones válidas se proporcionan fuera del código mediante
 * `STAFF_AGENDA_PATIENT_COOKIE` y `STAFF_AGENDA_MEDICO_COOKIE`.
 */

const nextBaseUrl = (process.env.NEXT_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/+$/, "");

function requiredCookie(name: "STAFF_AGENDA_PATIENT_COOKIE" | "STAFF_AGENDA_MEDICO_COOKIE") {
  const value = process.env[name];
  assert.ok(value, `${name} debe contener una cookie de sesión válida para ejecutar esta prueba`);
  return value;
}

async function requestAgenda(cookie: string) {
  return fetch(`${nextBaseUrl}/api/staff/agenda`, {
    headers: { Cookie: cookie },
  });
}

test("agenda de personal con solo sesión PACIENTE devuelve 401 y no 503", async () => {
  const response = await requestAgenda(requiredCookie("STAFF_AGENDA_PATIENT_COOKIE"));

  assert.equal(response.status, 401);
  assert.notEqual(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, reason: "expired" });
});

test("agenda de personal con sesión MÉDICO sin permiso conserva el 403 de Spring", async () => {
  const response = await requestAgenda(requiredCookie("STAFF_AGENDA_MEDICO_COOKIE"));

  assert.equal(response.status, 403);
  assert.notEqual(response.status, 503);
});
