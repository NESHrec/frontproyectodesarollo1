"use client";

import { useCallback, useEffect, useState } from "react";
import { getCsrfToken } from "@/modules/auth/csrf-client";
import { formatGuatemalaInstant, guatemalaWallTimeToIso } from "@/modules/agenda-citas/timezone";
import { Button, Card, Input, LoadingState } from "@/shared/components";

type ScheduleBlock = { id: string; practitionerId: string; startAt: string; endAt: string; available: boolean };

function display(value: string) {
  return formatGuatemalaInstant(value);
}

export function MedicalScheduleManager() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unauthorized" | "forbidden" | "service">("loading");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await fetch("/api/staff/medico/horarios", { cache: "no-store" });
      if (response.status === 401) { setState("unauthorized"); return; }
      if (response.status === 403) { setState("forbidden"); return; }
      if (!response.ok) { setState("service"); return; }
      const body = await response.json() as unknown;
      if (!Array.isArray(body)) { setState("service"); return; }
      setBlocks(body as ScheduleBlock[]);
      setState("ready");
    } catch { setState("service"); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function addBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const startAt = guatemalaWallTimeToIso(date, startTime);
    const endAt = guatemalaWallTimeToIso(date, endTime);
    if (!startAt || !endAt || startAt >= endAt) {
      setMessage({ tone: "error", text: "Indica una fecha y un intervalo válido; el inicio debe ser anterior al fin." });
      return;
    }
    try {
      const csrf = await getCsrfToken();
      const response = await fetch("/api/staff/medico/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ startAt, endAt }),
      });
      if (response.ok) {
        setMessage({ tone: "success", text: "Bloque guardado. Se actualizó tu lista de horarios." });
        setDate(""); setStartTime(""); setEndTime("");
        await load();
        return;
      }
      const body = await response.json().catch(() => null) as { code?: string } | null;
      setMessage({ tone: "error", text: response.status === 401 ? "Tu sesión médica expiró." : response.status === 403 ? "La cuenta no tiene permiso o vínculo médico." : response.status === 409 || body?.code === "SCHEDULE_OVERLAP" ? "El bloque se solapa con otro horario." : response.status === 400 ? "Revisa la fecha y las horas." : "No se pudo guardar el bloque." });
    } catch { setMessage({ tone: "error", text: "No se pudo conectar con el servicio." }); }
  }

  if (state === "loading") return <LoadingState message="Cargando tus horarios persistidos…" />;
  if (state === "unauthorized") return <Card><p className="font-semibold" role="alert">Tu sesión médica expiró. Inicia sesión nuevamente.</p></Card>;
  if (state === "forbidden") return <Card><p className="font-semibold" role="alert">La cuenta MEDICO debe estar vinculada a un profesional para gestionar horarios.</p></Card>;
  if (state === "service") return <Card><p className="font-semibold" role="alert">No se pudo consultar el servicio de horarios.</p></Card>;

  return <div className="space-y-6">
    <Card>
      <h2 className="text-xl font-bold text-[#62727B]">Agregar bloque</h2>
      <p className="mt-2 text-sm text-[#62727B]/80">El servidor obtiene el profesional desde tu sesión. No se puede elegir otro médico.</p>
      <p className="mt-2 rounded-md bg-[#DDF3F1] px-4 py-3 text-sm font-semibold text-[#62727B]">Las horas se interpretan en zona America/Guatemala (UTC-06:00).</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-end" onSubmit={addBlock}>
        <Input label="Fecha" required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Input label="Desde" required type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        <Input label="Hasta" required type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
        <Button className="sm:col-span-3 sm:justify-self-start" type="submit">Agregar bloque</Button>
      </form>
      {message ? <p className={`mt-4 rounded-md px-4 py-3 text-sm font-semibold ${message.tone === "success" ? "bg-[#E5F1D8]" : "bg-[#F8E2E8]"}`} role="status">{message.text}</p> : null}
    </Card>
    <Card>
      <h2 className="text-xl font-bold text-[#62727B]">Mis bloques persistidos</h2>
      {blocks.length === 0 ? <p className="mt-4 rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold">Aún no tienes bloques registrados.</p> : <ul className="mt-4 divide-y divide-[#62727B]/10">{blocks.map((block) => <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={block.id}><span className="font-semibold">{display(block.startAt)} – {display(block.endAt)}</span><span className="rounded-md bg-[#DDF3F1] px-3 py-1 text-xs font-bold">{block.available ? "Disponible" : "Reservado"}</span></li>)}</ul>}
      <p className="mt-4 text-xs text-[#62727B]/75">Edición/retiro de bloques queda pendiente de definición de negocio para proteger citas ya reservadas.</p>
    </Card>
  </div>;
}
