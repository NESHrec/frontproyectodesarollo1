import { PrescriptionForm } from "@/modules/recetas/components/PrescriptionForm";
import { prescriptions, type Prescription } from "@/modules/recetas/data";
import { Card, DataTable, InternalPageHeader, StatusBadge, type DataTableColumn } from "@/shared/components";
const columns: DataTableColumn<Prescription>[] = [
  { key: "date", label: "Fecha", render: (item) => item.date },
  { key: "patient", label: "Paciente", render: (item) => item.patient },
  { key: "medicine", label: "Medicamento ficticio", render: (item) => <div><p className="font-semibold">{item.medicine}</p><p className="text-xs">{item.instructions}</p></div> },
  { key: "professional", label: "Profesional", render: (item) => item.professional },
];
export default function NewPrescriptionPage() { return <div className="space-y-7"><InternalPageHeader description="Creación e historial exclusivamente visuales; no se firma ni almacena ninguna receta." eyebrow="Atención clínica" title="Recetas digitales" /><div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]"><Card><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Nueva receta ficticia</h2><StatusBadge tone="rosa">Simulación</StatusBadge></div><PrescriptionForm /></Card><section className="space-y-4"><h2 className="text-lg font-bold">Historial visual</h2><DataTable caption="Historial de recetas ficticias" columns={columns} getRowKey={(item) => item.id} rows={prescriptions} /></section></div></div>; }
