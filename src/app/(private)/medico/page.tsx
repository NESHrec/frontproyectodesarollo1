import Link from "next/link";

import { AppointmentsTable } from "@/modules/atencion-medica/components/AppointmentsTable";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { getOwnAppointments } from "@/modules/atencion-medica/server";
import { EmptyState, InternalPageHeader, MetricCard, buttonLinkClasses } from "@/shared/components";

export default async function DoctorDashboardPage() {
  const result = await getOwnAppointments();
  const header = <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/agenda">Ver mi agenda</Link>} description="Citas actualizadas asignadas a tu perfil profesional." eyebrow="Médico / Odontólogo" title="Panel clínico" />;
  if (!result.ok) return <div className="space-y-7">{header}<MedicalFailureNotice reason={result.reason} /></div>;

  const pending = result.data.filter((item) => item.canRecordAttention);
  const arrived = pending.filter((item) => item.arrivalAt);
  const documented = result.data.filter((item) => item.attentionRecorded);

  return (
    <div className="space-y-7">
      {header}
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard detail="Pendientes o confirmadas sin atención" label="Por atender" value={String(pending.length)} />
        <MetricCard detail="Por atender con llegada registrada" label="En espera" tone="crema" value={String(arrived.length)} />
        <MetricCard detail="Atenciones guardadas en el rango" label="Documentadas" tone="pistacho" value={String(documented.length)} />
      </section>
      <section className="min-w-0 space-y-4">
        <h2 className="text-xl font-bold text-[#62727B]">Próximas citas por atender</h2>
        {pending.length === 0
          ? <EmptyState description="No hay citas pendientes de documentar en los próximos días." title="Sin citas por atender" />
          : <AppointmentsTable appointments={pending.slice(0, 5)} caption="Próximas citas por atender" />}
      </section>
    </div>
  );
}
