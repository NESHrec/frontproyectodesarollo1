import { rolePermissions } from "@/modules/usuarios-accesos/data";
import { InternalPageHeader, StatusBadge } from "@/shared/components";

function PermissionState({ allowed }: { allowed: boolean }) {
  return <StatusBadge tone={allowed ? "pistacho" : "rosa"}>{allowed ? "Permitido" : "Restringido"}</StatusBadge>;
}

const roles = [
  { key: "recepcion", label: "Recepción" },
  { key: "medico", label: "Médico/Odontólogo" },
  { key: "admin", label: "Administrador" },
  { key: "paciente", label: "Paciente" },
] as const;

export default function AdminRolesPage() {
  return <div className="space-y-8">
    <InternalPageHeader description="Referencia de solo lectura. El sistema valida la sesión y los permisos antes de cada operación." eyebrow="Administración" title="Roles y permisos" />

    <section className="rounded-2xl border border-[#62727B]/15 bg-gradient-to-r from-[#F8EDD2] to-[#FBFCFA] p-4 text-sm text-[#334B54] shadow-sm sm:p-5" aria-label="Aviso sobre permisos">
      <p className="font-bold">Esta pantalla no concede ni retira permisos.</p>
      <p className="mt-1 leading-6">Los estados muestran el alcance vigente de cada rol; los permisos se aplican automáticamente según la cuenta que inició sesión.</p>
    </section>

    <div className="grid gap-3 md:hidden" aria-label="Matriz informativa de roles y permisos">
      {rolePermissions.map((row) => <article className="rounded-lg border border-[#62727B]/15 bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-220 hover:border-[#56777A]/30 hover:shadow-md motion-reduce:transition-none" key={row.permission}><h2 className="font-bold text-[#334B54]">{row.permission}</h2><dl className="mt-4 grid grid-cols-2 gap-3">{roles.map((role) => <div className="rounded-md bg-[#FBFCFA] p-3 transition-colors duration-200 hover:bg-[#DDF3F1]/55 motion-reduce:transition-none" key={role.key}><dt className="mb-2 text-xs font-semibold text-[#62727B]">{role.label}</dt><dd><PermissionState allowed={row[role.key]} /></dd></div>)}</dl></article>)}
    </div>

    <div className="hidden overflow-x-auto rounded-2xl border border-[#62727B]/15 bg-white shadow-sm transition-shadow duration-220 hover:shadow-md motion-reduce:transition-none md:block"><table className="min-w-full text-left text-sm"><caption className="sr-only">Matriz informativa de roles y permisos</caption><thead className="bg-[#DDF3F1] text-[#334B54]"><tr><th className="px-4 py-3" scope="col">Permiso</th>{roles.map((role) => <th className="px-4 py-3" key={role.key} scope="col">{role.label}</th>)}</tr></thead><tbody className="divide-y divide-[#62727B]/10">{rolePermissions.map((row) => <tr className="transition-colors duration-200 hover:bg-[#FBFCFA] motion-reduce:transition-none" key={row.permission}><th className="px-4 py-4 font-semibold text-[#334B54]" scope="row">{row.permission}</th>{roles.map((role) => <td className="px-4 py-4" key={role.key}><PermissionState allowed={row[role.key]} /></td>)}</tr>)}</tbody></table></div>
  </div>;
}
