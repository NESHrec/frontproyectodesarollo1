import Link from "next/link";
import { Card, MetricCard, buttonLinkClasses } from "@/shared/components";
import { getAuthenticatedPatient, getOwnAppointments } from "@/modules/auth/server-session";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default async function PatientDashboardPage() {
  const [patient, appointments] = await Promise.all([getAuthenticatedPatient(), getOwnAppointments()]);
  if (!patient) return null;
  const upcoming = appointments?.filter((appointment) => appointment.status === "PENDIENTE" || appointment.status === "CONFIRMADA") ?? [];
  return <div className="space-y-7"><PatientPortalHeader actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">Reservar cita</Link>} description="Sesión verificada por el backend para tu identidad de paciente." eyebrow="Portal del paciente" title="Tu portal" /><Card><p className="text-sm font-semibold text-[#62727B]">Identidad verificada: {patient.email}</p><p className="mt-2 text-sm text-[#62727B]/75">Estado de cuenta: {patient.accountStatus}. Las vistas de personal conservan carácter demostrativo.</p></Card><section className="grid gap-4 sm:grid-cols-2"><MetricCard detail="Consultadas desde tu sesión" label="Citas próximas" value={String(upcoming.length)} /><MetricCard detail="Solo visibles para tu identidad" label="Citas totales" tone="pistacho" value={String(appointments?.length ?? 0)} /></section><Card><h2 className="text-xl font-bold text-[#62727B]">Agenda personal</h2><p className="mt-2 text-sm text-[#62727B]/75">La reserva se atribuye en Spring a tu principal autenticado y se confirma únicamente tras persistirse.</p><Link className="mt-5 inline-flex font-bold text-[#62727B] underline-offset-4 hover:underline" href="/paciente/citas">Ver mis citas →</Link></Card></div>;
}
