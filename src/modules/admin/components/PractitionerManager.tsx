"use client";

import { useEffect, useMemo, useState } from "react";
import type { Especialidad, Medico } from "@/shared/types/catalogo-medico";
import { Button, Card, EmptyState, LoadingState, StatusBadge } from "@/shared/components";
import { getCsrfToken } from "@/modules/auth/csrf-client";
import { PractitionerPortrait } from "@/modules/catalogo-medico/components/PractitionerPortrait";

type Draft = { fullName: string; specialtyId: string; licenseNumber: string };
const empty: Draft = { fullName: "", specialtyId: "", licenseNumber: "" };

export function PractitionerManager({ specialties }: { specialties: Especialidad[] }) {
  const [items, setItems] = useState<Medico[] | null>(null);
  const [editing, setEditing] = useState<Medico | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() { const response = await fetch("/api/staff/practitioners", { cache: "no-store" }); setItems(response.ok ? await response.json() : []); }
  useEffect(() => { let active = true; void fetch("/api/staff/practitioners", { cache: "no-store" }).then(async response => { const data = response.ok ? await response.json() : []; if (active) setItems(data); }); return () => { active = false; }; }, []);
  const preview = useMemo(() => photo ? URL.createObjectURL(photo) : null, [photo]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const specialtyNames = useMemo(() => new Map(specialties.map(item => [item.id, item.name])), [specialties]);

  function select(item: Medico | null) { setEditing(item); setDraft(item ? { fullName: item.fullName, specialtyId: item.specialtyId, licenseNumber: item.licenseNumber ?? "" } : empty); setPhoto(null); setMessage(null); }
  async function csrfHeaders(json = false) { const token = await getCsrfToken(); return { "x-csrf-token": token, ...(json ? { "Content-Type": "application/json" } : {}) }; }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(null);
    try {
      const response = await fetch(editing ? `/api/staff/practitioners/${editing.id}` : "/api/staff/practitioners", { method: editing ? "PATCH" : "POST", headers: await csrfHeaders(true), body: JSON.stringify(draft) });
      if (!response.ok) { setMessage(response.status === 409 ? "Ese número de colegiado ya está registrado." : "No se pudo guardar el profesional."); return; }
      const saved = await response.json() as Medico;
      if (photo) { const form = new FormData(); form.set("photo", photo); const upload = await fetch(`/api/staff/practitioners/${saved.id}/photo`, { method: "PUT", headers: await csrfHeaders(), body: form }); if (!upload.ok) { setEditing(saved); setMessage("El profesional se guardó, pero la foto fue rechazada. Usa JPEG o PNG de hasta 2 MB."); await load(); return; } }
      const successMessage = editing ? "Profesional actualizado." : "Profesional creado."; select(null); setMessage(successMessage); await load();
    } catch { setMessage("No se pudo conectar con el servicio."); } finally { setBusy(false); }
  }
  async function status(item: Medico) { setBusy(true); const response = await fetch(`/api/staff/practitioners/${item.id}/status`, { method: "PATCH", headers: await csrfHeaders(true), body: JSON.stringify({ active: !item.active }) }); setMessage(response.ok ? (item.active ? "Profesional desactivado; ya no aparece públicamente." : "Profesional activado.") : "No se pudo cambiar el estado."); await load(); setBusy(false); }
  async function removePhoto(item: Medico) { setBusy(true); const response = await fetch(`/api/staff/practitioners/${item.id}/photo`, { method: "DELETE", headers: await csrfHeaders() }); setMessage(response.ok ? "Foto quitada." : "No se pudo quitar la foto."); await load(); setBusy(false); }

  return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
    <Card className="self-start"><h2 className="text-xl font-bold text-[#334B54]">{editing ? "Editar profesional" : "Nuevo profesional"}</h2><p className="mt-2 text-sm text-[#62727B]">La fotografía es opcional y debe estar autorizada por la clínica o el profesional.</p>
      <form className="mt-5 space-y-4" onSubmit={save}>
        <label className="block text-sm font-semibold">Nombre completo<input className="mt-2 w-full rounded-md border p-3" maxLength={160} onChange={e => setDraft({...draft, fullName:e.target.value})} required value={draft.fullName}/></label>
        <label className="block text-sm font-semibold">Especialidad<select className="mt-2 w-full rounded-md border p-3" onChange={e => setDraft({...draft, specialtyId:e.target.value})} required value={draft.specialtyId}><option value="">Selecciona una especialidad</option>{specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="block text-sm font-semibold">Número de colegiado<input className="mt-2 w-full rounded-md border p-3" maxLength={50} onChange={e => setDraft({...draft, licenseNumber:e.target.value})} required value={draft.licenseNumber}/></label>
        <label className="block text-sm font-semibold">Foto JPEG o PNG, máximo 2 MB<input accept="image/jpeg,image/png" className="mt-2 block w-full text-sm" onChange={e => setPhoto(e.target.files?.[0] ?? null)} type="file" /></label>
        {preview ? <img alt="Vista previa de la foto seleccionada" className="h-44 w-full rounded-xl object-cover" src={preview}/> : editing ? <PractitionerPortrait practitioner={editing}/> : null}
        <div className="flex flex-wrap gap-2"><Button disabled={busy} type="submit">{busy ? "Guardando…" : editing ? "Guardar cambios" : "Crear profesional"}</Button>{editing ? <Button onClick={() => select(null)} type="button" variant="secondary">Cancelar</Button> : null}</div>
      </form>{message ? <p className="mt-4 rounded-md bg-[#F8EDD2] p-3 text-sm" role="status">{message}</p> : null}
    </Card>
    <section>{items === null ? <LoadingState message="Cargando profesionales…"/> : items.length === 0 ? <EmptyState title="Sin profesionales" description="Crea el primer profesional del catálogo."/> : <div className="grid gap-4 md:grid-cols-2">{items.map(item => <Card className="flex flex-col gap-4" key={item.id}><PractitionerPortrait practitioner={item}/><div><StatusBadge tone={item.active ? "pistacho" : "rosa"}>{item.active ? "Activo" : "Inactivo"}</StatusBadge><h3 className="mt-3 text-lg font-bold">{item.fullName}</h3><p className="text-sm text-[#62727B]">{specialtyNames.get(item.specialtyId)} · {item.licenseNumber}</p></div><div className="mt-auto flex flex-wrap gap-2"><Button onClick={() => select(item)} type="button" variant="secondary">Editar</Button><Button disabled={busy} onClick={() => void status(item)} type="button" variant="secondary">{item.active ? "Desactivar" : "Activar"}</Button>{item.photoUrl ? <Button disabled={busy} onClick={() => void removePhoto(item)} type="button" variant="secondary">Quitar foto</Button> : null}</div></Card>)}</div>}</section>
  </div>;
}
