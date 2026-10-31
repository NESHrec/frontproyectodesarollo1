import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  self: dom.window,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

test("agenda de recepción muestra el nombre del paciente y no expone el UUID", async () => {
  const originalFetch = globalThis.fetch;
  const patientId = "93000000-0000-0000-0000-000000000001";
  globalThis.fetch = async () => new Response(JSON.stringify([{
    id: "97000000-0000-0000-0000-000000000001",
    patientId,
    patientName: "Paciente de prueba",
    practitionerId: "95000000-0000-0000-0000-000000000001",
    specialtyId: "94000000-0000-0000-0000-000000000001",
    scheduledAt: "2026-11-02T10:00:00Z",
    status: "PENDIENTE",
    arrivalAt: null,
    arrivalByAccountId: null,
  }]), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const { cleanup, render } = await import("@testing-library/react");
    const { ReceptionAgendaClient } = await import("../src/modules/recepcion/components/ReceptionAgendaClient");
    const screen = render(<ReceptionAgendaClient />);
    assert.equal((await screen.findAllByText("Paciente de prueba")).length, 2);
    assert.equal(screen.queryByText(patientId), null);
    cleanup();
  } finally {
    globalThis.fetch = originalFetch;
  }
});
