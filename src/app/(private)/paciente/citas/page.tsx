import Link from "next/link";
import { Card, ModalDialog, SimulatedFormNotice, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { formatCurrency, formatDate } from "@/modules/paciente-portal/format";
import { demoAppointments } from "@/modules/paciente-portal/data";
import { PatientPortalHeader, SectionTitle } from "@/modules/paciente-portal/components/PatientPortalHeader";

const statusLabels = { confirmed: "Confirmada", pending: "Pendiente", completed: "Completada", cancelled: "Cancelada" } as const;
const statusTones = { confirmed: "pistacho", pending: "crema", completed: "agua", cancelled: "rosa" } as const;

export default function PatientAppointmentsPage() {
  const upcoming = demoAppointments.filter((appointment) => appointment.status === "confirmed" || appointment.status === "pending");
  const history = demoAppointments.filter((appointment) => appointment.status === "completed" || appointment.status === "cancelled");
  return <div className="space-y-7"><PatientPortalHeader actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">+ Solicitar cita visual</Link>} description="Listado ficticio de atenciones; las acciones solo muestran estados de demostración." eyebrow="Agenda" title="Mis citas" /><section><SectionTitle title="Próximas citas ficticias" /><div className="grid gap-5 lg:grid-cols-2">{upcoming.map((appointment) => <AppointmentCard appointment={appointment} key={appointment.id} />)}</div></section><section><SectionTitle title="Historial de demostración" /><div className="grid gap-5 lg:grid-cols-2">{history.map((appointment) => <AppointmentCard appointment={appointment} key={appointment.id} />)}</div></section></div>;
}

function AppointmentCard({ appointment }: { appointment: (typeof demoAppointments)[number] }) {
  return <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><StatusBadge tone={statusTones[appointment.status]}>{statusLabels[appointment.status]} · demo</StatusBadge><h2 className="mt-4 text-xl font-bold text-[#62727B]">{appointment.specialty}</h2><p className="mt-1 text-sm text-[#62727B]/75">{appointment.professional}</p></div><p className="text-right text-sm font-bold text-[#62727B]">{formatDate(appointment.date)}<br />{appointment.time}</p></div><p className="mt-5 text-sm text-[#62727B]/75">Costo ficticio: {formatCurrency(appointment.cost)}</p>{appointment.status === "confirmed" || appointment.status === "pending" ? <div className="mt-5 flex flex-wrap gap-3"><ModalDialog description="Esta acción solo abre una demostración visual. No se envía ni se modifica ninguna cita." title="Acción de demostración" triggerLabel="Solicitar cambio visual" triggerVariant="ghost"><SimulatedFormNotice>No se envió una solicitud real ni se modificó la agenda.</SimulatedFormNotice></ModalDialog><ModalDialog description="La cancelación solo se representa en pantalla." title="Cancelar visualmente" triggerLabel="Cancelar visualmente" triggerVariant="accent"><SimulatedFormNotice>No se canceló ninguna cita real.</SimulatedFormNotice></ModalDialog></div> : null}</Card>;
}
