import assert from "node:assert/strict";
import test from "node:test";
import { guatemalaWallTimeToIso, isoToGuatemalaWallTime } from "../src/modules/agenda-citas/timezone";

test("la hora de pared de Guatemala conserva 09:30 en el round trip", () => {
  const payload = guatemalaWallTimeToIso("2026-10-10", "09:30");
  assert.equal(payload, "2026-10-10T09:30:00-06:00");
  assert.equal(isoToGuatemalaWallTime(payload!), "2026-10-10T09:30");
});

test("la conversión no acepta valores de fecha u hora inválidos", () => {
  assert.equal(guatemalaWallTimeToIso("2026-02-30", "09:30"), null);
  assert.equal(guatemalaWallTimeToIso("2026-10-10", "24:00"), null);
});
