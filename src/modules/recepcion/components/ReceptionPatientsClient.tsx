"use client";

import { useCallback, useEffect, useState } from "react";

import { PatientForm } from "@/modules/pacientes/components/PatientForm";
import { Button, DataTable, EmptyState, Input, InternalPageHeader, LoadingState, ModalDialog, SearchFilters, type DataTableColumn } from "@/shared/components";
import { PatientLinkInitiator } from "@/modules/recepcion/components/PatientLinkInitiator";

type AdministrativePatient = {
  patientId: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  recordType: "AUTORREGISTRADO" | "EXPEDIENTE_ADMINISTRATIVO" | "AUTORREGISTRADO+EXPEDIENTE_ADMINISTRATIVO" | "HISTORICO";
  patientAccountLinked: boolean;
  createdAt: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const columns: DataTableColumn<AdministrativePatient>[] = [
  { key: "patient", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.fullName ?? "Sin nombre disponible"}</p><p className="text-xs text-[#62727B]/70">{item.patientId}</p></div> },
  { key: "phone", label: "Teléfono", render: (item) => item.phone ?? "No informado" },
  { key: "email", label: "Correo de contacto", render: (item) => item.email ?? "No informado" },
  { key: "type", label: "Origen", render: (item) => item.recordType === "AUTORREGISTRADO+EXPEDIENTE_ADMINISTRATIVO" ? "Cuenta y expediente" : item.recordType === "AUTORREGISTRADO" ? "Cuenta autorregistrada" : item.recordType === "EXPEDIENTE_ADMINISTRATIVO" ? "Expediente administrativo" : "Registro histórico" },
  { key: "created", label: "Alta", render: (item) => item.createdAt ? formatDate(item.createdAt) : "No disponible" },
  { key: "link", label: "Vinculación", render: (item) => item.patientAccountLinked ? "Cuenta vinculada" : item.recordType === "EXPEDIENTE_ADMINISTRATIVO" ? <PatientLinkInitiator patientId={item.patientId}/> : "No aplica" },
];

export function ReceptionPatientsClient() {
  const [patients, setPatients] = useState<AdministrativePatient[] | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [error, setError] = useState<"forbidden" | "service" | null>(null);

  const load = useCallback(async (term: string) => {
    setPatients(null);
    setError(null);
    const query = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : "";
    const response = await fetch(`/api/staff/patients${query}`, { cache: "no-store" }).catch(() => null);
    if (!response) { setError("service"); return; }
    if (response.status === 401 || response.status === 403) { setError("forbidden"); return; }
    if (!response.ok) { setError("service"); return; }
    const body = await response.json().catch(() => null) as { items?: unknown } | null;
    if (!Array.isArray(body?.items)) { setError("service"); return; }
    setPatients(body.items as AdministrativePatient[]);
    setAppliedSearch(term.trim());
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(""); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  return <div className="space-y-6 lg:space-y-7">
    <InternalPageHeader actions={<ModalDialog description="Solo crea un expediente administrativo; no crea credenciales ni vincula cuentas automáticamente." title="Nuevo expediente administrativo" triggerLabel="Nuevo paciente"><PatientForm onSaved={() => void load(search)} /></ModalDialog>} description="Directorio persistido de datos administrativos mínimos. No muestra diagnósticos, recetas ni otra información clínica." eyebrow="Recepción" title="Pacientes" />
    <form aria-label="Buscar pacientes" className="overflow-hidden rounded-[1.5rem] border border-[#56777A]/20 bg-[#FBFCFA] shadow-[0_12px_32px_rgba(51,75,84,0.07)]" onSubmit={(event) => { event.preventDefault(); void load(search); }}>
      <div className="border-b border-[#56777A]/15 bg-gradient-to-r from-[#DDF3F1]/80 to-[#FBFCFA] px-4 py-4 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#56777A]">Directorio administrativo</p><h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-[#334B54]">Buscar en pacientes</h2><p className="mt-1 text-sm leading-5 text-[#62727B]">Busca en los datos administrativos disponibles; esta vista no muestra información clínica.</p></div>
      <div className="p-4 sm:p-6"><SearchFilters><Input label="Buscar por nombre, teléfono o correo" placeholder="Escribe un dato administrativo" type="search" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="flex flex-wrap items-end gap-2"><Button disabled={patients === null} type="submit">Buscar</Button>{appliedSearch ? <Button onClick={() => { setSearch(""); void load(""); }} variant="ghost">Limpiar</Button> : null}</div></SearchFilters><p className="mt-3 text-xs leading-5 text-[#62727B]">Los resultados solo incluyen información administrativa, no expedientes ni notas clínicas.</p></div>
    </form>
    {patients === null && !error ? <LoadingState message="Consultando pacientes persistidos…" /> : null}
    {error === "forbidden" ? <section className="rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">Acceso denegado</h2><p className="mt-1 text-sm">Tu cuenta no puede consultar el directorio.</p></section> : null}
    {error === "service" ? <section className="space-y-3 rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">No se pudo cargar el directorio</h2><p className="text-sm">El servicio no respondió.</p><Button onClick={() => void load(search)}>Intentar nuevamente</Button></section> : null}
    {patients ? <div className="flex flex-col gap-2 rounded-lg border border-[#62727B]/15 bg-[#DDF3F1] px-4 py-3 text-sm text-[#334B54] sm:flex-row sm:items-center sm:justify-between" role="status"><span className="font-bold">{patients.length} {patients.length === 1 ? "paciente encontrado" : "pacientes encontrados"}</span><span>{appliedSearch ? `Filtro activo: “${appliedSearch}”` : "Directorio completo disponible"}</span></div> : null}
    {patients?.length === 0 ? <EmptyState description={appliedSearch ? "No hay pacientes que coincidan con la búsqueda. Revisa el término o limpia el filtro." : "No hay pacientes persistidos en el directorio."} title={appliedSearch ? "Sin coincidencias" : "Directorio vacío"} /> : null}
    {patients && patients.length > 0 ? <section className="space-y-3" aria-labelledby="patient-results-title"><div className="flex flex-col gap-1 border-b border-[#56777A]/15 pb-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#334B54]" id="patient-results-title">Resultados administrativos</h2><p className="mt-1 text-sm text-[#62727B]">La información clínica no se muestra en esta vista.</p></div><span className="w-fit rounded-full bg-[#DDF3F1] px-3 py-1 text-xs font-bold text-[#334B54]">{patients.length} {patients.length === 1 ? "registro" : "registros"}</span></div><div aria-label="Resultados de pacientes" className="overflow-x-auto rounded-2xl border border-[#62727B]/15 bg-white shadow-[0_12px_32px_rgba(51,75,84,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A]" role="region" tabIndex={0}><p className="border-b border-[#62727B]/10 bg-[#FBFCFA] px-3 py-2 text-xs font-medium text-[#62727B] md:hidden">Desliza horizontalmente para recorrer las columnas.</p><DataTable caption="Directorio persistido de pacientes" columns={columns} getRowKey={(item) => item.patientId} rows={patients} /></div></section> : null}
  </div>;
}
