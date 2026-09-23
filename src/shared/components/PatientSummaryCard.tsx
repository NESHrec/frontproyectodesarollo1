import Link from "next/link";
import { Card, StatusBadge } from "@/shared/components";

type PatientSummaryCardProps = {
  id: string;
  name: string;
  age: string;
  bloodType: string;
  allergies: string;
  lastVisit: string;
  showClinicalLink?: boolean;
};

export function PatientSummaryCard({
  id,
  name,
  age,
  bloodType,
  allergies,
  lastVisit,
  showClinicalLink = true,
}: PatientSummaryCardProps) {
  return (
    <Card className="border-l-4 border-l-[#DDF3F1]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#62727B]/65">Paciente ficticio</p>
          <h2 className="mt-1 text-xl font-bold text-[#62727B]">{name}</h2>
          <p className="mt-1 text-sm text-[#62727B]/75">Código {id} · {age}</p>
        </div>
        <StatusBadge tone="pistacho">Activo</StatusBadge>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="font-semibold">Grupo sanguíneo</dt><dd>{bloodType}</dd></div>
        <div><dt className="font-semibold">Alergias</dt><dd>{allergies}</dd></div>
        <div><dt className="font-semibold">Última visita</dt><dd>{lastVisit}</dd></div>
      </dl>
      {showClinicalLink ? (
        <Link className="mt-5 inline-flex text-sm font-bold text-[#62727B] underline-offset-4 hover:underline" href={`/medico/pacientes/${id}/expediente`}>
          Ver expediente visual
        </Link>
      ) : null}
    </Card>
  );
}
