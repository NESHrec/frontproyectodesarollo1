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

const persisted = {
  id: "o1",
  patientId: "patient-1",
  appointmentId: "a1",
  practitionerId: "m1",
  recordedByAccountId: "s1",
  toothNumber: 16,
  surface: "VESTIBULAR",
  observation: "Observación sintética vestibular",
  recordedAt: "2026-10-01T12:00:00Z",
};

test("el esquema permite seleccionar pieza y superficie con teclado", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { Odontogram } = await import("../src/modules/odontologia/components/Odontogram");
  const screen = render(<Odontogram appointmentId="appointment-1" patientId="patient-1" initialObservations={[]} />);

  assert.ok(screen.getByText("Dentición permanente"));
  assert.ok(screen.getByText("Dentición temporal"));
  const surface = screen.getByRole("button", { name: "Pieza dental FDI 55, superficie Palatina" });
  fireEvent.keyDown(surface, { key: "Enter" });
  assert.equal(surface.getAttribute("aria-pressed"), "true");
  assert.ok(screen.getByText("Pieza 55, superficie Palatina seleccionada."));
  assert.match(surface.className, /focus-visible:outline/);
  cleanup();
});

test("envía al backend la pieza, superficie y observación seleccionadas", async () => {
  const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
  const { Odontogram } = await import("../src/modules/odontologia/components/Odontogram");
  const originalFetch = globalThis.fetch;
  const requests: Array<{ input: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    requests.push({ input: url, init });
    if (url === "/api/session/csrf") return new Response(JSON.stringify({ csrfToken: "csrf-test" }), { status: 200 });
    return new Response(JSON.stringify({ ...persisted, id: "saved", appointmentId: "appointment-1", surface: "OCLUSAL", observation: "Texto clínico sintético" }), { status: 201, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  try {
    const screen = render(<Odontogram appointmentId="appointment-1" patientId="patient-1" initialObservations={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Pieza dental FDI 16, superficie Oclusal" }));
    fireEvent.change(screen.getByLabelText("Observación clínica"), { target: { value: "Texto clínico sintético" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar anotación" }));
    await waitFor(() => assert.ok(screen.getByText("Observación persistida sin reemplazar el historial.")));

    assert.equal(requests.length, 2);
    assert.equal(requests[1].input, "/api/staff/medico/citas/appointment-1/odontograma");
    assert.deepEqual(JSON.parse(String(requests[1].init?.body)), { toothNumber: 16, surface: "OCLUSAL", observation: "Texto clínico sintético" });
    assert.equal(new Headers(requests[1].init?.headers).get("x-csrf-token"), "csrf-test");
    cleanup();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("representa superficies observadas y permite seleccionar y leer el historial", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { Odontogram } = await import("../src/modules/odontologia/components/Odontogram");
  const screen = render(<Odontogram patientId="patient-1" initialObservations={[persisted]} />);

  const markedSurface = screen.getByRole("button", { name: "Pieza dental FDI 16, superficie Vestibular, con observaciones" });
  assert.match(markedSurface.className, /bg-\[#F8E2E8\]/);
  fireEvent.click(screen.getByRole("button", { name: /Seleccionar observación de pieza 16, superficie Vestibular/ }));
  assert.ok(screen.getByRole("heading", { name: "Observación seleccionada" }));
  assert.ok(screen.getAllByText("Observación sintética vestibular").length >= 1);
  assert.equal(markedSurface.getAttribute("aria-pressed"), "true");
  cleanup();
});

test("conserva y selecciona observaciones históricas sin superficie artificial", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { Odontogram } = await import("../src/modules/odontologia/components/Odontogram");
  const historical = { ...persisted, id: "legacy", surface: null, observation: "Observación histórica sintética" };
  const screen = render(<Odontogram patientId="patient-1" initialObservations={[historical]} />);

  assert.ok(screen.getByText("Sin superficie (registro histórico)", { exact: false }));
  fireEvent.click(screen.getByRole("button", { name: /Seleccionar observación de pieza 16, sin superficie especificada/ }));
  assert.ok(screen.getByText("Sin superficie especificada (registro histórico)", { exact: false }));
  assert.ok(screen.getAllByText("Observación histórica sintética").length >= 1);
  assert.ok(screen.getByText("Pieza 16 seleccionada; elige una superficie."));
  cleanup();
});

test("sin una cita conserva la consulta pero impide registrar", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { Odontogram } = await import("../src/modules/odontologia/components/Odontogram");
  const screen = render(<Odontogram patientId="patient-1" initialObservations={[persisted]} />);

  assert.ok(screen.getByText("Abre desde una cita propia para registrar. Puedes consultar y seleccionar el historial existente."));
  assert.equal(screen.queryByRole("button", { name: "Guardar anotación" }), null);
  assert.ok(screen.getByRole("button", { name: /Seleccionar observación de pieza 16/ }));
  cleanup();
});
