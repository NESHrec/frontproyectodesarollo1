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
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/medico/horarios">Consultar horarios</Link>} description="Solo se muestran citas persistidas asignadas a tu profesional vinculado (desde 7 días atrás hasta 60 días adelante)." eyebrow="Médico / Odontólogo" title="Mi agenda" />
      <form action="/medico/agenda">
        <SearchFilters>
          <SelectField defaultValue={status ?? ""} id="estado" label="Estado" name="estado">
            <option value="">Todos</option>
            {STATUSES.map((item) => <option key={item} value={item}>{appointmentStatusLabel[item]}</option>)}
          </SelectField>
          <div className="flex items-end"><Button type="submit">Filtrar</Button></div>
        </SearchFilters>
      </form>
      {!result.ok ? <MedicalFailureNotice reason={result.reason} /> : result.data.length === 0
        ? <EmptyState description="No hay citas asignadas a tu agenda en el rango y estado seleccionados." title="Agenda vacía" />
        : <AppointmentsTable appointments={result.data} caption="Agenda personal" />}
    </div>
  );
}
