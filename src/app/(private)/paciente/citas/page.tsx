import Link from "next/link";
import { Card, EmptyState, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { getOwnAppointments } from "@/modules/auth/server-session";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

const tones = { PENDIENTE: "crema", CONFIRMADA: "pistacho", CANCELADA: "rosa", COMPLETADA: "agua" } as const;

export default async function PatientAppointmentsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const created = firstSearchParam((await searchParams).created) === "1";
  const appointments = await getOwnAppointments();
  if (!appointments) return <EmptyState title="Sesión no disponible" description="No pudimos consultar tus citas. Inicia sesión nuevamente." />;
  return <div className="space-y-7"><PatientPortalHeader actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">+ Reservar cita</Link>} description="Estas citas se consultan únicamente para el paciente autenticado." eyebrow="Agenda" title="Mis citas" />{created ? <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">Tu cita fue creada correctamente.</p> : null}{appointments.length === 0 ? <EmptyState title="Aún no tienes citas" description="Elige un horario disponible para crear tu primera cita." /> : <div className="grid gap-5 lg:grid-cols-2">{appointments.map((appointment) => <Card key={appointment.id}><StatusBadge tone={tones[appointment.status]}>{appointment.status}</StatusBadge><h2 className="mt-4 text-xl font-bold text-[#62727B]">Cita programada</h2><p className="mt-2 text-sm text-[#62727B]/75">{new Intl.DateTimeFormat("es-GT", { dateStyle: "full", timeStyle: "short", timeZone: "America/Guatemala" }).format(new Date(appointment.scheduledAt))}</p><p className="mt-3 text-sm text-[#62727B]/75">Profesional: {appointment.practitionerId}</p></Card>)}</div>}</div>;
}
