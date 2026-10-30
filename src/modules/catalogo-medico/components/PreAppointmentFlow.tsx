"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, SelectField, StatusBadge } from "@/shared/components";
import type { Medico } from "@/shared/types/catalogo-medico";
import { getReservationSteps } from "../lib/reservation-steps";

type PreAppointmentFlowProps = {
  medicos: Medico[];
  /** Profesional seleccionado en la URL; cadena vacía si no hay selección. */
  medicoId: string;
  /** Horarios del profesional seleccionado, renderizados en el servidor. */
  children: React.ReactNode;
};

export function PreAppointmentFlow({ medicos, medicoId, children }: PreAppointmentFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [medicoSeleccionadoId, setMedicoSeleccionadoId] = useOptimistic(medicoId);
  const medicoSeleccionado = medicos.find((medico) => medico.id === medicoSeleccionadoId);
  const steps = getReservationSteps(Boolean(medicoSeleccionado));

  function seleccionarMedico(nuevoMedicoId: string) {
    startTransition(() => {
      setMedicoSeleccionadoId(nuevoMedicoId);
      router.push(`/reservar?${new URLSearchParams({ medicoId: nuevoMedicoId })}`, { scroll: false });
    });
  }

  return (
    <Card className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <ol aria-label="Pasos de la reserva" className="serena-reservation-steps col-span-full">
        {steps.map((step, index) => <li aria-current={step.state === "current" ? "step" : undefined} className="serena-reservation-step" data-state={step.state} key={step.label}>
          <span aria-hidden="true" className="serena-reservation-step-index">{step.state === "complete" ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span className="serena-reservation-step-copy">
            <span className="truncate">{step.label}</span>
            <span className="serena-reservation-step-status">{step.state === "current" ? "Paso actual" : step.state === "complete" ? "Completado" : step.label === "Especialidad" ? "Con profesional" : "Pendiente"}</span>
          </span>
        </li>)}
      </ol>
      <div className="space-y-5">
        <SelectField
          helperText="Elige un profesional. Su especialidad se añade automáticamente al flujo de reserva."
          id="medico-reserva"
          label="Profesional"
          onChange={(event) => seleccionarMedico(event.target.value)}
          value={medicoSeleccionadoId}
        >
          <option disabled value="">Selecciona un profesional</option>
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>
              {medico.specialtyName ? `${medico.fullName} - ${medico.specialtyName}` : medico.fullName}
            </option>
          ))}
        </SelectField>

        {medicoSeleccionado ? (
          <div className="relative overflow-hidden rounded-[var(--serena-radius-md)] border border-[var(--serena-border)] bg-[linear-gradient(135deg,var(--serena-success-soft),var(--serena-surface-info))] p-5 text-sm text-[var(--serena-text)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[var(--serena-teal)]">
            {medicoSeleccionado.specialtyName ? <StatusBadge tone="agua">{medicoSeleccionado.specialtyName}</StatusBadge> : null}
            <p className="mt-4 text-lg font-black text-[var(--serena-ink)]">{medicoSeleccionado.fullName}</p>
            {medicoSeleccionado.licenseNumber ? <p className="mt-2 leading-6">Colegiado: {medicoSeleccionado.licenseNumber}</p> : null}
            <p className="mt-4 border-t border-[var(--serena-border)] pt-3 text-xs font-semibold uppercase tracking-[.12em] text-[var(--serena-teal)]">Profesional seleccionado</p>
          </div>
        ) : null}
      </div>

      <div aria-busy={isPending} className={`space-y-5 ${isPending ? "opacity-60 transition-opacity" : ""}`}>
        <div>
          <h2 className="text-xl font-bold text-[var(--serena-ink)]">Horarios disponibles</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--serena-text)]/80">Bloques publicados por la clínica, en hora de Guatemala.</p>
        </div>
        {children}
      </div>
    </Card>
  );
}
