"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, StatusBadge, buttonLinkClasses } from "@/shared/components";
import type { Especialidad, Medico } from "@/shared/types/catalogo-medico";

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

    if (!busquedaNormalizada) {
      return medicos;
    }

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

    if (nuevaEspecialidadId) {
      params.set("specialtyId", nuevaEspecialidadId);
    }

    const query = params.toString();

    startTransition(() => {
      setEspecialidadSeleccionada(nuevaEspecialidadId);
      router.push(query ? `/medicos?${query}` : "/medicos", { scroll: false });
    });
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#62727B]" htmlFor="busqueda-medico">
            Buscar médico
          </label>
          <input
            className="w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition placeholder:text-[#62727B]/60 focus:border-[#62727B] focus:bg-[#DDF3F1]"
            id="busqueda-medico"
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre o especialidad"
            type="search"
            value={busqueda}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#62727B]" htmlFor="especialidad-medico">
            Filtrar por especialidad
          </label>
          <select
            className="w-full rounded-md border border-[#62727B]/20 bg-[#FBFCFA] px-4 py-3 text-sm text-[#62727B] outline-none transition focus:border-[#62727B] focus:bg-[#DDF3F1]"
            id="especialidad-medico"
            onChange={(event) => aplicarEspecialidad(event.target.value)}
            value={especialidadSeleccionada}
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isPending ? (
        <p className="text-sm font-semibold text-[#62727B]" role="status">
          Actualizando profesionales...
        </p>
      ) : null}

      <div aria-busy={isPending} className={isPending ? "opacity-60 transition-opacity" : undefined}>
        {medicosFiltrados.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {medicosFiltrados.map((medico) => {
              const especialidad =
                medico.specialtyName ?? nombresEspecialidad.get(medico.specialtyId);

              return (
                <Card className="flex flex-col gap-4" key={medico.id}>
                  <div>
                    {especialidad ? (
                      <StatusBadge tone="pistacho">{especialidad}</StatusBadge>
                    ) : null}
                    <h2 className="mt-4 text-xl font-bold text-[#62727B]">{medico.fullName}</h2>
                    {medico.licenseNumber ? (
                      <p className="mt-2 text-sm text-[#62727B]/80">
                        Colegiado: {medico.licenseNumber}
                      </p>
                    ) : null}
                  </div>
                  <Link className={`${buttonLinkClasses} mt-auto`} href={`/medicos/${encodeURIComponent(medico.id)}`}>
                    Ver perfil y horarios
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            action={
              especialidadSeleccionada ? (
                <Button onClick={() => aplicarEspecialidad("")} variant="secondary">
                  Ver todos los profesionales
                </Button>
              ) : null
            }
            description={
              medicos.length === 0
                ? "No hay profesionales registrados para esta especialidad por ahora."
                : "Ningún profesional coincide con tu búsqueda. Prueba con otro nombre o especialidad."
            }
            title="No encontramos profesionales"
          />
        )}
      </div>
    </div>
  );
}
