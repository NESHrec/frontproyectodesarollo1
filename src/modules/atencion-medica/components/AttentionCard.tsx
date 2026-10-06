import type { Attention } from "@/modules/atencion-medica/schemas";
import { formatDateTime } from "@/modules/atencion-medica/format";
import { Card, StatusBadge } from "@/shared/components";
import { AddendumForm } from "@/modules/atencion-medica/components/AddendumForm";

export function AttentionCard({ attention }: { attention: Attention }) {
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">
            Registrada {formatDateTime(attention.recordedAt)}
          </p>
          <h3 className="mt-1 font-bold text-[#62727B]">{attention.reason}</h3>
        </div>
        <StatusBadge tone="pistacho">Documentada</StatusBadge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2"><dt className="font-semibold">Diagnóstico</dt><dd className="whitespace-pre-line">{attention.diagnosis}</dd></div>
        {attention.findings ? <div><dt className="font-semibold">Hallazgos</dt><dd className="whitespace-pre-line">{attention.findings}</dd></div> : null}
        {attention.treatmentPlan ? <div><dt className="font-semibold">Plan</dt><dd className="whitespace-pre-line">{attention.treatmentPlan}</dd></div> : null}
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
