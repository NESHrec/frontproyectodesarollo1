"use client";

import { useState } from "react";
import Link from "next/link";
import { ParticleButton } from "@/shared/components/ParticleButton";
import { buttonLinkClasses } from "@/shared/components/Button";

export function ReservationGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="serena-reservation-guide mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] p-6 sm:p-8">
      <div>
        <p className="serena-kicker">A tu ritmo</p>
        <h3 className="mt-2 text-xl font-black text-[var(--serena-ink)]">¿Quieres saber qué sigue?</h3>
        <p className="mt-2 text-sm text-[var(--serena-text)]">Consulta los pasos antes de iniciar tu reserva.</p>
      </div>
      <ParticleButton aria-expanded={open} aria-controls="serena-reservation-guide-detail" onClick={() => setOpen((value) => !value)} variant="secondary">{open ? "Ocultar detalle" : "Ver cómo funciona"}</ParticleButton>
      {open ? <div className="w-full border-t border-[var(--serena-border)] pt-5" id="serena-reservation-guide-detail">
        <p className="max-w-3xl text-sm leading-7 text-[var(--serena-text)]">Selecciona una especialidad, elige a un profesional y revisa sus horarios reales. Para confirmar necesitas iniciar sesión como paciente.</p>
        <Link className={`${buttonLinkClasses} mt-5`} href="/reservar">Comenzar mi reserva</Link>
      </div> : null}
    </div>
  );
}
