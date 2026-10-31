import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("tarjeta resumen del expediente mantiene contraste legible y enlace enfocable", () => {
  const source = readFileSync(new URL("../src/app/(private)/medico/pacientes/[pacienteId]/expediente/page.tsx", import.meta.url), "utf8");
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
