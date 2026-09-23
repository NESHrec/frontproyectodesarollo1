import { SpecialtyForm } from "@/modules/usuarios-accesos/components/SpecialtyForm";
import { managedSpecialties } from "@/modules/usuarios-accesos/data";
import { Card, InternalPageHeader, ModalDialog, StatusBadge } from "@/shared/components";

export default function AdminSpecialtiesPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Agrega una especialidad ficticia sin modificar el catálogo persistente." title="Nueva especialidad" triggerLabel="Agregar especialidad"><SpecialtyForm /></ModalDialog>} description="Gestión visual del catálogo médico y odontológico, sin acceso a información clínica." eyebrow="Administración" title="Especialidades" /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{managedSpecialties.map((specialty) => <Card key={specialty.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide">{specialty.id}</p><h2 className="mt-2 text-lg font-bold">{specialty.name}</h2><p className="mt-1 text-sm">{specialty.category}</p></div><StatusBadge tone="pistacho">{specialty.status}</StatusBadge></div><p className="mt-5 text-sm font-semibold">{specialty.professionals} profesional(es) ficticios</p></Card>)}</section></div>;
}
