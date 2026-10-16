import Link from "next/link";

import type { MedicalAppointment } from "@/modules/atencion-medica/schemas";
import { appointmentStatusLabel, appointmentStatusTone, formatDateTime, patientLabel } from "@/modules/atencion-medica/format";
import { StatusBadge } from "@/shared/components";

export function AppointmentsTable({ appointments, caption }: { appointments: MedicalAppointment[]; caption: string }) {
  return (
    <section aria-label={caption} className="overflow-hidden rounded-[1.75rem] border border-[var(--serena-border)] bg-white shadow-[0_22px_60px_-46px_rgba(38,50,56,0.65)]">
      <h2 className="sr-only">{caption}</h2>
      <ol className="divide-y divide-[#62727B]/12">
        {appointments.map((item, index) => (
          <li className={`group relative grid gap-4 px-4 py-5 transition-[background-color,box-shadow] duration-200 hover:bg-[#DDF3F1]/30 hover:shadow-[inset_4px_0_0_#56777A] motion-reduce:transition-none sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:px-6 ${index === 0 && item.canRecordAttention ? "bg-[#DDF3F1]/35 shadow-[inset_4px_0_0_#56777A]" : ""}`} key={item.id}>
            <div className="rounded-2xl bg-[#FBFCFA] px-3 py-2.5 group-hover:bg-white">
              <p className="text-sm font-bold text-[#334B54]">{formatDateTime(item.scheduledAt)}</p>
              <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] ${item.arrivalAt ? "text-[#56777A]" : "text-[#62727B]/65"}`}>
                <span aria-hidden className={`size-2 rounded-full ${item.arrivalAt ? "bg-[#56777A]" : "bg-[#F8EDD2] ring-1 ring-[#8D6B2E]/30"}`} />
                {item.arrivalAt ? "Paciente en clínica" : "Llegada pendiente"}
              </p>
            </div>
            <div className="min-w-0 border-l-2 border-[#DDF3F1] pl-4">
              <p className="break-words text-base font-bold text-[#263238]">{patientLabel(item)}</p>
              <p className="mt-1 break-words text-sm text-[#62727B]">{item.specialtyName}</p>
              <div className="mt-2"><StatusBadge tone={appointmentStatusTone(item.status)}>{appointmentStatusLabel[item.status]}</StatusBadge></div>
            </div>
            <Link className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-bold transition-[background-color,border-color,color,transform] duration-200 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] motion-reduce:scale-100 motion-reduce:transition-none ${item.canRecordAttention ? "border-[#334B54] bg-[#334B54] text-white hover:bg-[#263238]" : "border-[#56777A]/25 text-[#334B54] hover:border-[#56777A] hover:bg-[#DDF3F1]"}`} href={`/medico/citas/${item.id}`}>
              {item.canRecordAttention ? "Atender cita" : "Abrir cita"}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
