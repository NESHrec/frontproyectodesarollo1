import Link from "next/link";
import { auditEvents } from "@/modules/usuarios-accesos/data";
import { Button, Card, InternalPageHeader, MetricCard, PermissionGate, StatusBadge, buttonLinkClasses } from "@/shared/components";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/admin/usuarios">Gestionar usuarios</Link>} description="Administración visual de accesos y catálogos, separada del contenido clínico." eyebrow="Administración" title="Panel administrativo" />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard detail="Personal ficticio habilitado" label="Usuarios activos" value="4" /><MetricCard detail="Recepción, médico, odontólogo y admin" label="Roles configurados" tone="pistacho" value="4" /><MetricCard detail="Catálogo público y operativo" label="Especialidades" tone="crema" value="5" /><MetricCard detail="Eventos simulados de hoy" label="Bitácora" tone="rosa" value="3" /></section>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Card><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Actividad reciente</h2><Link className="text-sm font-bold hover:underline" href="/admin/bitacora">Ver bitácora</Link></div><ul className="mt-4 divide-y divide-[#62727B]/10">{auditEvents.slice(0, 3).map((event) => <li className="py-4" key={event.id}><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{event.action}</p><p className="text-xs">{event.actor} · {event.entity}</p></div><StatusBadge tone="agua">{event.date}</StatusBadge></div></li>)}</ul></Card><Card className="bg-[#F8EDD2]"><h2 className="text-lg font-bold">Separación de responsabilidades</h2><p className="mt-3 text-sm leading-6">Administración no permite editar diagnósticos, expedientes, recetas ni odontogramas.</p><div className="mt-5"><PermissionGate allowedRoles={["medico"]} mode="disable" role="admin" reason="El contenido clínico corresponde al rol médico."><Button>Editar expediente clínico</Button></PermissionGate></div><p className="mt-3 text-xs font-semibold">Demostración visual; Spring Security deberá autorizar cada operación real.</p></Card></div>
    </div>
  );
}
