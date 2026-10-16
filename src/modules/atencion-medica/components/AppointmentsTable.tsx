import Link from "next/link";

import type { MedicalAppointment } from "@/modules/atencion-medica/schemas";
import { appointmentStatusLabel, appointmentStatusTone, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { StatusBadge } from "@/shared/components";

export function AppointmentsTable({ appointments, caption }: { appointments: MedicalAppointment[]; caption: string }) {
  return (
    <section aria-label={caption} className="overflow-hidden rounded-[1.5rem] border border-[var(--serena-border)] bg-white shadow-[var(--serena-shadow-soft)]">
      <h2 className="sr-only">{caption}</h2>
      <ol className="divide-y divide-[#62727B]/12">
        {appointments.map((item, index) => (
          <li className={`group relative grid gap-4 px-4 py-5 transition-[background-color] duration-200 hover:bg-[#DDF3F1]/25 motion-reduce:transition-none sm:grid-cols-[10.5rem_1fr_auto] sm:items-center sm:px-6 ${index === 0 && item.canRecordAttention ? "bg-[#DDF3F1]/30 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#56777A]" : ""}`} key={item.id}>
            <div>
              <p className="text-sm font-bold text-[#334B54]">{formatDateTime(item.scheduledAt)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#62727B]/65">{item.arrivalAt ? "Paciente en clínica" : "Llegada pendiente"}</p>
            </div>
            <div className="min-w-0 border-l-2 border-[#DDF3F1] pl-4">
              <p className="break-words text-base font-bold text-[#263238]">{patientLabel(item)}</p>
              <p className="mt-1 break-words text-sm text-[#62727B]">{item.specialtyName}</p>
              <div className="mt-2"><StatusBadge tone={appointmentStatusTone(item.status)}>{appointmentStatusLabel[item.status]}</StatusBadge></div>
            </div>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#56777A]/25 px-4 text-sm font-bold text-[#334B54] transition-[background-color,border-color,transform] duration-200 hover:border-[#56777A] hover:bg-[#DDF3F1] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] motion-reduce:transform-none motion-reduce:transition-none" href={`/medico/citas/${item.id}`}>
              {item.canRecordAttention ? "Atender cita" : "Abrir cita"}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
