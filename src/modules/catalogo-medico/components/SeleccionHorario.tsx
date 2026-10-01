"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonLinkClasses } from "@/shared/components";
import type { BloqueHorarioVista } from "@/shared/types/catalogo-medico";

type SeleccionHorarioProps = {
  bloques: BloqueHorarioVista[];
  medicoId: string;
  patientSessionActive: boolean;
  specialtyId: string;
  staffSessionActive: boolean;
};

export function SeleccionHorario({
  bloques,
  medicoId,
  patientSessionActive,
  specialtyId,
  staffSessionActive,
}: SeleccionHorarioProps) {
  const [bloqueId, setBloqueId] = useState("");
  const bloqueSeleccionado = bloques.find((bloque) => bloque.id === bloqueId);
  const reservationPath = bloqueSeleccionado
    ? `/paciente/citas/nueva?${new URLSearchParams({
      especialidadId: specialtyId,
      medicoId,
      slotId: bloqueSeleccionado.id,
    })}`
    : "";
  const loginPath = reservationPath
    ? `/iniciar-sesion?${new URLSearchParams({ next: reservationPath })}`
    : "/iniciar-sesion";

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

      {bloqueSeleccionado ? (
        <div className="space-y-3">
          {patientSessionActive ? (
            <>
              <Link className={buttonLinkClasses} href={reservationPath}>
                Continuar con la reserva
              </Link>
              <p className="rounded-md bg-[#DDF3F1] px-4 py-3 text-sm text-[#62727B]" role="status">
                Se volverá a consultar este horario en tu sesión de paciente antes de confirmar.
              </p>
            </>
          ) : (
            <>
              <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm text-[#62727B]" role="status">
                {staffSessionActive
                  ? "Tu sesión de personal no autoriza reservas de paciente. Inicia sesión como paciente para continuar."
                  : "Inicia sesión como paciente para continuar con esta reserva."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className={buttonLinkClasses} href={loginPath}>
                  Iniciar sesión como paciente
                </Link>
                <Link className={`${buttonLinkClasses} bg-[#E5F1D8]`} href="/registro">
                  Crear cuenta de paciente
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm text-[#62727B]" role="status">
          Selecciona un horario para continuar.
        </p>
      )}
    </div>
  );
}
