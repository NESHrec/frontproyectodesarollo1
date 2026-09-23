import { AppointmentForm } from "@/modules/agenda-citas/components/AppointmentForm";
import { appointments, type Appointment } from "@/modules/agenda-citas/data";
import { ConfirmDialog, DataTable, Input, InternalPageHeader, ModalDialog, SearchFilters, SelectField, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Appointment>[] = [
  { key: "date", label: "Fecha y hora", render: (item) => <div><p className="font-semibold">{item.date}</p><p>{item.time}</p></div> },
  { key: "patient", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.patient}</p><p className="text-xs">{item.id}</p></div> },
  { key: "doctor", label: "Profesional", render: (item) => <div><p>{item.doctor}</p><p className="text-xs text-[#62727B]/65">{item.specialty}</p></div> },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Cancelada" ? "rosa" : item.status === "Completada" ? "pistacho" : "agua"}>{item.status}</StatusBadge> },
  { key: "actions", label: "Acciones visuales", render: (item) => <div className="flex flex-wrap gap-2"><ModalDialog description={`Selecciona una fecha y hora nueva para ${item.patient}.`} title="Reprogramar cita" triggerLabel="Reprogramar" triggerVariant="ghost"><AppointmentForm mode="reschedule" /></ModalDialog><ConfirmDialog confirmLabel="Simular cancelación" description={`La cancelación de ${item.id} no se guardará.`} simulatedResult="Cancelación simulada" title="Cancelar cita" triggerLabel="Cancelar" /></div> },
];

export default function ReceptionAgendaPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Completa los datos administrativos de una cita ficticia." title="Registrar cita" triggerLabel="Nueva cita"><AppointmentForm /></ModalDialog>} description="Consulta, filtra y representa cambios de agenda con datos totalmente ficticios." eyebrow="Recepción" title="Agenda general" /><SearchFilters><Input defaultValue="2026-09-16" label="Fecha" type="date" /><SelectField defaultValue="todos" label="Profesional"><option value="todos">Todos</option><option>Dra. Sofía Alvarado</option><option>Dr. Mateo Castillo</option><option>Dra. Valeria Méndez</option></SelectField><SelectField defaultValue="todos" label="Estado"><option value="todos">Todos</option><option>Confirmada</option><option>En espera</option><option>Completada</option><option>Cancelada</option></SelectField><Input label="Buscar paciente" placeholder="Nombre o código" type="search" /></SearchFilters><DataTable caption="Agenda general ficticia" columns={columns} getRowKey={(item) => item.id} rows={appointments} /></div>;
}
