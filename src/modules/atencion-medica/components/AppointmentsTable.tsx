import Link from "next/link";

import type { MedicalAppointment } from "@/modules/atencion-medica/schemas";
import { appointmentStatusLabel, appointmentStatusTone, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { StatusBadge } from "@/shared/components";

export function AppointmentsTable({ appointments, caption }: { appointments: MedicalAppointment[]; caption: string }) {
  return (
    <section aria-label={caption} className="overflow-hidden rounded-[1.5rem] border border-[#62727B]/15 bg-white shadow-[0_18px_55px_-38px_rgba(38,50,56,0.45)]">
      <h2 className="sr-only">{caption}</h2>
      <ol className="divide-y divide-[#62727B]/12">
        {appointments.map((item, index) => (
          <li className={`group grid gap-4 px-4 py-5 transition-colors duration-200 hover:bg-[#DDF3F1]/25 sm:grid-cols-[9.5rem_1fr_auto] sm:items-center sm:px-6 ${index === 0 && item.canRecordAttention ? "bg-[#DDF3F1]/30" : ""}`} key={item.id}>
            <div>
              <p className="text-sm font-bold text-[#334B54]">{formatDateTime(item.scheduledAt)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#62727B]/65">{item.arrivalAt ? "Paciente en clínica" : "Llegada pendiente"}</p>
            </div>
            <div className="min-w-0 border-l-2 border-[#DDF3F1] pl-4">
              <p className="truncate text-base font-bold text-[#263238]">{patientLabel(item)}</p>
              <p className="mt-1 truncate text-sm text-[#62727B]">{item.specialtyName}</p>
              <div className="mt-2"><StatusBadge tone={appointmentStatusTone(item.status)}>{appointmentStatusLabel[item.status]}</StatusBadge></div>
            </div>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#56777A]/25 px-4 text-sm font-bold text-[#334B54] transition duration-200 hover:border-[#56777A] hover:bg-[#DDF3F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A]" href={`/medico/citas/${item.id}`}>
              {item.canRecordAttention ? "Atender cita" : "Abrir cita"}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
