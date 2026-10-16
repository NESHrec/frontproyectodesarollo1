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
  return <div className="space-y-6 lg:space-y-7">
    <InternalPageHeader description="Referencia de solo lectura. El sistema valida la sesión y los permisos antes de cada operación." eyebrow="Administración" title="Roles y permisos" />

    <section className="grid gap-2 rounded-2xl border border-[#56777A]/20 border-l-4 border-l-[#56777A]/60 bg-gradient-to-r from-[#F8EDD2]/80 to-[#FBFCFA] p-4 text-sm text-[#334B54] shadow-[0_8px_24px_rgba(51,75,84,0.05)] sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] sm:items-center sm:gap-5 sm:p-5" aria-label="Aviso sobre permisos">
      <p className="font-extrabold">Esta pantalla no concede ni retira permisos.</p>
      <p className="mt-1 leading-6">Los estados muestran el alcance vigente de cada rol; los permisos se aplican automáticamente según la cuenta que inició sesión.</p>
    </section>

    <div className="grid gap-3 md:hidden" aria-label="Matriz informativa de roles y permisos">
      {rolePermissions.map((row) => <article className="rounded-2xl border border-[#62727B]/15 bg-white p-4 shadow-[0_10px_26px_rgba(51,75,84,0.06)]" key={row.permission}><h2 className="border-b border-[#56777A]/15 pb-3 font-extrabold text-[#334B54]">{row.permission}</h2><dl className="mt-3 grid grid-cols-2 gap-2">{roles.map((role) => <div className="rounded-xl border border-[#62727B]/10 bg-[#FBFCFA] p-3" key={role.key}><dt className="mb-2 text-xs font-semibold text-[#62727B]">{role.label}</dt><dd><PermissionState allowed={row[role.key]} /></dd></div>)}</dl></article>)}
    </div>

    <div aria-label="Tabla informativa de roles y permisos" className="hidden overflow-x-auto rounded-2xl border border-[#62727B]/15 bg-white shadow-[0_12px_32px_rgba(51,75,84,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] md:block" role="region" tabIndex={0}><table className="min-w-[54rem] text-left text-sm"><caption className="sr-only">Matriz informativa de roles y permisos</caption><thead className="bg-[#334B54] text-white"><tr><th className="sticky left-0 bg-[#334B54] px-4 py-4" scope="col">Permiso</th>{roles.map((role) => <th className="px-4 py-4" key={role.key} scope="col">{role.label}</th>)}</tr></thead><tbody className="divide-y divide-[#62727B]/10">{rolePermissions.map((row) => <tr className="transition-colors duration-180 ease-out hover:bg-[#DDF3F1]/35 motion-reduce:transition-none" key={row.permission}><th className="sticky left-0 bg-white px-4 py-4 text-left font-bold text-[#334B54]" scope="row">{row.permission}</th>{roles.map((role) => <td className="px-4 py-4" key={role.key}><PermissionState allowed={row[role.key]} /></td>)}</tr>)}</tbody></table></div>
  </div>;
}
