"use client";

import { useState } from "react";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { permanentRows, primaryRows, surfaceLabels, surfaces, type DentalSurface } from "@/modules/odontologia/data";
import type { DentalObservation } from "@/modules/odontologia/schemas";
import { Button, EmptyState, Input } from "@/shared/components";

type Selection = { tooth: number; surface: DentalSurface | null };
type SurfaceSelection = { tooth: number; surface: DentalSurface };

function isDentalSurface(value: string | null): value is DentalSurface {
  return value !== null && surfaces.includes(value as DentalSurface);
}

function ToothSurfaceDiagram({
  number,
  selected,
  observedSurfaces,
  hasHistory,
  hasUnspecifiedHistory,
  onSelectTooth,
  onSelectSurface,
}: {
  number: number;
  selected: Selection | null;
  observedSurfaces: Set<DentalSurface>;
  hasHistory: boolean;
  hasUnspecifiedHistory: boolean;
  onSelectTooth: (number: number) => void;
  onSelectSurface: (selection: SurfaceSelection) => void;
}) {
  const toothSelected = selected?.tooth === number;

  return (
    <div
      aria-label={`Esquema de superficies de la pieza dental FDI ${number}`}
      className={`min-w-0 rounded-[1.4rem] border-2 p-2 transition ${
        toothSelected ? "border-[#62727B] bg-[#DDF3F1]/45" : hasHistory ? "border-[#D99AAE] bg-[#F8E2E8]/35" : "border-[#62727B]/20 bg-white"
      }`}
      role="group"
    >
      <button
        aria-label={`Pieza dental FDI ${number}${hasHistory ? ", con observaciones" : ""}`}
        aria-pressed={toothSelected}
        className="mb-2 min-h-9 w-full rounded-full border border-[#62727B]/25 bg-white text-sm font-bold text-[#62727B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
        onClick={() => onSelectTooth(number)}
        type="button"
      >
        {number}
        {hasUnspecifiedHistory ? <span className="ml-1 text-[#9A3F5D]" title="Tiene registros históricos sin superficie">*</span> : null}
      </button>
      <div className="grid grid-cols-2 gap-1" role="group" aria-label={`Superficies de la pieza ${number}`}>
        {surfaces.map((surface) => {
          const surfaceSelected = selected?.tooth === number && selected.surface === surface;
          const observed = observedSurfaces.has(surface);
          return (
            <button
              aria-label={`Pieza dental FDI ${number}, superficie ${surfaceLabels[surface]}${observed ? ", con observaciones" : ""}`}
              aria-pressed={surfaceSelected}
              className={`min-h-8 min-w-0 rounded-md border px-1 py-1 text-[11px] font-semibold leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] ${
                surfaceSelected
                  ? "border-[#405158] bg-[#405158] text-white"
                  : observed
                    ? "border-[#B45373] bg-[#F8E2E8] text-[#7C2947]"
                    : "border-[#62727B]/20 bg-[#FBFCFA] text-[#52636B] hover:bg-[#DDF3F1]"
              }`}
              key={surface}
              onClick={() => onSelectSurface({ tooth: number, surface })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectSurface({ tooth: number, surface });
                }
              }}
              type="button"
            >
              {surfaceLabels[surface]}
              {observed ? <span aria-hidden className="ml-1">●</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToothChart({
  title,
  rows,
  selection,
  observations,
  onSelectTooth,
  onSelectSurface,
}: {
  title: string;
  rows: readonly (readonly number[])[];
  selection: Selection | null;
  observations: DentalObservation[];
  onSelectTooth: (number: number) => void;
  onSelectSurface: (selection: SurfaceSelection) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-bold text-[#62727B]">{title}</legend>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8" key={index}>
            {row.map((number) => {
              const toothObservations = observations.filter((item) => item.toothNumber === number);
              return (
                <ToothSurfaceDiagram
                  hasHistory={toothObservations.length > 0}
                  hasUnspecifiedHistory={toothObservations.some((item) => item.surface === null)}
                  key={number}
                  number={number}
                  observedSurfaces={new Set(toothObservations.flatMap((item) => isDentalSurface(item.surface) ? [item.surface] : []))}
                  onSelectSurface={onSelectSurface}
                  onSelectTooth={onSelectTooth}
                  selected={selection}
                />
              );
            })}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function Odontogram({
  patientId,
  appointmentId,
  initialObservations,
}: {
  patientId: string;
  appointmentId?: string;
  initialObservations: DentalObservation[];
}) {
  const [observations, setObservations] = useState(initialObservations);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const selectedObservation = observations.find((item) => item.id === selectedObservationId) ?? null;

  function selectSurface(next: SurfaceSelection) {
    setSelection(next);
    setSelectedObservationId(null);
  }

  function selectTooth(tooth: number) {
    setSelection((current) => current?.tooth === tooth ? current : { tooth, surface: null });
    setSelectedObservationId(null);
  }

  function selectHistory(item: DentalObservation) {
    setSelectedObservationId(item.id);
    setSelection({ tooth: item.toothNumber, surface: isDentalSurface(item.surface) ? item.surface : null });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointmentId) {
      setMessage({ tone: "error", text: "Abre el odontograma desde una cita propia para registrar." });
      return;
    }
    if (!selection?.surface || !observation.trim()) {
      setMessage({ tone: "error", text: "Selecciona pieza y superficie en el esquema y escribe una observación." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/odontograma`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "x-csrf-token": await getCsrfToken() },
        body: JSON.stringify({ toothNumber: selection.tooth, surface: selection.surface, observation }),
      });
      if (!response.ok) {
        setMessage({ tone: "error", text: response.status === 409 ? "La cita no admite observaciones en este momento." : "No se pudo guardar la observación." });
        return;
      }
      const saved = await response.json() as DentalObservation;
      if (saved.patientId !== patientId) {
        setMessage({ tone: "error", text: "La respuesta no corresponde a este paciente." });
        return;
      }
      setObservations((current) => [saved, ...current]);
      setSelectedObservationId(saved.id);
      setObservation("");
      setMessage({ tone: "ok", text: "Observación persistida sin reemplazar el historial." });
    } catch {
      setMessage({ tone: "error", text: "El servicio no está disponible." });
    } finally {
      setBusy(false);
    }
  }

  const chartProps = {
    selection,
    observations,
    onSelectTooth: selectTooth,
    onSelectSurface: selectSurface,
  };

  return (
    <section aria-labelledby="odontogram-title" className="min-w-0 space-y-6 rounded-xl border border-[#62727B]/15 bg-white p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold text-[#62727B]" id="odontogram-title">Esquema de superficies dentales FDI</h2>
        <p className="mt-1 text-sm text-[#62727B]/75">Cada contorno representa una pieza y organiza las superficies admitidas por el registro clínico. Es un esquema de selección, no un odontograma anatómico completo.</p>
      </div>
      <div aria-label="Leyenda del esquema" className="flex flex-wrap gap-4 rounded-lg bg-[#F6FAFA] p-3 text-sm">
        <span>Blanco: sin observación</span>
        <span className="font-semibold text-[#9A3F5D]">Rosa ●: con observaciones</span>
        <span className="rounded bg-[#405158] px-2 text-white">Oscuro: selección actual</span>
        <span><strong>*</strong> Historial sin superficie especificada</span>
      </div>
      <ToothChart {...chartProps} rows={permanentRows} title="Dentición permanente" />
      <ToothChart {...chartProps} rows={primaryRows} title="Dentición temporal" />

      <p aria-live="polite" className="rounded-md bg-[#F6FAFA] px-3 py-2 text-sm font-semibold text-[#52636B]" role="status">
        {selection?.surface ? `Pieza ${selection.tooth}, superficie ${surfaceLabels[selection.surface]} seleccionada.` : selection ? `Pieza ${selection.tooth} seleccionada; elige una superficie.` : "Selecciona una superficie dentro del esquema dental."}
      </p>

      {!appointmentId ? (
        <p className="rounded-md bg-[#F8EDD2] px-3 py-2 text-sm" role="status">Abre desde una cita propia para registrar. Puedes consultar y seleccionar el historial existente.</p>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <Input
            disabled={busy}
            helperText={selection?.surface ? `Se guardará en la pieza ${selection.tooth}, superficie ${surfaceLabels[selection.surface]}.` : "Selecciona primero una superficie en el esquema."}
            id="odontogram-observation"
            label="Observación clínica"
            maxLength={500}
            required
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
          />
          <Button disabled={busy || !selection?.surface} type="submit">{busy ? "Guardando…" : "Guardar anotación"}</Button>
        </form>
      )}

      {message ? <p className={message.tone === "ok" ? "rounded-md bg-[#E5F1D8] px-3 py-2 text-sm" : "rounded-md bg-[#F8E2E8] px-3 py-2 text-sm"} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p> : null}

      {selectedObservation ? (
        <aside aria-live="polite" className="rounded-lg border-2 border-[#62727B] bg-[#F6FAFA] p-4" aria-labelledby="selected-observation-title">
          <h3 className="font-bold" id="selected-observation-title">Observación seleccionada</h3>
          <p className="mt-1 text-sm"><strong>Pieza {selectedObservation.toothNumber}</strong> · {isDentalSurface(selectedObservation.surface) ? surfaceLabels[selectedObservation.surface] : "Sin superficie especificada (registro histórico)"}</p>
          <p className="mt-2 whitespace-pre-line text-sm">{selectedObservation.observation}</p>
        </aside>
      ) : null}

      {observations.length === 0 ? (
        <EmptyState description="No hay observaciones persistidas para este paciente." title="Odontograma vacío" />
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold">Historial</h3>
          <ol className="space-y-2">
            {observations.map((item) => (
              <li key={item.id}>
                <button
                  aria-label={`Seleccionar observación de pieza ${item.toothNumber}, ${isDentalSurface(item.surface) ? `superficie ${surfaceLabels[item.surface]}` : "sin superficie especificada"}: ${item.observation}`}
                  aria-pressed={selectedObservationId === item.id}
                  className={`w-full rounded-lg border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] ${selectedObservationId === item.id ? "border-[#62727B] bg-[#DDF3F1]" : "border-[#62727B]/15 bg-white hover:bg-[#F6FAFA]"}`}
                  onClick={() => selectHistory(item)}
                  type="button"
                >
                  <span className="block"><strong>Pieza {item.toothNumber}</strong> · {isDentalSurface(item.surface) ? surfaceLabels[item.surface] : "Sin superficie (registro histórico)"}</span>
                  <span className="mt-1 block whitespace-pre-line">{item.observation}</span>
                  <span className="mt-1 block text-xs text-[#62727B]/70">{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.recordedAt))}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
