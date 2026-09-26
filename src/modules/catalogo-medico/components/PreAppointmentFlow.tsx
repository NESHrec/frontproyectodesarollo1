"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, StatusBadge } from "@/shared/components";
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
      router.push(`/reservar?${new URLSearchParams({ medicoId: nuevoMedicoId })}`, {
        scroll: false,
      });
    });
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
            onChange={(event) => seleccionarMedico(event.target.value)}
            value={medicoSeleccionadoId}
          >
            <option disabled value="">
              Selecciona un profesional
            </option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.specialtyName
                  ? `${medico.fullName} - ${medico.specialtyName}`
                  : medico.fullName}
              </option>
            ))}
          </select>
        </div>

        {medicoSeleccionado ? (
          <div className="rounded-lg bg-[#E5F1D8] p-5 text-sm text-[#62727B]">
            {medicoSeleccionado.specialtyName ? (
              <StatusBadge tone="agua">{medicoSeleccionado.specialtyName}</StatusBadge>
            ) : null}
            <p className="mt-4 font-semibold">{medicoSeleccionado.fullName}</p>
            {medicoSeleccionado.licenseNumber ? (
              <p className="mt-2 leading-6">Colegiado: {medicoSeleccionado.licenseNumber}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#62727B]">Horarios disponibles</h2>
          <p className="mt-2 text-sm leading-6 text-[#62727B]/80">
            Bloques publicados por la clínica, en hora de Guatemala.
          </p>
        </div>
        <div aria-busy={isPending} className={isPending ? "opacity-60 transition-opacity" : undefined}>
          {children}
        </div>
      </div>
    </Card>
  );
}
