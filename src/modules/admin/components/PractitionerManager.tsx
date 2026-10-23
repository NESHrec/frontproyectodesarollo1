"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Especialidad, Medico } from "@/shared/types/catalogo-medico";
import { Button, Card, EmptyState, Input, LoadingState, SelectField, StatusBadge } from "@/shared/components";
import { getCsrfToken } from "@/modules/auth/csrf-client";
import { PractitionerPortrait } from "@/modules/catalogo-medico/components/PractitionerPortrait";

type Draft = { fullName: string; specialtyId: string; licenseNumber: string };
const empty: Draft = { fullName: "", specialtyId: "", licenseNumber: "" };
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 1600;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("PHOTO_DECODE_FAILED")); };
    image.src = url;
  });
}

async function normalizePhoto(file: File) {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(64, Math.round(image.naturalWidth * scale));
  const height = Math.max(64, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PHOTO_CANVAS_UNAVAILABLE");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.86, 0.76, 0.66, 0.56]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_PHOTO_BYTES) {
      const name = `${file.name.replace(/\.[^.]+$/, "") || "profesional"}.jpg`;
      return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
    }
  }
  throw new Error("PHOTO_TOO_LARGE");
}

export function PractitionerManager({ specialties }: { specialties: Especialidad[] }) {
  const [items, setItems] = useState<Medico[] | null>(null);
  const [editing, setEditing] = useState<Medico | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/staff/practitioners", { cache: "no-store" });
    if (!response.ok) { setMessage(response.status === 401 ? "Tu sesión ADMIN expiró." : response.status === 403 ? "Solo ADMIN puede consultar profesionales." : "No se pudo cargar el catálogo de profesionales."); setItems([]); return; }
    setItems(await response.json());
  }
  useEffect(() => { let active = true; void fetch("/api/staff/practitioners", { cache: "no-store" }).then(async response => { const data = response.ok ? await response.json() : []; if (active) setItems(data); }); return () => { active = false; }; }, []);
  const preview = useMemo(() => photo ? URL.createObjectURL(photo) : null, [photo]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const specialtyNames = useMemo(() => new Map(specialties.map(item => [item.id, item.name])), [specialties]);

  function select(item: Medico | null) { setEditing(item); setDraft(item ? { fullName: item.fullName, specialtyId: item.specialtyId, licenseNumber: item.licenseNumber ?? "" } : empty); setPhoto(null); setMessage(null); }
  async function selectPhoto(file: File | null) {
    if (!file) { setPhoto(null); return; }
    setPhotoProcessing(true); setPhoto(null); setMessage(null);
    try {
      setPhoto(await normalizePhoto(file));
    } catch (error) {
      setMessage(error instanceof Error && error.message === "PHOTO_TOO_LARGE"
        ? "La foto no se pudo comprimir por debajo de 2 MB. Usa una imagen más pequeña."
        : "No se pudo leer la imagen. Selecciona una fotografía JPEG, PNG, WebP o AVIF válida.");
    } finally { setPhotoProcessing(false); }
  }
  async function csrfHeaders(json = false) { const token = await getCsrfToken(); return { "x-csrf-token": token, ...(json ? { "Content-Type": "application/json" } : {}) }; }
  async function save(event: React.FormEvent) {
    if (photoProcessing) return;
    event.preventDefault(); setBusy(true); setMessage(null);
    try {
      const response = await fetch(editing ? `/api/staff/practitioners/${editing.id}` : "/api/staff/practitioners", { method: editing ? "PATCH" : "POST", headers: await csrfHeaders(true), body: JSON.stringify(draft) });
      if (!response.ok) { setMessage(response.status === 409 ? "Ese número de colegiado ya está registrado." : "No se pudo guardar el profesional."); return; }
      const saved = await response.json() as Medico;
      if (photo) {
        const form = new FormData(); form.set("photo", photo);
        const upload = await fetch(`/api/staff/practitioners/${saved.id}/photo`, { method: "PUT", headers: await csrfHeaders(), body: form });
        if (!upload.ok) {
          const detail = await upload.json().catch(() => null) as { code?: unknown } | null;
          const code = typeof detail?.code === "string" ? detail.code : "";
          const reason = code === "PHOTO_TOO_LARGE" || code === "PHOTO_SIZE_INVALID"
            ? "La foto supera el máximo de 2 MB."
            : code === "PHOTO_TYPE_INVALID"
              ? "El archivo no contiene una imagen JPEG o PNG válida."
              : code === "PHOTO_CONTENT_INVALID"
                ? "La imagen no se pudo procesar. Prueba con otra fotografía."
                : "No se pudo guardar la fotografía; revisa el formato y el tamaño.";
          setEditing(saved); setMessage(`El profesional se guardó, pero la foto fue rechazada. ${reason}`); await load(); return;
        }
      }
      const successMessage = editing ? "Profesional actualizado." : "Profesional creado."; select(null); setMessage(successMessage); await load();
    } catch { setMessage("No se pudo conectar con el servicio."); } finally { setBusy(false); }
  }
  async function status(item: Medico) { setBusy(true); const response = await fetch(`/api/staff/practitioners/${item.id}/status`, { method: "PATCH", headers: await csrfHeaders(true), body: JSON.stringify({ active: !item.active }) }); setMessage(response.ok ? (item.active ? "Profesional desactivado; ya no aparece públicamente." : "Profesional activado.") : "No se pudo cambiar el estado."); await load(); setBusy(false); }
  async function removePhoto(item: Medico) { setBusy(true); const response = await fetch(`/api/staff/practitioners/${item.id}/photo`, { method: "DELETE", headers: await csrfHeaders() }); setMessage(response.ok ? "Foto quitada." : "No se pudo quitar la foto."); await load(); setBusy(false); }

  return (
    <div className="grid gap-7 xl:grid-cols-[22rem_1fr]">
      <Card className="self-start overflow-hidden rounded-[1.5rem] border-[#62727B]/15 xl:sticky xl:top-6">
        <div className="-mx-5 -mt-5 bg-[#334B54] px-5 py-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#DDF3F1]/70">{editing ? "Edición" : "Alta administrativa"}</p>
          <h2 className="mt-2 text-xl font-black">{editing ? "Editar profesional" : "Nuevo profesional"}</h2>
          <p className="mt-2 text-sm text-white/65">Datos de catálogo y fotografía autorizada.</p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={save}>
          <Input id="practitioner-name" label="Nombre completo" maxLength={160} onChange={e => setDraft({...draft, fullName:e.target.value})} required value={draft.fullName}/>
          <SelectField id="practitioner-specialty" label="Especialidad" onChange={e => setDraft({...draft, specialtyId:e.target.value})} required value={draft.specialtyId}><option value="">Selecciona una especialidad</option>{specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</SelectField>
          <Input id="practitioner-license" label="Número de colegiado" maxLength={50} onChange={e => setDraft({...draft, licenseNumber:e.target.value})} required value={draft.licenseNumber}/>
          <div className="rounded-2xl border border-dashed border-[#56777A]/35 bg-[#DDF3F1]/25 p-4"><label className="block text-sm font-bold" htmlFor="practitioner-photo">Fotografía profesional</label><input accept="image/jpeg,image/png,image/webp,image/avif" aria-describedby="photo-help" className="mt-3 block min-h-11 w-full rounded-xl border border-[#56777A]/20 bg-white/75 p-2 text-sm text-[#334B54] file:mr-3 file:rounded-lg file:border-0 file:bg-[#DDF3F1] file:px-3 file:py-2 file:font-bold file:text-[#334B54] hover:file:bg-[#E5F1D8]" id="practitioner-photo" onChange={e => { void selectPhoto(e.target.files?.[0] ?? null); }} type="file" /><p className="mt-2 text-xs leading-5 text-[#62727B]" id="photo-help">JPEG, PNG, WebP o AVIF. Se convierte automáticamente a JPEG y se limita a 2 MB.</p></div>
          {preview ? <Image alt="Vista previa de la foto seleccionada" className="h-44 w-full rounded-2xl object-cover" height={176} src={preview} unoptimized width={480}/> : editing ? <PractitionerPortrait practitioner={editing}/> : null}
          <div className="flex flex-wrap gap-2"><Button disabled={busy || photoProcessing} type="submit">{photoProcessing ? "Procesando foto…" : busy ? "Guardando…" : editing ? "Guardar cambios" : "Crear profesional"}</Button>{editing ? <Button onClick={() => select(null)} type="button" variant="secondary">Cancelar</Button> : null}</div>
        </form>
        {message ? <p className="mt-5 rounded-xl bg-[#F8EDD2] p-3 text-sm" role="status">{message}</p> : null}
      </Card>
      <section className="min-w-0">
        <div className="mb-4 flex items-end justify-between border-b border-[#62727B]/15 pb-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Directorio clínico</p><h2 className="mt-1 text-2xl font-black text-[#263238]">Profesionales</h2></div><span className="text-sm font-bold text-[#62727B]">{items?.length ?? 0} registrados</span></div>
        {items === null ? <LoadingState message="Cargando profesionales…"/> : items.length === 0 ? <EmptyState title="Sin profesionales" description="Crea el primer profesional del catálogo."/> : <div className="grid gap-4 md:grid-cols-2">{items.map(item => <article className="group overflow-hidden rounded-[1.5rem] border border-[#62727B]/15 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(38,50,56,0.55)] transition duration-200 hover:-translate-y-0.5 hover:border-[#56777A]/35" key={item.id}><PractitionerPortrait practitioner={item}/><div className="mt-5 flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-black text-[#263238]">{item.fullName}</h3><p className="mt-1 text-sm text-[#62727B]">{specialtyNames.get(item.specialtyId)}</p><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#62727B]/65">Colegiado {item.licenseNumber}</p></div><StatusBadge tone={item.active ? "pistacho" : "rosa"}>{item.active ? "Activo" : "Inactivo"}</StatusBadge></div><div className="mt-5 flex flex-wrap gap-2 border-t border-[#62727B]/12 pt-4"><Button onClick={() => select(item)} type="button" variant="secondary">Editar</Button><Button disabled={busy} onClick={() => void status(item)} type="button" variant="secondary">{item.active ? "Desactivar" : "Activar"}</Button>{item.photoUrl ? <Button disabled={busy} onClick={() => void removePhoto(item)} type="button" variant="ghost">Quitar foto</Button> : null}</div></article>)}</div>}
      </section>
    </div>
  );
}
