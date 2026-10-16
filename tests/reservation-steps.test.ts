import assert from "node:assert/strict";
import test from "node:test";
import { getReservationSteps } from "../src/modules/catalogo-medico/lib/reservation-steps";

test("sin profesional, Profesional es el único paso actual y los demás siguen pendientes", () => {
  assert.deepEqual(getReservationSteps(false).map(({ label, state }) => [label, state]), [
    ["Especialidad", "upcoming"],
    ["Profesional", "current"],
    ["Horario", "upcoming"],
    ["Confirmación", "upcoming"],
  ]);
});

test("con profesional seleccionado, Especialidad y Profesional completan y Horario queda actual", () => {
  assert.deepEqual(getReservationSteps(true).map(({ label, state }) => [label, state]), [
    ["Especialidad", "complete"],
    ["Profesional", "complete"],
    ["Horario", "current"],
    ["Confirmación", "upcoming"],
  ]);
});
