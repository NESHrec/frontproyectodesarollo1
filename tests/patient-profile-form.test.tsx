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

const profile = {
  patientId: "patient-synthetic",
  fullName: "Paciente Demo Uno Actualizado",
  email: "patient@example.test",
  accountStatus: "ACTIVA",
  registeredAt: "2026-10-02T00:00:00Z",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("la carga y la recarga sincronizan el nombre del perfil en React Hook Form", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { PatientProfileForm } = await import("../src/modules/paciente-portal/components/PatientProfileForm");
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    assert.equal(url, "/api/patient/profile");
    return json(profile);
  }) as typeof fetch;

  let screen = render(<PatientProfileForm />);
  const firstInput = await screen.findByRole("textbox", { name: "Nombre completo" }) as HTMLInputElement;
  assert.equal(firstInput.value, profile.fullName);
  screen.unmount();

  screen = render(<PatientProfileForm />);
  const reloadedInput = await screen.findByRole("textbox", { name: "Nombre completo" }) as HTMLInputElement;
  assert.equal(reloadedInput.value, profile.fullName);
  cleanup();
});
