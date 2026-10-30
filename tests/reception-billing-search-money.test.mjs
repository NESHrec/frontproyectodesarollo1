import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createRequire } from "node:module";

const source = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
const client = source("src/modules/pagos/components/ReceptionBillingClient.tsx");
const helpers = source("src/modules/pagos/search-and-money.ts");
const require = createRequire(import.meta.url);
const typescript = require("typescript");
const helperModule = { exports: {} };
vm.runInNewContext(typescript.transpileModule(helpers, { compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2020 } }).outputText, { module: helperModule, exports: helperModule.exports, BigInt, Intl, Number });

test("la búsqueda normaliza nombre, tildes y fecha de Guatemala", () => {
  assert.match(helpers, /normalize\("NFD"\)/);
  assert.match(helpers, /toLocaleLowerCase\("es-GT"\)/);
  assert.match(helpers, /America\/Guatemala/);
  assert.match(client, /label="Nombre del paciente"/);
  assert.match(client, /label="Fecha de cita \(Guatemala\)"/);
});

test("la búsqueda avanzada conserva consulta exacta y el botón Ver", () => {
  assert.match(client, /Búsqueda avanzada por ID/);
  assert.match(client, /billing\/appointments\/\$\{encodeURIComponent\(query\.trim\(\)\)\}/);
  assert.match(client, />Ver<\/Button>/);
  assert.match(client, /title="Sin resultados"/);
});

test("los importes conservan centavos, cuerpo e idempotencia", () => {
  assert.equal(helperModule.exports.parseGtqToCents("60"), 6000);
  assert.equal(helperModule.exports.parseGtqToCents("60.00"), 6000);
  assert.equal(helperModule.exports.parseGtqToCents("60.50"), 6050);
  assert.equal(helperModule.exports.formatGtq(6000), "GTQ 60.00");
  assert.equal(helperModule.exports.formatGtq(6050), "GTQ 60.50");
  assert.equal(helperModule.exports.parseGtqToCents("60.123"), null);
  assert.equal(helperModule.exports.parseGtqToCents("0"), null);
  assert.match(client, /body: JSON\.stringify\(\{ amount, currency: "GTQ" \}\)/);
  assert.match(client, /idempotencyKey/);
});

test("el filtro ejecuta nombre parcial sin tildes y fecha de Guatemala", () => {
  const rows = [{ id: "one", patientId: "p1", patientName: "María Gabriel", scheduledAt: "2026-10-07T05:00:00Z" }];
  assert.equal(helperModule.exports.filterBillingAppointments(rows, "maria", "2026-10-06").length, 1);
  assert.equal(helperModule.exports.filterBillingAppointments(rows, "GABRIEL", "2026-10-07").length, 0);
});

test("el límite seguro de JavaScript se valida antes de convertir a Number", () => {
  assert.equal(helperModule.exports.parseGtqToCents("90071992547409.91"), Number.MAX_SAFE_INTEGER);
  assert.equal(helperModule.exports.parseGtqToCents("90071992547409.92"), null);
  assert.match(helpers, /MAX_SAFE_CENTS/);
  assert.match(client, /dentro del límite seguro/);
});
