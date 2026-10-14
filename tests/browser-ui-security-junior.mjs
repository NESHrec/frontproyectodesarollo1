import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:13000";
const apiUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:18080/api/v1";
const credentialsPath = process.env.CLINICA_TEST_CREDENTIALS_FILE;
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
if (!credentialsPath) throw new Error("CLINICA_TEST_CREDENTIALS_FILE is required");

const accounts = JSON.parse((await readFile(credentialsPath, "utf8")).replace(/^\uFEFF/, ""));
const account = (role) => accounts.find((item) => item.role === role);
const reception = account("RECEPCION");
const admin = account("ADMIN");
const doctor = account("MEDICO");
const patient = account("PACIENTE");
assert.ok(reception && admin && doctor && patient, "synthetic RECEPCION, ADMIN, MEDICO and PACIENTE accounts are required");

const outputRoot = path.resolve("qa/ui-security/junior");
const screenshotDir = path.join(outputRoot, "screenshots");
const logDir = path.join(outputRoot, "logs");
await mkdir(screenshotDir, { recursive: true });
await mkdir(logDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];
const results = {
  overall: "PENDING",
  actions: {
    loginReception: "PENDING",
    loginAdmin: "PENDING",
    arrival: "PENDING",
    partialPayment: "PENDING",
    idempotency: "PENDING",
  },
  fixture: {},
  integration: [],
  controlled: [],
  security: {},
  console: [],
  screenshots: [],
};

function sanitizedMessage(error) {
  return String(error?.message ?? error)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/gi, "[redacted-email]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [redacted]");
}

async function api(relativePath, { token, method = "GET", body } = {}) {
  const response = await fetch(`${apiUrl}${relativePath}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Fixture API ${method} ${relativePath} failed with HTTP ${response.status}`);
  return payload;
}

async function tokenFor(credentials) {
  const session = await api("/auth/login-unified", {
    method: "POST",
    body: { email: credentials.email, password: credentials.password },
  });
  assert.ok(session?.accessToken, `fixture login failed for ${credentials.role}`);
  return session.accessToken;
}

function guatemalaOffset(instant) {
  return new Date(instant.getTime() - 6 * 60 * 60 * 1000).toISOString().replace("Z", "-06:00");
}

async function prepareSyntheticFixture() {
  const doctorToken = await tokenFor(doctor);
  const doctorIdentity = await api("/staff/auth/me", { token: doctorToken });
  const practitioners = await api("/medicos");
  const practitioner = practitioners.find((item) => item.id === doctorIdentity.practitionerId);
  assert.ok(practitioner, "synthetic doctor is not linked to a public practitioner");

  const existingAppointmentId = process.env.JUNIOR_FIXTURE_APPOINTMENT_ID;
  if (existingAppointmentId) {
    const ownAppointments = await api("/medico/citas?limit=100", { token: doctorToken });
    const appointment = ownAppointments.find((item) => item.id === existingAppointmentId);
    assert.ok(appointment, "requested isolated synthetic appointment is not assigned to the synthetic doctor");
    const resumeCompleted = process.env.JUNIOR_RESUME_COMPLETED_FIXTURE === "true";
    assert.ok(resumeCompleted ? appointment.status === "COMPLETADA" : ["PENDIENTE", "CONFIRMADA"].includes(appointment.status));
    assert.ok(appointment.arrivalAt, "requested isolated synthetic appointment has no persisted arrival");
    results.fixture = {
      source: "reused isolated synthetic appointment from the first controlled attempt",
      appointmentId: appointment.id,
      scheduledAt: appointment.scheduledAt,
      initialStatus: appointment.status,
    };
    results.actions.arrival = "PASS";
    results.integration.push({ label: "reception-arrival", outcome: "reused-from-first-real-run", persistedAfterReload: true });
    return { appointment, doctorToken, startInstant: new Date(appointment.scheduledAt), arrivalAlreadyRecorded: true, completedAlready: resumeCompleted };
  }

  const patientToken = await tokenFor(patient);
  const startInstant = new Date(Date.now() + 45_000);
  const startAt = guatemalaOffset(startInstant);
  const endAt = guatemalaOffset(new Date(startInstant.getTime() + 30 * 60 * 1000));
  await api("/staff/medico/horarios", { token: doctorToken, method: "POST", body: { startAt, endAt } });
  const appointment = await api("/citas", {
    token: patientToken,
    method: "POST",
    body: {
      practitionerId: practitioner.id,
      specialtyId: practitioner.specialtyId,
      scheduledAt: startAt,
      notes: "Fixture sintético aislado UI Security Junior",
    },
  });
  assert.equal(appointment.status, "PENDIENTE");
  results.fixture = {
    source: "functional APIs against isolated browser database",
    appointmentId: appointment.id,
    scheduledAt: appointment.scheduledAt,
    initialStatus: appointment.status,
  };
  return { appointment, doctorToken, startInstant };
}

async function completeSyntheticAppointment(fixture) {
  const waitMilliseconds = fixture.startInstant.getTime() - Date.now() + 1_500;
  if (waitMilliseconds > 0) await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
  await api(`/medico/citas/${encodeURIComponent(fixture.appointment.id)}/atencion`, {
    token: fixture.doctorToken,
    method: "POST",
    body: {
      reason: "Control sintético QA Junior",
      findings: "Fixture sintético aislado",
      diagnosis: "Diagnóstico sintético QA Junior",
      treatmentPlan: "Seguimiento sintético",
      prescription: [],
    },
  });
  results.fixture.completedThroughFunctionalApi = true;
}

let controlledInterceptionActive = false;
function monitor(page, label) {
  const bearerRequests = [];
  const bearerResponses = [];
  const unexpectedConsole = [];
  const pendingInspections = [];
  page.on("request", (request) => {
    if (request.headers().authorization) bearerRequests.push(new URL(request.url()).pathname);
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin !== baseUrl || !url.pathname.startsWith("/api/")) return;
    if (!(response.headers()["content-type"] ?? "").includes("json")) return;
    pendingInspections.push(response.text().then((body) => {
      if (/Bearer\s+[A-Za-z0-9._~-]+|"accessToken"/i.test(body)) bearerResponses.push(url.pathname);
    }).catch(() => undefined));
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = sanitizedMessage(message.text());
    if (controlledInterceptionActive && /503 \(Service Unavailable\)/.test(text)) return;
    if (!/401 \(Unauthorized\)|403 \(Forbidden\)/.test(text)) unexpectedConsole.push(text);
  });
  page.on("pageerror", (error) => unexpectedConsole.push(sanitizedMessage(error)));
  return async () => {
    await Promise.race([
      Promise.allSettled(pendingInspections),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
    results.console.push({ label, unexpectedErrors: unexpectedConsole });
    assert.deepEqual(bearerRequests, [], `${label}: browser request exposed Authorization`);
    assert.deepEqual(bearerResponses, [], `${label}: browser response exposed a bearer token`);
    assert.deepEqual(unexpectedConsole, [], `${label}: unexpected browser errors`);
  };
}

async function login(page, credentials, expectedPath) {
  await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Iniciar sesión" }).waitFor();
  const accessType = page.getByLabel("Tipo de acceso");
  if (await accessType.count()) await accessType.selectOption("staff");
  await page.getByLabel("Correo electrónico").fill(credentials.email);
  await page.getByLabel("Contraseña").fill(credentials.password);
  const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/session/login" && response.request().method() === "POST");
  const navigationPromise = page.waitForURL((url) => url.pathname === expectedPath);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  const [response] = await Promise.all([responsePromise, navigationPromise]);
  assert.equal(response.status(), 200, `${credentials.role} form login failed with HTTP ${response.status()}`);
  const payload = await response.json();
  assert.equal(payload?.identity?.role, credentials.role);
  await page.waitForLoadState("networkidle");
  if (credentials.role === "RECEPCION") results.actions.loginReception = "PASS";
  if (credentials.role === "ADMIN") results.actions.loginAdmin = "PASS";
}

async function assertViewportAndNoOverflow(page, viewport, label) {
  const layout = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.deepEqual([layout.width, layout.height], [viewport.width, viewport.height]);
  assert.ok(layout.scrollWidth <= layout.clientWidth, `${label}: horizontal overflow`);
  results.integration.push({ label, viewport: `${layout.width}x${layout.height}`, horizontalOverflow: false });
}

async function assertNoBrowserSecrets(page, label) {
  const state = await page.evaluate(() => ({
    localKeys: Object.keys(localStorage),
    sessionKeys: Object.keys(sessionStorage),
    visibleCookie: document.cookie,
    bearerInDom: /Bearer\s+[A-Za-z0-9._~-]+/i.test(document.documentElement.textContent ?? ""),
  }));
  assert.deepEqual(state.localKeys, []);
  assert.deepEqual(state.sessionKeys, []);
  assert.equal(state.bearerInDom, false);
  assert.equal(/staff_session|access.?token|bearer/i.test(state.visibleCookie), false);
  results.security[label] = { storageEmpty: true, bearerInDom: false, sessionCookieVisibleToJavaScript: false };
}

async function logout(page) {
  const responsePromise = page.waitForResponse((response) => /\/api\/(staff\/)?session\/logout$/.test(new URL(response.url()).pathname));
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  const response = await responsePromise;
  assert.ok([200, 204].includes(response.status()));
  await page.goto(`${baseUrl}/recepcion`, { waitUntil: "domcontentloaded" });
  await page.waitForURL((url) => url.pathname === "/iniciar-sesion");
}

async function screenshot(page, name) {
  const destination = path.join(screenshotDir, name);
  await page.screenshot({ path: destination, fullPage: true });
  results.screenshots.push(path.relative(process.cwd(), destination));
}

async function exerciseArrival(page, fixture) {
  await page.goto(`${baseUrl}/recepcion/agenda`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Agenda del equipo" }).waitFor();
  const before = await page.evaluate(async (appointmentId) => {
    const response = await fetch("/api/staff/agenda", { cache: "no-store" });
    const rows = await response.json();
    return rows.find((item) => item.id === appointmentId) ?? null;
  }, fixture.appointment.id);
  assert.ok(before, "synthetic appointment is missing from reception agenda");
  assert.equal(before.arrivalAt, null);
  await screenshot(page, "arrival-before-desktop-1366x768.png");

  const row = page.locator("tr", { hasText: fixture.appointment.patientId }).filter({ has: page.getByRole("button", { name: "Registrar llegada" }) }).first();
  await row.waitFor();
  const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === `/api/staff/agenda/${fixture.appointment.id}/arrival` && response.request().method() === "POST");
  await row.getByRole("button", { name: "Registrar llegada" }).click();
  const response = await responsePromise;
  assert.ok([200, 201].includes(response.status()), `arrival returned HTTP ${response.status()}`);
  await page.getByText("Llegada registrada y persistida.").waitFor();
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await page.evaluate(async (appointmentId) => {
    const rows = await fetch("/api/staff/agenda", { cache: "no-store" }).then((item) => item.json());
    return rows.find((item) => item.id === appointmentId) ?? null;
  }, fixture.appointment.id);
  assert.ok(persisted?.arrivalAt, "arrival did not persist after reload");
  await screenshot(page, "arrival-after-reload-desktop-1366x768.png");
  results.actions.arrival = "PASS";
  results.integration.push({ label: "reception-arrival", outcome: "executed-real", persistedAfterReload: true });
}

async function selectBillingAppointment(page, appointmentId) {
  await page.getByText("Búsqueda avanzada por ID").click();
  await page.getByLabel("ID exacto de cita").fill(appointmentId);
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await page.getByRole("heading", { name: `Cita ${appointmentId}` }).waitFor();
}

async function billingDetail(page, appointmentId) {
  return page.evaluate(async (id) => {
    const response = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`billing detail returned ${response.status}`);
    return response.json();
  }, appointmentId);
}

async function exerciseBilling(page, fixture) {
  let capturedIntent;
  const observeIntent = (request) => {
    const pathname = new URL(request.url()).pathname;
    if (request.method() === "PUT" && pathname === `/api/staff/billing/appointments/${fixture.appointment.id}/payment-intent`) {
      capturedIntent = request.postDataJSON();
    }
  };
  page.on("request", observeIntent);
  try {
    await page.goto(`${baseUrl}/recepcion/cobros`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Cobros y pagos" }).waitFor();
    await selectBillingAppointment(page, fixture.appointment.id);
    const initial = await billingDetail(page, fixture.appointment.id);
    assert.equal(initial.chargeDefined, false);
    assert.equal(initial.payments.length, 0);

    const chargeResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === `/api/staff/billing/appointments/${fixture.appointment.id}/charge` && response.request().method() === "PUT");
    await page.getByLabel("Cargo (GTQ)").fill("100.00");
    await page.getByRole("button", { name: "Fijar cargo" }).click();
    const chargeResponse = await chargeResponsePromise;
    assert.ok(chargeResponse.ok(), `charge returned HTTP ${chargeResponse.status()}`);
    await page.getByText("Cargo fijado y auditado.").waitFor();
    const charged = await billingDetail(page, fixture.appointment.id);
    assert.equal(charged.chargeAmount, 10_000);
    assert.equal(charged.balanceAmount, 10_000);

    const preparedResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith("/payment-intent") && response.request().method() === "PUT");
    const commitResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/staff/billing/payment-intent" && response.request().method() === "POST");
    await page.getByLabel("Pago (GTQ)").fill("40.00");
    await page.getByLabel("Método interno").selectOption("TRANSFERENCIA");
    await page.getByLabel("Referencia interna opcional").fill(`QA-JUNIOR-${Date.now()}`);
    await page.getByRole("button", { name: "Registrar pago" }).click();
    const [preparedResponse, commitResponse] = await Promise.all([preparedResponsePromise, commitResponsePromise]);
    assert.ok(preparedResponse.ok(), `payment preparation returned HTTP ${preparedResponse.status()}`);
    assert.ok(commitResponse.ok(), `payment commit returned HTTP ${commitResponse.status()}`);
    await page.getByText("El pago quedó registrado correctamente; el saldo y el historial fueron actualizados.").waitFor();
    assert.ok(capturedIntent?.idempotencyKey, "UI payment idempotency key was not observed in memory");
    const afterPayment = await billingDetail(page, fixture.appointment.id);
    assert.equal(afterPayment.chargeAmount, 10_000);
    assert.equal(afterPayment.paidAmount, 4_000);
    assert.equal(afterPayment.balanceAmount, 6_000);
    assert.equal(afterPayment.payments.length, 1);
    const paymentId = afterPayment.payments[0].id;
    await screenshot(page, "billing-partial-after-desktop-1366x768.png");

    await page.reload({ waitUntil: "networkidle" });
    await selectBillingAppointment(page, fixture.appointment.id);
    const afterReload = await billingDetail(page, fixture.appointment.id);
    assert.equal(afterReload.balanceAmount, 6_000);
    assert.equal(afterReload.payments.length, 1);

    const replay = await page.evaluate(async ({ appointmentId, intent }) => {
      const csrf = await fetch("/api/session/csrf", { cache: "no-store" }).then((response) => response.json());
      const prepared = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(appointmentId)}/payment-intent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf.csrfToken },
        body: JSON.stringify(intent),
      });
      const committed = await fetch("/api/staff/billing/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf.csrfToken },
      });
      const detail = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(appointmentId)}`, { cache: "no-store" }).then((response) => response.json());
      await fetch("/api/staff/billing/payment-intent", { method: "DELETE", headers: { "x-csrf-token": csrf.csrfToken } });
      return { prepared: prepared.status, committed: committed.status, balanceAmount: detail.balanceAmount, paidAmount: detail.paidAmount, paymentIds: detail.payments.map((item) => item.id) };
    }, { appointmentId: fixture.appointment.id, intent: capturedIntent });
    assert.ok([200, 201].includes(replay.prepared));
    assert.ok([200, 201].includes(replay.committed));
    assert.equal(replay.balanceAmount, 6_000);
    assert.equal(replay.paidAmount, 4_000);
    assert.deepEqual(replay.paymentIds, [paymentId]);

    results.fixture.finance = { chargeGtq: "100.00", chargeCents: 10_000, partialPaymentGtq: "40.00", partialPaymentCents: 4_000, remainingGtq: "60.00", remainingCents: 6_000 };
    results.actions.partialPayment = "PASS";
    results.actions.idempotency = "PASS";
    results.integration.push({ label: "billing-partial", outcome: "executed-real-through-ui", persistedAfterReload: true });
    results.integration.push({ label: "billing-idempotency", outcome: "executed-real-replay", duplicatePaymentCreated: false, duplicateFinancialEffect: false });
    return paymentId;
  } finally {
    page.off("request", observeIntent);
  }
}

async function verifyPersistedBilling(page, fixture) {
  await page.goto(`${baseUrl}/recepcion/cobros`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Cobros y pagos" }).waitFor();
  await selectBillingAppointment(page, fixture.appointment.id);
  const detail = await billingDetail(page, fixture.appointment.id);
  assert.equal(detail.chargeAmount, 10_000);
  assert.equal(detail.paidAmount, 4_000);
  assert.equal(detail.balanceAmount, 6_000);
  assert.equal(detail.payments.length, 1);
  await screenshot(page, "billing-partial-persisted-desktop-1366x768.png");
  results.fixture.finance = { chargeGtq: "100.00", chargeCents: 10_000, partialPaymentGtq: "40.00", partialPaymentCents: 4_000, remainingGtq: "60.00", remainingCents: 6_000 };
  results.actions.partialPayment = "PASS";
  results.integration.push({ label: "billing-partial", outcome: "executed-real-through-ui-in-prior-controlled-attempt", persistedAfterReload: true });
  return detail.payments[0].id;
}

async function verifyAudit(page, appointmentId, paymentId) {
  await page.goto(`${baseUrl}/admin/bitacora`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Bitácora" }).waitFor();
  const events = await page.evaluate(async () => fetch("/api/staff/audit-events?page=0&limit=50", { cache: "no-store" }).then((response) => response.json()));
  const rows = events.items ?? [];
  assert.equal(rows.filter((item) => item.action === "APPOINTMENT_ARRIVAL_RECORDED" && item.entityId === appointmentId).length, 1);
  assert.equal(rows.filter((item) => item.action === "APPOINTMENT_CHARGE_SET" && item.entityId === appointmentId).length, 1);
  assert.equal(rows.filter((item) => item.action === "APPOINTMENT_PAYMENT_RECORDED" && item.entityId === paymentId).length, 1);
  results.actions.idempotency = "PASS";
  results.integration.push({ label: "audit-arrival-charge-payment", outcome: "persisted-real", duplicatePaymentAudit: false });
  results.integration.push({ label: "billing-idempotency", outcome: "real-replay-completed-in-prior-controlled-attempt-and-persistence-reverified", duplicatePaymentCreated: false, duplicateFinancialEffect: false });
}

async function controlledStates(page) {
  controlledInterceptionActive = true;
  try {
    await page.route("**/api/staff/agenda**", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "CONTROLLED_QA" }) }));
    await page.goto(`${baseUrl}/recepcion/agenda`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "No se pudo cargar la agenda" }).waitFor();
    await page.unroute("**/api/staff/agenda**");
    results.controlled.push({ label: "agenda-error", method: "intercepted-503", passed: true });

    await page.route("**/api/staff/patients**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [] }) }));
    await page.goto(`${baseUrl}/recepcion/pacientes`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Directorio vacío" }).waitFor();
    await page.unroute("**/api/staff/patients**");
    results.controlled.push({ label: "patients-empty", method: "intercepted-empty-response", passed: true });
  } finally {
    controlledInterceptionActive = false;
  }
}

const browser = await chromium.launch({ executablePath, headless: true });
let failure;
try {
  const fixture = await prepareSyntheticFixture();
  let paymentId;

  const anonymous = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const anonymousPage = await anonymous.newPage();
  const unauthenticated = await anonymousPage.goto(`${baseUrl}/api/staff/agenda`);
  assert.equal(unauthenticated?.status(), 401);
  results.security.unauthenticatedAgenda = 401;
  await anonymous.close();

  for (const viewport of viewports) {
    const receptionContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const receptionPage = await receptionContext.newPage();
    receptionPage.setDefaultTimeout(25_000);
    const finishReceptionMonitor = monitor(receptionPage, `reception-${viewport.name}`);
    await login(receptionPage, reception, "/recepcion");
    await assertNoBrowserSecrets(receptionPage, `reception-${viewport.name}`);

    for (const route of ["/recepcion", "/recepcion/agenda", "/recepcion/pacientes", "/recepcion/cobros"]) {
      await receptionPage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await assertViewportAndNoOverflow(receptionPage, viewport, `${viewport.name}:${route}`);
    }
    await receptionPage.goto(`${baseUrl}/recepcion`, { waitUntil: "networkidle" });
    await screenshot(receptionPage, `recepcion-${viewport.name}-${viewport.width}x${viewport.height}.png`);

    const denied = await receptionPage.evaluate(async () => {
      const csrf = await fetch("/api/session/csrf", { cache: "no-store" }).then((response) => response.json());
      const [audit, medical, missingCsrf] = await Promise.all([
        fetch("/api/staff/audit-events", { cache: "no-store" }),
        fetch("/api/staff/medico/citas", { cache: "no-store" }),
        fetch("/api/staff/agenda/00000000-0000-0000-0000-000000000000/arrival", { method: "POST" }),
      ]);
      return { audit: audit.status, medical: medical.status, missingCsrf: missingCsrf.status, csrfTokenReceived: typeof csrf.csrfToken === "string" && csrf.csrfToken.length > 0 };
    });
    assert.deepEqual(denied, { audit: 403, medical: 403, missingCsrf: 403, csrfTokenReceived: true });
    results.security[`reception-${viewport.name}-denials`] = denied;

    if (viewport.name === "desktop") {
      if (!fixture.arrivalAlreadyRecorded) await exerciseArrival(receptionPage, fixture);
      if (!fixture.completedAlready) {
        await completeSyntheticAppointment(fixture);
        paymentId = await exerciseBilling(receptionPage, fixture);
      } else {
        paymentId = await verifyPersistedBilling(receptionPage, fixture);
      }
      await controlledStates(receptionPage);
    } else {
      await receptionPage.goto(`${baseUrl}/recepcion/agenda`, { waitUntil: "networkidle" });
      await receptionPage.goto(`${baseUrl}/recepcion/cobros`, { waitUntil: "networkidle" });
      await selectBillingAppointment(receptionPage, fixture.appointment.id);
      const persisted = await billingDetail(receptionPage, fixture.appointment.id);
      assert.equal(persisted.balanceAmount, 6_000);
      assert.equal(persisted.payments.length, 1);
    }
    await logout(receptionPage);
    await finishReceptionMonitor();
    await receptionContext.close();

    const adminContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const adminPage = await adminContext.newPage();
    adminPage.setDefaultTimeout(25_000);
    const finishAdminMonitor = monitor(adminPage, `admin-${viewport.name}`);
    await login(adminPage, admin, "/admin");
    await assertNoBrowserSecrets(adminPage, `admin-${viewport.name}`);
    for (const route of ["/admin/usuarios", "/admin/roles", "/admin/bitacora"]) {
      await adminPage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await assertViewportAndNoOverflow(adminPage, viewport, `${viewport.name}:${route}`);
    }
    await adminPage.goto(`${baseUrl}/admin/roles`, { waitUntil: "networkidle" });
    await screenshot(adminPage, `admin-roles-${viewport.name}-${viewport.width}x${viewport.height}.png`);
    const adminCsrfDenial = await adminPage.evaluate(async () => fetch("/api/staff/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then((response) => response.status));
    assert.equal(adminCsrfDenial, 403);
    results.security[`admin-${viewport.name}-missing-csrf`] = 403;
    if (viewport.name === "desktop") await verifyAudit(adminPage, fixture.appointment.id, paymentId);
    await logout(adminPage);
    await finishAdminMonitor();
    await adminContext.close();
  }

  assert.equal(Object.values(results.actions).every((status) => status === "PASS"), true, "one or more mandatory actions did not pass");
  results.overall = "PASS";
} catch (error) {
  failure = error;
  results.overall = "FAIL";
  results.failure = { message: sanitizedMessage(error) };
} finally {
  await browser.close();
  await writeFile(path.join(logDir, "browser-ui-security-junior.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(results)}\n`);
}

if (failure) throw failure;
