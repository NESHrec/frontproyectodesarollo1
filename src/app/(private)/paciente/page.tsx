import Link from "next/link";
import { Card, MetricCard, StatusBadge, buttonLinkClasses } from "@/shared/components";
import { formatCurrency, formatDate } from "@/modules/paciente-portal/format";
import { demoAppointments, demoCheckups, demoPatient, demoPrescriptions } from "@/modules/paciente-portal/data";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default function PatientDashboardPage() {
  const nextAppointment = demoAppointments[0];
  const nextCheckup = demoCheckups[0];
  const latestPrescription = demoPrescriptions[0];

  return (
    <div className="space-y-7">
      <PatientPortalHeader
        actions={<Link className={buttonLinkClasses} href="/paciente/citas/nueva">Solicitar cita visual</Link>}
        description="Resumen de demostración con información ficticia. No representa una sesión autenticada ni un expediente real."
        eyebrow="Portal del paciente"
        title={`Hola, ${demoPatient.name}`}
      />
      <div className="rounded-md border border-[#62727B]/15 bg-[#F8EDD2] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">
        Vista de demostración · paciente fijo {demoPatient.id} · sin autenticación ni persistencia.
      </div>
      <section aria-label="Resumen ficticio del paciente" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="Información de demostración" label="Próxima cita" value={formatDate(nextAppointment.date)} />
        <MetricCard detail="Estado ficticio" label="Citas próximas" tone="pistacho" value="2" />
        <MetricCard detail="Documento no editable" label="Recetas visibles" tone="rosa" value={String(demoPrescriptions.length)} />
        <MetricCard detail="Seguimiento simulado" label="Progreso" tone="crema" value="65%" />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><StatusBadge tone="pistacho">{nextAppointment.status === "confirmed" ? "Confirmada · demo" : "Pendiente · demo"}</StatusBadge><h2 className="mt-4 text-2xl font-bold text-[#62727B]">Tu próxima cita visual</h2><p className="mt-2 text-sm text-[#62727B]/75">{nextAppointment.professional} · {nextAppointment.specialty}</p></div><p className="text-right text-sm font-bold text-[#62727B]">{formatDate(nextAppointment.date)}<br />{nextAppointment.time}</p></div>
          <p className="mt-5 rounded-md bg-[#DDF3F1] px-4 py-3 text-sm text-[#62727B]">Costo mostrado solo como dato ficticio: {formatCurrency(nextAppointment.cost)}.</p>
          <Link className="mt-5 inline-flex text-sm font-bold text-[#62727B] underline-offset-4 hover:underline" href="/paciente/citas">Ver mis citas visuales →</Link>
        </Card>
        <Card><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#62727B]/60">Receta de demostración</p><h2 className="mt-3 text-xl font-bold text-[#62727B]">{latestPrescription.specialty}</h2><p className="mt-2 text-sm text-[#62727B]/75">{latestPrescription.professional}</p><p className="mt-5 text-sm font-semibold text-[#62727B]">{latestPrescription.medicines[0].name} · {latestPrescription.medicines[0].dose}</p><Link className="mt-5 inline-flex text-sm font-bold text-[#62727B] underline-offset-4 hover:underline" href="/paciente/recetas">Consultar recetas →</Link></Card>
      </div>
      <Card><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#62727B]/60">Seguimiento simulado</p><h2 className="mt-2 text-xl font-bold text-[#62727B]">Próximo chequeo: {nextCheckup.name}</h2><p className="mt-2 text-sm text-[#62727B]/75">Sugerido para {formatDate(nextCheckup.recommendedDate)}. Este dato no proviene de un expediente real.</p></div><Link className={buttonLinkClasses} href="/paciente/chequeos">Ver seguimiento</Link></div></Card>
    </div>
  );
}
