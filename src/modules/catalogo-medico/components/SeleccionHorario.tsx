"use client";

import { useState } from "react";
import { Button } from "@/shared/components";
import type { BloqueHorarioVista } from "@/shared/types/catalogo-medico";

type SeleccionHorarioProps = {
  bloques: BloqueHorarioVista[];
};

export function SeleccionHorario({ bloques }: SeleccionHorarioProps) {
  const [bloqueId, setBloqueId] = useState("");
  const bloqueSeleccionado = bloques.find((bloque) => bloque.id === bloqueId);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {bloques.map((bloque) => {
          const isSelected = bloque.id === bloqueId;

          return (
            <button
              aria-pressed={isSelected}
              className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] ${
                isSelected
                  ? "border-[#62727B] bg-[#DDF3F1] text-[#62727B]"
                  : "border-[#62727B]/20 bg-[#FBFCFA] text-[#62727B] hover:bg-[#F8EDD2]"
              }`}
              key={bloque.id}
              onClick={() => setBloqueId(bloque.id)}
              type="button"
            >
              <span className="block">{bloque.fecha}</span>
              <span className="block text-lg">
                {bloque.horaInicio} – {bloque.horaFin}
              </span>
            </button>
          );
        })}
      </div>

      {bloqueSeleccionado ? (
        <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm text-[#62727B]" role="status">
          Horario elegido: <strong>{bloqueSeleccionado.fecha}</strong>, de{" "}
          {bloqueSeleccionado.horaInicio} a {bloqueSeleccionado.horaFin}
        </p>
      ) : null}

      <div className="space-y-3">
        <Button aria-describedby="aviso-envio-citas" disabled type="button">
          Enviar solicitud (próximamente)
        </Button>
        <p className="rounded-md bg-[#F8E2E8] px-4 py-3 text-sm text-[#62727B]" id="aviso-envio-citas">
          El envío de solicitudes estará disponible cuando se implemente el servicio de citas.
          Por ahora no se reserva ni se guarda ninguna cita.
        </p>
      </div>
    </div>
  );
}
