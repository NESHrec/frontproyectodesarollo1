import { teeth, type ToothState } from "@/modules/odontologia/data";
import { cn } from "@/shared/lib/cn";

const stateClasses: Record<ToothState, string> = { Sano: "bg-[#E5F1D8]", Observación: "bg-[#F8EDD2]", Tratamiento: "bg-[#F8E2E8]", Ausente: "bg-[#62727B]/20" };

export function Odontogram() {
  return (
    <section aria-labelledby="odontogram-title" className="rounded-xl border border-[#62727B]/15 bg-white p-5">
      <h2 className="text-lg font-bold text-[#62727B]" id="odontogram-title">Odontograma visual básico</h2>
      <p className="mt-2 text-sm text-[#62727B]/75">Representación ficticia sin edición ni persistencia clínica.</p>
      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {teeth.map((tooth) => <div aria-label={`Pieza ${tooth.number}: ${tooth.state}`} className={cn("grid aspect-square place-items-center rounded-t-full rounded-b-lg border border-[#62727B]/20 text-sm font-bold", stateClasses[tooth.state])} key={tooth.number}><span>{tooth.number}</span><span className="sr-only">{tooth.state}</span></div>)}
      </div>
      <ul className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-[#62727B]">
        {(Object.keys(stateClasses) as ToothState[]).map((state) => <li className="flex items-center gap-2" key={state}><span className={cn("size-4 rounded border border-[#62727B]/20", stateClasses[state])} />{state}</li>)}
      </ul>
    </section>
  );
}
