import Link from "next/link";
import { getAuthenticatedPatient, getOwnAppointments } from "@/modules/auth/server-session";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";
import { buttonLinkClasses } from "@/shared/components";

const quickLinks = [
  { href: "/paciente/citas", label: "Mis citas", detail: "Consulta próximas citas y tu historial.", accent: "bg-[#DDF3F1]" },
  { href: "/paciente/recetas", label: "Recetas", detail: "Revisa medicamentos e indicaciones registradas.", accent: "bg-[#F8E2E8]" },
  { href: "/paciente/chequeos", label: "Chequeos", detail: "Consulta el seguimiento de tus atenciones.", accent: "bg-[#E5F1D8]" },
  { href: "/paciente/perfil", label: "Mi perfil", detail: "Mantén actualizado tu nombre y revisa tu cuenta.", accent: "bg-[#F8EDD2]" },
];

export default async function PatientDashboardPage() {
  const [patient, appointments] = await Promise.all([getAuthenticatedPatient(), getOwnAppointments()]);
  if (!patient) return null;
  const upcoming = appointments?.filter((item) => item.status === "PENDIENTE" || item.status === "CONFIRMADA") ?? [];
  const nextAppointment = [...upcoming].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0];
  const nextDate = nextAppointment ? new Intl.DateTimeFormat("es-GT", { dateStyle: "full", timeStyle: "short", timeZone: "America/Guatemala" }).format(new Date(nextAppointment.scheduledAt)) : null;

  return <div className="space-y-8">
    <PatientPortalHeader actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">Reservar cita</Link>} description="Consulta tus citas, recetas y seguimiento desde un solo lugar." eyebrow="Portal del paciente" title="Hola, estamos para cuidarte" />
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]" aria-label="Tu siguiente paso">
      <article className="serena-card border-l-4 border-l-[#56777A] p-6"><p className="serena-kicker">Tu siguiente paso</p>{nextAppointment ? <><h2 className="mt-3 text-2xl font-black text-[#334B54]">Prepárate para tu próxima cita</h2><p className="mt-2 text-base capitalize text-[#62727B]">{nextDate}</p><Link className={`${buttonLinkClasses} mt-5`} href="/paciente/citas">Ver detalles de mis citas</Link></> : <><h2 className="mt-3 text-2xl font-black text-[#334B54]">No tienes citas próximas</h2><p className="mt-2 text-sm leading-6 text-[#62727B]">Cuando lo necesites, elige un profesional y un horario disponible.</p><Link className={`${buttonLinkClasses} mt-5`} href="/paciente/citas/nueva">Reservar mi primera cita</Link></>}</article>
      <article className="serena-card min-w-0 p-6"><p className="serena-kicker">Tu cuenta</p><p className="mt-3 break-words text-lg font-bold text-[#334B54] [overflow-wrap:anywhere]">{patient.email}</p><p className="mt-2 text-sm text-[#62727B]">Acceso activo y protegido para tu información.</p></article>
    </section>
    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="serena-kicker">Accesos rápidos</p><h2 className="mt-2 text-2xl font-black text-[#334B54]">¿Qué deseas consultar?</h2></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{quickLinks.map((item) => <Link className="serena-card group p-5 transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#56777A]" href={item.href} key={item.href}><span className={`block size-10 rounded-xl ${item.accent}`} aria-hidden="true" /><h3 className="mt-4 text-lg font-bold text-[#334B54] group-hover:underline">{item.label}</h3><p className="mt-2 text-sm leading-6 text-[#62727B]">{item.detail}</p></Link>)}</div></section>
  </div>;
}
