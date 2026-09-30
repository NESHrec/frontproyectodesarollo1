import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const required = ["CLINICA_TEST_CREDENTIALS_FILE", "SCENARIO", "PATIENT_INDEX", "DOCTOR_INDEX",
  "PRACTITIONER_ID", "SPECIALTY_ID", "VIEWPORT_WIDTH", "VIEWPORT_HEIGHT"];
for (const name of required) if (!process.env[name]) throw new Error(`${name} is required`);

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const accounts = JSON.parse((await fs.readFile(process.env.CLINICA_TEST_CREDENTIALS_FILE, "utf8")).replace(/^\uFEFF/, ""));
const patient = accounts.filter((item) => item.role === "PACIENTE")[Number(process.env.PATIENT_INDEX)];
const otherPatient = accounts.filter((item) => item.role === "PACIENTE")[1 - Number(process.env.PATIENT_INDEX)];
const reception = accounts.find((item) => item.role === "RECEPCION");
const doctors = accounts.filter((item) => item.role === "MEDICO");
const doctor = doctors[Number(process.env.DOCTOR_INDEX)];
const otherDoctor = doctors[1 - Number(process.env.DOCTOR_INDEX)];
const viewport = { width: Number(process.env.VIEWPORT_WIDTH), height: Number(process.env.VIEWPORT_HEIGHT) };
const production = process.env.PRODUCTION === "true";
const uncertain = process.env.UNCERTAIN === "true";
const consoleProblems = [];
const httpFailures = [];
const security = { browserAuthorizationHeaders: 0, missingCsrfMutations: [], bearerInResponses: false };
const overflowChecks = [];

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const context = await browser.newContext({ viewport });
const page = await context.newPage();
page.setDefaultTimeout(15_000);
page.setDefaultNavigationTimeout(20_000);
const phase = (name) => process.stdout.write(`phase:${name}\n`);

page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) {
    const text = message.text()
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/gi, "[redacted-email]")
      .replace(/#token=[^\s"']+/gi, "#token=[redacted]");
    consoleProblems.push({
      type: message.type(),
      category: /content security policy|csp/i.test(text) ? "csp" : /failed to load resource|fetch|networkerror|err_failed/i.test(text) ? "network-resource" : "other",
      text,
    });
  }
});
page.on("request", (request) => {
  const url = new URL(request.url());
  if (url.origin !== baseUrl || !url.pathname.startsWith("/api/")) return;
  const headers = request.headers();
  if (headers.authorization) security.browserAuthorizationHeaders += 1;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !headers["x-csrf-token"]) {
    security.missingCsrfMutations.push(`${request.method()} ${url.pathname}`);
  }
});
page.on("response", async (response) => {
  const url = new URL(response.url());
  if (url.origin !== baseUrl || !url.pathname.startsWith("/api/")) return;
  if (response.status() >= 400) httpFailures.push({ method: response.request().method(), path: url.pathname, status: response.status() });
  if ((response.headers()["content-type"] ?? "").includes("json")) {
    const body = await response.text().catch(() => "");
    if (/Bearer\s+[A-Za-z0-9._~-]+|"accessToken"/i.test(body)) security.bearerInResponses = true;
  }
});

async function checkLayout(label) {
  const measurement = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.equal(measurement.width, viewport.width);
  assert.equal(measurement.height, viewport.height);
  assert.ok(measurement.scrollWidth <= measurement.clientWidth, `${label} has horizontal overflow`);
  overflowChecks.push({ label, ...measurement });
}

async function login(account, staff) {
  await page.goto(`${baseUrl}/iniciar-sesion`);
  await page.getByLabel("Tipo de acceso").selectOption(staff ? "staff" : "patient");
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña").fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => !url.pathname.includes("iniciar-sesion"));
}

async function logout() {
  const logoutResponse = page.waitForResponse((response) => /\/api\/(staff\/)?session\/logout$/.test(new URL(response.url()).pathname));
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  const response = await logoutResponse;
  assert.ok([200, 204].includes(response.status()));
  await page.goto(`${baseUrl}/`);
}

async function verifyNoBrowserSecrets() {
  const state = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
    cookie: document.cookie,
    bodyHasBearer: /Bearer\s+[A-Za-z0-9._~-]+/i.test(document.body.innerText),
  }));
  assert.equal(state.local.length, 0);
  assert.equal(state.session.length, 0);
  assert.equal(state.bodyHasBearer, false);
  assert.equal(/staff_session|patient_session|Bearer/i.test(state.cookie), false);
}

async function selectBillingAppointment(appointmentId) {
  await page.getByLabel("Consultar cita por ID").fill(appointmentId);
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await page.getByRole("heading", { name: `Cita ${appointmentId}` }).waitFor();
}

try {
  phase("public-security");
  const documentResponse = await page.goto(`${baseUrl}/`);
  const csp = documentResponse?.headers()["content-security-policy"] ?? "";
  assert.ok(csp.includes("default-src 'self'"));
  assert.equal(csp.includes("'unsafe-eval'"), !production);
  await checkLayout("public-home");

  phase("patient-reservation");
  await login(patient, false);
  const patientBillingStatus = await page.evaluate(async () => fetch("/api/staff/billing/appointments", { cache: "no-store" }).then((r) => r.status));
  assert.equal(patientBillingStatus, 401);
  let appointment;
  if (process.env.EXISTING_APPOINTMENT_ID) {
    const own = await page.evaluate(async () => fetch("/api/patient/appointments", { cache: "no-store" }).then((r) => r.json()));
    appointment = own.find((item) => item.id === process.env.EXISTING_APPOINTMENT_ID);
    assert.ok(appointment, "existing appointment is not visible to its patient");
  } else {
    const reserveUrl = `${baseUrl}/paciente/citas/nueva?especialidadId=${encodeURIComponent(process.env.SPECIALTY_ID)}&medicoId=${encodeURIComponent(process.env.PRACTITIONER_ID)}`;
    await page.goto(reserveUrl);
    await checkLayout("patient-reservation");
    const slotButton = page.locator('button[aria-pressed="false"]').first();
    await slotButton.waitFor();
    await slotButton.click();
    const reservationResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/patient/appointments") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    const reservationResponse = await reservationResponsePromise;
    assert.equal(reservationResponse.status(), 201);
    appointment = await reservationResponse.json();
    await page.waitForURL(/\/paciente\/citas\?created=1/);
    await page.goto(`${baseUrl}/paciente`);
  }
  assert.equal(appointment.practitionerId, process.env.PRACTITIONER_ID);
  await verifyNoBrowserSecrets();
  await logout();

  phase("patient-isolation");
  await login(otherPatient, false);
  const isolatedAppointments = await page.evaluate(async () => fetch("/api/patient/appointments", { cache: "no-store" }).then((r) => r.json()));
  assert.ok(Array.isArray(isolatedAppointments));
  assert.equal(isolatedAppointments.some((item) => item.id === appointment.id), false, "other patient can see appointment");
  await logout();

  phase("reception-arrival");
  await login(reception, true);
  const receptionMedicalStatus = await page.evaluate(async () => fetch("/api/staff/medico/citas", { cache: "no-store" }).then((r) => r.status));
  assert.equal(receptionMedicalStatus, 403);
  await page.goto(`${baseUrl}/recepcion/agenda`);
  const agenda = await page.evaluate(async () => fetch("/api/staff/agenda", { cache: "no-store" }).then((r) => r.json()));
  const agendaAppointment = agenda.find((item) => item.id === appointment.id);
  assert.ok(agendaAppointment);
  if (!agendaAppointment.arrivalAt) {
    const agendaRow = page.locator("tr", { hasText: appointment.patientId }).filter({ has: page.getByRole("button", { name: "Registrar llegada" }) }).first();
    await agendaRow.getByRole("button", { name: "Registrar llegada" }).click();
    await page.getByText("Llegada registrada y persistida.").waitFor();
  }
  await checkLayout("reception-arrival");
  await logout();

  phase("other-doctor-denial");
  await login(otherDoctor, true);
  await page.goto(`${baseUrl}/medico/citas/${encodeURIComponent(appointment.id)}`);
  await page.getByText(/no existe|no está asignada/i).waitFor();
  await logout();

  const waitMs = Math.max(0, Date.parse(appointment.scheduledAt) - Date.now() + 1000);
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  phase("medical-attention");
  await login(doctor, true);
  const doctorBillingStatus = await page.evaluate(async () => fetch("/api/staff/billing/appointments", { cache: "no-store" }).then((r) => r.status));
  assert.equal(doctorBillingStatus, 403);
  await page.goto(`${baseUrl}/medico/consultas/nueva?cita=${encodeURIComponent(appointment.id)}`);
  if (await page.getByLabel("Motivo de consulta").count()) {
    await page.getByLabel("Motivo de consulta").fill(`Motivo sintetico ${process.env.SCENARIO}`);
    await page.getByLabel("Diagnóstico").fill(`Diagnostico sintetico ${process.env.SCENARIO}`);
    await page.getByRole("button", { name: "Revisar atención" }).click();
    await page.getByRole("button", { name: "Confirmar y guardar" }).click();
    await page.getByText(/Atención guardada en el expediente/).waitFor();
  } else {
    await page.getByText(/Atención guardada|Atención registrada/).first().waitFor();
  }
  await checkLayout("medical-attention");
  await logout();

  phase("billing");
  await login(reception, true);
  await page.goto(`${baseUrl}/recepcion/cobros`);
  await selectBillingAppointment(appointment.id);
  const billingPanel = page.locator("section", { has: page.getByRole("heading", { name: `Cita ${appointment.id}` }) });
  if (process.env.BILLING_ALREADY_COMPLETE !== "true") {
    if (process.env.BILLING_PARTIAL_COMPLETE !== "true") {
      assert.equal(await page.getByLabel("Cargo GTQ en centavos").count(), 1);
      await page.getByLabel("Cargo GTQ en centavos").fill("50000");
      await page.getByRole("button", { name: "Fijar cargo" }).click();
      await page.getByText("Cargo fijado y auditado.").waitFor();

      let failHistory = uncertain;
      if (uncertain) {
        let loseCommitResponse = true;
        await page.route("**/api/staff/billing/**", async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (loseCommitResponse && request.method() === "POST" && url.pathname === "/api/staff/billing/payment-intent") {
            const response = await route.fetch();
            assert.equal(response.status(), 201);
            loseCommitResponse = false;
            await route.abort("failed");
            return;
          }
          const detail = /^\/api\/staff\/billing\/appointments\/[^/]+$/.test(url.pathname);
          if (failHistory && request.method() === "GET" && detail) { await route.abort("failed"); return; }
          await route.continue();
        });
      }

      await page.getByLabel("Pago GTQ en centavos").fill("20000");
      await page.getByLabel("Método interno").selectOption("TRANSFERENCIA");
      await page.getByLabel("Referencia interna opcional").fill(`REF-${process.env.SCENARIO}`);
      await page.getByRole("button", { name: "Registrar pago" }).click();
      if (uncertain) {
        await page.getByText(/Pago pendiente de confirmación\. No se conoce aún el resultado/).waitFor();
        await page.reload();
        await page.getByRole("heading", { name: `Cita ${appointment.id}` }).waitFor();
        await page.getByText(/Pago pendiente de confirmación/).first().waitFor();
        assert.equal(await page.getByLabel("Pago GTQ en centavos").isDisabled(), true);
        assert.equal(await page.getByLabel("Método interno").isDisabled(), true);
        assert.equal(await page.getByLabel("Referencia interna opcional").isDisabled(), true);
        failHistory = false;
        await page.getByRole("button", { name: "Consultar historial nuevamente" }).click();
        await page.getByText(/El pago sí quedó registrado/).waitFor();
        await page.unroute("**/api/staff/billing/**");
      } else {
        await page.getByText(/El pago sí quedó registrado/).waitFor();
        await page.reload();
        await selectBillingAppointment(appointment.id);
      }
    }
    await billingPanel.getByText(/300[.,]00/).first().waitFor();
    assert.equal(await billingPanel.getByText(/TRANSFERENCIA/).count(), 1);
    await checkLayout("billing-after-real-reload");
    await page.getByLabel("Pago GTQ en centavos").fill("30000");
    await page.getByLabel("Método interno").selectOption("EFECTIVO");
    await page.getByRole("button", { name: "Registrar pago" }).click();
    await page.getByText(/El pago sí quedó registrado/).waitFor();
    await page.reload();
    await selectBillingAppointment(appointment.id);
  }
  phase("billing-persisted-check");
  await billingPanel.getByText(/0[.,]00/).first().waitFor();
  assert.equal(await billingPanel.getByText(/TRANSFERENCIA|EFECTIVO/).count(), 2);
  await checkLayout("billing-final-persisted");
  phase("browser-secret-check");
  await verifyNoBrowserSecrets();
  phase("final-logout");
  await logout();

  phase("security-assertions");
  const effectiveViewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  assert.equal(security.browserAuthorizationHeaders, 0);
  assert.deepEqual(security.missingCsrfMutations, []);
  assert.equal(security.bearerInResponses, false);
  assert.equal(consoleProblems.filter((item) => item.type === "error" && item.category === "other").length, 0);
  assert.equal(consoleProblems.filter((item) => item.category === "csp").length, 0);

  phase("evidence");
  const result = {
    scenario: process.env.SCENARIO,
    mode: production ? "production" : "development",
    requestedViewport: viewport,
    effectiveViewport,
    appointmentId: appointment.id,
    practitionerId: appointment.practitionerId,
    patientIsolation: "passed",
    crossRolePermissions: "passed",
    csrf: "passed",
    browserBearerExposure: "none",
    csp,
    consoleProblems,
    httpFailures,
    overflowChecks,
    uncertainFullReload: uncertain ? "passed" : "not-applicable",
    finalPaidAmount: 50000,
    finalBalanceAmount: 0,
  };
  const evidenceDir = path.resolve("docs/evidence");
  const evidencePath = path.join(evidenceDir, "2026-09-30-browser-results.json");
  await fs.mkdir(evidenceDir, { recursive: true });
  let results = [];
  try { results = JSON.parse(await fs.readFile(evidencePath, "utf8")); } catch {}
  results = results.filter((item) => item.scenario !== result.scenario);
  results.push(result);
  await fs.writeFile(evidencePath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  process.stdout.write(`${result.scenario}: passed (${effectiveViewport.width}x${effectiveViewport.height})\n`);
} finally {
  await context.close();
  await browser.close();
}
