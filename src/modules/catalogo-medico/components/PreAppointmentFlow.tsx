"use client";

import { useMemo, useState } from "react";
import { Button, Card, StatusBadge } from "@/shared/components";
import type { HorarioDisponible, Medico } from "@/shared/types/catalogo-medico";

type PreAppointmentFlowProps = {
  medicos: Medico[];
  horarios: HorarioDisponible[];
};

export function PreAppointmentFlow({ medicos, horarios }: PreAppointmentFlowProps) {
  const [medicoId, setMedicoId] = useState(medicos[0]?.id ?? "");
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");

  const medicoSeleccionado = medicos.find((medico) => medico.id === medicoId);
  const horariosMedico = useMemo(
    () => horarios.filter((horario) => horario.medicoId === medicoId),
    [horarios, medicoId],
  );

  function confirmarVisualmente() {
    if (!medicoSeleccionado || !bloqueSeleccionado) {
      setMensaje("Selecciona un médico y un bloque horario para continuar.");
      return;
    }

    setMensaje(
      `Solicitud visual preparada con ${medicoSeleccionado.nombre} para el bloque ${bloqueSeleccionado}. No se guardó ninguna cita real.`,
    );
  }

  return (
    <Card className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#62727B]" htmlFor="medico-reserva">
            Profesional
          </label>
          <select
            className="mt-2 w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition focus:border-[#62727B] focus:bg-[#DDF3F1]"
            id="medico-reserva"
            onChange={(event) => {
              setMedicoId(event.target.value);
              setBloqueSeleccionado("");
              setMensaje("");
            }}
            value={medicoId}
          >
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nombre} - {medico.especialidad}
              </option>
            ))}
          </select>
        </div>

        {medicoSeleccionado ? (
          <div className="rounded-lg bg-[#E5F1D8] p-5 text-sm text-[#62727B]">
            <StatusBadge tone="agua">{medicoSeleccionado.especialidad}</StatusBadge>
            <p className="mt-4 font-semibold">{medicoSeleccionado.enfoque}</p>
            <p className="mt-2 leading-6">{medicoSeleccionado.disponibilidad}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#62727B]">Bloques disponibles</h2>
          <p className="mt-2 text-sm leading-6 text-[#62727B]/80">
            Selección simulada para iniciar el pre-agendamiento visual.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {horariosMedico.flatMap((horario) =>
            horario.bloques.map((bloque) => {
              const value = `${horario.fecha} ${bloque}`;
              const isSelected = bloqueSeleccionado === value;

              return (
                <button
                  className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] ${
                    isSelected
                      ? "border-[#62727B] bg-[#DDF3F1] text-[#62727B]"
                      : "border-[#62727B]/20 bg-[#FBFCFA] text-[#62727B] hover:bg-[#F8EDD2]"
                  }`}
                  key={value}
                  onClick={() => {
                    setBloqueSeleccionado(value);
                    setMensaje("");
                  }}
                  type="button"
                >
                  <span className="block">{horario.fecha}</span>
                  <span className="block text-lg">{bloque}</span>
                </button>
              );
            }),
          )}
        </div>
        <Button onClick={confirmarVisualmente} type="button">
          Preparar solicitud visual
        </Button>
        {mensaje ? (
          <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">
            {mensaje}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
