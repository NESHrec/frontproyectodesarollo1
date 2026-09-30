import Link from "next/link";

import type { MedicalAppointment } from "@/modules/atencion-medica/schemas";
import { appointmentStatusLabel, appointmentStatusTone, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { DataTable, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<MedicalAppointment>[] = [
  { key: "datetime", label: "Fecha y hora", render: (item) => <span className="font-semibold">{formatDateTime(item.scheduledAt)}</span> },
  { key: "patient", label: "Paciente", render: (item) => patientLabel(item) },
  { key: "specialty", label: "Atención", render: (item) => item.specialtyName },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={appointmentStatusTone(item.status)}>{appointmentStatusLabel[item.status]}</StatusBadge> },
  { key: "arrival", label: "Llegada", render: (item) => item.arrivalAt ? formatDateTime(item.arrivalAt) : "Pendiente" },
  { key: "open", label: "Acceso clínico", render: (item) => <Link className="font-bold underline-offset-4 hover:underline" href={`/medico/citas/${item.id}`}>Abrir cita</Link> },
];

export function AppointmentsTable({ appointments, caption }: { appointments: MedicalAppointment[]; caption: string }) {
  return <DataTable caption={caption} columns={columns} emptyMessage="No tienes citas en el rango consultado." getRowKey={(item) => item.id} rows={appointments} />;
}
