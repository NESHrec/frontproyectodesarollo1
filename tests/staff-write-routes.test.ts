import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";

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
