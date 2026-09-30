import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, InternalPageHeader, buttonLinkClasses } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

/** La receta se guarda junto con la atención de la cita para conservar autor, fecha y paciente. */
export default async function NewPrescriptionPage({ searchParams }: { searchParams: PageSearchParams }) {
  const citaId = firstSearchParam((await searchParams).cita);
  if (citaId && /^[A-Za-z0-9-]{1,36}$/.test(citaId)) redirect(`/medico/consultas/nueva?cita=${encodeURIComponent(citaId)}`);
  return (
    <div className="space-y-7">
      <InternalPageHeader description="Las recetas se registran dentro de la atención de una cita y quedan en el expediente del paciente." eyebrow="Atención clínica" title="Recetas digitales" />
      <Card className="max-w-3xl">
        <h2 className="text-lg font-bold">¿Cómo emitir una receta?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li>Abre una cita de tu agenda.</li>
          <li>Elige “Registrar atención” y documenta motivo y diagnóstico.</li>
          <li>Agrega los medicamentos en la sección Receta y confirma el guardado.</li>
        </ol>
        <p className="mt-3 text-sm text-[#62727B]/80">Las recetas guardadas se consultan en el historial del expediente y no pueden modificarse.</p>
        <Link className={`${buttonLinkClasses} mt-5`} href="/medico/agenda">Ir a mi agenda</Link>
      </Card>
    </div>
  );
}
