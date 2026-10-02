"use client";

import { useState } from "react";
import { Button, EmptyState, Input } from "@/shared/components";
import { getCsrfToken } from "@/modules/auth/csrf-client";
import type { DentalObservation } from "@/modules/odontologia/schemas";

export function Odontogram({ patientId, appointmentId, initialObservations }: { patientId: string; appointmentId?: string; initialObservations: DentalObservation[] }) {
  const [observations, setObservations] = useState(initialObservations);
  const [toothNumber, setToothNumber] = useState("");
  const [observation, setObservation] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointmentId) { setMessage({ tone: "error", text: "Abre el odontograma desde una cita propia para registrar una observación." }); return; }
    setBusy(true); setMessage(null);
    try {
      const response = await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/odontograma`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": await getCsrfToken() },
        body: JSON.stringify({ toothNumber: Number(toothNumber), observation }),
      });
      if (response.status === 409) { setMessage({ tone: "error", text: "La cita no admite observaciones en este momento." }); return; }
      if (response.status === 400) { setMessage({ tone: "error", text: "Indica una pieza dental válida y una observación." }); return; }
      if (!response.ok) { setMessage({ tone: "error", text: "No se pudo guardar la observación." }); return; }
      const saved = await response.json() as DentalObservation;
      if (saved.patientId !== patientId) { setMessage({ tone: "error", text: "La respuesta no corresponde al paciente de esta pantalla." }); return; }
      setObservations((current) => [saved, ...current]); setToothNumber(""); setObservation("");
      setMessage({ tone: "ok", text: "Observación persistida." });
    } catch { setMessage({ tone: "error", text: "El servicio no está disponible." }); }
    finally { setBusy(false); }
  }

  return (
    <section aria-labelledby="odontogram-title" className="space-y-5 rounded-xl border border-[#62727B]/15 bg-white p-5">
      <div><h2 className="text-lg font-bold text-[#62727B]" id="odontogram-title">Odontograma persistido</h2><p className="mt-2 text-sm text-[#62727B]/75">Solo muestra observaciones guardadas en citas propias. Los registros son append-only y no sobrescriben atención ni receta.</p></div>
      {!appointmentId ? <p className="rounded-md bg-[#F8EDD2] px-3 py-2 text-sm" role="status">Para registrar, abre esta pantalla desde una cita de tu agenda.</p> : <form className="grid gap-4 sm:grid-cols-[10rem_1fr_auto] sm:items-end" onSubmit={submit}><Input label="Pieza FDI" min={11} max={48} required type="number" value={toothNumber} onChange={(event) => setToothNumber(event.target.value)} /><Input label="Observación" maxLength={500} required value={observation} onChange={(event) => setObservation(event.target.value)} /><Button disabled={busy} type="submit">{busy ? "Guardando…" : "Guardar observación"}</Button></form>}
      {message ? <p className={message.tone === "ok" ? "rounded-md bg-[#E5F1D8] px-3 py-2 text-sm" : "rounded-md bg-[#F8E2E8] px-3 py-2 text-sm"} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p> : null}
      {observations.length === 0 ? <EmptyState description="No hay observaciones persistidas para este paciente desde tus citas." title="Odontograma vacío" /> : <div className="overflow-x-auto rounded-lg border border-[#62727B]/15"><table className="min-w-full text-left text-sm"><caption className="sr-only">Observaciones odontológicas persistidas</caption><thead className="bg-[#DDF3F1]"><tr><th className="px-4 py-3">Pieza</th><th className="px-4 py-3">Observación</th><th className="px-4 py-3">Cita</th><th className="px-4 py-3">Registrada</th></tr></thead><tbody>{observations.map((item) => <tr className="border-t border-[#62727B]/10" key={item.id}><td className="px-4 py-3 font-semibold">{item.toothNumber}</td><td className="px-4 py-3">{item.observation}</td><td className="px-4 py-3">{item.appointmentId}</td><td className="px-4 py-3">{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.recordedAt))}</td></tr>)}</tbody></table></div>}
    </section>
  );
}
