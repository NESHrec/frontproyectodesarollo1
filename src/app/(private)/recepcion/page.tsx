import Link from "next/link";
import { appointments, type Appointment } from "@/modules/agenda-citas/data";
import { ConfirmDialog, DataTable, InternalPageHeader, MetricCard, StatusBadge, buttonLinkClasses, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Appointment>[] = [
  { key: "time", label: "Hora", render: (item) => <span className="font-bold">{item.time}</span> },
  { key: "patient", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.patient}</p><p className="text-xs text-[#62727B]/65">{item.id}</p></div> },
  { key: "doctor", label: "Profesional", render: (item) => <div><p>{item.doctor}</p><p className="text-xs text-[#62727B]/65">{item.specialty}</p></div> },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Cancelada" ? "rosa" : item.status === "Completada" ? "pistacho" : "crema"}>{item.status}</StatusBadge> },
  { key: "arrival", label: "Llegada", render: (item) => item.arrival === "Registrada" ? <StatusBadge tone="agua">Registrada</StatusBadge> : <ConfirmDialog confirmLabel="Registrar llegada" description={`Esta acción solo simula la llegada de ${item.patient}.`} simulatedResult="Llegada simulada" title="Registrar llegada" triggerLabel="Marcar llegada" /> },
];

export default function ReceptionDashboardPage() {
  return (
    <div className="space-y-7">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="Seguimiento administrativo del día sin acceso a diagnósticos, expedientes ni contenido clínico." eyebrow="Recepción" title="Resumen operativo" />
      <section aria-label="Indicadores del día" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="5 programadas y 1 cancelada" label="Citas del día" value="6" />
        <MetricCard detail="Pacientes con registro activo" label="Pacientes activos" tone="pistacho" value="128" />
        <MetricCard detail="Monto ficticio Q 780.00" label="Cobros pendientes" tone="rosa" value="2" />
        <MetricCard detail="Total ficticio Q 1,270.00" label="Pagos recibidos" tone="crema" value="3" />
      </section>
      <section className="space-y-4"><div><h2 className="text-xl font-bold text-[#62727B]">Agenda de hoy</h2><p className="text-sm text-[#62727B]/70">Miércoles 16 de septiembre de 2026</p></div><DataTable caption="Citas administrativas del día" columns={columns} getRowKey={(item) => item.id} rows={appointments.filter((item) => item.date === "2026-09-16")} /></section>
    </div>
  );
}
