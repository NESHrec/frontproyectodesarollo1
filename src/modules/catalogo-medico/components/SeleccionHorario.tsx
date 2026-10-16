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

export function SeleccionHorario({ bloques, medicoId, patientSessionActive, specialtyId, staffSessionActive }: SeleccionHorarioProps) {
  const [bloqueId, setBloqueId] = useState("");
  const bloqueSeleccionado = bloques.find((bloque) => bloque.id === bloqueId);
  const reservationPath = bloqueSeleccionado
    ? `/paciente/citas/nueva?${new URLSearchParams({ especialidadId: specialtyId, medicoId, slotId: bloqueSeleccionado.id })}`
    : "";
  const loginPath = reservationPath ? `/iniciar-sesion?${new URLSearchParams({ next: reservationPath })}` : "/iniciar-sesion";

  return (
    <div className="space-y-5">
      <div className="serena-catalog-heading !items-center">
        <div><p className="serena-kicker">Paso 3 · Horario</p><h3 className="mt-1 text-lg font-black text-[var(--serena-ink)]">Elige el momento que te funcione</h3></div>
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-2xl bg-[var(--serena-surface-info)] text-xl font-bold text-[var(--serena-teal)]">◷</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {bloques.map((bloque) => {
          const isSelected = bloque.id === bloqueId;
          return (
            <button
              aria-pressed={isSelected}
              className={`serena-slot min-h-20 rounded-[var(--serena-radius-sm)] border px-4 py-3 text-left text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--serena-focus)] ${isSelected ? "border-[var(--serena-focus)] bg-[var(--serena-surface-info)] text-[var(--serena-ink)] shadow-[0_8px_22px_rgb(51_75_84_/_0.1)]" : "border-[var(--serena-border)] bg-[var(--serena-surface)] text-[var(--serena-text)] hover:-translate-y-px hover:border-[var(--serena-border-strong)] hover:bg-[var(--serena-warning-soft)] motion-reduce:transform-none motion-reduce:translate-none"}`}
              key={bloque.id}
              onClick={() => setBloqueId(bloque.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-2"><span>{bloque.fecha}</span><span aria-hidden="true" className={`grid size-6 place-items-center rounded-full text-xs ${isSelected ? "bg-[var(--serena-teal)] text-white" : "bg-[var(--serena-surface-info)] text-[var(--serena-teal)]"}`}>{isSelected ? "✓" : "+"}</span></span>
              <span className="mt-1 block text-lg font-black">{bloque.horaInicio} – {bloque.horaFin}</span>
            </button>
          );
        })}
      </div>

      {bloqueSeleccionado ? <p className="rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--serena-success-soft)] px-4 py-3 text-sm text-[var(--serena-text)]" role="status">Horario elegido: <strong>{bloqueSeleccionado.fecha}</strong>, de {bloqueSeleccionado.horaInicio} a {bloqueSeleccionado.horaFin}</p> : null}

      {bloqueSeleccionado ? (
        <div className="space-y-3">
          {patientSessionActive ? (
            <>
              <Link className={`${buttonLinkClasses} w-full sm:w-auto`} href={reservationPath}>Continuar con la reserva</Link>
              <p className="rounded-[var(--serena-radius-sm)] bg-[var(--serena-surface-info)] px-4 py-3 text-sm text-[var(--serena-text)]" role="status">Se volverá a consultar este horario en tu sesión de paciente antes de confirmar.</p>
            </>
          ) : (
            <>
              <p className="rounded-[var(--serena-radius-sm)] bg-[var(--serena-warning-soft)] px-4 py-3 text-sm text-[var(--serena-text)]" role="status">{staffSessionActive ? "Tu sesión de personal no autoriza reservas de paciente. Inicia sesión como paciente para continuar." : "Inicia sesión como paciente para continuar con esta reserva."}</p>
              <div className="flex flex-wrap gap-3">
                <Link className={buttonLinkClasses} href={loginPath}>Iniciar sesión como paciente</Link>
                <Link className={`${buttonLinkClasses} bg-[var(--serena-success-soft)] !text-[var(--serena-ink)] hover:bg-[var(--serena-surface-info)]`} href="/registro">Crear cuenta de paciente</Link>
              </div>
            </>
          )}
        </div>
      ) : <p className="rounded-[var(--serena-radius-sm)] bg-[var(--serena-warning-soft)] px-4 py-3 text-sm text-[var(--serena-text)]" role="status">Selecciona un horario para continuar.</p>}
    </div>
  );
}
