"use client";

import { useCallback, useEffect, useState } from "react";
import { SpecialtyForm } from "@/modules/usuarios-accesos/components/SpecialtyForm";
import { ApiErrorState, Card, EmptyState, LoadingState, ModalDialog, StatusBadge } from "@/shared/components";

type Specialty = { id: string; name: string; description: string };

export function AdminSpecialtiesManager() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unauthorized" | "forbidden" | "service">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await fetch("/api/staff/specialties", { cache: "no-store" });
      if (response.status === 401) { setState("unauthorized"); return; }
      if (response.status === 403) { setState("forbidden"); return; }
      if (!response.ok) { setState("service"); return; }
      const body = await response.json() as unknown;
      if (!Array.isArray(body)) { setState("service"); return; }
      setSpecialties(body as Specialty[]);
      setState("ready");
    } catch {
      setState("service");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (state === "loading") return <LoadingState message="Cargando especialidades persistidas…" />;
  if (state === "unauthorized") return <ApiErrorState title="Tu sesión ADMIN expiró" description="Inicia sesión nuevamente para administrar el catálogo." />;
  if (state === "forbidden") return <ApiErrorState title="Acceso restringido" description="Solo una cuenta ADMIN puede administrar especialidades." />;
  if (state === "service") return <ApiErrorState title="No pudimos cargar el catálogo" description="El servicio no está disponible. Inténtalo de nuevo." />;

  return (
    <>
      <div className="flex justify-end">
        <ModalDialog description="La especialidad se guardará en el catálogo persistente." title="Nueva especialidad" triggerLabel="Agregar especialidad">
          <SpecialtyForm onSaved={() => void load()} />
        </ModalDialog>
      </div>
      {specialties.length === 0 ? <EmptyState description="Aún no hay especialidades publicadas." title="Catálogo vacío" /> : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {specialties.map((specialty) => (
            <Card key={specialty.id}>
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide">{specialty.id}</p><h2 className="mt-2 text-lg font-bold">{specialty.name}</h2></div><StatusBadge tone="pistacho">Activa</StatusBadge></div>
              <p className="mt-4 text-sm text-[#62727B]/80">{specialty.description}</p>
              <div className="mt-5"><ModalDialog description="Conserva el identificador y las asociaciones existentes." title="Editar especialidad" triggerLabel="Editar" triggerVariant="secondary"><SpecialtyForm onSaved={() => void load()} specialty={specialty} /></ModalDialog></div>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
