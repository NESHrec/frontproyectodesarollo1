"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, EmptyState, StatusBadge, buttonLinkClasses } from "@/shared/components";
import type { Especialidad, Medico } from "@/shared/types/catalogo-medico";

type MedicosFilterProps = {
  especialidades: Especialidad[];
  medicos: Medico[];
};

export function MedicosFilter({ especialidades, medicos }: MedicosFilterProps) {
  const [especialidadId, setEspecialidadId] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const medicosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLocaleLowerCase("es-GT");

    return medicos.filter((medico) => {
      const coincideEspecialidad =
        especialidadId === "todas" || medico.especialidadId === especialidadId;
      const coincideBusqueda =
        !busquedaNormalizada ||
        medico.nombre.toLocaleLowerCase("es-GT").includes(busquedaNormalizada) ||
        medico.especialidad.toLocaleLowerCase("es-GT").includes(busquedaNormalizada);

      return coincideEspecialidad && coincideBusqueda;
    });
  }, [busqueda, especialidadId, medicos]);

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
            onChange={(event) => setEspecialidadId(event.target.value)}
            value={especialidadId}
          >
            <option value="todas">Todas las especialidades</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {medicosFiltrados.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {medicosFiltrados.map((medico) => (
            <Card className="flex flex-col gap-4" key={medico.id}>
              <div>
                <StatusBadge tone="pistacho">{medico.especialidad}</StatusBadge>
                <h2 className="mt-4 text-xl font-bold text-[#62727B]">{medico.nombre}</h2>
                <p className="mt-2 text-sm leading-6 text-[#62727B]/80">{medico.enfoque}</p>
              </div>
              <div className="mt-auto space-y-2 text-sm text-[#62727B]">
                <p>{medico.experiencia}</p>
                <p>{medico.disponibilidad}</p>
              </div>
              <Link className={buttonLinkClasses} href={`/medicos/${medico.id}`}>
                Ver perfil
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Prueba con otra búsqueda o revisa una categoría de especialidad distinta."
          title="No hay médicos para este filtro"
        />
      )}
    </div>
  );
}
