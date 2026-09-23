import Link from "next/link";
import { appointments, type Appointment } from "@/modules/agenda-citas/data";
import { DataTable, Input, InternalPageHeader, SearchFilters, StatusBadge, buttonLinkClasses, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Appointment>[] = [
  { key: "datetime", label: "Fecha y hora", render: (item) => <div><p className="font-semibold">{item.date}</p><p>{item.time}</p></div> },
  { key: "patient", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.patient}</p><p className="text-xs">{item.patientId}</p></div> },
  { key: "specialty", label: "Tipo", render: (item) => item.specialty },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone="agua">{item.status}</StatusBadge> },
  { key: "record", label: "Acceso clínico", render: (item) => <Link className="font-bold underline-offset-4 hover:underline" href={`/medico/pacientes/${item.patientId}/expediente`}>Ver resumen</Link> },
];
export default function DoctorAgendaPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/horarios">Gestionar horarios</Link>} description="Agenda personal del profesional con acceso visual a resúmenes clínicos ficticios." eyebrow="Médico / Odontólogo" title="Mi agenda" /><SearchFilters><Input defaultValue="2026-09-16" label="Fecha" type="date" /><Input label="Buscar paciente" placeholder="Nombre o código" type="search" /></SearchFilters><DataTable caption="Agenda personal" columns={columns} getRowKey={(item) => item.id} rows={appointments.filter((item) => item.status !== "Cancelada")} /></div>;
}
