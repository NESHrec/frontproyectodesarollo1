import Link from "next/link";

import { AppointmentsTable } from "@/modules/atencion-medica/components/AppointmentsTable";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { getOwnAppointments } from "@/modules/atencion-medica/server";
import { EmptyState, InternalPageHeader, buttonLinkClasses } from "@/shared/components";

export default async function DoctorDashboardPage() {
  const result = await getOwnAppointments();
  const header = <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/agenda">Ver mi agenda</Link>} description="Citas actualizadas asignadas a tu perfil profesional." eyebrow="Médico / Odontólogo" title="Panel clínico" />;
  if (!result.ok) return <div className="space-y-7">{header}<MedicalFailureNotice reason={result.reason} /></div>;

  const pending = result.data.filter((item) => item.canRecordAttention);
  const arrived = pending.filter((item) => item.arrivalAt);
  const documented = result.data.filter((item) => item.attentionRecorded);

  return (
    <div className="space-y-8">
      {header}
      <section className="relative isolate grid overflow-hidden rounded-[2rem] border border-[#62727B]/15 bg-[#334B54] text-white shadow-[0_28px_75px_-42px_rgba(38,50,56,0.85)] lg:grid-cols-[1.5fr_1fr]">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-[#DDF3F1]/10 blur-3xl" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#DDF3F1]/75">Prioridad clínica</p>
          <div className="mt-5 flex items-end gap-4"><span className="text-6xl font-black tracking-tight sm:text-7xl">{arrived.length}</span><p className="max-w-xs pb-2 text-sm leading-6 text-white/75">pacientes con llegada registrada y atención pendiente.</p></div>
          <Link className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#DDF3F1] px-6 text-sm font-black text-[#334B54] shadow-[0_12px_30px_-18px_rgba(221,243,241,0.8)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-[.98] motion-reduce:translate-none motion-reduce:scale-100 motion-reduce:transition-none" href="/medico/agenda">Abrir agenda clínica <span aria-hidden className="ml-2">→</span></Link>
        </div>
        <dl className="grid grid-cols-2 border-t border-white/10 bg-white/5 lg:grid-cols-1 lg:border-l lg:border-t-0">
          <div className="p-5 sm:p-6 lg:flex lg:flex-col lg:justify-center"><dt className="text-xs font-bold uppercase tracking-wider text-white/60">Por atender</dt><dd className="mt-2 text-3xl font-black">{pending.length}</dd><p className="mt-1 text-xs text-white/55">requieren seguimiento</p></div>
          <div className="border-l border-white/10 p-5 sm:p-6 lg:flex lg:flex-col lg:justify-center lg:border-l-0 lg:border-t"><dt className="text-xs font-bold uppercase tracking-wider text-white/60">Documentadas</dt><dd className="mt-2 text-3xl font-black">{documented.length}</dd><p className="mt-1 text-xs text-white/55">registros completados</p></div>
        </dl>
      </section>
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="serena-kicker">Flujo de hoy</p><h2 className="mt-1 text-2xl font-black text-[#263238]">Próximas citas por atender</h2></div><Link className="rounded-full px-3 py-2 text-sm font-bold text-[#56777A] underline-offset-4 transition-colors duration-200 hover:bg-[#DDF3F1]/50 hover:underline motion-reduce:transition-none" href="/medico/horarios">Gestionar disponibilidad</Link></div>
        {pending.length === 0
          ? <EmptyState description="No hay citas pendientes de documentar en los próximos días." title="Sin citas por atender" />
          : <AppointmentsTable appointments={pending.slice(0, 5)} caption="Próximas citas por atender" />}
      </section>
    </div>
  );
}
