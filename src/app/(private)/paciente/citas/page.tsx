import Link from "next/link";
import { Card, EmptyState, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { getOwnAppointments } from "@/modules/auth/server-session";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";
import { getMedicos } from "@/modules/catalogo-medico/api";

const tones = { PENDIENTE: "crema", CONFIRMADA: "pistacho", CANCELADA: "rosa", COMPLETADA: "agua" } as const;
const labels = { PENDIENTE: "Pendiente de confirmación", CONFIRMADA: "Confirmada", CANCELADA: "Cancelada", COMPLETADA: "Atención completada" } as const;

export default async function PatientAppointmentsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const created = firstSearchParam((await searchParams).created) === "1";
  const [appointments, practitioners] = await Promise.all([getOwnAppointments(), getMedicos()]);
  if (!appointments) return <EmptyState title="Sesión no disponible" description="No pudimos consultar tus citas. Inicia sesión nuevamente." />;
  const names = new Map(practitioners.ok ? practitioners.data.map(item => [item.id, item.fullName]) : []);
  const ordered = [...appointments].sort((a,b) => Date.parse(b.scheduledAt)-Date.parse(a.scheduledAt));
  return <div className="space-y-7"><PatientPortalHeader actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">+ Reservar cita</Link>} description="Consulta próximas citas y atenciones anteriores en un solo lugar." eyebrow="Agenda" title="Mis citas" />{created ? <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">Tu cita quedó reservada. Revisa aquí cualquier cambio de estado.</p> : null}{ordered.length === 0 ? <EmptyState title="No tienes citas todavía" description="Reserva cuando necesites atención; podrás consultar aquí el horario y su estado." /> : <div className="grid gap-5 lg:grid-cols-2">{ordered.map((appointment) => <Card className="border-l-4 border-l-[#DDF3F1]" key={appointment.id}><StatusBadge tone={tones[appointment.status]}>{labels[appointment.status]}</StatusBadge><h2 className="mt-4 text-xl font-bold text-[#334B54]">{names.get(appointment.practitionerId) ?? "Profesional de Clínica Serena"}</h2><p className="mt-2 text-base font-semibold capitalize text-[#62727B]">{new Intl.DateTimeFormat("es-GT", { dateStyle: "full", timeStyle: "short", timeZone: "America/Guatemala" }).format(new Date(appointment.scheduledAt))}</p><p className="mt-3 text-sm leading-6 text-[#62727B]/80">{appointment.status === "PENDIENTE" ? "La clínica tiene registrada tu solicitud." : appointment.status === "CONFIRMADA" ? "Tu cita está confirmada." : appointment.status === "CANCELADA" ? "Esta cita fue cancelada y permanece en tu historial." : "La atención fue completada; revisa recetas y chequeos si están disponibles."}</p></Card>)}</div>}</div>;
}
