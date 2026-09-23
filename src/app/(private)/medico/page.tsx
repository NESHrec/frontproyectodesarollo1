import Link from "next/link";
import { appointments, type Appointment } from "@/modules/agenda-citas/data";
import { patients } from "@/modules/pacientes/data";
import { DataTable, InternalPageHeader, MetricCard, PatientSummaryCard, StatusBadge, buttonLinkClasses, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Appointment>[] = [
  { key: "time", label: "Hora", render: (item) => <span className="font-bold">{item.time}</span> },
  { key: "patient", label: "Paciente", render: (item) => item.patient },
  { key: "specialty", label: "Atención", render: (item) => item.specialty },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Completada" ? "pistacho" : "agua"}>{item.status}</StatusBadge> },
];

export default function DoctorDashboardPage() {
  const patient = patients[0];
  return <div className="space-y-7"><InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/consultas/nueva">Nueva consulta</Link>} description="Vista clínica ficticia para profesionales autorizados, sin persistencia ni conexión con backend." eyebrow="Médico / Odontólogo" title="Panel clínico" /><section className="grid gap-4 sm:grid-cols-3"><MetricCard detail="Agenda personal simulada" label="Citas de hoy" value="5" /><MetricCard detail="Con llegada registrada" label="En espera" tone="crema" value="1" /><MetricCard detail="Seguimientos próximos" label="Pacientes activos" tone="pistacho" value="12" /></section><div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><section className="space-y-4"><h2 className="text-xl font-bold text-[#62727B]">Agenda del día</h2><DataTable caption="Agenda personal ficticia" columns={columns} getRowKey={(item) => item.id} rows={appointments.filter((item) => item.doctor === "Dra. Sofía Alvarado" || item.doctor === "Dra. Valeria Méndez")} /></section><section className="space-y-4"><h2 className="text-xl font-bold text-[#62727B]">Paciente reciente</h2><PatientSummaryCard {...patient} /></section></div></div>;
}
