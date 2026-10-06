import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement, HTMLSelectElement: dom.window.HTMLSelectElement,
  Event: dom.window.Event, MouseEvent: dom.window.MouseEvent, IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

const appointment = {
  id: "appointment-1", patientId: "patient-1", practitionerId: "doctor-1", specialtyId: "specialty-1",
  scheduledAt: "2026-09-30T12:00:00Z", status: "COMPLETADA" as const, attended: true,
  chargeAmount: 50000, currency: "GTQ", paidAmount: 0, balanceAmount: 50000,
  chargeDefined: true, payments: [] as Array<Record<string, unknown>>,
};
const otherAppointment = { ...appointment, id: "appointment-2", patientId: "patient-2" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function installInitialLoad(intentResponse: Response) {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : new URL(input.url).pathname;
    if (url === "/api/staff/billing/payment-intent") return intentResponse;
    if (url === "/api/staff/billing/appointments") return json([structuredClone(appointment)]);
    throw new Error(`Unexpected request: ${url}`);
  }) as typeof fetch;
}

test("la ausencia de intención es un estado explícito y normal", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");
  installInitialLoad(json({ active: false, intent: null }));

  const screen = render(<ReceptionBillingClient />);
  await screen.findByText("Sin intención de pago activa.");
  assert.ok(screen.getByText("Cita appointment-1"));
  assert.equal(screen.queryByText("Backend no disponible"), null);
  cleanup();
});

test("una intención existente se recupera desde el estado explícito", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");
  installInitialLoad(json({
    active: true,
    intent: {
      appointmentId: appointment.id,
      amount: 20000,
      method: "TRANSFERENCIA",
      reference: "REF-EXISTENTE",
      idempotencyKey: "intent-existing",
      status: "PREPARADA",
      createdAt: "2026-09-30T12:00:30Z",
      completedAt: null,
    },
  }));

  const screen = render(<ReceptionBillingClient />);
  await screen.findByText("Pago pendiente de confirmación");
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).value, "20000");
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).disabled, true);
  assert.equal(screen.queryByText("Sin intención de pago activa."), null);
  cleanup();
});

test("sesión vencida y permiso denegado conservan estados distintos", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");

  for (const scenario of [
    { status: 401, title: "Sesión expirada" },
    { status: 403, title: "Permiso denegado" },
  ]) {
    installInitialLoad(json({ ok: false }, scenario.status));
    const screen = render(<ReceptionBillingClient />);
    await screen.findByText(scenario.title);
    assert.equal(screen.queryByText("Sin intención de pago activa."), null);
    cleanup();
  }
});

test("backend no disponible no se interpreta como ausencia", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");
  installInitialLoad(json({ ok: false, reason: "service" }, 503));

  const screen = render(<ReceptionBillingClient />);
  await screen.findByText("Backend no disponible");
  assert.equal(screen.queryByText("Sin intención de pago activa."), null);
  cleanup();
});

test("un 404 inesperado no se convierte en ausencia de intención", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");
  installInitialLoad(json({ code: "UNEXPECTED_NOT_FOUND" }, 404));

  const screen = render(<ReceptionBillingClient />);
  await screen.findByText("Backend no disponible");
  assert.equal(screen.queryByText("Sin intención de pago activa."), null);
  cleanup();
});

test("el formulario recupera del backend una intención incierta y conserva su clave", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { ReceptionBillingClient } = await import("../src/modules/pagos/components/ReceptionBillingClient");
  let historyAvailable = false;
  let serverIntent: Record<string, unknown> | null = null;
  let preparePayload: { amount: number; method: string; reference?: string; idempotencyKey: string } | null = null;
  let originalKey = "";
  let commitRequests = 0;
  const persisted = structuredClone(appointment);

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : new URL(input.url).pathname;
    if (url === "/api/session/csrf") return json({ csrfToken: "csrf-test" });
    if (url === "/api/staff/billing/appointments") return json([persisted, otherAppointment]);
    if (url.endsWith("/payment-intent") && init?.method === "PUT") {
      preparePayload = JSON.parse(String(init.body));
      originalKey = preparePayload!.idempotencyKey;
      serverIntent = { appointmentId: appointment.id, ...preparePayload, reference: preparePayload?.reference ?? null,
        status: "PREPARADA", createdAt: "2026-09-30T12:00:30Z", completedAt: null };
      return json(serverIntent);
    }
    if (url === "/api/staff/billing/payment-intent" && init?.method === "POST") {
      commitRequests += 1;
      if (persisted.payments.length === 0 && preparePayload) {
        persisted.payments.push({ id: "payment-1", appointmentId: appointment.id,
          registeredByAccountId: "reception-1", amount: preparePayload.amount, currency: "GTQ",
          method: preparePayload.method, reference: preparePayload.reference ?? null,
          idempotencyKey: preparePayload.idempotencyKey, registeredAt: "2026-09-30T12:01:00Z" });
        persisted.paidAmount = preparePayload.amount;
        persisted.balanceAmount = 50000 - preparePayload.amount;
      }
      serverIntent = { ...serverIntent, status: "COMPLETADA", completedAt: "2026-09-30T12:01:00Z" };
      throw new TypeError("lost response");
    }
    if (url === "/api/staff/billing/payment-intent" && init?.method === "DELETE") {
      serverIntent = null;
      return new Response(null, { status: 204 });
    }
    if (url === "/api/staff/billing/payment-intent") {
      return serverIntent
        ? json({ active: true, intent: serverIntent })
        : json({ active: false, intent: null });
    }
    if (url === `/api/staff/billing/appointments/${appointment.id}`) {
      if (!historyAvailable) throw new TypeError("history unavailable");
      return json(persisted);
    }
    throw new Error(`Unexpected request: ${url}`);
  }) as typeof fetch;

  let screen = render(<ReceptionBillingClient />);
  await screen.findByText("Cita appointment-1");
  fireEvent.change(screen.getByLabelText("Pago GTQ en centavos"), { target: { value: "20000" } });
  fireEvent.change(screen.getByLabelText("Método interno"), { target: { value: "TRANSFERENCIA" } });
  fireEvent.change(screen.getByLabelText("Referencia interna opcional"), { target: { value: "REF-20" } });
  fireEvent.click(screen.getByRole("button", { name: "Registrar pago" }));

  await screen.findByText(/Pago pendiente de confirmación\. No se conoce aún el resultado/);
  assert.ok(preparePayload);
  assert.notEqual(originalKey, "");
  assert.equal(commitRequests, 1);
  assert.equal(persisted.payments.length, 1);
  assert.equal(persisted.paidAmount, 20000);
  assert.equal(persisted.balanceAmount, 30000);
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).disabled, true);
  assert.equal((screen.getByLabelText("Método interno") as HTMLSelectElement).disabled, true);
  assert.equal((screen.getByLabelText("Referencia interna opcional") as HTMLInputElement).disabled, true);
  assert.equal((screen.getByLabelText("Consultar cita por ID") as HTMLInputElement).disabled, true);

  cleanup();
  screen = render(<ReceptionBillingClient />);
  await screen.findByText("Cita appointment-1");
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).value, "20000");
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).disabled, true);
  assert.equal((serverIntent as Record<string, unknown> | null)?.idempotencyKey, originalKey);

  historyAvailable = true;
  fireEvent.click(screen.getByRole("button", { name: "Consultar historial nuevamente" }));
  await screen.findByText(/El pago sí quedó registrado/);
  assert.equal((screen.getByLabelText("Pago GTQ en centavos") as HTMLInputElement).disabled, false);
  assert.equal((screen.getByLabelText("Consultar cita por ID") as HTMLInputElement).disabled, false);
  assert.equal(serverIntent, null);
  assert.equal(persisted.payments.length, 1);
  assert.equal(persisted.balanceAmount, 30000);
  cleanup();
});
