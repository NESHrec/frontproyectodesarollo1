import { getDisponibilidadMedico } from "@/modules/catalogo-medico/api";
import { ordenarBloques, toBloqueHorarioVista } from "@/modules/catalogo-medico/format";
import { SeleccionHorario } from "@/modules/catalogo-medico/components/SeleccionHorario";
import { ApiErrorState } from "@/shared/components";

type HorariosDisponiblesProps = {
  medicoId: string;
  /** "consulta" solo lista los bloques; "seleccion" permite elegir uno visualmente. */
  modo?: "consulta" | "seleccion";
  patientSessionActive?: boolean;
  specialtyId?: string;
  staffSessionActive?: boolean;
};

export async function HorariosDisponibles({
  medicoId,
  modo = "consulta",
  patientSessionActive = false,
  specialtyId = "",
  staffSessionActive = false,
}: HorariosDisponiblesProps) {
  const result = await getDisponibilidadMedico(medicoId);

  if (!result.ok) {
    return (
      <ApiErrorState
        description="No fue posible consultar la disponibilidad de este profesional. Inténtalo de nuevo en unos segundos."
        title="No pudimos cargar los horarios"
      />
    );
  }

  const bloques = ordenarBloques(result.data).map(toBloqueHorarioVista);

  if (bloques.length === 0) {
    return (
      <p className="rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--serena-warning-soft)] px-4 py-3 text-sm font-semibold text-[var(--serena-text)]">
        Este profesional no tiene horarios disponibles por ahora. Vuelve a consultar más tarde.
      </p>
    );
  }

  if (modo === "seleccion") {
    return (
      <SeleccionHorario
        bloques={bloques}
        key={medicoId}
        medicoId={medicoId}
        patientSessionActive={patientSessionActive}
        specialtyId={specialtyId}
        staffSessionActive={staffSessionActive}
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {bloques.map((bloque) => (
        <li className="rounded-[var(--serena-radius-sm)] border border-[var(--serena-border)] bg-[var(--serena-surface-info)] p-4 text-[var(--serena-text)]" key={bloque.id}>
          <p className="text-sm font-semibold">{bloque.fecha}</p>
          <p className="mt-2 text-xl font-bold">
            {bloque.horaInicio} – {bloque.horaFin}
          </p>
        </li>
      ))}
    </ul>
  );
}
