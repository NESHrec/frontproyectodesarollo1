"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, Input, SelectField, StatusBadge, buttonLinkClasses } from "@/shared/components";
import type { Especialidad, Medico } from "@/shared/types/catalogo-medico";
import { PractitionerPortrait } from "@/modules/catalogo-medico/components/PractitionerPortrait";

type MedicosFilterProps = {
  especialidades: Especialidad[];
  medicos: Medico[];
  /** Especialidad aplicada en la URL; cadena vacía equivale a todas. */
  especialidadId: string;
};

export function MedicosFilter({ especialidades, medicos, especialidadId }: MedicosFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useOptimistic(especialidadId);
  const [busqueda, setBusqueda] = useState("");

  const nombresEspecialidad = useMemo(
    () => new Map(especialidades.map((especialidad) => [especialidad.id, especialidad.name])),
    [especialidades],
  );

  const medicosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLocaleLowerCase("es-GT");
    if (!busquedaNormalizada) return medicos;
    return medicos.filter((medico) => {
      const especialidad = medico.specialtyName ?? nombresEspecialidad.get(medico.specialtyId) ?? "";
      return (
        medico.fullName.toLocaleLowerCase("es-GT").includes(busquedaNormalizada) ||
        especialidad.toLocaleLowerCase("es-GT").includes(busquedaNormalizada)
      );
    });
  }, [busqueda, medicos, nombresEspecialidad]);

  function aplicarEspecialidad(nuevaEspecialidadId: string) {
    const params = new URLSearchParams();
    if (nuevaEspecialidadId) params.set("specialtyId", nuevaEspecialidadId);
    const query = params.toString();
    startTransition(() => {
      setEspecialidadSeleccionada(nuevaEspecialidadId);
      router.push(query ? `/medicos?${query}` : "/medicos", { scroll: false });
    });
  }

  return (
    <div className="space-y-6">
      <Card className="relative grid gap-5 overflow-hidden border-[var(--serena-border)] bg-white/90 shadow-[var(--serena-shadow-soft)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-[var(--serena-teal)] before:to-[#DDF3F1] md:grid-cols-[1.15fr_0.85fr]">
        <Input
          helperText="Busca por nombre o especialidad."
          id="busqueda-medico"
          label="Buscar médico"
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Nombre o especialidad"
          type="search"
          value={busqueda}
        />
        <SelectField
          id="especialidad-medico"
          label="Filtrar por especialidad"
          onChange={(event) => aplicarEspecialidad(event.target.value)}
          value={especialidadSeleccionada}
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map((especialidad) => (
            <option key={especialidad.id} value={especialidad.id}>{especialidad.name}</option>
          ))}
        </SelectField>
      </Card>

      <div className="serena-catalog-heading">
        <div><p className="serena-kicker">Directorio Serena</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--serena-ink)]">Profesionales para conocerte</h2></div>
        <StatusBadge tone="agua">{medicosFiltrados.length} {medicosFiltrados.length === 1 ? "resultado" : "resultados"}</StatusBadge>
      </div>
      {isPending ? <p className="text-sm font-semibold text-[var(--serena-text)]" role="status">Actualizando profesionales...</p> : null}

      <div aria-busy={isPending} className={`transition-opacity duration-200 motion-reduce:transition-none ${isPending ? "opacity-60" : "opacity-100"}`}>
        {medicosFiltrados.length > 0 ? (
          <div className="serena-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medicosFiltrados.map((medico) => {
              const especialidad = medico.specialtyName ?? nombresEspecialidad.get(medico.specialtyId);
              return (
                <Card className="group flex flex-col gap-4 overflow-hidden transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--serena-border-strong)] hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none" key={medico.id}>
                  <PractitionerPortrait practitioner={medico} />
                  <div>
                    {especialidad ? <StatusBadge tone="pistacho">{especialidad}</StatusBadge> : null}
                    <h2 className="mt-4 text-xl font-black leading-tight text-[var(--serena-ink)]">{medico.fullName}</h2>
                    {medico.licenseNumber ? <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--serena-text)]/80"><span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--serena-teal)]" />Colegiado: {medico.licenseNumber}</p> : null}
                  </div>
                  <Link className={`${buttonLinkClasses} mt-auto w-full justify-between`} href={`/medicos/${encodeURIComponent(medico.id)}`}>
                    Conocer perfil y horarios <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            action={especialidadSeleccionada ? <Button onClick={() => aplicarEspecialidad("")} variant="secondary">Ver todos los profesionales</Button> : null}
            description={medicos.length === 0 ? "No hay profesionales registrados para esta especialidad por ahora." : "Ningún profesional coincide con tu búsqueda. Prueba con otro nombre o especialidad."}
            title="No encontramos profesionales"
          />
        )}
      </div>
    </div>
  );
}
