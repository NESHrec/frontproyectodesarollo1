import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3002";
const apiUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8080/api/v1";
const credentialsPath = process.env.CLINICAL_BROWSER_CREDENTIALS_PATH;
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
if (!credentialsPath) throw new Error("CLINICAL_BROWSER_CREDENTIALS_PATH is required");
const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));

async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(`API ${method} ${path} failed with ${response.status}`);
  return payload;
}

async function tokenFor(account) {
  const response = await api("/auth/login-unified", { method: "POST", body: { email: account.email, password: account.password } });
  return response.accessToken;
}

function guatemalaOffset(instant) {
  return new Date(instant.getTime() - 6 * 60 * 60 * 1000).toISOString().replace("Z", "-06:00");
}

async function login(page, account, expectedPath) {
  await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña").fill(account.password);
  await Promise.all([
    page.waitForURL((url) => url.pathname === expectedPath, { timeout: 15_000 }),
    page.getByRole("button", { name: "Iniciar sesión" }).click(),
  ]);
}

function monitor(page, errors, bearerRequests) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 500) errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  page.on("request", (request) => {
    if (request.headers().authorization) bearerRequests.push(new URL(request.url()).pathname);
  });
}

const doctorToken = await tokenFor(credentials.accounts.doctor);
const patientToken = await tokenFor(credentials.accounts.patient);
const receptionToken = await tokenFor(credentials.accounts.reception);
const doctorIdentity = await api("/staff/auth/me", { token: doctorToken });
assert.equal(doctorIdentity.practitionerId, credentials.accounts.doctor.practitionerId);
const practitioners = await api("/medicos");
const practitioner = practitioners.find((item) => item.id === doctorIdentity.practitionerId);
assert.ok(practitioner, "linked practitioner must be public");

let appointment;
const reuseCompleted = process.env.REUSE_COMPLETED_APPOINTMENT === "true";
if (reuseCompleted) {
  const ownAppointments = await api("/medico/citas?limit=100", { token: doctorToken });
  appointment = ownAppointments.find((item) => item.attentionRecorded && item.status === "COMPLETADA");
  assert.ok(appointment, "a completed synthetic appointment is required for reuse");
} else if (process.env.REUSE_ELIGIBLE_APPOINTMENT === "true") {
  const ownAppointments = await api("/medico/citas?limit=100", { token: doctorToken });
  appointment = ownAppointments.find((item) => item.canRecordAttention && item.arrivalAt);
  assert.ok(appointment, "an eligible synthetic appointment is required for reuse");
} else {
  const startInstant = new Date(Date.now() + 45_000);
  const endInstant = new Date(startInstant.getTime() + 30 * 60 * 1000);
  const startAt = guatemalaOffset(startInstant);
  await api("/staff/medico/horarios", { token: doctorToken, method: "POST", body: { startAt, endAt: guatemalaOffset(endInstant) } });
  appointment = await api("/citas", {
    token: patientToken,
    method: "POST",
    body: { practitionerId: practitioner.id, specialtyId: practitioner.specialtyId, scheduledAt: startAt, notes: "Validación sintética de superficies" },
  });
  await api(`/staff/agenda/${encodeURIComponent(appointment.id)}/arrival`, { token: receptionToken, method: "POST" });
  const waitMilliseconds = startInstant.getTime() - Date.now() + 1_500;
  if (waitMilliseconds > 0) await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
}

const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const errors = [];
const bearerRequests = [];
const dentalText = "Hallazgo odontológico sintético para validación";
const attentionReason = "Control clínico sintético para validación";
const attentionDiagnosis = "Diagnóstico sintético de validación";

try {
  const doctorContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const doctorPage = await doctorContext.newPage();
  monitor(doctorPage, errors, bearerRequests);
  await login(doctorPage, credentials.accounts.doctor, "/medico");
  await doctorPage.goto(`${baseUrl}/medico/odontograma/${encodeURIComponent(appointment.patientId)}?cita=${encodeURIComponent(appointment.id)}`, { waitUntil: "networkidle" });
  if (!reuseCompleted) {
    await doctorPage.getByRole("button", { name: "Pieza dental FDI 16, superficie Vestibular" }).click();
    await doctorPage.getByLabel("Observación clínica").fill(dentalText);
    await doctorPage.getByRole("button", { name: "Guardar anotación" }).click();
    await doctorPage.getByText("Observación persistida sin reemplazar el historial.").waitFor();
    await doctorPage.reload({ waitUntil: "networkidle" });
  }
  await doctorPage.getByRole("button", { name: "Pieza dental FDI 16, superficie Vestibular, con observaciones" }).waitFor();
  await doctorPage.getByRole("button", { name: new RegExp(`Seleccionar observación de pieza 16, superficie Vestibular`) }).click();
  await doctorPage.getByRole("heading", { name: "Observación seleccionada" }).waitFor();

  await doctorPage.goto(`${baseUrl}/medico/consultas/nueva?cita=${encodeURIComponent(appointment.id)}`, { waitUntil: "networkidle" });
  if (reuseCompleted) {
    await doctorPage.getByText(/Atención guardada/).waitFor();
  } else {
    await doctorPage.getByLabel("Motivo de consulta").fill(attentionReason);
    await doctorPage.getByLabel("Diagnóstico").fill(attentionDiagnosis);
    await doctorPage.getByRole("button", { name: "Revisar atención" }).click();
    await doctorPage.getByRole("button", { name: "Confirmar y guardar" }).click();
    await doctorPage.getByText(/Atención guardada/).waitFor();
  }
  const desktopViewport = doctorPage.viewportSize();
  await doctorContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  monitor(mobilePage, errors, bearerRequests);
  await login(mobilePage, credentials.accounts.doctor, "/medico");
  await mobilePage.goto(`${baseUrl}/medico/odontograma/${encodeURIComponent(appointment.patientId)}?cita=${encodeURIComponent(appointment.id)}`, { waitUntil: "networkidle" });
  await mobilePage.getByRole("button", { name: "Pieza dental FDI 16, superficie Vestibular, con observaciones" }).waitFor();
  const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const mobileViewport = mobilePage.viewportSize();
  await mobileContext.close();

  const receptionContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const receptionPage = await receptionContext.newPage();
  const expectedForbiddenConsoleErrors = [];
  monitor(receptionPage, expectedForbiddenConsoleErrors, bearerRequests);
  await login(receptionPage, credentials.accounts.reception, "/recepcion");
  const receptionChecks = await receptionPage.evaluate(async ({ appointmentId }) => {
    const csrf = await fetch("/api/session/csrf", { cache: "no-store" }).then((response) => response.json());
    const write = await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/odontograma`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf.csrfToken },
      body: JSON.stringify({ toothNumber: 17, surface: "OCLUSAL", observation: "Debe rechazarse" }),
    });
    const audit = await fetch("/api/staff/audit-events", { cache: "no-store" });
    return { write: write.status, audit: audit.status };
  }, { appointmentId: appointment.id });
  assert.deepEqual(receptionChecks, { write: 403, audit: 403 });
  assert.equal(expectedForbiddenConsoleErrors.length, 2);
  assert.equal(expectedForbiddenConsoleErrors.every((message) => message.includes("403 (Forbidden)")), true);
  await receptionContext.close();

  const adminContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const adminPage = await adminContext.newPage();
  monitor(adminPage, errors, bearerRequests);
  await login(adminPage, credentials.accounts.admin, "/admin");
  await adminPage.goto(`${baseUrl}/admin/bitacora`, { waitUntil: "networkidle" });
  await adminPage.getByText("Atención clínica registrada").waitFor();
  await adminPage.getByText("Observación odontológica registrada").waitFor();
  await adminContext.close();

  assert.equal(mobileOverflow, false);
  assert.deepEqual(bearerRequests, []);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    desktopViewport,
    mobileViewport,
    mobileOverflow,
    receptionChecks,
    expectedForbiddenConsoleErrors: expectedForbiddenConsoleErrors.length,
    bearerExposed: false,
    unexpectedConsoleOrServerErrors: 0,
  }));
} finally {
  await browser.close();
}
