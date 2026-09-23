import { PatientForm } from "@/modules/pacientes/components/PatientForm";
import { patients, type Patient } from "@/modules/pacientes/data";
import { DataTable, Input, InternalPageHeader, ModalDialog, SearchFilters, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Patient>[] = [
  { key: "name", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.name}</p><p className="text-xs">{item.id}</p></div> },
  { key: "phone", label: "Teléfono", render: (item) => item.phone },
  { key: "email", label: "Correo", render: (item) => item.email },
  { key: "next", label: "Próxima cita", render: (item) => <StatusBadge tone={item.nextAppointment === "Sin cita" ? "crema" : "agua"}>{item.nextAppointment}</StatusBadge> },
];

export default function ReceptionPatientsPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Los datos se validan en el navegador y luego se descartan." title="Registrar paciente ficticio" triggerLabel="Nuevo paciente"><PatientForm /></ModalDialog>} description="Directorio administrativo limitado a datos de contacto y próximas citas; no muestra información clínica." eyebrow="Recepción" title="Pacientes" /><SearchFilters><Input label="Buscar" placeholder="Nombre, teléfono o correo" type="search" /><Input label="Próxima cita desde" type="date" /></SearchFilters><DataTable caption="Directorio administrativo de pacientes ficticios" columns={columns} getRowKey={(item) => item.id} rows={patients} /></div>;
}
