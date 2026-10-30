import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

function requestFor(path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers = new Headers({ host: "localhost:3010", origin: "http://localhost:3010" });
  const cookies = ["clinica_serena_patient_session=opaque-session"];
  if (options.csrf !== false) cookies.push("clinica_serena_csrf=csrf-test");
  headers.set("cookie", cookies.join("; "));
  if (options.csrf !== false) headers.set("x-csrf-token", "csrf-test");
  if (options.body !== undefined) headers.set("content-type", "application/json");
  return new NextRequest(`http://localhost:3010${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let getProfile: typeof import("../src/app/api/patient/profile/route").GET;
let patchProfile: typeof import("../src/app/api/patient/profile/route").PATCH;
let getCheckups: typeof import("../src/app/api/patient/checkups/route").GET;

test.before(async () => {
  ({ GET: getProfile, PATCH: patchProfile } = await import("../src/app/api/patient/profile/route"));
  ({ GET: getCheckups } = await import("../src/app/api/patient/checkups/route"));
});

test("el BFF consulta y actualiza perfil propio sin exponer el Bearer", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    if (url.endsWith("/pacientes/me/perfil")) {
      if (init?.method === "PATCH") return json({ patientId: "patient-x", fullName: "Paciente actualizado", email: "patient@example.test", accountStatus: "ACTIVA", registeredAt: "2026-01-01T00:00:00Z" });
      return json({ patientId: "patient-x", fullName: "Paciente sintético", email: "patient@example.test", accountStatus: "ACTIVA", registeredAt: "2026-01-01T00:00:00Z" });
    }
    throw new Error(`Unexpected backend request: ${url}`);
  }) as typeof fetch;

  const getResponse = await getProfile(requestFor("/api/patient/profile"));
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json() as { fullName: string }).fullName, "Paciente sintético");
  assert.match(String(calls[0].init?.headers && new Headers(calls[0].init.headers).get("Authorization")), /^Bearer opaque-session$/);

  const patchResponse = await patchProfile(requestFor("/api/patient/profile", { method: "PATCH", body: { fullName: "Paciente actualizado" } }));
  assert.equal(patchResponse.status, 200);
  const patchBody = await patchResponse.text();
  assert.equal((JSON.parse(patchBody) as { fullName: string }).fullName, "Paciente actualizado");
  assert.equal(JSON.parse(String(calls[1].init?.body)).fullName, "Paciente actualizado");
  assert.equal(patchBody.includes("opaque-session"), false);
});

test("el BFF bloquea patientId arbitrario y exige CSRF antes del backend", async () => {
  let backendCalls = 0;
  globalThis.fetch = (async () => { backendCalls += 1; return json({}); }) as typeof fetch;

  const extraField = await patchProfile(requestFor("/api/patient/profile", {
    method: "PATCH",
    body: { fullName: "Paciente", patientId: "other-patient" },
  }));
  assert.equal(extraField.status, 400);

  const noCsrf = await patchProfile(requestFor("/api/patient/profile", {
    method: "PATCH",
    body: { fullName: "Paciente" },
    csrf: false,
  }));
  assert.equal(noCsrf.status, 403);
  assert.equal(backendCalls, 0);
});

test("el BFF conserva el estado vacío real y traduce sesión vencida", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.endsWith("/pacientes/me/chequeos")) return json([]);
    throw new Error(`Unexpected backend request: ${url}`);
  }) as typeof fetch;
  const empty = await getCheckups(requestFor("/api/patient/checkups"));
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), []);

  globalThis.fetch = (async () => json({ code: "UNAUTHENTICATED" }, 401)) as typeof fetch;
  const expired = await getCheckups(requestFor("/api/patient/checkups"));
  assert.equal(expired.status, 401);
  assert.match(expired.headers.get("set-cookie") ?? "", /clinica_serena_patient_session=/);
});
