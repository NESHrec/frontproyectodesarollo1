"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, SelectField, StatusBadge } from "@/shared/components";
import type { Medico } from "@/shared/types/catalogo-medico";

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

  function seleccionarMedico(nuevoMedicoId: string) {
    startTransition(() => {
      setMedicoSeleccionadoId(nuevoMedicoId);
      router.push(`/reservar?${new URLSearchParams({ medicoId: nuevoMedicoId })}`, { scroll: false });
    });
  }

  return (
    <Card className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <SelectField
          helperText="Elige un profesional para consultar sus horarios publicados."
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
          <div className="rounded-[var(--serena-radius-md)] border border-[var(--serena-border)] bg-[var(--serena-success-soft)] p-5 text-sm text-[var(--serena-text)]">
            {medicoSeleccionado.specialtyName ? <StatusBadge tone="agua">{medicoSeleccionado.specialtyName}</StatusBadge> : null}
            <p className="mt-4 font-semibold">{medicoSeleccionado.fullName}</p>
            {medicoSeleccionado.licenseNumber ? <p className="mt-2 leading-6">Colegiado: {medicoSeleccionado.licenseNumber}</p> : null}
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
