import type { Attention } from "@/modules/atencion-medica/schemas";
import { formatDateTime } from "@/modules/atencion-medica/format";
import { Card, StatusBadge } from "@/shared/components";
import { AddendumForm } from "@/modules/atencion-medica/components/AddendumForm";

export function AttentionCard({ attention }: { attention: Attention }) {
  return (
    <Card className="rounded-[1.5rem] border-[#62727B]/12 bg-white shadow-[0_18px_48px_-40px_rgba(38,50,56,.6)]">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">
            Registrada {formatDateTime(attention.recordedAt)}
          </p>
          <h3 className="mt-1 font-bold text-[#62727B]">{attention.reason}</h3>
        </div>
        <StatusBadge tone="pistacho">Documentada</StatusBadge>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-[#FBFCFA] p-4 sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/70">Diagnóstico</dt><dd className="mt-2 whitespace-pre-line leading-6 text-[#263238]">{attention.diagnosis}</dd></div>
        {attention.findings ? <div className="rounded-xl border border-[#62727B]/10 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/70">Hallazgos</dt><dd className="mt-2 whitespace-pre-line leading-6">{attention.findings}</dd></div> : null}
        {attention.treatmentPlan ? <div className="rounded-xl border border-[#62727B]/10 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]/70">Plan</dt><dd className="mt-2 whitespace-pre-line leading-6">{attention.treatmentPlan}</dd></div> : null}
      </dl>
      <div className="mt-4">
        <h4 className="text-sm font-semibold">Receta</h4>
        {attention.prescription.length === 0
          ? <p className="mt-1 text-sm text-[#62727B]/80">Sin medicamentos indicados.</p>
          : <ul className="mt-2 space-y-2 text-sm">{attention.prescription.map((item) => (
            <li className="rounded-md bg-[#DDF3F1]/60 px-3 py-2" key={item.order}>
              <p className="font-semibold">{item.medicine}</p>
              <p>{item.dose} · {item.frequency} · {item.duration}</p>
              {item.instructions ? <p className="text-xs">{item.instructions}</p> : null}
            </li>
          ))}</ul>}
      </div>
      <p className="mt-4 text-xs font-semibold">
        Profesional: {attention.practitionerName ?? attention.practitionerId} · Registró: {attention.authorName ?? attention.authorAccountId}
      </p>
      <section className="mt-4 border-t border-[#62727B]/15 pt-4" aria-label="Adendas de la atención">
        <h4 className="text-sm font-semibold">Adendas</h4>
        {attention.addenda.length===0?<p className="mt-1 text-sm text-[#62727B]/75">Sin adendas.</p>:<ol className="mt-2 space-y-2">{attention.addenda.map(item=><li className="rounded-md bg-[#F8EDD2]/60 p-3 text-sm" key={item.id}><p className="whitespace-pre-line">{item.text}</p><p className="mt-1 text-xs"><strong>Motivo:</strong> {item.reason} · {formatDateTime(item.recordedAt)} · {item.authorName??item.authorAccountId}</p></li>)}</ol>}
        <AddendumForm appointmentId={attention.appointmentId} attentionId={attention.id}/>
      </section>
    </Card>
  );
}
