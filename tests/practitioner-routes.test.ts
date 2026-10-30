import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

const context = { params: Promise.resolve({ practitionerId: "medico-1" }) };

function request(url: string, contentType: string, body: string) {
  return new NextRequest(url, {
    method: contentType.startsWith("multipart") ? "PUT" : "PATCH",
    headers: { host: "localhost:3010", origin: "http://localhost:3010", "content-type": contentType, cookie: "clinica_serena_staff_session=opaque-staff" },
    body,
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

test("cargar foto rechaza multipart inválido por CSRF antes de parsearlo o contactar Spring", async () => {
  const { PUT } = await import("../src/app/api/staff/practitioners/[practitionerId]/photo/route");
  await assertRejectedBeforeBodyOrSpring(() => PUT(request("http://localhost:3010/api/staff/practitioners/medico-1/photo", "multipart/form-data; boundary=missing", "--truncated"), context));
});
