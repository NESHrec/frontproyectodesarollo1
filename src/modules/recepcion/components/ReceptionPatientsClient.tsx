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
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(""); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  return <div className="space-y-7">
    <InternalPageHeader actions={<ModalDialog description="Solo crea un expediente administrativo; no crea credenciales ni vincula cuentas automáticamente." title="Nuevo expediente administrativo" triggerLabel="Nuevo paciente"><PatientForm onSaved={() => void load(search)} /></ModalDialog>} description="Directorio persistido de datos administrativos mínimos. No muestra diagnósticos, recetas ni otra información clínica." eyebrow="Recepción" title="Pacientes" />
    <form onSubmit={(event) => { event.preventDefault(); void load(search); }}><SearchFilters><Input label="Buscar por nombre, teléfono o correo" placeholder="Buscar" type="search" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="flex items-end"><Button type="submit">Buscar</Button></div></SearchFilters></form>
    {patients === null && !error ? <LoadingState message="Consultando pacientes persistidos…" /> : null}
    {error === "forbidden" ? <section className="rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">Acceso denegado</h2><p className="mt-1 text-sm">Tu cuenta no puede consultar el directorio.</p></section> : null}
    {error === "service" ? <section className="space-y-3 rounded-lg bg-[#F8E2E8] p-5" role="alert"><h2 className="font-bold">No se pudo cargar el directorio</h2><p className="text-sm">El servicio no respondió.</p><Button onClick={() => void load(search)}>Intentar nuevamente</Button></section> : null}
    {patients?.length === 0 ? <EmptyState description="No hay pacientes persistidos que coincidan con la búsqueda." title="Directorio vacío" /> : null}
    {patients && patients.length > 0 ? <DataTable caption="Directorio persistido de pacientes" columns={columns} getRowKey={(item) => item.patientId} rows={patients} /> : null}
  </div>;
}
