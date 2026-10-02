import { getEspecialidades } from "@/modules/catalogo-medico/api";
import { ApiErrorState, EmptyState, MetricCard } from "@/shared/components";

export async function AdminCatalogSummary() {
  const specialties = await getEspecialidades();
  if (!specialties.ok) {
    return <ApiErrorState description="No se pudo consultar el catálogo de especialidades. Intenta nuevamente cuando el servicio esté disponible." title="Catálogo no disponible" />;
  }
  if (specialties.data.length === 0) {
    return <EmptyState description="El catálogo respondió correctamente y no contiene especialidades publicadas." title="Catálogo vacío" />;
  }
  return <section aria-label="Indicadores de catálogo" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricCard detail="Lista pública completa de GET /especialidades, sin paginación." label="Especialidades publicadas" tone="crema" value={String(specialties.data.length)} />
  </section>;
}
