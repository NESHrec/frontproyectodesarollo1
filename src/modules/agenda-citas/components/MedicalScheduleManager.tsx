"use client";

import { useCallback, useEffect, useState } from "react";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { medicalScheduleErrorText } from "@/modules/agenda-citas/medical-schedule-errors";
import { formatGuatemalaInstant, guatemalaWallTimeToIso } from "@/modules/agenda-citas/timezone";
import { Button, Card, Input, LoadingState } from "@/shared/components";

type Block = { id: string; practitionerId: string; startAt: string; endAt: string; available: boolean };

export function MedicalScheduleManager() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unauthorized" | "forbidden" | "service">("loading");
  const [date, setDate] = useState("");
  const [startTime, setStart] = useState("");
  const [endTime, setEnd] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await fetch("/api/staff/medico/horarios", { cache: "no-store" });
      if (response.status === 401) return setState("unauthorized");
      if (response.status === 403) return setState("forbidden");
      if (!response.ok) return setState("service");
      const body = await response.json() as unknown;
      if (!Array.isArray(body)) return setState("service");
      setBlocks(body as Block[]);
      setState("ready");
    } catch {
      setState("service");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  function clear() {
    setDate("");
    setStart("");
    setEnd("");
    setEditing(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const startAt = guatemalaWallTimeToIso(date, startTime);
    const endAt = guatemalaWallTimeToIso(date, endTime);
    if (!startAt || !endAt || startAt >= endAt) return setMessage("Indica un intervalo válido.");
    setBusy(true);
    try {
      const csrf = await getCsrfToken();
      const response = await fetch(editing ? `/api/staff/medico/horarios/${encodeURIComponent(editing)}` : "/api/staff/medico/horarios", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ startAt, endAt }),
      });
      if (response.ok) {
        setMessage(editing ? "Bloque actualizado y persistido." : "Bloque guardado.");
        clear();
        await load();
        return;
      }
      const body = await response.json().catch(() => null) as { code?: string } | null;
      setMessage(medicalScheduleErrorText(response.status, body?.code));
    } catch {
      setMessage("No se pudo conectar con el servicio.");
    } finally {
      setBusy(false);
    }
  }

  async function retire(id: string) {
    setMessage(null);
    setBusy(true);
    try {
      const csrf = await getCsrfToken();
      const response = await fetch(`/api/staff/medico/horarios/${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-csrf-token": csrf } });
      if (response.ok) {
        setMessage("Bloque retirado; ya no admite nuevas reservas.");
        await load();
        return;
      }
      const body = await response.json().catch(() => null) as { code?: string } | null;
      setMessage(medicalScheduleErrorText(response.status, body?.code));
    } catch {
      setMessage("No se pudo conectar con el servicio.");
    } finally {
      setBusy(false);
    }
  }

  function edit(block: Block) {
    const parts = (value: string) => Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guatemala", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value)).map((part) => [part.type, part.value]));
    const start = parts(block.startAt);
    const end = parts(block.endAt);
    setDate(`${start.year}-${start.month}-${start.day}`);
    setStart(`${start.hour}:${start.minute}`);
    setEnd(`${end.hour}:${end.minute}`);
    setEditing(block.id);
  }

  if (state === "loading") return <LoadingState message="Cargando tus horarios persistidos…" />;
  if (state === "unauthorized") return <Card><p role="alert">Tu sesión médica expiró.</p></Card>;
  if (state === "forbidden") return <Card><p role="alert">La cuenta no tiene permiso o vínculo médico.</p></Card>;
  if (state === "service") return <Card><p role="alert">No se pudo consultar el servicio de horarios.</p></Card>;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(18rem,.78fr)_minmax(0,1.22fr)]">
      <Card className="self-start rounded-[1.75rem] border-[#62727B]/12 bg-white shadow-[0_20px_55px_-44px_rgba(38,50,56,.65)] xl:sticky xl:top-24">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Disponibilidad personal</p><h2 className="mt-1 text-xl font-black text-[#334B54]">{editing ? "Editar bloque" : "Agregar bloque"}</h2></div>
          <span className="rounded-full bg-[#DDF3F1] px-3 py-1 text-xs font-semibold text-[#334B54]">America/Guatemala</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#62727B]">El profesional se obtiene de tu sesión; nunca se selecciona desde el navegador.</p>
        <form aria-busy={busy} className="mt-6 grid gap-5" onSubmit={save}>
          <Input disabled={busy} label="Fecha" required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Input disabled={busy} label="Desde" required type="time" value={startTime} onChange={(event) => setStart(event.target.value)} />
            <Input disabled={busy} label="Hasta" required type="time" value={endTime} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-[#62727B]/12 pt-5"><Button disabled={busy} loading={busy} type="submit">{editing ? "Guardar cambios" : "Agregar bloque"}</Button>{editing ? <Button disabled={busy} type="button" onClick={clear} variant="ghost">Cancelar</Button> : null}</div>
        </form>
        {message ? <p aria-live="polite" className="mt-4 rounded-xl border border-[#62727B]/10 bg-[#F6FAFA] px-4 py-3 text-sm font-semibold" role="status">{message}</p> : null}
      </Card>

      <Card className="rounded-[1.75rem] border-[#62727B]/12 bg-white shadow-[0_20px_55px_-44px_rgba(38,50,56,.65)]">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#62727B]/12 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Agenda reservable</p><h2 className="mt-1 text-xl font-black text-[#334B54]">Mis bloques persistidos</h2></div><span className="rounded-full bg-[#FBFCFA] px-3 py-1 text-sm font-bold text-[#334B54]">{blocks.length} {blocks.length === 1 ? "bloque" : "bloques"}</span></div>
        {blocks.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#8D6B2E]/25 bg-[#F8EDD2]/65 p-6 text-center"><p className="font-bold text-[#334B54]">Aún no tienes bloques registrados</p><p className="mt-1 text-sm text-[#62727B]">Agrega disponibilidad para permitir nuevas reservas.</p></div> : <ul className="mt-2 divide-y divide-[#62727B]/12">{blocks.map((block) => <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between" key={block.id}><div className="border-l-2 border-[#DDF3F1] pl-4"><span className="block font-bold text-[#334B54]">{formatGuatemalaInstant(block.startAt)}</span><span className="mt-1 block text-sm text-[#62727B]">Hasta {formatGuatemalaInstant(block.endAt)}</span></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${block.available ? "bg-[#E5F1D8] text-[#334B54]" : "bg-[#F8EDD2] text-[#6D572D]"}`}>{block.available ? "Disponible" : "Reservado o retirado"}</span>{block.available ? <><Button disabled={busy} type="button" onClick={() => edit(block)} variant="secondary">Editar</Button><Button disabled={busy} type="button" onClick={() => void retire(block.id)} variant="ghost">Retirar</Button></> : null}</div></li>)}</ul>}
      </Card>
    </div>
  );
}
