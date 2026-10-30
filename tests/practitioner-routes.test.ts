import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

const context = { params: Promise.resolve({ practitionerId: "medico-1" }) };

function request(url: string, contentType: string, body: string, method?: string) {
  return new NextRequest(url, {
    method: method ?? (contentType.startsWith("multipart") ? "PUT" : "PATCH"),
    headers: { host: "localhost:3010", origin: "http://localhost:3010", "content-type": contentType, cookie: "clinica_serena_staff_session=opaque-staff" },
    body,
  });
}

function csrfAuthorizedDelete(url: string) {
  return new NextRequest(url, {
    method: "DELETE",
    headers: {
      host: "localhost:3010", origin: "http://localhost:3010",
      cookie: "clinica_serena_csrf=csrf-test; clinica_serena_staff_session=opaque-staff",
      "x-csrf-token": "csrf-test",
    },
  });
}

async function assertRejectedBeforeBodyOrSpring(operation: () => Promise<Response>) {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls += 1; throw new Error("Spring must not be contacted"); }) as typeof fetch;
  try {
    const response = await operation();
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { ok: false, reason: "csrf" });
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
}

test("crear profesional rechaza JSON malformado por CSRF antes de contactar Spring", async () => {
  const { POST } = await import("../src/app/api/staff/practitioners/route");
  await assertRejectedBeforeBodyOrSpring(() => POST(request("http://localhost:3010/api/staff/practitioners", "application/json", "{malformed")));
});

test("editar profesional rechaza JSON malformado por CSRF antes de contactar Spring", async () => {
  const { PATCH } = await import("../src/app/api/staff/practitioners/[practitionerId]/route");
  await assertRejectedBeforeBodyOrSpring(() => PATCH(request("http://localhost:3010/api/staff/practitioners/medico-1", "application/json", "{malformed"), context));
});

test("cambiar estado rechaza JSON malformado por CSRF antes de contactar Spring", async () => {
  const { PATCH } = await import("../src/app/api/staff/practitioners/[practitionerId]/status/route");
  await assertRejectedBeforeBodyOrSpring(() => PATCH(request("http://localhost:3010/api/staff/practitioners/medico-1/status", "application/json", "{malformed"), context));
});

test("eliminar profesional rechaza CSRF antes de contactar Spring", async () => {
  const { DELETE } = await import("../src/app/api/staff/practitioners/[practitionerId]/route");
  await assertRejectedBeforeBodyOrSpring(() => DELETE(request("http://localhost:3010/api/staff/practitioners/medico-1", "application/json", ""), context));
});

test("eliminar profesional valida el identificador y reenvía DELETE con sesión y no-store", async () => {
  const { DELETE } = await import("../src/app/api/staff/practitioners/[practitionerId]/route");
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url, init });
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  try {
    const response = await DELETE(csrfAuthorizedDelete("http://localhost:3010/api/staff/practitioners/doctor-1"), { params: Promise.resolve({ practitionerId: "doctor-1" }) });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/staff\/medicos\/doctor-1$/);
    assert.equal(calls[0].init?.method, "DELETE");
    assert.equal(new Headers(calls[0].init?.headers).get("authorization"), "Bearer opaque-staff");

    const invalid = await DELETE(csrfAuthorizedDelete("http://localhost:3010/api/staff/practitioners/invalid%2Fid"), { params: Promise.resolve({ practitionerId: "invalid/id" }) });
    assert.equal(invalid.status, 404);
    assert.equal(calls.length, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test("cargar foto rechaza multipart inválido por CSRF antes de parsearlo o contactar Spring", async () => {
  const { PUT } = await import("../src/app/api/staff/practitioners/[practitionerId]/photo/route");
  await assertRejectedBeforeBodyOrSpring(() => PUT(request("http://localhost:3010/api/staff/practitioners/medico-1/photo", "multipart/form-data; boundary=missing", "--truncated"), context));
});
