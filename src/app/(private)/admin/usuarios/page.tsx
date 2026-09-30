import { InternalUserForm } from "@/modules/usuarios-accesos/components/InternalUserForm";
import { PractitionerLinkPanel } from "@/modules/admin/components/PractitionerLinkPanel";
import { StaffAccountForm } from "@/modules/admin/components/StaffAccountForm";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { internalUsers, type InternalUser } from "@/modules/usuarios-accesos/data";
import { ApiErrorState, ConfirmDialog, DataTable, Input, InternalPageHeader, ModalDialog, SearchFilters, SelectField, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<InternalUser>[] = [
  { key: "user", label: "Usuario", render: (item) => <div><p className="font-semibold">{item.name}</p><p className="text-xs">{item.email}</p></div> },
  { key: "role", label: "Rol", render: (item) => <StatusBadge tone="agua">{item.role}</StatusBadge> },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Activo" ? "pistacho" : "rosa"}>{item.status}</StatusBadge> },
  { key: "access", label: "Último acceso", render: (item) => item.lastAccess },
  { key: "action", label: "Acción visual", render: (item) => <ConfirmDialog confirmLabel={item.status === "Activo" ? "Simular desactivación" : "Simular activación"} description={`El estado de ${item.name} solo cambiará visualmente en el mensaje de confirmación.`} simulatedResult={item.status === "Activo" ? "Desactivación simulada" : "Activación simulada"} title={`${item.status === "Activo" ? "Desactivar" : "Activar"} usuario`} triggerLabel={item.status === "Activo" ? "Desactivar" : "Activar"} /> },
];

export default async function AdminUsersPage() {
  const medicos = await getMedicos();
  return <div className="space-y-7"><InternalPageHeader actions={<div className="flex flex-wrap gap-2"><ModalDialog description="Esta acción crea una cuenta real de recepción o médico en el backend. La contraseña solo se envía por HTTPS/BFF y se almacena como hash." title="Habilitar cuenta de personal" triggerLabel="Habilitar personal"><StaffAccountForm /></ModalDialog><ModalDialog description="La alta visual histórica no crea una cuenta real." title="Alta visual de usuario" triggerLabel="Nuevo usuario"><InternalUserForm /></ModalDialog></div>} description="La acción de habilitar personal es real y requiere una sesión ADMIN. La tabla inferior conserva datos históricos de demostración." eyebrow="Administración" title="Usuarios" />{medicos.ok ? <PractitionerLinkPanel practitioners={medicos.data} /> : <ApiErrorState description="No se pudo cargar el catálogo de profesionales para la vinculación médica." title="Catálogo no disponible" />}<h2 className="text-xl font-bold text-[#62727B]">Usuarios de demostración</h2><SearchFilters><Input label="Buscar usuario" placeholder="Nombre o correo" type="search" /><SelectField defaultValue="todos" label="Rol"><option value="todos">Todos</option><option>Recepción</option><option>Médico</option><option>Odontólogo</option><option>Administrador</option></SelectField><SelectField defaultValue="todos" label="Estado"><option value="todos">Todos</option><option>Activo</option><option>Inactivo</option></SelectField></SearchFilters><DataTable caption="Usuarios internos de demostración" columns={columns} getRowKey={(item) => item.id} rows={internalUsers} /></div>;
}
