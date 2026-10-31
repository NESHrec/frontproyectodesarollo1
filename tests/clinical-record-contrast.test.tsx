import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("tarjeta resumen del expediente mantiene contraste legible y enlace enfocable", () => {
  const source = readFileSync(new URL("../src/modules/atencion-medica/components/PatientRecordSummaryCard.tsx", import.meta.url), "utf8");
  const start = source.indexOf("<Card className=\"relative overflow-hidden rounded-[2rem]");
  const end = source.indexOf("</Card>", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const summaryCard = source.slice(start, end);
  assert.match(summaryCard, /text-\[#334B54\]/);
  assert.match(summaryCard, /text-\[#263238\]/);
  assert.match(summaryCard, /focus-visible:outline/);
  assert.doesNotMatch(summaryCard, /text-white/);
});

test("tarjeta del expediente renderiza datos legibles y conserva el retorno a la cita", async () => {
  const dom = new (await import("jsdom")).JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
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

  const { cleanup, render } = await import("@testing-library/react");
  const { PatientRecordSummaryCard } = await import("../src/modules/atencion-medica/components/PatientRecordSummaryCard");
  const screen = render(<PatientRecordSummaryCard
    patientName="Paciente de prueba"
    registeredAt="2026-10-17T16:57:00Z"
    status="ACTIVO"
    recordId="record-test"
    recordCreatedAt="2026-10-17T16:57:00Z"
    attentionCount={2}
    appointmentHref="/medico/citas/cita-test"
  />);

  assert.ok(screen.getByRole("heading", { name: "Paciente de prueba" }));
  assert.ok(screen.getByText(/Registrado/));
  assert.ok(screen.getByText(/Abierto/));
  assert.ok(screen.getByText("2"));
  assert.ok(screen.getByText("Activo"));
  const backLink = screen.getByRole("link", { name: "Volver a la cita" });
  assert.equal(backLink.getAttribute("href"), "/medico/citas/cita-test");
  assert.match(backLink.className, /focus-visible:outline/);
  assert.match(backLink.className, /text-\[#334B54\]/);
  cleanup();

  const missingRecord = render(<PatientRecordSummaryCard
    patientName={null}
    registeredAt="2026-10-17T16:57:00Z"
    status="INACTIVO"
    recordId={null}
    recordCreatedAt={null}
    attentionCount={0}
    appointmentHref="/medico/citas/cita-test"
  />);
  assert.ok(missingRecord.getByRole("heading", { name: "Sin nombre registrado" }));
  assert.ok(missingRecord.getByText("Inactivo"));
  assert.ok(missingRecord.getByText("Se abrirá con la primera atención"));
  assert.ok(missingRecord.getByText("0"));
  cleanup();
  dom.window.close();
});
