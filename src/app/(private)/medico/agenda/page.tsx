import Link from "next/link";

import { AppointmentsTable } from "@/modules/atencion-medica/components/AppointmentsTable";
import { MedicalFailureNotice } from "@/modules/atencion-medica/components/MedicalFailureNotice";
import { appointmentStatusLabel } from "@/modules/atencion-medica/format";
import { getOwnAppointments } from "@/modules/atencion-medica/server";
import { Button, EmptyState, InternalPageHeader, SearchFilters, SelectField, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

const STATUSES = ["PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"] as const;

export default async function DoctorAgendaPage({ searchParams }: { searchParams: PageSearchParams }) {
  const requested = firstSearchParam((await searchParams).estado);
  const status = STATUSES.find((item) => item === requested);
  const result = await getOwnAppointments(status);

  return (
    <div className="space-y-7">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/horarios">Consultar horarios</Link>} description="Solo se muestran citas persistidas asignadas a tu profesional vinculado." eyebrow="Médico / Odontólogo" title="Mi agenda" />
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <form action="/medico/agenda" className="self-start rounded-[1.5rem] border border-[var(--serena-border)] bg-white p-5 shadow-[var(--serena-shadow-soft)] lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Vista de agenda</p>
          <h2 className="mt-2 text-xl font-black text-[#263238]">Filtrar citas</h2>
          <div className="mt-5"><SearchFilters><SelectField defaultValue={status ?? ""} id="estado" label="Estado" name="estado"><option value="">Todos</option>{STATUSES.map((item) => <option key={item} value={item}>{appointmentStatusLabel[item]}</option>)}</SelectField><div className="flex items-end"><Button type="submit">Aplicar filtro</Button></div></SearchFilters></div>
          <p className="mt-5 border-t border-[#62727B]/15 pt-4 text-xs leading-5 text-[#62727B]">Rango operativo: 7 días atrás y 60 días adelante.</p>
        </form>
        <div className="min-w-0 space-y-4">
          {result.ok ? <div className="flex items-center justify-between border-b border-[#62727B]/15 pb-3"><p className="text-sm font-semibold text-[#62727B]">Agenda personal</p><p className="text-sm font-bold text-[#334B54]">{result.data.length} {result.data.length === 1 ? "cita" : "citas"}</p></div> : null}
          {!result.ok ? <MedicalFailureNotice reason={result.reason} /> : result.data.length === 0
            ? <EmptyState description="No hay citas asignadas en el rango y estado seleccionados." title="Agenda vacía" />
            : <AppointmentsTable appointments={result.data} caption="Agenda personal" />}
        </div>
      </div>
    </div>
  );
}
