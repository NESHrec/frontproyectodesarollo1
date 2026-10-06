import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

function malformedWithoutCsrf(url: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "localhost:3010",
      origin: "http://localhost:3010",
    },
    body: "{invalid-json",
  });
}

function malformedWithCsrf(url: string, csrfToken: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "localhost:3010",
      origin: "http://localhost:3010",
      cookie: "clinica_serena_csrf=csrf-cookie",
      "x-csrf-token": csrfToken,
    },
    body: "{invalid-json",
  });
}

function authorized(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "localhost:3010", origin: "http://localhost:3010", cookie: "clinica_serena_csrf=csrf-cookie; clinica_serena_staff_session=opaque-staff", "x-csrf-token": "csrf-cookie" },
    body: JSON.stringify(body),
  });
}

test("pacientes rechaza CSRF antes de leer JSON inválido", async () => {
  const { POST } = await import("../src/app/api/staff/patients/route");
  const response = await POST(malformedWithoutCsrf("http://localhost:3010/api/staff/patients"));
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, reason: "csrf" });
});

test("odontograma rechaza CSRF antes de leer JSON inválido", async () => {
  const { POST } = await import("../src/app/api/staff/medico/citas/[appointmentId]/odontograma/route");
  const response = await POST(malformedWithoutCsrf("http://localhost:3010/api/staff/medico/citas/cita-1/odontograma"), {
    params: Promise.resolve({ appointmentId: "cita-1" }),
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, reason: "csrf" });
});

test("odontograma rechaza JSON inválido con CSRF presente pero inválido sin contactar Spring", async () => {
  const { POST } = await import("../src/app/api/staff/medico/citas/[appointmentId]/odontograma/route");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    throw new Error("Spring should not be contacted");
  }) as typeof fetch;

  try {
    const response = await POST(
      malformedWithCsrf(
        "http://localhost:3010/api/staff/medico/citas/cita-1/odontograma",
        "wrong-csrf",
      ),
      { params: Promise.resolve({ appointmentId: "cita-1" }) },
    );
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { ok: false, reason: "csrf" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

for (const target of ["perfil", "adendas"] as const) {
  test(`${target} rechaza CSRF antes de leer JSON malformado y sin contactar Spring`, async () => {
    const route = target === "perfil"
      ? await import("../src/app/api/staff/medico/citas/[appointmentId]/expediente/perfil/route")
      : await import("../src/app/api/staff/medico/citas/[appointmentId]/atenciones/[attentionId]/adendas/route");
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => { calls += 1; throw new Error("Spring should not be contacted"); }) as typeof fetch;
    try {
      const response = await route.POST(malformedWithoutCsrf(`http://localhost:3010/${target}`), { params: Promise.resolve({ appointmentId: "cita-1", attentionId: "atencion-1" }) });
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { ok: false, reason: "csrf" });
      assert.equal(calls, 0);
    } finally { globalThis.fetch = originalFetch; }
  });
}

test("perfil y adendas autorizados reenvían solo el contrato clínico a Spring", async () => {
  const profile = await import("../src/app/api/staff/medico/citas/[appointmentId]/expediente/perfil/route");
  const addendum = await import("../src/app/api/staff/medico/citas/[appointmentId]/atenciones/[attentionId]/adendas/route");
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => { calls.push({ url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url, init }); return new Response(JSON.stringify({ id: "created" }), { status: 201, headers: { "Content-Type": "application/json" } }); }) as typeof fetch;
  try {
    const profileResponse = await profile.POST(authorized("http://localhost:3010/profile", { allergies: "Ninguna declarada", relevantConditions: "", currentMedications: "", dentalHistory: "" }), { params: Promise.resolve({ appointmentId: "cita-1" }) });
    const addendumResponse = await addendum.POST(authorized("http://localhost:3010/addendum", { text: "Aclaración sintética", reason: "Precisión clínica" }), { params: Promise.resolve({ appointmentId: "cita-1", attentionId: "atencion-1" }) });
    assert.equal(profileResponse.status, 201); assert.equal(addendumResponse.status, 201); assert.equal(calls.length, 2);
    for (const call of calls) { assert.equal(new Headers(call.init?.headers).get("authorization"), "Bearer opaque-staff"); assert.equal(call.init?.cache, "no-store"); }
  } finally { globalThis.fetch = originalFetch; }
});

test("odontograma devuelve 400 para JSON inválido con CSRF válido", async () => {
  const { POST } = await import("../src/app/api/staff/medico/citas/[appointmentId]/odontograma/route");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    throw new Error("Spring should not be contacted");
  }) as typeof fetch;

  try {
    const response = await POST(
      malformedWithCsrf(
        "http://localhost:3010/api/staff/medico/citas/cita-1/odontograma",
        "csrf-cookie",
      ),
      { params: Promise.resolve({ appointmentId: "cita-1" }) },
    );
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, reason: "invalid-body" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
