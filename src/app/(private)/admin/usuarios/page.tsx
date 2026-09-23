import { InternalUserForm } from "@/modules/usuarios-accesos/components/InternalUserForm";
import { internalUsers, type InternalUser } from "@/modules/usuarios-accesos/data";
import { ConfirmDialog, DataTable, Input, InternalPageHeader, ModalDialog, SearchFilters, SelectField, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<InternalUser>[] = [
  { key: "user", label: "Usuario", render: (item) => <div><p className="font-semibold">{item.name}</p><p className="text-xs">{item.email}</p></div> },
  { key: "role", label: "Rol", render: (item) => <StatusBadge tone="agua">{item.role}</StatusBadge> },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Activo" ? "pistacho" : "rosa"}>{item.status}</StatusBadge> },
  { key: "access", label: "Último acceso", render: (item) => item.lastAccess },
  { key: "action", label: "Acción visual", render: (item) => <ConfirmDialog confirmLabel={item.status === "Activo" ? "Simular desactivación" : "Simular activación"} description={`El estado de ${item.name} solo cambiará visualmente en el mensaje de confirmación.`} simulatedResult={item.status === "Activo" ? "Desactivación simulada" : "Activación simulada"} title={`${item.status === "Activo" ? "Desactivar" : "Activar"} usuario`} triggerLabel={item.status === "Activo" ? "Desactivar" : "Activar"} /> },
];

export default function AdminUsersPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Define datos ficticios y un rol visual. No se crea una cuenta real." title="Alta visual de usuario" triggerLabel="Nuevo usuario"><InternalUserForm /></ModalDialog>} description="Listado ficticio de cuentas internas y controles visuales de activación." eyebrow="Administración" title="Usuarios" /><SearchFilters><Input label="Buscar usuario" placeholder="Nombre o correo" type="search" /><SelectField defaultValue="todos" label="Rol"><option value="todos">Todos</option><option>Recepción</option><option>Médico</option><option>Odontólogo</option><option>Administrador</option></SelectField><SelectField defaultValue="todos" label="Estado"><option value="todos">Todos</option><option>Activo</option><option>Inactivo</option></SelectField></SearchFilters><DataTable caption="Usuarios internos ficticios" columns={columns} getRowKey={(item) => item.id} rows={internalUsers} /></div>;
}
